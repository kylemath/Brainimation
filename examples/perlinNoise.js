/**
 * @id perlinNoise
 * @title Perlin Noise
 * @category Noise & Generative
 * @order 23
 *
 * Auto-split from index.html.
 */
// Perlin noise visualization with EEG control
function setup() {
  colorMode(HSB, 360, 100, 100);
  noLoop();
}

function draw() {
  background(0, 0, 10);
  
  let scale = 0.01 + eegData.alpha * 0.02;
  let detail = floor(1 + eegData.attention * 7);
  
  noiseDetail(detail, 0.5);
  
  // Draw noise field
  for (let x = 0; x < width; x += 5) {
    for (let y = 0; y < height; y += 5) {
      let noiseVal = noise(x * scale, y * scale, frameCount * 0.01);
      
      let hue = map(noiseVal, 0, 1, 180, 300);
      let brightness = map(noiseVal, 0, 1, 30, 90);
      
      fill(hue, 70, brightness);
      noStroke();
      rect(x, y, 5, 5);
    }
  }
  
  // Info
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(10);
  text("Alpha: scale | Attention: detail", 10, 10);
}

function mousePressed() {
  redraw();
}
