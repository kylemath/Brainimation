/**
 * @id organicHeatmap
 * @title Organic Heatmap
 * @category Noise & Generative
 * @order 24
 *
 * Auto-split from index.html.
 */
// Organic heatmap using Perlin noise
function setup() {
  colorMode(HSB, 360, 100, 100);
  frameRate(30);
}

function draw() {
  background(0, 0, 5);
  
  let scale = 0.005 + eegData.meditation * 0.01;
  let timeOffset = frameCount * 0.02 * (1 + eegData.beta);
  
  // Create organic heatmap
  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      let noiseVal = noise(x * scale, y * scale, timeOffset);
      
      // Map noise to heat colors
      let hue = map(noiseVal, 0, 1, 0, 60); // Red to yellow
      let saturation = 80 + eegData.attention * 20;
      let brightness = map(noiseVal, 0, 1, 20, 90);
      
      fill(hue, saturation, brightness, 0.8);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}
