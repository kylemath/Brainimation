/**
 * @id 3dTorus
 * @title 3D Torus
 * @category 3D & Advanced
 * @order 14
 *
 * Auto-split from index.html.
 */
// 3D Torus controlled by brain waves
let rotX = 0;
let rotY = 0;

function setup() {
  createCanvas(600, 400, WEBGL);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Rotate based on brain waves
  rotX += eegData.alpha * 0.02 + 0.01;
  rotY += eegData.beta * 0.02 + 0.01;
  
  push();
  rotateX(rotX);
  rotateY(rotY);
  
  // Draw torus with changing parameters
  let radius = 50 + eegData.meditation * 50;
  let tubeRadius = 10 + eegData.attention * 20;
  
  // Color based on theta
  let hue = eegData.theta * 360;
  fill(hue, 70, 90);
  stroke(hue, 40, 100);
  strokeWeight(0.6);
  
  torus(radius, tubeRadius);
  pop();
}
