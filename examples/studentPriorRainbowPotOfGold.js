/**
 * @id studentPriorRainbowPotOfGold
 * @title Rainbow & Pot of Gold (Andrea Prior)
 * @category 2022 NeuroArt Class Gallery
 * @order 19
 *
 * Student NeuroArt Project by Andrea Prior.
 * A bright rainbow over a pot of gold with a sun whose rays grow with Right Frontal Alpha power.
 */
let value = 0;

function setup() {
  colorMode(RGB, 255);
  value = 0;
}

function draw() {
  background(0, 255, 255);

  let MOUSEX = mouseX || width / 3;
  let RIGHTALPHA = 20 + eegData.getChannelBand('alpha', 2) * 140;

  stroke(0);
  // Sun
  fill(255, 230, 0);
  ellipse(MOUSEX + 100, 60, RIGHTALPHA);

  // Rainbow colors
  fill(255, 0, 0);
  ellipse(width / 2, height / 2, width / 1.1, height / 1.2);
  fill(255, 165, 0);
  ellipse(width / 1.9, height / 1.9, width / 1.2, height / 1.3);
  fill(250, 220, 30);
  ellipse(width / 1.8, height / 1.8, width / 1.3, height / 1.4);
  fill(0, 255, 0);
  ellipse(width / 1.7, height / 1.7, width / 1.4, height / 1.5);
  fill(0, 0, 200);
  ellipse(width / 1.6, height / 1.6, width / 1.5, height / 1.6);
  fill(150, 0, 200);
  ellipse(width / 1.5, height / 1.5, width / 1.6, height / 1.7);
  fill(0, 255, 255);
  ellipse(width / 1.4, height / 1.4, width / 1.7, height / 1.8);

  // Pot of gold
  fill(0, 0, 0);
  square(width / 1.16, height / 1.9, 100, 20);

  // Grass
  fill(30, 140, 30);
  rect(0, height / 1.5, width, height);
}

function mouseClicked() {
  value = value === 0 ? 255 : 0;
}
