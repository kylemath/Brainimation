/**
 * @id neurotech2025HardiPNeuroArtTracing
 * @title NeuroArt Star Template Tracing & Sound (Hardi Patel)
 * @category 2025 Neurotech Class Catalogue
 * @order 39
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Interactive star-and-spiral tracing canvas where brush color and musical pitch shift with live Alpha and Beta waves.
 */
// --- NeuroArt Tracing with Alpha/Beta + Sound (STABLE & CORRECT) ---


var alphaLevel = 0;
var betaLevel = 0;


// ---- SOUND ----
let notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
let synth;
let lastNoteTime = 0;
let isPlaying = false;


function setup() {
  colorMode(HSB, 360, 100, 100);
  background(0, 0, 100); // draw ONCE


  // ---- DRAW TEMPLATE ONCE (UNDER EVERYTHING) ----
  drawFunTemplate();


  // ---- AUDIO ----
  if (typeof p5.PolySynth !== 'undefined') {
    synth = new p5.PolySynth();
  }
}


function draw() {
  // --- EEG INPUT ---
  if (typeof eegData !== 'undefined') {
    alphaLevel = eegData.alpha || 0;
    betaLevel  = eegData.beta  || 0;
  } else {
    alphaLevel = (sin(frameCount * 0.01) + 1) / 2;
    betaLevel  = (cos(frameCount * 0.015) + 1) / 2;
  }

  // If user hasn't dragged yet, auto-trace along the flower mandala petal path
  if (!mouseIsPressed && frameCount < 240) {
    let a1 = (frameCount - 1) * 0.06;
    let a2 = frameCount * 0.06;
    let r1 = 120 + 40 * sin(6 * a1);
    let r2 = 120 + 40 * sin(6 * a2);
    let x1 = width / 2 + r1 * cos(a1);
    let y1 = height / 2 + r1 * sin(a1);
    let x2 = width / 2 + r2 * cos(a2);
    let y2 = height / 2 + r2 * sin(a2);
    strokeWeight(map(alphaLevel, 0, 1, 7, 3));
    let hue = betaLevel >= alphaLevel ? map(betaLevel, 0, 1, 190, 230) : map(alphaLevel, 0, 1, 10, 355);
    stroke(hue, 80, 85);
    line(x1, y1, x2, y2);
  }


  // --- SOUND ONLY (NO VISUALS) ---
  if (isPlaying && millis() - lastNoteTime > map(alphaLevel, 0, 1, 900, 350)) {
    playBrainNote();
    lastNoteTime = millis();
  }
}


// --- FUN TRACE TEMPLATE (FLOWER / MANDALA) ---
function drawFunTemplate() {
  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(0, 0, 70);
  strokeWeight(3);


  beginShape();
  for (let a = 0; a < TWO_PI * 4; a += 0.02) {
    let r = 120 + 40 * sin(6 * a);
    let x = r * cos(a);
    let y = r * sin(a);
    vertex(x, y);
  }
  endShape();


  pop();
}


// --- DRAWING (ALWAYS ABOVE TEMPLATE) ---
function mouseDragged() {


  let thickness = map(alphaLevel, 0, 1, 8, 3);
  strokeWeight(thickness);


  let hue, sat, bri;


  if (betaLevel >= alphaLevel) {
    // 🔵 Beta → teal → deep royal blue
    hue = map(betaLevel, 0, 1, 190, 230);
    sat = map(betaLevel, 0, 1, 60, 90);
    bri = map(betaLevel, 0, 1, 90, 70);
  } else {
    // 🔴 Alpha → coral → blood → burgundy
    hue = map(alphaLevel, 0, 1, 10, 355);
    sat = map(alphaLevel, 0, 1, 60, 95);
    bri = map(alphaLevel, 0, 1, 95, 60);
  }


  stroke(hue, sat, bri);
  line(pmouseX, pmouseY, mouseX, mouseY);
}


// --- SOUND NOTE ---
function playBrainNote() {
  let noteIndex = floor(map(alphaLevel, 0, 1, 0, notes.length));
  noteIndex = constrain(noteIndex, 0, notes.length - 1);


  let duration = map(betaLevel, 0, 1, 0.15, 0.5);
  let velocity = map(alphaLevel, 0, 1, 0.3, 0.9);


  synth.play(notes[noteIndex], velocity, 0, duration);
}


// --- CLICK TO START / STOP MUSIC ---
function mousePressed() {
  userStartAudio();
  isPlaying = !isPlaying;
}
