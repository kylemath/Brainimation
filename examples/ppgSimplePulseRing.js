/**
 * @id ppgSimplePulseRing
 * @title Intro to PPG: Glowing Heartbeat & SpO2 Ring
 * @category PPG & Optical (fNIRS)
 * @order 6
 */
// Simple, beginner-friendly PPG & SpO2 animation!
// Shows how to read:
//   - eegData.ppgPulse  (0.0 to 1.0 normalized heartbeat wave)
//   - eegData.heartRate (estimated BPM from systolic peaks)
//   - eegData.getPPGChannel('red', 64) & eegData.getPPGChannel('infrared', 64)

let ripples = [];
let lastBeatTime = 0;

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function draw() {
  background(228, 40, 8, 0.25);

  const t = millis() * 0.001;
  // Read live PPG pulse (or smooth fallback when not yet connected)
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0)
    : Math.pow(max(0, sin(t * 3.8)), 3) * 0.9;
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 72;

  // Spawn an expanding ring on each systolic peak
  if (pulse > 0.72 && millis() - lastBeatTime > 420) {
    lastBeatTime = millis();
    ripples.push({ r: 65, alpha: 0.9, hue: 350 });
  }

  const cx = width / 2;
  const cy = height / 2 - 18;

  // Update and draw expanding arterial pulse ripples
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.r += 2.6;
    rp.alpha -= 0.014;
    if (rp.alpha <= 0) {
      ripples.splice(i, 1);
      continue;
    }
    stroke(rp.hue, 80, 98, rp.alpha);
    strokeWeight(2.5);
    ellipse(cx, cy, rp.r * 2, rp.r * 2);
  }

  // Outer SpO2 oxygenation gauge arc (computed from Red 660nm & IR 850nm AC/DC Ratio-of-Ratios when connected)
  const irWave = eegData.getPPGChannel('infrared', 128);
  const redWave = eegData.getPPGChannel('red', 128);
  let spo2 = 97.8 + 0.6 * sin(t * 0.5);
  if (eegData.connected && irWave && irWave.length >= 16) {
    const calcRatio = (arr) => {
      let m = 0;
      for (let i = 0; i < arr.length; i++) m += arr[i];
      m /= arr.length;
      let sq = 0;
      for (let i = 0; i < arr.length; i++) sq += (arr[i] - m) * (arr[i] - m);
      return m > 1 ? Math.sqrt(sq / arr.length) / m : 0;
    };
    const rIR = calcRatio(irWave);
    const rRed = (redWave && redWave.length >= 16) ? calcRatio(redWave) : rIR * 0.5;
    if (rIR > 1e-6 && rRed > 1e-6) {
      const R = constrain(rRed / rIR, 0.35, 1.35);
      spo2 = constrain(110.0 - 25.0 * R, 88.0, 100.0);
    }
  }
  stroke(190, 85, 95, 0.35);
  strokeWeight(10);
  noFill();
  ellipse(cx, cy, 190, 190);

  stroke(190, 85, 98);
  const spo2Angle = map(spo2, 85, 100, 0, TWO_PI);
  arc(cx, cy, 190, 190, -HALF_PI, -HALF_PI + spo2Angle);

  // Pulsing central heart circle
  const coreRadius = 48 + pulse * 28;
  noStroke();
  fill(352, 85, 95, 0.22);
  ellipse(cx, cy, coreRadius * 2.3, coreRadius * 2.3);

  fill(352, 88, 98);
  ellipse(cx, cy, coreRadius * 1.5, coreRadius * 1.5);

  // BPM & SpO2 readout inside the ring
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(22);
  text(`${bpm} BPM`, cx, cy - 8);
  textSize(12);
  fill(190, 70, 98);
  text(`SpO₂ ${spo2.toFixed(1)}%`, cx, cy + 16);

  // Bottom live infrared PPG waveform strip (auto-scaled to live AC amplitude)
  const stripY = height - 48;
  stroke(352, 80, 95);
  strokeWeight(2.2);
  noFill();
  beginShape();
  if (irWave && irWave.length >= 8 && eegData.connected) {
    const nW = irWave.length;
    let mean = 0;
    for (let i = 0; i < nW; i++) mean += irWave[i];
    mean /= nW;
    let maxDev = 1e-3;
    for (let i = 0; i < nW; i++) {
      const d = Math.abs(irWave[i] - mean);
      if (d > maxDev) maxDev = d;
    }
    for (let i = 0; i < nW; i++) {
      const x = map(i, 0, Math.max(1, nW - 1), 40, width - 40);
      const yOff = ((irWave[i] - mean) / maxDev) * 24;
      vertex(x, stripY - yOff);
    }
  } else {
    for (let i = 0; i < 128; i++) {
      const x = map(i, 0, 127, 40, width - 40);
      const ph = t * 3.8 - (128 - i) * 0.08;
      const yOff = (Math.pow(max(0, sin(ph)), 3) - 0.3) * 28;
      vertex(x, stripY - yOff);
    }
  }
  endShape();
}
