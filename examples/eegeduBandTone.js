/**
 * @id eegeduBandTone
 * @title Frequency Band Synth & FFT (EEGEdu)
 * @category EEGEdu Modules
 * @order 6
 *
 * Original EEGEdu Animate module sketch (sketchTone.js).
 * Plays a 4-note MIDI sequence driven by Delta, Theta, Beta, and Gamma power,
 * stepped at a tempo controlled by Alpha power, with live p5.FFT spectrum bars.
 */
let osc, envelope, fft;
let scaleArray = [40, 58, 68, 82];
let note = 0;

function setup() {
  createCanvas(width, height);
  osc = new p5.SinOsc();
  envelope = new p5.Env();
  envelope.setADSR(0.001, 0.5, 0.1, 0.5);
  envelope.setRange(0.4, 0);
  osc.start();
  fft = new p5.FFT();
  noStroke();
}

function draw() {
  let delta = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 20);
  let theta = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta) * 20);
  let alpha = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 25);
  let beta  = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta)  * 20);
  let gamma = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma) * 3);

  scaleArray = [delta + 35, theta + 50, beta + 60, gamma * 6 + 70];

  background(20);

  let step = max(6, 30 - alpha);
  if (frameCount % step === 0 || frameCount === 1) {
    let midiValue = scaleArray[note];
    let freqValue = midiToFreq(midiValue);
    osc.freq(freqValue);
    envelope.play(osc, 0, 0.1);
    note = (note + 1) % scaleArray.length;
  }

  let spectrum = fft.analyze();
  let nBars = Math.floor(spectrum.length / 20);
  for (let i = 0; i < nBars; i++) {
    fill(spectrum[i], spectrum[i] / 4, 40);
    let x = map(i, 0, nBars, 0, width);
    let h = map(spectrum[i], 0, 255, 0, height * 0.85);
    rect(x, height, width / nBars + 1, -h);
  }
}
