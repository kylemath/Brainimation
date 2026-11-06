/**
 * @id studentArmstrongFractalTree
 * @title Fractal Tree Blossom (Aislinn Armstrong)
 * @category 2022 NeuroArt Class Gallery
 * @order 3
 *
 * Student NeuroArt Project by Aislinn Armstrong.
 * Recursive branching tree whose blossoms change color with EEG frequency bands.
 */
function setup() {
  colorMode(RGB, 255);
  angleMode(DEGREES);
  frameRate(3);
}

function draw() {
  background(255);
  push();
  translate(width / 2, height * 0.82);
  branch(min(width, height) * 0.16);
  pop();
}

function branch(len) {
  push();
  if (len > 10) {
    strokeWeight(map(len, 10, 100, 1, 15));
    stroke(70, 40, 20);
    line(0, 0, 0, -len);
    translate(0, -len);
    rotate(30);
    branch(len * random(0.7, 0.9));
    rotate(-60);
    branch(len * random(0.7, 0.9));
  } else {
    let DELTA = eegData.getChannelBand('delta', 0) * 50;
    let THETA = eegData.getChannelBand('theta', 0) * 50;
    let ALPHA = eegData.getChannelBand('alpha', 0) * 50;
    let BETA  = eegData.getChannelBand('beta', 0) * 50;
    let GAMMA = eegData.getChannelBand('gamma', 0) * 50;

    let r = random(DELTA, max(DELTA + 10, THETA + ALPHA)) * 5 + random(-30, 30);
    let g = random(THETA, max(THETA + 10, BETA + GAMMA)) * 6 + random(-30, 30);
    let b = random(ALPHA, max(ALPHA + 10, DELTA + BETA)) * 3 + random(-30, 30);
    fill(constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255));
    noStroke();
    ellipse(0, 0, 10);
  }
  pop();
}
