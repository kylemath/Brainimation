/**
 * @id neurotech2025SamirJWaveAffectMonitor
 * @title 4-Lane Wave & Stress/Relax Affect HUD (Samir Jaber)
 * @category 2025 Neurotech Class Catalogue
 * @order 82
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Non-overlapping 4-lane EEG wave visualizer with interactive target lane selection and live Relax vs. Stress affect meters.
 */
// Simple Neurofeedback Wave Visualization + Target Toggle + Stress vs Relax response
// Lanes do not overlap, light smoothing, clean labels
// Press T to cycle target band, click a lane to set target

let waveHistory = [];
let bands = ["alpha", "beta", "theta", "delta"];
let hues = [300, 180, 60, 0]; // HSB hues for the bands
let smooth = { alpha: 0, beta: 0, theta: 0, delta: 0 };
let smoothAmt = 0.85; // higher means smoother
let targetIndex = 0;

// new, live indices
let stressLevel = 0; // 0..1
let relaxLevel = 0; // 0..1

function setup() {
  colorMode(HSB, 360, 100, 100);
  background(0, 0, 10);
}

function draw() {
  // 1) Read current EEG. Assume values in 0..1. Fallback to simple noise if missing.
  
  let reading = getReading();

  // 2) Light smoothing
  for (let b of bands) {
    smooth[b] = lerp(reading[b], smooth[b], smoothAmt);
  }

  // 3) Compute stress and relaxation from smoothed bands
  computeAffectLevels(smooth);

  // 4) Background tint, warm with stress, cool with relaxation
  // mix warm red,0 with cool blue,240 based on relaxLevel, then raise brightness with stress
  let baseHue = lerp(0, 240, relaxLevel); // 0 is warm, 240 is cool
  let baseSat = 20 + 30 * (1 - relaxLevel); // a bit more saturated when less relaxed
  let baseBri = 10 + 25 * stressLevel; // brighter when stressed
  background(baseHue, baseSat, baseBri);

  // 5) Update history, cap size
  waveHistory.push({ ...smooth });
  if (waveHistory.length > width / 2) waveHistory.shift();

  // 6) Draw lanes and waves, with emphasis driven by stress or relax
  drawLanesAndWaves();

  

  // 7) HUD
  noStroke();
  fill(0, 0, 90);
  textAlign(LEFT, TOP);
  textSize(16);
  text("Wave Visualization, real time", 12, 10);

  textSize(12);
  text("Target, " + bands[targetIndex].toUpperCase() + " press T or click a lane", 12, 30);

  // 8) Tiny affect readout
  drawAffectHUD();
}

// ---------- input ----------
function keyPressed() {
  if (key === "t" || key === "T") {
    targetIndex = (targetIndex + 1) % bands.length;
  }
}

function mousePressed() {
  // set target by lane click
  let laneH = height / bands.length;
  let i = floor(mouseY / laneH);
  
  if (i >= 0 && i < bands.length) targetIndex = i;
}

// ---------- affect logic ----------
function computeAffectLevels(b) {
  // Normalize by total power, avoid divide by zero
  const total = max(0.0001, b.alpha + b.beta + b.theta + b.delta);

  // Relax favors alpha relative to the rest
  const relaxRaw = b.alpha / total;

  // Stress favors beta relative to the rest
  const stressRaw = b.beta / total;

  // Gentle mapping into 0..1, center near typical values
  // tweak the constants if your headset yields different distributions
  relaxLevel = constrain(map(relaxRaw, 0.15, 0.45, 0, 1), 0, 1);
  stressLevel = constrain(map(stressRaw, 0.10, 0.40, 0, 1), 0, 1);
}

function drawAffectHUD() {
  // small bars at top right
  const x0 = width - 180;
  const y0 = 12;
  
  const w = 150;
  const h = 8;

  // labels
  fill(0, 0, 85);
  textAlign(LEFT, TOP);
  text("Relax", x0, y0);
  text("Stress", x0, y0 + 18);

  // relax bar, cool hue
  noStroke();
  fill(220, 60, 90);
  rect(x0 + 50, y0 + 2, w * relaxLevel, h);

  // stress bar, warm hue
  fill(10, 80, 90);
  rect(x0 + 50, y0 + 20, w * stressLevel, h);
}

// ---------- helpers ----------
function getReading() {
  if (typeof eegData !== "undefined") {
    return {
      alpha: constrain(eegData.alpha ?? 0, 0, 1),
      
      beta: constrain(eegData.beta ?? 0, 0, 1),
      theta: constrain(eegData.theta ?? 0, 0, 1),
      delta: constrain(eegData.delta ?? 0, 0, 1)
    };
  }

  // simple simulation if no EEG present
  let t = millis() * 0.0008;
  return {
    alpha: 0.5 + 0.3 * noise(t * 1.2),
    beta: 0.4 + 0.3 * noise(t * 1.6 + 10),
    theta: 0.5 + 0.2 * noise(t * 0.9 + 20),
    delta: 0.35 + 0.2 * noise(t * 0.6 + 30)
  };
}

function drawLanesAndWaves() {
  let laneH = height / bands.length;
  let amp = laneH * 0.4; // vertical amplitude inside each lane

  textSize(12);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < bands.length; i++) {
    let band = bands[i];
    
    let hue = hues[i];

    // lane center
    let cy = laneH * i + laneH * 0.65;

    // background highlight for target lane
    if (i === targetIndex) {
      noStroke();
      fill(0, 0, 20, 30);
      rect(0, laneH * i, width, laneH);
    }

    // lane baseline
    stroke(0, 0, 25);
    strokeWeight(1);
    line(0, cy, width, cy);

    // label
    noStroke();
    fill(0, 0, 80);
    text(band.toUpperCase(), 10, cy - laneH * 0.45);

    // adaptive emphasis
    // alpha gets stronger with relaxation, beta gets stronger with stress
    
    let weightBoost = 0;
    let briBoost = 0;

    if (band === "alpha") {
      weightBoost = 2 * relaxLevel; // up to +2 px
      briBoost = 20 * relaxLevel; // brighten with relax
    } else if (band === "beta") {
      weightBoost = 2 * stressLevel;
      briBoost = 20 * stressLevel;
    }

    // target lane is always a tad thicker
    const baseWeight = i === targetIndex ? 3 : 2;
    const strokeW = baseWeight + weightBoost;

    // wave
    stroke(hue, 80, min(95 + briBoost, 100));
    strokeWeight(strokeW);
    noFill();

    beginShape();
    for (let k = 0; k < waveHistory.length; k++) {
      let x = map(k, 0, waveHistory.length - 1, 0, width);
      let v = waveHistory[k][band]; // already 0..1
      let y = cy - v * amp; // draw upward within lane
      
      vertex(x, y);
    }
    endShape();
  }
}
