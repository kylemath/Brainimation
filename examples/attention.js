/**
 * @id attention
 * @title Attention Meter
 * @category Attention & Meditation
 * @order 9
 *
 * Auto-split from index.html.
 */
// Attention meter
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Attention bar
  let barWidth = width * 0.8;
  let barHeight = 40;
  let x = (width - barWidth) / 2;
  let y = height / 2;
  
  // Background bar
  fill(0, 0, 20);
  rect(x, y, barWidth, barHeight);
  
  // Attention level
  let attentionWidth = barWidth * eegData.attention;
  let hue = map(eegData.attention, 0, 1, 0, 120);
  fill(hue, 80, 90);
  rect(x, y, attentionWidth, barHeight);
  
  // Text
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Attention: " + (eegData.attention * 100).toFixed(1) + "%", width/2, y - 60);
}
