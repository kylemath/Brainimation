/**
 * @id studentSchulzMySketch
 * @title Minimalist Alpha-Gamma Circle (Schulz)
 * @category 2022 NeuroArt Class Gallery
 * @order 22
 *
 * Student NeuroArt Project by Schulz.
 * Maps Alpha to X position, Gamma to Y position, and Beta to circle diameter.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(50);

  let ALPHA = eegData.getChannelBand('alpha', 0) * width;
  let GAMMA = eegData.getChannelBand('gamma', 0) * height;
  let BETA  = 20 + eegData.getChannelBand('beta', 0) * 180;

  fill(255);
  stroke(0);
  circle(ALPHA, GAMMA, BETA);
}
