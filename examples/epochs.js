/**
 * @id epochs
 * @title Epoch View (Online ERP Averager)
 * @category Raw EEG Data
 * @order 22
 *
 * Online 4-channel Event-Related Potential (ERP) ensemble averager (-200 to +800 ms at 256 Hz).
 * Presents visual oddball flashes, extracts 256-sample epochs via eegData.getRecentEpoch(256),
 * subtracts the -200..0 ms pre-stimulus baseline (51 samples), and averages up to K = 20 trials.
 */
let epochData = [];
let epochLength = 256; // 1000 ms (-200 to +800 ms) at 256 Hz
let preSamples = 51;   // 200 ms pre-stimulus baseline window
let stimFrame = -100;
let pendingCapture = false;

function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 8);
  // Trigger visual stimulus flash every 90 frames (~1.5 s)
  if (frameCount % 90 === 10) {
    stimFrame = frameCount;
    pendingCapture = true;
    if (eegData.triggerERP) eegData.triggerERP('target');
  }
  // Capture full 256-sample (-200 to +800 ms) epoch 48 frames (+800 ms) after stimulus onset
  if (pendingCapture && frameCount - stimFrame >= 48) {
    pendingCapture = false;
    let rawEpoch = eegData.getRecentEpoch(epochLength);
    if (rawEpoch.length >= epochLength) {
      let baseMean = [0, 0, 0, 0];
      for (let j = 0; j < preSamples; j++) {
        for (let ch = 0; ch < 4; ch++) {
          baseMean[ch] += (rawEpoch[j][ch] || 0) / preSamples;
        }
      }
      let corrected = [];
      for (let i = 0; i < epochLength; i++) {
        corrected.push([
          (rawEpoch[i][0] || 0) - baseMean[0],
          (rawEpoch[i][1] || 0) - baseMean[1],
          (rawEpoch[i][2] || 0) - baseMean[2],
          (rawEpoch[i][3] || 0) - baseMean[3]
        ]);
      }
      epochData.push({ data: corrected, attention: eegData.attention, timestamp: millis() });
      if (epochData.length > 20) epochData.shift();
    }
  }
  // Render visual stimulus indicator during 100 ms flash window
  if (frameCount - stimFrame >= 0 && frameCount - stimFrame < 6) {
    fill(50, 90, 100); noStroke();
    ellipse(width - 40, 25, 22, 22);
  }
  if (epochData.length > 0) {
    let avgEpoch = [];
    for (let i = 0; i < epochLength; i++) {
      let sum = [0, 0, 0, 0];
      for (let k = 0; k < epochData.length; k++) {
        for (let ch = 0; ch < 4; ch++) sum[ch] += epochData[k].data[i][ch];
      }
      let K = epochData.length;
      avgEpoch.push([sum[0] / K, sum[1] / K, sum[2] / K, sum[3] / K]);
    }
    let channelNames = ['TP9', 'AF7', 'AF8', 'TP10'];
    let colors = [300, 180, 60, 120];
    for (let ch = 0; ch < 4; ch++) {
      stroke(colors[ch], 80, 90); strokeWeight(2); noFill();
      beginShape();
      for (let i = 0; i < avgEpoch.length; i++) {
        let x = map(i, 0, epochLength - 1, 60, width - 60);
        let y = height / 2 + (ch - 1.5) * 60 + map(avgEpoch[i][ch], -25, 25, 28, -28);
        vertex(x, y);
      }
      endShape();
      fill(colors[ch], 80, 90); noStroke();
      textAlign(LEFT, CENTER); textSize(12);
      text(channelNames[ch], 10, height / 2 + (ch - 1.5) * 60);
    }
    let stimX = map(preSamples, 0, epochLength - 1, 60, width - 60);
    stroke(0, 0, 35); strokeWeight(1);
    line(60, height / 2, width - 60, height / 2);
    line(stimX, 45, stimX, height - 25);
    textAlign(CENTER, BOTTOM); textSize(10); fill(0, 0, 65);
    text("-200ms", 60, height - 10);
    text("0ms (Stim)", stimX, height - 10);
    text("400ms", map(153, 0, epochLength - 1, 60, width - 60), height - 10);
    text("+800ms", width - 60, height - 10);
    fill(0, 0, 100); textAlign(CENTER, TOP); textSize(16);
    text("Baseline-Corrected Online ERP Grand Average (K=" + epochData.length + ")", width / 2, 10);
    textSize(12);
    text("4-Channel 256 Hz Ensemble Average (-200 to +800 ms)", width / 2, 30);
  } else {
    fill(0, 0, 70); textAlign(CENTER, CENTER); textSize(16);
    text("Presenting stimuli & collecting -200..+800 ms epochs...", width / 2, height / 2);
  }
}
