/**
 * @id studentKhamvongsaBikeRace
 * @title EEG Bike Race (Amanda Khamvongsa)
 * @category 2022 NeuroArt Class Gallery
 * @order 12
 *
 * Student NeuroArt Project by Amanda Khamvongsa.
 * Five bicycles race toward the checkered finish line powered by Delta, Theta, Alpha, Beta, and Gamma!
 */
let bikes = [];
let EEGNAMES = [
  'DELTA TEMPORAL LEFT',
  'THETA FRONTOPOLAR LEFT',
  'ALPHA FRONTOPOLAR RIGHT',
  'BETA TEMPORAL RIGHT',
  'GAMMA TEMPORAL LEFT'
];

class Bike {
  constructor(x, y, r, g, b, bandName, ch) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.bandName = bandName;
    this.ch = ch;
  }

  display() {
    noFill();
    strokeWeight(4);
    // Tires
    stroke(0);
    circle(this.x, this.y, 15);
    circle(this.x + 50, this.y, 15);
    // Body
    stroke(this.r, this.b, this.g);
    quad(this.x, this.y, this.x + 15, this.y - 25, this.x + 40, this.y - 25, this.x + 25, this.y);
    line(this.x + 50, this.y, this.x + 40, this.y - 40);
    line(this.x + 25, this.y, this.x + 12, this.y - 32);
    // Seat & handlebars
    stroke(158, 90, 60);
    strokeWeight(6);
    line(this.x + 8, this.y - 35, this.x + 17, this.y - 35);
    line(this.x + 40, this.y - 40, this.x + 41, this.y - 36);
    curve(this.x + 10, this.y - 50, this.x + 40, this.y - 40, this.x + 50, this.y - 30, this.x - 30, this.y + 20);
  }

  move() {
    let speed = 1 + eegData.getChannelBand(this.bandName, this.ch) * 10;
    this.x += speed;
    if (this.x > width) {
      this.x = 0;
    }
  }
}

function setup() {
  colorMode(RGB, 255);
  bikes = [];
  let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  let chs = [0, 1, 2, 3, 0];
  let colors = [
    [255, 90, 90],
    [255, 200, 70],
    [70, 220, 180],
    [120, 140, 255],
    [230, 100, 255]
  ];
  for (let i = 0; i < 5; i++) {
    let y = map(i, 0, 4, 80, height - 40);
    bikes.push(new Bike(20, y, colors[i][0], colors[i][1], colors[i][2], bands[i], chs[i]));
  }
}

function draw() {
  background(150);

  // Instructions
  noStroke();
  fill(227, 202, 235);
  textStyle(BOLD);
  textSize(14);
  text('Watch the brainwave bike race! (Hold mouse to turbo-boost)', 20, 25);

  // Checkered finish line
  strokeWeight(10);
  stroke(255);
  line(width - 100, 0, width - 100, height);
  noStroke();
  let squaresize = 20;
  for (let i = 0; i < height / squaresize; i++) {
    fill(i % 2 === 0 ? 255 : 0);
    square(width - 90, i * squaresize, squaresize);
    fill(i % 2 === 0 ? 0 : 255);
    square(width - 70, i * squaresize, squaresize);
  }

  // Lane labels & bikes
  for (let i = 0; i < EEGNAMES.length; i++) {
    let y = map(i, 0, 4, 80, height - 40);
    noStroke();
    fill(232, 250, 237, 160);
    textStyle(ITALIC);
    text(EEGNAMES[i], 15, y);

    bikes[i].display();
    bikes[i].move();
    if (mouseIsPressed) {
      bikes[i].move();
    }
  }
}
