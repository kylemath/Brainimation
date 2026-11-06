/**
 * @id neurotech2025KoraBEmotionPalette
 * @title Emotion Palette Abstract Painter (Kora Budzyk)
 * @category 2025 Neurotech Class Catalogue
 * @order 54
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Generative abstract painting where relative Alpha (blue/green), Beta (red/orange), and Theta (purple/pink) concentrations drive brushstroke color and length.
 */
// Emotion Palette: EEG-driven abstract painting
// All waves contribute; relative concentration determines stroke distribution
// Alpha = blue/green, Beta = red/orange, Theta = purple/pink
// Attention controls stroke opacity & saturation (low = shorter strokes; high = long strokes)

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  background(255); // White canvas to accumulate paint strokes
  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  // Getting the EEG data
  let alpha = eegData.alpha;
  let beta = eegData.beta;
  let theta = eegData.theta;
  let attention = eegData.attention;

  // Stroke properties based on attention
  let strokeOpacity = map(attention, 0, 1, 0.1, 1.5);
  let strokeSaturation = map(attention, 0, 1, 50, 100);
  let minLength = 50;
  let maxLength = map(attention, 0, 1, 80, 200); // Stroke length varies from 80-200 pixels depending on attention 
  // Makes strokes longer and more visible when the individual is more focused

  // Drawing alpha strokes (blue/green)
  let alphaStrokes = floor(map(alpha, 0, 1, 1, 6)); // # of alpha strokes is proportional to wave strengths -> higher alpha produces more strokes
  // 1-6 is a range to ensure at least one stroke is drawn and variations in alpha are visibly reflected on the canvas
  for (let i = 0; i < alphaStrokes; i++) {
    let x = random(width); 
    let y = random(height);
    // randomizing x, y places the stroke anywhere on the canvas, giving abstract effect
    let angle = random(TWO_PI); // provides abstract placement of lines by varying their angle
    let length = random(minLength, maxLength); // stroke length varies between the two intervals -> controlled by attention
    let x2 = x + cos(angle) * length;
    let y2 = y + sin(angle) * length;
    let hue = random(180, 220); // hue is randomized within this blue/green range to add colour variation
    stroke(hue, strokeSaturation, 90, strokeOpacity);
    strokeWeight(random(0.5, 3)); // stroke weight is randomized to add texture and depth
    line(x, y, x2, y2); // draws the stroke from (x, y) to (x2, y2)
  }

  // Drawing beta strokes (red/orange)
  let betaStrokes = floor(map(beta, 0, 1, 1, 6)); // # of beta strokes is proportional to wave strength -> higher beta produces more strokes
  // 1-6 is a range to ensure that at least one stroke is drawn and variations in beta are visibly reflected on the canvas
  for (let i = 0; i < betaStrokes; i++) {
    let x = random(width);
    let y = random(height);
    // randomizing x, y places the stroke anywhere on the canvas, giving abstract effect
    let angle = random(TWO_PI); // provides abstract placement of lines by varying their angle
    let length = random(minLength, maxLength); // stroke length varies between the two intervals -> controlled by attention
    let x2 = x + cos(angle) * length;
    let y2 = y + sin(angle) * length;
    let hue = random(0, 40); // hue is randomized within this red/orange range to add colour variation
    stroke(hue, strokeSaturation, 90, strokeOpacity);
    strokeWeight(random(0.5, 3)); // stroke weight is randomized to add texture and depth
    line(x, y, x2, y2); // draws the stroke from (x, y) to (x2, y2)
  }

  // Drawing theta strokes (purple/pink)
  let thetaStrokes = floor(map(theta, 0, 1, 1, 6)); // # of theta strokes is proportional to wave strength -> higher theta produces more strokes
  // 1-6 is a range that ensures at least one stroke is drawn and that variations in theta are visually reflected on the canvas 
  for (let i = 0; i < thetaStrokes; i++) {
    let x = random(width);
    let y = random(height);
    // randomizing x, y places the stroke anywhere on the canvas, giving abstract effect
    let angle = random(TWO_PI); // provides abstract placement of lines by varying their angle
    let length = random(minLength, maxLength); // stroke length varies between the two intervals -> controlled by attention
    let x2 = x + cos(angle) * length;
    let y2 = y + sin(angle) * length;
    let hue = random(270, 320); // hue is randomized within this pink/purple range to add colour variation
    stroke(hue, strokeSaturation, 90, strokeOpacity);
    strokeWeight(random(0.5, 3)); // stroke weight is randomized to add texture and depth
    line(x, y, x2, y2); // draws the stroke from (x, y) to (x2, y2)
  }

  // Displaying EEG values 
  fill(255);
  noStroke();
  rect(width/2 - 210, height - 35, 420, 30);  // to clear old text and avoid overlapping/blurring of numbers

  fill(0);
  text(`Alpha: ${alpha.toFixed(3)}  Beta: ${beta.toFixed(3)}  Theta: ${theta.toFixed(3)}  Attention: ${attention.toFixed(3)}`, width/2, height - 20);
}
