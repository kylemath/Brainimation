/**
 * @id eegeduColourBalls
 * @title 500 Quadrant Colour Balls (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 5
 *
 * Original ColourBalls.p5 sketch by Kyle Mathewson.
 * 500 bouncing circles with quadrant-based color and size driven by multi-electrode Delta and Alpha.
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
    let overlap = 150;
    let d1 = eegData.getChannelBand('delta', 1) * 255;
    let d2 = eegData.getChannelBand('delta', 2) * 255;
    let a1 = eegData.getChannelBand('alpha', 1) * 40;
    let a3 = eegData.getChannelBand('alpha', 3) * 40;

    if (this.x + random(-overlap, overlap) > width / 2) {
      if (this.y + random(-overlap, overlap) > height / 2) {
        fill(random(255), d1, d2);
        circle(this.x, this.y, a3 / 2 + random(10));
      } else {
        let yel = random(255);
        fill(yel, yel, d1);
        circle(this.x, this.y, a3 + random(10));
      }
    } else {
      if (this.y + random(-overlap, overlap) > height / 2) {
        fill(d1, d2, random(255));
        circle(this.x, this.y, a3 / 2 + random(10));
      } else {
        fill(d1, random(255), d2);
        circle(this.x, this.y, a1 + random(10));
      }
    }
  }
}

function setup() {
  colorMode(RGB, 255);
  frameRate(10);
  circles = [];
  for (let i = 0; i < 500; i++) {
    circles[i] = new Circle(random(width), random(height), random(-3, 3), random(-3, 3));
  }
}

function draw() {
  background(0);
  for (let i = 0; i < circles.length; i++) {
    circles[i].move();
    circles[i].display();
  }
}
