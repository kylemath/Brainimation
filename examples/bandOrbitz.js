/**
 * @id bandOrbitz
 * @title Band Orbitz
 * @category Brain Wave Visualizations
 * @order 6
 *
 * Auto-split from index.html.
 */
// Band orbitz - frequency bands as orbiting circles
let angle = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5, 0.1);
  translate(width/2, height/2);
  
  let bands = [
    {name: 'Delta', value: eegData.delta, hue: 0, radius: 50},
    {name: 'Theta', value: eegData.theta, hue: 60, radius: 100},
    {name: 'Alpha', value: eegData.alpha, hue: 180, radius: 150},
    {name: 'Beta', value: eegData.beta, hue: 270, radius: 200},
    {name: 'Gamma', value: eegData.gamma, hue: 300, radius: 250}
  ];
  
  for (let i = 0; i < bands.length; i++) {
    let band = bands[i];
    let a = angle + (i * TWO_PI / bands.length);
    let r = band.radius;
    let size = 10 + band.value * 40;
    
    let x = cos(a) * r;
    let y = sin(a) * r;
    
    fill(band.hue, 70, 90, 0.8);
    noStroke();
    ellipse(x, y, size);
    
    // Draw orbit path
    noFill();
    stroke(band.hue, 30, 50, 0.3);
    ellipse(0, 0, r * 2);
  }
  
  angle += 0.02 * eegData.attention;
}
