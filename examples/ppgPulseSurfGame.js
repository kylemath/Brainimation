/**
 * @id ppgPulseSurfGame
 * @title PPG Game: Arterial Pulse Wave Surfer
 * @category PPG & Optical (fNIRS)
 * @order 8
 */
// Fun PPG Biofeedback Game!
// Ride the real-time arterial PPG waveform and collect HbO2 (Oxygen) gems while dodging
// Deoxy-Hb hypoxia mines!
//   - Your surfer's vertical lift is driven by your live cardiac pulse (`eegData.ppgPulse`)
//     plus optional mouse/arrow fine-tuning.
//   - Systolic heartbeat peaks trigger a temporary speed & shield boost!

let surferY = 200;
let tokens = [];
let particles = [];
let score = 0;
let spo2Meter = 98.0;
let waveTrail = [];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  surferY = height / 2;
}

function draw() {
  background(226, 42, 8);

  const t = millis() * 0.001;
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.48 + 0.45 * Math.pow(max(0, sin(t * 3.8)), 3) + 0.15 * sin(t * 7.6 - 0.7);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 74;

  // Record pulse wave history for the glowing arterial track
  const targetY = map(pulse, 0, 1, height * 0.76, height * 0.24);
  const userOffset = mouseIsPressed ? (mouseY - height / 2) * 0.35 : 0;
  surferY = lerp(surferY, constrain(targetY + userOffset, 60, height - 50), 0.18);

  waveTrail.push(surferY);
  if (waveTrail.length > 140) waveTrail.shift();

  // Spawn HbO2 oxygen gems & HHb hypoxia obstacles
  if (frameCount % 32 === 0) {
    const isOxy = random() < 0.75;
    tokens.push({
      x: width + 20,
      y: random(75, height - 65),
      vx: -random(3.2, 5.2) * map(bpm, 55, 110, 0.85, 1.35, true),
      isOxy,
      r: isOxy ? 13 : 15,
      phase: random(TWO_PI)
    });
  }

  // Background vascular vessel walls
  noStroke();
  fill(352, 65, 22, 0.45);
  rect(0, 48, width, 14);
  rect(0, height - 22, width, 14);

  // Draw glowing arterial pulse trail behind surfer
  const surferX = width * 0.26;
  noFill();
  stroke(352, 85, 98, 0.85);
  strokeWeight(3);
  beginShape();
  for (let i = 0; i < waveTrail.length; i++) {
    const wx = map(i, 0, waveTrail.length - 1, 20, surferX);
    vertex(wx, waveTrail[i]);
  }
  endShape();

  // Update & draw tokens
  for (let i = tokens.length - 1; i >= 0; i--) {
    const tk = tokens[i];
    tk.x += tk.vx;
    tk.y += sin(t * 3 + tk.phase) * 0.9;

    const d = dist(surferX, surferY, tk.x, tk.y);
    if (d < tk.r + 18) {
      if (tk.isOxy) {
        score += 25;
        spo2Meter = min(100, spo2Meter + 0.6);
      } else {
        score = max(0, score - 15);
        spo2Meter = max(86, spo2Meter - 1.5);
      }
      for (let p = 0; p < 12; p++) {
        particles.push({
          x: tk.x,
          y: tk.y,
          vx: random(-3.5, 3.5),
          vy: random(-3.5, 3.5),
          hue: tk.isOxy ? 355 : 210,
          life: 1.0
        });
      }
      tokens.splice(i, 1);
      continue;
    }

    if (tk.x < -30) {
      tokens.splice(i, 1);
      continue;
    }

    push();
    translate(tk.x, tk.y);
    if (tk.isOxy) {
      // Bright crimson HbO2 gem
      fill(355, 85, 98, 0.25);
      noStroke();
      ellipse(0, 0, tk.r * 2.8, tk.r * 2.8);
      fill(355, 88, 100);
      stroke(0, 0, 100, 0.8);
      strokeWeight(1.2);
      ellipse(0, 0, tk.r * 1.8, tk.r * 1.8);
      noStroke();
      fill(0, 0, 100);
      textAlign(CENTER, CENTER);
      textSize(8.5);
      text('O₂', 0, 0);
    } else {
      // Spiky blue Deoxy-Hb hazard
      fill(215, 85, 92, 0.28);
      noStroke();
      ellipse(0, 0, tk.r * 2.6, tk.r * 2.6);
      stroke(210, 90, 100);
      fill(220, 75, 45);
      strokeWeight(1.8);
      ellipse(0, 0, tk.r * 1.9, tk.r * 1.9);
      noStroke();
      fill(205, 80, 100);
      textAlign(CENTER, CENTER);
      textSize(8);
      text('HHb', 0, 0);
    }
    pop();
  }

  // Particle bursts
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= 0.04;
    if (pt.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    fill(pt.hue, 85, 100, pt.life);
    ellipse(pt.x, pt.y, 6 * pt.life, 6 * pt.life);
  }

  // Draw the Red Blood Cell Surfer Craft
  push();
  translate(surferX, surferY);
  const systolicBoost = pulse > 0.68;
  if (systolicBoost) {
    fill(45, 90, 100, 0.28);
    noStroke();
    ellipse(0, 0, 52, 52);
  }
  fill(355, 90, 98);
  stroke(0, 0, 100);
  strokeWeight(2);
  ellipse(0, 0, 34, 24);
  fill(355, 70, 75);
  noStroke();
  ellipse(0, 0, 16, 10);
  pop();

  // Top HUD Bar
  fill(225, 35, 12, 0.92);
  noStroke();
  rect(0, 0, width, 46);

  fill(0, 0, 98);
  textAlign(LEFT, CENTER);
  textSize(14);
  text(`🏄 PPG PULSE SURFER   SCORE: ${score}`, 16, 23);

  fill(190, 80, 98);
  textSize(12);
  text(`SpO₂: ${spo2Meter.toFixed(1)}%   HR: ${bpm} BPM   Pulse: ${(pulse * 100).toFixed(0)}%`, width - 350, 23);
}
