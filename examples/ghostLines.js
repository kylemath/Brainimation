/**
 * @id ghostLines
 * @title Ghost Lines
 * @category Drawing & Interaction
 * @order 19
 *
 * Auto-split from index.html.
 */
// Ghost lines - trailing line patterns
let lines = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5, 0.05);
  
  // Add new line
  if (frameCount % 3 === 0) {
    lines.push({
      x1: width/2 + cos(frameCount * 0.05) * 100,
      y1: height/2 + sin(frameCount * 0.05) * 100,
      x2: width/2 + cos(frameCount * 0.05 + PI) * 100,
      y2: height/2 + sin(frameCount * 0.05 + PI) * 100,
      life: 1.0,
      hue: (frameCount + eegData.alpha * 360) % 360
    });
  }
  
  // Draw and update lines
  for (let i = lines.length - 1; i >= 0; i--) {
    let line = lines[i];
    
    // Expand line
    let expansion = (1 - line.life) * eegData.attention * 50;
    let x1 = line.x1 + cos(atan2(line.y1 - height/2, line.x1 - width/2)) * expansion;
    let y1 = line.y1 + sin(atan2(line.y1 - height/2, line.x1 - width/2)) * expansion;
    let x2 = line.x2 + cos(atan2(line.y2 - height/2, line.x2 - width/2)) * expansion;
    let y2 = line.y2 + sin(atan2(line.y2 - height/2, line.x2 - width/2)) * expansion;
    
    stroke(line.hue, 70, 90, line.life);
    strokeWeight(2 + eegData.meditation * 5);
    stroke(line.hue, 70, 90, line.life);
    line(x1, y1, x2, y2);
    
    line.life -= 0.01;
    if (line.life <= 0) {
      lines.splice(i, 1);
    }
  }
}
