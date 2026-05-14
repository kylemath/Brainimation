/**
 * @id noiseDetail
 * @title Noise With Detail
 * @category Noise & Generative
 * @order 25
 *
 * Auto-split from index.html.
 */
// Noise with varying detail levels
let noiseScale = 0.01;
let detailLevel = 4;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  
  // EEG controls noise detail
  detailLevel = 1 + floor(eegData.attention * 7);
  noiseScale = 0.005 + eegData.alpha * 0.015;
  
  noiseDetail(detailLevel, 0.5);
  
  // Draw noise patterns
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let noiseVal = noise(
        x * noiseScale,
        y * noiseScale,
        frameCount * 0.01
      );
      
      let brightness = map(noiseVal, 0, 1, 0, 100);
      let hue = 200 + eegData.theta * 160;
      
      let index = (x + y * width) * 4;
      let c = color(hue, 70, brightness);
      
      pixels[index] = red(c);
      pixels[index + 1] = green(c);
      pixels[index + 2] = blue(c);
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
  
  // Info overlay
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(12);
  text(`Detail: ${detailLevel} octaves`, 10, 10);
  text(`Scale: ${noiseScale.toFixed(3)}`, 10, 25);
}
