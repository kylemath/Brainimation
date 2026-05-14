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
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Setup 3D
  push();
  translate(width/2, height/2);
  
  // Rotate based on brain waves
  rotX += eegData.alpha * 0.02;
  rotY += eegData.beta * 0.02;
  
  rotateX(rotX);
  rotateY(rotY);
  
  // Draw torus with changing parameters
  let radius = 50 + eegData.meditation * 50;
  let tubeRadius = 10 + eegData.attention * 20;
  
  // Color based on theta
  let hue = eegData.theta * 360;
  fill(hue, 70, 90);
  noStroke();
  
  torus(radius, tubeRadius);
  pop();
  
  // Info text
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(10);
  text("Alpha: rotation X", 10, 10);
  text("Beta: rotation Y", 10, 25);
  text("Meditation: radius", 10, 40);
  text("Attention: tube", 10, 55);
}
