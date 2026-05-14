/**
 * @id BrainDraw
 * @title Brain Draw
 * @category Drawing & Interaction
 * @order 17
 *
 * Auto-split from index.html.
 */
// Brain draw - draw with your mind
let drawing = [];
let x, y;

function setup() {
  colorMode(HSB, 360, 100, 100);
  x = width/2;
  y = height/2;
}

function draw() {
  // Fade background slowly
  background(0, 0, 5, 0.02);
  
  // Move based on brain waves
  let dx = map(eegData.alpha - 0.5, -0.5, 0.5, -3, 3);
  let dy = map(eegData.beta - 0.5, -0.5, 0.5, -3, 3);
  
  x += dx;
  y += dy;
  
  // Keep in bounds
  x = constrain(x, 0, width);
  y = constrain(y, 0, height);
  
  // Draw if attention is high
  if (eegData.attention > 0.3) {
    let hue = eegData.theta * 360;
    let size = 5 + eegData.meditation * 20;
    
    fill(hue, 70, 90, 0.6);
    noStroke();
    ellipse(x, y, size);
    
    drawing.push({x: x, y: y, hue: hue, size: size});
    
    // Limit history
    if (drawing.length > 500) {
      drawing.shift();
    }
  }
  
  // Draw cursor
  stroke(0, 0, 100);
  strokeWeight(2);
  noFill();
  ellipse(x, y, 20);
  
  // Instructions
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(10);
  text("Alpha: move X | Beta: move Y", 10, 10);
  text("Attention: draw | Theta: color | Meditation: size", 10, 25);
}
