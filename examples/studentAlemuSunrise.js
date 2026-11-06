/**
 * @id studentAlemuSunrise
 * @title Breath Sunrise (Meron Alemu)
 * @category 2022 NeuroArt Class Gallery
 * @order 4
 *
 * Student NeuroArt Project by Meron Alemu.
 * Take a deep breath and exhale to turn the sky and landscape from night to day with Alpha & Gamma waves!
 */
let sunrise = [];

function setup() {
  colorMode(RGB, 255);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 255;
  let THETA = eegData.getChannelBand('theta', 0) * 255;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 255;
  let BETA  = eegData.getChannelBand('beta', 0) * 255;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 255;

  background(10, ALPHA, 200);

  push();
  scale(width / 500, height / 500);

  fill(255, 250, 100);
  sunrise[1] = arc(250, 350, 280, 270, PI, TWO_PI);

  fill(150, 100, 250);
  rect(10, 170, 80, 100);

  fill(150, BETA, 120);
  triangle(10, 173, 47, 100, 95, 173);

  fill(255, 200, 20);
  rect(30, 210, 40, 60);

  fill(255, 255, 250);
  sunrise[2] = arc(250, 320, 180, 170, PI, TWO_PI);

  fill(50, GAMMA, ALPHA);
  rect(0, 270, 500, 230);
  pop();
}
