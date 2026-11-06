/**
 * @id eegeduPredictSound
 * @title Brain State Major Triad Sound (EEGEdu)
 * @category EEGEdu Modules
 * @order 13
 *
 * Original EEGEdu Predict Sound module sketch (sketchPredictSound.js).
 * Maps classified brain state into a C-E-G Major Triad (4:5:6 frequency ratio:
 * 262 Hz, 327.5 Hz, 393 Hz) with amplitude driven by classification confidence.
 * Click canvas to toggle continuous tone on/off.
 */
let osc;
let soundOn = false;

function setup() {
  createCanvas(width, height);
  background(255);
  osc = new p5.Oscillator();
  osc.setType('sine');
}

function startSound() {
  userStartAudio();
  osc.freq(262);
  osc.amp(0);
  osc.start();
}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (soundOn) {
      osc.amp(0, 0.05);
      osc.stop();
      soundOn = false;
    } else {
      startSound();
      soundOn = true;
    }
  }
}

function draw() {
  background(250);
  let a = eegData.alpha;
  let b = eegData.beta;
  let t = eegData.theta;

  let label = 'A';
  let maxVal = a;
  if (b > maxVal) { label = 'B'; maxVal = b; }
  if (t > maxVal) { label = 'C'; maxVal = t; }
  let confidence = constrain(maxVal * 1.3, 0, 1);

  stroke(0);
  strokeWeight(5);

  if (label === 'A') {
    if (confidence > 0.5) {
      fill(120, 120, 250);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(262); }
    } else {
      fill(225, 225, 255);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(262); }
    }
  } else if (label === 'B') {
    if (confidence > 0.5) {
      fill(120, 250, 120);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(327.5); }
    } else {
      fill(225, 255, 225);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(327.5); }
    }
  } else {
    if (confidence > 0.5) {
      fill(250, 120, 120);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(393); }
    } else {
      fill(255, 225, 225);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(393); }
    }
  }

  rect(40, 40, width - 80, height - 110, 12);

  noStroke();
  fill(20);
  textAlign(CENTER, CENTER);
  textSize(18);
  let noteLabel = label === 'A' ? 'C4 (262 Hz - Alpha)' : label === 'B' ? 'E4 (327.5 Hz - Beta)' : 'G4 (393 Hz - Theta)';
  text(`State ${label}: ${noteLabel}  |  Click canvas to ${soundOn ? 'MUTE' : 'ENABLE'} sound`, width / 2, height - 35);
}
