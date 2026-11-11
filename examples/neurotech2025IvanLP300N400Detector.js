/**
 * @id neurotech2025IvanLP300N400Detector
 * @title P300 & N400 Component Detector (Ivan Espino Lopez)
 * @category 2025 Neurotech ERP Assignments
 * @order 40
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Multi-channel epoch visualizer that automatically detects P300 (blue circle) and N400 (hazard triangle) ERP components.
 */
// === BrainImation: Multi-channel epoch visualization + P300/N400 response ===

  // Parameters
  const channels = ["TP9", "AF7", "AF8", "TP10"];
  const epochLength = 200;    // as in your working snippet
  const sampleRate = 256;
  const maxEpochs = 2;
  const trialInterval = 1500; // ms between trials
  const eegAvailable = typeof eegData !== "undefined" && eegData.getRecentEpoch;

  // Storage
  let epochStore = []; // each item: array of samples where sample = [ch0,ch1,ch2,ch3]
  let avgEpoch = [];   // length = epochLength, each element = [ch0..ch3]
  let trialStart = 0;
  let trial = 0;

  // Stimulus flags (updated after averaging each new epoch)
  let showP300 = false;
  let showN400 = false;

  // detection thresholds (tweakable)
  const P300_THRESHOLD = 2.0;   // mean amplitude threshold for P300
  const N400_THRESHOLD = -1.5;  // mean amplitude threshold for N400 (negative)

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

      // get a recent epoch (live if available, otherwise simulated)
      let recent = eegAvailable ? eegData.getRecentEpoch(epochLength) : simulateEpoch(epochLength);

      // normalize/ensure recent is an array of samples of 4 channels
      let epoch = normalizeEpoch(recent, epochLength);

      // store epoch
      epochStore.push(epoch);
      if (epochStore.length > maxEpochs) epochStore.shift();

      // compute averaged epoch across stored epochs
      avgEpoch = computeAvgEpoch(epochStore);

      // detect P300 / N400 on averaged epoch
      detectComponents(avgEpoch);
    }

    // --- TOP: EEG averaged epoch visualization (using your working snippet) ---
    push();
    drawTopChart(avgEpoch);
    pop();

    // --- BOTTOM: stimulus / response panel ---
    push();
    translate(0, height / 2);
    drawBottomPanel();
    pop();
  };

  // ---------------------------
  // Draw averaged epoch lines (your working code integrated)
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
          map(avgEpochLocal[i][ch], -50, 50, 30, -30); // using your mapping
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

    // draw vertical 0 ms marker (align sample 0 to left -> sample index mapping depends on epoch origin)
    // Assume epoch starts at 0 ms (if you want negative baseline, adapt index offset)
    // We'll draw a vertical line at the left (0 ms)
    let zeroX = 60;
    stroke(0, 80, 100);
    line(zeroX, 50, zeroX, height / 2 + 120);
  }

  // ---------------------------
  // Bottom panel: show P300 (blue) or N400 (hazard) when detected
  function drawBottomPanel() {
    background(0, 0, 15); // panel background

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
  // compute average epoch across stored epochs
  function computeAvgEpoch(store) {
    if (!store || store.length === 0) return [];
    const len = store[0].length; // samples per epoch
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

  // ---------------------------
  // normalize recent epoch to [samples][4channels]
  function normalizeEpoch(raw, len) {
    // raw may be: 1) array of samples where sample = [ch0,ch1,ch2,ch3]
    //             2) array of arrays per channel returned by getAllChannels (object)
    //             3) single-channel values (simulate)
    if (!raw) {
      // fallback simulate
      return simulateEpoch(len);
    }

    // If eegData.getRecentEpoch returns an array of multi-channel samples, accept it
    if (Array.isArray(raw) && raw.length === len && Array.isArray(raw[0]) && raw[0].length >= 4) {
      return raw.map((s) => [s[0] || 0, s[1] || 0, s[2] || 0, s[3] || 0]);
    }

    // If getAllChannels returned an object with channel arrays
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

    // Otherwise, if raw is a flat array of single-channel values, replicate across channels
    if (Array.isArray(raw) && raw.length === len && !Array.isArray(raw[0])) {
      return raw.map((v) => [v, v, v, v]);
    }

    // Last fallback: simulate
    return simulateEpoch(len);
  }

  // ---------------------------
  // Simulate a multi-channel epoch (for testing when eegData isn't present)
  function simulateEpoch(len) {
    const out = [];
    for (let i = 0; i < len; i++) {
      // basic low-frequency shapes + small jitter; keep scale similar to typical EEG units
      const t = (i / sampleRate) * 1000;
      const base = Math.sin((2 * Math.PI * 8 * i) / sampleRate) * 10; // alpha-ish
      const ch0 = base + random(-5, 5);
      const ch1 = base * 0.9 + random(-5, 5);
      const ch2 = base * 1.1 + random(-5, 5);
      const ch3 = base * 0.8 + random(-5, 5);
      out.push([ch0, ch1, ch2, ch3]);
    }
    return out;
  }

  // ---------------------------
  // detect P300 / N400 on averaged epoch
  function detectComponents(avg) {
    showP300 = false;
    showN400 = false;
    if (!avg || avg.length === 0) return;

    // choose a channel-averaged waveform to inspect (mean across channels per sample)
    const waveform = avg.map((s) => (s[0] + s[1] + s[2] + s[3]) / 4);

    // windows (assume epoch sample 0 = 0 ms). adjust if epoch has baseline offset.
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

  // ---------------------------
  // helper: convert ms to sample index (assumes epochLength covers needed window)
  function msToIndex(ms) {
    // Here we assume epoch sample 0 corresponds to 0 ms — if your epoch includes prestim baseline,
    // you'll need to offset accordingly.
    return Math.floor((ms / 1000) * sampleRate);
  }

  function averageArray(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  // ---------------------------
  // hazard icon (reuse)
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

  // ---------------------------
