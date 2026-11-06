/**
 * @id eegeduAlphaFixation
 * @title Alpha Eyes Open/Closed Fixation + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 11
 *
 * Original EEGEdu Alpha & Bands Recording module (sketchFixation.js + EEGEduAlpha.js + EEGEduBands.js).
 * Displays the red fixation cross inside a grey circle while recording 1–30 Hz PSD spectra (Alpha_Open / Alpha_Closed)
 * and 5-band power (Bands_Recording) across all 4 electrodes (TP9, AF7, AF8, TP10).
 * Toggle Eyes Open (O) vs Eyes Closed (C), or switch Duration (10s / 60s), and auto-downloads the .csv on completion!
 */
let condition = 'Open'; // 'Open' or 'Closed'
let csvMode = 'Alpha';  // 'Alpha' (1-30 Hz spectra) or 'Bands' (delta..gamma per channel)
let secondsToSave = 60;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initAlphaCSV() {
  csvRows = [];
  if (csvMode === 'Bands') {
    csvRows.push(
      'Timestamp (ms),delta0,delta1,delta2,delta3,deltaAux,theta0,theta1,theta2,theta3,thetaAux,alpha0,alpha1,alpha2,alpha3,alphaAux,beta0,beta1,beta2,beta3,betaAux,gamma0,gamma1,gamma2,gamma3,gammaAux'
    );
  } else {
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
}

function logAlphaEpoch() {
  if (csvMode === 'Bands') {
    let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
    let vals = [Date.now()];
    for (let b of bands) {
      for (let ch = 0; ch < 4; ch++) {
        let v = eegData.getChannelBand ? eegData.getChannelBand(b, ch) : (eegData[b] || 0);
        vals.push(v.toFixed(4));
      }
      vals.push('0');
    }
    csvRows.push(vals.join(','));
  } else {
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
      .concat([`Eyes_${condition}`]);
    csvRows.push(row.join(','));
  }
}

function saveAlphaCSV() {
  if (csvRows.length <= 1) logAlphaEpoch();
  isRecording = false;
  let fname = csvMode === 'Bands'
    ? `Bands_${condition}_Recording_${Date.now()}.csv`
    : `Alpha_${condition}_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\n') + '\n', fname)
    : fname;
}

function restartAlphaRecording() {
  initAlphaCSV();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  noStroke();
  textAlign(CENTER, CENTER);
  restartAlphaRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveAlphaCSV();
  if (key === 'r' || key === 'R') restartAlphaRecording();
  if (key === 'o' || key === 'O') { condition = 'Open'; restartAlphaRecording(); }
  if (key === 'c' || key === 'C') { condition = 'Closed'; restartAlphaRecording(); }
  if (key === 'b' || key === 'B') { csvMode = csvMode === 'Alpha' ? 'Bands' : 'Alpha'; restartAlphaRecording(); }
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 420 && mouseX < width - 315) {
      condition = condition === 'Open' ? 'Closed' : 'Open';
      restartAlphaRecording();
    } else if (mouseX >= width - 310 && mouseX < width - 225) {
      secondsToSave = secondsToSave === 60 ? 10 : 60;
      restartAlphaRecording();
    } else if (mouseX >= width - 220 && mouseX < width - 115) {
      saveAlphaCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartAlphaRecording();
    }
  }
}

function draw() {
  background(255);
  let now = millis();

  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logAlphaEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveAlphaCSV();
    }
  }

  // Original sketchFixation.js stimulus: grey disc + red central '+'
  noStroke();
  fill(240, 240, 240);
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
    ? `REC ${csvMode} (${condition}): ${(secondsToSave - recElapsed).toFixed(1)}s left (${csvRows.length - 1} epochs)`
    : `Downloaded: ${savedFileName}`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 210, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 210 * pct, 6, 3);

  // Condition button (Eyes Open / Eyes Closed)
  fill(condition === 'Open' ? color(50, 110, 190) : color(130, 75, 180));
  rect(width - 418, 9, 102, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(`👁 Eyes ${condition}`, width - 367, 23);

  // Duration toggle (60s / 10s)
  fill(55, 60, 82);
  rect(width - 308, 9, 80, 28, 5);
  fill(255);
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

  fill(40);
  textSize(13);
  text(
    `Condition: Eyes ${condition} (Press O=Open, C=Closed, B=${csvMode} CSV)  |  Alpha Power: ${(eegData.alpha * 100).toFixed(0)}%`,
    width / 2,
    height - 22
  );
}
