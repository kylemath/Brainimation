/**
 * @id studentLocherFinalProject
 * @title Gyroscope Rings 3D (Megan Locher)
 * @category 2022 NeuroArt Class Gallery
 * @order 14
 *
 * Student NeuroArt Project by Megan Locher.
 * Nested 3D WEBGL torus rings and central sphere colored by Alpha, Delta, Theta, and Gamma waves.
 */
function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 20;
  let THETA = eegData.getChannelBand('theta', 0) * 20;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 20;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 20;

  background(125);
  noStroke();

  // First ring
  rotateZ(frameCount * 0.02);
  rotateY(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  fill(ALPHA * 12, 135, 107);
  torus(200, 7);

  // Second ring
  rotateY(frameCount * 0.02);
  rotateZ(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  fill(DELTA * 12, 85, 190);
  torus(100, 7);

  // Third ring
  rotateZ(frameCount * 0.015);
  rotateY(frameCount * 0.015);
  rotateX(frameCount * 0.015);
  fill(20, THETA * 17, 255);
  torus(150, 7);

  // Fourth ring
  rotateZ(frameCount * 0.001);
  rotateY(frameCount * 0.002);
  rotateX(frameCount * 0.001);
  fill(255);
  torus(180, 7);

  // Center sphere
  fill(140, 120, GAMMA * 12);
  sphere(30);
}
