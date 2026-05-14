/**
 * @id basic
 * @title Basic Animation
 * @category Getting Started
 * @order 0
 *
 * Auto-split from index.html.
 */
// Basic animated background
function setup() {
  console.log('User setup() function called!');
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  let hue = map(eegData.alpha, 0, 1, 180, 300);
  background(hue, 50, 20);
  
  fill(hue + 60, 80, 90);
  let size = 50 + eegData.attention * 100;
  ellipse(width/2, height/2, size);
}
