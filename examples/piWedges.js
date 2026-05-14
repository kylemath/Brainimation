/**
 * @id piWedges
 * @title Pi Wedges
 * @category Brain Wave Visualizations
 * @order 7
 *
 * Auto-split from index.html.
 */
// Pi wedges - frequency bands as pie chart
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  translate(width/2, height/2);
  
  let bands = [
    {name: 'Delta', value: eegData.delta, hue: 0},
    {name: 'Theta', value: eegData.theta, hue: 60},
    {name: 'Alpha', value: eegData.alpha, hue: 180},
    {name: 'Beta', value: eegData.beta, hue: 270},
    {name: 'Gamma', value: eegData.gamma, hue: 300}
  ];
  
  let total = bands.reduce((sum, b) => sum + b.value, 0);
  let startAngle = 0;
  let radius = min(width, height) * 0.35;
  
  for (let i = 0; i < bands.length; i++) {
    let band = bands[i];
    let angle = (band.value / total) * TWO_PI;
    
    // Draw wedge
    fill(band.hue, 70, 90);
    arc(0, 0, radius * 2, radius * 2, startAngle, startAngle + angle, PIE);
    
    // Draw label
    let midAngle = startAngle + angle / 2;
    let labelX = cos(midAngle) * radius * 0.6;
    let labelY = sin(midAngle) * radius * 0.6;
    
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(band.name, labelX, labelY);
    
    startAngle += angle;
  }
}
