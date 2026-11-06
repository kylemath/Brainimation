/**
 * @id eegeduEpochs
 * @title Overlapping Epochs Butterfly (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 12
 *
 * Original epochs.p5 sketch by Kyle Mathewson.
 * Draws incoming EEG epochs overlapping one another with translucent red ink. Click to clear.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  background(255);
  noFill();
}

function draw() {
  let data = eegData.getRawChannel('TP9', 128);
  let srate = eegData.sampleRate || 256;
  let period = 1 / srate;

  stroke(255, 0, 0, 0.04);
  strokeWeight(1.5);
  noFill();
  textSize(10);

  if (data && data.length > 2) {
    beginShape();
    for (let i = 0; i < data.length; i++) {
      let xpos = map(i, 0, data.length - 1, 0, width);
      curveVertex(xpos, height - data[i] / 2 - height / 2);
      if (i % 50 === 0 || i === data.length - 1) {
        fill(0);
        noStroke();
        text(round(i * period * 1000) + 'ms', xpos, height - 10);
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
