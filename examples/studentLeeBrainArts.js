/**
 * @id studentLeeBrainArts
 * @title BrainArts Band Ribbon (JB Lee)
 * @category 2022 NeuroArt Class Gallery
 * @order 13
 *
 * Student NeuroArt Project by JB Lee.
 * Horizontal ribbon of 5 frequency-band circles that trail the mouse cursor. Click to clear.
 */
function setup() {
  colorMode(RGB, 255);
  background(200, 200, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let DELTA = eegData.getChannelBand('delta', 0) * 60;
  let THETA = eegData.getChannelBand('theta', 0) * 60;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 60;
  let BETA  = eegData.getChannelBand('beta', 0) * 60;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 60;

  stroke(0);
  textSize(12);

  fill(255, 40, 100);
  ellipse(MOUSEX, MOUSEY, DELTA / 2);
  text("Delta", MOUSEX, MOUSEY + DELTA);

  fill(20, 200, 255);
  ellipse(MOUSEX + 120, MOUSEY, THETA);
  text("Theta", MOUSEX + 120, MOUSEY + THETA);

  fill(40, 30, 200);
  ellipse(MOUSEX - 120, MOUSEY, ALPHA);
  text("Alpha", MOUSEX - 120, MOUSEY + ALPHA);

  fill(150, 255, 200);
  ellipse(MOUSEX - 60, MOUSEY, BETA);
  text("Beta", MOUSEX - 60, MOUSEY + BETA);

  fill(255, 255, 0);
  ellipse(MOUSEX + 60, MOUSEY, GAMMA);
  text("Gamma", MOUSEX + 60, MOUSEY + GAMMA);
}

function mouseClicked() {
  background(200, 200, 200);
}
