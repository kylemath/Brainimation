/**
 * @id eegeduPiWedges
 * @title Radial Band Wedges (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 15
 *
 * Original piWedges.p5 sketch by Kyle Mathewson.
 * Displays the 5 frequency bands as fixed-angle wedges whose radius and brightness scale with power.
 */
function setup() {
  noStroke();
  colorMode(HSB, 100, 255, 255, 1);
  frameRate(10);
}

function draw() {
  background(0, 0, 128);

  let tao = TWO_PI;
  let nbands = 5;
  let part = tao / nbands;

  let DELTA = eegData.getChannelBand('delta', 0) * 35;
  let THETA = eegData.getChannelBand('theta', 0) * 35;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 35;
  let BETA  = eegData.getChannelBand('beta', 0) * 35;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 35;

  let size = 10;
  let cx = width / 2;
  let cy = height / 2;

  fill(1, 255, DELTA * size);
  arc(cx, cy, DELTA * size, DELTA * size, -PI, -PI + part);

  fill(20, 255, THETA * size);
  arc(cx, cy, THETA * size, THETA * size, -PI + part, -PI + part * 2);

  fill(40, 255, ALPHA * size);
  arc(cx, cy, ALPHA * size, ALPHA * size, -PI + part * 2, -PI + part * 3);

  fill(60, 255, ALPHA * size);
  arc(cx, cy, BETA * size, BETA * size, -PI + part * 3, -PI + part * 4);

  fill(80, 255, GAMMA * size);
  arc(cx, cy, GAMMA * size, GAMMA * size, -PI + part * 4, -PI + part * 5);
}
