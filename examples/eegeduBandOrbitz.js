/**
 * @id eegeduBandOrbitz
 * @title Band Orbitz Physics (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 8
 *
 * Original bandOrbitz.p5 sketch by Kyle Mathewson.
 * Gravitational orbital physics simulation where each frequency band label orbits the center.
 */
let movers = [];

class Mover {
  constructor(x, y, bandName, label, col) {
    this.pos = createVector(x, y);
    this.bandName = bandName;
    this.lab = label;
    this.col = col;
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.vel.mult(random(1, 3));
  }

  update() {
    let center = createVector(width / 2, height / 2);
    let acc = p5.Vector.sub(center, this.pos);
    let bandPower = eegData.getChannelBand(this.bandName, 1);
    acc.setMag(0.15 + bandPower * 1.2);
    this.vel.add(acc);
    this.vel.limit(8);
    this.pos.add(this.vel);
  }

  show() {
    fill(255);
    noStroke();
    ellipse(width / 2, height / 2, 12);
    textSize(22);
    fill(this.col);
    text(this.lab, this.pos.x, this.pos.y);
  }
}

function setup() {
  colorMode(RGB, 255);
  movers = [
    new Mover(width * 0.25, height * 0.25, 'delta', 'delta', '#ff6b9d'),
    new Mover(width * 0.75, height * 0.25, 'theta', 'theta', '#ffd166'),
    new Mover(width * 0.25, height * 0.75, 'alpha', 'alpha', '#4ecdc4'),
    new Mover(width * 0.75, height * 0.75, 'beta',  'beta',  '#a78bfa'),
    new Mover(width * 0.50, height * 0.20, 'gamma', 'gamma', '#6cff83')
  ];
}

function draw() {
  background(0, 40);
  for (let i = 0; i < movers.length; i++) {
    movers[i].update();
    movers[i].show();
  }
}
