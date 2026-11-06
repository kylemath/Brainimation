/**
 * @id imuHeadTheremin
 * @title 🎵 Cosmic Head Theremin (Pitch/Roll Antennas + Alpha Vibrato)
 * @category Motion, IMU & Broadcast Sensors
 * @order 7
 */

// 🎵 Cosmic Head Theremin (Interactive IMU + EEG Musical Instrument)
// Play a real-time synthesizer hands-free using your head movement and brainwaves!
//   - Vertical Pitch Antenna (Head Pitch `eegData.pitch`): Controls note frequency (130 Hz C3 – 1046 Hz C6)
//   - Horizontal Volume Loop (Head Roll `eegData.roll`): Controls volume/expressionswell
//   - EEG Alpha Waves (`eegData.alpha`): Modulates warm vibrato depth & harmonic shimmer
//   - Gyroscope Spin (`eegData.gyro.magnitude`): Opens the resonant low-pass filter
//
// Controls:
//   - Click anywhere on the canvas to toggle audio ON / OFF
//   - Press 'S' to toggle between Continuous Theremin Glide and Pentatonic Quantized Scale
//   - Move mouse if disconnected to preview the theremin hands-on!

let audioStarted = false;
let mainOsc = null;
let subOsc = null;
let lfoOsc = null;
let quantizedMode = false;

let curFreq = 440;
let curAmp = 0.25;
let smoothPitch = 0;
let smoothRoll = 0;
let smoothAlpha = 0.4;
let waveHistory = [];
let particles = [];
let simT = 0;

// C Major Pentatonic frequencies across 3 octaves (C3 to C6)
const PENTATONIC_FREQS = [
  130.81, 146.83, 164.81, 196.00, 220.00,
  261.63, 293.66, 329.63, 392.00, 440.00,
  523.25, 587.33, 659.25, 783.99, 880.00, 1046.50
];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      r: random(2, 6),
      hue: random(170, 310)
    });
  }
}

function startThereminAudio() {
  if (typeof p5.Oscillator === 'undefined') return;
  try {
    if (typeof userStartAudio === 'function') userStartAudio();
    if (!mainOsc) {
      mainOsc = new p5.Oscillator('sine');
      subOsc = new p5.Oscillator('triangle');
      mainOsc.freq(440);
      subOsc.freq(220);
      mainOsc.amp(0);
      subOsc.amp(0);
      mainOsc.start();
      subOsc.start();
    }
    audioStarted = true;
  } catch (err) {
    console.warn('Theremin audio start error:', err);
  }
}

function stopThereminAudio() {
  if (mainOsc) mainOsc.amp(0, 0.15);
  if (subOsc) subOsc.amp(0, 0.15);
  audioStarted = false;
}

function freqToNoteName(f) {
  let midi = Math.round(69 + 12 * Math.log2(Math.max(20, f) / 440));
  let name = NOTE_NAMES[((midi % 12) + 12) % 12];
  let oct = Math.floor(midi / 12) - 1;
  return `${name}${oct}`;
}

function draw() {
  background(232, 48, 8, 0.35);
  simT += 0.03;

  // Read head Pitch & Roll from eegData (or mouse / procedural demo when disconnected)
  let rawPitch = 0, rawRoll = 0, alphaVal = 0.4, gyroMag = 15;
  if (eegData && eegData.connected) {
    rawPitch = eegData.pitch || 0;
    rawRoll = eegData.roll || 0;
    alphaVal = eegData.alpha || 0.4;
    gyroMag = eegData.gyro ? eegData.gyro.magnitude : 15;
  } else if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    rawPitch = map(mouseY, height, 0, -35, 35);
    rawRoll = map(mouseX, 0, width, -35, 35);
    alphaVal = 0.45 + 0.25 * sin(simT * 0.8);
  } else {
    rawPitch = 22 * sin(simT * 0.7) + 8 * cos(simT * 1.9);
    rawRoll = 20 * cos(simT * 0.5);
    alphaVal = 0.45 + 0.25 * sin(simT * 0.8);
  }

  smoothPitch = lerp(smoothPitch, constrain(rawPitch, -40, 40), 0.18);
  smoothRoll = lerp(smoothRoll, constrain(rawRoll, -40, 40), 0.18);
  smoothAlpha = lerp(smoothAlpha, alphaVal, 0.15);

  // Map Head Pitch (-35° to +35°) to Frequency (130.8 Hz to 1046.5 Hz)
  let pitchNorm = constrain(map(smoothPitch, -35, 35, 0, 1), 0, 1);
  let targetFreq = 130.81 * pow(2, pitchNorm * 3.0);

  if (quantizedMode) {
    let best = PENTATONIC_FREQS[0];
    let bestDist = abs(targetFreq - best);
    for (let pf of PENTATONIC_FREQS) {
      let d = abs(targetFreq - pf);
      if (d < bestDist) { bestDist = d; best = pf; }
    }
    targetFreq = best;
  }

  // EEG Alpha wave adds expressive vibrato
  let vibratoHz = sin(simT * 12.0) * (targetFreq * 0.018 * smoothAlpha);
  curFreq = lerp(curFreq, targetFreq, quantizedMode ? 0.35 : 0.22) + vibratoHz;

  // Map Head Roll (-35° to +35°) to Volume (0.02 to 0.42)
  let rollNorm = constrain(map(smoothRoll, -35, 35, 0.05, 1.0), 0.02, 1.0);
  curAmp = rollNorm * 0.38;

  if (audioStarted && mainOsc && subOsc) {
    mainOsc.freq(constrain(curFreq, 60, 2000), 0.04);
    subOsc.freq(constrain(curFreq * 0.5, 30, 1000), 0.04);
    mainOsc.amp(curAmp, 0.05);
    subOsc.amp(curAmp * 0.35 * (0.4 + smoothAlpha * 0.6), 0.05);
  }

  // Draw fret guide lines across the stage
  drawNoteGrid();

  // Draw Theremin Hardware Cabinet, Vertical Pitch Rod & Horizontal Volume Loop
  drawThereminAntennas(pitchNorm, rollNorm);

  // Draw glowing electromagnetic aura & live acoustic waveform
  drawThereminBeamAndWave(pitchNorm, rollNorm, gyroMag);

  // Draw HUD banner
  drawThereminHUD(pitchNorm, rollNorm);
}

function drawNoteGrid() {
  for (let i = 0; i < PENTATONIC_FREQS.length; i++) {
    let f = PENTATONIC_FREQS[i];
    let norm = Math.log2(f / 130.81) / 3.0;
    let y = map(norm, 0, 1, height - 75, 75);
    stroke(210, 45, 45, quantizedMode ? 0.38 : 0.16);
    strokeWeight(quantizedMode ? 1.4 : 0.8);
    line(95, y, width - 30, y);

    noStroke();
    fill(200, 40, 75, 0.65);
    textSize(9);
    textAlign(RIGHT, CENTER);
    text(`${freqToNoteName(f)} (${Math.round(f)}Hz)`, width - 36, y - 7);
  }
}

function drawThereminAntennas(pitchNorm, rollNorm) {
  let baseX = 95;
  let baseY = height - 55;

  // Horizontal Volume Loop Antenna (left side)
  noFill();
  stroke(185, 85, 95, 0.85);
  strokeWeight(4);
  arc(baseX - 28, baseY - 12, 84, 38, PI * 0.6, PI * 1.45);

  // Vertical Pitch Rod Antenna
  stroke(50, 20, 95, 0.9);
  strokeWeight(5);
  line(baseX, baseY - 18, baseX, 68);
  noStroke();
  fill(48, 90, 100);
  ellipse(baseX, 68, 14, 14);

  // Concentric electromagnetic field rings around pitch antenna tip
  let hue = map(pitchNorm, 0, 1, 180, 320);
  noFill();
  for (let r = 1; r <= 4; r++) {
    let rad = r * 26 + ( (simT * 28) % 26 );
    stroke(hue, 80, 100, map(r, 1, 4, 0.45, 0.05));
    strokeWeight(1.5);
    ellipse(baseX, 68, rad * 2, rad * 2);
  }

  // Wooden/Metallic Theremin Cabinet Base
  fill(230, 50, 24);
  stroke(195, 70, 80);
  strokeWeight(2);
  rect(baseX - 36, baseY - 22, 92, 34, 6);
}

function drawThereminBeamAndWave(pitchNorm, rollNorm, gyroMag) {
  let orbX = map(rollNorm, 0.02, 1.0, 155, width - 90);
  let orbY = map(pitchNorm, 0, 1, height - 75, 75);
  let hue = (map(pitchNorm, 0, 1, 175, 330) + 360) % 360;

  // Ambient harmonic particles
  noStroke();
  for (let p of particles) {
    p.x += sin(simT + p.y * 0.01) * (0.5 + rollNorm * 2.5);
    p.y -= (0.4 + pitchNorm * 2.2);
    if (p.y < 50) p.y = height - 50;
    if (p.x > width) p.x = 100;
    fill((hue + 30) % 360, 75, 95, 0.35);
    ellipse(p.x, p.y, p.r * (0.8 + smoothAlpha));
  }

  // Energy beam connecting vertical Pitch Antenna to Head Orb
  stroke(hue, 85, 100, 0.65);
  strokeWeight(2 + rollNorm * 4);
  noFill();
  beginShape();
  for (let i = 0; i <= 40; i++) {
    let t = i / 40;
    let bx = lerp(95, orbX, t);
    let by = lerp(68, orbY, t) + sin(t * TWO_PI * (2 + pitchNorm * 6) - simT * 8) * (18 * rollNorm * sin(t * PI));
    vertex(bx, by);
  }
  endShape();

  // Oscilloscope ring around the Head Cursor Orb
  let baseR = 28 + rollNorm * 32;
  stroke(hue, 80, 100, 0.95);
  strokeWeight(2.5);
  fill(hue, 85, 95, 0.18);
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.12) {
    let mod = sin(a * (4 + Math.round(pitchNorm * 8)) + simT * 10) * (10 * rollNorm + 8 * smoothAlpha);
    let r = baseR + mod;
    vertex(orbX + cos(a) * r, orbY + sin(a) * r);
  }
  endShape(CLOSE);

  // Core note readout inside orb
  noStroke();
  fill(0, 0, 100);
  textSize(15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(freqToNoteName(curFreq), orbX, orbY - 5);
  textSize(10);
  textStyle(NORMAL);
  fill(hue, 30, 100);
  text(`${curFreq.toFixed(1)} Hz`, orbX, orbY + 11);
}

function drawThereminHUD(pitchNorm, rollNorm) {
  noStroke();
  fill(230, 55, 14, 0.92);
  rect(0, 0, width, 50);
  stroke(200, 60, 45);
  line(0, 50, width, 50);

  noStroke();
  fill(48, 95, 100);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🎵 COSMIC HEAD THEREMIN — TILT PITCH FOR NOTE, ROLL FOR VOLUME, ALPHA FOR VIBRATO', 14, 16);

  textStyle(NORMAL);
  textSize(11);
  fill(195, 35, 92);
  let scaleStr = quantizedMode ? 'PENTATONIC QUANTIZED [S]' : 'CONTINUOUS GLIDE [S]';
  text(
    `Note: ${freqToNoteName(curFreq)} (${curFreq.toFixed(1)} Hz)  |  Pitch: ${smoothPitch.toFixed(1)}°  |  Roll Vol: ${Math.round(rollNorm * 100)}%  |  Alpha Vibrato: ${Math.round(smoothAlpha * 100)}%  |  ${scaleStr}`,
    14, 35
  );

  // Audio status pill button on top right
  let btnW = 158, btnH = 28;
  let btnX = width - btnW - 14, btnY = 11;
  fill(audioStarted ? 145 : 350, 80, 88);
  rect(btnX, btnY, btnW, btnH, 6);
  fill(0, 0, 100);
  textStyle(BOLD);
  textSize(11);
  textAlign(CENTER, CENTER);
  text(audioStarted ? '🔊 AUDIO ON (Click)' : '🔇 CLICK TO PLAY', btnX + btnW * 0.5, btnY + btnH * 0.5);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (!audioStarted) {
      startThereminAudio();
    } else {
      stopThereminAudio();
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    quantizedMode = !quantizedMode;
  }
}
