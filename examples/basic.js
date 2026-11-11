/**
 * @id basic
 * @title Basic Animation
 * @category Getting Started
 * @order 0
 *
 * Auto-split from index.html.
 */
// Basic animated circle controlled by alpha and attention
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  let size = map(eegData.alpha, 0, 1, 50, 300);
  let hue = map(eegData.attention, 0, 1, 180, 360);
  fill(hue, 80, 90);
  noStroke();
  ellipse(width/2, height/2, size, size);
}
