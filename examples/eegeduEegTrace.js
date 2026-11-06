/**
 * @id eegeduEegTrace
 * @title 4-Channel EEG Trace (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 11
 *
 * Original eegTrace.p5 sketch by Kyle Mathewson.
 * Draws the 4 incoming EEG channels like clinical recording software with millisecond markers.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  noFill();
}

function draw() {
  background(255);
  let channels = eegData.getAllChannels(128);
  let data = [channels.TP9, channels.AF7, channels.AF8, channels.TP10];
  let srate = eegData.sampleRate || 256;
  let period = 1 / srate;
  let nSamples = data[0].length;

  if (nSamples > 2) {
    let colors = [
      [217, 95, 2],
      [27, 158, 119],
      [117, 112, 179],
      [231, 41, 138]
    ];
    let offsets = [height / 1.5, height / 2, height / 2.5, height / 3];

    for (let ch = 0; ch < 4; ch++) {
      stroke(colors[ch][0], colors[ch][1], colors[ch][2]);
      strokeWeight(2);
      noFill();
      beginShape();
      for (let i = 0; i < nSamples; i++) {
        let xpos = map(i, 0, nSamples - 1, 0, width);
        curveVertex(xpos, height - data[ch][i] / 2 - offsets[ch]);
      }
      endShape();
    }

    // Millisecond markers along bottom
    textSize(11);
    fill(0);
    noStroke();
    for (let i = 0; i < nSamples; i += 32) {
      let xpos = map(i, 0, nSamples - 1, 0, width);
      text(round(i * period * 1000) + ' ms', xpos, height - 10);
    }
  }
}
