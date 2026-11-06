/**
 * @id imuHeadBopSynth
 * @title 🥁 Head-Bop Kinetic Drum Pad & Gyro Filter Synth
 * @category Motion, IMU & Broadcast Sensors
 * @order 10
 */

// 🥁 Head-Bop Kinetic Drum Pad & Gyro Filter Synth
// Nod or tilt your head to trigger kinetic percussion pads and sweep a synth bassline!
//   - Accelerometer G-Force Jolts (`eegData.accel.magnitude`): Triggers Kick/Snare on head bops
//   - Directional Head Tilt (`eegData.pitch`, `eegData.roll`): Activates 4 directional synth pads
//   - Gyroscope Spin Rate (`eegData.gyro.magnitude`): Modulates arpeggiator note energy
//   - Click anywhere on canvas to toggle WebAudio sound synthesis ON/OFF!

let soundActive = false;
let synthOsc = null;
let noiseGen = null;
let padFlashes = [0, 0, 0, 0];
let centerKickFlash = 0;
let lastBopTime = 0;
let bopCount = 0;
let ripples = [];
let simT = 0;

const PADS = [
  { name: 'FORWARD NOD (HI-SYNTH)', note: 523.25, col: [56, 189, 248],  dx: 0,  dy: -1 },
  { name: 'RIGHT TILT (CHORD A)',   note: 440.00, col: [52, 211, 153],  dx: 1,  dy: 0 },
  { name: 'BACK TILT (BASS G)',     note: 196.00, col: [250, 204, 21],  dx: 0,  dy: 1 },
  { name: 'LEFT TILT (ARP E)',      note: 329.63, col: [192, 132, 252], dx: -1, dy: 0 }
];

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function toggleDrumAudio() {
  if (typeof p5.Oscillator === 'undefined') return;
  try {
    if (typeof userStartAudio === 'function') userStartAudio();
    if (!synthOsc) {
      synthOsc = new p5.Oscillator('triangle');
      synthOsc.amp(0);
      synthOsc.start();
    }
    soundActive = !soundActive;
    if (!soundActive) synthOsc.amp(0, 0.1);
  } catch (e) {
    console.warn(e);
  }
}

function triggerTone(freq, durMs) {
  if (!soundActive || !synthOsc) return;
  synthOsc.freq(freq, 0.01);
  synthOsc.amp(0.35, 0.01);
  setTimeout(() => {
    if (synthOsc) synthOsc.amp(0, 0.12);
  }, durMs || 140);
}

function draw() {
  background(10, 14, 24);
  simT += 0.035;

  let pitch = 0, roll = 0, accelMag = 1.0, gyroMag = 15;
  if (eegData && eegData.connected) {
    pitch = eegData.pitch || 0;
    roll = eegData.roll || 0;
    accelMag = eegData.accel ? eegData.accel.magnitude : 1.0;
    gyroMag = eegData.gyro ? eegData.gyro.magnitude : 15;
  } else {
    pitch = 22 * sin(simT * 1.3);
    roll = 22 * cos(simT * 0.95);
    accelMag = 1.0 + pow(max(0, sin(simT * 2.6)), 10) * 0.35;
    gyroMag = 35 + 25 * sin(simT * 1.8);
  }

  let cx = width * 0.5;
  let cy = height * 0.56;
  let R = min(width, height - 70) * 0.32;

  // Detect kinetic head-bop acceleration peak (||a|| > 1.16g)
  let now = millis();
  if (accelMag > 1.16 && now - lastBopTime > 260) {
    lastBopTime = now;
    bopCount++;
    centerKickFlash = 1.0;
    ripples.push({ x: cx, y: cy, r: 20, col: [248, 113, 113], alpha: 240 });

    // Determine which directional pad is tilted most
    let activePad = 0;
    if (abs(pitch) > abs(roll)) {
      activePad = pitch > 0 ? 0 : 2;
    } else {
      activePad = roll > 0 ? 1 : 3;
    }
    padFlashes[activePad] = 1.0;
    triggerTone(PADS[activePad].note, 160);
  }

  // Draw expanding kinetic shockwave ripples
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--) {
    let rp = ripples[i];
    rp.r += 5.5;
    rp.alpha -= 6;
    stroke(rp.col[0], rp.col[1], rp.col[2], rp.alpha);
    strokeWeight(2.5);
    ellipse(rp.x, rp.y, rp.r * 2, rp.r * 2);
    if (rp.alpha <= 0) ripples.splice(i, 1);
  }

  // Draw 4 Directional Tilt Synth Pads
  for (let i = 0; i < PADS.length; i++) {
    let p = PADS[i];
    padFlashes[i] *= 0.92;
    let px = cx + p.dx * R;
    let py = cy + p.dy * R;

    fill(p.col[0], p.col[1], p.col[2], 35 + padFlashes[i] * 180);
    stroke(p.col[0], p.col[1], p.col[2], 180 + padFlashes[i] * 75);
    strokeWeight(2 + padFlashes[i] * 3);
    rectMode(CENTER);
    rect(px, py, 145, 58, 10);
    rectMode(CORNER);

    noStroke();
    fill(245, 250, 255);
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(p.name, px, py - 8);
    fill(p.col[0], p.col[1], p.col[2]);
    textSize(9.5);
    textStyle(NORMAL);
    text(`${p.note} Hz`, px, py + 10);
  }

  // Center Kinetic Kick Pad + Live Head Tilt Cursor
  centerKickFlash *= 0.90;
  fill(248, 113, 113, 40 + centerKickFlash * 170);
  stroke(248, 113, 113);
  strokeWeight(2.5);
  ellipse(cx, cy, 88 + centerKickFlash * 24, 88 + centerKickFlash * 24);

  noStroke();
  fill(255);
  textSize(10.5);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('KINETIC BOP', cx, cy - 6);
  textSize(9.5);
  textStyle(NORMAL);
  text(`||a||=${accelMag.toFixed(2)}g`, cx, cy + 10);

  // Live head tilt striker dot
  let sx = cx + constrain(roll / 30, -1, 1) * R;
  let sy = cy - constrain(pitch / 30, -1, 1) * R;
  stroke(250, 204, 21, 180);
  strokeWeight(2);
  line(cx, cy, sx, sy);
  noStroke();
  fill(250, 204, 21);
  ellipse(sx, sy, 18, 18);

  drawHeader(accelMag, gyroMag);
}

function drawHeader(accelMag, gyroMag) {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 48);
  stroke(45, 65, 100);
  line(0, 48, width, 48);

  noStroke();
  fill(250, 204, 21);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🥁 HEAD-BOP KINETIC DRUM PAD & GYRO SYNTH — NOD TO TRIGGER, TILT TO SELECT PAD', 16, 16);

  textStyle(NORMAL);
  fill(180, 205, 235);
  textSize(11);
  text(`BOP TRIGGERS: ${bopCount}   |   G-Force ||a||: ${accelMag.toFixed(2)} g   |   Gyro Spin ||ω||: ${gyroMag.toFixed(0)} °/s   |   ${soundActive ? '🔊 SYNTH ON (Click to Mute)' : '🔇 CLICK CANVAS FOR SOUND'}`, 16, 35);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    toggleDrumAudio();
  }
}
