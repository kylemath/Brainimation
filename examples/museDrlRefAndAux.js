/**
 * @id museDrlRefAndAux
 * @title DRL/REF Ground Loop, Contact Quality & AUX Electrode
 * @category Motion, IMU & Broadcast Sensors
 * @order 5
 */

// ⚡ DRL/REF Calibration, Contact Quality & AUX Channel (eegData.drlRef, contactQuality, aux)
// Demonstrates Muse's auxiliary broadcast sensors:
//   - eegData.drlRef { drl, ref } (Forehead Driven Right Leg active noise-cancellation & Reference voltages)
//   - eegData.contactQuality { TP9, AF7, AF8, TP10 } (0.0 to 1.0 skin-electrode contact quality)
//   - eegData.aux & eegData.getRawChannel('AUX', numSamples) (5th micro-USB/Athena auxiliary EEG channel)

let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  simT += 0.03;

  let drl = 0, ref = 0, auxVal = 0;
  let cq = { TP9: 0.95, AF7: 0.98, AF8: 0.96, TP10: 0.92 };
  if (eegData && eegData.connected) {
    drl = eegData.drlRef ? eegData.drlRef.drl : 0;
    ref = eegData.drlRef ? eegData.drlRef.ref : 0;
    auxVal = eegData.aux || 0;
    if (eegData.contactQuality) cq = eegData.contactQuality;
  } else {
    drl = 820 + 22 * sin(simT * 1.1);
    ref = 815 + 16 * cos(simT * 0.9);
    auxVal = 18 * sin(simT * 3.2) + 8 * cos(simT * 7.5);
  }

  drawHeader(drl, ref, auxVal);

  let topY = 56;
  let topH = height * 0.48;
  let leftW = width * 0.46 - 20;
  let rightX = width * 0.46 + 4;
  let rightW = width - rightX - 16;

  drawHeadbandTopology(16, topY, leftW, topH, cq, drl, ref);
  drawDrlRefScope(rightX, topY, rightW, topH, drl, ref);

  let botY = topY + topH + 12;
  let botH = height - botY - 14;
  drawAuxChannelScope(16, botY, width - 32, botH, auxVal);
}

function drawHeader(drl, ref, auxVal) {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 46);
  stroke(45, 65, 100);
  line(0, 46, width, 46);

  noStroke();
  fill(45, 212, 191);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('⚡ SENSOR 5/5 — DRL/REF GROUND LOOP, HORSESHOE CONTACT & AUX CHANNEL', 16, 16);

  textStyle(NORMAL);
  fill(165, 185, 215);
  textSize(11);
  text(`DRL = ${drl.toFixed(1)} µV   |   REF = ${ref.toFixed(1)} µV   |   Common-Mode Δ = ${(drl - ref).toFixed(2)} µV   |   AUX = ${auxVal.toFixed(1)} µV`, 16, 34);
}

function drawHeadbandTopology(x, y, w, h, cq, drl, ref) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('MUSE HORSESHOE CONTACT & DRL/REF LOOP', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.57;
  let R = min(w, h - 42) * 0.36;

  // Headband horseshoe arc
  noFill();
  stroke(60, 85, 125);
  strokeWeight(8);
  arc(cx, cy, R * 2, R * 2, PI * 0.8, TWO_PI + PI * 0.2);

  // DRL (center-right forehead) & REF (center forehead) nodes
  noStroke();
  fill(250, 204, 21, 220);
  ellipse(cx - 14, cy - R, 12, 12);
  fill(56, 189, 248, 220);
  ellipse(cx + 14, cy - R, 12, 12);
  textSize(8.5);
  textAlign(CENTER, BOTTOM);
  fill(250, 204, 21); text('REF', cx - 14, cy - R - 8);
  fill(56, 189, 248); text('DRL', cx + 14, cy - R - 8);

  // 4 Primary EEG Electrodes
  const nodes = [
    { name: 'TP9',  ang: PI * 0.85, q: cq.TP9 || 0.94 },
    { name: 'AF7',  ang: PI * 1.28, q: cq.AF7 || 0.97 },
    { name: 'AF8',  ang: PI * 1.72, q: cq.AF8 || 0.96 },
    { name: 'TP10', ang: TWO_PI + PI * 0.15, q: cq.TP10 || 0.92 }
  ];

  for (let n of nodes) {
    let nx = cx + cos(n.ang) * R;
    let ny = cy + sin(n.ang) * R;
    let col = n.q > 0.8 ? [52, 211, 153] : n.q > 0.5 ? [250, 204, 21] : [248, 113, 113];
    noStroke();
    fill(col[0], col[1], col[2], 65);
    ellipse(nx, ny, 30, 30);
    fill(col[0], col[1], col[2]);
    ellipse(nx, ny, 16, 16);

    fill(235, 245, 255);
    textSize(9.5);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(n.name, nx, ny + 18);
    textStyle(NORMAL);
    textSize(8.5);
    fill(col[0], col[1], col[2]);
    text(`${Math.round(n.q * 100)}%`, nx, ny + 29);
  }
}

function drawDrlRefScope(x, y, w, h, drl, ref) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('DRL / REF ACTIVE GROUND FEEDBACK (eegData.drlRefHistory)', x + 12, y + 10);

  let plotX = x + 48;
  let plotY = y + 32;
  let plotW = w - 62;
  let plotH = h - 44;

  let dHist = (eegData && eegData.drlRefHistory && eegData.drlRefHistory.drl) ? eegData.drlRefHistory.drl : [];
  let rHist = (eegData && eegData.drlRefHistory && eegData.drlRefHistory.ref) ? eegData.drlRefHistory.ref : [];

  stroke(38, 52, 82);
  line(plotX, plotY + plotH * 0.5, plotX + plotW, plotY + plotH * 0.5);

  // Dynamically center and scale around the live DRL/REF baseline (supports both Athena ~8192 and Classic ~820)
  let N = dHist.length > 2 ? dHist.length : 120;
  let minV = Infinity, maxV = -Infinity;
  for (let i = 0; i < N; i++) {
    let vd = dHist.length > 2 ? dHist[i] : (820 + 22 * sin(simT * 1.1 - (N - i) * 0.06));
    let vr = rHist.length > 2 ? rHist[Math.min(i, rHist.length - 1)] : (815 + 16 * cos(simT * 0.9 - (N - i) * 0.06));
    if (vd < minV) minV = vd;
    if (vd > maxV) maxV = vd;
    if (vr < minV) minV = vr;
    if (vr > maxV) maxV = vr;
  }
  let midV = (minV + maxV) * 0.5;
  let halfSpan = Math.max(25, (maxV - minV) * 0.65);

  noFill();
  stroke(56, 189, 248);
  strokeWeight(1.8);
  beginShape();
  for (let i = 0; i < N; i++) {
    let v = dHist.length > 2 ? dHist[i] : (820 + 22 * sin(simT * 1.1 - (N - i) * 0.06));
    let px = plotX + (i / max(1, N - 1)) * plotW;
    let py = constrain(map(v, midV - halfSpan, midV + halfSpan, plotY + plotH, plotY), plotY, plotY + plotH);
    vertex(px, py);
  }
  endShape();

  stroke(250, 204, 21);
  strokeWeight(1.8);
  beginShape();
  for (let i = 0; i < N; i++) {
    let v = rHist.length > 2 ? rHist[Math.min(i, rHist.length - 1)] : (815 + 16 * cos(simT * 0.9 - (N - i) * 0.06));
    let px = plotX + (i / max(1, N - 1)) * plotW;
    let py = constrain(map(v, midV - halfSpan, midV + halfSpan, plotY + plotH, plotY), plotY, plotY + plotH);
    vertex(px, py);
  }
  endShape();
}

function drawAuxChannelScope(x, y, w, h, auxVal) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('5TH AUXILIARY ELECTRODE STREAM — eegData.aux & eegData.getRawChannel("AUX", 256)', x + 12, y + 8);

  let auxArr = (eegData && typeof eegData.getRawChannel === 'function') ? eegData.getRawChannel('AUX', 256) : [];
  let plotX = x + 48;
  let plotY = y + 28;
  let plotW = w - 62;
  let plotH = h - 38;
  let midY = plotY + plotH * 0.5;

  stroke(38, 52, 82);
  line(plotX, midY, plotX + plotW, midY);

  noFill();
  stroke(45, 212, 191);
  strokeWeight(1.8);
  beginShape();
  let N = auxArr && auxArr.length > 2 ? auxArr.length : 200;
  for (let i = 0; i < N; i++) {
    let v = (auxArr && auxArr.length > 2)
      ? auxArr[i]
      : (22 * sin(simT * 2.5 - (N - i) * 0.08) + 9 * cos(simT * 6.3 - (N - i) * 0.15));
    let px = plotX + (i / max(1, N - 1)) * plotW;
    let py = constrain(map(v, -80, 80, plotY + plotH, plotY), plotY, plotY + plotH);
    vertex(px, py);
  }
  endShape();
}
