/**
 * @id studentAlizadehFlowerBrain
 * @title FlowerBrain Landscape (Shima Rastgar Alizadeh)
 * @category 2022 NeuroArt Class Gallery
 * @order 5
 *
 * Student NeuroArt Project by Shima Rastgar Alizadeh (PSYC 403).
 * Paint Alpha-sized flowers in the sky above mountains and trees. Click to refresh the sky color!
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  background(180, 220, 250);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 120;
  let THETA = eegData.getChannelBand('theta', 3) * 100;
  let ALPHA = eegData.getChannelBand('alpha', 2) * 80;
  let BETA  = eegData.getChannelBand('beta', 1) * 200;
  let GAMMA = eegData.getChannelBand('gamma', 1) * 200;

  let mx = mouseX || width / 2;
  let my = mouseY || height / 3;

  // Flower petals based on ALPHA size and ALPHA, BETA, GAMMA colors
  stroke(0);
  fill(ALPHA * 3, BETA, GAMMA);
  ellipse(mx - 40, my, ALPHA);
  ellipse(mx + 40, my, ALPHA);
  ellipse(mx, my - 40, ALPHA);
  ellipse(mx, my + 40, ALPHA);

  // Flower center
  fill(ALPHA * 2, DELTA, DELTA);
  ellipse(mx, my, ALPHA);

  push();
  scale(width / 700, height / 700);
  // Mountains
  fill(128, 128, 128);
  triangle(200, 500, 600, 500, 400, 200);
  fill(0, 128, 128);
  triangle(400, 500, 600, 500, 500, 300);

  // Left tree
  fill(165, 42, 42);
  rect(50, 300, 10, 200);
  fill(0, 255, 0);
  ellipse(56, 310, 70, 70);
  ellipse(56, 375, 70, 70);
  ellipse(56, 435, 70, 70);

  // Right tree
  fill(165, 42, 42);
  rect(100, 300, 10, 200);
  fill(0, 255, 0);
  ellipse(105, 310, 70, 70);
  ellipse(105, 375, 70, 70);
  ellipse(105, 435, 70, 70);
  pop();
}

function mouseClicked() {
  let DELTA = eegData.getChannelBand('delta', 0) * 120;
  let ALPHA = eegData.getChannelBand('alpha', 2) * 200;
  background(DELTA, DELTA * 2, ALPHA);
  clickValue = clickValue === 0 ? 255 : 0;
}
