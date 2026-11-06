/**
 * @id studentHosseiniLostMyMind
 * @title Lost My Mind Wave Grid (Rastin Hosseini)
 * @category 2022 NeuroArt Class Gallery
 * @order 10
 *
 * Student NeuroArt Project by Rastin Hosseini.
 * Swirling grid of oscillators whose size responds to Alpha waves and angle responds to mouse position.
 */
let t = 0;

function setup() {
  colorMode(RGB, 255);
  background(250, random(50), 250);
  frameRate(30);
}

function draw() {
  let THETA = eegData.getChannelBand('theta', 3) * 4;
  let ALPHA = 1 + eegData.getChannelBand('alpha', 0) * 6;

  background(250, 30, 250, 25);
  fill(120, THETA * 60, 180);
  stroke(0, 60);

  let mx = mouseX || width / 2;
  let my = mouseY || height / 2;

  for (let x = ALPHA; x <= width; x = x + 30) {
    for (let y = 0; y <= height; y = y + 30) {
      const xAngle = map(mx, 0, width, -4 * (22 / 7), 4 * (22 / 7), true);
      const yAngle = map(my, 0, height, -4 * (22 / 7), 4 * (22 / 7), true);
      const angle = xAngle * (x / width) + yAngle * (y / height);

      const myX = x + 20 * cos(2 * (22 / 7) * t + angle);
      const myY = y + 20 * sin(2 * (22 / 7) * t + angle);

      ellipse(myX, myY, ALPHA * 4);
    }
  }
  t = t + 0.015;
}
