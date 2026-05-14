/**
 * @id alpha
 * @title Alpha Waves
 * @category Brain Wave Visualizations
 * @order 3
 *
 * Auto-split from index.html.
 */
// Alpha wave visualization
let waves = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(220, 30, 10, 0.1);
  
  // Add new wave based on alpha strength
  if (frameCount % 10 === 0) {
    waves.push({
      x: width/2,
      y: height/2,
      r: 0,
      alpha: eegData.alpha
    });
  }
  
  // Draw and update waves
  for (let i = waves.length - 1; i >= 0; i--) {
    let w = waves[i];
    
    noFill();
    stroke(200, 70, 90, w.alpha);
    strokeWeight(2);
    ellipse(w.x, w.y, w.r * 2);
    
    w.r += w.alpha * 5 + 1;
    w.alpha *= 0.98;
    
    if (w.alpha < 0.01) {
      waves.splice(i, 1);
    }
  }
}
