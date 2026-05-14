/**
 * @id MultipleBalls
 * @title Multiple Balls
 * @category Particle Systems
 * @order 13
 *
 * Auto-split from index.html.
 */
// Multiple balls with different behaviors
let balls = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      balls.push({
        x: (i + 1) * width / 4,
        y: (j + 1) * height / 4,
        vx: random(-2, 2),
        vy: random(-2, 2),
        type: (i * 3 + j) % 5,
        phase: random(TWO_PI)
      });
    }
  }
}

function draw() {
  background(0, 0, 10, 0.1);
  
  let bands = [eegData.delta, eegData.theta, eegData.alpha, eegData.beta, eegData.gamma];
  let hues = [0, 60, 180, 270, 300];
  
  for (let ball of balls) {
    let bandValue = bands[ball.type];
    let hue = hues[ball.type];
    
    // Update with different behavior per type
    ball.x += ball.vx * (1 + bandValue);
    ball.y += ball.vy * (1 + bandValue);
    
    // Bounce
    if (ball.x < 0 || ball.x > width) ball.vx *= -1;
    if (ball.y < 0 || ball.y > height) ball.vy *= -1;
    
    ball.x = constrain(ball.x, 0, width);
    ball.y = constrain(ball.y, 0, height);
    
    // Draw
    let size = 15 + bandValue * 30;
    fill(hue, 70, 90, 0.7);
    noStroke();
    ellipse(ball.x, ball.y, size);
  }
}
