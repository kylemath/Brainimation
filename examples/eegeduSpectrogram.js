/**
 * @id eegeduSpectrogram
 * @title Scrolling Waterfall Spectrogram (EEGEdu)
 * @category EEGEdu Modules
 * @order 7
 *
 * Original EEGEdu Spectrogram & Spectra module sketch (sketchSpectro.js + EEGEduSpectra.js).
 * Shifts the canvas left each frame and paints the current PSD spectrum column on the right edge.
 * Automatically records 10s of 1–30 Hz PSD spectra across all electrodes and downloads
 * Spectra_Recording_<timestamp>.csv when complete (or click Save Now / press S anytime).
 */
let speed = 4;
let secondsToSave = 10;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initSpectraHeader() {
  csvRows = [];
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let header = ['Timestamp (ms)']
    .concat(freqs.map(f => `ch0_${f}Hz`))
    .concat(freqs.map(f => `ch1_${f}Hz`))
    .concat(freqs.map(f => `ch2_${f}Hz`))
    .concat(freqs.map(f => `ch3_${f}Hz`))
    .concat(freqs.map(f => `chAux_${f}Hz`))
    .concat(freqs.map(f => `f_${f}Hz`))
    .concat(['info']);
  csvRows.push(header.join(','));
}

function logSpectraEpoch() {
  let ch0 = eegData.getSpectrum ? eegData.getSpectrum(0).slice(0, 30) : new Array(30).fill(0);
  let ch1 = eegData.getSpectrum ? eegData.getSpectrum(1).slice(0, 30) : new Array(30).fill(0);
  let ch2 = eegData.getSpectrum ? eegData.getSpectrum(2).slice(0, 30) : new Array(30).fill(0);
  let ch3 = eegData.getSpectrum ? eegData.getSpectrum(3).slice(0, 30) : new Array(30).fill(0);
  let chAux = new Array(30).fill(0);
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let row = [Date.now()]
    .concat(ch0.map(v => v.toFixed(4)))
    .concat(ch1.map(v => v.toFixed(4)))
    .concat(ch2.map(v => v.toFixed(4)))
    .concat(ch3.map(v => v.toFixed(4)))
    .concat(chAux)
    .concat(freqs)
    .concat(['256Hz']);
  csvRows.push(row.join(','));
}

function saveSpectraCSV() {
  if (csvRows.length <= 1) logSpectraEpoch();
  isRecording = false;
  let fname = `Spectra_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\n') + '\n', fname)
    : fname;
}

function restartSpectraRecording() {
  initSpectraHeader();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  noStroke();
  colorMode(RGB);
  background(15, 15, 25);
  restartSpectraRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveSpectraCSV();
  } else if (key === 'r' || key === 'R') {
    restartSpectraRecording();
  }
}

function mousePressed() {
  if (mouseY < 46) {
    if (mouseX > width - 220 && mouseX < width - 115) {
      saveSpectraCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartSpectraRecording();
    }
  }
}

function draw() {
  let psd = eegData.getSpectrum ? eegData.getSpectrum(1) : [];
  let binCount = psd.length;

  // Shift existing waterfall area (below top HUD bar) left by `speed` pixels
  copy(0, 48, width, height - 48, -speed, 48, width, height - 48);

  if (binCount > 0) {
    let wfHeight = height - 48;
    for (let i = 0; i < binCount; i++) {
      let value = psd[i] || 0;
      let c = constrain((value / 25) * 255, 0, 255);
      fill(c, c * 0.85 + 20, min(255, c * 1.2 + 40));
      let percent = i / binCount;
      let y = percent * wfHeight;
      rect(width - speed, height - y, speed, Math.ceil(wfHeight / binCount) + 1);
    }
  }

  let now = millis();
  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logSpectraEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveSpectraCSV();
    }
  }

  // Top Recording & CSV Download HUD
  fill(14, 14, 22, 240);
  rect(0, 0, width, 46);
  let elapsedSec = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(elapsedSec / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 23, 10, 10);

  fill(240);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC Spectra CSV: ${(secondsToSave - elapsedSec).toFixed(1)}s left (${csvRows.length - 1} epochs)`
    : `Saved ${savedFileName} (${csvRows.length - 1} epochs)`;
  text(statusTxt, 30, 16);

  // Progress bar
  fill(40, 42, 58);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  // Action buttons
  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text('💾 Save CSV (S)', width - 170, 23);

  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);
}
