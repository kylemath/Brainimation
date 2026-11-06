/**
 * @id eegeduFlock2D
 * @title Boids 2D Flock (EEGEdu)
 * @category EEGEdu Modules
 * @order 1
 *
 * Original EEGEdu Animate module sketch (sketchFlock.js).
 * Craig Reynolds 2D Boids flocking simulation (separation, alignment, cohesion)
 * where the flock's red target attractor is steered by Alpha (X) and Beta (Y) power.
 * Drag the mouse to spawn additional boids.
 */
let xVar = 0;
let yVar = 0;
let flock;

function setup() {
  createCanvas(width, height);
  flock = new Flock();
  xVar = width / 2;
  yVar = height / 2;

  for (let i = 0; i < 150; i++) {
    let b = new Boid(
      width / 2 + random(-width * 0.3, width * 0.3),
      height / 2 + random(-height * 0.3, height * 0.3)
    );
    flock.addBoid(b);
  }
}

function draw() {
  let alphaVal = eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha;
  let betaVal  = eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta;

  xVar = constrain(Math.floor(alphaVal * width), 5, width - 5);
  yVar = constrain(Math.floor(betaVal * height), 5, height - 5);

  background(255);
  fill(255, 0, 0);
  noStroke();
  push();
  translate(xVar, yVar);
  ellipse(0, 0, 12, 12);
  pop();

  flock.run();
}

function mouseDragged() {
  if (flock) {
    flock.addBoid(new Boid(mouseX, mouseY));
  }
}

function Flock() {
  this.boids = [];
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
};

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
};

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 2.5;
  this.maxspeed = 5;
  this.maxforce = 0.1;
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};

Boid.prototype.applyForce = function(force) {
  this.acceleration.add(force);
};

Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);
  let mows = this.mouuse(boids);

  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  mows.mult(3.0);

  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(mows);
};

Boid.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
};

Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
};

Boid.prototype.render = function() {
  let theta = this.velocity.heading() + radians(90);
  fill(0);
  noStroke();
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
};

Boid.prototype.borders = function() {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
};

Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < desiredseparation) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steer.div(count);
  }
  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
};

Boid.prototype.align = function(boids) {
  let neighbordist = 100;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Boid.prototype.cohesion = function(boids) {
  let neighbordist = 100;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
};

Boid.prototype.mouuse = function(boids) {
  let neighbordist = 500;
  let m = createVector(xVar, yVar);
  let d = p5.Vector.dist(this.position, m);
  if (d > 0 && d < neighbordist) {
    return this.seek(m);
  } else {
    return createVector(0, 0);
  }
};
