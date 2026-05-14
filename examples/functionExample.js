/**
 * @id functionExample
 * @title Function Example
 * @category Getting Started
 * @order 2
 *
 * Auto-split from index.html.
 */
// Function example with EEG
function setup() {
  colorMode(HSB, 360, 100, 100);
  frameRate(30);
}

function draw() {
  background(0, 0, 5);
  
  // Draw grid of brain-controlled shapes
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      drawBrainShape(
        x * width/5 + width/10,
        y * height/5 + height/10,
        x, y
      );
    }
  }
}

function drawBrainShape(x, y, gridX, gridY) {
  push();
  translate(x, y);
  
  let size = 20 + eegData.attention * 40;
  let hue = (gridX * 60 + gridY * 30 + frameCount) % 360;
  let brightness = 50 + eegData.meditation * 40;
  
  fill(hue, 70, brightness);
  noStroke();
  ellipse(0, 0, size);
  pop();
}
