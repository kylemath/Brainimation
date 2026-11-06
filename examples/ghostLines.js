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
    let seg = lines[i];
    
    // Expand line
    let expansion = (1 - seg.life) * eegData.attention * 50;
    let x1 = seg.x1 + cos(atan2(seg.y1 - height/2, seg.x1 - width/2)) * expansion;
    let y1 = seg.y1 + sin(atan2(seg.y1 - height/2, seg.x1 - width/2)) * expansion;
    let x2 = seg.x2 + cos(atan2(seg.y2 - height/2, seg.x2 - width/2)) * expansion;
    let y2 = seg.y2 + sin(atan2(seg.y2 - height/2, seg.x2 - width/2)) * expansion;
    
    stroke(seg.hue, 70, 90, seg.life);
    strokeWeight(2 + eegData.meditation * 5);
    line(x1, y1, x2, y2);
    
    seg.life -= 0.01;
    if (seg.life <= 0) {
      lines.splice(i, 1);
    }
  }
}
