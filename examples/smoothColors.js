/**
 * @id smoothColors
 * @title Smooth Colors
 * @category Noise & Generative
 * @order 27
 *
 * Auto-split from index.html.
 */
// Smooth color transitions from noise
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  let scale = 0.005 + eegData.meditation * 0.01;
  let speed = 0.01 + eegData.beta * 0.05;
  
  // Smooth color field
  for (let x = 0; x < width; x += 5) {
    for (let y = 0; y < height; y += 5) {
      let noiseVal = noise(
        x * scale,
        y * scale,
        frameCount * speed
      );
      
      // Smooth color mapping
      let hue = noiseVal * 360;
      let saturation = 60 + eegData.alpha * 30;
      let brightness = 40 + noiseVal * 50;
      
      fill(hue, saturation, brightness);
      noStroke();
      rect(x, y, 6, 6);
    }
  }
}
