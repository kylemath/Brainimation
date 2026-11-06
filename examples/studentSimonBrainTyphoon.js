/**
 * @id studentSimonBrainTyphoon
 * @title Brain Typhoon (Kyle Simon)
 * @category 2022 NeuroArt Class Gallery
 * @order 23
 *
 * Student NeuroArt Project by Kyle Simon.
 * Stormy highway scene where Alpha waves darken the sky, whip the rain, and push the red truck against the wind!
 */
let skyDarkening = 0;
let alphaVal = 0;
let Truck = [];
let Rain = [];
let Clouds = [];

function setup() {
  colorMode(RGB, 255);
  rectMode(RADIUS);
  skyDarkening = 0;

  Truck = [new truck()];
  Rain = [];
  for (let i = 0; i < 400; i++) {
    Rain[i] = new rainDrop();
  }
  Clouds = [];
  for (let i = 0; i < 120; i++) {
    Clouds[i] = new cloud();
  }
}

function truck() {
  this.x = width;
  this.y = height * 0.63;

  this.display = function () {
    this.y = height * 0.63;
    fill(220 - skyDarkening / 2, 0, 0);
    triangle(this.x - 8, this.y - 24, this.x - 17, this.y - 8, this.x - 8, this.y - 8);
    rect(this.x + 1, this.y - 12, 9, 12);
    fill(180 - skyDarkening / 2, 180 - skyDarkening / 2, 240 - skyDarkening / 2);
    triangle(this.x - 6.5, this.y - 20, this.x - 13, this.y - 8, this.x - 6.5, this.y - 8);
    rect(this.x, this.y - 12, 7, 7);
    fill(220 - skyDarkening / 2, 0, 0);
    rect(this.x, this.y, 35, 8);
    fill(20 - skyDarkening / 2);
    circle(this.x + 17, this.y + 8, 7);
    fill(180 - skyDarkening / 2);
    circle(this.x + 17, this.y + 8, 5);
    fill(20 - skyDarkening / 2);
    circle(this.x - 19, this.y + 8, 7);
    fill(180 - skyDarkening / 2);
    circle(this.x - 19, this.y + 8, 5);
  };

  this.move = function () {
    if (this.x >= width) {
      this.x = this.x - 2;
    } else {
      this.x = this.x - 2 + alphaVal / 15;
    }
    if (this.x < 0) {
      this.x = width;
    }
  };
}

function rainDrop() {
  this.x = random(-width, width);
  this.y = random(-height, 0);

  this.display = function () {
    let rainSize = 2;
    fill(100, 100, 200);
    ellipse(this.x, this.y, 4, rainSize * 3);
    fill(200, 200, 230);
    ellipse(this.x, this.y, 3, rainSize * 2);
  };

  this.move = function () {
    this.y = (this.y + random(4, 10)) * 1.01;
    this.x = this.x + random(2, 5) + alphaVal / 10;

    if (this.y > height) {
      this.y = 0;
      this.x = random(-width / 2, width);
    }
    if (this.x > width) {
      this.x = -width / 2;
    }
  };
}

function cloud() {
  this.x = random(-width, width);
  this.y = random(-30, 30);
  this.cloudSize = random(100, 200);

  this.display = function () {
    fill(220 - skyDarkening, 220 - skyDarkening, 220 - skyDarkening, 50);
    ellipse(this.x, this.y, this.cloudSize, this.cloudSize);
  };

  this.move = function () {
    this.x = this.x + alphaVal / 20;
    if (this.x > width) {
      this.x = -width / 2;
    }
  };
}

function draw() {
  noStroke();
  rectMode(RADIUS);

  alphaVal = eegData.getChannelBand('alpha', 0) * 120;
  skyDarkening = alphaVal;

  for (let i = 0; i <= 15; i++) {
    let gradSky = i * i;
    fill(180 - skyDarkening - gradSky / 6, 180 - skyDarkening - gradSky / 6, 255 - skyDarkening);
    rect(width / 2, height, width, height * (1 - (i * 5) / 130));
  }

  for (let i = 1; i <= 25; i++) {
    let gradLeft = i * i;
    fill(0, 180 - gradLeft / 8 - skyDarkening / 2, 0);
    rect(width / 2, height, width, height / 2 - gradLeft * 0.4);
  }

  for (let i = 1; i <= 10; i++) {
    let gradRoad = i;
    fill(160 - gradRoad * 5 - skyDarkening / 2);
    rect(width / 2, (height * 6.8) / 10 + (height / 100) * gradRoad, width, height / 10 - (height / 100) * gradRoad);
  }

  for (let i = 1; i <= 26; i++) {
    fill(220 - skyDarkening / 2, 210 - skyDarkening / 2, 100 - skyDarkening / 2, 175);
    rect(-width / 28 + i * (width / 28), height * (61.5 / 90), width / 100, height / 400);
  }

  for (let i = 0; i < Truck.length; i++) {
    Truck[i].display();
    Truck[i].move();
  }
  for (let i = 0; i < Rain.length; i++) {
    Rain[i].display();
    Rain[i].move();
  }
  for (let i = 0; i < Clouds.length; i++) {
    Clouds[i].display();
    Clouds[i].move();
  }
}
