/**
 * @id studentHomeakFinalProject
 * @title Five Band Circles (Kira Homeak)
 * @category 2022 NeuroArt Class Gallery
 * @order 9
 *
 * Student NeuroArt Project by Kira Homeak.
 * Five labeled circles arranged in a quincunx that change size and color with each EEG frequency band.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(30);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 2) * 600;
  let THETA = eegData.getChannelBand('theta', 1) * 600;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 600;
  let BETA  = eegData.getChannelBand('beta', 0) * 600;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 600;

  background(255, 255, 200);
  stroke(2);
  textSize(16);

  fill(ALPHA / 2, 50, 50);
  circle(width / 4, height / 4, ALPHA / 4);
  fill(0);
  text('alpha', width / 4 - 25, height / 4);

  fill(50, BETA / 2, 50);
  circle(width - width / 4, height / 4, BETA / 4);
  fill(0);
  text('beta', width - width / 4 - 25, height / 4);

  fill(50, 50, THETA / 2);
  circle(width / 4, height - height / 4, THETA / 4);
  fill(0);
  text('theta', width / 4 - 25, height - height / 4);

  fill(GAMMA / 2, 50, GAMMA / 2);
  ellipse(width - width / 4, height - height / 4, GAMMA / 4);
  fill(0);
  text('gamma', width - width / 4 - 25, height - height / 4);

  fill(DELTA / 2, DELTA / 2, 50);
  ellipse(width / 2, height / 2, DELTA / 4);
  fill(0);
  text('delta', width / 2 - 20, height / 2);
}
