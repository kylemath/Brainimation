/**
 * @id multichannel
 * @title Multi-Channel EEG
 * @category Raw EEG Data
 * @order 21
 *
 * Auto-split from index.html.
 */
// Multi-channel EEG visualization
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 5);
  
  let channels = eegData.getChannelNames();
  let colors = [300, 180, 60, 120]; // Purple, Cyan, Yellow, Green
  
  // Draw each channel
  for (let c = 0; c < channels.length; c++) {
    let channelData = eegData.getRawChannel(channels[c], 200);
    
    if (channelData.length > 10) {
      let yOffset = (c + 1) * height / (channels.length + 1);
      
      // Channel trace
      stroke(colors[c], 80, 90);
      strokeWeight(1.5);
      noFill();
      
      beginShape();
      for (let i = 0; i < channelData.length; i++) {
        let x = map(i, 0, channelData.length - 1, 80, width - 20);
        let y = yOffset + map(channelData[i], -100, 100, -40, 40);
        vertex(x, y);
      }
      endShape();
      
      // Channel label
      fill(colors[c], 80, 90);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(14);
      text(channels[c], 10, yOffset);
      
      // Zero line
      stroke(0, 0, 20);
      strokeWeight(1);
      line(80, yOffset, width - 20, yOffset);
    }
  }
  
  // Title
  fill(0, 0, 100);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(16);
  text("Multi-Channel EEG (All 4 Electrodes)", width/2, 10);
  
  // Real-time indicator
  if (eegData.connected) {
    fill(120, 80, 90);
    ellipse(width - 30, 30, 10);
    textAlign(RIGHT, CENTER);
    textSize(12);
    text("LIVE", width - 40, 30);
  }
}
