/**
 * @id SplineBounce
 * @title Spline Bounce
 * @category 3D & Advanced
 * @order 16
 *
 * Auto-split from index.html.
 */
// Spline bounce - smooth curves with EEG
let points = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Initialize points
  for (let i = 0; i < 8; i++) {
    points.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2)
    });
  }
}

function draw() {
  background(0, 0, 10);
  
  // Update points
  for (let p of points) {
    p.x += p.vx * (1 + eegData.attention * 0.5);
    p.y += p.vy * (1 + eegData.attention * 0.5);
    
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
    
    p.x = constrain(p.x, 0, width);
    p.y = constrain(p.y, 0, height);
  }
  
  // Draw smooth curve through points
  stroke(180 + eegData.alpha * 180, 70, 90);
  strokeWeight(2 + eegData.meditation * 5);
  noFill();
  
  beginShape();
  for (let i = 0; i < points.length; i++) {
    curveVertex(points[i].x, points[i].y);
  }
  // Repeat first points to close curve
  curveVertex(points[0].x, points[0].y);
  curveVertex(points[1].x, points[1].y);
  endShape();
  
  // Draw control points
  for (let p of points) {
    fill(60, 70, 90);
    noStroke();
    ellipse(p.x, p.y, 8);
  }
}
