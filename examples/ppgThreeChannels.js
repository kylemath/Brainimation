/**
 * @id ppgThreeChannels
 * @title 3-Channel PPG Time Series
 * @category PPG & Optical (fNIRS)
 * @order 1
 */
// 3-Channel PPG / Optical Time-Series Visualizer (64 Hz)
// Displays live optical waveforms for Red (660 nm), Near-IR (730 nm / Ambient),
// and Infrared (850 nm) over time, with AC-coupled cardiac pulse extraction,
// DC baseline level, and Perfusion Index (PI = AC/DC %).

const WINDOW_SAMPLES = 256; // 4.0 seconds @ 64 Hz

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function getValidChannel(primaryKey, fallbackKey) {
  let arr = eegData.getPPGChannel(primaryKey, WINDOW_SAMPLES);
  if (!arr || arr.length < 4) {
    arr = eegData.getPPGChannel(fallbackKey, WINDOW_SAMPLES);
  }
  return arr || [];
}

function computeStats(samples) {
  if (!samples || samples.length === 0) {
    return { mean: 0, min: 0, max: 0, p2p: 0, pi: 0, centered: [] };
  }
  let sum = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    sum += v;
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  const mean = sum / samples.length;
  const p2p = maxVal - minVal;
  const pi = mean > 1 ? (p2p / Math.abs(mean)) * 100 : 0;

  // 3-point smoothed, DC-removed waveform
  const centered = new Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const prev = samples[Math.max(0, i - 1)];
    const curr = samples[i];
    const next = samples[Math.min(samples.length - 1, i + 1)];
    centered[i] = (prev + curr + next) / 3 - mean;
  }
  return { mean, min: minVal, max: maxVal, p2p, pi, centered };
}

function draw() {
  background(225, 35, 8);

  // Fetch the 3 optical channels (64 Hz):
  //   1. Red (660 nm)
  //   2. Near-Infrared (730 nm on Athena optics4, or Ambient/PPG1 on Classic)
  //   3. Infrared (850 nm)
  const chRed = getValidChannel('red', 'infrared');
  const chNIR = getValidChannel('nir', 'ambient');
  const chIR  = getValidChannel('infrared', 'red');

  const channels = [
    {
      name: 'RED (660 nm)',
      subtitle: 'Deoxy-Hb (HHb) dominant absorption',
      hue: 355,
      samples: chRed
    },
    {
      name: 'NEAR-IR / AMB (730 nm)',
      subtitle: 'Short-NIR optical / ambient reference',
      hue: 38,
      samples: chNIR
    },
    {
      name: 'INFRARED (850 nm)',
      subtitle: 'Oxy-Hb (HbO2) dominant absorption',
      hue: 190,
      samples: chIR
    }
  ];

  // Header bar
  fill(0, 0, 96);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text('💓 3-Channel PPG / Optical Time Series (64 Hz)', 20, 14);

  textSize(11);
  fill(210, 20, 72);
  text('Window: 4.0 s (256 samples @ 64 Hz)  |  AC-Coupled Pulsatile Waveforms & Perfusion Metrics', 20, 36);

  // Heart rate & pulse badge on top right
  const pulse = eegData.ppgPulse || 0;
  const bpm = eegData.heartRate || 0;
  const heartSize = 12 + pulse * 10;
  fill(350, 85, 95, 0.35 + pulse * 0.65);
  ellipse(width - 135, 26, heartSize, heartSize);
  fill(0, 0, 98);
  textAlign(LEFT, CENTER);
  textSize(14);
  text(bpm > 0 ? `${bpm} BPM` : '-- BPM', width - 118, 26);

  // Layout 3 channel panels
  const topMargin = 62;
  const bottomMargin = 24;
  const panelGap = 14;
  const availH = height - topMargin - bottomMargin - panelGap * 2;
  const panelH = availH / 3;
  const plotLeft = 215;
  const plotRight = width - 24;
  const plotW = Math.max(100, plotRight - plotLeft);

  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    const yTop = topMargin + c * (panelH + panelGap);
    const yMid = yTop + panelH / 2;
    const stats = computeStats(ch.samples);

    // Panel card background
    fill(225, 30, 13, 0.95);
    stroke(ch.hue, 45, 35, 0.7);
    strokeWeight(1);
    rect(16, yTop, width - 32, panelH, 6);

    // Left metadata column
    noStroke();
    fill(ch.hue, 80, 98);
    textAlign(LEFT, TOP);
    textSize(13);
    text(ch.name, 28, yTop + 10);

    fill(215, 18, 70);
    textSize(10);
    text(ch.subtitle, 28, yTop + 28);

    fill(0, 0, 90);
    textSize(11);
    text(`DC Mean: ${Math.round(stats.mean).toLocaleString()}`, 28, yTop + 48);
    text(`AC P-P : ${stats.p2p.toFixed(1)}`, 28, yTop + 64);
    fill(ch.hue, 65, 95);
    text(`PI (AC/DC): ${stats.pi.toFixed(3)}%`, 28, yTop + 80);

    // Plot area frame & gridlines
    stroke(220, 20, 24);
    strokeWeight(1);
    line(plotLeft, yMid, plotRight, yMid);
    line(plotLeft, yTop + 8, plotLeft, yTop + panelH - 8);

    // Time ticks (every 1 second = 64 samples)
    for (let sec = 0; sec <= 4; sec++) {
      const gx = map(sec, 0, 4, plotLeft, plotRight);
      stroke(220, 20, 18);
      line(gx, yTop + 8, gx, yTop + panelH - 8);
      if (c === channels.length - 1) {
        noStroke();
        fill(220, 15, 58);
        textAlign(CENTER, TOP);
        textSize(10);
        text(`-${4 - sec}s`, gx, yTop + panelH - 6);
      }
    }

    // Draw AC-coupled PPG waveform
    const N = stats.centered.length;
    if (N > 2) {
      let maxAmp = 1e-4;
      for (let i = 0; i < N; i++) {
        const a = Math.abs(stats.centered[i]);
        if (a > maxAmp) maxAmp = a;
      }
      const yScale = (panelH * 0.38) / maxAmp;

      // Subtle shaded fill under waveform
      noStroke();
      fill(ch.hue, 75, 85, 0.12);
      beginShape();
      vertex(plotLeft, yMid);
      for (let i = 0; i < N; i++) {
        const x = map(i, 0, WINDOW_SAMPLES - 1, plotLeft, plotRight);
        const y = constrain(yMid - stats.centered[i] * yScale, yTop + 6, yTop + panelH - 6);
        vertex(x, y);
      }
      vertex(map(N - 1, 0, WINDOW_SAMPLES - 1, plotLeft, plotRight), yMid);
      endShape(CLOSE);

      // Main trace
      noFill();
      stroke(ch.hue, 82, 98);
      strokeWeight(2);
      beginShape();
      for (let i = 0; i < N; i++) {
        const x = map(i, 0, WINDOW_SAMPLES - 1, plotLeft, plotRight);
        const y = constrain(yMid - stats.centered[i] * yScale, yTop + 6, yTop + panelH - 6);
        vertex(x, y);
      }
      endShape();

      // Mark systolic peaks
      fill(0, 0, 100);
      noStroke();
      const minDist = 24; // ~0.375 s @ 64 Hz
      let lastPeak = -minDist;
      for (let i = 3; i < N - 3; i++) {
        const v = stats.centered[i];
        if (
          v > maxAmp * 0.3 &&
          v >= stats.centered[i - 1] &&
          v >= stats.centered[i + 1] &&
          v >= stats.centered[i - 2] &&
          v >= stats.centered[i + 2] &&
          i - lastPeak >= minDist
        ) {
          lastPeak = i;
          const px = map(i, 0, WINDOW_SAMPLES - 1, plotLeft, plotRight);
          const py = constrain(yMid - v * yScale, yTop + 6, yTop + panelH - 6);
          ellipse(px, py, 5, 5);
        }
      }
    } else {
      noStroke();
      fill(220, 15, 55);
      textAlign(CENTER, CENTER);
      textSize(12);
      text('Waiting for 64 Hz PPG stream (Connect Muse or click Simulate Data)...', (plotLeft + plotRight) / 2, yMid);
    }
  }
}
