/**
 * @id discreteColors
 * @title Discrete Colors
 * @category Noise & Generative
 * @order 26
 *
 * Auto-split from index.html.
 */
// Discrete colors from noise
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  let scale = 0.01 + eegData.alpha * 0.02;
  let colorSteps = 3 + floor(eegData.attention * 7);
  
  // Draw with discrete color steps
  for (let x = 0; x < width; x += 10) {
    for (let y = 0; y < height; y += 10) {
      let noiseVal = noise(x * scale, y * scale, frameCount * 0.01);
      
      // Discretize the noise value
      let step = floor(noiseVal * colorSteps) / colorSteps;
      
      let hue = step * 360;
      let brightness = 50 + eegData.meditation * 40;
      
      fill(hue, 70, brightness);
      noStroke();
      rect(x, y, 10, 10);
    }
  }
  
  // Show color steps
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(12);
  text(`Color steps: ${colorSteps}`, 10, 10);
}
