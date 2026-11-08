/**
 * @id ppgBreathCoherenceGame
 * @title PPG Game: Respiratory Sinus Arrhythmia & SpO2 Coherence
 * @category PPG & Optical (fNIRS)
 * @order 9
 */
// PPG & SpO2 Biofeedback Coherence Game
// Guide the golden breathing orb along the 0.1 Hz (6 breaths/min) resonance curve!
//   - Measures how closely your PPG pulse wave (`eegData.ppgPulse`), Heart Rate (`eegData.heartRate`),
//     and Oxy/Deoxy hemoglobin waves synchronize with the breathing pacer.
//   - High Heart-Breath coherence blooms a luminous lotus mandala!

let coherenceScore = 76;
let trail = [];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function draw() {
  background(230, 42, 7, 0.22);

  const t = millis() * 0.001;
  // 0.1 Hz resonance breathing guide (10-second cycle: 5s inhale, 5s exhale)
  const breathPhase = sin(TWO_PI * 0.1 * t);
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.5 + 0.42 * sin(t * 3.9 + breathPhase * 0.6);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : Math.round(70 + breathPhase * 6);

  const pulseCentered = (pulse - 0.5) * 2;
  const rsaSync = 1.0 - Math.min(1.0, Math.abs(breathPhase - pulseCentered) * 0.55);
  const targetCoherence = eegData.connected
    ? constrain(55 + rsaSync * 28 + (eegData.meditation || 0.5) * 17, 20, 99)
    : 72 + 18 * sin(t * 0.3);
  coherenceScore = lerp(coherenceScore, targetCoherence, 0.04);

  const cx = width / 2;
  const cy = height / 2 - 12;

  // Draw blooming lotus mandala driven by PPG pulse + coherence
  push();
  translate(cx, cy);
  const petals = 12;
  const baseR = 52 + breathPhase * 28 + pulse * 18;
  noFill();
  for (let layer = 0; layer < 3; layer++) {
    const lHue = (175 + layer * 65 + t * 12) % 360;
    stroke(lHue, 82, 96, 0.65 - layer * 0.15);
    strokeWeight(2.2 - layer * 0.4);
    beginShape();
    for (let a = 0; a <= TWO_PI + 0.05; a += 0.05) {
      const r = baseR * (0.65 + layer * 0.25) + 18 * sin(a * petals + t * 1.5 * (layer % 2 ? 1 : -1));
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
  }
  pop();

  // Center breathing guide & heart rate readout
  noStroke();
  fill(0, 0, 98);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(breathPhase >= 0 ? 'INHALE ↑' : 'EXHALE ↓', cx, cy - 12);
  fill(175, 80, 98);
  textSize(13);
  text(`${bpm} BPM  |  Coherence ${coherenceScore.toFixed(0)}%`, cx, cy + 12);

  // Bottom RSA / PPG Phase Strip
  trail.push({ breath: breathPhase, pulse: (pulse - 0.5) * 2 });
  if (trail.length > 180) trail.shift();

  const stripTop = height - 82;
  const stripMid = height - 44;
  fill(225, 35, 12, 0.9);
  stroke(200, 40, 35);
  strokeWeight(1);
  rect(20, stripTop, width - 40, 68, 6);

  noFill();
  // Breathing target wave (Cyan)
  stroke(185, 85, 95, 0.8);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < trail.length; i++) {
    const x = map(i, 0, 179, 32, width - 32);
    vertex(x, stripMid - trail[i].breath * 22);
  }
  endShape();

  // PPG Pulse wave (Crimson)
  stroke(352, 85, 98, 0.9);
  strokeWeight(1.8);
  beginShape();
  for (let i = 0; i < trail.length; i++) {
    const x = map(i, 0, 179, 32, width - 32);
    vertex(x, stripMid - trail[i].pulse * 22);
  }
  endShape();
}
