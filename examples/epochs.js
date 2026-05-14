/**
 * @id epochs
 * @title Epoch View
 * @category Raw EEG Data
 * @order 22
 *
 * Auto-split from index.html.
 */
// EEG epoch visualization (like ERP analysis)
let epochData = [];
let epochLength = 128; // ~0.5 seconds at 256Hz

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 8);
  
  // Collect epochs when attention changes significantly
  if (frameCount % 60 === 0) { // Every second
    let recentEpoch = eegData.getRecentEpoch(epochLength);
    if (recentEpoch.length >= epochLength) {
      epochData.push({
        data: recentEpoch,
        attention: eegData.attention,
        timestamp: millis()
      });
      
      // Keep last 20 epochs
      if (epochData.length > 20) {
        epochData.shift();
      }
    }
  }
  
  if (epochData.length > 0) {
    // Draw averaged epoch
    let avgEpoch = [];
    for (let i = 0; i < epochLength; i++) {
      let sum = [0, 0, 0, 0]; // 4 channels
      let count = 0;
      
      for (let e = 0; e < epochData.length; e++) {
        if (epochData[e].data[i]) {
          for (let ch = 0; ch < 4; ch++) {
            sum[ch] += epochData[e].data[i][ch] || 0;
          }
          count++;
        }
      }
      
      if (count > 0) {
        avgEpoch.push([
          sum[0] / count,
          sum[1] / count,
          sum[2] / count,
          sum[3] / count
        ]);
      }
    }
    
    // Draw the averaged epoch for each channel
    let channelNames = ['TP9', 'AF7', 'AF8', 'TP10'];
    let colors = [300, 180, 60, 120];
    
    for (let ch = 0; ch < 4; ch++) {
      stroke(colors[ch], 80, 90);
      strokeWeight(2);
      noFill();
      
      beginShape();
      for (let i = 0; i < avgEpoch.length; i++) {
        let x = map(i, 0, avgEpoch.length - 1, 60, width - 60);
        let y = height/2 + (ch - 1.5) * 60 + map(avgEpoch[i][ch], -50, 50, 30, -30);
        vertex(x, y);
      }
      endShape();
      
      // Channel label
      fill(colors[ch], 80, 90);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(12);
      text(channelNames[ch], 10, height/2 + (ch - 1.5) * 60);
    }
    
    // Zero line
    stroke(0, 0, 30);
    strokeWeight(1);
    line(60, height/2, width - 60, height/2);
    
    // Time markers
    textAlign(CENTER, BOTTOM);
    textSize(10);
    fill(0, 0, 60);
    text("0ms", 60, height - 10);
    text("250ms", width/2, height - 10);
    text("500ms", width - 60, height - 10);
    
    // Title and info
    fill(0, 0, 100);
    textAlign(CENTER, TOP);
    textSize(16);
    text("Averaged Epochs (n=" + epochData.length + ")", width/2, 10);
    
    textSize(12);
    text("Grand average across all channels", width/2, 30);
  } else {
    // Waiting message
    fill(0, 0, 70);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Collecting epochs...", width/2, height/2);
    textSize(14);
    text("Epochs will appear as data accumulates", width/2, height/2 + 30);
  }
}
