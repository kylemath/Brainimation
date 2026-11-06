/**
 * @id eegeduBands3D
 * @title 3D Frequency Band Boxes (EEGEdu)
 * @category EEGEdu Modules
 * @order 3
 *
 * Original EEGEdu Animate module sketch (sketchBands.js).
 * Five 3D WEBGL boxes representing Delta, Theta, Alpha, Beta, and Gamma power,
 * illuminated by a mouse-guided point light.
 */
function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let delta = (eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 28;
  let theta = (eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta) * 28;
  let alpha = (eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 28;
  let beta  = (eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta)  * 28;
  let gamma = (eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma) * 28;

  let unit = width / 5;

  background(245);
  ambientMaterial(250);
  noStroke();

  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  ambientLight(80, 80, 80);
  pointLight(255, 255, 255, locX, locY, 200);

  push();
  fill(255, 0, 0);
  translate(-unit, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, delta * 10), unit);
  pop();

  push();
  fill(0, 255, 0);
  translate(-unit / 2, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, theta * 10), unit);
  pop();

  push();
  fill(0, 0, 255);
  translate(0, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, alpha * 10), unit);
  pop();

  push();
  fill(0, 128, 128);
  translate(unit / 2, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, beta * 10), unit);
  pop();

  push();
  fill(128, 0, 128);
  translate(unit, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, gamma * 10), unit);
  pop();
}
