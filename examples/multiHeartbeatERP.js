/**
 * @id multiHeartbeatERP
 * @title Heartbeat-Evoked Potential (HEP): PPG R-Peak Locked EEG
 * @category Multimodal (EEG + PPG + HR)
 * @order 3
 */
// Technical Multimodal Interoception Visualizer: Heartbeat-Evoked Potential (HEP)
// Detects systolic peaks in the 64 Hz PPG wave (`eegData.ppgPulse`), time-locks a [-100 ms, +500 ms]
// window of 256 Hz EEG across TP9, AF7, AF8, and TP10, and computes a rolling ensemble average ERP!
//   - Press 'R' or click canvas to reset the ensemble average counter.

const EPOCH_SAMPLES = 154; // 600 ms @ 256 Hz (-100 ms to +500 ms around PPG peak)
let avgHEP = [[], [], [], []];
let trialCount = 0;
let lastPeakMs = 0;

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  resetHEP();
}

function resetHEP() {
  trialCount = 0;
  for (let ch = 0; ch < 4; ch++) {
    avgHEP[ch] = new Array(EPOCH_SAMPLES).fill(0);
  }
}

function mousePressed() {
  resetHEP();
}

function keyPressed() {
  if (key === 'r' || key === 'R') resetHEP();
}

function draw() {
  background(225, 38, 8);

  const t = millis() * 0.001;
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0)
    : Math.pow(max(0, sin(t * 3.9)), 4);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 72;

  // Detect systolic PPG peak and lock a 600 ms EEG epoch
  if (pulse > 0.76 && millis() - lastPeakMs > 520) {
    lastPeakMs = millis();
    trialCount++;
    const chNames = ['TP9', 'AF7', 'AF8', 'TP10'];
    const hasRealEEG = Boolean(
      eegData.connected &&
      eegData.rawHistory &&
      Array.isArray(eegData.rawHistory.AF7) &&
      eegData.rawHistory.AF7.length >= 16
    );
    const preSamples = Math.max(1, Math.floor(EPOCH_SAMPLES * (100 / 600)));
    for (let c = 0; c < 4; c++) {
      const chKey = chNames[c];
      const raw = (hasRealEEG && typeof eegData.getCleanChannel === 'function')
        ? eegData.getCleanChannel(chKey, EPOCH_SAMPLES)
        : eegData.getRawChannel(chKey, EPOCH_SAMPLES);
      // Pre-stimulus (-100..0 ms) baseline correction
      let baseMean = 0;
      for (let b = 0; b < preSamples; b++) baseMean += (raw[b] || 0);
      baseMean /= preSamples;

      for (let i = 0; i < EPOCH_SAMPLES; i++) {
        let sampleVal;
        if (hasRealEEG) {
          sampleVal = (raw[i] || 0) - baseMean;
        } else {
          // Demo preview when disconnected: synthetic HEP cortical dipole around +250..380 ms post-heartbeat
          const ms = map(i, 0, EPOCH_SAMPLES - 1, -100, 500);
          const hepWave = (c === 1 || c === 2 ? 1.0 : -0.6) *
            8.5 * Math.exp(-Math.pow((ms - 280) / 65, 2));
          sampleVal = (((raw[i] || 0) - baseMean) * 0.25) + hepWave;
        }
        avgHEP[c][i] = ((avgHEP[c][i] * (trialCount - 1)) + sampleVal) / trialCount;
      }
    }
  }

  // Header
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(14.5);
  text('🫀⚡ Heartbeat-Evoked Potential (HEP): PPG Systolic Peak-Locked EEG ERP', 16, 12);
  fill(210, 20, 74);
  textSize(10.5);
  text(`Locked Heartbeats (N = ${trialCount})  |  HR: ${bpm} BPM  |  Window: -100 ms to +500 ms  |  Click or [R] Reset`, 16, 32);

  // Main HEP Plot Area
  const pTop = 58;
  const pBot = height - 88;
  const pH = pBot - pTop;
  const pMid = pTop + pH / 2;
  const pL = 68;
  const pR = width - 24;

  fill(225, 32, 12, 0.95);
  stroke(265, 50, 45);
  rect(16, pTop, width - 32, pH, 6);

  // Zero µV line and t = 0 ms (Systolic PPG Peak) trigger line
  stroke(220, 20, 26);
  strokeWeight(1);
  line(pL, pMid, pR, pMid);

  const zeroX = map(0, -100, 500, pL, pR);
  stroke(352, 85, 95, 0.75);
  strokeWeight(1.5);
  line(zeroX, pTop + 10, zeroX, pBot - 10);
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
  rect(w200, pTop + 8, w400 - w200, pH - 16);
  fill(190, 70, 92);
  textAlign(CENTER, TOP);
  text('HEP Window (200–400 ms)', (w200 + w400) / 2, pTop + 12);

  // Draw 4-channel averaged HEP traces
  const chMeta = [
    { name: 'TP9',  hue: 280 },
    { name: 'AF7',  hue: 190 },
    { name: 'AF8',  hue: 140 },
    { name: 'TP10', hue: 38 }
  ];

  for (let c = 0; c < 4; c++) {
    noFill();
    stroke(chMeta[c].hue, 85, 98);
    strokeWeight(2.2);
    beginShape();
    for (let i = 0; i < EPOCH_SAMPLES; i++) {
      const x = map(i, 0, EPOCH_SAMPLES - 1, pL, pR);
      const y = constrain(pMid - avgHEP[c][i] * (pH * 0.032), pTop + 10, pBot - 10);
      vertex(x, y);
    }
    endShape();

    // Legend
    noStroke();
    fill(chMeta[c].hue, 85, 98);
    textAlign(LEFT, TOP);
    textSize(10.5);
    text(`■ ${chMeta[c].name}`, pR - 230 + c * 56, pTop + 12);
  }

  // Bottom Live PPG Trigger Strip
  const sTop = pBot + 12;
  const sH = height - sTop - 12;
  fill(225, 32, 12, 0.95);
  stroke(352, 55, 45);
  rect(16, sTop, width - 32, sH, 6);

  noStroke();
  fill(352, 85, 98);
  textAlign(LEFT, CENTER);
  textSize(11);
  text(`💓 Live 64 Hz PPG Trigger Stream  |  Pulse: ${(pulse * 100).toFixed(0)}%`, 28, sTop + sH / 2);

  const beatFlash = constrain(1.0 - (millis() - lastPeakMs) / 300.0, 0, 1);
  fill(352, 90, 100, 0.25 + beatFlash * 0.75);
  ellipse(width - 42, sTop + sH / 2, 14 + beatFlash * 14, 14 + beatFlash * 14);
}
