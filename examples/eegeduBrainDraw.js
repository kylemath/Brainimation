/**
 * @id eegeduBrainDraw
 * @title Brain Draw Brush (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 4
 *
 * Original BrainDraw.p5 sketch by Kyle Mathewson.
 * Uses frequency bands to directly map cursor location (Alpha/Beta) and RGB shade (Theta/Delta/Gamma).
 */
let xVar = 0;
let yVar = 0;
let brushWidth = 50;

function setup() {
  colorMode(RGB, 255);
  background(128);
  xVar = 0;
  yVar = 0;
  brushWidth = 50;
  noStroke();
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 255;
  let THETA = eegData.getChannelBand('theta', 0) * 255;
  let ALPHA = eegData.getChannelBand('alpha', 0) * width;
  let BETA  = eegData.getChannelBand('beta', 0) * height;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 255;

  xVar = constrain(ALPHA, brushWidth / 2, width - brushWidth / 2);
  yVar = constrain(BETA, brushWidth / 2, height - brushWidth / 2);

  fill(THETA, DELTA, GAMMA, 40);
  ellipse(xVar, yVar, brushWidth);
}

function mousePressed() {
  background(128);
}
