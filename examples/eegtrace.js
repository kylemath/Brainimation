/**
 * @id eegtrace
 * @title EEG Trace
 * @category Raw EEG Data
 * @order 20
 *
 * Auto-split from index.html.
 */
// Raw EEG trace visualization
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  // Get raw EEG data from TP9 electrode (left temporal)
  let tp9Data = eegData.getRawChannel('TP9', 300);
  
  if (tp9Data.length > 10) {
    // Draw EEG trace
    stroke(180, 80, 90);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < tp9Data.length; i++) {
      let x = map(i, 0, tp9Data.length - 1, 50, width - 50);
      let y = map(tp9Data[i], -100, 100, height - 50, 50);
      vertex(x, y);
    }
    endShape();
    
    // Add grid lines
    stroke(0, 0, 30);
    strokeWeight(1);
    
    // Horizontal lines (voltage levels)
    for (let v = -100; v <= 100; v += 50) {
      let y = map(v, -100, 100, height - 50, 50);
      line(50, y, width - 50, y);
    }
    
    // Vertical time markers
    for (let t = 0; t < tp9Data.length; t += 50) {
      let x = map(t, 0, tp9Data.length - 1, 50, width - 50);
      line(x, 50, x, height - 50);
    }
    
    // Labels
    fill(0, 0, 100);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    text("TP9 Raw EEG Trace", 50, 20);
    
    textAlign(RIGHT, CENTER);
    textSize(12);
    text("100μV", 45, map(100, -100, 100, height - 50, 50));
    text("0μV", 45, map(0, -100, 100, height - 50, 50));
    text("-100μV", 45, map(-100, -100, 100, height - 50, 50));
  } else {
    // No data message
    fill(0, 0, 70);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Waiting for EEG data...", width/2, height/2);
  }
}
