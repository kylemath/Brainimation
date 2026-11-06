/**
 * @id eegeduSpectra
 * @title Overlapping FFT Spectra (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 16
 *
 * Original spectra.p5 sketch by Kyle Mathewson.
 * Draws incoming FFT power spectra overlapping one another. Click to clear background.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  background(255);
  noFill();
}

function draw() {
  let spectra = eegData.getSpectrum(0);
  let freqs = (eegData.spectra && eegData.spectra.freqs) ? eegData.spectra.freqs : Array.from({ length: 60 }, (_, k) => k + 1);

  stroke(255, 0, 0, 0.08);
  strokeWeight(1.5);
  textSize(10);
  noFill();

  if (freqs && freqs.length > 0 && spectra && spectra.length > 0) {
    beginShape();
    for (let i = 0; i < freqs.length; i++) {
      let xpos = map(i, 0, freqs.length - 1, 20, width - 20);
      let yval = constrain(height - 30 - spectra[i] * 8, 20, height - 30);
      curveVertex(xpos, yval);
      if (i % 10 === 0 || i === freqs.length - 1) {
        fill(0);
        noStroke();
        text(freqs[i] + 'Hz', xpos, height - 10);
        noFill();
        stroke(255, 0, 0, 0.04);
      }
    }
    endShape();
  }

  if (mouseIsPressed) {
    background(255);
  }
}
