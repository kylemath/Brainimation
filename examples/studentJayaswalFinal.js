/**
 * @id studentJayaswalFinal
 * @title Gamma Bouncing Spheres (Aakanksha Jayaswal)
 * @category 2022 NeuroArt Class Gallery
 * @order 11
 *
 * Student NeuroArt Project by Aakanksha Jayaswal.
 * Five spheres bounce across a deep-blue canvas with speed and diameter driven by Alpha, Beta, and Gamma.
 */
let circles = [];

class Circle {
  constructor(x, y, xs, ys) {
    this.x = x;
    this.y = y;
    this.xs = xs;
    this.ys = ys;
  }

  move() {
    this.x += this.xs;
    if (this.x < 0 || this.x > width) {
      this.xs *= -1;
    }
    this.y += this.ys;
    if (this.y < 0 || this.y > height) {
      this.ys *= -1;
    }
  }

  display() {
    let gamma = 3 + eegData.getChannelBand('gamma', 0) * 18;
    let a1 = eegData.getChannelBand('alpha', 1) * 255;
    let b1 = eegData.getChannelBand('beta', 1) * 255;
    let g1 = eegData.getChannelBand('gamma', 1) * 255;
    fill(a1, b1, g1);
    circle(this.x, this.y, gamma * 5);
  }
}

function setup() {
  colorMode(RGB, 255);
  circles = [];
  for (let i = 0; i < 5; i++) {
    let vx = 2 + eegData.getChannelBand('alpha', 0) * 6;
    let vy = 2 + eegData.getChannelBand('beta', 0) * 6;
    circles[i] = new Circle(random(width), random(height), vx * (random() > 0.5 ? 1 : -1), vy * (random() > 0.5 ? 1 : -1));
  }
}

function draw() {
  background(10, 20, 40);
  for (let i = 0; i < circles.length; i++) {
    circles[i].move();
    circles[i].display();
  }
}
