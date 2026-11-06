/**
 * @id neurotech2025RanaRPainterlyEegCanvas
 * @title Living Painterly EEG Canvas & Sound (Rana Radiansyah)
 * @category 2025 Neurotech Class Catalogue
 * @order 78
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Painterly generative canvas combining indigo Theta micro-textures, flowing Alpha/Beta ribbons, Delta depth, and ambient WebAudio synthesis.
 */
// Brainwave Living Painterly EEG – Indigo Theta (Micro Background) + Soft Delta + Sound
let ribbons = [];
let synth;
let lastEventTime = 0;

// ------------------- Bands -------------------
const bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
let bandColors = {
  delta: { h: 30, s: 60, b: 90 },
  theta: { h: 265, s: 40, b: 85 },
  alpha: { h: 320, s: 70, b: 90 },
  beta: { h: 210, s: 80, b: 90 },
  gamma: { h: 0, s: 0, b: 100 }
};

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  background(0);
  synth = new p5.PolySynth();
  if (!window.eegData) {
    window.eegData = {
      connected: false,
      simulating: true,
      alpha: 0.5,
      beta: 0.5,
      theta: 0.5,
      delta: 0.5,
      gamma: 0.5,
      meditation: 0.5,
      attention: 0.5
    };
  }
}

function draw() {
  // painterly fade
  noStroke();
  fill(0, 0, 0, 0.02);
  rect(0, 0, width, height);
  
  let interval = map(eegData.attention, 0, 1, 1000, 240);
  if (millis() - lastEventTime > interval) {
    createRibbon();
    playBrainSound();
    lastEventTime = millis();
  }
  
  for (let r of ribbons) {
    updateRibbon(r);
    drawRibbon(r);
  }
  
  drawHUD();
}

// ------------------- Ribbon Creation -------------------
function createRibbon() {
  let ribbon = { ribbons: {} };
  ribbon.ribbons.alpha = makeWave('alpha', height * 0.9);
  ribbon.ribbons.beta = makeWave('beta', 80);
  ribbon.ribbons.gamma = makeWave('gamma', 200);
  
  // THETA — VERY SMALL, BACKGROUND TEXTURE
  ribbon.ribbons.theta = {
    x: random(width),
    y: random(height),
    size: map(eegData.theta, 0, 1, 18, 45), // <<< WAY SMALLER
    hue: bandColors.theta.h,
    alpha: map(eegData.theta, 0, 1, 0.04, 0.1),
    offsetX: random(1000),
    offsetY: random(2000),
    wobbleX: random(3, 8),
    wobbleY: random(3, 8)
  };
  
  // Delta – soft atmospheric mist
  ribbon.ribbons.delta = {
    x: random(width),
    y: random(height),
    hue: bandColors.delta.h,
    alpha: map(eegData.delta, 0, 1, 0.03, 0.12),
    offsetX: random(1000),
    offsetY: random(2000)
  };
  
  ribbons.push(ribbon);
  if (ribbons.length > 260) ribbons.shift();
}

function makeWave(band, ampMax) {
  return {
    x: random(width),
    y: random(height),
    length: random(100, 300),
    amplitude: map(eegData[band], 0, 1, 30, ampMax),
    frequency: map(eegData[band], 0, 1, 0.004, 0.02),
    hue: bandColors[band].h,
    alpha: map(eegData[band], 0, 1, 0.2, 0.55),
    strokeWeight: map(eegData[band], 0, 1, 1, 10),
    offsetX: random(1000),
    offsetY: random(2000)
  };
}

// ------------------- Update -------------------
function updateRibbon(r) {
  for (let k in r.ribbons) {
    let w = r.ribbons[k];
    if (w.offsetX) {
      w.x += map(noise(w.offsetX), 0, 1, -0.3, 0.3);
      w.y += map(noise(w.offsetY), 0, 1, -0.3, 0.3);
      w.offsetX += 0.002;
      w.offsetY += 0.002;
    }
  }
}

// ------------------- Draw -------------------
function drawRibbon(r) {
  // --- THETA BACKGROUND MICRO LAYER ---
  let t = r.ribbons.theta;
  if (t) {
    push();
    noStroke();
    blendMode(ADD);
    // faint halo
    fill(t.hue, 30, 70, t.alpha * 0.3);
    ellipse(t.x, t.y, t.size * 1.8, t.size * 1.8);
    // core micro blob
    fill(t.hue, 35, 80, t.alpha);
    ellipse(
      t.x,
      t.y,
      t.size + sin(frameCount * 0.006) * t.wobbleX,
      t.size + cos(frameCount * 0.006) * t.wobbleY
    );
    pop();
  }
  
  // --- MIDGROUND WAVES ---
  if (r.ribbons.alpha) drawWave(r.ribbons.alpha, true);
  if (r.ribbons.beta) drawWave(r.ribbons.beta);
  if (r.ribbons.gamma) drawWave(r.ribbons.gamma);
  
  // --- DELTA ATMOSPHERIC DEPTH ---
  let d = r.ribbons.delta;
  if (d) {
    push();
    stroke(d.hue, 40, 70, d.alpha * 0.6);
    strokeWeight(1.3);
    for (let i = 0; i < 4; i++) {
      line(
        d.x,
        d.y + i * 18 + sin(frameCount * 0.01 + i) * 20,
        d.x + width,
        d.y + i * 18
      );
    }
    pop();
  }
}

// ------------------- Wave -------------------
function drawWave(w, soft = false) {
  push();
  translate(w.x, w.y);
  noFill();
  for (let i = 0; i < w.length; i++) {
    let y =
      sin(i * w.frequency + frameCount * 0.01) *
      w.amplitude *
      noise(i * 0.05, frameCount * 0.002);
    let a = w.alpha * map(i, 0, w.length, 1, 0);
    if (soft) a *= 0.7;
    stroke(w.hue, 80, 90, a);
    strokeWeight(w.strokeWeight * map(i, 0, w.length, 0.5, 1));
    point(i, y);
  }
  pop();
}

// ------------------- Sound -------------------
function playBrainSound() {
  let vel = map(eegData.meditation, 0, 1, 0.25, 0.6);
  let dur = map(eegData.beta, 0, 1, 0.06, 0.2);
  synth.play(map(eegData.alpha, 0, 1, 200, 700), vel, 0, dur);
  synth.play(map(eegData.beta, 0, 1, 400, 900), vel * 0.8, 0, dur * 0.8);
  synth.play(map(eegData.theta, 0, 1, 150, 350), vel * 0.5, 0, dur * 1.3);
  synth.play(map(eegData.delta, 0, 1, 60, 140), vel * 0.4, 0, dur * 1.6);
  synth.play(map(eegData.gamma, 0, 1, 900, 1800), vel, 0, dur * 0.6);
}

// ------------------- HUD -------------------
function drawHUD() {
  fill(0, 0, 100);
  textSize(10);
  textAlign(LEFT, TOP);
  text('🎨 Living Painterly EEG Canvas', 10, 10);
  text('Theta (indigo): micro background texture', 10, 26);
  text('Alpha/Beta: painterly waves', 10, 40);
  text('Delta: atmospheric depth', 10, 54);
  if (!eegData.connected) {
    fill(0, 0, 70);
    text('⚠ Using Simulated Data', 10, 72);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
