/**
 * @id studentMazidiAnimation
 * @title Stay Calm Smiley (Shafa Mazidi)
 * @category 2022 NeuroArt Class Gallery
 * @order 16
 *
 * Student NeuroArt Project by Shafa Mazidi.
 * Keep your Beta waves lower than your Delta waves to stay calm—otherwise his head inflates and explodes!
 */
let headwidth = 150;

function setup() {
  colorMode(RGB, 255);
  rectMode(CENTER);
  frameRate(15);
  headwidth = 150;
}

function draw() {
  push();
  translate((width - 400) / 2, (height - 400) / 2);

  let center = 200;
  let eyeX = center - 400 / 6;
  let eyeY = center - 400 / 6;

  background('black');

  fill('yellow');
  circle(center, center, headwidth);
  headwidth = headwidth + (eegData.getChannelBand('beta', 1) - eegData.getChannelBand('delta', 1) * 0.85) * 6;

  if (headwidth >= 151) {
    frameRate(15);
  }

  // Mouth
  fill('black');
  circle(center, center + 20, 100);

  // Mouth cover
  noStroke();
  fill('yellow');
  rect(center, 169, 210, 150);

  // Text
  fill(61, 142, 224);
  textSize(18);
  text('Stay calm, otherwise he might explode!', 30, 22);

  // Left & right eyes
  fill(random(0, 256), random(0, 256), random(0, 256));
  circle(134, eyeY, 20);
  circle(eyeX + 400 * 0.34, eyeY, 20);

  if (headwidth < 151) {
    headwidth = 150;
  }

  if (headwidth >= 283) {
    fill(209, 21, 21);
    rect(center, 200, 400, 400);
    fill(0, 0, 0);
    textSize(46);
    text('GameOver :(', 65, 200);
    headwidth = 150;
  }
  pop();
}
