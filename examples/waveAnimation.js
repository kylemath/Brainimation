/**
 * @id waveAnimation
 * @title Wave Animation
 * @category Animation & Motion
 * @order 30
 *
 * Auto-split from index.html.
 */
// Wave animation controlled by brain
let waveOffset = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  let speed = 0.02 + eegData.beta * 0.08;
  waveOffset += speed;
  
  // Draw multiple wave layers
  for (let layer = 0; layer < 5; layer++) {
    let waveAmplitude = 30 + eegData.alpha * 70;
    let waveFrequency = 0.01 + layer * 0.005;
    let yBase = (layer + 1) * height / 6;
    
    let hue = (layer * 60 + eegData.theta * 120) % 360;
    
    fill(hue, 70, 90, 0.5);
    noStroke();
    
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x += 5) {
      let y = yBase + sin((x * waveFrequency) + waveOffset + layer) * waveAmplitude;
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);
  }
  
  // Draw wave on top showing meditation
  stroke(0, 0, 100);
  strokeWeight(2);
  noFill();
  
  beginShape();
  for (let x = 0; x <= width; x += 5) {
    let y = height/2 + sin((x * 0.02) + waveOffset) * 
            (50 + eegData.meditation * 100);
    vertex(x, y);
  }
  endShape();
}
