/**
 * @id mandala
 * @title Neural Mandala
 * @category Attention & Meditation
 * @order 10
 *
 * Auto-split from index.html.
 */
// Neural mandala
let angle = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 0, 0.05);
  
  translate(width/2, height/2);
  
  let layers = 5;
  for (let layer = 0; layer < layers; layer++) {
    let radius = 50 + layer * 40;
    let points = 6 + layer * 2;
    
    for (let i = 0; i < points; i++) {
      let a = angle + (TWO_PI / points) * i;
      let x = cos(a) * radius;
      let y = sin(a) * radius;
      
      let hue = (angle * 57.3 + layer * 60) % 360;
      let brightness = 50 + eegData.attention * 40;
      let size = 5 + eegData.alpha * layer * 2;
      
      fill(hue, 80, brightness, 0.7);
      noStroke();
      ellipse(x, y, size);
    }
  }
  
  angle += eegData.meditation * 0.02 + 0.005;
}
