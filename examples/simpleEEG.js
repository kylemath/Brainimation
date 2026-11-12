/**
 * @id simpleEEG
 * @title Simple EEG: 4 Channels (filtered)
 * @category Start Here: One Simple Sketch per Sensor
 * @order 1
 */
// The four EEG channels at 256 Hz, after the built-in 60 Hz notch + 0.5 Hz high-pass (eegData.lineFilter).
// eegData.getRawChannel('TP9' | 'AF7' | 'AF8' | 'TP10', n) returns the last n samples in microvolts.
function setup() {
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  const names = ['TP9', 'AF7', 'AF8', 'TP10'];
  const cols = [[96, 165, 250], [45, 212, 191], [251, 191, 36], [244, 114, 182]];
  const h = height / 4;
  for (let c = 0; c < 4; c++) {
    const data = eegData.getRawChannel(names[c], 512);
    const mid = h * c + h / 2;
    stroke(40, 50, 70); strokeWeight(1); line(0, mid, width, mid);
    noStroke(); fill(...cols[c]); textSize(12); text(names[c], 8, h * c + 16);
    if (data.length < 2) continue;
    noFill(); stroke(...cols[c]); strokeWeight(1.5);
    beginShape();
    for (let i = 0; i < data.length; i++) {
      vertex(map(i, 0, data.length - 1, 0, width), mid - constrain(data[i], -100, 100) * (h / 220));
    }
    endShape();
  }
}
