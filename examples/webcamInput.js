/**
 * @id webcamInput
 * @title Webcam Input
 * @category Animation & Motion
 * @order 32
 *
 * Auto-split from index.html.
 */
// Webcam input with brain-controlled effects
let capture;
let pixelDensity = 10;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Create video capture
  capture = createCapture(VIDEO);
  capture.size(width/pixelDensity, height/pixelDensity);
  capture.hide();
}

function draw() {
  background(0, 0, 10);
  
  capture.loadPixels();
  
  // Process webcam pixels
  for (let y = 0; y < capture.height; y++) {
    for (let x = 0; x < capture.width; x++) {
      let index = (x + y * capture.width) * 4;
      
      let r = capture.pixels[index];
      let g = capture.pixels[index + 1];
      let b = capture.pixels[index + 2];
      
      let bright = (r + g + b) / 3;
      
      // Apply brain-controlled effects
      let hueShift = eegData.alpha * 180;
      let size = map(bright, 0, 255, 0, pixelDensity * (1 + eegData.attention));
      
      let pixelHue = (bright + hueShift) % 360;
      let saturation = 60 + eegData.theta * 40;
      let pixelBrightness = map(bright, 0, 255, 20, 90);
      
      fill(pixelHue, saturation, pixelBrightness);
      noStroke();
      
      ellipse(
        x * pixelDensity + pixelDensity/2,
        y * pixelDensity + pixelDensity/2,
        size, size
      );
    }
  }
  
  // Info
  fill(0, 0, 100);
  textAlign(LEFT, BOTTOM);
  textSize(10);
  text("Alpha: hue shift | Attention: size | Theta: saturation", 10, height - 10);
  
  if (!capture.loadedmetadata) {
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Waiting for webcam...", width/2, height/2);
  }
}
