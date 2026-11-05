/**
 * @id cerebralOxygenationSpO2
 * @title Cerebral Oxygenation (SpO2 & HbO2/Hb Phase)
 * @category PPG & Optical (fNIRS)
 * @order 3
 */
// Cerebral Oxygenation & Pulse Oximetry Dashboard
// Combines:
//   1. Arterial SpO2 (%) from Red (660 nm) / Infrared (850 nm) AC/DC Ratio-of-Ratios (R)
//   2. Modified Beer-Lambert Δ[HbO2] & Δ[HHb] Tissue Oxygenation Index (TSI %)
//   3. 2D Hemodynamic Phase Space (Δ[HbO2] vs Δ[HHb]) & Neurovascular Coupling with EEG

const HISTORY_LEN = 300;
let traceHistory = [];
let baseline = { red: null, ir: null, nir: null };

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function mousePressed() {
  baseline = { red: null, ir: null, nir: null };
  traceHistory = [];
}

function computeACDC(samples) {
  if (!samples || samples.length < 16) return { dc: 0, ac: 0, ratio: 0 };
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i];
  const dc = sum / samples.length;
  let sqSum = 0;
  for (let i = 0; i < samples.length; i++) {
    const d = samples[i] - dc;
    sqSum += d * d;
  }
  const acRms = Math.sqrt(sqSum / samples.length);
  return { dc, ac: acRms, ratio: dc > 1 ? acRms / dc : 0 };
}

function draw() {
  background(225, 35, 8);

  const redSamples = eegData.getPPGChannel('red', 128);
  const irSamples  = eegData.getPPGChannel('infrared', 128);
  const nirSamples = eegData.getPPGChannel('nir', 128);

  const redStats = computeACDC(redSamples.length ? redSamples : irSamples);
  const irStats  = computeACDC(irSamples);
  const nirStats = computeACDC(nirSamples.length ? nirSamples : irSamples);

  // Ratio of Ratios R = (AC_660 / DC_660) / (AC_850 / DC_850)
  let R = 0.52;
  if (irStats.ratio > 1e-6 && redStats.ratio > 1e-6) {
    R = constrain(redStats.ratio / irStats.ratio, 0.35, 1.4);
  }
  // Empirical Beer-Lambert pulse oximetry calibration curve: SpO2 = 110 - 25 * R
  const spo2 = constrain(110.0 - 25.0 * R, 85.0, 100.0);

  // Modified Beer-Lambert Δ[HbO2] and Δ[HHb]
  if (redStats.dc > 0 && irStats.dc > 0) {
    if (!baseline.red || !baseline.ir) {
      baseline.red = redStats.dc;
      baseline.ir  = irStats.dc;
      baseline.nir = nirStats.dc || irStats.dc;
    }
    const dOD660 = -Math.log(redStats.dc / baseline.red);
    const dOD850 = -Math.log(irStats.dc / baseline.ir);

    // 2x2 MBLL inversion at 660 nm (L=13.0 cm) and 850 nm (L=11.6 cm)
    const a11 = 0.3196 * 13.0, a12 = 3.2266 * 13.0;
    const a21 = 1.0580 * 11.6, a22 = 0.6913 * 11.6;
    const det = a11 * a22 - a12 * a21;

    const dHbO2 = (( a22 * dOD660 - a12 * dOD850) / det) * 1000.0;
    const dHHb  = ((-a21 * dOD660 + a11 * dOD850) / det) * 1000.0;

    // Estimated Cerebral Tissue Saturation Index (TSI %) around 68% baseline
    const baseHbO2 = 58.0; // uM typical cortical baseline
    const baseHHb  = 26.0; // uM typical cortical baseline
    const instHbO2 = Math.max(1, baseHbO2 + dHbO2);
    const instHHb  = Math.max(1, baseHHb  + dHHb);
    const tsi = constrain((instHbO2 / (instHbO2 + instHHb)) * 100.0, 40.0, 95.0);

    const prev = traceHistory.length ? traceHistory[traceHistory.length - 1] : null;
    const sm = 0.2;
    traceHistory.push(prev ? {
      dHbO2: prev.dHbO2 * (1 - sm) + dHbO2 * sm,
      dHHb:  prev.dHHb  * (1 - sm) + dHHb  * sm,
      spo2:  prev.spo2  * (1 - sm) + spo2  * sm,
      tsi:   prev.tsi   * (1 - sm) + tsi   * sm,
      R:     prev.R     * (1 - sm) + R     * sm,
      attn:  eegData.attention || 0
    } : { dHbO2, dHHb, spo2, tsi, R, attn: eegData.attention || 0 });

    if (traceHistory.length > HISTORY_LEN) traceHistory.shift();
  }

  const cur = traceHistory.length
    ? traceHistory[traceHistory.length - 1]
    : { dHbO2: 0, dHHb: 0, spo2: 97.5, tsi: 69.0, R: 0.50, attn: 0 };

  // Title
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(15);
  text('🫁 Cerebral Oxygenation, SpO₂ & Neurovascular Phase Space', 18, 12);
  fill(215, 20, 72);
  textSize(10.5);
  text('Red (660 nm) + IR (850 nm) Ratio-of-Ratios SpO₂  |  MBLL Tissue Saturation (TSI)  |  Click to Re-Zero', 18, 32);

  // Top Metric Cards (4 cards)
  const cardY = 54;
  const cardH = 68;
  const gap = 12;
  const cardW = (width - 36 - gap * 3) / 4;

  const cards = [
    { title: 'ARTERIAL SpO₂', value: `${cur.spo2.toFixed(1)}%`, sub: `Ratio R = ${cur.R.toFixed(2)}`, hue: 190 },
    { title: 'TISSUE OXYGEN (TSI)', value: `${cur.tsi.toFixed(1)}%`, sub: 'HbO₂ / (HbO₂ + HHb)', hue: 145 },
    { title: 'Δ[HbO₂] / Δ[HHb]', value: `${cur.dHbO2 >= 0 ? '+' : ''}${cur.dHbO2.toFixed(2)} μM`, sub: `ΔHHb: ${cur.dHHb >= 0 ? '+' : ''}${cur.dHHb.toFixed(2)} μM`, hue: 355 },
    { title: 'HEART RATE & PULSE', value: `${eegData.heartRate || '--'} BPM`, sub: `Pulse: ${(eegData.ppgPulse || 0).toFixed(2)}`, hue: 330 }
  ];

  for (let i = 0; i < cards.length; i++) {
    const cx = 18 + i * (cardW + gap);
    const c = cards[i];
    fill(225, 30, 14, 0.95);
    stroke(c.hue, 55, 45);
    strokeWeight(1);
    rect(cx, cardY, cardW, cardH, 6);

    noStroke();
    fill(c.hue, 70, 90);
    textSize(10);
    text(c.title, cx + 10, cardY + 8);

    fill(0, 0, 98);
    textSize(18);
    text(c.value, cx + 10, cardY + 24);

    fill(215, 18, 68);
    textSize(10);
    text(c.sub, cx + 10, cardY + 48);
  }

  // Bottom Split: Left = 2D Phase Portrait (ΔHbO2 vs ΔHHb), Right = Time Series (TSI + ΔHbO2 + EEG Attention)
  const panelTop = cardY + cardH + 14;
  const panelH = height - panelTop - 16;
  const phaseW = Math.min(240, width * 0.34);

  // Left: 2D Hemodynamic Phase Space
  fill(225, 30, 13, 0.95);
  stroke(220, 30, 30);
  rect(18, panelTop, phaseW, panelH, 6);

  const pxCenter = 18 + phaseW / 2;
  const pyCenter = panelTop + panelH / 2 + 10;
  const radius = Math.min(phaseW, panelH - 36) * 0.38;

  stroke(220, 20, 26);
  line(pxCenter - radius, pyCenter, pxCenter + radius, pyCenter);
  line(pxCenter, pyCenter - radius, pxCenter, pyCenter + radius);
  noFill();
  ellipse(pxCenter, pyCenter, radius * 2, radius * 2);

  noStroke();
  fill(0, 0, 95);
  textAlign(LEFT, TOP);
  textSize(11);
  text('HbO₂ vs HHb Phase Space', 28, panelTop + 8);
  fill(355, 80, 95);
  textAlign(CENTER, TOP);
  textSize(9.5);
  text('+ΔHbO₂ →', pxCenter + radius * 0.55, pyCenter + 4);
  fill(210, 80, 95);
  text('+ΔHHb ↑', pxCenter, pyCenter - radius - 12);

  if (traceHistory.length > 2) {
    let maxP = 0.5;
    for (const h of traceHistory) {
      maxP = Math.max(maxP, Math.abs(h.dHbO2), Math.abs(h.dHHb));
    }
    noFill();
    for (let i = 1; i < traceHistory.length; i++) {
      const a = map(i, 0, traceHistory.length, 0.05, 0.95);
      stroke(355 - (1 - i / traceHistory.length) * 140, 80, 96, a);
      strokeWeight(1.8);
      const x1 = pxCenter + (traceHistory[i - 1].dHbO2 / maxP) * radius;
      const y1 = pyCenter - (traceHistory[i - 1].dHHb  / maxP) * radius;
      const x2 = pxCenter + (traceHistory[i].dHbO2 / maxP) * radius;
      const y2 = pyCenter - (traceHistory[i].dHHb  / maxP) * radius;
      line(x1, y1, x2, y2);
    }
    const hx = pxCenter + (cur.dHbO2 / maxP) * radius;
    const hy = pyCenter - (cur.dHHb  / maxP) * radius;
    fill(0, 0, 100);
    noStroke();
    ellipse(hx, hy, 7, 7);
  }

  // Right: Neurovascular Time Series (ΔHbO2, ΔHHb, and EEG Attention)
  const tsLeft = 18 + phaseW + 14;
  const tsW = width - tsLeft - 18;
  const tsMid = panelTop + panelH / 2 + 8;

  fill(225, 30, 13, 0.95);
  stroke(220, 30, 30);
  rect(tsLeft, panelTop, tsW, panelH, 6);

  noStroke();
  fill(0, 0, 95);
  textAlign(LEFT, TOP);
  textSize(11);
  text('Neurovascular Coupling: Δ[HbO₂] (Red), Δ[HHb] (Blue) & EEG Attention (Green)', tsLeft + 12, panelTop + 8);

  const pL = tsLeft + 14;
  const pR = tsLeft + tsW - 14;
  stroke(220, 20, 25);
  line(pL, tsMid, pR, tsMid);

  if (traceHistory.length > 2) {
    let maxH = 0.5;
    for (const h of traceHistory) {
      maxH = Math.max(maxH, Math.abs(h.dHbO2), Math.abs(h.dHHb));
    }
    const yScale = (panelH * 0.36) / maxH;

    // EEG Attention trace (scaled around midline)
    noFill();
    stroke(130, 80, 90, 0.65);
    strokeWeight(1.5);
    beginShape();
    for (let i = 0; i < traceHistory.length; i++) {
      const x = map(i, 0, HISTORY_LEN - 1, pL, pR);
      const y = tsMid - (traceHistory[i].attn - 0.5) * (panelH * 0.65);
      vertex(x, y);
    }
    endShape();

    // ΔHHb trace
    stroke(210, 85, 98);
    strokeWeight(2.2);
    beginShape();
    for (let i = 0; i < traceHistory.length; i++) {
      const x = map(i, 0, HISTORY_LEN - 1, pL, pR);
      const y = constrain(tsMid - traceHistory[i].dHHb * yScale, panelTop + 26, panelTop + panelH - 8);
      vertex(x, y);
    }
    endShape();

    // ΔHbO2 trace
    stroke(355, 85, 98);
    strokeWeight(2.4);
    beginShape();
    for (let i = 0; i < traceHistory.length; i++) {
      const x = map(i, 0, HISTORY_LEN - 1, pL, pR);
      const y = constrain(tsMid - traceHistory[i].dHbO2 * yScale, panelTop + 26, panelTop + panelH - 8);
      vertex(x, y);
    }
    endShape();
  }
}
