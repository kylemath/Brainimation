/**
 * @id studentMallickColouredBallMap
 * @title Coloured Ball Map (Roy Mallick)
 * @category 2022 NeuroArt Class Gallery
 * @order 15
 *
 * Student NeuroArt Project by Roy Mallick.
 * Uses the power of 4 electrodes and brainwaves to paint a bubbly bubblegum map of brain activity.
 */
function setup() {
  colorMode(RGB, 255);
  background(0);
  frameRate(5);
  noStroke();
}

function draw() {
  let ONE   = eegData.getChannelBand('alpha', 0) * 45;
  let TWO   = eegData.getChannelBand('theta', 1) * 45;
  let THREE = eegData.getChannelBand('delta', 2) * 45;
  let FOUR  = eegData.getChannelBand('beta', 3) * 45;

  let OneMap   = map(ONE, 0, 40, 0, 255, true);
  let TwoMap   = map(TWO, 0, 40, 0, width, true);
  let ThreeMap = map(THREE, 0, 40, 0, height, true);
  let FourMap  = map(FOUR, 0, 40, 50, 250, true);

  fill(OneMap, 0, 255, 200);
  ellipse(TwoMap, ThreeMap, FourMap);
}

function mousePressed() {
  background(0);
}
