/**
 * @id eegedu3dTorus
 * @title 3D Torus (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 1
 *
 * Original p5.eegedu.art sketch by Kyle Mathewson.
 * Demonstration of WEBGL 3D animation with frequency bands and mouse-driven point light.
 */
let clickValue = 0;

function setup() {
  createCanvas(width, height, WEBGL);
  clickValue = 0;
}

function draw() {
  // Available EEG Variables (scaled to classic p5.eegedu range):
  let DELTA = eegData.getChannelBand('delta', 0) * 150;
  let THETA = eegData.getChannelBand('theta', 0) * 150;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 150;
  let BETA  = eegData.getChannelBand('beta', 0) * 150;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 150;

  background(clickValue * 0.2);
  ambientLight(100);
  pointLight(250, 255, 255, mouseX - width / 2, mouseY - height / 2, 200);

  push();
  ambientMaterial(250);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  let r = max(20, DELTA);
  torus(r, r / 4, 64, 64);
  pop();
}

function mouseClicked() {
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
