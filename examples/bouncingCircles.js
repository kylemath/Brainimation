/**
 * @id bouncingCircles
 * @title Bouncing Circles
 * @category Animation & Motion
 * @order 29
 *
 * Auto-split from index.html.
 */
// Bouncing circles with brain control
let circles = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Create bouncing circles
  for (let i = 0; i < 10; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      vx: random(-3, 3),
      vy: random(-3, 3),
      size: random(20, 60),
      hue: random(360)
    });
  }
}

function draw() {
  background(0, 0, 5, 0.1);
  
  for (let circle of circles) {
    // Update position with attention multiplier
    let speedMult = 0.5 + eegData.attention * 1.5;
    circle.x += circle.vx * speedMult;
    circle.y += circle.vy * speedMult;
    
    // Bounce off edges with energy from brain
    if (circle.x < 0 || circle.x > width) {
      circle.vx *= -1;
      circle.hue = (circle.hue + eegData.alpha * 60) % 360;
    }
    if (circle.y < 0 || circle.y > height) {
      circle.vy *= -1;
      circle.hue = (circle.hue + eegData.beta * 60) % 360;
    }
    
    circle.x = constrain(circle.x, 0, width);
    circle.y = constrain(circle.y, 0, height);
    
    // Draw with alpha affecting size
    let displaySize = circle.size * (0.7 + eegData.meditation * 0.6);
    fill(circle.hue, 70, 90, 0.7);
    noStroke();
    ellipse(circle.x, circle.y, displaySize);
  }
}
