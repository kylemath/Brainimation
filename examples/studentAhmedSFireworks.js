/**
 * @id studentAhmedSFireworks
 * @title Fireworks-VF (Sharmin Ahmed)
 * @category 2022 NeuroArt Class Gallery
 * @order 2
 *
 * Student NeuroArt Project by Sharmin Ahmed.
 * Draws glowing bursts positioned by Alpha and Gamma waves and colored by Theta, Delta, and Beta.
 */
let myFireworks = [];
let posX = 0;
let posY = 0;
let brushWidth = 25;
let DELTA = 0, THETA = 0, ALPHA = 0, BETA = 0, GAMMA = 0;

class Fireworks {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;
  }
  display() {
    fill(THETA, DELTA, BETA);
    circle(posX, posY, brushWidth);
  }
}

function setup() {
  colorMode(RGB, 255);
  background(0);
  posX = width / 2;
  posY = height / 2;
  brushWidth = 25;
  noStroke();
  myFireworks = [new Fireworks(posX, posY, brushWidth)];
}

function draw() {
  DELTA = eegData.getChannelBand('delta', 0) * 255;
  THETA = eegData.getChannelBand('theta', 3) * 255;
  ALPHA = eegData.getChannelBand('alpha', 2) * width;
  BETA  = eegData.getChannelBand('beta', 3) * 255;
  GAMMA = eegData.getChannelBand('gamma', 0) * height;

  posX = ALPHA;
  posY = GAMMA;

  for (let f = 0; f < myFireworks.length; f++) {
    myFireworks[f].display();
    fill(THETA, DELTA, BETA, 150);
    circle(posX, posY, brushWidth);
  }
}

function mousePressed() {
  background(0);
}
