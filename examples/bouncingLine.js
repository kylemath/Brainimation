/**
 * @id bouncingLine
 * @title Bouncing Line
 * @category Drawing & Interaction
 * @order 18
 *
 * Auto-split from index.html.
 */
// Bouncing line with brain control
let x1, y1, x2, y2;
let vx1, vy1, vx2, vy2;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  x1 = width/4;
  y1 = height/2;
  x2 = 3*width/4;
  y2 = height/2;
  
  vx1 = random(-3, 3);
  vy1 = random(-3, 3);
  vx2 = random(-3, 3);
  vy2 = random(-3, 3);
}

function draw() {
  background(0, 0, 5, 0.1);
  
  // Update endpoints
  let speed = 1 + eegData.attention;
  x1 += vx1 * speed;
  y1 += vy1 * speed;
  x2 += vx2 * speed;
  y2 += vy2 * speed;
  
  // Bounce
  if (x1 < 0 || x1 > width) vx1 *= -1;
  if (y1 < 0 || y1 > height) vy1 *= -1;
  if (x2 < 0 || x2 > width) vx2 *= -1;
  if (y2 < 0 || y2 > height) vy2 *= -1;
  
  x1 = constrain(x1, 0, width);
  y1 = constrain(y1, 0, height);
  x2 = constrain(x2, 0, width);
  y2 = constrain(y2, 0, height);
  
  // Draw line with varying thickness
  let weight = 1 + eegData.alpha * 20;
  let hue = eegData.theta * 360;
  
  stroke(hue, 70, 90);
  strokeWeight(weight);
  line(x1, y1, x2, y2);
  
  // Draw endpoints
  noStroke();
  fill(hue, 90, 90);
  ellipse(x1, y1, 15);
  ellipse(x2, y2, 15);
}
