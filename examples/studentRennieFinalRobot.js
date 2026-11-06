/**
 * @id studentRennieFinalRobot
 * @title Smiling EEG Robot (Victoria Rennie)
 * @category 2022 NeuroArt Class Gallery
 * @order 20
 *
 * Student NeuroArt Project by Victoria Rennie.
 * Robot pupils track your mouse! Hold the mouse button to make the robot smile and color the background with Alpha & Theta.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(15);
}

function draw() {
  let alpha = eegData.getChannelBand('alpha', 1) * 255;
  let theta = eegData.getChannelBand('theta', 3) * 255;

  if (mouseIsPressed) {
    background(alpha, theta, 100);
  } else {
    background(128, 128, 128);
  }

  let s = min(width, height);
  push();
  translate((width - s) / 2, (height - s) / 2);

  // Face
  stroke(0);
  strokeWeight(10);
  fill(112, 212, 255);
  square(s * 0.1, s * 0.1, s * 0.8);

  // Inner eyes
  fill(247, 201, 74);
  circle(s * 0.35, s * 0.375, s * 0.16);
  circle(s * 0.65, s * 0.375, s * 0.16);

  // Pupils
  fill(0, 0, 0);
  let px = constrain((mouseX - width / 2) * 0.08, -s * 0.04, s * 0.04);
  let py = constrain((mouseY - height / 2) * 0.08, -s * 0.04, s * 0.04);
  circle(s * 0.35 + px, s * 0.375 + py, s * 0.025);
  circle(s * 0.65 + px, s * 0.375 + py, s * 0.025);

  // Smile
  noFill();
  if (mouseIsPressed) {
    arc(s / 2, s * 0.65, s * 0.15, s * 0.15, 0.1 * PI, 0.9 * PI);
  } else {
    arc(s / 2, s * 0.7, s * 0.15, s * 0.15, PI, 2 * PI);
  }

  // Ears
  fill(247, 201, 74);
  rect(s * 0.05, s * 0.3, s * 0.05, s / 3);
  rect(s * 0.9, s * 0.3, s * 0.05, s / 3);

  // Antennae
  strokeWeight(5);
  line(s / 2, s * 0.1, s * 0.45, s * 0.05);
  line(s / 2, s * 0.1, s * 0.55, s * 0.05);
  circle(s * 0.45, s * 0.05, 10);
  circle(s * 0.55, s * 0.05, 10);
  pop();
}
