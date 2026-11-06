/**
 * @id eegeduGhostLines
 * @title Cascading Ghost Traces (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 14
 *
 * Original ghostLines.p5 sketch by Kyle Mathewson.
 * Draws multi-weight layered EEG waveforms cascading down the screen like a joy-division plot.
 */
let border = 20;
let offset = 20;
let alphas = [0.2, 0.4, 0.6, 1.0];
let weights = [10, 4, 2, 1];
let bias = [2, 3, 4, 5];

function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  noFill();
  background(0);
  border = 20;
  offset = border + 30;
  frameRate(8);
}

function draw() {
  let data = eegData.getRawChannel('AF7', 128);
  if (data && data.length > 2) {
    for (let b = 0; b < alphas.length; b++) {
      stroke(255, 255, 255, alphas[b]);
      strokeWeight(weights[b]);
      beginShape();
      for (let i = 0; i < data.length; i++) {
        let xpos = map(i, 0, data.length - 1, border, width - border);
        curveVertex(xpos, data[i] / bias[b] + offset);
      }
      endShape();
    }
    offset = offset + 35;
    if (offset > height - border) {
      offset = border + 30;
      background(0);
    }
  }
}

function mouseClicked() {
  background(0);
  offset = border + 30;
}
