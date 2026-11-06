/**
 * @id eegeduBasicFrequencyBands
 * @title Mouse Band Stack (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 3
 *
 * Original BasicFrequencyBands.p5 sketch by Kyle Mathewson.
 * Demonstration of text and circle animation following the mouse with frequency bands.
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  clickValue = 0;
}

function draw() {
  background(clickValue, 255, 200);

  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let DELTA = eegData.getChannelBand('delta', 0) * 80;
  let THETA = eegData.getChannelBand('theta', 0) * 80;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 80;
  let BETA  = eegData.getChannelBand('beta', 0) * 80;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 80;

  let gap = (DELTA + THETA + ALPHA + BETA + GAMMA) / 5;

  textSize(max(10, DELTA));
  fill(clickValue, DELTA * 3, 20);
  text('Delta', MOUSEX + 40, MOUSEY - 2 * gap);
  ellipse(MOUSEX, MOUSEY - 2 * gap, DELTA);

  textSize(max(10, THETA));
  fill(20, clickValue, THETA * 3);
  text('Theta', MOUSEX + 40, MOUSEY - 1 * gap);
  ellipse(MOUSEX, MOUSEY - 1 * gap, THETA);

  textSize(max(10, ALPHA));
  fill(ALPHA * 3, clickValue, clickValue);
  text('Alpha', MOUSEX + 40, MOUSEY);
  ellipse(MOUSEX, MOUSEY, ALPHA);

  textSize(max(10, BETA));
  fill(BETA * 3, clickValue, BETA * 3);
  text('Beta', MOUSEX + 40, MOUSEY + 1 * gap);
  ellipse(MOUSEX, MOUSEY + 1 * gap, BETA);

  textSize(max(10, GAMMA));
  fill(clickValue, (GAMMA * 3) / 2, GAMMA * 3);
  text('Gamma', MOUSEX + 40, MOUSEY + 2 * gap);
  ellipse(MOUSEX, MOUSEY + 2 * gap, GAMMA);
}

function mouseClicked() {
  background(200, 255, 210);
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
