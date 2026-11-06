/**
 * @id eegeduBasicShapes
 * @title Left/Right Alpha Trail (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 9
 *
 * Original basicShapes.p5 sketch by Kyle Mathewson.
 * Compares Left Frontal (AF7) vs Right Frontal (AF8) Alpha asymmetry around the mouse cursor.
 */
let value = 0;

function setup() {
  colorMode(RGB, 255);
  value = 0;
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 120;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 120;

  stroke(0);
  fill(200, 120, 100);
  ellipse(MOUSEX - 100, MOUSEY, LEFTALPHA);
  fill(20, 200, 255);
  ellipse(MOUSEX + 100, MOUSEY, RIGHTALPHA);
  fill(20, 255, 0);
  ellipse(MOUSEX, MOUSEY, 50);
}

function mouseClicked() {
  background(255, 255, 200);
  if (value === 0) {
    value = 255;
  } else {
    value = 0;
  }
}
