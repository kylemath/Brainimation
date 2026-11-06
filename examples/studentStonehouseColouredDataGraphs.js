/**
 * @id studentStonehouseColouredDataGraphs
 * @title 4-Electrode Band Bar Graph (Grace Stonehouse)
 * @category 2022 NeuroArt Class Gallery
 * @order 24
 *
 * Student NeuroArt Project by Grace Stonehouse.
 * Displays all 20 band-by-electrode power values (5 bands x 4 Muse electrodes) with a color-coded legend.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(0);

  push();
  scale(width / 500, height / 700);

  let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  let eColors = [
    [0, 0, 255],
    [0, 255, 0],
    [255, 0, 0],
    [255, 255, 0]
  ];

  stroke(0);
  strokeWeight(1);

  for (let b = 0; b < 5; b++) {
    for (let ch = 0; ch < 4; ch++) {
      let val = eegData.getChannelBand(bands[b], ch) * 480;
      fill(eColors[ch][0], eColors[ch][1], eColors[ch][2]);
      rect(b * 100 + ch * 25, 0, 25, val);
    }
  }

  // Grid lines
  strokeWeight(2);
  stroke(255);
  line(100, 0, 100, 550);
  line(200, 0, 200, 550);
  line(300, 0, 300, 550);
  line(400, 0, 400, 550);
  line(0, 550, 500, 550);

  // Band Labels
  stroke(0);
  fill(255);
  textSize(14);
  text('DELTA', 25, 520);
  text('THETA', 125, 520);
  text('ALPHA', 225, 520);
  text('BETA', 325, 520);
  text('GAMMA', 425, 520);

  // Legend
  let labels = ['ELECTRODE 0 (TP9)', 'ELECTRODE 1 (AF7)', 'ELECTRODE 2 (AF8)', 'ELECTRODE 3 (TP10)'];
  for (let ch = 0; ch < 4; ch++) {
    fill(eColors[ch][0], eColors[ch][1], eColors[ch][2]);
    rect(25, 565 + ch * 35, 15, 15);
    text(labels[ch], 60, 578 + ch * 35);
  }
  pop();
}
