// Comprehensive empirical verification of updateEEGImuMotionFilter and motionFilterWeights in index.html
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function createInstance() {
  const startIdx = html.indexOf('let eegData = {');
  const endIdx = html.indexOf('window.eegData = eegData;');
  const code = html.slice(startIdx, endIdx);

  const sandbox = {
    window: {},
    document: {
      createElement: () => ({ href: '', download: '', click: () => {} }),
      body: { appendChild: () => {}, removeChild: () => {} }
    },
    URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
    console: console,
    setTimeout: setTimeout
  };
  vm.createContext(sandbox);
  return vm.runInContext(code + '\n; eegData;', sandbox);
}

console.log('=== TEST 1: Dual-Key motionFilterWeights Indexing & Listing 5 Compliance ===');
const eegData = createInstance();

const chNames = ['TP9', 'AF7', 'AF8', 'TP10'];
let passInit = true;
for (let ch = 0; ch < 4; ch++) {
  const byNum = eegData.motionFilterWeights[ch];
  const byStr = eegData.motionFilterWeights[chNames[ch]];
  if (!Array.isArray(byNum) || !Array.isArray(byStr)) {
    console.error(`  FAIL: Missing array for channel index ${ch} / '${chNames[ch]}'`);
    passInit = false;
  } else if (byNum.length !== 6 || byStr.length !== 6) {
    console.error(`  FAIL: Array length not 6 for channel index ${ch}`);
    passInit = false;
  } else if (byNum !== byStr) {
    console.error(`  FAIL: Numeric and string keys do not reference identical array for channel ${ch}`);
    passInit = false;
  }
}
if (passInit) {
  console.log('  PASS: motionFilterWeights supports both integer (0..3) and string keys (TP9..TP10) referencing the same arrays.');
}

// Listing 5 execution test
console.log('\nExecuting Listing 5 pattern from paper2_brainimation.tex / manuscript.md:');
try {
  let linAx = 0.5, linAy = -0.2, linAz = 0.8, gx = 15.0, gy = -25.0, gz = 8.0;
  let u = [0.25 * linAx, 0.25 * linAy, 0.25 * linAz, gx / 80, gy / 80, gz / 80];
  let normU = u.reduce((sum, v) => sum + v * v, 0) + 1e-4;

  for (let ch = 0; ch < 4; ch++) {
    let w = eegData.motionFilterWeights[ch];
    let estArtifact = 0;
    for (let i = 0; i < 6; i++) estArtifact += w[i] * u[i];
    let cleanEEG = (eegData.raw ? eegData.raw[ch] : 20.0) - estArtifact;

    for (let i = 0; i < 6; i++) {
      w[i] = 0.9992 * w[i] + (0.035 * cleanEEG * u[i]) / normU;
    }
    eegData.clean[ch] = cleanEEG;
  }
  console.log('  PASS: Listing 5 pattern ran cleanly without TypeError.');
} catch (err) {
  console.error('  FAIL: Listing 5 threw error:', err);
  process.exit(1);
}

// Dual-key persistence across live updates
console.log('\nTesting dual-key persistence across 200 updateEEGImuMotionFilter iterations:');
eegData.linearAccel = { x: 1.2, y: -0.8, z: 0.5 };
eegData.gyro = { x: 45.0, y: -30.0, z: 12.0 };
for (let iter = 0; iter < 200; iter++) {
  eegData.updateEEGImuMotionFilter([15.0, 25.0, -10.0, 18.0]);
}
for (let ch = 0; ch < 4; ch++) {
  if (eegData.motionFilterWeights[ch] !== eegData.motionFilterWeights[chNames[ch]]) {
    console.error(`  FAIL: Dual-key mapping broke after update at channel ${ch}`);
    process.exit(1);
  }
}
console.log('  PASS: Dual-key mapping strictly preserved across 200 live filter updates.');

console.log('\n=== TEST 2: NLMS Filter Convergence & Artifact Suppression ===');

// Aligned simulation matching Figure 5D & Section 3.3
const fs_eeg = 256.0;
const N_eeg = Math.round(4.0 * fs_eeg); // 1024 samples (4.0 s)
const t_eeg = Array.from({ length: N_eeg }, (_, i) => i / fs_eeg);

function pseudoNormal(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const u1 = Math.max(1e-7, s / 4294967296);
    s = (s * 1664525 + 1013904223) % 4294967296;
    const u2 = s / 4294967296;
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };
}
const rng = pseudoNormal(2026);

const true_eeg = t_eeg.map(t => {
  return 18.0 * Math.sin(2 * Math.PI * 10.0 * t)
       + 9.0 * Math.sin(2 * Math.PI * 21.0 * t + 0.5)
       + 3.2 * rng();
});

// Normalized IMU reference basis u(t) = [ax, ay, az, gx, gy, gz]
const u_imu = t_eeg.map(t => {
  return [
    Math.sin(2 * Math.PI * 1.35 * t),
    Math.cos(2 * Math.PI * 1.35 * t),
    0.6 * Math.sin(2 * Math.PI * 2.70 * t + 0.3),
    Math.cos(2 * Math.PI * 1.35 * t + 0.2),
    -Math.sin(2 * Math.PI * 1.35 * t + 0.2),
    0.5 * Math.cos(2 * Math.PI * 0.90 * t)
  ];
});

// Motion coupling weights from Figure 5D benchmark: produces +/- 85 uV motion swings
const w_true = [42.0, -28.0, 19.0, 36.0, -24.0, 14.0];
const raw_corrupted = t_eeg.map((_, i) => {
  const u = u_imu[i];
  let art = 0;
  for (let k = 0; k < 6; k++) art += w_true[k] * u[k];
  return true_eeg[i] + art;
});

// Fresh eegData instance starting from zeros on AF7 (channel index 1)
const eegFilter = createInstance();
eegFilter.motionFilterWeights.AF7 = [0, 0, 0, 0, 0, 0];
eegFilter.motionFilterWeights[1]   = eegFilter.motionFilterWeights.AF7;

const clean_output = [];
for (let i = 0; i < N_eeg; i++) {
  const u = u_imu[i];
  // Convert normalized basis to physical sensor units so updateEEGImuMotionFilter applies aligned scaling:
  // xVec[0..2] = linearAccel * 0.25 -> linearAccel = u / 0.25
  // xVec[3..5] = gyro / 80.0 -> gyro = u * 80.0
  eegFilter.linearAccel = { x: u[0] / 0.25, y: u[1] / 0.25, z: u[2] / 0.25 };
  eegFilter.gyro = { x: u[3] * 80.0, y: u[4] * 80.0, z: u[5] * 80.0 };

  eegFilter.updateEEGImuMotionFilter([0, raw_corrupted[i], 0, 0]);
  clean_output.push(eegFilter.clean[1]);
}

// Steady-state evaluation (samples 128..1024, i.e. t = 0.5s .. 4.0s)
const ss_start = 128;
let sumSqRaw = 0, sumSqClean = 0;
const nSS = N_eeg - ss_start;
for (let i = ss_start; i < N_eeg; i++) {
  const eR = raw_corrupted[i] - true_eeg[i];
  const eC = clean_output[i] - true_eeg[i];
  sumSqRaw += eR * eR;
  sumSqClean += eC * eC;
}

const rmseRaw = Math.sqrt(sumSqRaw / nSS);
const rmseClean = Math.sqrt(sumSqClean / nSS);
const suppDb = 20.0 * Math.log10(rmseRaw / Math.max(1e-6, rmseClean));

let meanTrue = 0, meanRaw = 0, meanClean = 0;
for (let i = ss_start; i < N_eeg; i++) {
  meanTrue += true_eeg[i]; meanRaw += raw_corrupted[i]; meanClean += clean_output[i];
}
meanTrue /= nSS; meanRaw /= nSS; meanClean /= nSS;

let covRaw = 0, covClean = 0, varTrue = 0, varRaw = 0, varClean = 0;
for (let i = ss_start; i < N_eeg; i++) {
  const dt = true_eeg[i] - meanTrue;
  const dr = raw_corrupted[i] - meanRaw;
  const dc = clean_output[i] - meanClean;
  covRaw += dt * dr; covClean += dt * dc;
  varTrue += dt * dt; varRaw += dr * dr; varClean += dc * dc;
}
const rRaw = covRaw / Math.sqrt(varTrue * varRaw);
const rClean = covClean / Math.sqrt(varTrue * varClean);

console.log('Continuous Head-Movement Simulation Results:');
console.log(`  Raw Corrupted RMSE:   ${rmseRaw.toFixed(1)} uV (Benchmark: ~43.7 uV)`);
console.log(`  Cleaned EEG RMSE:     ${rmseClean.toFixed(1)} uV (Benchmark: ~5.5 uV)`);
console.log(`  Artifact Suppression: ${suppDb.toFixed(1)} dB (Benchmark: ~17.9 dB, Expect >15 dB)`);
console.log(`  Correlation:          r_raw = ${rRaw.toFixed(2)} -> r_clean = ${rClean.toFixed(2)} (Expect >0.90)`);

// Test with Head-Motion Impulses (discrete nodding / jerking spikes)
console.log('\nHead-Motion Impulses (Discrete Nod/Tilt Jerks):');
const eegImpulse = createInstance();
eegImpulse.motionFilterWeights.AF7 = [0, 0, 0, 0, 0, 0];
eegImpulse.motionFilterWeights[1]   = eegImpulse.motionFilterWeights.AF7;

const u_impulse = t_eeg.map(t => {
  let [ax, ay, az, gx, gy, gz] = [
    Math.sin(2 * Math.PI * 1.35 * t),
    Math.cos(2 * Math.PI * 1.35 * t),
    0.6 * Math.sin(2 * Math.PI * 2.70 * t + 0.3),
    Math.cos(2 * Math.PI * 1.35 * t + 0.2),
    -Math.sin(2 * Math.PI * 1.35 * t + 0.2),
    0.5 * Math.cos(2 * Math.PI * 0.90 * t)
  ];
  // Gaussian head-jerk bursts at t = 1.2s and t = 2.5s
  const j1 = Math.exp(-Math.pow((t - 1.2) / 0.08, 2));
  const j2 = Math.exp(-Math.pow((t - 2.5) / 0.06, 2));
  ax += 2.5 * j1; gx += 3.0 * j1;
  ay += 2.0 * j2; gy -= 2.5 * j2;
  return [ax, ay, az, gx, gy, gz];
});

const raw_impulse = t_eeg.map((_, i) => {
  const u = u_impulse[i];
  let art = 0;
  for (let k = 0; k < 6; k++) art += w_true[k] * u[k];
  return true_eeg[i] + art;
});

const clean_impulse = [];
for (let i = 0; i < N_eeg; i++) {
  const u = u_impulse[i];
  eegImpulse.linearAccel = { x: u[0] / 0.25, y: u[1] / 0.25, z: u[2] / 0.25 };
  eegImpulse.gyro = { x: u[3] * 80.0, y: u[4] * 80.0, z: u[5] * 80.0 };
  eegImpulse.updateEEGImuMotionFilter([0, raw_impulse[i], 0, 0]);
  clean_impulse.push(eegImpulse.clean[1]);
}

let sumSqRawImp = 0, sumSqCleanImp = 0;
for (let i = ss_start; i < N_eeg; i++) {
  const eR = raw_impulse[i] - true_eeg[i];
  const eC = clean_impulse[i] - true_eeg[i];
  sumSqRawImp += eR * eR; sumSqCleanImp += eC * eC;
}
const rmseRawImp = Math.sqrt(sumSqRawImp / nSS);
const rmseCleanImp = Math.sqrt(sumSqCleanImp / nSS);
const suppDbImp = 20.0 * Math.log10(rmseRawImp / Math.max(1e-6, rmseCleanImp));
console.log(`  Impulse Raw RMSE:     ${rmseRawImp.toFixed(1)} uV`);
console.log(`  Impulse Clean RMSE:   ${rmseCleanImp.toFixed(1)} uV`);
console.log(`  Impulse Suppression:  ${suppDbImp.toFixed(1)} dB`);

console.log('\n=== TEST 3: Adversarial Edge Cases & Numerical Stability ===');

// 1. Quiescent Headband (zero motion, u = 0): Check epsilon = 1e-4 prevents NaN
const eegZero = createInstance();
eegZero.linearAccel = { x: 0, y: 0, z: 0 };
eegZero.gyro = { x: 0, y: 0, z: 0 };
eegZero.updateEEGImuMotionFilter([20.0, 20.0, 20.0, 20.0]);
const zeroClean = eegZero.clean[1];
const zeroHasNaN = Object.values(eegZero.motionFilterWeights).some(arr => arr.some(v => isNaN(v)));
console.log(`  Zero-motion (u=0) epsilon check: clean = ${zeroClean.toFixed(2)} uV, NaN = ${zeroHasNaN} (PASS: ${!zeroHasNaN})`);

// 2. Violent Head Motion Clamping (10g accel, 1000 deg/s rotation): Check weight clamp [-28, 28]
const eegViolent = createInstance();
eegViolent.linearAccel = { x: 98.1, y: -98.1, z: 98.1 };
eegViolent.gyro = { x: 1000.0, y: -1000.0, z: 1000.0 };
for (let step = 0; step < 50; step++) {
  eegViolent.updateEEGImuMotionFilter([150.0, -150.0, 150.0, -150.0]);
}
const maxWeight = Math.max(...Object.values(eegViolent.motionFilterWeights).flatMap(arr => arr.map(Math.abs)));
console.log(`  Violent motion clamping: max |w| = ${maxWeight.toFixed(2)} <= 28.0 (PASS: ${maxWeight <= 28.0})`);

// 3. Negative raw EEG sample handling
const eegNeg = createInstance();
eegNeg.linearAccel = { x: 0.1, y: 0.1, z: 0.1 };
eegNeg.gyro = { x: 5.0, y: 5.0, z: 5.0 };
eegNeg.updateEEGImuMotionFilter([0, -120.0, 0, 0]);
console.log(`  Negative raw EEG handling: clean = ${eegNeg.clean[1].toFixed(2)} uV (PASS: finite: ${isFinite(eegNeg.clean[1])})`);

const pass = (passInit && suppDb > 15.0 && rClean > 0.90 && maxWeight <= 28.0 && !zeroHasNaN);
if (pass) {
  console.log('\n>>> NLMS ADAPTIVE MOTION FILTER EMPIRICAL VERIFICATION: ALL CHECKS PASSED <<<');
} else {
  console.error('\n>>> NLMS ADAPTIVE MOTION FILTER EMPIRICAL VERIFICATION: FAILED <<<');
  process.exit(1);
}
