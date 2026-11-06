/**
 * @id eegeduMultipleBalls
 * @title 100 Alpha Swarm Balls (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 6
 *
 * Original MultipleBalls.p5 sketch by Kyle Mathewson.
 * 100 bouncing circles whose size fluctuates with right-forehead (AF8) Alpha power.
 */
let circles = [];

class Circle {
  constructor(x, y, xSpeed, ySpeed) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
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

  display() {
    let alphaAF8 = eegData.getChannelBand('alpha', 2) * 50;
    fill(240);
    circle(this.x, this.y, alphaAF8 + random(10));
  }
}

function setup() {
  colorMode(RGB, 255);
  circles = [];
  for (let i = 0; i < 100; i++) {
    circles[i] = new Circle(random(width), random(height), random(-3, 3), random(-3, 3));
  }
}

function draw() {
  background(50);
  for (let i = 0; i < circles.length; i++) {
    circles[i].move();
    circles[i].display();
  }
}
