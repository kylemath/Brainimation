/**
 * @id eegeduSplineBounce
 * @title Frequency Band Spline (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 7
 *
 * Original SplineBounce.p5 sketch by Kyle Mathewson.
 * Draws a smooth spline curve through the 5 EEG frequency bands (D, T, A, B, G).
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  clickValue = 0;
  textSize(40);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * height * 0.7;
  let THETA = eegData.getChannelBand('theta', 0) * height * 0.7;
  let ALPHA = eegData.getChannelBand('alpha', 0) * height * 0.7;
  let BETA  = eegData.getChannelBand('beta', 0) * height * 0.7;
  let GAMMA = eegData.getChannelBand('gamma', 0) * height * 0.7;

  let bands = ['D', 'T', 'A', 'B', 'G'];
  let xs = [width * 0.1, width * 0.3, width * 0.5, width * 0.7, width * 0.9];
  let ys = [height - DELTA - 40, height - THETA - 40, height - ALPHA - 40, height - BETA - 40, height - GAMMA - 40];

  background(200, clickValue, 210);

  noFill();
  stroke(0);
  strokeWeight(3);
  beginShape();
  curveVertex(xs[0], ys[0]);
  for (let i = 0; i < 5; i++) {
    curveVertex(xs[i], ys[i]);
  }
  curveVertex(xs[4], ys[4]);
  endShape();

  fill(0);
  for (let i = 0; i < 5; i++) {
    ellipse(xs[i], ys[i], 12, 12);
    text(bands[i], xs[i] - 15, ys[i] - 15);
  }
}

function mouseClicked() {
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
