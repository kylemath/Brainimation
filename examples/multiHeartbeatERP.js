/**
 * @id multiHeartbeatERP
 * @title Heartbeat-Evoked Potential (HEP): PPG R-Peak Locked EEG
 * @category Multimodal (EEG + PPG + HR)
 * @order 3
 */
// Technical Multimodal Interoception Visualizer: Heartbeat-Evoked Potential (HEP)
// Detects systolic peaks in the 64 Hz PPG wave (`eegData.ppgPulse`), time-locks a [-100 ms, +500 ms]
// window of 256 Hz EEG across TP9, AF7, AF8, and TP10, applies a 50/60 Hz Line-Noise Notch + 30 Hz
// ERP Low-Pass filter followed by a [-100 ms, 0 ms] Pre-Stimulus Baseline Subtraction filter, and
// computes a rolling ensemble average ERP!
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
let smoothPulse = 0.5;
let armedForPeak = true;

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
  for (let ch = 0; ch < 4; ch++) {
    avgHEP[ch] = new Array(EPOCH_SAMPLES).fill(0);
  }
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
  const t = nowMs * 0.001;
  const rawPulse = eegData.connected
    ? (eegData.ppgPulse || 0)
    : Math.pow(max(0, sin(t * 3.9)), 4);
  // 60 FPS low-pass interpolation of the smoothed ΔOD / Oxy-Hb cardiac wave (eliminates BLE packet staircase steps)
  smoothPulse = lerp(smoothPulse, rawPulse, 0.28);
  const pulse = smoothPulse;
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 72;

  // Record live smoothed ΔOD / Oxy-Hb cardiac trigger trail
  ppgTrail.push({ v: pulse, isPeak: false });
  if (ppgTrail.length > 220) ppgTrail.shift();

  // Rearm systolic peak detector once wave drops below midline (prevents double-triggering on dicrotic notch)
  if (pulse < 0.48) {
    armedForPeak = true;
  }

  // Detect true systolic crest on smoothed Oxy-Hb / ΔOD cardiac wave and schedule epoch capture once +500 ms post-peak EEG arrives
  const nTrail = ppgTrail.length;
  const isLocalCrest = nTrail >= 3 &&
    ppgTrail[nTrail - 2].v >= ppgTrail[nTrail - 3].v &&
    ppgTrail[nTrail - 2].v >= ppgTrail[nTrail - 1].v;
  if (armedForPeak && pulse > 0.64 && isLocalCrest && nowMs - lastPeakMs > 460) {
    armedForPeak = false;
    lastPeakMs = nowMs;
    ppgTrail[nTrail - 2].isPeak = true;
    pendingPeakMs = nowMs;
  }

  // Once +500 ms of post-peak EEG has arrived (or immediately on first beat if disconnected), lock & filter epoch
  if (pendingPeakMs !== null && nowMs - pendingPeakMs >= 490) {
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
  text(`💓 Smoothed ΔOD / Oxy-Hb Trigger  |  Pulse: ${(pulse * 100).toFixed(0)}%  |  Trials: ${trialCount}`, 26, sTop + sH / 2);

  // Live PPG trace + R-peak lock markers inside bottom strip
  const waveL = 335;
  const waveR = width - 64;
  if (waveR > waveL + 40 && ppgTrail.length > 2) {
    noFill();
    stroke(352, 80, 95, 0.9);
    strokeWeight(1.8);
    beginShape();
    for (let i = 0; i < ppgTrail.length; i++) {
      const wx = map(i, 0, 219, waveL, waveR);
      const wy = map(constrain(ppgTrail[i].v, 0, 1), 0, 1, sTop + sH - 8, sTop + 8);
      vertex(wx, wy);
      if (ppgTrail[i].isPeak) {
        push();
        stroke(48, 95, 100, 0.85);
        strokeWeight(1.2);
        line(wx, sTop + 5, wx, sTop + sH - 5);
        pop();
      }
    }
    endShape();
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
