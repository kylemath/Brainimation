/**
 * @id colorfulGrid
 * @title Animated Grid
 * @category Animation & Motion
 * @order 31
 *
 * Auto-split from index.html.
 */
// Animated colorful grid
let gridSize = 20;
let time = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  let speed = 0.05 + eegData.attention * 0.15;
  time += speed;
  
  let cols = floor(width / gridSize);
  let rows = floor(height / gridSize);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * gridSize;
      let y = j * gridSize;
      
      // Animated properties
      let distance = dist(i, j, cols/2, rows/2);
      let offset = distance * 0.1 - time;
      
      let hue = (i * 10 + j * 10 + time * 50 + eegData.theta * 180) % 360;
      let brightness = 50 + sin(offset) * 25 + eegData.alpha * 25;
      let size = gridSize * (0.5 + (sin(offset) * 0.3 + 0.5) * 
                 (0.5 + eegData.meditation * 0.5));
      
      fill(hue, 70, brightness);
      noStroke();
      
      push();
      translate(x + gridSize/2, y + gridSize/2);
      rotate(offset);
      rectMode(CENTER);
      rect(0, 0, size, size);
      pop();
    }
  }
}
