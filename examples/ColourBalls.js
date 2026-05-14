/**
 * @id ColourBalls
 * @title Colour Balls
 * @category Particle Systems
 * @order 12
 *
 * Auto-split from index.html.
 */
// Colour balls - attention-controlled bouncing balls
let balls = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  for (let i = 0; i < 20; i++) {
    balls.push({
      x: random(width),
      y: random(height),
      vx: random(-3, 3),
      vy: random(-3, 3),
      size: random(10, 40),
      hue: random(360)
    });
  }
}

function draw() {
  background(0, 0, 5, 0.2);
  
  for (let ball of balls) {
    // Update position
    ball.x += ball.vx * (1 + eegData.attention);
    ball.y += ball.vy * (1 + eegData.attention);
    
    // Bounce off edges
    if (ball.x < 0 || ball.x > width) ball.vx *= -1;
    if (ball.y < 0 || ball.y > height) ball.vy *= -1;
    
    // Keep in bounds
    ball.x = constrain(ball.x, 0, width);
    ball.y = constrain(ball.y, 0, height);
    
    // Rotate hue based on meditation
    ball.hue = (ball.hue + eegData.meditation * 2) % 360;
    
    // Draw ball
    fill(ball.hue, 70, 90, 0.8);
    noStroke();
    ellipse(ball.x, ball.y, ball.size);
  }
}
