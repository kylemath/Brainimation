// Comprehensive empirical verification of updateShortChannelRegression in index.html
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function createInstance(isOld = false) {
  const startIdx = html.indexOf('let eegData = {');
  const endIdx = html.indexOf('window.eegData = eegData;');
  let code = html.slice(startIdx, endIdx);

  if (isOld) {
    // Revert to old 0.015 adaptBase and rolling mean subtraction
    code = code.replace(
      'return 0.9995 * prev + 0.0005 * cur;',
      'return 0.985 * prev + 0.015 * cur;'
    );
    code = code.replace(
      'let sOD850 = rawSOD850;\n          let sOD660 = rawSOD660;\n          let lOD850 = rawLOD850;\n          let lOD660 = rawLOD660;',
      'let sOD850 = rawSOD850 - mS850;\n          let sOD660 = rawSOD660 - mS660;\n          let lOD850 = rawLOD850 - mL850;\n          let lOD660 = rawLOD660 - mL660;'
    );
  }

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

const fs_ppg = 64.0;
const N = Math.round(30.0 * fs_ppg); // 30 seconds = 1920 samples
const t = Array.from({ length: N }, (_, i) => i / fs_ppg);

// Standard 0.5s moving average (32 samples) to remove 1.18 Hz cardiac pulse ripple from hemodynamic traces
function smoothWindow(arr, wLen = 32) {
  return arr.map((_, idx) => {
    const s = Math.max(0, idx - Math.floor(wLen / 2));
    const e = Math.min(arr.length, idx + Math.ceil(wLen / 2));
    let sum = 0;
    for (let j = s; j < e; j++) sum += arr[j];
    return sum / (e - s);
  });
}

function runBlockSimulation(t_onset, t_peak, duration, desc) {
  const eegUpdated = createInstance(false);
  const eegOld = createInstance(true);

  // 10-second hemodynamic response peaking at t_peak with amplitude 5.0 uM
  const cortical_hbo2 = t.map(time => {
    if (time < t_onset || time > t_onset + duration + 4.0) return 0;
    const tau = time - t_onset;
    const p = t_peak - t_onset;
    if (p <= 0) return 0;
    const alpha = 3.0;
    const beta = p / alpha;
    const val = Math.pow(tau, alpha) * Math.exp(-tau / beta);
    const maxVal = Math.pow(p, alpha) * Math.exp(-alpha);
    return (val / maxVal) * 5.0;
  });
  const cortical_hhb = cortical_hbo2.map(v => -0.35 * v);

  // High-frequency skin blood flow interference (cardiac 1.18 Hz, respiration 0.26 Hz, Mayer 0.10 Hz)
  const skin_hbo2 = t.map(time => {
    return 1.45 * Math.sin(2 * Math.PI * 1.18 * time)
         + 0.55 * Math.sin(2 * Math.PI * 0.26 * time + 0.3)
         + 1.10 * Math.sin(2 * Math.PI * 0.10 * time + 0.7);
  });
  const skin_hhb = skin_hbo2.map(v => -0.25 * v);

  const true_beta = 0.80;
  const long_hbo2 = cortical_hbo2.map((c, i) => c + true_beta * skin_hbo2[i]);
  const long_hhb = cortical_hhb.map((c, i) => c + true_beta * skin_hhb[i]);

  const a11 = 0.3196 * 13.0, a12 = 3.2266 * 13.0;
  const a21 = 1.0580 * 11.6, a22 = 0.6913 * 11.6;

  const recUpdated = [];
  const recOld = [];

  for (let i = 0; i < N; i++) {
    const dOD_850_l = (a21 * (long_hbo2[i] / 1000.0) + a22 * (long_hhb[i] / 1000.0));
    const dOD_660_l = (a11 * (long_hbo2[i] / 1000.0) + a12 * (long_hhb[i] / 1000.0));

    const dOD_850_s = (a21 * (skin_hbo2[i] / 1000.0) + a22 * (skin_hhb[i] / 1000.0));
    const dOD_660_s = (a11 * (skin_hbo2[i] / 1000.0) + a12 * (skin_hhb[i] / 1000.0));

    const longIR = 185000 * Math.exp(-dOD_850_l);
    const longRed = 162000 * Math.exp(-dOD_660_l);
    const shortIR = 185000 * Math.exp(-dOD_850_s);
    const shortRed = 162000 * Math.exp(-dOD_660_s);

    eegUpdated.updateShortChannelRegression(shortIR, shortRed, shortIR, 12000, longIR, longRed, longIR, 12000, true);
    recUpdated.push(eegUpdated.fnirsRegression.cleanHbO2);

    eegOld.updateShortChannelRegression(shortIR, shortRed, shortIR, 12000, longIR, longRed, longIR, 12000, true);
    recOld.push(eegOld.fnirsRegression.cleanHbO2);
  }

  const smoothedUpdated = smoothWindow(recUpdated, 32);
  const smoothedOld = smoothWindow(recOld, 32);

  const winStart = Math.round((t_peak - 1.0) * fs_ppg);
  const winEnd = Math.round((t_peak + 1.0) * fs_ppg);

  const peakUpdated = Math.max(...smoothedUpdated.slice(winStart, winEnd));
  const peakOld = Math.max(...smoothedOld.slice(winStart, winEnd));

  const attenUpdated = ((5.0 - peakUpdated) / 5.0) * 100;
  const attenOld = ((5.0 - peakOld) / 5.0) * 100;

  // Correlation r(clean, true) across block
  const meanTrue = cortical_hbo2.reduce((s, v) => s + v, 0) / N;
  const meanUp = smoothedUpdated.reduce((s, v) => s + v, 0) / N;
  const meanOld = smoothedOld.reduce((s, v) => s + v, 0) / N;

  let covUp = 0, covOld = 0, varTrue = 0, varUp = 0, varOld = 0;
  for (let i = 0; i < N; i++) {
    const dt = cortical_hbo2[i] - meanTrue;
    const du = smoothedUpdated[i] - meanUp;
    const do_ = smoothedOld[i] - meanOld;
    covUp += dt * du;
    covOld += dt * do_;
    varTrue += dt * dt;
    varUp += du * du;
    varOld += do_ * do_;
  }
  const rUp = covUp / Math.sqrt(varTrue * varUp);
  const rOld = covOld / Math.sqrt(varTrue * varOld);

  console.log(`\n=== ${desc} ===`);
  console.log(`  True Cortical HRF Peak: 5.000 uM at t = ${t_peak.toFixed(1)} s`);
  console.log(`  Updated Filter Peak:   ${peakUpdated.toFixed(3)} uM | Attenuation: ${attenUpdated.toFixed(2)}% (<10%: ${attenUpdated < 10.0 ? 'PASS' : 'FAIL'})`);
  console.log(`  Old Filter Peak:       ${peakOld.toFixed(3)} uM | Attenuation: ${attenOld.toFixed(2)}% (>60%: ${attenOld > 60.0 ? 'PASS' : 'FAIL'})`);
  console.log(`  Waveform Correlation:  Updated r = ${rUp.toFixed(3)} | Old r = ${rOld.toFixed(3)}`);

  return { attenUpdated, attenOld, rUp, rOld };
}

console.log('--- EMPIRICAL TEST SUITE: updateShortChannelRegression ---');
// Scenario 1: Standard cognitive task block with onset at t = 1.0 s, peaking at t = 6.0 s (5 s post-onset), duration 10 s
const r1 = runBlockSimulation(1.0, 6.0, 10.0, 'Scenario 1: Onset at t = 1.0 s, Peaking at t = 6.0 s (Amplitude = 5.0 uM, Duration = 10 s)');

// Scenario 2: Onset at t = 2.0 s, Peaking at t = 6.0 s (Amplitude = 5.0 uM, Duration = 10 s)
const r2 = runBlockSimulation(2.0, 6.0, 10.0, 'Scenario 2: Onset at t = 2.0 s, Peaking at t = 6.0 s (Amplitude = 5.0 uM, Duration = 10 s)');

// Scenario 3: Onset at t = 0.0 s, Peaking at t = 6.0 s (Amplitude = 5.0 uM, Duration = 10 s)
const r3 = runBlockSimulation(0.0, 6.0, 10.0, 'Scenario 3: Onset at t = 0.0 s, Peaking at t = 6.0 s (Amplitude = 5.0 uM, Duration = 10 s)');

const allPassed = (r1.attenUpdated < 10.0 && r2.attenUpdated < 10.0 && r3.attenUpdated < 10.0 &&
                   r1.attenOld > 60.0 && r2.attenOld > 60.0 && r3.attenOld > 60.0);

if (allPassed) {
  console.log('\n>>> SHORT CHANNEL REGRESSION EMPIRICAL VERIFICATION: ALL SCENARIOS PASSED <<<');
} else {
  console.error('\n>>> SHORT CHANNEL REGRESSION EMPIRICAL VERIFICATION: FAILED <<<');
  process.exit(1);
}
