/**
 * @id studentNnanmaniFinalSketch
 * @title Bullseye Alpha Target (Pearl Nnanmani)
 * @category 2022 NeuroArt Class Gallery
 * @order 17
 *
 * Student NeuroArt Project by Pearl Nnanmani.
 * Concentric target rings follow the mouse while Theta controls ring shade and Alpha scales the text.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(255, 20, 250);

  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let ALPHA = 12 + eegData.getChannelBand('alpha', 0) * 90;
  let theta = eegData.getChannelBand('theta', 1) * 10;
  let thisHeight = 200;
  let alphaShade = map(theta, 0, 10, 0, 255);

  stroke(0);
  fill(alphaShade, 10, 10);
  ellipse(MOUSEX, MOUSEY, thisHeight);
  fill(200, 0, 180);
  ellipse(MOUSEX, MOUSEY, thisHeight / 2);
  fill(0, 90, 180);
  ellipse(MOUSEX, MOUSEY, thisHeight / 4);

  textSize(ALPHA);
  fill(0, 0, 180);
  text('Alpha', MOUSEX + 30, MOUSEY);
}
