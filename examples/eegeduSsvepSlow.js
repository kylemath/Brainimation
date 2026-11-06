/**
 * @id eegeduSsvepSlow
 * @title SSVEP Slow Flicker 4 Hz + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 9
 *
 * Original EEGEdu SSVEP module (sketchFlashSlow.js + EEGEduSsvep.js).
 * Flashes a high-contrast target disc at 4 Hz around a red central fixation cross
 * to elicit a 4 Hz Steady-State Visually Evoked Potential in visual cortex, while
 * recording 10 seconds of 1–30 Hz PSD spectra across all electrodes and automatically
 * downloading Ssvep_Slow_Frequency_Recording_<timestamp>.csv on completion!
 */
const freq = 4;
const delay = 1000 / freq;
let startTime = 0;

let secondsToSave = 10;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initSsvepCSV() {
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

function logSsvepEpoch() {
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
    .concat(['4Hz_Slow']);
  csvRows.push(row.join(','));
}

function saveSsvepCSV() {
  if (csvRows.length <= 1) logSsvepEpoch();
  isRecording = false;
  let fname = `Ssvep_Slow_Frequency_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\n') + '\n', fname)
    : fname;
}

function restartSsvepRecording() {
  initSsvepCSV();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  textAlign(CENTER, CENTER);
  startTime = millis();
  restartSsvepRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveSsvepCSV();
  if (key === 'r' || key === 'R') restartSsvepRecording();
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 220 && mouseX < width - 115) {
      saveSsvepCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartSsvepRecording();
    }
  }
}

function draw() {
  background(255);
  let now = millis();
  let newOnset = false;

  if (now - startTime >= delay) {
    newOnset = true;
    startTime = startTime === 0 ? now : startTime + delay;
    if (now - startTime > delay * 2) startTime = now;
  }

  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logSsvepEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveSsvepCSV();
    }
  }

  let phaseOn = (now - startTime) < delay * 0.5;
  if (newOnset || phaseOn) {
    fill(0, 0, 0);
  } else {
    fill(240, 240, 240);
  }

  noStroke();
  let d = min(width, height - 80) * 0.65;
  ellipse(width / 2, height / 2 + 12, d, d);

  fill(255, 0, 0);
  textSize(28);
  text('+', width / 2, height / 2 + 12);

  // Top Recording & CSV Download HUD
  fill(24, 24, 34);
  rect(0, 0, width, 46);
  let recElapsed = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(recElapsed / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 17, 10, 10);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC 4 Hz SSVEP CSV: ${(secondsToSave - recElapsed).toFixed(1)}s left  (${csvRows.length - 1} epochs)`
    : `Downloaded: ${savedFileName} (${csvRows.length - 1} epochs)`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

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

  fill(40);
  textSize(13);
  text('SSVEP Slow Flicker — 4 Hz (Fixate on red + for 10s to auto-download CSV)', width / 2, height - 22);
}
