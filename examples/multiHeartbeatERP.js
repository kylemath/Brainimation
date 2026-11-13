/**
 * @id multiHeartbeatERP
 * @title Heartbeat-Evoked Potential (HEP): PPG R-Peak Locked EEG
 * @category Multimodal (EEG + PPG + HR)
 * @order 3
 */
// Technical Multimodal Interoception Visualizer: Heartbeat-Evoked Potential (HEP)
// Locks t = 0 to the systolic peak of the same pulsatile AC the SpO2 estimator uses:
// smoothed 8 mm 850 nm intensity (fast low-pass minus a ~0.65 Hz baseline), divided by DC,
// then IMU-cleaned. The crest is the maximum inside a window predicted from the recent
// pulse period, and that peak time is what the EEG epoch is aligned to.
//
// Controls (Top Bar Buttons or Keyboard Shortcuts):
//   - [↺ Restart Avg]  (or 'R'): Reset trial count and restart ensemble ERP averaging
//   - [↕ Rescale Y]    (or 'V'): Cycle vertical axis scale (Auto-Fit, ±5, ±10, ±20, ±40, ±80 µV)
//   - [TP9/TP10: ON]   (or 'T'): Show/hide temporal ear channels (TP9 & TP10) to isolate frontal AF7/AF8
//   - [Line Filter: ON](or 'F'): Toggle 50/60 Hz Notch + 30 Hz ERP filter before baseline correction

const FS_EEG = 256;
const EPOCH_SAMPLES = 154;  // 600 ms @ 256 Hz (-100 ms to +500 ms around PPG peak)
const PRE_SAMPLES = 26;     // 100 ms pre-heartbeat baseline window (-100 ms to 0 ms)
const POST_SAMPLES = EPOCH_SAMPLES - PRE_SAMPLES; // 128 samples (+500 ms post-heartbeat)
const WARMUP_SAMPLES = 64;  // 250 ms filter warmup prefix to eliminate IIR edge transients

let avgHEP = [[], [], [], []];
let trialCount = 0;
let lastPeakMs = 0;
let pendingPeakMs = null;
let ppgTrail = [];
let hpBase = 0;
let hpInit = false;
let peakAmp = 0;
let recentAmp = 0;
let ibis = [];
let peakSearch = null;
let lastCardiacSample = null;
let lastHistLen = 0;
let pulseSource = 'pulse';
let optPulse = {
  init: false,
  lp: 0,
  base: 0,
  nlms: [0, 0, 0, 0, 0, 0],
  len: 0,
  last: null,
  tail: []
};

// Interactive UI state
let showTP9TP10 = true;
let lineFilterEnabled = true;
const Y_SCALE_MODES = [
  { label: 'Auto-Fit', uV: null },
  { label: '±5 µV',    uV: 5 },
  { label: '±10 µV',   uV: 10 },
  { label: '±20 µV',   uV: 20 },
  { label: '±40 µV',   uV: 40 },
  { label: '±80 µV',   uV: 80 }
];
let yScaleIdx = 0; // Default to Auto-Fit
let currentYMax = 12;
let uiButtons = [];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  resetHEP();
}

function resetHEP() {
  trialCount = 0;
  pendingPeakMs = null;
  lastPeakMs = 0;
  hpBase = 0;
  hpInit = false;
  peakAmp = 0;
  recentAmp = 0;
  ibis = [];
  peakSearch = null;
  lastCardiacSample = null;
  lastHistLen = 0;
  pulseSource = 'pulse';
  optPulse = { init: false, lp: 0, base: 0, nlms: [0, 0, 0, 0, 0, 0], len: 0, last: null, tail: [] };
  ppgTrail = [];
  for (let ch = 0; ch < 4; ch++) {
    avgHEP[ch] = new Array(EPOCH_SAMPLES).fill(0);
  }
}

function medianIbi() {
  if (ibis.length) {
    const s = ibis.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  }
  const bpm = (typeof eegData !== 'undefined' && eegData.heartRate > 0) ? eegData.heartRate : 72;
  return constrain(60000 / bpm, 380, 1400);
}

function peakHalfWindow() {
  return constrain(medianIbi() * 0.28, 110, 230);
}

function markPeakOnTrail(peakMs) {
  let bestI = -1;
  let bestDt = 1e9;
  for (let i = ppgTrail.length - 1; i >= 0; i--) {
    const dt = Math.abs(ppgTrail[i].t - peakMs);
    if (dt < bestDt) { bestDt = dt; bestI = i; }
    if (ppgTrail[i].t < peakMs - 140) break;
  }
  if (bestI >= 0) ppgTrail[bestI].isPeak = true;
}

function acceptPeak(peakMs, amp, lockEeg) {
  if (lastPeakMs && peakMs - lastPeakMs < 320) return;
  if (lastPeakMs) {
    const ibi = peakMs - lastPeakMs;
    const hr = (typeof eegData !== 'undefined' && eegData.heartRate > 0) ? eegData.heartRate : 0;
    const hrIbi = hr > 0 ? 60000 / hr : 0;
    const matchesRate = !hrIbi || (ibi > hrIbi * 0.78 && ibi < hrIbi * 1.28);
    if (ibi >= 330 && ibi <= 1700 && matchesRate) {
      ibis.push(ibi);
      if (ibis.length > 8) ibis.shift();
    }
  }
  lastPeakMs = peakMs;
  peakAmp = peakAmp <= 0 ? amp : peakAmp * 0.75 + amp * 0.25;
  markPeakOnTrail(peakMs);
  // Only time-lock EEG when the crest was confirmed within a few samples.
  // The first beat waits through the dicrotic notch before committing, so it is a timing seed, not an epoch.
  if (lockEeg && pendingPeakMs === null) pendingPeakMs = peakMs;
}

function ensurePeakSearch(tMs) {
  if (peakSearch) return;
  const half = peakHalfWindow();
  if (!lastPeakMs) {
    peakSearch = { start: tMs - 400, end: Infinity, bestV: -Infinity, bestMs: tMs, learning: true };
    return;
  }
  if (tMs >= lastPeakMs + medianIbi() - half) {
    const center = lastPeakMs + medianIbi();
    peakSearch = { start: center - half, end: center + half, bestV: -Infinity, bestMs: center, learning: false };
  }
}

// High-passed sample. The crest kept is the maximum inside the predicted beat window,
// confirmed once the wave has fallen off that maximum — so the lock is the peak, not the downslope.
function considerPulsatileSample(hp, tMs) {
  ensurePeakSearch(tMs);
  if (!peakSearch || tMs < peakSearch.start) return;
  if (peakSearch.trough === undefined || hp < peakSearch.trough) peakSearch.trough = hp;

  const rise = hp - peakSearch.trough;
  const need = Math.max(recentAmp * 0.42, peakAmp * 0.32, 1e-8);
  if (rise >= need && hp >= (peakSearch.armed ? peakSearch.bestV : -Infinity)) {
    peakSearch.bestV = hp;
    peakSearch.bestMs = tMs;
    peakSearch.armed = true;
    peakSearch.hold = false;
  }

  const swing = peakSearch.armed ? Math.max(peakSearch.bestV - peakSearch.trough, recentAmp) : 0;
  const drop = Math.max(recentAmp * 0.28, peakAmp * 0.16);
  const fallen = peakSearch.armed && tMs >= peakSearch.bestMs + 24 && hp <= peakSearch.bestV - drop;
  // First beat: keep the window open long enough that a dicrotic bump cannot win over the taller systolic crest.
  const holdUntil = peakSearch.bestMs + medianIbi() * (peakSearch.learning ? 0.82 : 0);
  const confirmNow = fallen && tMs >= holdUntil && tMs <= peakSearch.end + 50;
  if (confirmNow) {
    acceptPeak(peakSearch.bestMs, swing, tMs - peakSearch.bestMs < 140);
    peakSearch = null;
    return;
  }
  if (fallen && tMs < holdUntil) peakSearch.hold = true;

  if (!peakSearch.learning && tMs > peakSearch.end) {
    if (peakSearch.armed && peakSearch.bestMs >= peakSearch.start && peakSearch.bestMs <= peakSearch.end) {
      acceptPeak(peakSearch.bestMs, swing, tMs - peakSearch.bestMs < 140);
    } else if (lastPeakMs) {
      lastPeakMs = tMs - medianIbi() + peakHalfWindow();
    }
    peakSearch = null;
  }
}

function ingestPulsatile(sample, tMs) {
  if (!hpInit) { hpBase = sample; hpInit = true; }
  hpBase += 0.04 * (sample - hpBase);
  const hp = sample - hpBase;
  recentAmp = Math.max(recentAmp * 0.992, Math.abs(hp));
  ppgTrail.push({ hp: hp, t: tMs, isPeak: false });
  if (ppgTrail.length > 220) ppgTrail.shift();
  considerPulsatileSample(hp, tMs);
}

// Same cardiac band-pass as the fused SpO2 estimator: smoothed intensity minus the slow
// baseline, as a fraction of DC, then a 6-tap IMU NLMS. Positive peaks are systolic.
function opticalPulsatileAc(raw, amb, imuVec) {
  const dark = Math.max(100, raw - Math.max(0, amb) * 0.15);
  if (!optPulse.init) {
    optPulse.lp = dark;
    optPulse.base = dark;
    optPulse.init = true;
  }
  if (Math.abs(dark - optPulse.base) / Math.max(1, optPulse.base) > 0.05) {
    optPulse.lp = dark;
    optPulse.base = dark;
  }
  optPulse.lp = optPulse.lp + 0.28 * (dark - optPulse.lp);
  optPulse.base = optPulse.base + 0.075 * (optPulse.lp - optPulse.base);
  const dc = Math.max(100, optPulse.base);
  const rawAc = -(optPulse.lp - dc) / dc;
  let norm = 1e-4;
  let motion = 0;
  for (let k = 0; k < 6; k++) {
    norm += imuVec[k] * imuVec[k];
    motion += optPulse.nlms[k] * imuVec[k];
  }
  const clean = rawAc - motion;
  const mu = 0.025;
  for (let k = 0; k < 6; k++) {
    optPulse.nlms[k] = constrain(0.9985 * optPulse.nlms[k] + (mu * clean * imuVec[k]) / norm, -0.05, 0.05);
  }
  return clean;
}

function currentImuVec() {
  const la = (typeof eegData !== 'undefined' && eegData.linearAccel) || {};
  const g = (typeof eegData !== 'undefined' && eegData.gyro) || {};
  return [
    (la.x || 0) * 0.25, (la.y || 0) * 0.25, (la.z || 0) * 0.25,
    (g.x || 0) / 80, (g.y || 0) / 80, (g.z || 0) / 80
  ];
}

function newOpticalSamples(arr) {
  if (!arr || !arr.length) return [];
  const n = arr.length;
  if (!optPulse.tail) optPulse.tail = [];
  if (!optPulse.len || n < optPulse.len) {
    optPulse.len = n;
    optPulse.last = arr[n - 1];
    optPulse.tail = arr.slice(-8);
    return [arr[n - 1]];
  }
  if (n > optPulse.len) {
    const fresh = arr.slice(optPulse.len);
    optPulse.len = n;
    optPulse.last = arr[n - 1];
    optPulse.tail = arr.slice(-8);
    return fresh;
  }
  // The history is capped, so several new samples can land between frames.
  // Find the previous last value and take everything after it.
  const prev = optPulse.tail;
  let shift = 0;
  if (prev.length) {
    const anchor = prev[prev.length - 1];
    const from = Math.max(0, n - 9);
    for (let i = n - 1; i >= from; i--) {
      if (arr[i] === anchor) { shift = n - 1 - i; break; }
    }
  }
  const fresh = shift > 0 ? arr.slice(n - shift) : (arr[n - 1] !== optPulse.last ? [arr[n - 1]] : []);
  optPulse.len = n;
  optPulse.last = arr[n - 1];
  optPulse.tail = arr.slice(-8);
  return fresh;
}

function ingestBandpassed(ac, tMs) {
  recentAmp = Math.max(recentAmp * 0.992, Math.abs(ac));
  ppgTrail.push({ hp: ac, t: tMs, isPeak: false });
  if (ppgTrail.length > 220) ppgTrail.shift();
  considerPulsatileSample(ac, tMs);
}

function stampFresh(samples, nowMs, consume) {
  const step = samples.length > 1 ? 1000 / 64 : 0;
  for (let i = 0; i < samples.length; i++) {
    consume(samples[i], nowMs - (samples.length - 1 - i) * step);
  }
}

// Prefer the estimator's 8 mm 850 nm pulsatile AC. Fall back to the 20 mm channel, then classic IR.
function pullOpticalPulsatile(nowMs) {
  if (typeof eegData === 'undefined') return false;
  const shortH = eegData.ppgShortHistory;
  const longH = eegData.ppgLongHistory;
  const classic = eegData.ppgHistory;
  let ir = null;
  let amb = null;
  if (shortH && shortH.ir850 && shortH.ir850.length >= 8) {
    ir = shortH.ir850;
    amb = shortH.ambient;
    pulseSource = '8mm 850nm';
  } else if (longH && longH.ir850 && longH.ir850.length >= 8) {
    ir = longH.ir850;
    amb = longH.ambient;
    pulseSource = '20mm 850nm';
  } else if (classic && classic.infrared && classic.infrared.length >= 8) {
    ir = classic.infrared;
    amb = classic.ambient;
    pulseSource = 'IR';
  } else {
    return false;
  }
  const fresh = newOpticalSamples(ir);
  if (!fresh.length) return true;
  const imu = currentImuVec();
  const ambArr = amb || [];
  const start = Math.max(0, ir.length - fresh.length);
  const step = fresh.length > 1 ? 1000 / 64 : 0;
  for (let i = 0; i < fresh.length; i++) {
    const ambVal = ambArr.length ? ambArr[Math.min(ambArr.length - 1, start + i)] : 0;
    ingestBandpassed(opticalPulsatileAc(fresh[i], ambVal, imu), nowMs - (fresh.length - 1 - i) * step);
  }
  return true;
}

function pullPulsatileSamples(nowMs) {
  if (pullOpticalPulsatile(nowMs)) return;
  const hist = (typeof eegData !== 'undefined' && eegData.fnirsRegressionHistory)
    ? eegData.fnirsRegressionHistory.cardiacWave
    : null;
  if (hist && hist.length >= 8) {
    pulseSource = 'ΔOD cardiac';
    const n = hist.length;
    let fresh = [];
    if (!lastHistLen || n < lastHistLen) fresh = [hist[n - 1]];
    else if (n > lastHistLen) fresh = hist.slice(Math.max(0, lastHistLen));
    else if (hist[n - 1] !== lastCardiacSample) fresh = [hist[n - 1]];
    lastHistLen = n;
    lastCardiacSample = hist[n - 1];
    stampFresh(fresh, nowMs, ingestBandpassed);
    return;
  }
  const reg = (typeof eegData !== 'undefined') ? eegData.fnirsRegression : null;
  if (reg && typeof reg.cardiacWave === 'number' && isFinite(reg.cardiacWave)) {
    pulseSource = 'ΔOD cardiac';
    ingestBandpassed(reg.cardiacWave, nowMs);
    return;
  }
  if (typeof eegData !== 'undefined' && eegData.connected && (eegData.ppgPulse || 0) > 0.05) {
    pulseSource = 'pulse';
    ingestBandpassed(eegData.ppgPulse - 0.5, nowMs);
    return;
  }
  if (typeof eegData !== 'undefined' && eegData.connected) return;
  pulseSource = 'demo';
  const phase = ((nowMs * 0.001) * 1.2) % 1;
  const synth = Math.exp(-Math.pow((phase - 0.16) / 0.055, 2)) - 0.2;
  ingestBandpassed(synth, nowMs);
}

/**
 * Apply a 2nd-order IIR biquad notch filter at frequency f0 (Hz) with quality factor Q.
 */
function applyBiquadNotch(arr, fs, f0, Q) {
  const w0 = (2 * Math.PI * f0) / fs;
  const cosW0 = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Q);
  const a0 = 1 + alpha;
  const b0 = 1 / a0;
  const b1 = (-2 * cosW0) / a0;
  const b2 = 1 / a0;
  const a1 = (-2 * cosW0) / a0;
  const a2 = (1 - alpha) / a0;

  const out = new Array(arr.length);
  let x1 = arr[0] || 0, x2 = x1;
  let y1 = x1, y2 = x1;
  for (let i = 0; i < arr.length; i++) {
    const x0 = arr[i] || 0;
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }
  return out;
}

/**
 * Apply a 2nd-order Butterworth low-pass filter at cutoff fc (Hz) to remove high-freq EMG/line harmonics.
 */
function applyBiquadLowpass(arr, fs, fc) {
  const w0 = (2 * Math.PI * fc) / fs;
  const cosW0 = Math.cos(w0);
  const alpha = Math.sin(w0) / Math.SQRT2;
  const a0 = 1 + alpha;
  const b1 = (1 - cosW0) / a0;
  const b0 = b1 * 0.5;
  const b2 = b0;
  const a1 = (-2 * cosW0) / a0;
  const a2 = (1 - alpha) / a0;

  const out = new Array(arr.length);
  let x1 = arr[0] || 0, x2 = x1;
  let y1 = x1, y2 = x1;
  for (let i = 0; i < arr.length; i++) {
    const x0 = arr[i] || 0;
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }
  return out;
}

/**
 * Pipeline:
 *   1. Remove gross DC offset on the padded [warmup + epoch] buffer
 *   2. 60 Hz & 50 Hz Line-Noise Notch Filters + 30 Hz ERP Low-Pass Filter (if enabled)
 *   3. Slice the [-100 ms, +500 ms] epoch (discarding warmup prefix)
 *   4. Subtract the [-100 ms, 0 ms] pre-stimulus baseline mean AFTER line-noise filtering
 */
function filterAndBaselineEpoch(paddedSamples, warmupCount) {
  const N = paddedSamples.length;
  if (N === 0) return new Array(EPOCH_SAMPLES).fill(0);

  // 1. Center gross DC so biquad filters have zero startup transient
  let dcMean = 0;
  for (let i = 0; i < N; i++) dcMean += (paddedSamples[i] || 0);
  dcMean /= N;
  let sig = new Array(N);
  for (let i = 0; i < N; i++) sig[i] = (paddedSamples[i] || 0) - dcMean;

  // 2. Apply 60 Hz & 50 Hz power-line notch filters + 30 Hz ERP low-pass filter
  if (lineFilterEnabled) {
    sig = applyBiquadNotch(sig, FS_EEG, 60.0, 6.0);
    sig = applyBiquadNotch(sig, FS_EEG, 50.0, 6.0);
    sig = applyBiquadLowpass(sig, FS_EEG, 30.0);
  }

  // 3. Extract the 154-sample [-100 ms, +500 ms] epoch after the warmup prefix
  const epoch = sig.slice(warmupCount, warmupCount + EPOCH_SAMPLES);
  while (epoch.length < EPOCH_SAMPLES) epoch.push(0);

  // 4. Baseline Correction Filter: subtract [-100 ms, 0 ms] mean AFTER line-noise filtering
  let baseMean = 0;
  for (let b = 0; b < PRE_SAMPLES; b++) {
    baseMean += epoch[b];
  }
  baseMean /= PRE_SAMPLES;

  for (let i = 0; i < EPOCH_SAMPLES; i++) {
    epoch[i] -= baseMean;
  }
  return epoch;
}

function captureLockedHEPEpoch() {
  trialCount++;
  const chNames = ['TP9', 'AF7', 'AF8', 'TP10'];
  const hasRealEEG = Boolean(
    eegData.connected &&
    eegData.rawHistory &&
    Array.isArray(eegData.rawHistory.AF7) &&
    eegData.rawHistory.AF7.length >= 16
  );

  const totalFetch = WARMUP_SAMPLES + EPOCH_SAMPLES;
  for (let c = 0; c < 4; c++) {
    const chKey = chNames[c];
    const rawPadded = (hasRealEEG && typeof eegData.getCleanChannel === 'function')
      ? eegData.getCleanChannel(chKey, totalFetch)
      : eegData.getRawChannel(chKey, totalFetch);

    const warmupLen = Math.max(0, rawPadded.length - EPOCH_SAMPLES);
    const cleanEpoch = filterAndBaselineEpoch(rawPadded, warmupLen);

    for (let i = 0; i < EPOCH_SAMPLES; i++) {
      let sampleVal = cleanEpoch[i];
      if (!hasRealEEG) {
        // Demo preview when disconnected: synthetic HEP cortical dipole around +250..380 ms post-heartbeat
        const ms = map(i, 0, EPOCH_SAMPLES - 1, -100, 500);
        const hepWave = (c === 1 || c === 2 ? 1.0 : -0.6) *
          8.5 * Math.exp(-Math.pow((ms - 280) / 65, 2));
        sampleVal = sampleVal * 0.25 + hepWave;
      }
      avgHEP[c][i] = ((avgHEP[c][i] * (trialCount - 1)) + sampleVal) / trialCount;
    }
  }
}

function cycleYScale() {
  yScaleIdx = (yScaleIdx + 1) % Y_SCALE_MODES.length;
}

function computeTargetYMax() {
  const mode = Y_SCALE_MODES[yScaleIdx];
  if (mode.uV !== null) return mode.uV;
  // Auto-Fit across currently visible channels
  let peak = 2.5;
  for (let c = 0; c < 4; c++) {
    if (!showTP9TP10 && (c === 0 || c === 3)) continue;
    for (let i = 0; i < EPOCH_SAMPLES; i++) {
      const a = Math.abs(avgHEP[c][i] || 0);
      if (a > peak) peak = a;
    }
  }
  return Math.max(3.0, Math.min(120.0, peak * 1.25));
}

function draw() {
  background(225, 38, 8);

  const nowMs = millis();
  pullPulsatileSamples(nowMs);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : Math.round(60000 / medianIbi());

  // Capture the EEG epoch once +500 ms after the true systolic peak has arrived
  if (pendingPeakMs !== null && nowMs - pendingPeakMs >= 500) {
    pendingPeakMs = null;
    captureLockedHEPEpoch();
  }

  // Smooth vertical axis scale
  const targetYMax = computeTargetYMax();
  currentYMax = lerp(currentYMax, targetYMax, 0.25);

  // =========================================================================
  // 1. TOP HEADER & INTERACTIVE CONTROL BUTTONS
  // =========================================================================
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(13.5);
  textStyle(BOLD);
  text('🫀⚡ Heartbeat-Evoked Potential (HEP): PPG Peak-Locked ERP', 16, 10);
  textStyle(NORMAL);
  fill(210, 20, 74);
  textSize(9.5);
  const filterStatus = lineFilterEnabled ? '50/60Hz Notch + 30Hz LP → [-100..0ms] Baseline' : '[-100..0ms] Baseline Only';
  text(`HR: ${bpm} BPM  |  Pipeline: ${filterStatus}`, 16, 29);

  // Top-right interactive buttons + Trials Counter Badge
  uiButtons = [];
  const btnH = 24;
  const btnY = 12;
  let bx = width - 16;
  textSize(9.5);

  const drawBtn = (id, label, hue, sat, bri, isActive = true) => {
    const bw = textWidth(label) + 14;
    bx -= bw;
    const hovered = mouseX >= bx && mouseX <= bx + bw && mouseY >= btnY && mouseY <= btnY + btnH;
    fill(hue, sat, hovered ? Math.min(100, bri + 10) : bri, isActive ? 0.92 : 0.45);
    stroke(hue, Math.max(20, sat - 15), 95, isActive ? 0.9 : 0.4);
    strokeWeight(1.2);
    rect(bx, btnY, bw, btnH, 5);
    noStroke();
    fill(0, 0, isActive ? 100 : 78);
    textAlign(CENTER, CENTER);
    text(label, bx + bw / 2, btnY + btnH / 2);
    uiButtons.push({ id, x: bx, y: btnY, w: bw, h: btnH });
    bx -= 6;
  };

  // 1) Restart Averaging button
  drawBtn('reset', '↺ Restart Avg [R]', 352, 78, 72, true);

  // 2) Rescale Vertical Axis button
  const scaleMode = Y_SCALE_MODES[yScaleIdx];
  const scaleLbl = scaleMode.uV === null
    ? `↕ Y-Scale: Auto (±${currentYMax.toFixed(1)}µV) [V]`
    : `↕ Y-Scale: ${scaleMode.label} [V]`;
  drawBtn('yscale', scaleLbl, 195, 75, 58, true);

  // 3) Toggle TP9 / TP10 Channels button
  drawBtn(
    'tp9tp10',
    showTP9TP10 ? '👂 TP9/TP10: ON [T]' : '👂 TP9/TP10: OFF [T]',
    showTP9TP10 ? 280 : 220,
    showTP9TP10 ? 68 : 25,
    showTP9TP10 ? 65 : 32,
    showTP9TP10
  );

  // 4) Toggle 50/60 Hz Line Noise Filter button
  drawBtn(
    'linefilter',
    lineFilterEnabled ? '⚡ 50/60Hz Notch: ON [F]' : '⚡ 50/60Hz Notch: OFF [F]',
    lineFilterEnabled ? 145 : 35,
    lineFilterEnabled ? 72 : 70,
    lineFilterEnabled ? 54 : 52,
    lineFilterEnabled
  );

  // Prominent Trials Measured Badge
  const trialsText = `TRIALS: N = ${trialCount}`;
  const tw = textWidth(trialsText) + 16;
  bx -= tw;
  fill(48, 88, 32, 0.95);
  stroke(48, 90, 95);
  strokeWeight(1.3);
  rect(bx, btnY, tw, btnH, 5);
  noStroke();
  fill(48, 85, 100);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(trialsText, bx + tw / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  // =========================================================================
  // 2. MAIN HEP ERP PLOT AREA
  // =========================================================================
  const pTop = 50;
  const pBot = height - 86;
  const pH = pBot - pTop;
  const pMid = pTop + pH / 2;
  const pL = 68;
  const pR = width - 24;

  fill(225, 32, 12, 0.95);
  stroke(265, 50, 45);
  strokeWeight(1);
  rect(16, pTop, width - 32, pH, 6);

  // Horizontal µV Gridlines & Vertical Axis Scale Labels
  const plotHalfH = pH * 0.42;
  const uVTicks = [-1.0, -0.5, 0, 0.5, 1.0];
  textSize(9);
  for (const frac of uVTicks) {
    const uV = frac * currentYMax;
    const gy = pMid - frac * plotHalfH;
    stroke(220, 20, frac === 0 ? 34 : 20);
    strokeWeight(frac === 0 ? 1.3 : 0.8);
    line(pL, gy, pR, gy);

    noStroke();
    fill(210, 18, frac === 0 ? 92 : 68);
    textAlign(RIGHT, CENTER);
    const lbl = uV === 0 ? '0 µV' : `${uV > 0 ? '+' : ''}${currentYMax < 10 ? uV.toFixed(1) : Math.round(uV)} µV`;
    text(lbl, pL - 6, gy);
  }

  // Vertical Time Gridlines (-100 ms to +500 ms)
  textAlign(CENTER, TOP);
  for (let ms = -100; ms <= 500; ms += 100) {
    const gx = map(ms, -100, 500, pL, pR);
    stroke(220, 20, ms === 0 ? 40 : 18);
    strokeWeight(1);
    line(gx, pTop + 10, gx, pBot - 18);
    noStroke();
    fill(210, 18, 68);
    text(`${ms >= 0 ? '+' : ''}${ms}ms`, gx, pBot - 15);
  }

  // Pre-stimulus Baseline Window shading (-100 ms to 0 ms)
  const zeroX = map(0, -100, 500, pL, pR);
  fill(145, 60, 80, 0.06);
  noStroke();
  rect(pL, pTop + 10, zeroX - pL, pH - 28);
  fill(145, 55, 85);
  textAlign(CENTER, TOP);
  textSize(8.5);
  text('Baseline (-100..0ms)', (pL + zeroX) / 2, pTop + 12);

  // t = 0 ms (Systolic PPG Peak) trigger line
  stroke(352, 85, 95, 0.82);
  strokeWeight(1.6);
  line(zeroX, pTop + 10, zeroX, pBot - 18);
  noStroke();
  fill(352, 85, 98);
  textAlign(LEFT, TOP);
  textSize(9.5);
  text('t = 0 ms (PPG R-Peak)', zeroX + 6, pTop + 12);

  // Highlight classical HEP interoceptive window (200 - 400 ms)
  const w200 = map(200, -100, 500, pL, pR);
  const w400 = map(400, -100, 500, pL, pR);
  fill(190, 80, 90, 0.08);
  noStroke();
  rect(w200, pTop + 10, w400 - w200, pH - 28);
  fill(190, 70, 92);
  textAlign(CENTER, TOP);
  text('HEP Window (200–400 ms)', (w200 + w400) / 2, pTop + 12);

  // Draw averaged HEP traces for active channels
  const chMeta = [
    { name: 'TP9',  hue: 280, isTemporal: true },
    { name: 'AF7',  hue: 190, isTemporal: false },
    { name: 'AF8',  hue: 140, isTemporal: false },
    { name: 'TP10', hue: 38,  isTemporal: true }
  ];

  for (let c = 0; c < 4; c++) {
    const visible = showTP9TP10 || !chMeta[c].isTemporal;
    if (visible) {
      noFill();
      stroke(chMeta[c].hue, 85, 98);
      strokeWeight(chMeta[c].isTemporal ? 1.8 : 2.5);
      beginShape();
      for (let i = 0; i < EPOCH_SAMPLES; i++) {
        const x = map(i, 0, EPOCH_SAMPLES - 1, pL, pR);
        const normY = (avgHEP[c][i] || 0) / Math.max(0.5, currentYMax);
        const y = constrain(pMid - normY * plotHalfH, pTop + 12, pBot - 20);
        vertex(x, y);
      }
      endShape();
    }

    // Channel Legend (dims TP9/TP10 when toggled off)
    noStroke();
    fill(chMeta[c].hue, visible ? 85 : 30, visible ? 98 : 55);
    textAlign(LEFT, TOP);
    textSize(10);
    const valNow = avgHEP[c][Math.floor(EPOCH_SAMPLES * 0.63)] || 0; // value at ~+280 ms HEP peak
    const statusStr = visible ? `${valNow >= 0 ? '+' : ''}${valNow.toFixed(1)}µV` : 'OFF';
    text(`■ ${chMeta[c].name} (${statusStr})`, pR - 340 + c * 86, pTop + 12);
  }

  // =========================================================================
  // 3. BOTTOM LIVE 64 HZ PPG TRIGGER STRIP
  // =========================================================================
  const sTop = pBot + 10;
  const sH = height - sTop - 10;
  fill(225, 32, 12, 0.95);
  stroke(352, 55, 45);
  strokeWeight(1);
  rect(16, sTop, width - 32, sH, 6);

  noStroke();
  fill(352, 85, 98);
  textAlign(LEFT, CENTER);
  textSize(10.5);
  const trigLabel = `💓 ${pulseSource} pulsatile AC  |  IBI ${Math.round(medianIbi())} ms (${bpm} BPM)  |  Trials: ${trialCount}`;
  text(trigLabel, 26, sTop + sH / 2);

  // Live IMU-cleaned pulsatile AC + systolic-peak lock markers
  const waveL = 40 + textWidth(trigLabel);
  const waveR = width - 64;
  if (waveR > waveL + 40 && ppgTrail.length > 2) {
    let amp = 1e-6;
    for (let i = 0; i < ppgTrail.length; i++) amp = Math.max(amp, Math.abs(ppgTrail[i].hp));
    noFill();
    stroke(352, 80, 95, 0.9);
    strokeWeight(1.8);
    beginShape();
    for (let i = 0; i < ppgTrail.length; i++) {
      const wx = map(i, 0, 219, waveL, waveR);
      const wy = map(constrain(ppgTrail[i].hp, -amp, amp), -amp, amp, sTop + sH - 8, sTop + 8);
      vertex(wx, wy);
    }
    endShape();
    for (let i = 0; i < ppgTrail.length; i++) {
      if (!ppgTrail[i].isPeak) continue;
      const wx = map(i, 0, 219, waveL, waveR);
      stroke(48, 95, 100, 0.9);
      strokeWeight(1.4);
      line(wx, sTop + 5, wx, sTop + sH - 5);
    }
  }

  const beatFlash = constrain(1.0 - (nowMs - lastPeakMs) / 300.0, 0, 1);
  noStroke();
  fill(352, 90, 100, 0.25 + beatFlash * 0.75);
  ellipse(width - 38, sTop + sH / 2, 13 + beatFlash * 13, 13 + beatFlash * 13);
}

function mousePressed() {
  for (const b of uiButtons) {
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      if (b.id === 'reset') {
        resetHEP();
      } else if (b.id === 'yscale') {
        cycleYScale();
      } else if (b.id === 'tp9tp10') {
        showTP9TP10 = !showTP9TP10;
      } else if (b.id === 'linefilter') {
        lineFilterEnabled = !lineFilterEnabled;
      }
      return;
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    resetHEP();
  } else if (key === 'v' || key === 'V') {
    cycleYScale();
  } else if (key === 't' || key === 'T') {
    showTP9TP10 = !showTP9TP10;
  } else if (key === 'f' || key === 'F') {
    lineFilterEnabled = !lineFilterEnabled;
  }
}
