/**
 * @id multiMindHeartReactor
 * @title Multimodal Game: Mind-Heart Fusion Reactor
 * @category Multimodal (EEG + PPG + HR)
 * @order 4
 */
// Multimodal Biofeedback Game (EEG + PPG + Heart Rate)
// Stabilize and supercharge a plasma fusion core using BOTH your brainwaves and heartbeat!
//   - EEG Alpha/Theta (`eegData.meditation`) stabilizes the magnetic containment rings
//   - EEG Beta/Gamma (`eegData.attention`) focuses the plasma beam intensity
//   - PPG Systolic Heartbeats (`eegData.ppgPulse` & `eegData.heartRate`) inject oxygen fuel pulses!

let energy = 420;
let plasmaParticles = [];
let rings = [
  { r: 58, speed: 0.9, tilt: 0.35, hue: 190 },
  { r: 86, speed: -0.65, tilt: -0.45, hue: 280 },
  { r: 114, speed: 0.45, tilt: 0.22, hue: 352 }
];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  for (let i = 0; i < 65; i++) {
    plasmaParticles.push({
      angle: random(TWO_PI),
      dist: random(20, 135),
      speed: random(0.015, 0.045),
      size: random(3, 7),
      hueOffset: random(-25, 25)
    });
  }
}

function draw() {
  background(228, 45, 7, 0.30);

  const t = millis() * 0.001;
  const attn = eegData.connected ? (eegData.attention || 0.5) : 0.55 + 0.3 * sin(t * 1.3);
  const med  = eegData.connected ? (eegData.meditation || 0.5) : 0.60 + 0.28 * cos(t * 0.9);
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.48 + 0.45 * Math.pow(max(0, sin(t * 3.8)), 3);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 73;

  // Fusion output grows when both EEG focus/calm and cardiac pulse are active
  const fusionYield = (attn * 0.4 + med * 0.4 + pulse * 0.2);
  energy += fusionYield * 0.8;

  const cx = width / 2;
  const cy = height / 2 + 10;

  // Draw rotating EEG containment rings
  push();
  translate(cx, cy);
  noFill();
  for (let i = 0; i < rings.length; i++) {
    const rg = rings[i];
    const wobble = (1 - med) * 14 * sin(t * 5 + i);
    const rad = rg.r + pulse * 16 + wobble;
    stroke(rg.hue, 85, 98, 0.78);
    strokeWeight(2.6);
    push();
    rotate(t * rg.speed + i);
    ellipse(0, 0, rad * 2, rad * (1.25 + med * 0.55));
    pop();
  }

  // Orbiting multimodal plasma particles
  noStroke();
  for (const p of plasmaParticles) {
    p.angle += p.speed * (0.7 + attn * 1.4);
    const r = p.dist * (0.75 + pulse * 0.35);
    const px = cos(p.angle) * r;
    const py = sin(p.angle) * r * 0.82;
    const pHue = (lerp(195, 355, pulse) + p.hueOffset + 360) % 360;
    fill(pHue, 88, 100, 0.85);
    ellipse(px, py, p.size * (0.8 + pulse * 0.6), p.size * (0.8 + pulse * 0.6));
  }

  // Central PPG Heart-Driven Fusion Core
  const coreR = 28 + pulse * 24 + attn * 12;
  fill(352, 85, 100, 0.24);
  ellipse(0, 0, coreR * 2.6, coreR * 2.6);
  fill(lerp(190, 355, pulse), 85, 100);
  ellipse(0, 0, coreR * 1.4, coreR * 1.4);
  fill(50, 40, 100);
  ellipse(0, 0, coreR * 0.65, coreR * 0.65);
  pop();

  // Top Multimodal Telemetry HUD
  fill(225, 35, 12, 0.92);
  stroke(275, 50, 45);
  strokeWeight(1);
  rect(14, 12, width - 28, 46, 6);

  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, CENTER);
  textSize(13.5);
  text(`⚛️ MIND-HEART FUSION REACTOR   OUTPUT: ${Math.round(energy)} MW`, 26, 26);

  fill(190, 80, 96);
  textSize(10.5);
  text(`EEG Calm (α/θ): ${(med * 100).toFixed(0)}%   EEG Focus (β/γ): ${(attn * 100).toFixed(0)}%   PPG Heart: ${bpm} BPM (Pulse ${(pulse * 100).toFixed(0)}%)`, 26, 45);
}
