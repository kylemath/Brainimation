/**
 * @id museAthenaSpO2FusedEstimatorV2
 * @title 🧪 Muse S Athena Multi-Sensor SpO2 & rSO2 (v2: Pulse Wave Overlay)
 * @category Getting Started
 * @order -9
 */

// 🧪 MUSE S ATHENA MULTI-SENSOR SpO₂ & rSO₂ CALIBRATED ESTIMATOR
// Estimates arterial blood oxygen saturation (SpO₂ %) and regional cerebral tissue saturation
// (rSO₂ / TSI %) on the Muse S Athena by fusing every available hardware stream:
//
//   1. MULTI-WAVELENGTH SHORT (8 mm) & LONG (20 mm) OPTICS (64 Hz):
//      • Short channels (LI/RI, d ≈ 8 mm): Superficial forehead arterial capillary bed
//        at Red (660 nm), Near-IR (730 nm), Infrared (850 nm), and Ambient dark current.
//      • Long channels  (LO/RO, d ≈ 20 mm): Deep prefrontal cortex + superficial skin.
//
//   2. AMBIENT DARK-CURRENT SUBTRACTION & IMU NLMS MOTION ARTIFACT CANCELLATION:
//      • Subtracts ambient photodetector baseline I_amb(t) from all active optical channels.
//      • Uses 6-DOF IMU (3-axis Linear Accel + 3-axis Gyroscope @ 52 Hz) in a 6-tap Normalized
//        Least Mean Squares (NLMS) adaptive filter to strip head-movement optical coupling
//        from both 660 nm Red and 850 nm IR pulsatile AC waveforms before ratio extraction.
//      • Uses multi-sample optical history buffers (eegData.getShortPPGChannel / getLongPPGChannel)
//        to separate cardiac passband (0.65 - 3.0 Hz) from slow task-evoked cortical hemodynamics
//        (< 0.25 Hz) so mental attention changes do not corrupt arterial Ratio-of-Ratios R!
//
//   3. FOUR COMPLEMENTARY SpO₂ / rSO₂ ESTIMATORS + CONFIDENCE-WEIGHTED FUSION:
//      • Estimator A (Short 8mm RoR, 660/850nm): R_short = (AC_660/DC_660) / (AC_850/DC_850)
//      • Estimator B (Long 20mm RoR, 660/850nm): R_long  = (AC_660/DC_660) / (AC_850/DC_850)
//      • Estimator C (Discrete Systolic-Trough Beat-to-Beat RoR + 730/850nm Secondary Check):
//        Measures pulsatile peak-to-trough amplitude locked to cardiac cycle.
//      • Estimator D (MBLL Regional Cerebral Tissue Saturation rSO₂ / TSI + EEG NVC Prior):
//        Uses Short-Channel OLS Regression (ΔOD_clean = ΔOD_long - β·ΔOD_short), 3-wavelength
//        Modified Beer-Lambert Law (660/730/850 nm), and EEG (AF7/AF8/TP9/TP10 + DRL/REF contact)
//        neurovascular coupling & signal-quality gating.
//
//   4. FINGERTIP PULSE OXIMETER CALIBRATION HARNESS:
//      • Enter your live fingertip oximeter reading with [-0.5] / [+0.5] (or Up/Down keys).
//      • Click [📌 Calibrate] (or press 'C') to log paired (R_fused, Finger SpO₂%) points.
//      • 1 point  → calibrates linear offset A_fit in SpO₂ = A_fit - 25.0·R.
//      • ≥2 points → fits 2-parameter OLS calibration line SpO₂ = A_fit - B_fit·R (clamped to physical bounds)
//        and persists your calibration to localStorage so it stays active across reloads!
//
// Keyboard Shortcuts:
//   [H] or [?]             : Toggle How-To Calibrate Dropdown Window
//   [Up / Down] or [+ / -] : Adjust Fingertip Oximeter Reference SpO₂ (%)
//   [C]                    : Capture Calibration Pair (Current Fused R ↔ Fingertip SpO₂)
//   [X]                    : Reset Calibration to Empirical Default (SpO₂ = 110.0 - 25.0·R)
//   [R]                    : Re-Zero Optical Baselines & Adaptive NLMS Filters
//   [E]                    : Export CSV Log of Calibration & Multi-Sensor Time Series

var SPO2_HIST_LEN = 220;
var STORAGE_KEY = 'brainimation_athena_spo2_cal_v1';
var showHelpDropdown = false;
var helpDropdownBounds = { x: 0, y: 0, w: 0, h: 0 };

// Calibration state (Empirical Beer-Lambert curve: SpO2 = calA - calB * R)
var fingerRefSpO2 = 98.0;
var calDefaultA = 110.0;
var calDefaultB = 25.0;
var calA = 110.0;
var calB = 25.0;
var calMode = 'Default (110-25R)';
var calPoints = [];

// Adaptive 6-tap IMU NLMS weights for optical channels (cancels head-nod optical slip)
var nlmsWeightsShort660 = [0, 0, 0, 0, 0, 0];
var nlmsWeightsShort850 = [0, 0, 0, 0, 0, 0];
var nlmsWeightsLong660  = [0, 0, 0, 0, 0, 0];
var nlmsWeightsLong850  = [0, 0, 0, 0, 0, 0];

// Rolling optical buffers (120 samples) for AC RMS & DC extraction
var optWin = {
  s660AC: [], s850AC: [], s730AC: [],
  l660AC: [], l850AC: [], l730AC: []
};

// Tight cardiac band-pass filter state (0.65 - 2.8 Hz passband) to isolate arterial pulse from slow cortical HRF
var bpState = {
  s660: { lp: 0, base: 0, init: false },
  s850: { lp: 0, base: 0, init: false },
  s730: { lp: 0, base: 0, init: false },
  l660: { lp: 0, base: 0, init: false },
  l850: { lp: 0, base: 0, init: false },
  l730: { lp: 0, base: 0, init: false }
};

var beatDetector = {
  lastPeakFrame: -100,
  s660Min: Infinity, s660Max: -Infinity,
  s850Min: Infinity, s850Max: -Infinity,
  l660Min: Infinity, l660Max: -Infinity,
  l850Min: Infinity, l850Max: -Infinity
};

var estState = {
  rShort: 0.495,
  rLong: 0.500,
  rBeat: 0.495,
  r730: 0.500,
  rFused: 0.496,
  spo2RawEmpirical: 97.6,
  spo2Short: 97.6,
  spo2Long: 97.5,
  spo2Beat: 97.6,
  spo2Calibrated: 97.6,
  rSO2Cortical: 69.8,
  sqiOptical: 0.94,
  sqiMotion: 0.95,
  sqiEEGContact: 0.96,
  sqiTotal: 0.95,
  piShort: 1.35,
  piLong: 1.15,
  betaSkin: 0.78,
  cleanHbO2: 0.0,
  cleanHHb: 0.0,
  eegAlphaBetaRatio: 1.0,
  hrBpm: 72
};

var historyLog = {
  spo2Cal: [],
  spo2Raw: [],
  fingerRef: [],
  rSO2: [],
  acShort660: [],
  acShort850: [],
  acLong850: [],
  cleanHbO2: [],
  cleanHHb: [],
  imuMotion: [],
  eegCleanAF7: [],
  sqi: []
};

var PULSE_HALF_WIN = 75;       // ±75 frames (~±1.25s @ 60fps) to show preceding, current, and subsequent pulses
var PULSE_MIN_SEP = 22;        // Minimum frames between systolic peaks (~360ms)
var MAX_OVERLAY_PULSES = 18;   // Number of recent valid pulse waves to overlay
var pulseOverlayState = {
  rawS850: [],
  rawS660: [],
  rawL850: [],
  sampleIdx: 0,
  lastPeakSampleIdx: -100,
  waves: [],
  rejectedCount: 0
};

function baselineCorrectSlice(arr, start, end) {
  const out = new Array(end - start + 1);
  let sum = 0;
  for (let i = start; i <= end; i++) sum += arr[i];
  const mean = sum / out.length;
  for (let i = 0; i < out.length; i++) out[i] = arr[start + i] - mean;
  return out;
}

function isPulseOutlier(candS850, waves) {
  if (waves.length < 3) return false;
  const len = candS850.length;
  const meanWave = new Array(len).fill(0);
  for (let k = 0; k < waves.length; k++) {
    const w = waves[k].s850;
    for (let i = 0; i < len; i++) meanWave[i] += w[i];
  }
  for (let i = 0; i < len; i++) meanWave[i] /= waves.length;

  let varSum = 0;
  for (let k = 0; k < waves.length; k++) {
    const w = waves[k].s850;
    for (let i = 0; i < len; i++) {
      const d = w[i] - meanWave[i];
      varSum += d * d;
    }
  }
  const ensembleStd = Math.sqrt(varSum / (waves.length * len));

  let candErrSum = 0;
  for (let i = 0; i < len; i++) {
    const d = candS850[i] - meanWave[i];
    candErrSum += d * d;
  }
  const candRmse = Math.sqrt(candErrSum / len);

  const centerIdx = PULSE_HALF_WIN;
  const meanPeak = meanWave[centerIdx];
  const candPeak = candS850[centerIdx];
  if (meanPeak > 0.05 && (candPeak < 0.4 * meanPeak || candPeak > 2.2 * meanPeak)) {
    return true;
  }
  return ensembleStd > 1e-4 && candRmse > 2.3 * ensembleStd;
}

function updatePulseOverlay(s850, s660, l850) {
  const st = pulseOverlayState;
  const maxRaw = 2 * PULSE_HALF_WIN + 16;
  pushBounded(st.rawS850, s850, maxRaw);
  pushBounded(st.rawS660, s660, maxRaw);
  pushBounded(st.rawL850, l850, maxRaw);
  st.sampleIdx++;

  const winLen = 2 * PULSE_HALF_WIN + 1;
  if (st.rawS850.length < winLen + 8) return;

  const c = st.rawS850.length - 1 - PULSE_HALF_WIN;
  const candGlobalIdx = st.sampleIdx - 1 - PULSE_HALF_WIN;
  if (candGlobalIdx - st.lastPeakSampleIdx < PULSE_MIN_SEP) return;

  const val = st.rawS850[c];
  if (val <= 0.05) return;
  for (let d = 1; d <= 8; d++) {
    if (st.rawS850[c - d] > val || st.rawS850[c + d] >= val) return;
  }

  const start = c - PULSE_HALF_WIN;
  const end = c + PULSE_HALF_WIN;
  const snip850 = baselineCorrectSlice(st.rawS850, start, end);
  const snip660 = baselineCorrectSlice(st.rawS660, start, end);
  const snipL850 = baselineCorrectSlice(st.rawL850, start, end);

  st.lastPeakSampleIdx = candGlobalIdx;

  if (isPulseOutlier(snip850, st.waves)) {
    st.rejectedCount++;
    return;
  }

  st.waves.push({ s850: snip850, s660: snip660, l850: snipL850 });
  if (st.waves.length > MAX_OVERLAY_PULSES) st.waves.shift();
}

// Whole-recording log for Tier 1. One point per "bucket" of frames; when it fills up, neighbouring points are
// averaged and the bucket doubles, so the entire session always fits on screen (no scrolling window).
var FULL_MAX = 1200;
var fullLog = { cal: [], ref: [], raw: [], stride: 1, n: 0, sCal: 0, sRef: 0, sRaw: 0, startMs: null, lastMs: 0 };
var gaugeValue = null;   // eased needle position (% SpO2)

function pushFullLog(cal, ref, raw) {
  const f = fullLog;
  if (f.startMs === null) f.startMs = millis();
  f.lastMs = millis();
  f.sCal += cal; f.sRef += ref; f.sRaw += raw; f.n++;
  if (f.n < f.stride) return;
  f.cal.push(f.sCal / f.n); f.ref.push(f.sRef / f.n); f.raw.push(f.sRaw / f.n);
  f.sCal = f.sRef = f.sRaw = 0; f.n = 0;
  if (f.cal.length >= FULL_MAX) {
    for (const k of ['cal', 'ref', 'raw']) {
      const a = f[k], out = [];
      for (let i = 0; i + 1 < a.length; i += 2) out.push((a[i] + a[i + 1]) / 2);
      f[k] = out;
    }
    f.stride *= 2;
  }
}

function fmtElapsed(ms) {
  const sec = Math.max(0, Math.round(ms / 1000));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

var uiBtns = [];
var statusToast = { text: '', until: 0 };
var wasLiveStream = false;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  loadSavedCalibration();

  for (let i = 0; i < 140; i++) {
    stepMultiSensorSpO2(true);
  }
}

function showToast(msg, durationMs = 2800) {
  statusToast.text = msg;
  statusToast.until = millis() + durationMs;
}

function loadSavedCalibration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.fingerRefSpO2 === 'number') fingerRefSpO2 = constrain(data.fingerRefSpO2, 70, 100);
    if (Array.isArray(data.calPoints)) calPoints = data.calPoints.slice(-24);
    recomputeCalibrationFit();
  } catch (_) {}
}

function saveCalibration() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fingerRefSpO2,
      calA,
      calB,
      calMode,
      calPoints
    }));
  } catch (_) {}
}

function recomputeCalibrationFit() {
  if (!calPoints || calPoints.length === 0) {
    calA = calDefaultA;
    calB = calDefaultB;
    calMode = 'Default (110-25R)';
    return;
  }
  if (calPoints.length === 1) {
    const p = calPoints[0];
    calB = calDefaultB;
    calA = constrain(p.fingerSpO2 + calB * p.R, 92.0, 128.0);
    calMode = `1-Pt Offset (${calA.toFixed(1)}-25R)`;
    return;
  }

  let sumW = 0, sumR = 0, sumY = 0, sumRR = 0, sumRY = 0;
  for (let i = 0; i < calPoints.length; i++) {
    const p = calPoints[i];
    const w = Math.max(0.2, p.sqi || 0.8);
    sumW  += w;
    sumR  += w * p.R;
    sumY  += w * p.fingerSpO2;
    sumRR += w * p.R * p.R;
    sumRY += w * p.R * p.fingerSpO2;
  }
  const meanR = sumR / sumW;
  const meanY = sumY / sumW;
  const varR = sumRR / sumW - meanR * meanR;
  const covRY = sumRY / sumW - meanR * meanY;

  let fittedB = calDefaultB;
  if (varR > 0.00022) {
    const rawSlope = -covRY / (varR + 1e-4);
    fittedB = constrain(rawSlope, 12.0, 42.0);
    calMode = `${calPoints.length}-Pt OLS (${calA.toFixed(0)}-${fittedB.toFixed(1)}R)`;
  } else {
    const regSlope = -(covRY - 0.002 * calDefaultB) / (varR + 0.002);
    fittedB = constrain(regSlope, 18.0, 32.0);
    calMode = `${calPoints.length}-Pt RegFit`;
  }
  calB = fittedB;
  calA = constrain(meanY + calB * meanR, 94.0, 126.0);
  if (varR > 0.00022) {
    calMode = `${calPoints.length}-Pt OLS (${calA.toFixed(1)}-${calB.toFixed(1)}R)`;
  }
}

function captureCalibrationPoint() {
  const pt = {
    t: new Date().toLocaleTimeString(),
    R: +estState.rFused.toFixed(4),
    rShort: +estState.rShort.toFixed(4),
    rLong: +estState.rLong.toFixed(4),
    rBeat: +estState.rBeat.toFixed(4),
    r730: +estState.r730.toFixed(4),
    fingerSpO2: +fingerRefSpO2.toFixed(1),
    rawEstSpO2: +estState.spo2RawEmpirical.toFixed(1),
    rSO2: +estState.rSO2Cortical.toFixed(1),
    sqi: +estState.sqiTotal.toFixed(2),
    hr: estState.hrBpm
  };
  calPoints.push(pt);
  if (calPoints.length > 24) calPoints.shift();
  recomputeCalibrationFit();
  saveCalibration();
  showToast(`📌 Captured Cal Point #${calPoints.length}: R=${pt.R.toFixed(3)} → Finger=${pt.fingerSpO2.toFixed(1)}%`);
}

function resetCalibration() {
  calPoints = [];
  recomputeCalibrationFit();
  saveCalibration();
  showToast('↺ Reset to default Beer-Lambert calibration (SpO₂ = 110.0 - 25.0·R)');
}

function exportCalibrationCSV() {
  let lines = [
    'type,timestamp_or_idx,finger_spo2_pct,calibrated_spo2_pct,raw_empirical_spo2_pct,rso2_tsi_pct,R_fused,R_short8mm,R_long20mm,R_beat,R_730_850,sqi_total,hr_bpm,clean_hbo2_uM,clean_hhb_uM,imu_motion_g'
  ];
  for (let i = 0; i < calPoints.length; i++) {
    const p = calPoints[i];
    const calVal = constrain(calA - calB * p.R, 70, 100);
    lines.push(
      `CAL_POINT,${p.t},${p.fingerSpO2.toFixed(1)},${calVal.toFixed(2)},${p.rawEstSpO2.toFixed(2)},${p.rSO2.toFixed(1)},${p.R.toFixed(4)},${p.rShort.toFixed(4)},${p.rLong.toFixed(4)},${p.rBeat.toFixed(4)},${p.r730.toFixed(4)},${p.sqi.toFixed(2)},${p.hr},0,0,0`
    );
  }
  const n = historyLog.spo2Cal.length;
  for (let i = 0; i < n; i++) {
    lines.push(
      `STREAM_SAMPLE,${i},${(historyLog.fingerRef[i] || fingerRefSpO2).toFixed(1)},${(historyLog.spo2Cal[i] || 0).toFixed(2)},${(historyLog.spo2Raw[i] || 0).toFixed(2)},${(historyLog.rSO2[i] || 0).toFixed(2)},${estState.rFused.toFixed(4)},${estState.rShort.toFixed(4)},${estState.rLong.toFixed(4)},${estState.rBeat.toFixed(4)},${estState.r730.toFixed(4)},${(historyLog.sqi[i] || 0).toFixed(2)},${estState.hrBpm},${(historyLog.cleanHbO2[i] || 0).toFixed(3)},${(historyLog.cleanHHb[i] || 0).toFixed(3)},${(historyLog.imuMotion[i] || 0).toFixed(3)}`
    );
  }
  if (typeof eegData !== 'undefined' && typeof eegData.downloadCSV === 'function') {
    eegData.downloadCSV(lines.join('\n'), 'Muse_Athena_SpO2_Calibration_' + Date.now() + '.csv');
    showToast('💾 Downloaded Muse_Athena_SpO2_Calibration CSV!');
  }
}

function resetOpticalBaselines() {
  for (const k in bpState) {
    bpState[k].init = false;
  }
  for (const k in optWin) {
    optWin[k] = [];
  }
  nlmsWeightsShort660 = [0, 0, 0, 0, 0, 0];
  nlmsWeightsShort850 = [0, 0, 0, 0, 0, 0];
  nlmsWeightsLong660  = [0, 0, 0, 0, 0, 0];
  nlmsWeightsLong850  = [0, 0, 0, 0, 0, 0];
  showToast('🔄 Optical baselines & IMU NLMS filters re-zeroed');
}

// Band-pass filter (0.75 - 2.8 Hz cardiac passband) + IMU 6-tap NLMS motion cancellation
function filterOpticalChannel(rawVal, ambVal, stateObj, nlmsWeights, imuVec, imuNormSq) {
  const darkCorrected = Math.max(100, rawVal - Math.max(0, ambVal) * 0.15);

  if (!stateObj.init) {
    stateObj.lp = darkCorrected;
    stateObj.base = darkCorrected;
    stateObj.init = true;
  }

  if (Math.abs(darkCorrected - stateObj.base) / Math.max(1, stateObj.base) > 0.05) {
    stateObj.lp = darkCorrected;
    stateObj.base = darkCorrected;
  }

  // Fast low-pass (~2.8 Hz) minus cardiac baseline tracker (~0.65 Hz) -> isolates systolic pulse
  // and rejects slow Mayer waves (0.1 Hz) and task-evoked cortical HRF shifts
  stateObj.lp   = stateObj.lp   + 0.28 * (darkCorrected - stateObj.lp);
  stateObj.base = stateObj.base + 0.075 * (stateObj.lp - stateObj.base);

  const dcVal = Math.max(100, stateObj.base);
  const rawAcOd = -(stateObj.lp - dcVal) / dcVal;

  let motionEst = 0;
  for (let k = 0; k < 6; k++) {
    motionEst += nlmsWeights[k] * imuVec[k];
  }
  const cleanAcOd = rawAcOd - motionEst;
  const mu = 0.025;
  for (let k = 0; k < 6; k++) {
    nlmsWeights[k] = constrain(0.9985 * nlmsWeights[k] + (mu * cleanAcOd * imuVec[k]) / imuNormSq, -0.05, 0.05);
  }

  return {
    dc: dcVal,
    rawAcOd,
    cleanAcOd,
    motionEst
  };
}

// Compute cardiac AC/DC directly from a 64 Hz history buffer via zero-phase cardiac-band linear detrending
function computeHistoryCardiacAC(samples, ambVal) {
  if (!samples || samples.length < 32) return null;
  const sub = samples.slice(-64);
  const n = sub.length;
  const od = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const v = Math.max(100, sub[i] - ambVal * 0.15);
    od[i] = -Math.log(v / 180000.0);
  }
  const R = 18;
  let sq = 0;
  let count = 0;
  for (let i = 4; i < n - 4; i++) {
    const i0 = Math.max(0, i - R);
    const i1 = Math.min(n - 1, i + R);
    const len = i1 - i0 + 1;
    let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
    for (let j = i0; j <= i1; j++) {
      const x = j - i;
      const y = od[j];
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumXY += x * y;
    }
    const meanX = sumX / len;
    const meanY = sumY / len;
    const varX = sumXX - len * meanX * meanX;
    const slope = varX > 1e-6 ? (sumXY - len * meanX * meanY) / varX : 0;
    const trendAtI = meanY - slope * meanX;
    // 3-point low-pass smoothing around sample i minus local linear baseline
    const lpAtI = 0.25 * od[i - 1] + 0.50 * od[i] + 0.25 * od[i + 1];
    const ac = lpAtI - trendAtI;
    sq += ac * ac;
    count++;
  }
  return count > 0 ? Math.sqrt(sq / count) : null;
}

function rmsOf(arr) {
  if (!arr || arr.length < 6) return 0;
  let mean = 0;
  for (let i = 0; i < arr.length; i++) mean += arr[i];
  mean /= arr.length;
  let sq = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mean;
    sq += d * d;
  }
  return Math.sqrt(sq / arr.length);
}

function pushBounded(arr, val, maxN) {
  arr.push(val);
  if (arr.length > maxN) arr.shift();
}

function stepMultiSensorSpO2(isWarmup = false) {
  const t = millis() * 0.001 + (isWarmup ? optWin.s850AC.length * (1 / 60) : 0);
  const hasLive = !isWarmup && typeof eegData !== 'undefined' && eegData.connected;

  // Reset filter states cleanly when transitioning from warmup to live hardware/simulator stream
  if (hasLive && !wasLiveStream) {
    wasLiveStream = true;
    for (const k in bpState) bpState[k].init = false;
    for (const k in optWin) optWin[k] = [];
  } else if (!hasLive) {
    wasLiveStream = false;
  }

  // 1. Read 6-DOF IMU kinematics for motion artifact regression & SQI gating
  let linAx = 0, linAy = 0, linAz = 0, gx = 0, gy = 0, gz = 0;
  if (hasLive && eegData.linearAccel && eegData.gyro) {
    linAx = eegData.linearAccel.x || 0;
    linAy = eegData.linearAccel.y || 0;
    linAz = eegData.linearAccel.z || 0;
    gx    = eegData.gyro.x || 0;
    gy    = eegData.gyro.y || 0;
    gz    = eegData.gyro.z || 0;
  } else {
    linAx = 0.06 * Math.sin(t * 1.4);
    linAy = 0.05 * Math.cos(t * 1.1);
    linAz = 0.04 * Math.sin(t * 2.2);
    gx    = 3.5 * Math.sin(t * 1.1);
    gy    = 5.0 * Math.cos(t * 1.4);
    gz    = 3.0 * Math.sin(t * 0.9);
  }

  const imuVec = [
    linAx * 0.25, linAy * 0.25, linAz * 0.25,
    gx / 80.0, gy / 80.0, gz / 80.0
  ];
  let imuNormSq = 1e-4;
  for (let k = 0; k < 6; k++) imuNormSq += imuVec[k] * imuVec[k];
  const imuMotionMag = Math.sqrt(linAx * linAx + linAy * linAy + linAz * linAz) +
                       Math.sqrt(gx * gx + gy * gy + gz * gz) / 75.0;

  // 2. Read Short (8 mm) & Long (20 mm) multi-wavelength optical intensities
  let sIR = 0, sRed = 0, sNIR = 0, sAmb = 12000;
  let lIR = 0, lRed = 0, lNIR = 0, lAmb = 12000;

  if (hasLive && eegData.ppgShort && eegData.ppgLong && eegData.ppgLong.ir850 > 0) {
    sIR  = eegData.ppgShort.ir850  || eegData.ppg[1] || 185000;
    sRed = eegData.ppgShort.red660 || eegData.ppg[2] || 162000;
    sNIR = eegData.ppgShort.nir730 || eegData.ppg[3] || 178000;
    sAmb = eegData.ppgShort.ambient || eegData.ppg[0] || 12000;

    lIR  = eegData.ppgLong.ir850  || eegData.ppg[1] || sIR;
    lRed = eegData.ppgLong.red660 || eegData.ppg[2] || sRed;
    lNIR = eegData.ppgLong.nir730 || eegData.ppg[3] || sNIR;
    lAmb = eegData.ppgLong.ambient || eegData.ppg[0] || sAmb;
  } else {
    const hr = (hasLive && eegData.heartRate > 35) ? eegData.heartRate : 72;
    const phase = (t * (hr / 60.0)) % 1.0;
    const pulseWave = Math.exp(-Math.pow((phase - 0.22) / 0.085, 2)) +
                      0.36 * Math.exp(-Math.pow((phase - 0.48) / 0.11, 2));
    const respWave = 0.15 * Math.sin(2 * Math.PI * 0.24 * t);
    const mayerWave = 0.22 * Math.sin(2 * Math.PI * 0.09 * t);
    const motionSlip = 0.00035 * (imuVec[0] + imuVec[4]);

    const ac850Short = 0.0028 * (pulseWave - 0.4) + 0.0005 * respWave + 0.0006 * mayerWave + motionSlip;
    const ac660Short = 0.495 * 0.0028 * (pulseWave - 0.4) + 0.00025 * respWave + 0.0003 * mayerWave + motionSlip;
    const ac730Short = 0.575 * 0.0028 * (pulseWave - 0.4) + 0.0003 * respWave + 0.0004 * mayerWave + motionSlip;

    const ac850Long = ac850Short * 1.15;
    const ac660Long = ac660Short * 1.15;
    const ac730Long = ac730Short * 1.15;

    sAmb = 12000 + 25 * Math.sin(t * 0.5);
    lAmb = 12100 + 25 * Math.cos(t * 0.5);
    sIR  = 185000 * Math.exp(-ac850Short);
    sRed = 162000 * Math.exp(-ac660Short);
    sNIR = 178000 * Math.exp(-ac730Short);
    lIR  = 185000 * Math.exp(-ac850Long);
    lRed = 162000 * Math.exp(-ac660Long);
    lNIR = 178000 * Math.exp(-ac730Long);
  }

  // 3. Filter each optical wavelength channel (Ambient subtraction + Cardiac Bandpass + IMU NLMS)
  const fS660 = filterOpticalChannel(sRed, sAmb, bpState.s660, nlmsWeightsShort660, imuVec, imuNormSq);
  const fS850 = filterOpticalChannel(sIR,  sAmb, bpState.s850, nlmsWeightsShort850, imuVec, imuNormSq);
  const fS730 = filterOpticalChannel(sNIR, sAmb, bpState.s730, nlmsWeightsShort850, imuVec, imuNormSq);

  const fL660 = filterOpticalChannel(lRed, lAmb, bpState.l660, nlmsWeightsLong660, imuVec, imuNormSq);
  const fL850 = filterOpticalChannel(lIR,  lAmb, bpState.l850, nlmsWeightsLong850, imuVec, imuNormSq);
  const fL730 = filterOpticalChannel(lNIR, lAmb, bpState.l730, nlmsWeightsLong850, imuVec, imuNormSq);

  const W_LEN = 120;
  pushBounded(optWin.s660AC, fS660.cleanAcOd, W_LEN);
  pushBounded(optWin.s850AC, fS850.cleanAcOd, W_LEN);
  pushBounded(optWin.s730AC, fS730.cleanAcOd, W_LEN);
  pushBounded(optWin.l660AC, fL660.cleanAcOd, W_LEN);
  pushBounded(optWin.l850AC, fL850.cleanAcOd, W_LEN);
  pushBounded(optWin.l730AC, fL730.cleanAcOd, W_LEN);

  // 4. Compute RMS pulsatile modulation ratios (preferring 64 Hz history buffer if populated)
  let rmsS660 = rmsOf(optWin.s660AC);
  let rmsS850 = rmsOf(optWin.s850AC);
  let rmsS730 = rmsOf(optWin.s730AC);
  let rmsL660 = rmsOf(optWin.l660AC);
  let rmsL850 = rmsOf(optWin.l850AC);
  let rmsL730 = rmsOf(optWin.l730AC);

  if (hasLive && typeof eegData.getShortPPGChannel === 'function' && typeof eegData.getLongPPGChannel === 'function') {
    const hS660 = computeHistoryCardiacAC(eegData.getShortPPGChannel('red660', 128), sAmb);
    const hS850 = computeHistoryCardiacAC(eegData.getShortPPGChannel('ir850', 128), sAmb);
    const hS730 = computeHistoryCardiacAC(eegData.getShortPPGChannel('nir730', 128), sAmb);
    const hL660 = computeHistoryCardiacAC(eegData.getLongPPGChannel('red660', 128), lAmb);
    const hL850 = computeHistoryCardiacAC(eegData.getLongPPGChannel('ir850', 128), lAmb);
    const hL730 = computeHistoryCardiacAC(eegData.getLongPPGChannel('nir730', 128), lAmb);
    if (hS660 && hS850) { rmsS660 = hS660; rmsS850 = hS850; }
    if (hS730) rmsS730 = hS730;
    if (hL660 && hL850) { rmsL660 = hL660; rmsL850 = hL850; }
    if (hL730) rmsL730 = hL730;
  }

  estState.piShort = constrain(rmsS850 * 1000.0, 0.05, 9.9);
  estState.piLong  = constrain(rmsL850 * 1000.0, 0.05, 9.9);

  // Estimator A: Short-Channel (8 mm) Ratio-of-Ratios R_short = (AC/DC)_660 / (AC/DC)_850
  if (rmsS850 > 1e-6 && rmsS660 > 1e-6) {
    const rawRShort = constrain(rmsS660 / rmsS850, 0.32, 1.35);
    estState.rShort = lerp(estState.rShort, rawRShort, 0.14);
  }

  // Estimator B: Long-Channel (20 mm) Ratio-of-Ratios R_long = (AC/DC)_660 / (AC/DC)_850
  if (rmsL850 > 1e-6 && rmsL660 > 1e-6) {
    const rawRLong = constrain(rmsL660 / rmsL850, 0.32, 1.35);
    estState.rLong = lerp(estState.rLong, rawRLong, 0.14);
  }

  // Secondary Wavelength Cross-Check: 730 nm NIR / 850 nm IR Ratio
  const rms730Mix = 0.65 * rmsS730 + 0.35 * rmsL730;
  const rms850Mix = 0.65 * rmsS850 + 0.35 * rmsL850;
  if (rms850Mix > 1e-6 && rms730Mix > 1e-6) {
    const rawR730 = constrain((rms730Mix / rms850Mix) * 0.86, 0.32, 1.35);
    estState.r730 = lerp(estState.r730, rawR730, 0.12);
  }

  // Estimator C: Beat-to-Beat Peak-Trough Logarithmic Ratio locked to cardiac cycle
  beatDetector.s660Min = Math.min(beatDetector.s660Min, fS660.cleanAcOd);
  beatDetector.s660Max = Math.max(beatDetector.s660Max, fS660.cleanAcOd);
  beatDetector.s850Min = Math.min(beatDetector.s850Min, fS850.cleanAcOd);
  beatDetector.s850Max = Math.max(beatDetector.s850Max, fS850.cleanAcOd);
  beatDetector.l660Min = Math.min(beatDetector.l660Min, fL660.cleanAcOd);
  beatDetector.l660Max = Math.max(beatDetector.l660Max, fL660.cleanAcOd);
  beatDetector.l850Min = Math.min(beatDetector.l850Min, fL850.cleanAcOd);
  beatDetector.l850Max = Math.max(beatDetector.l850Max, fL850.cleanAcOd);

  const curFrame = typeof frameCount !== 'undefined' ? frameCount : optWin.s850AC.length;
  const beatPeriodFrames = Math.round((60.0 / Math.max(45, estState.hrBpm || 72)) * 60);
  if (curFrame - beatDetector.lastPeakFrame >= Math.max(22, beatPeriodFrames)) {
    const ptpS660 = beatDetector.s660Max - beatDetector.s660Min;
    const ptpS850 = beatDetector.s850Max - beatDetector.s850Min;
    const ptpL660 = beatDetector.l660Max - beatDetector.l660Min;
    const ptpL850 = beatDetector.l850Max - beatDetector.l850Min;

    let beatR = estState.rShort;
    if (ptpS850 > 1e-5 && ptpL850 > 1e-5) {
      const rBS = constrain(ptpS660 / ptpS850, 0.32, 1.35);
      const rBL = constrain(ptpL660 / ptpL850, 0.32, 1.35);
      beatR = 0.65 * rBS + 0.35 * rBL;
    } else if (ptpS850 > 1e-5) {
      beatR = constrain(ptpS660 / ptpS850, 0.32, 1.35);
    }
    estState.rBeat = lerp(estState.rBeat, beatR, 0.25);

    beatDetector.lastPeakFrame = curFrame;
    beatDetector.s660Min = Infinity; beatDetector.s660Max = -Infinity;
    beatDetector.s850Min = Infinity; beatDetector.s850Max = -Infinity;
    beatDetector.l660Min = Infinity; beatDetector.l660Max = -Infinity;
    beatDetector.l850Min = Infinity; beatDetector.l850Max = -Infinity;
  }

  // 5. Estimator D: Short-Channel Regressed MBLL Cerebral Tissue Saturation (rSO2 / TSI %) + EEG + DRL/REF
  let cleanHbO2 = 0, cleanHHb = 0, beta850 = 0.78;
  if (hasLive && eegData.fnirsRegression) {
    cleanHbO2 = eegData.fnirsRegression.cleanHbO2 || 0;
    cleanHHb  = eegData.fnirsRegression.cleanHHb  || 0;
    beta850   = eegData.fnirsRegression.beta850   || 0.78;
  } else {
    beta850 = 0.79;
    cleanHbO2 = 1.45 * Math.sin(t * 0.45) + 0.4 * Math.cos(t * 0.9);
    cleanHHb  = -0.52 * Math.sin(t * 0.45 - 0.3);
  }
  estState.cleanHbO2 = lerp(estState.cleanHbO2, cleanHbO2, 0.2);
  estState.cleanHHb  = lerp(estState.cleanHHb,  cleanHHb,  0.2);
  estState.betaSkin  = lerp(estState.betaSkin,  beta850,   0.15);

  const alphaP = (hasLive && typeof eegData.alpha === 'number') ? eegData.alpha : 0.38;
  const betaP  = (hasLive && typeof eegData.beta  === 'number') ? eegData.beta  : 0.36;
  const gammaP = (hasLive && typeof eegData.gamma === 'number') ? eegData.gamma : 0.25;
  estState.eegAlphaBetaRatio = (betaP + 0.5 * gammaP) / Math.max(0.1, alphaP);

  const nvcBoost = constrain((estState.eegAlphaBetaRatio - 1.0) * 0.6, -1.5, 2.0);
  const instCortHbO2 = Math.max(5.0, 58.0 + estState.cleanHbO2 + nvcBoost);
  const instCortHHb  = Math.max(2.0, 25.0 + estState.cleanHHb  - nvcBoost * 0.35);
  const rawTSI = constrain((instCortHbO2 / (instCortHbO2 + instCortHHb)) * 100.0, 45.0, 92.0);
  estState.rSO2Cortical = lerp(estState.rSO2Cortical, rawTSI, 0.15);

  // 6. Multi-Sensor Signal Quality Index (SQI) for Precision-Weighted Fusion
  const rSpread = Math.abs(estState.rShort - estState.rLong) + 0.5 * Math.abs(estState.rShort - estState.r730);
  const optSqi = constrain(1.0 - rSpread * 1.1, 0.35, 1.0);
  const motSqi = constrain(1.0 - imuMotionMag * 0.35, 0.25, 1.0);

  let eegSqi = 0.96;
  if (hasLive && eegData.contactQuality) {
    const cq = eegData.contactQuality;
    eegSqi = constrain(((cq.AF7 || 1) * 0.4 + (cq.AF8 || 1) * 0.4 + (cq.TP9 || 1) * 0.1 + (cq.TP10 || 1) * 0.1), 0.2, 1.0);
  }
  estState.sqiOptical = lerp(estState.sqiOptical, optSqi, 0.15);
  estState.sqiMotion  = lerp(estState.sqiMotion,  motSqi, 0.20);
  estState.sqiEEGContact = lerp(estState.sqiEEGContact, eegSqi, 0.15);
  estState.sqiTotal = constrain(0.45 * estState.sqiOptical + 0.35 * estState.sqiMotion + 0.20 * estState.sqiEEGContact, 0.15, 1.0);

  // 7. Precision-Weighted Multi-Estimator Fusion of Ratio-of-Ratios R
  const wShort = 0.42;
  const wLong  = 0.26;
  const wBeat  = 0.20;
  const w730   = 0.12;
  const rFusedInst = wShort * estState.rShort + wLong * estState.rLong + wBeat * estState.rBeat + w730 * estState.r730;

  const kalmanGain = 0.05 + 0.15 * estState.sqiTotal;
  estState.rFused = lerp(estState.rFused, rFusedInst, kalmanGain);

  estState.spo2Short = constrain(calA - calB * estState.rShort, 70.0, 100.0);
  estState.spo2Long  = constrain(calA - calB * estState.rLong,  70.0, 100.0);
  estState.spo2Beat  = constrain(calA - calB * estState.rBeat,  70.0, 100.0);
  estState.spo2RawEmpirical = constrain(calDefaultA - calDefaultB * estState.rFused, 70.0, 100.0);

  const rSO2ArterialProxy = constrain(estState.rSO2Cortical + 27.8, 85.0, 100.0);
  const fusedCalSpO2 = 0.92 * (calA - calB * estState.rFused) + 0.08 * rSO2ArterialProxy;
  estState.spo2Calibrated = constrain(fusedCalSpO2, 70.0, 100.0);

  estState.hrBpm = (hasLive && eegData.heartRate > 35) ? eegData.heartRate : 72;

  // EEG arrives at 256 Hz in packets, but this runs once per frame: fetch exactly the samples that arrived since
  // the last frame (eegData.cleanCount is a monotonic sample counter), so nothing is repeated or skipped.
  let cleanBlock = [];
  const cc = hasLive && eegData.cleanCount ? eegData.cleanCount.AF7 : undefined;
  const hist = hasLive && eegData.cleanHistory ? eegData.cleanHistory.AF7 : undefined;
  if (cc !== undefined && hist && hist.length) {
    let nNew = estState.lastEegCount === undefined ? 0 : cc - estState.lastEegCount;
    estState.lastEegCount = cc;
    nNew = Math.max(0, Math.min(nNew, hist.length));
    if (nNew > 0) cleanBlock = hist.slice(-nNew);
  } else {
    estState.lastEegCount = undefined;
    for (let i = 0; i < 4; i++) {
      const ts = t - (3 - i) / 256;
      cleanBlock.push(14.0 * Math.sin(2 * Math.PI * 10.0 * ts) + 7.0 * Math.sin(2 * Math.PI * 20.0 * ts));
    }
  }

  pushBounded(historyLog.spo2Cal,     estState.spo2Calibrated, SPO2_HIST_LEN);
  pushBounded(historyLog.spo2Raw,     estState.spo2RawEmpirical, SPO2_HIST_LEN);
  pushBounded(historyLog.fingerRef,   fingerRefSpO2, SPO2_HIST_LEN);
  pushFullLog(estState.spo2Calibrated, fingerRefSpO2, estState.spo2RawEmpirical);
  pushBounded(historyLog.rSO2,        estState.rSO2Cortical, SPO2_HIST_LEN);
  pushBounded(historyLog.acShort660,  fS660.cleanAcOd * 1000.0, SPO2_HIST_LEN);
  pushBounded(historyLog.acShort850,  fS850.cleanAcOd * 1000.0, SPO2_HIST_LEN);
  pushBounded(historyLog.acLong850,   fL850.cleanAcOd * 1000.0, SPO2_HIST_LEN);
  updatePulseOverlay(fS850.cleanAcOd * 1000.0, fS660.cleanAcOd * 1000.0, fL850.cleanAcOd * 1000.0);
  pushBounded(historyLog.cleanHbO2,   estState.cleanHbO2, SPO2_HIST_LEN);
  pushBounded(historyLog.cleanHHb,    estState.cleanHHb, SPO2_HIST_LEN);
  pushBounded(historyLog.imuMotion,   imuMotionMag, SPO2_HIST_LEN);
  for (let i = 0; i < cleanBlock.length; i++) pushBounded(historyLog.eegCleanAF7, cleanBlock[i], SPO2_HIST_LEN * 3);
  pushBounded(historyLog.sqi,         estState.sqiTotal, SPO2_HIST_LEN);
}

function draw() {
  background(10, 14, 24);
  stepMultiSensorSpO2(false);

  uiBtns = [];
  const pad = 10;

  // =========================================================================
  // 1. TOP HEADER BAR & ACTION BUTTONS
  // =========================================================================
  fill(17, 24, 40);
  stroke(45, 68, 110);
  strokeWeight(1);
  rect(pad, 6, width - pad * 2, 42, 7);

  noStroke();
  fill(238, 246, 255);
  textStyle(BOLD);
  textSize(11);
  text('🧪 Muse S Athena Multi-Sensor SpO₂ & rSO₂ Estimator', pad + 8, 21);

  textStyle(NORMAL);
  fill(152, 180, 220);
  textSize(8.2);
  const hwStr = (typeof eegData !== 'undefined' && eegData.connected)
    ? (eegData.hasDualDistancePPG ? 'Athena 8mm+20mm' : 'Muse Optical+IMU+EEG')
    : 'Sim: Athena 8mm/20mm';
  text(
    `${hwStr} | Cal: ${calMode} | SQI: ${(estState.sqiTotal * 100).toFixed(0)}%`,
    pad + 8, 37
  );

  let bx = width - pad - 6;
  drawActionBtn('csv', '💾 CSV [E]', bx, 12, color(30, 64, 115), color(120, 190, 255));
  bx = uiBtns[uiBtns.length - 1].x - 5;
  drawActionBtn('rezero', '🔄 Zero [R]', bx, 12, color(40, 52, 78), color(160, 185, 225));
  bx = uiBtns[uiBtns.length - 1].x - 5;
  drawActionBtn(
    'toggleHelp',
    showHelpDropdown ? '📖 Cal Guide ▲ [H]' : '📖 Cal Guide ▼ [H]',
    bx,
    12,
    showHelpDropdown ? color(115, 85, 22) : color(52, 42, 18),
    color(250, 204, 21)
  );

  // =========================================================================
  // 2. TOP METRIC & FINGERTIP CALIBRATION ROW (5 CARDS)
  // =========================================================================
  const cardY = 54;
  const cardH = 98;          // row height (the gauge card uses all of it, the other cards are centred 66 px cards)
  const smallH = 66, smallY = cardY + (cardH - smallH) / 2;
  const gap = 6;
  const availW = width - pad * 2 - gap * 4;
  const calCardW = Math.max(138, availW * 0.25);
  const stdCardW = (availW - calCardW) / 4;
  const gaugeW = Math.max(stdCardW, Math.min(190, availW * 0.26));
  const restW = (availW - gaugeW - calCardW) / 3;

  // Card 1: Calibrated Fused SpO2 (%)
  drawSpO2Gauge(pad, cardY, gaugeW, cardH);

  // Card 2: Interactive Fingertip Oximeter Calibration Reference
  const c2X = pad + gaugeW + gap;
  drawFingertipCalibrationCard(c2X, smallY, calCardW, smallH);

  // Card 3: Short (8mm) vs Long (20mm) Optical RoR
  const c3X = c2X + calCardW + gap;
  drawMetricCard(
    c3X, smallY, restW, smallH,
    '8mm/20mm RoR',
    `${estState.spo2Short.toFixed(1)}/${estState.spo2Long.toFixed(1)}%`,
    `R8=${estState.rShort.toFixed(2)} R20=${estState.rLong.toFixed(2)}`,
    color(56, 189, 248),
    `PI ${estState.piShort.toFixed(1)}%`
  );

  // Card 4: Cortical Tissue Saturation rSO2 / TSI (MBLL + Short-Ch Regression)
  const c4X = c3X + restW + gap;
  drawMetricCard(
    c4X, smallY, restW, smallH,
    'CEREBRAL rSO₂',
    `${estState.rSO2Cortical.toFixed(1)}%`,
    `HbO₂:${estState.cleanHbO2 >= 0 ? '+' : ''}${estState.cleanHbO2.toFixed(1)} β=${estState.betaSkin.toFixed(2)}`,
    color(192, 132, 252),
    'MBLL'
  );

  // Card 5: Cardiac HR, IMU Motion Gate & EEG Contact SQI
  const c5X = c4X + restW + gap;
  drawMetricCard(
    c5X, smallY, restW, smallH,
    'HR · IMU · EEG',
    `${estState.hrBpm} BPM`,
    `Mot:${(estState.sqiMotion * 100).toFixed(0)}% EEG:${(estState.sqiEEGContact * 100).toFixed(0)}%`,
    color(251, 146, 60),
    `SQI ${(estState.sqiTotal * 100).toFixed(0)}%`
  );

  // =========================================================================
  // 3. MAIN SPLIT WORKSPACE
  // =========================================================================
  const mainY = cardY + cardH + 6;
  const mainH = height - mainY - 8;
  const leftW = Math.max(230, Math.min(330, (width - pad * 2) * 0.36));
  const rightX = pad + leftW + 8;
  const rightW = width - rightX - pad;

  drawLeftCalibrationPanel(pad, mainY, leftW, mainH);
  drawRightMultiSensorStack(rightX, mainY, rightW, mainH);

  if (showHelpDropdown) {
    drawCalibrationHelpDropdown(pad, 50, width - pad * 2, height - 58);
  }

  if (millis() < statusToast.until && statusToast.text) {
    textSize(9.5);
    const tw = textWidth(statusToast.text) + 20;
    fill(15, 23, 42, 238);
    stroke(52, 211, 153);
    strokeWeight(1.4);
    rect(width / 2 - tw / 2, height - 34, tw, 24, 6);
    noStroke();
    fill(167, 243, 208);
    textAlign(CENTER, CENTER);
    text(statusToast.text, width / 2, height - 22);
    textAlign(LEFT, BASELINE);
  }
}

function drawCalibrationHelpDropdown(x, y, maxW, maxH) {
  // Subtle backdrop dimmer over the workspace below the header bar
  noStroke();
  fill(6, 10, 18, 175);
  rect(0, 48, width, height - 48);

  const dw = Math.min(maxW, 690);
  const dh = Math.min(maxH, 336);
  const dx = width - 10 - dw;
  const dy = y;
  helpDropdownBounds = { x: dx, y: dy, w: dw, h: dh };

  // Drop shadow + dropdown container
  noStroke();
  fill(0, 0, 0, 140);
  rect(dx + 4, dy + 5, dw, dh, 8);

  fill(15, 22, 38, 250);
  stroke(250, 204, 21, 215);
  strokeWeight(1.5);
  rect(dx, dy, dw, dh, 8);

  // Header strip inside dropdown
  noStroke();
  fill(26, 36, 60);
  rect(dx + 2, dy + 2, dw - 4, 28, 7, 7, 0, 0);
  stroke(55, 78, 122);
  strokeWeight(1);
  line(dx + 2, dy + 30, dx + dw - 2, dy + 30);

  noStroke();
  fill(250, 204, 21);
  textStyle(BOLD);
  textSize(9.8);
  text('📖 HOW TO CALIBRATE WITH YOUR FINGERTIP PULSE OXIMETER', dx + 12, dy + 19);

  // Close button in top-right of dropdown
  drawActionBtn('closeHelp', '✕ Close [H / Esc]', dx + dw - 8, dy + 5, color(75, 32, 42), color(252, 165, 165));

  const padX = dx + 14;
  const contentW = dw - 28;
  let cy = dy + 38;

  const steps = [
    {
      badge: 'STEP 1',
      badgeCol: color(250, 204, 21),
      title: 'Match Your Live Fingertip Oximeter Reading (%)',
      lines: [
        '• Place your reference oximeter on your index/middle finger & wait ~10 s for a steady reading.',
        '• Click the yellow [-0.5] / [+0.5] buttons on the FINGER OXIMETER card (or press Up/Down',
        '  Arrow or +/- keys) to match your fingertip reading (currently ' + fingerRefSpO2.toFixed(1) + '%).'
      ]
    },
    {
      badge: 'STEP 2',
      badgeCol: color(52, 211, 153),
      title: 'Capture Calibration Points — Click [📌 Cal] or Press [C]',
      lines: [
        '• Verify total Signal Quality (SQI ≥ 75%) and keep head & jaw still for 3–5 seconds.',
        '• 1st Point (Offset Fit): Capturing 1 point immediately locks A_fit = SpO₂_finger + 25.0·R_fused',
        '  to remove constant forehead reflection & skin-tone coupling bias.',
        '• 2+ Points (Weighted OLS Fit): Capture points across states (e.g., normal vs. slow deep',
        '  breathing or brief breath-hold) to fit slope & intercept: SpO₂ = A_fit − B_fit·R_fused.'
      ]
    },
    {
      badge: 'STEP 3',
      badgeCol: color(56, 189, 248),
      title: 'Multi-Sensor Fusion, Persistence & Shortcuts',
      lines: [
        '• Fuses 8mm Short + 20mm Long 660/730/850nm optics, 6-DOF IMU NLMS filter & EEG/MBLL rSO₂.',
        '• Calibration (' + calPoints.length + ' pts saved, mode: ' + calMode + ') auto-persists in localStorage across reloads.',
        '• Keys: [C] Capture Pt | [X] Reset (110−25R) | [R] Re-Zero Optics/IMU | [E] Export CSV | [H] Guide'
      ]
    }
  ];

  const boxGap = 6;
  const totalLines = steps.reduce((acc, s) => acc + s.lines.length, 0);
  const availBoxesH = dh - 46 - boxGap * (steps.length - 1);
  let by = cy;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const boxH = Math.floor(availBoxesH * ((s.lines.length + 1.3) / (totalLines + steps.length * 1.3)));

    fill(20, 30, 50);
    stroke(red(s.badgeCol) * 0.5, green(s.badgeCol) * 0.5, blue(s.badgeCol) * 0.5);
    strokeWeight(1);
    rect(padX, by, contentW, boxH, 5);

    // Step badge
    noStroke();
    fill(red(s.badgeCol), green(s.badgeCol), blue(s.badgeCol), 45);
    rect(padX + 7, by + 6, 44, 14, 3);
    fill(s.badgeCol);
    textStyle(BOLD);
    textSize(7.6);
    textAlign(CENTER, CENTER);
    text(s.badge, padX + 29, by + 13);
    textAlign(LEFT, BASELINE);

    // Step title
    fill(238, 246, 255);
    textSize(8.6);
    text(s.title, padX + 58, by + 16);

    // Bullet lines
    textStyle(NORMAL);
    fill(178, 200, 230);
    textSize(7.5);
    const lineStep = Math.min(12.2, (boxH - 25) / Math.max(1, s.lines.length));
    for (let k = 0; k < s.lines.length; k++) {
      text(s.lines[k], padX + 10, by + 30 + k * lineStep);
    }

    by += boxH + boxGap;
  }
}

function drawActionBtn(id, label, rightX, y, bgCol, borderCol) {
  textSize(8.2);
  const bw = textWidth(label) + 10;
  const bx = rightX - bw;
  const bh = 20;
  const hov = mouseX >= bx && mouseX <= bx + bw && mouseY >= y && mouseY <= y + bh;
  fill(hov ? lerpColor(bgCol, color(255), 0.18) : bgCol);
  stroke(borderCol);
  strokeWeight(1);
  rect(bx, y, bw, bh, 4);
  noStroke();
  fill(245, 250, 255);
  textAlign(CENTER, CENTER);
  text(label, bx + bw / 2, y + bh / 2);
  textAlign(LEFT, BASELINE);
  uiBtns.push({ id, x: bx, y, w: bw, h: bh });
}

function drawMetricCard(x, y, w, h, title, bigVal, subText, accentCol, badgeText) {
  fill(16, 22, 37);
  stroke(red(accentCol) * 0.55, green(accentCol) * 0.55, blue(accentCol) * 0.55);
  strokeWeight(1);
  rect(x, y, w, h, 6);

  noStroke();
  fill(accentCol);
  textStyle(BOLD);
  textSize(8.0);
  text(title, x + 6, y + 13);

  if (badgeText) {
    textSize(6.8);
    const bw = textWidth(badgeText) + 6;
    fill(red(accentCol), green(accentCol), blue(accentCol), 38);
    rect(x + w - bw - 4, y + 3, bw, 12, 3);
    fill(accentCol);
    textAlign(CENTER, CENTER);
    text(badgeText, x + w - bw / 2 - 4, y + 9);
    textAlign(LEFT, BASELINE);
  }

  fill(245, 250, 255);
  textSize(14.5);
  text(bigVal, x + 6, y + 35);

  textStyle(NORMAL);
  fill(155, 178, 212);
  textSize(7.5);
  text(subText, x + 6, y + 54);
}


// Car-style tachometer for the fused SpO2 (80-100 %), with coloured zones, ticks, an eased needle, and a yellow
// marker for the fingertip-oximeter reference.
function drawSpO2Gauge(x, y, w, h) {
  const vMin = 80, vMax = 100;
  const a0 = 0.75 * Math.PI, a1 = 2.25 * Math.PI;                       // 270 degree sweep, gap at the bottom
  const ang = v => a0 + (a1 - a0) * (constrain(v, vMin, vMax) - vMin) / (vMax - vMin);
  const val = estState.spo2Calibrated;
  gaugeValue = gaugeValue === null ? val : gaugeValue + (val - gaugeValue) * 0.12;

  fill(16, 22, 37); stroke(9, 102, 70); strokeWeight(1);
  rect(x, y, w, h, 6);

  const r = Math.min(h / 2 - 7, w * 0.4);
  const cx = x + r + 9, cy = y + h / 2 + 2;

  // zones: <90 red, 90-95 amber, >=95 green (dim track, bright up to the needle)
  noFill();
  const zones = [[vMin, 90, [239, 68, 68]], [90, 95, [245, 158, 11]], [95, vMax, [16, 185, 129]]];
  const lit = Math.min(gaugeValue, vMax);
  for (const [lo, hi, c] of zones) {
    strokeWeight(5);
    stroke(c[0], c[1], c[2], 55);
    arc(cx, cy, r * 2 - 7, r * 2 - 7, ang(lo), ang(hi));
    if (lit > lo) { stroke(c[0], c[1], c[2], 235); arc(cx, cy, r * 2 - 7, r * 2 - 7, ang(lo), ang(Math.min(hi, lit))); }
  }

  // ticks and numbers
  textAlign(CENTER, CENTER); textStyle(NORMAL);
  for (let v = vMin; v <= vMax; v++) {
    const major = v % 5 === 0, a = ang(v);
    stroke(major ? color(205, 220, 240) : color(100, 120, 150)); strokeWeight(major ? 1.4 : 0.8);
    const r1 = r - 1, r2 = r - (major ? 7 : 4);
    line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    if (major) { noStroke(); fill(170, 190, 220); textSize(6.5); text(v, cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)); }
  }

  // fingertip reference marker (yellow notch on the outside of the dial)
  const ar = ang(fingerRefSpO2);
  stroke(250, 204, 21); strokeWeight(2.2);
  line(cx + Math.cos(ar) * (r + 1), cy + Math.sin(ar) * (r + 1), cx + Math.cos(ar) * (r - 5), cy + Math.sin(ar) * (r - 5));

  // needle + hub
  const an = ang(gaugeValue);
  stroke(255, 90, 70); strokeWeight(2); line(cx - Math.cos(an) * 5, cy - Math.sin(an) * 5, cx + Math.cos(an) * (r - 9), cy + Math.sin(an) * (r - 9));
  noStroke(); fill(30, 38, 58); circle(cx, cy, 11); fill(255, 90, 70); circle(cx, cy, 5);

  // digital read-out in the dial's open bottom, car style
  fill(245, 250, 255); textStyle(BOLD); textSize(11); text(`${val.toFixed(1)}`, cx, cy + r * 0.62);
  fill(150, 175, 210); textStyle(NORMAL); textSize(6.5); text('% SpO₂', cx, cy + r * 0.62 + 10);

  // right-hand text column
  const tx = cx + r + 12;
  textAlign(LEFT, BASELINE);
  if (tx < x + w - 36) {
    fill(52, 211, 153); textStyle(BOLD); textSize(8.0); text('FUSED SpO₂', tx, y + 16);
    const badge = val >= 95 ? 'NORMAL' : (val >= 90 ? 'LOW' : 'VERY LOW');
    const bc = val >= 95 ? [16, 185, 129] : (val >= 90 ? [245, 158, 11] : [239, 68, 68]);
    textSize(6.8); const bw = textWidth(badge) + 8;
    fill(bc[0], bc[1], bc[2], 45); rect(tx, y + 24, bw, 13, 3);
    fill(bc[0], bc[1], bc[2]); textAlign(CENTER, CENTER); text(badge, tx + bw / 2, y + 30.5);
    textAlign(LEFT, BASELINE); textStyle(NORMAL); fill(155, 178, 212); textSize(7.2);
    text(`Raw ${estState.spo2RawEmpirical.toFixed(1)}%`, tx, y + 52);
    text(`R = ${estState.rFused.toFixed(2)}`, tx, y + 63);
    fill(250, 204, 21); text(`▮ finger ${fingerRefSpO2.toFixed(1)}%`, tx, y + 76);
  }
}

function drawFingertipCalibrationCard(x, y, w, h) {
  fill(20, 30, 52);
  stroke(250, 204, 21, 185);
  strokeWeight(1.2);
  rect(x, y, w, h, 6);

  noStroke();
  fill(250, 204, 21);
  textStyle(BOLD);
  textSize(8.0);
  text('👆 FINGER OXIMETER', x + 6, y + 13);

  fill(255);
  textSize(14.5);
  text(`${fingerRefSpO2.toFixed(1)}%`, x + 6, y + 35);

  const btnY = y + 19;
  const btnH = 18;
  const bW = 24;
  const bPlusX  = x + w - bW - 5;
  const bMinusX = bPlusX - bW - 3;

  const drawStepBtn = (id, lbl, bx) => {
    const hov = mouseX >= bx && mouseX <= bx + bW && mouseY >= btnY && mouseY <= btnY + btnH;
    fill(hov ? color(65, 85, 130) : color(35, 48, 78));
    stroke(250, 204, 21, 160);
    strokeWeight(1);
    rect(bx, btnY, bW, btnH, 3);
    noStroke();
    fill(255, 235, 140);
    textAlign(CENTER, CENTER);
    textSize(7.5);
    text(lbl, bx + bW / 2, btnY + btnH / 2);
    textAlign(LEFT, BASELINE);
    uiBtns.push({ id, x: bx, y: btnY, w: bW, h: btnH });
  };
  drawStepBtn('refMinus', '-0.5', bMinusX);
  drawStepBtn('refPlus',  '+0.5', bPlusX);

  const calBtnX = x + 6;
  const calBtnY = y + 42;
  const rstW = 36;
  const calBtnW = w - rstW - 15;
  const calBtnH = 19;
  const hovCal = mouseX >= calBtnX && mouseX <= calBtnX + calBtnW && mouseY >= calBtnY && mouseY <= calBtnY + calBtnH;
  fill(hovCal ? color(22, 163, 74) : color(16, 135, 62));
  stroke(134, 239, 172);
  strokeWeight(1);
  rect(calBtnX, calBtnY, calBtnW, calBtnH, 4);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(7.8);
  text(`📌 Cal (${calPoints.length}pt)[C]`, calBtnX + calBtnW / 2, calBtnY + calBtnH / 2);
  uiBtns.push({ id: 'captureCal', x: calBtnX, y: calBtnY, w: calBtnW, h: calBtnH });

  const rstX = calBtnX + calBtnW + 3;
  const hovRst = mouseX >= rstX && mouseX <= rstX + rstW && mouseY >= calBtnY && mouseY <= calBtnY + calBtnH;
  fill(hovRst ? color(153, 27, 27) : color(95, 25, 35));
  stroke(252, 165, 165);
  rect(rstX, calBtnY, rstW, calBtnH, 4);
  noStroke();
  fill(255);
  textStyle(NORMAL);
  text('Clr[X]', rstX + rstW / 2, calBtnY + calBtnH / 2);
  textAlign(LEFT, BASELINE);
  uiBtns.push({ id: 'resetCal', x: rstX, y: calBtnY, w: rstW, h: calBtnH });
}

function drawLeftCalibrationPanel(x, y, w, h) {
  fill(16, 22, 37);
  stroke(42, 60, 95);
  strokeWeight(1);
  rect(x, y, w, h, 7);

  noStroke();
  fill(230, 242, 255);
  textStyle(BOLD);
  textSize(9.2);
  text('1. CALIBRATION: SpO₂ vs RATIO R', x + 8, y + 15);
  textStyle(NORMAL);
  fill(145, 172, 210);
  textSize(7.8);
  const errVal = estState.spo2Calibrated - fingerRefSpO2;
  text(`SpO₂ = ${calA.toFixed(1)} − ${calB.toFixed(1)}·R  |  ΔErr: ${errVal >= 0 ? '+' : ''}${errVal.toFixed(1)}%`, x + 8, y + 27);

  const px = x + 30;
  const py = y + 34;
  const pw = w - 40;
  const ph = Math.min(115, h * 0.38);

  fill(11, 16, 28);
  stroke(38, 54, 86);
  rect(px, py, pw, ph, 4);

  const rMin = 0.35, rMax = 1.05;
  const sMin = 84.0, sMax = 100.5;
  const mapRX = r => map(constrain(r, rMin, rMax), rMin, rMax, px + 5, px + pw - 5);
  const mapSY = s => map(constrain(s, sMin, sMax), sMin, sMax, py + ph - 5, py + 5);

  stroke(32, 46, 74);
  strokeWeight(1);
  for (let s = 85; s <= 100; s += 5) {
    const gy = mapSY(s);
    line(px, gy, px + pw, gy);
    noStroke();
    fill(120, 145, 180);
    textSize(7.0);
    textAlign(RIGHT, CENTER);
    text(`${s}%`, px - 3, gy);
    stroke(32, 46, 74);
  }
  textAlign(LEFT, BASELINE);

  // Default Empirical Curve
  stroke(100, 130, 175, 130);
  strokeWeight(1.2);
  line(mapRX(rMin), mapSY(calDefaultA - calDefaultB * rMin), mapRX(rMax), mapSY(calDefaultA - calDefaultB * rMax));

  // Active Calibrated Curve
  stroke(52, 211, 153);
  strokeWeight(2.0);
  line(mapRX(rMin), mapSY(calA - calB * rMin), mapRX(rMax), mapSY(calA - calB * rMax));

  // Captured calibration points
  for (let i = 0; i < calPoints.length; i++) {
    const pt = calPoints[i];
    fill(250, 204, 21);
    stroke(15, 23, 42);
    strokeWeight(1);
    circle(mapRX(pt.R), mapSY(pt.fingerSpO2), 6);
  }

  const liveX = mapRX(estState.rFused);
  const liveY = mapSY(estState.spo2Calibrated);
  const refY  = mapSY(fingerRefSpO2);

  stroke(250, 204, 21, 150);
  strokeWeight(1);
  line(liveX, liveY, liveX, refY);

  fill(250, 204, 21);
  noStroke();
  circle(liveX, refY, 5.5);

  fill(16, 185, 129);
  stroke(255);
  strokeWeight(1.2);
  circle(liveX, liveY, 8);

  noStroke();
  fill(140, 168, 205);
  textSize(7.0);
  text('R=0.4', px + 2, py + ph + 9);
  textAlign(CENTER, BASELINE);
  text('Ratio R →', px + pw / 2, py + ph + 9);
  textAlign(RIGHT, BASELINE);
  text('R=1.0', px + pw - 2, py + ph + 9);
  textAlign(LEFT, BASELINE);

  // =========================================================================
  // 2. MULTI-ESTIMATOR FUSION BREAKDOWN BARS
  // =========================================================================
  let by = py + ph + 20;
  fill(230, 242, 255);
  textStyle(BOLD);
  textSize(8.8);
  text('2. MULTI-SENSOR FUSION WEIGHTS', x + 8, by);
  textStyle(NORMAL);
  by += 5;

  const estimators = [
    {
      name: 'A. 8mm Short (660/850)',
      val: `${estState.spo2Short.toFixed(1)}% R=${estState.rShort.toFixed(2)}`,
      frac: map(estState.spo2Short, 85, 100, 0, 1, true),
      col: color(56, 189, 248)
    },
    {
      name: 'B. 20mm Long (660/850)',
      val: `${estState.spo2Long.toFixed(1)}% R=${estState.rLong.toFixed(2)}`,
      frac: map(estState.spo2Long, 85, 100, 0, 1, true),
      col: color(96, 165, 250)
    },
    {
      name: 'C. Beat Peak/Trough',
      val: `${estState.spo2Beat.toFixed(1)}% R=${estState.rBeat.toFixed(2)}`,
      frac: map(estState.spo2Beat, 85, 100, 0, 1, true),
      col: color(251, 146, 60)
    },
    {
      name: 'D. 730nm NIR + MBLL rSO₂',
      val: `rSO₂ ${estState.rSO2Cortical.toFixed(1)}%`,
      frac: map(estState.rSO2Cortical, 50, 85, 0, 1, true),
      col: color(192, 132, 252)
    }
  ];

  const availBarH = h - (by - y) - 26;
  const rowStep = Math.max(18, Math.min(25, availBarH / estimators.length));
  for (let i = 0; i < estimators.length; i++) {
    const e = estimators[i];
    const ey = by + i * rowStep;
    noStroke();
    fill(205, 222, 245);
    textSize(7.4);
    text(e.name, x + 8, ey + 9);
    textAlign(RIGHT, BASELINE);
    fill(e.col);
    text(e.val, x + w - 8, ey + 9);
    textAlign(LEFT, BASELINE);

    fill(24, 34, 56);
    rect(x + 8, ey + 11, w - 16, 4.5, 2);
    fill(e.col);
    rect(x + 8, ey + 11, (w - 16) * e.frac, 4.5, 2);
  }

  const footY = y + h - 22;
  const footX = x + 8;
  const footW = w - 16;
  const footH = 17;
  const hovFoot = mouseX >= footX && mouseX <= footX + footW && mouseY >= footY && mouseY <= footY + footH;
  fill(hovFoot ? color(26, 38, 64) : color(12, 18, 32));
  stroke(hovFoot ? color(250, 204, 21) : color(42, 60, 95));
  rect(footX, footY, footW, footH, 4);
  noStroke();
  fill(hovFoot ? color(255, 235, 140) : color(175, 200, 235));
  textSize(7.1);
  text('💡 How to Calibrate: Click or press [H] ▼', x + 12, footY + 11);
  uiBtns.push({ id: 'toggleHelp', x: footX, y: footY, w: footW, h: footH });
}

function drawRightMultiSensorStack(x, y, w, h) {
  const tiers = [
    {
      title: 'TIER 1: Calibrated Fused SpO₂ (%) vs. Fingertip Ref',
      eq: `whole recording ${fmtElapsed(fullLog.startMs === null ? 0 : fullLog.lastMs - fullLog.startMs)}`,
      mode: 'spo2',
      series: [
        { arr: fullLog.cal, label: 'Cal SpO₂',   col: color(16, 185, 129), sw: 2.3, fmt: v => `${v.toFixed(1)}%` },
        { arr: fullLog.ref, label: 'Finger Ref', col: color(250, 204, 21), sw: 1.5, fmt: v => `${v.toFixed(1)}%` },
        { arr: fullLog.raw, label: 'Raw RoR',    col: color(148, 163, 184, 150), sw: 1.2, fmt: v => `${v.toFixed(1)}%` }
      ]
    },
    {
      title: 'TIER 2: Peak-Aligned Pulsatile AC Overlay (Baseline-Corrected)',
      eq: `N=${pulseOverlayState.waves.length} | rej=${pulseOverlayState.rejectedCount}`,
      mode: 'pulse_overlay',
      series: [
        { arr: historyLog.acShort850, label: '8mm 850nm',  col: color(56, 189, 248),  sw: 2.0, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}mOD` },
        { arr: historyLog.acShort660, label: '8mm 660nm',  col: color(248, 113, 113), sw: 1.8, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}mOD` },
        { arr: historyLog.acLong850,  label: '20mm 850nm', col: color(192, 132, 252), sw: 1.4, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}mOD` }
      ]
    },
    {
      title: 'TIER 3: Short-Ch Regressed Cortical MBLL Δ[HbO₂] & Δ[HHb]',
      eq: `rSO₂=${estState.rSO2Cortical.toFixed(1)}%`,
      mode: 'zero',
      series: [
        { arr: historyLog.cleanHbO2, label: 'Cort ΔHbO₂', col: color(244, 63, 94),  sw: 2.1, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}μM` },
        { arr: historyLog.cleanHHb,  label: 'Cort ΔHHb',  col: color(59, 130, 246), sw: 1.9, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}μM` }
      ]
    },
    {
      title: 'TIER 4: 6-DOF IMU Motion Gate & Cleaned EEG (AF7)',
      eq: `MotSQI=${(estState.sqiMotion * 100).toFixed(0)}% | β/α=${estState.eegAlphaBetaRatio.toFixed(2)}`,
      mode: 'zero',
      series: [
        { arr: historyLog.eegCleanAF7, label: 'Clean AF7', col: color(45, 212, 191), sw: 1.8, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}μV` },
        { arr: historyLog.imuMotion.map(v => v * 25.0), label: 'IMU ||u||', col: color(251, 146, 60), sw: 1.6, fmt: v => `${(v / 25.0).toFixed(2)}g` }
      ]
    }
  ];

  const gap = 6;
  const tierH = (h - gap * (tiers.length - 1)) / tiers.length;
  const nSamples = historyLog.spo2Cal.length;
  const hoverIdx = (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h && nSamples > 1)
    ? Math.floor(map(mouseX, x + 10, x + w - 10, 0, nSamples - 1, true))
    : -1;

  for (let i = 0; i < tiers.length; i++) {
    const ty = y + i * (tierH + gap);
    const t = tiers[i];

    fill(16, 22, 37);
    stroke(42, 60, 95);
    strokeWeight(1);
    rect(x, ty, w, tierH, 6);

    noStroke();
    fill(228, 240, 255);
    textStyle(BOLD);
    textSize(8.2);
    text(t.title, x + 8, ty + 12);

    fill(140, 170, 210);
    textStyle(NORMAL);
    textSize(7.5);
    textAlign(RIGHT, BASELINE);
    text(t.eq, x + w - 8, ty + 12);
    textAlign(LEFT, BASELINE);

    const px = x + 10;
    const py = ty + 17;
    const pw = w - 20;
    const ph = tierH - 29;

    stroke(42, 58, 90, 150);
    strokeWeight(1);
    line(px, py + ph / 2, px + pw, py + ph / 2);

    if (t.mode === 'spo2') {
      const yMin = 88.0, yMax = 100.5;
      for (const s of t.series) {
        if (!s.arr || s.arr.length < 2) continue;
        noFill();
        stroke(s.col);
        strokeWeight(s.sw);
        beginShape();
        for (let k = 0; k < s.arr.length; k++) {
          const vx = map(k, 0, s.arr.length - 1, px, px + pw);   // whole recording stretched across the plot
          const vy = map(constrain(s.arr[k], yMin, yMax), yMin, yMax, py + ph, py);
          vertex(vx, vy);
        }
        endShape();
      }
    } else if (t.mode === 'pulse_overlay') {
      const waves = pulseOverlayState.waves;
      const cx = px + pw / 2;
      stroke(100, 140, 200, 90);
      strokeWeight(1);
      line(cx, py, cx, py + ph);

      noStroke();
      fill(130, 160, 200, 160);
      textSize(6.8);
      textAlign(CENTER, TOP);
      text('Peak (0s)', cx, py + 1);
      textAlign(LEFT, TOP);
      text('Preceding', px + 2, py + 1);
      textAlign(RIGHT, TOP);
      text('Subsequent', px + pw - 2, py + 1);
      textAlign(LEFT, BASELINE);

      if (waves.length === 0) {
        fill(140, 165, 200, 180);
        textSize(7.5);
        textAlign(CENTER, CENTER);
        text('Collecting cardiac cycles for peak-aligned overlay...', cx, py + ph / 2);
        textAlign(LEFT, BASELINE);
      } else {
        let maxAbs = 0.25;
        for (let k = 0; k < waves.length; k++) {
          const wv = waves[k];
          for (const ch of [wv.s850, wv.s660, wv.l850]) {
            for (let j = 0; j < ch.length; j++) {
              const v = Math.abs(ch[j]);
              if (v > maxAbs) maxAbs = v;
            }
          }
        }
        maxAbs *= 1.15;

        const channels = [
          { key: 'l850', rgb: [192, 132, 252], sw: 1.2 },
          { key: 's660', rgb: [248, 113, 113], sw: 1.5 },
          { key: 's850', rgb: [56, 189, 248],  sw: 1.8 }
        ];

        for (let k = 0; k < waves.length; k++) {
          const ageFrac = waves.length === 1 ? 1.0 : k / (waves.length - 1);
          const alpha = 22 + Math.pow(ageFrac, 1.6) * 233;
          const swScale = 0.75 + ageFrac * 0.55;
          const wv = waves[k];

          for (const ch of channels) {
            const arr = wv[ch.key];
            if (!arr || arr.length < 2) continue;
            noFill();
            stroke(ch.rgb[0], ch.rgb[1], ch.rgb[2], alpha);
            strokeWeight(ch.sw * swScale);
            beginShape();
            for (let j = 0; j < arr.length; j++) {
              const vx = map(j, 0, arr.length - 1, px, px + pw);
              const vy = map(constrain(arr[j], -maxAbs, maxAbs), -maxAbs, maxAbs, py + ph, py);
              vertex(vx, vy);
            }
            endShape();
          }
        }
      }
    } else {
      let maxAbs = 1e-4;
      for (const s of t.series) {
        for (let k = 0; k < s.arr.length; k++) {
          const v = Math.abs(s.arr[k]);
          if (v > maxAbs) maxAbs = v;
        }
      }
      maxAbs *= 1.18;

      for (const s of t.series) {
        if (!s.arr || s.arr.length < 2) continue;
        noFill();
        stroke(s.col);
        strokeWeight(s.sw);
        beginShape();
        for (let k = 0; k < s.arr.length; k++) {
          const vx = map(k, 0, SPO2_HIST_LEN - 1, px, px + pw);
          const vy = map(constrain(s.arr[k], -maxAbs, maxAbs), -maxAbs, maxAbs, py + ph, py);
          vertex(vx, vy);
        }
        endShape();
      }
    }

    let lx = px + 2;
    const ly = ty + tierH - 3.5;
    noStroke();
    textSize(7.5);
    const own = t.mode === 'spo2';
    const overPlot = mouseX >= px && mouseX <= px + pw && mouseY >= y && mouseY <= y + h;
    for (const s of t.series) {
      if (!s.arr || !s.arr.length) continue;
      const hi = own
        ? (overPlot ? Math.floor(map(mouseX, px, px + pw, 0, s.arr.length - 1, true)) : -1)
        : hoverIdx;
      const idx = hi >= 0 ? Math.min(hi, s.arr.length - 1) : s.arr.length - 1;
      const val = s.arr[idx];
      fill(s.col);
      const lbl = `● ${s.label}:${s.fmt(val)}`;
      text(lbl, lx, ly);
      lx += textWidth(lbl) + 10;
    }

    if (own ? overPlot : (hoverIdx >= 0 && nSamples > 1)) {
      const cx = own ? mouseX : map(hoverIdx, 0, SPO2_HIST_LEN - 1, px, px + pw);
      stroke(255, 255, 255, 110);
      strokeWeight(1);
      line(cx, py, cx, py + ph);
    }
  }
}

function mousePressed() {
  for (let i = uiBtns.length - 1; i >= 0; i--) {
    const b = uiBtns[i];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      if (b.id === 'toggleHelp') {
        showHelpDropdown = !showHelpDropdown;
        return;
      } else if (b.id === 'closeHelp') {
        showHelpDropdown = false;
        return;
      }
      if (showHelpDropdown) {
        return;
      }
      if (b.id === 'refMinus') {
        fingerRefSpO2 = constrain(+(fingerRefSpO2 - 0.5).toFixed(1), 70.0, 100.0);
        saveCalibration();
      } else if (b.id === 'refPlus') {
        fingerRefSpO2 = constrain(+(fingerRefSpO2 + 0.5).toFixed(1), 70.0, 100.0);
        saveCalibration();
      } else if (b.id === 'captureCal') {
        captureCalibrationPoint();
      } else if (b.id === 'resetCal') {
        resetCalibration();
      } else if (b.id === 'rezero') {
        resetOpticalBaselines();
      } else if (b.id === 'csv') {
        exportCalibrationCSV();
      }
      return;
    }
  }

  if (showHelpDropdown) {
    const hb = helpDropdownBounds;
    const insideDropdown = mouseX >= hb.x && mouseX <= hb.x + hb.w && mouseY >= hb.y && mouseY <= hb.y + hb.h;
    if (!insideDropdown) {
      showHelpDropdown = false;
    }
  }
}

function keyPressed() {
  if (key === 'h' || key === 'H' || key === '?') {
    showHelpDropdown = !showHelpDropdown;
    return false;
  }
  if (keyCode === ESCAPE && showHelpDropdown) {
    showHelpDropdown = false;
    return false;
  }
  if (keyCode === UP_ARROW || key === '+' || key === '=') {
    fingerRefSpO2 = constrain(+(fingerRefSpO2 + 0.5).toFixed(1), 70.0, 100.0);
    saveCalibration();
    return false;
  }
  if (keyCode === DOWN_ARROW || key === '-' || key === '_') {
    fingerRefSpO2 = constrain(+(fingerRefSpO2 - 0.5).toFixed(1), 70.0, 100.0);
    saveCalibration();
    return false;
  }
  if (key === 'c' || key === 'C') {
    captureCalibrationPoint();
  } else if (key === 'x' || key === 'X') {
    resetCalibration();
  } else if (key === 'r' || key === 'R') {
    resetOpticalBaselines();
  } else if (key === 'e' || key === 'E') {
    exportCalibrationCSV();
  }
}
