/**
 * @id eegeduAlphaCube
 * @title Alpha 3D Cube (EEGEdu)
 * @category EEGEdu Modules
 * @order 4
 *
 * Original EEGEdu Animate module sketch (sketchCube.js).
 * Control a 3D normal-material cube's Y-rotation with Alpha power and size with Delta power.
 */
let rotation = 0;

function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let delta = (eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 28;
  let alpha = (eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 180;

  rotation = (alpha * Math.PI) / 180;

  background(250);
  normalMaterial();
  noStroke();
  push();
  rotateX(25 + frameCount / 10);
  rotateY(rotation);
  box(max(30, delta * 10));
  pop();
}
