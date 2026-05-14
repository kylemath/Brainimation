/**
 * @id animatingNoise
 * @title Animating Noise
 * @category Noise & Generative
 * @order 28
 *
 * Auto-split from index.html.
 */
// Animating noise field
let time = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5, 0.1);
  
  let scale = 0.008;
  let speed = 0.02 + eegData.attention * 0.08;
  
  time += speed;
  
  // Draw animated noise
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 30; j++) {
      let x = i * width / 30;
      let y = j * height / 30;
      
      let noiseVal = noise(
        i * scale,
        j * scale,
        time
      );
      
      let size = noiseVal * 40 * (1 + eegData.alpha);
      let hue = (noiseVal * 120 + time * 50) % 360;
      let brightness = 50 + eegData.meditation * 40;
      
      fill(hue, 70, brightness, 0.7);
      noStroke();
      ellipse(x + width/60, y + height/60, size, size);
    }
  }
}
