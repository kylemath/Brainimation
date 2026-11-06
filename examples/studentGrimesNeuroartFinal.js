/**
 * @id studentGrimesNeuroartFinal
 * @title Interactive Alpha Bubbles (Kassaundra Grimes)
 * @category 2022 NeuroArt Class Gallery
 * @order 8
 *
 * Student NeuroArt Project by Kassaundra Grimes.
 * Bouncing bubbles shift color with Alpha waves and gather at the cursor when the mouse is pressed.
 */
let circles = [];

class Circle {
  constructor(x, y, xSpeed, ySpeed, size) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
  }

  move() {
    this.x += this.xSpeed;
    if (this.x < 0 || this.x > width) {
      this.xSpeed *= -1;
    }
    this.y += this.ySpeed;
    if (this.y < 0 || this.y > height) {
      this.ySpeed *= -1;
    }
  }

  reset() {
    if (mouseIsPressed) {
      this.x = mouseX;
      this.y = mouseY;
    }
  }

  display() {
    stroke(0);
    fill(eegData.getChannelBand('alpha', 0) * 255, 50, 100);
    circle(this.x, this.y, this.size);
  }
}

function setup() {
  colorMode(RGB, 255);
  circles = [];
  for (let i = 0; i < 10; i++) {
    circles[i] = new Circle(random(width), random(height), random(-3, 3), random(-3, 3), random(25, 100));
  }
}

function draw() {
  background('#fae');
  for (let i = 0; i < circles.length; i++) {
    circles[i].move();
    circles[i].display();
    circles[i].reset();
  }
}
