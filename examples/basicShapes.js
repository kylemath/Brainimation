/**
 * @id basicShapes
 * @title Basic Shapes
 * @category Getting Started
 * @order 1
 *
 * Auto-split from index.html.
 */
// Basic shapes with brain control
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  // Circle size controlled by alpha
  let circleSize = 50 + eegData.alpha * 150;
  fill(180, 70, 90);
  ellipse(width/4, height/2, circleSize);
  
  // Rectangle size controlled by beta
  let rectSize = 30 + eegData.beta * 100;
  fill(270, 70, 90);
  rect(width/2 - rectSize/2, height/2 - rectSize/2, rectSize, rectSize);
  
  // Triangle controlled by theta
  let triSize = 40 + eegData.theta * 120;
  fill(60, 70, 90);
  triangle(
    3*width/4, height/2 + triSize/2,
    3*width/4 - triSize/2, height/2 - triSize/2,
    3*width/4 + triSize/2, height/2 - triSize/2
  );
}
