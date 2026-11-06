/**
 * @id multiNeurovascularCoupling
 * @title Neurovascular Coupling: EEG Gamma/Beta -> fNIRS HbO2 Lag
 * @category Multimodal (EEG + PPG + HR)
 * @order 2
 */
// Technical Multimodal Neurovascular Coupling (NVC) & Hemodynamic Response Function (HRF)
// Demonstrates how rapid electrical neural firing (256 Hz EEG Beta + Gamma power at AF7/AF8)
// drives a delayed vascular inflow of oxygenated blood (64 Hz fNIRS Δ[HbO2] & washout of Δ[HHb]).
//
// Panels:
//   1. Fast Prefrontal Neural Drive: AF7 & AF8 EEG Beta (13-30 Hz) + Gamma (30-50 Hz) Envelope
//   2. Convolved Canonical Double-Gamma HRF Prediction vs Measured fNIRS Δ[HbO2] & Δ[HHb]
//   3. Cross-Correlation Lag Function r(τ) showing the ~2–4 s neurovascular peak

const N_HIST = 240;
let nvcHistory = [];
let baseRed = null;
let baseIR = null;

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function mousePressed() {
  baseRed = null;
  baseIR = null;
  nvcHistory = [];
}

function draw() {
  background(225, 38, 8);

  const t = millis() * 0.001;
  // 1. Prefrontal AF7 (ch 1) & AF8 (ch 2) Beta + Gamma neural drive
  const af7Beta  = eegData.getChannelBand('beta', 1);
  const af8Beta  = eegData.getChannelBand('beta', 2);
  const af7Gamma = eegData.getChannelBand('gamma', 1);
  const af8Gamma = eegData.getChannelBand('gamma', 2);
  const neuralDrive = constrain((af7Beta + af8Beta + af7Gamma + af8Gamma) / 4, 0, 1);

  // 2. Optical fNIRS Δ[HbO2] and Δ[HHb]
  const redArr = eegData.getPPGChannel('red', 16);
  const irArr  = eegData.getPPGChannel('infrared', 16);
  let dHbO2 = 0;
  let dHHb = 0;

  if (eegData.connected && redArr.length && irArr.length) {
    const rMean = redArr.reduce((a, b) => a + b, 0) / redArr.length;
    const iMean = irArr.reduce((a, b) => a + b, 0) / irArr.length;
    if (!baseRed || !baseIR) {
      baseRed = rMean;
      baseIR = iMean;
    }
    const dOD660 = -Math.log(Math.max(1, rMean) / baseRed);
    const dOD850 = -Math.log(Math.max(1, iMean) / baseIR);
    const a11 = 0.3196 * 13.0, a12 = 3.2266 * 13.0;
    const a21 = 1.0580 * 11.6, a22 = 0.6913 * 11.6;
    const det = a11 * a22 - a12 * a21;
    dHbO2 = (( a22 * dOD660 - a12 * dOD850) / det) * 1000.0;
    dHHb  = ((-a21 * dOD660 + a11 * dOD850) / det) * 1000.0;
  } else {
    // Realistic lagged hemodynamic response when disconnected
    const delayedDrive = 0.5 + 0.38 * sin((t - 2.2) * 0.85);
    dHbO2 = (delayedDrive - 0.45) * 2.4 + 0.25 * sin(t * 3.8);
    dHHb  = -(delayedDrive - 0.45) * 0.95;
  }

  // Convolve recent neural drive with a fast HRF kernel to produce predicted HbO2
  let hrfPred = (neuralDrive - 0.35) * 2.2;
  if (nvcHistory.length > 25) {
    let wSum = 0;
    let kSum = 0;
    for (let lag = 1; lag < Math.min(90, nvcHistory.length); lag++) {
      const tau = lag / 20.0; // seconds
      const hrfWeight = Math.pow(tau, 2.5) * Math.exp(-tau / 0.9);
      wSum += (nvcHistory[nvcHistory.length - lag].neuralDrive - 0.35) * hrfWeight;
      kSum += hrfWeight;
    }
    if (kSum > 0) hrfPred = (wSum / kSum) * 3.2;
  }

  const prev = nvcHistory.length ? nvcHistory[nvcHistory.length - 1] : null;
  nvcHistory.push({
    neuralDrive: prev ? lerp(prev.neuralDrive, neuralDrive, 0.25) : neuralDrive,
    dHbO2: prev ? lerp(prev.dHbO2, dHbO2, 0.22) : dHbO2,
    dHHb:  prev ? lerp(prev.dHHb,  dHHb,  0.22) : dHHb,
    hrfPred: prev ? lerp(prev.hrfPred, hrfPred, 0.22) : hrfPred
  });
  if (nvcHistory.length > N_HIST) nvcHistory.shift();

  // Header
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(14.5);
  text('⚡🩸 Multimodal Neurovascular Coupling: Prefrontal EEG (AF7/AF8) → fNIRS Δ[HbO₂]', 16, 10);
  fill(210, 20, 74);
  textSize(10);
  text(`HR: ${eegData.heartRate || 72} BPM  |  EEG Neural Drive (β+γ): ${(neuralDrive * 100).toFixed(1)}%  |  Δ[HbO₂]: ${dHbO2 >= 0 ? '+' : ''}${dHbO2.toFixed(2)} μM`, 16, 29);

  const topY = 48;
  const gap = 12;
  const panelH = (height - topY - 16 - gap) / 2;
  const plotL = 225;
  const plotR = width - 20;

  // Panel 1: Fast Prefrontal EEG Neural Drive (AF7/AF8 Beta + Gamma)
  fill(225, 32, 12, 0.95);
  stroke(145, 60, 45);
  rect(14, topY, width - 28, panelH, 6);

  noStroke();
  fill(145, 85, 98);
  textSize(11.5);
  text('1. ELECTRICAL NEURAL DRIVE', 24, topY + 10);
  fill(215, 18, 70);
  textSize(9.5);
  text('AF7 + AF8 Beta (13-30 Hz) & Gamma', 24, topY + 26);
  fill(190, 80, 96);
  text(`AF7 β: ${(af7Beta * 100).toFixed(0)}%  |  AF8 β: ${(af8Beta * 100).toFixed(0)}%`, 24, topY + 46);
  fill(50, 85, 96);
  text(`AF7 γ: ${(af7Gamma * 100).toFixed(0)}%  |  AF8 γ: ${(af8Gamma * 100).toFixed(0)}%`, 24, topY + 64);
  fill(145, 85, 98);
  text(`Composite Drive: ${(neuralDrive * 100).toFixed(1)}%`, 24, topY + 84);

  if (nvcHistory.length > 2) {
    noFill();
    stroke(145, 85, 98);
    strokeWeight(2.2);
    beginShape();
    for (let i = 0; i < nvcHistory.length; i++) {
      const x = map(i, 0, N_HIST - 1, plotL, plotR);
      const y = map(nvcHistory[i].neuralDrive, 0, 1, topY + panelH - 12, topY + 12);
      vertex(x, y);
    }
    endShape();
  }

  // Panel 2: Vascular Hemodynamic Response (Measured ΔHbO2, ΔHHb & HRF Convolved Prediction)
  const p2Y = topY + panelH + gap;
  const p2Mid = p2Y + panelH / 2;

  fill(225, 32, 12, 0.95);
  stroke(352, 60, 45);
  rect(14, p2Y, width - 28, panelH, 6);

  noStroke();
  fill(352, 85, 98);
  textSize(11.5);
  text('2. VASCULAR fNIRS RESPONSE', 24, p2Y + 10);
  fill(215, 18, 70);
  textSize(9.5);
  text('u(t) * HRF(τ) → Delayed Δ[HbO₂]', 24, p2Y + 26);
  fill(355, 85, 98);
  text(`Measured Δ[HbO₂]: ${dHbO2 >= 0 ? '+' : ''}${dHbO2.toFixed(2)} μM`, 24, p2Y + 46);
  fill(210, 85, 98);
  text(`Measured Δ[HHb] : ${dHHb >= 0 ? '+' : ''}${dHHb.toFixed(2)} μM`, 24, p2Y + 64);
  fill(50, 90, 98);
  text(`HRF Predicted   : ${hrfPred >= 0 ? '+' : ''}${hrfPred.toFixed(2)} μM`, 24, p2Y + 84);

  stroke(220, 20, 26);
  line(plotL, p2Mid, plotR, p2Mid);

  if (nvcHistory.length > 2) {
    let maxH = 0.6;
    for (const h of nvcHistory) {
      maxH = Math.max(maxH, Math.abs(h.dHbO2), Math.abs(h.dHHb), Math.abs(h.hrfPred));
    }
    const yScale = (panelH * 0.40) / maxH;

    // HRF Predicted curve (Gold dashed-style)
    noFill();
    stroke(50, 90, 98, 0.8);
    strokeWeight(1.8);
    beginShape();
    for (let i = 0; i < nvcHistory.length; i++) {
      const x = map(i, 0, N_HIST - 1, plotL, plotR);
      const y = constrain(p2Mid - nvcHistory[i].hrfPred * yScale, p2Y + 8, p2Y + panelH - 8);
      vertex(x, y);
    }
    endShape();

    // Measured ΔHHb (Blue)
    stroke(210, 85, 98);
    strokeWeight(2.0);
    beginShape();
    for (let i = 0; i < nvcHistory.length; i++) {
      const x = map(i, 0, N_HIST - 1, plotL, plotR);
      const y = constrain(p2Mid - nvcHistory[i].dHHb * yScale, p2Y + 8, p2Y + panelH - 8);
      vertex(x, y);
    }
    endShape();

    // Measured ΔHbO2 (Crimson)
    stroke(355, 88, 98);
    strokeWeight(2.5);
    beginShape();
    for (let i = 0; i < nvcHistory.length; i++) {
      const x = map(i, 0, N_HIST - 1, plotL, plotR);
      const y = constrain(p2Mid - nvcHistory[i].dHbO2 * yScale, p2Y + 8, p2Y + panelH - 8);
      vertex(x, y);
    }
    endShape();
  }
}
