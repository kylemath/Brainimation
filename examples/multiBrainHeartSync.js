/**
 * @id multiBrainHeartSync
 * @title Brain-Heart Synchrony (EEG Bands + PPG Pulse + HR)
 * @category Multimodal (EEG + PPG + HR)
 * @order 1
 */
// Multimodal Brain-Heart Synchrony Cockpit
// Combines:
//   - 4-Electrode EEG Frequency Bands (Delta, Theta, Alpha, Beta, Gamma)
//   - 64 Hz PPG Arterial Pulse Wave & Systolic Peak Heart Rate (BPM)
//   - Live Brain-Heart Phase-Locking & Autonomic Balance (Alpha/Beta vs HR)

const HIST_MAX = 220;
let syncHistory = [];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function draw() {
  background(226, 40, 8);

  const t = millis() * 0.001;
  const alpha = eegData.alpha || (0.45 + 0.25 * sin(t * 1.4));
  const beta  = eegData.beta  || (0.38 + 0.22 * cos(t * 2.1));
  const theta = eegData.theta || (0.35 + 0.20 * sin(t * 1.1));
  const gamma = eegData.gamma || (0.28 + 0.18 * cos(t * 2.9));
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.48 + 0.45 * Math.pow(max(0, sin(t * 3.8)), 3);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : Math.round(70 + (beta - alpha) * 18);

  // Compute Brain-Heart Synchrony Index (0 - 100%)
  const calmRatio = alpha / Math.max(0.1, alpha + beta);
  const hrNorm = constrain(map(bpm, 55, 105, 1.0, 0.2), 0, 1);
  const syncIndex = constrain((calmRatio * 0.6 + hrNorm * 0.4) * 100, 15, 99);

  syncHistory.push({ alpha, beta, theta, pulse, syncIndex });
  if (syncHistory.length > HIST_MAX) syncHistory.shift();

  // Header
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(15);
  text('🧠💓 Multimodal Brain-Heart Synchrony (EEG + PPG + Heart Rate)', 18, 12);
  fill(210, 20, 74);
  textSize(10.5);
  text(`HR: ${bpm} BPM  |  EEG Alpha/Beta Ratio: ${(alpha / Math.max(0.05, beta)).toFixed(2)}  |  Brain-Heart Coherence: ${syncIndex.toFixed(1)}%`, 18, 32);

  // Top Dual Oscillators: Left = Brain Cortex Node, Right = Cardiac Node, Center = Coupled Bridge
  const topBoxY = 54;
  const topBoxH = (height - 80) * 0.50;
  const midY = topBoxY + topBoxH / 2;

  fill(225, 32, 12, 0.95);
  stroke(275, 50, 45);
  strokeWeight(1);
  rect(16, topBoxY, width - 32, topBoxH, 6);

  const brainX = width * 0.24;
  const heartX = width * 0.76;

  // Draw coupled phase filaments between Brain and Heart
  noFill();
  for (let k = 0; k < 5; k++) {
    const bandVals = [alpha, beta, theta, gamma, pulse];
    const hues = [190, 35, 275, 135, 352];
    stroke(hues[k], 85, 96, 0.55);
    strokeWeight(1.5 + bandVals[k] * 2);
    beginShape();
    for (let u = 0; u <= 1.01; u += 0.04) {
      const x = lerp(brainX, heartX, u);
      const env = sin(u * PI);
      const y = midY + env * sin(u * TWO_PI * (2 + k) - t * (3 + k)) * (18 + bandVals[k] * 38);
      vertex(x, y);
    }
    endShape();
  }

  // Left: EEG Cortical Node
  noStroke();
  fill(195, 85, 95, 0.22);
  ellipse(brainX, midY, 88 + alpha * 36, 88 + alpha * 36);
  fill(195, 85, 98);
  ellipse(brainX, midY, 54 + alpha * 18, 54 + alpha * 18);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(12);
  text('EEG CORTEX', brainX, midY - 7);
  textSize(10);
  text(`α ${(alpha * 100).toFixed(0)}% β ${(beta * 100).toFixed(0)}%`, brainX, midY + 9);

  // Right: PPG Cardiac Node
  fill(352, 85, 95, 0.24);
  ellipse(heartX, midY, 88 + pulse * 44, 88 + pulse * 44);
  fill(352, 88, 98);
  ellipse(heartX, midY, 54 + pulse * 24, 54 + pulse * 24);
  fill(0, 0, 100);
  textSize(12);
  text('PPG HEART', heartX, midY - 7);
  textSize(10);
  text(`${bpm} BPM`, heartX, midY + 9);

  // Center Synchrony Badge
  fill(225, 45, 14, 0.92);
  stroke(160, 80, 90);
  strokeWeight(1.5);
  ellipse(width / 2, midY, 74, 74);
  noStroke();
  fill(160, 85, 98);
  textSize(15);
  text(`${syncIndex.toFixed(0)}%`, width / 2, midY - 6);
  fill(0, 0, 88);
  textSize(8.5);
  text('SYNCHRONY', width / 2, midY + 11);

  // Bottom Panel: Overlaid EEG Alpha/Beta & PPG Cardiac Pulse Time Series
  const botY = topBoxY + topBoxH + 12;
  const botH = height - botY - 14;
  fill(225, 32, 12, 0.95);
  stroke(200, 45, 40);
  strokeWeight(1);
  rect(16, botY, width - 32, botH, 6);

  noStroke();
  fill(0, 0, 96);
  textAlign(LEFT, TOP);
  textSize(11);
  text('Co-Registered Multimodal Streams: PPG Pulse (Red), EEG Alpha (Cyan), EEG Theta (Purple)', 28, botY + 8);

  const pL = 28;
  const pR = width - 28;
  const pTop = botY + 28;
  const pBot = botY + botH - 10;

  if (syncHistory.length > 2) {
    const keys = [
      { k: 'theta', hue: 275, w: 1.6 },
      { k: 'alpha', hue: 190, w: 2.2 },
      { k: 'pulse', hue: 352, w: 2.2 }
    ];
    for (const s of keys) {
      noFill();
      stroke(s.hue, 85, 98);
      strokeWeight(s.w);
      beginShape();
      for (let i = 0; i < syncHistory.length; i++) {
        const x = map(i, 0, HIST_MAX - 1, pL, pR);
        const y = map(syncHistory[i][s.k], 0, 1, pBot, pTop);
        vertex(x, y);
      }
      endShape();
    }
  }
}
