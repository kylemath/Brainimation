/**
 * @id eegeduEvokedOddball
 * @title Visual Oddball ERP Stimulus + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 8
 *
 * Original EEGEdu Evoked Potentials (ERP) module (sketchEvoked.js + EEGEduEvoked.js).
 * Flashes Standard (blue, 75%, Marker=10) and Target (red, 25%, Marker=20) visual stimuli
 * at random 500–1500 ms intervals around a central fixation cross, while recording
 * timestamped 4-channel EEG + stimulus/response/touch markers to CSV.
 * Automatically downloads Evoked_Recording_<timestamp>.csv when the countdown finishes,
 * or press S / click Save CSV anytime to download immediately!
 */
let targProp = 0.25;
let isTarget = false;
let elapsedTime = 0;
let nextDelay = 1000;
let newOnset = true;
let startTime = 0;
let targCount = 0;
let targetHits = 0;
let flashHoldMs = 180;
let lastResponseKey = '';

let secondsToSave = 60;
let isRecording = true;
let recordStartMs = 0;
let csvRows = [];
let savedFileName = '';

function initEvokedCSV() {
  csvRows = [];
  csvRows.push(
    'Timestamp (ms),Marker,SpaceBar,TouchMarker,ch0_4ms,ch1_4ms,ch2_4ms,ch3_4ms,chAux_4ms,info'
  );
  window.marker = 0;
  window.responseMarker = 0;
  window.touchMarker = 0;
}

function logEvokedSample() {
  let ch0 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[0] : (eegData.getRawChannel('TP9', 1)[0] || 0);
  let ch1 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[1] : (eegData.getRawChannel('AF7', 1)[0] || 0);
  let ch2 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[2] : (eegData.getRawChannel('AF8', 1)[0] || 0);
  let ch3 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[3] : (eegData.getRawChannel('TP10', 1)[0] || 0);
  let chAux = eegData.aux || 0;

  let m = window.marker || 0;
  let r = window.responseMarker || 0;
  let tm = window.touchMarker || 0;

  csvRows.push(
    `${Date.now()},${m},${r},${tm},${ch0.toFixed(3)},${ch1.toFixed(3)},${ch2.toFixed(3)},${ch3.toFixed(3)},${chAux.toFixed(3)},256Hz`
  );

  // Reset impulse markers after logging sample (exact EEGEduEvoked.js behavior)
  window.marker = 0;
  window.responseMarker = 0;
  window.touchMarker = 0;
}

function saveEvokedCSV() {
  if (csvRows.length <= 1) logEvokedSample();
  isRecording = false;
  let fname = `Evoked_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\n') + '\n', fname)
    : fname;
}

function restartEvokedRecording() {
  initEvokedCSV();
  recordStartMs = millis();
  targCount = 0;
  targetHits = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  noStroke();
  textAlign(CENTER, CENTER);
  startTime = millis();
  restartEvokedRecording();
}

function touchStarted() {
  if (mouseY < 48) return;
  window.touchMarker = 255;
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 310 && mouseX < width - 225) {
      secondsToSave = secondsToSave === 60 ? 15 : secondsToSave === 15 ? 30 : 60;
      restartEvokedRecording();
    } else if (mouseX >= width - 220 && mouseX < width - 115) {
      saveEvokedCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartEvokedRecording();
    }
    return;
  }
  window.touchMarker = 255;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveEvokedCSV();
    return;
  }
  if (key === 'r' || key === 'R') {
    restartEvokedRecording();
    return;
  }
  window.responseMarker = keyCode;
  lastResponseKey = key === ' ' ? 'SPACE' : key;
}

function draw() {
  background(255);
  let now = millis();
  elapsedTime = now - startTime;

  if (elapsedTime > nextDelay) {
    newOnset = true;
  } else {
    newOnset = false;
  }

  if (newOnset) {
    targCount++;
    nextDelay = 500 + int(random() * 1000);
    startTime = now;
    elapsedTime = 0;
    isTarget = random() < targProp;

    if (isTarget) {
      targetHits++;
      window.marker = 20;
      if (typeof eegData.triggerERP === 'function') eegData.triggerERP('target');
    } else {
      window.marker = 10;
      if (typeof eegData.triggerERP === 'function') eegData.triggerERP('standard');
    }
  }

  if (isRecording) {
    logEvokedSample();
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveEvokedCSV();
    }
  }

  let diameter = min(width, height - 80) * 0.62;
  if (elapsedTime < flashHoldMs) {
    if (isTarget) {
      fill(250, 150, 150);
    } else {
      fill(150, 150, 250);
    }
  } else {
    fill(245, 245, 248);
  }

  ellipse(width / 2, height / 2 + 12, diameter, diameter);

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
    ? `REC Evoked CSV: ${(secondsToSave - recElapsed).toFixed(1)}s left  (${csvRows.length - 1} rows)`
    : `Downloaded: ${savedFileName} (${csvRows.length - 1} rows)`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  // Duration toggle button (15s / 30s / 60s)
  fill(55, 60, 82);
  rect(width - 308, 9, 80, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(`⏱ ${secondsToSave}s`, width - 268, 23);

  // Save CSV button
  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  text('💾 Save CSV (S)', width - 170, 23);

  // Restart button
  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);

  // Bottom trial info bar
  fill(40);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(
    `Trial #${targCount} (Targets: ${targetHits})  |  ${isTarget ? 'TARGET (Red, Marker=20)' : 'STANDARD (Blue, Marker=10)'}  |  Press SPACE on Red Target`,
    width / 2,
    height - 22
  );
}
