/**
 * @id spectra
 * @title Spectra
 * @category Brain Wave Visualizations
 * @order 8
 *
 * Auto-split from index.html.
 */
// Spectra - frequency spectrum visualization
let spectrumHistory = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Add current spectrum to history
  spectrumHistory.push({
    delta: eegData.delta,
    theta: eegData.theta,
    alpha: eegData.alpha,
    beta: eegData.beta,
    gamma: eegData.gamma
  });
  
  if (spectrumHistory.length > 100) {
    spectrumHistory.shift();
  }
  
  // Draw spectrum over time
  let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  let hues = [0, 60, 180, 270, 300];
  
  for (let b = 0; b < bands.length; b++) {
    stroke(hues[b], 70, 90);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < spectrumHistory.length; i++) {
      let x = map(i, 0, spectrumHistory.length - 1, 50, width - 50);
      let y = height/2 + (b - 2) * 60 - spectrumHistory[i][bands[b]] * 40;
      vertex(x, y);
    }
    endShape();
    
    // Label
    fill(hues[b], 70, 90);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(10);
    text(bands[b].toUpperCase(), 10, height/2 + (b - 2) * 60);
  }
}
