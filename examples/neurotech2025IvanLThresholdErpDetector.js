/**
 * @id neurotech2025IvanLThresholdErpDetector
 * @title P300/N400 Detector with Alpha/Beta Thresholds (Ivan Espino Lopez)
 * @category 2025 Neurotech ERP Assignments
 * @order 42
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Enhanced multi-channel ERP component detector adding real-time Alpha (>0.43) and Beta (>0.62) corner threshold indicators.
 */
// === BrainImation: Multi-channel epoch visualization + P300/N400 response ===

  // Parameters
  const channels = ["TP9", "AF7", "AF8", "TP10"];
  const epochLength = 200;
  const sampleRate = 256;
  const maxEpochs = 2;
  const trialInterval = 1500;
  const eegAvailable = typeof eegData !== "undefined" && eegData.getRecentEpoch;

  // Storage
  let epochStore = [];
  let avgEpoch = [];
  let trialStart = 0;
  let trial = 0;

  // Stimulus flags
  let showP300 = false;
  let showN400 = false;
  let showHighBeta = false;  // NEW: For beta threshold detection
  let showHighAlpha = false; // NEW: For alpha threshold detection

  // detection thresholds
  const P300_THRESHOLD = -0.1;
  const N400_THRESHOLD = -0.8;
  const BETA_THRESHOLD = 0.62;   // NEW: Beta wave threshold
  const ALPHA_THRESHOLD = 0.43;  // NEW: Alpha wave threshold

  function setup() {
    createCanvas(width, height);
    colorMode(HSB, 360, 100, 100);
    textFont("Helvetica");
    frameRate(60);
    trialStart = millis();
  };

  function draw() {
    background(0, 0, 8);

    const now = millis();
    const elapsed = now - trialStart;

    // start a new trial every trialInterval
    if (elapsed > trialInterval) {
      trial++;
      trialStart = now;

      let recent = eegAvailable ? eegData.getRecentEpoch(epochLength) : simulateEpoch(epochLength);
      let epoch = normalizeEpoch(recent, epochLength);

      epochStore.push(epoch);
      if (epochStore.length > maxEpochs) epochStore.shift();

      avgEpoch = computeAvgEpoch(epochStore);
      detectComponents(avgEpoch);
    }

    // Check alpha/beta thresholds every frame
    checkFrequencyThresholds();

    // --- TOP: EEG averaged epoch visualization ---
    push();
    drawTopChart(avgEpoch);
    pop();

    // --- BOTTOM: stimulus / response panel ---
    push();
    translate(0, height / 2);
    drawBottomPanel();
    pop();

    // --- NEW: Draw threshold indicators in bottom right corner ---
    drawThresholdIndicators();
  };

  // ---------------------------
  // NEW: Check frequency band thresholds
  function checkFrequencyThresholds() {
    // Reset flags
    showHighBeta = false;
    showHighAlpha = false;
    
    // Check if frequency band data is available from BrainImation
    if (typeof eegData !== 'undefined') {
      // Check beta threshold (0.71 for high attention)
      if (eegData.beta !== undefined && eegData.beta > BETA_THRESHOLD) {
        showHighBeta = true;
      }
      
      // Check alpha threshold (0.49 for relaxed focus)
      if (eegData.alpha !== undefined && eegData.alpha > ALPHA_THRESHOLD) {
        showHighAlpha = true;
      }
    } else {
      // For testing/demo purposes, simulate some data
      // Remove this section when using real BrainImation data
      let simulatedBeta = 0.6 + noise(frameCount * 0.01) * 0.3;
      let simulatedAlpha = 0.4 + noise(frameCount * 0.02) * 0.3;
      
      if (simulatedBeta > BETA_THRESHOLD) showHighBeta = true;
      if (simulatedAlpha > ALPHA_THRESHOLD) showHighAlpha = true;
    }
  }

  // ---------------------------
  // NEW: Draw threshold indicators in bottom right corner
  function drawThresholdIndicators() {
    const indicatorSize = 40;
    const padding = 20;
    const rightX = width - padding - indicatorSize;
    const bottomY = height - padding - indicatorSize;

    // Draw high beta indicator (upside-down red triangle)
    if (showHighBeta) {
      fill(0, 80, 100); // Red in HSB
      noStroke();
      beginShape();
      vertex(rightX, bottomY - indicatorSize); // Top left
      vertex(rightX + indicatorSize, bottomY - indicatorSize); // Top right
      vertex(rightX + indicatorSize/2, bottomY); // Bottom center
      endShape(CLOSE);
      
      // Optional label
      fill(0, 0, 90);
      textAlign(CENTER, TOP);
      textSize(10);
      text("β > 0.71", rightX + indicatorSize/2, bottomY + 5);
    }

    // Draw high alpha indicator (yellow square) - position to left of beta indicator
    if (showHighAlpha) {
      fill(60, 80, 100); // Yellow in HSB
      noStroke();
      rect(rightX - indicatorSize - padding, bottomY - indicatorSize, 
             indicatorSize, indicatorSize);
      
      // Optional label
      fill(0, 0, 90);
      textAlign(CENTER, TOP);
      textSize(10);
      text("α > 0.49", rightX - indicatorSize/2 - padding, bottomY + 5);
    }
  }

  // ---------------------------
  // Draw averaged epoch lines
  function drawTopChart(avgEpochLocal) {
    // title and info
    fill(0, 0, 100);
    textAlign(CENTER, TOP);
    textSize(16);
    text(`Averaged Epochs (n=${epochStore.length})`, width / 2, 10);
    textSize(12);
    text("Grand average across all channels", width / 2, 30);

    // If no data, show waiting
    if (!avgEpochLocal || avgEpochLocal.length === 0) {
      fill(0, 0, 70);
      textAlign(CENTER, CENTER);
      textSize(18);
      text("Collecting epochs...", width / 2, height / 4);
      textSize(14);
      text("Epochs will appear as data accumulates", width / 2, height / 4 + 30);
      return;
    }

    // channel names & colors
    let channelNames = eegData && eegData.getChannelNames ? eegData.getChannelNames() : channels;
    let colors = [300, 180, 60, 120];

    // draw each channel's averaged trace
    for (let ch = 0; ch < 4; ch++) {
      stroke(colors[ch], 80, 90);
      strokeWeight(2);
      noFill();

      beginShape();
      for (let i = 0; i < avgEpochLocal.length; i++) {
        let x = map(i, 0, avgEpochLocal.length - 1, 60, width - 60);
        let y =
          height / 2 +
          (ch - 1.5) * 60 +
          map(avgEpochLocal[i][ch], -50, 50, 30, -30);
        vertex(x, y);
      }
      endShape();

      // Channel label
      fill(colors[ch], 80, 90);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(12);
      text(channelNames[ch], 10, height / 2 + (ch - 1.5) * 60);
    }

    // zero line and time markers
    stroke(0, 0, 30);
    strokeWeight(1);
    line(60, height / 2, width - 60, height / 2);

    textAlign(CENTER, BOTTOM);
    textSize(10);
    fill(0, 0, 60);
    text("0 ms", 60, height - 10);
    text("250 ms", width / 2, height - 10);
    text("500 ms", width - 60, height - 10);

    // draw vertical 0 ms marker
    let zeroX = 60;
    stroke(0, 80, 100);
    line(zeroX, 50, zeroX, height / 2 + 120);
  }

  // ---------------------------
  // Bottom panel: show P300 (blue) or N400 (hazard) when detected
  function drawBottomPanel() {
    background(0, 0, 15);

    const cx = width / 2;
    const cy = height / 4;

    if (showP300) {
      fill(210, 80, 100);
      noStroke();
      ellipse(cx, cy, 120);
      fill(0, 0, 90);
      textAlign(CENTER);
      textSize(14);
      text("P300 detected (blue)", cx, cy + 80);
    } else if (showN400) {
      drawHazard(cx, cy, 120);
      fill(0, 0, 90);
      textAlign(CENTER);
      textSize(14);
      text("N400 detected (hazard)", cx, cy + 80);
    } else {
      fill(0, 0, 90);
      textAlign(CENTER);
      textSize(14);
      text("No component detected", cx, cy + 80);
    }

    textSize(12);
    text(`Trial ${trial}`, cx, cy + 100);
  }

  // ---------------------------
  // Existing helper functions (unchanged)
  function computeAvgEpoch(store) {
    if (!store || store.length === 0) return [];
    const len = store[0].length;
    const avg = [];
    for (let i = 0; i < len; i++) {
      const sampleSum = [0, 0, 0, 0];
      for (let e = 0; e < store.length; e++) {
        const s = store[e][i];
        for (let ch = 0; ch < 4; ch++) sampleSum[ch] += s[ch] || 0;
      }
      avg.push(sampleSum.map((v) => v / store.length));
    }
    return avg;
  }

  function normalizeEpoch(raw, len) {
    if (!raw) return simulateEpoch(len);
    
    if (Array.isArray(raw) && raw.length === len && Array.isArray(raw[0]) && raw[0].length >= 4) {
      return raw.map((s) => [s[0] || 0, s[1] || 0, s[2] || 0, s[3] || 0]);
    }

    if (typeof raw === "object" && raw !== null && raw[channels[0]]) {
      const ch0 = raw[channels[0]];
      const chLen = ch0.length;
      const out = [];
      for (let i = 0; i < chLen; i++) {
        out.push([
          raw[channels[0]][i] || 0,
          raw[channels[1]][i] || 0,
          raw[channels[2]][i] || 0,
          raw[channels[3]][i] || 0,
        ]);
      }
      return out;
    }

    if (Array.isArray(raw) && raw.length === len && !Array.isArray(raw[0])) {
      return raw.map((v) => [v, v, v, v]);
    }

    return simulateEpoch(len);
  }

  function simulateEpoch(len) {
    const out = [];
    for (let i = 0; i < len; i++) {
      const base = Math.sin((2 * Math.PI * 8 * i) / sampleRate) * 10;
      const ch0 = base + random(-5, 5);
      const ch1 = base * 0.9 + random(-5, 5);
      const ch2 = base * 1.1 + random(-5, 5);
      const ch3 = base * 0.8 + random(-5, 5);
      out.push([ch0, ch1, ch2, ch3]);
    }
    return out;
  }

  function detectComponents(avg) {
    showP300 = false;
    showN400 = false;
    if (!avg || avg.length === 0) return;

    const waveform = avg.map((s) => (s[0] + s[1] + s[2] + s[3]) / 4);
    const p300Start = msToIndex(250);
    const p300End = msToIndex(450);
    const n400Start = msToIndex(350);
    const n400End = msToIndex(500);

    const p300Win = waveform.slice(p300Start, Math.min(p300End, waveform.length));
    const n400Win = waveform.slice(n400Start, Math.min(n400End, waveform.length));

    const p300Amp = averageArray(p300Win);
    const n400Amp = averageArray(n400Win);

    if (p300Amp > P300_THRESHOLD) showP300 = true;
    if (n400Amp < N400_THRESHOLD) showN400 = true;
  }

  function msToIndex(ms) {
    return Math.floor((ms / 1000) * sampleRate);
  }

  function averageArray(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function drawHazard(x, y, size) {
    push();
    translate(x, y);
    fill(30, 100, 100);
    stroke(30, 80, 80);
    strokeWeight(2);
    beginShape();
    vertex(0, -size / 2);
    vertex(-size / 2, size / 2);
    vertex(size / 2, size / 2);
    endShape(CLOSE);
    fill(0, 0, 100);
    noStroke();
    const inner = size * 0.7;
    beginShape();
    vertex(0, -inner / 2);
    vertex(-inner / 2, inner / 2);
    vertex(inner / 2, inner / 2);
    endShape(CLOSE);
    pop();
  }
