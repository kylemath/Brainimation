/**
 * @id waves
 * @title Wave Visualization
 * @category Brain Wave Visualizations
 * @order 4
 *
 * Auto-split from index.html.
 */
// EEG wave visualization
let waveHistory = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  // Add current values to history
  waveHistory.push({
    alpha: eegData.alpha,
    beta: eegData.beta,
    theta: eegData.theta,
    delta: eegData.delta
  });
  
  // Keep history manageable
  if (waveHistory.length > width / 2) {
    waveHistory.shift();
  }
  
  // Draw waves
  let waves = ['alpha', 'beta', 'theta', 'delta'];
  let colors = [300, 180, 60, 0];
  
  for (let w = 0; w < waves.length; w++) {
    let wave = waves[w];
    let hue = colors[w];
    
    stroke(hue, 70, 90);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < waveHistory.length; i++) {
      let x = map(i, 0, waveHistory.length - 1, 0, width);
      let y = height/2 + (w - 1.5) * 80 + waveHistory[i][wave] * -50;
      vertex(x, y);
    }
    endShape();
    
    // Label
    fill(hue, 70, 90);
    noStroke();
    textAlign(LEFT, CENTER);
    text(wave.toUpperCase(), 10, height/2 + (w - 1.5) * 80);
  }
}
