/**
 * @id BasicFrequencyBands
 * @title Basic Frequency Bands
 * @category Brain Wave Visualizations
 * @order 5
 *
 * Auto-split from index.html.
 */
// Basic frequency bands visualization
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Draw bars for each frequency band
  let bands = [
    {name: 'Delta', value: eegData.delta, hue: 0},
    {name: 'Theta', value: eegData.theta, hue: 60},
    {name: 'Alpha', value: eegData.alpha, hue: 180},
    {name: 'Beta', value: eegData.beta, hue: 270},
    {name: 'Gamma', value: eegData.gamma, hue: 300}
  ];
  
  let barWidth = width / bands.length;
  
  for (let i = 0; i < bands.length; i++) {
    let band = bands[i];
    let x = i * barWidth;
    let barHeight = band.value * height * 0.8;
    
    // Draw bar
    fill(band.hue, 70, 90);
    rect(x, height - barHeight, barWidth - 10, barHeight);
    
    // Draw label
    fill(0, 0, 100);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text(band.name, x + barWidth/2, height - 5);
    
    // Draw value
    textAlign(CENTER, TOP);
    textSize(10);
    text(band.value.toFixed(2), x + barWidth/2, height - barHeight - 5);
  }
}
