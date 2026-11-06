#!/usr/bin/env python3
"""
Import:
1. All 12 interactive p5.js animations built into the EEGEdu modules (kylemath/EEGEdu),
   including 2D Boids Flock and 3D Boids Flock -> category "EEGEdu Modules".
2. All 14 BrainGames games in their current form -> category "BrainGames".
"""
import re
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
EXAMPLES_DIR = REPO_DIR / "examples"
GAMES_DIR = REPO_DIR / "games"
BRAINGAMES_TMP = Path("/tmp/inspect_eegedu_braingames/braingames")

EEGEDU_MODULE_SKETCHES = {
    "eegeduFlock2D.js": """/**
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
""",

    "eegeduFlock3D.js": """/**
 * @id eegeduFlock3D
 * @title Boids 3D Flock (EEGEdu)
 * @category EEGEdu Modules
 * @order 2
 *
 * Original EEGEdu Animate module sketch (sketchFlock3D.js).
 * 3D WEBGL Boids flocking simulation accelerated with a 3D Octree (QuadTree)
 * where the 3D attractor target is controlled by Theta (X), Alpha (Y), and Beta (Z).
 * Drag with mouse to orbit camera in 3D space.
 */
let flock = [];
let depth = 600;
let gap = 220;
let quadTree;
let useQuadTree = true;
let showPerceptionRadius = false;

let numBoids = 65;
let perceptionRadius = 110;
let alignmentWeight = 0.3;
let cohesionWeight = 0.4;
let separationWeight = 0.8;
let t = 0;

let xVar = 0;
let yVar = 0;
let zVar = 0;

function applyFlockCamera() {
  depth = height;
  let cameraX = (900 / 600) * width;
  let cameraY = (-700 / 600) * height;
  let cameraZ = (-180 / 500) * depth;
  camera(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 0, 1);
}

function setup() {
  createCanvas(width, height, WEBGL);
  flock = [];
  t = 0;
  applyFlockCamera();

  for (let i = 0; i < numBoids; i++) {
    pushRandomBoid();
  }
}

function windowResized() {
  applyFlockCamera();
}

function pushRandomBoid() {
  let pos = createVector(
    random(-width * 0.35, width * 0.35),
    random(-height * 0.35, height * 0.35),
    random(-depth * 0.25, depth * 0.25)
  );
  let vel = p5.Vector.random3D().mult(random(1.5, 4.5));
  flock.push(new Boid3D(pos, vel));
}

function draw() {
  let thetaVal = eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta;
  let alphaVal = eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha;
  let betaVal  = eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta;

  xVar = constrain((thetaVal - 0.5) * width, -width / 2, width / 2);
  yVar = constrain((alphaVal - 0.5) * height, -height / 2, height / 2);
  zVar = constrain((betaVal - 0.5) * depth, -depth / 2, depth / 2);

  background(200);
  orbitControl();

  directionalLight(150, 150, 150, 1, 1, 0);
  ambientLight(150);

  // Bounding flight box
  stroke(80);
  strokeWeight(4);
  noFill();
  box(width + gap / 2, height + gap / 2, depth + gap / 2);

  // Blue sphere at EEG 3D attractor target
  noStroke();
  fill(255);
  ambientMaterial(0, 60, 255);
  push();
  translate(xVar, yVar, zVar);
  sphere(10);
  pop();

  // Build spatial Octree (QuadTree)
  let boundary = new Cube3D(0, 0, 0, width + 2 * gap, height + 2 * gap, depth + 2 * gap);
  quadTree = new QuadTree3D(boundary, 4);
  for (let boid of flock) {
    quadTree.insert(boid);
  }

  for (let boid of flock) {
    boid.flock(flock, quadTree);
  }
  for (let boid of flock) {
    boid.update(gap);
    boid.show();
  }

  t++;
}

class Boid3D {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.acc = createVector(0, 0, 0);
    this.maxForce = 1;
    this.maxSpeed = 9;
    this.r = 255;
    this.g = floor(random(50, 120));
    this.b = floor(random(50, 120));
  }

  alignment(neighbors) {
    let steering = createVector();
    for (let other of neighbors) steering.add(other.vel);
    if (neighbors.length > 0) {
      steering.div(neighbors.length);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(neighbors) {
    let steering = createVector();
    for (let other of neighbors) steering.add(other.pos);
    if (neighbors.length > 0) {
      steering.div(neighbors.length);
      steering.sub(this.pos);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(neighbors) {
    let steering = createVector();
    for (let other of neighbors) {
      let diff = p5.Vector.sub(this.pos, other.pos);
      let d = max(other.distance, 0.01);
      steering.add(diff.div(d));
    }
    if (neighbors.length > 0) {
      steering.div(neighbors.length);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids, quadTree) {
    let force = createVector(xVar - this.pos.x, yVar - this.pos.y, zVar - this.pos.z);
    force.setMag(this.maxForce);
    this.acc.add(force);

    let radius = perceptionRadius;
    let neighbors = [];

    if (useQuadTree) {
      let range = new Cube3D(this.pos.x, this.pos.y, this.pos.z, radius, radius, radius);
      let maybeNeighbors = quadTree.query(range);
      for (let other of maybeNeighbors) {
        let distance = this.pos.dist(other.pos);
        if (other !== this && distance < radius) {
          other.distance = distance;
          neighbors.push(other);
        }
      }
    } else {
      for (let other of boids) {
        let distance = this.pos.dist(other.pos);
        if (other !== this && distance < radius) {
          other.distance = distance;
          neighbors.push(other);
        }
      }
    }

    let alignForce = this.alignment(neighbors);
    alignForce.mult(alignmentWeight);
    this.acc.add(alignForce);

    if (t > 2) {
      let cohForce = this.cohesion(neighbors);
      cohForce.mult(cohesionWeight);
      this.acc.add(cohForce);
    }

    let sepForce = this.separation(neighbors);
    sepForce.mult(separationWeight);
    this.acc.add(sepForce);

    if (this.pos.z < -depth / 8 || this.pos.z > depth / 8) {
      let zForce = createVector(0, 0, (-this.pos.z / depth) * this.maxForce * 2);
      this.acc.add(zForce);
    }

    if (neighbors.length === 0) {
      let wander = p5.Vector.random3D().mult(this.maxForce / 4);
      wander.z = 0;
      this.acc.add(wander);
    }
  }

  update(gap) {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.mult(0.999);
    this.vel.limit(this.maxSpeed);
    this.acc.mult(0);

    if (this.pos.x > width / 2 + gap) this.pos.x -= width + 1.7 * gap;
    if (this.pos.x < -(width / 2 + gap)) this.pos.x += width + 1.7 * gap;
    if (this.pos.y > height / 2 + gap) this.pos.y -= height + 1.7 * gap;
    if (this.pos.y < -(height / 2 + gap)) this.pos.y += height + 1.7 * gap;
  }

  show() {
    noStroke();
    fill(255);
    ambientMaterial(this.r, this.g, this.b);

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(10);
    let arrow = createVector(this.vel.x, this.vel.y, this.vel.z).setMag(10);
    translate(arrow.x, arrow.y, arrow.z);
    sphere(5);
    pop();
  }
}

class Cube3D {
  constructor(x, y, z, w, h, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
    this.xMin = x - w;
    this.xMax = x + w;
    this.yMin = y - h;
    this.yMax = y + h;
    this.zMin = z - d;
    this.zMax = z + d;
  }

  contains(boid) {
    let pos = boid.pos;
    return (
      pos.x >= this.xMin && pos.x <= this.xMax &&
      pos.y >= this.yMin && pos.y <= this.yMax &&
      pos.z >= this.zMin && pos.z <= this.zMax
    );
  }

  intersects(range) {
    return !(
      this.xMax < range.xMin || this.xMin > range.xMax ||
      this.yMax < range.yMin || this.yMin > range.yMax ||
      this.zMax < range.zMin || this.zMin > range.zMax
    );
  }
}

class QuadTree3D {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.boids = [];
    this.divided = false;
  }

  insert(boid) {
    if (!this.boundary.contains(boid)) return false;
    if (this.boids.length < this.capacity) {
      this.boids.push(boid);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.NWT.insert(boid) ||
      this.NET.insert(boid) ||
      this.SET.insert(boid) ||
      this.SWT.insert(boid) ||
      this.NWB.insert(boid) ||
      this.NEB.insert(boid) ||
      this.SEB.insert(boid) ||
      this.SWB.insert(boid)
    );
  }

  subdivide() {
    this.divided = true;
    let x = this.boundary.x;
    let y = this.boundary.y;
    let z = this.boundary.z;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;
    let d = this.boundary.d / 2;

    this.NWT = new QuadTree3D(new Cube3D(x - w, y - h, z - d, w, h, d), this.capacity);
    this.NET = new QuadTree3D(new Cube3D(x + w, y - h, z - d, w, h, d), this.capacity);
    this.SET = new QuadTree3D(new Cube3D(x + w, y + h, z - d, w, h, d), this.capacity);
    this.SWT = new QuadTree3D(new Cube3D(x - w, y + h, z - d, w, h, d), this.capacity);
    this.NWB = new QuadTree3D(new Cube3D(x - w, y - h, z + d, w, h, d), this.capacity);
    this.NEB = new QuadTree3D(new Cube3D(x + w, y - h, z + d, w, h, d), this.capacity);
    this.SEB = new QuadTree3D(new Cube3D(x + w, y + h, z + d, w, h, d), this.capacity);
    this.SWB = new QuadTree3D(new Cube3D(x - w, y + h, z + d, w, h, d), this.capacity);
  }

  query(range, found) {
    if (!found) found = [];
    if (!this.boundary.intersects(range)) return found;
    for (let boid of this.boids) {
      if (range.contains(boid)) found.push(boid);
    }
    if (this.divided) {
      this.NWT.query(range, found);
      this.NET.query(range, found);
      this.SET.query(range, found);
      this.SWT.query(range, found);
      this.NWB.query(range, found);
      this.NEB.query(range, found);
      this.SEB.query(range, found);
      this.SWB.query(range, found);
    }
    return found;
  }
}
""",

    "eegeduBands3D.js": """/**
 * @id eegeduBands3D
 * @title 3D Frequency Band Boxes (EEGEdu)
 * @category EEGEdu Modules
 * @order 3
 *
 * Original EEGEdu Animate module sketch (sketchBands.js).
 * Five 3D WEBGL boxes representing Delta, Theta, Alpha, Beta, and Gamma power,
 * illuminated by a mouse-guided point light.
 */
function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let delta = (eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 28;
  let theta = (eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta) * 28;
  let alpha = (eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 28;
  let beta  = (eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta)  * 28;
  let gamma = (eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma) * 28;

  let unit = width / 5;

  background(245);
  ambientMaterial(250);
  noStroke();

  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  ambientLight(80, 80, 80);
  pointLight(255, 255, 255, locX, locY, 200);

  push();
  fill(255, 0, 0);
  translate(-unit, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, delta * 10), unit);
  pop();

  push();
  fill(0, 255, 0);
  translate(-unit / 2, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, theta * 10), unit);
  pop();

  push();
  fill(0, 0, 255);
  translate(0, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, alpha * 10), unit);
  pop();

  push();
  fill(0, 128, 128);
  translate(unit / 2, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, beta * 10), unit);
  pop();

  push();
  fill(128, 0, 128);
  translate(unit, 0, 0);
  rotateY(50);
  rotateX(50);
  box(unit / 2, max(12, gamma * 10), unit);
  pop();
}
""",

    "eegeduAlphaCube.js": """/**
 * @id eegeduAlphaCube
 * @title Alpha 3D Cube (EEGEdu)
 * @category EEGEdu Modules
 * @order 4
 *
 * Original EEGEdu Animate module sketch (sketchCube.js).
 * Control a 3D normal-material cube's Y-rotation with Alpha power and size with Delta power.
 */
let rotation = 0;

function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let delta = (eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 28;
  let alpha = (eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 180;

  rotation = (alpha * Math.PI) / 180;

  background(250);
  normalMaterial();
  noStroke();
  push();
  rotateX(25 + frameCount / 10);
  rotateY(rotation);
  box(max(30, delta * 10));
  pop();
}
""",

    "eegeduAlphaBetaDraw.js": """/**
 * @id eegeduAlphaBetaDraw
 * @title Alpha & Beta Paint Brush (EEGEdu)
 * @category EEGEdu Modules
 * @order 5
 *
 * Original EEGEdu Animate module sketch (sketchDraw.js).
 * Draw a continuous generative painting where Alpha controls X position, Beta controls Y position,
 * and Theta/Delta/Gamma control RGB color. Click canvas to clear.
 */
let brushWidth = 50;

function setup() {
  createCanvas(width, height);
  background(255);
}

function mousePressed() {
  background(255);
}

function draw() {
  let deltaVal = eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta;
  let thetaVal = eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta;
  let alphaVal = eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha;
  let betaVal  = eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta;
  let gammaVal = eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma;

  let delta = constrain(Math.floor(deltaVal * 255), 0, 255);
  let theta = constrain(Math.floor(thetaVal * 255), 0, 255);
  let gamma = constrain(Math.floor(gammaVal * 255), 0, 255);

  let xVar = constrain(Math.floor(alphaVal * width), brushWidth / 2, width - brushWidth / 2);
  let yVar = constrain(Math.floor(betaVal * height), brushWidth / 2, height - brushWidth / 2);

  fill(theta, delta, gamma, 28);
  noStroke();
  ellipse(xVar, yVar, brushWidth, brushWidth);
}
""",

    "eegeduBandTone.js": """/**
 * @id eegeduBandTone
 * @title Frequency Band Synth & FFT (EEGEdu)
 * @category EEGEdu Modules
 * @order 6
 *
 * Original EEGEdu Animate module sketch (sketchTone.js).
 * Plays a 4-note MIDI sequence driven by Delta, Theta, Beta, and Gamma power,
 * stepped at a tempo controlled by Alpha power, with live p5.FFT spectrum bars.
 */
let osc, envelope, fft;
let scaleArray = [40, 58, 68, 82];
let note = 0;

function setup() {
  createCanvas(width, height);
  osc = new p5.SinOsc();
  envelope = new p5.Env();
  envelope.setADSR(0.001, 0.5, 0.1, 0.5);
  envelope.setRange(0.4, 0);
  osc.start();
  fft = new p5.FFT();
  noStroke();
}

function draw() {
  let delta = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta) * 20);
  let theta = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta) * 20);
  let alpha = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha) * 25);
  let beta  = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta)  * 20);
  let gamma = Math.floor((eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma) * 3);

  scaleArray = [delta + 35, theta + 50, beta + 60, gamma * 6 + 70];

  background(20);

  let step = max(6, 30 - alpha);
  if (frameCount % step === 0 || frameCount === 1) {
    let midiValue = scaleArray[note];
    let freqValue = midiToFreq(midiValue);
    osc.freq(freqValue);
    envelope.play(osc, 0, 0.1);
    note = (note + 1) % scaleArray.length;
  }

  let spectrum = fft.analyze();
  let nBars = Math.floor(spectrum.length / 20);
  for (let i = 0; i < nBars; i++) {
    fill(spectrum[i], spectrum[i] / 4, 40);
    let x = map(i, 0, nBars, 0, width);
    let h = map(spectrum[i], 0, 255, 0, height * 0.85);
    rect(x, height, width / nBars + 1, -h);
  }
}
""",

    "eegeduSpectrogram.js": """/**
 * @id eegeduSpectrogram
 * @title Scrolling Waterfall Spectrogram (EEGEdu)
 * @category EEGEdu Modules
 * @order 7
 *
 * Original EEGEdu Spectrogram & Spectra module sketch (sketchSpectro.js + EEGEduSpectra.js).
 * Shifts the canvas left each frame and paints the current PSD spectrum column on the right edge.
 * Automatically records 10s of 1–30 Hz PSD spectra across all electrodes and downloads
 * Spectra_Recording_<timestamp>.csv when complete (or click Save Now / press S anytime).
 */
let speed = 4;
let secondsToSave = 10;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initSpectraHeader() {
  csvRows = [];
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let header = ['Timestamp (ms)']
    .concat(freqs.map(f => `ch0_${f}Hz`))
    .concat(freqs.map(f => `ch1_${f}Hz`))
    .concat(freqs.map(f => `ch2_${f}Hz`))
    .concat(freqs.map(f => `ch3_${f}Hz`))
    .concat(freqs.map(f => `chAux_${f}Hz`))
    .concat(freqs.map(f => `f_${f}Hz`))
    .concat(['info']);
  csvRows.push(header.join(','));
}

function logSpectraEpoch() {
  let ch0 = eegData.getSpectrum ? eegData.getSpectrum(0).slice(0, 30) : new Array(30).fill(0);
  let ch1 = eegData.getSpectrum ? eegData.getSpectrum(1).slice(0, 30) : new Array(30).fill(0);
  let ch2 = eegData.getSpectrum ? eegData.getSpectrum(2).slice(0, 30) : new Array(30).fill(0);
  let ch3 = eegData.getSpectrum ? eegData.getSpectrum(3).slice(0, 30) : new Array(30).fill(0);
  let chAux = new Array(30).fill(0);
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let row = [Date.now()]
    .concat(ch0.map(v => v.toFixed(4)))
    .concat(ch1.map(v => v.toFixed(4)))
    .concat(ch2.map(v => v.toFixed(4)))
    .concat(ch3.map(v => v.toFixed(4)))
    .concat(chAux)
    .concat(freqs)
    .concat(['256Hz']);
  csvRows.push(row.join(','));
}

function saveSpectraCSV() {
  if (csvRows.length <= 1) logSpectraEpoch();
  isRecording = false;
  let fname = `Spectra_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\\n') + '\\n', fname)
    : fname;
}

function restartSpectraRecording() {
  initSpectraHeader();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  noStroke();
  colorMode(RGB);
  background(15, 15, 25);
  restartSpectraRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveSpectraCSV();
  } else if (key === 'r' || key === 'R') {
    restartSpectraRecording();
  }
}

function mousePressed() {
  if (mouseY < 46) {
    if (mouseX > width - 220 && mouseX < width - 115) {
      saveSpectraCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartSpectraRecording();
    }
  }
}

function draw() {
  let psd = eegData.getSpectrum ? eegData.getSpectrum(1) : [];
  let binCount = psd.length;

  // Shift existing waterfall area (below top HUD bar) left by `speed` pixels
  copy(0, 48, width, height - 48, -speed, 48, width, height - 48);

  if (binCount > 0) {
    let wfHeight = height - 48;
    for (let i = 0; i < binCount; i++) {
      let value = psd[i] || 0;
      let c = constrain((value / 25) * 255, 0, 255);
      fill(c, c * 0.85 + 20, min(255, c * 1.2 + 40));
      let percent = i / binCount;
      let y = percent * wfHeight;
      rect(width - speed, height - y, speed, Math.ceil(wfHeight / binCount) + 1);
    }
  }

  let now = millis();
  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logSpectraEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveSpectraCSV();
    }
  }

  // Top Recording & CSV Download HUD
  fill(14, 14, 22, 240);
  rect(0, 0, width, 46);
  let elapsedSec = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(elapsedSec / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 23, 10, 10);

  fill(240);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC Spectra CSV: ${(secondsToSave - elapsedSec).toFixed(1)}s left (${csvRows.length - 1} epochs)`
    : `Saved ${savedFileName} (${csvRows.length - 1} epochs)`;
  text(statusTxt, 30, 16);

  // Progress bar
  fill(40, 42, 58);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  // Action buttons
  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text('💾 Save CSV (S)', width - 170, 23);

  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);
}
""",

    "eegeduEvokedOddball.js": """/**
 * @id eegeduEvokedOddball
 * @title Visual Oddball ERP Stimulus + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 8
 *
 * Original EEGEdu Evoked Potentials (ERP) module (sketchEvoked.js + EEGEduEvoked.js).
 * Flashes Standard (blue, 75%, Marker=10) and Target (red, 25%, Marker=20) visual stimuli
 * at random 500–1500 ms intervals around a central fixation cross, while recording
 * timestamped 4-channel EEG + stimulus/response/touch markers to CSV.
 * Automatically downloads Evoked_Recording_<timestamp>.csv when the countdown finishes,
 * or press S / click Save CSV anytime to download immediately!
 */
let targProp = 0.25;
let isTarget = false;
let elapsedTime = 0;
let nextDelay = 1000;
let newOnset = true;
let startTime = 0;
let targCount = 0;
let targetHits = 0;
let flashHoldMs = 180;
let lastResponseKey = '';

let secondsToSave = 60;
let isRecording = true;
let recordStartMs = 0;
let csvRows = [];
let savedFileName = '';

function initEvokedCSV() {
  csvRows = [];
  csvRows.push(
    'Timestamp (ms),Marker,SpaceBar,TouchMarker,ch0_4ms,ch1_4ms,ch2_4ms,ch3_4ms,chAux_4ms,info'
  );
  window.marker = 0;
  window.responseMarker = 0;
  window.touchMarker = 0;
}

function logEvokedSample() {
  let ch0 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[0] : (eegData.getRawChannel('TP9', 1)[0] || 0);
  let ch1 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[1] : (eegData.getRawChannel('AF7', 1)[0] || 0);
  let ch2 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[2] : (eegData.getRawChannel('AF8', 1)[0] || 0);
  let ch3 = eegData.raw && eegData.raw.length >= 4 ? eegData.raw[3] : (eegData.getRawChannel('TP10', 1)[0] || 0);
  let chAux = eegData.aux || 0;

  let m = window.marker || 0;
  let r = window.responseMarker || 0;
  let tm = window.touchMarker || 0;

  csvRows.push(
    `${Date.now()},${m},${r},${tm},${ch0.toFixed(3)},${ch1.toFixed(3)},${ch2.toFixed(3)},${ch3.toFixed(3)},${chAux.toFixed(3)},256Hz`
  );

  // Reset impulse markers after logging sample (exact EEGEduEvoked.js behavior)
  window.marker = 0;
  window.responseMarker = 0;
  window.touchMarker = 0;
}

function saveEvokedCSV() {
  if (csvRows.length <= 1) logEvokedSample();
  isRecording = false;
  let fname = `Evoked_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\\n') + '\\n', fname)
    : fname;
}

function restartEvokedRecording() {
  initEvokedCSV();
  recordStartMs = millis();
  targCount = 0;
  targetHits = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  noStroke();
  textAlign(CENTER, CENTER);
  startTime = millis();
  restartEvokedRecording();
}

function touchStarted() {
  if (mouseY < 48) return;
  window.touchMarker = 255;
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 310 && mouseX < width - 225) {
      secondsToSave = secondsToSave === 60 ? 15 : secondsToSave === 15 ? 30 : 60;
      restartEvokedRecording();
    } else if (mouseX >= width - 220 && mouseX < width - 115) {
      saveEvokedCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartEvokedRecording();
    }
    return;
  }
  window.touchMarker = 255;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveEvokedCSV();
    return;
  }
  if (key === 'r' || key === 'R') {
    restartEvokedRecording();
    return;
  }
  window.responseMarker = keyCode;
  lastResponseKey = key === ' ' ? 'SPACE' : key;
}

function draw() {
  background(255);
  let now = millis();
  elapsedTime = now - startTime;

  if (elapsedTime > nextDelay) {
    newOnset = true;
  } else {
    newOnset = false;
  }

  if (newOnset) {
    targCount++;
    nextDelay = 500 + int(random() * 1000);
    startTime = now;
    elapsedTime = 0;
    isTarget = random() < targProp;

    if (isTarget) {
      targetHits++;
      window.marker = 20;
      if (typeof eegData.triggerERP === 'function') eegData.triggerERP('target');
    } else {
      window.marker = 10;
      if (typeof eegData.triggerERP === 'function') eegData.triggerERP('standard');
    }
  }

  if (isRecording) {
    logEvokedSample();
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveEvokedCSV();
    }
  }

  let diameter = min(width, height - 80) * 0.62;
  if (elapsedTime < flashHoldMs) {
    if (isTarget) {
      fill(250, 150, 150);
    } else {
      fill(150, 150, 250);
    }
  } else {
    fill(245, 245, 248);
  }

  ellipse(width / 2, height / 2 + 12, diameter, diameter);

  fill(255, 0, 0);
  textSize(28);
  text('+', width / 2, height / 2 + 12);

  // Top Recording & CSV Download HUD
  fill(24, 24, 34);
  rect(0, 0, width, 46);
  let recElapsed = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(recElapsed / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 17, 10, 10);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC Evoked CSV: ${(secondsToSave - recElapsed).toFixed(1)}s left  (${csvRows.length - 1} rows)`
    : `Downloaded: ${savedFileName} (${csvRows.length - 1} rows)`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  // Duration toggle button (15s / 30s / 60s)
  fill(55, 60, 82);
  rect(width - 308, 9, 80, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(`⏱ ${secondsToSave}s`, width - 268, 23);

  // Save CSV button
  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  text('💾 Save CSV (S)', width - 170, 23);

  // Restart button
  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);

  // Bottom trial info bar
  fill(40);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(
    `Trial #${targCount} (Targets: ${targetHits})  |  ${isTarget ? 'TARGET (Red, Marker=20)' : 'STANDARD (Blue, Marker=10)'}  |  Press SPACE on Red Target`,
    width / 2,
    height - 22
  );
}
""",

    "eegeduSsvepSlow.js": """/**
 * @id eegeduSsvepSlow
 * @title SSVEP Slow Flicker 4 Hz + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 9
 *
 * Original EEGEdu SSVEP module (sketchFlashSlow.js + EEGEduSsvep.js).
 * Flashes a high-contrast target disc at 4 Hz around a red central fixation cross
 * to elicit a 4 Hz Steady-State Visually Evoked Potential in visual cortex, while
 * recording 10 seconds of 1–30 Hz PSD spectra across all electrodes and automatically
 * downloading Ssvep_Slow_Frequency_Recording_<timestamp>.csv on completion!
 */
const freq = 4;
const delay = 1000 / freq;
let startTime = 0;

let secondsToSave = 10;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initSsvepCSV() {
  csvRows = [];
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let header = ['Timestamp (ms)']
    .concat(freqs.map(f => `ch0_${f}Hz`))
    .concat(freqs.map(f => `ch1_${f}Hz`))
    .concat(freqs.map(f => `ch2_${f}Hz`))
    .concat(freqs.map(f => `ch3_${f}Hz`))
    .concat(freqs.map(f => `chAux_${f}Hz`))
    .concat(freqs.map(f => `f_${f}Hz`))
    .concat(['info']);
  csvRows.push(header.join(','));
}

function logSsvepEpoch() {
  let ch0 = eegData.getSpectrum ? eegData.getSpectrum(0).slice(0, 30) : new Array(30).fill(0);
  let ch1 = eegData.getSpectrum ? eegData.getSpectrum(1).slice(0, 30) : new Array(30).fill(0);
  let ch2 = eegData.getSpectrum ? eegData.getSpectrum(2).slice(0, 30) : new Array(30).fill(0);
  let ch3 = eegData.getSpectrum ? eegData.getSpectrum(3).slice(0, 30) : new Array(30).fill(0);
  let chAux = new Array(30).fill(0);
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let row = [Date.now()]
    .concat(ch0.map(v => v.toFixed(4)))
    .concat(ch1.map(v => v.toFixed(4)))
    .concat(ch2.map(v => v.toFixed(4)))
    .concat(ch3.map(v => v.toFixed(4)))
    .concat(chAux)
    .concat(freqs)
    .concat(['4Hz_Slow']);
  csvRows.push(row.join(','));
}

function saveSsvepCSV() {
  if (csvRows.length <= 1) logSsvepEpoch();
  isRecording = false;
  let fname = `Ssvep_Slow_Frequency_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\\n') + '\\n', fname)
    : fname;
}

function restartSsvepRecording() {
  initSsvepCSV();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  textAlign(CENTER, CENTER);
  startTime = millis();
  restartSsvepRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveSsvepCSV();
  if (key === 'r' || key === 'R') restartSsvepRecording();
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 220 && mouseX < width - 115) {
      saveSsvepCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartSsvepRecording();
    }
  }
}

function draw() {
  background(255);
  let now = millis();
  let newOnset = false;

  if (now - startTime >= delay) {
    newOnset = true;
    startTime = startTime === 0 ? now : startTime + delay;
    if (now - startTime > delay * 2) startTime = now;
  }

  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logSsvepEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveSsvepCSV();
    }
  }

  let phaseOn = (now - startTime) < delay * 0.5;
  if (newOnset || phaseOn) {
    fill(0, 0, 0);
  } else {
    fill(240, 240, 240);
  }

  noStroke();
  let d = min(width, height - 80) * 0.65;
  ellipse(width / 2, height / 2 + 12, d, d);

  fill(255, 0, 0);
  textSize(28);
  text('+', width / 2, height / 2 + 12);

  // Top Recording & CSV Download HUD
  fill(24, 24, 34);
  rect(0, 0, width, 46);
  let recElapsed = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(recElapsed / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 17, 10, 10);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC 4 Hz SSVEP CSV: ${(secondsToSave - recElapsed).toFixed(1)}s left  (${csvRows.length - 1} epochs)`
    : `Downloaded: ${savedFileName} (${csvRows.length - 1} epochs)`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text('💾 Save CSV (S)', width - 170, 23);

  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);

  fill(40);
  textSize(13);
  text('SSVEP Slow Flicker — 4 Hz (Fixate on red + for 10s to auto-download CSV)', width / 2, height - 22);
}
""",

    "eegeduSsvepFast.js": """/**
 * @id eegeduSsvepFast
 * @title SSVEP Fast Flicker 11 Hz + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 10
 *
 * Original EEGEdu SSVEP module (sketchFlashFast.js + EEGEduSsvep.js).
 * Flashes a high-contrast target disc at 11 Hz around a red central fixation cross
 * to elicit an 11 Hz Steady-State Visually Evoked Potential in visual cortex, while
 * recording 10 seconds of 1–30 Hz PSD spectra across all electrodes and automatically
 * downloading Ssvep_Fast_Frequency_Recording_<timestamp>.csv on completion!
 */
const freq = 11;
const delay = 1000 / freq;
let startTime = 0;

let secondsToSave = 10;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initSsvepCSV() {
  csvRows = [];
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let header = ['Timestamp (ms)']
    .concat(freqs.map(f => `ch0_${f}Hz`))
    .concat(freqs.map(f => `ch1_${f}Hz`))
    .concat(freqs.map(f => `ch2_${f}Hz`))
    .concat(freqs.map(f => `ch3_${f}Hz`))
    .concat(freqs.map(f => `chAux_${f}Hz`))
    .concat(freqs.map(f => `f_${f}Hz`))
    .concat(['info']);
  csvRows.push(header.join(','));
}

function logSsvepEpoch() {
  let ch0 = eegData.getSpectrum ? eegData.getSpectrum(0).slice(0, 30) : new Array(30).fill(0);
  let ch1 = eegData.getSpectrum ? eegData.getSpectrum(1).slice(0, 30) : new Array(30).fill(0);
  let ch2 = eegData.getSpectrum ? eegData.getSpectrum(2).slice(0, 30) : new Array(30).fill(0);
  let ch3 = eegData.getSpectrum ? eegData.getSpectrum(3).slice(0, 30) : new Array(30).fill(0);
  let chAux = new Array(30).fill(0);
  let freqs = [];
  for (let f = 1; f <= 30; f++) freqs.push(f);
  let row = [Date.now()]
    .concat(ch0.map(v => v.toFixed(4)))
    .concat(ch1.map(v => v.toFixed(4)))
    .concat(ch2.map(v => v.toFixed(4)))
    .concat(ch3.map(v => v.toFixed(4)))
    .concat(chAux)
    .concat(freqs)
    .concat(['11Hz_Fast']);
  csvRows.push(row.join(','));
}

function saveSsvepCSV() {
  if (csvRows.length <= 1) logSsvepEpoch();
  isRecording = false;
  let fname = `Ssvep_Fast_Frequency_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\\n') + '\\n', fname)
    : fname;
}

function restartSsvepRecording() {
  initSsvepCSV();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  textAlign(CENTER, CENTER);
  startTime = millis();
  restartSsvepRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveSsvepCSV();
  if (key === 'r' || key === 'R') restartSsvepRecording();
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 220 && mouseX < width - 115) {
      saveSsvepCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartSsvepRecording();
    }
  }
}

function draw() {
  background(255);
  let now = millis();
  let newOnset = false;

  if (now - startTime >= delay) {
    newOnset = true;
    startTime = startTime === 0 ? now : startTime + delay;
    if (now - startTime > delay * 2) startTime = now;
  }

  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logSsvepEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveSsvepCSV();
    }
  }

  let phaseOn = (now - startTime) < delay * 0.5;
  if (newOnset || phaseOn) {
    fill(0, 0, 0);
  } else {
    fill(240, 240, 240);
  }

  noStroke();
  let d = min(width, height - 80) * 0.65;
  ellipse(width / 2, height / 2 + 12, d, d);

  fill(255, 0, 0);
  textSize(28);
  text('+', width / 2, height / 2 + 12);

  // Top Recording & CSV Download HUD
  fill(24, 24, 34);
  rect(0, 0, width, 46);
  let recElapsed = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(recElapsed / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 17, 10, 10);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC 11 Hz SSVEP CSV: ${(secondsToSave - recElapsed).toFixed(1)}s left  (${csvRows.length - 1} epochs)`
    : `Downloaded: ${savedFileName} (${csvRows.length - 1} epochs)`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 240, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 240 * pct, 6, 3);

  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text('💾 Save CSV (S)', width - 170, 23);

  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);

  fill(40);
  textSize(13);
  text('SSVEP Fast Flicker — 11 Hz (Fixate on red + for 10s to auto-download CSV)', width / 2, height - 22);
}
""",

    "eegeduAlphaFixation.js": """/**
 * @id eegeduAlphaFixation
 * @title Alpha Eyes Open/Closed Fixation + CSV (EEGEdu)
 * @category EEGEdu Modules
 * @order 11
 *
 * Original EEGEdu Alpha & Bands Recording module (sketchFixation.js + EEGEduAlpha.js + EEGEduBands.js).
 * Displays the red fixation cross inside a grey circle while recording 1–30 Hz PSD spectra (Alpha_Open / Alpha_Closed)
 * and 5-band power (Bands_Recording) across all 4 electrodes (TP9, AF7, AF8, TP10).
 * Toggle Eyes Open (O) vs Eyes Closed (C), or switch Duration (10s / 60s), and auto-downloads the .csv on completion!
 */
let condition = 'Open'; // 'Open' or 'Closed'
let csvMode = 'Alpha';  // 'Alpha' (1-30 Hz spectra) or 'Bands' (delta..gamma per channel)
let secondsToSave = 60;
let isRecording = true;
let recordStartMs = 0;
let lastEpochMs = 0;
let epochIntervalMs = 250;
let csvRows = [];
let savedFileName = '';

function initAlphaCSV() {
  csvRows = [];
  if (csvMode === 'Bands') {
    csvRows.push(
      'Timestamp (ms),delta0,delta1,delta2,delta3,deltaAux,theta0,theta1,theta2,theta3,thetaAux,alpha0,alpha1,alpha2,alpha3,alphaAux,beta0,beta1,beta2,beta3,betaAux,gamma0,gamma1,gamma2,gamma3,gammaAux'
    );
  } else {
    let freqs = [];
    for (let f = 1; f <= 30; f++) freqs.push(f);
    let header = ['Timestamp (ms)']
      .concat(freqs.map(f => `ch0_${f}Hz`))
      .concat(freqs.map(f => `ch1_${f}Hz`))
      .concat(freqs.map(f => `ch2_${f}Hz`))
      .concat(freqs.map(f => `ch3_${f}Hz`))
      .concat(freqs.map(f => `chAux_${f}Hz`))
      .concat(freqs.map(f => `f_${f}Hz`))
      .concat(['info']);
    csvRows.push(header.join(','));
  }
}

function logAlphaEpoch() {
  if (csvMode === 'Bands') {
    let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
    let vals = [Date.now()];
    for (let b of bands) {
      for (let ch = 0; ch < 4; ch++) {
        let v = eegData.getChannelBand ? eegData.getChannelBand(b, ch) : (eegData[b] || 0);
        vals.push(v.toFixed(4));
      }
      vals.push('0');
    }
    csvRows.push(vals.join(','));
  } else {
    let ch0 = eegData.getSpectrum ? eegData.getSpectrum(0).slice(0, 30) : new Array(30).fill(0);
    let ch1 = eegData.getSpectrum ? eegData.getSpectrum(1).slice(0, 30) : new Array(30).fill(0);
    let ch2 = eegData.getSpectrum ? eegData.getSpectrum(2).slice(0, 30) : new Array(30).fill(0);
    let ch3 = eegData.getSpectrum ? eegData.getSpectrum(3).slice(0, 30) : new Array(30).fill(0);
    let chAux = new Array(30).fill(0);
    let freqs = [];
    for (let f = 1; f <= 30; f++) freqs.push(f);
    let row = [Date.now()]
      .concat(ch0.map(v => v.toFixed(4)))
      .concat(ch1.map(v => v.toFixed(4)))
      .concat(ch2.map(v => v.toFixed(4)))
      .concat(ch3.map(v => v.toFixed(4)))
      .concat(chAux)
      .concat(freqs)
      .concat([`Eyes_${condition}`]);
    csvRows.push(row.join(','));
  }
}

function saveAlphaCSV() {
  if (csvRows.length <= 1) logAlphaEpoch();
  isRecording = false;
  let fname = csvMode === 'Bands'
    ? `Bands_${condition}_Recording_${Date.now()}.csv`
    : `Alpha_${condition}_Recording_${Date.now()}.csv`;
  savedFileName = eegData.downloadCSV
    ? eegData.downloadCSV(csvRows.join('\\n') + '\\n', fname)
    : fname;
}

function restartAlphaRecording() {
  initAlphaCSV();
  recordStartMs = millis();
  lastEpochMs = 0;
  isRecording = true;
  savedFileName = '';
}

function setup() {
  createCanvas(width, height);
  frameRate(60);
  noStroke();
  textAlign(CENTER, CENTER);
  restartAlphaRecording();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveAlphaCSV();
  if (key === 'r' || key === 'R') restartAlphaRecording();
  if (key === 'o' || key === 'O') { condition = 'Open'; restartAlphaRecording(); }
  if (key === 'c' || key === 'C') { condition = 'Closed'; restartAlphaRecording(); }
  if (key === 'b' || key === 'B') { csvMode = csvMode === 'Alpha' ? 'Bands' : 'Alpha'; restartAlphaRecording(); }
}

function mousePressed() {
  if (mouseY < 48) {
    if (mouseX > width - 420 && mouseX < width - 315) {
      condition = condition === 'Open' ? 'Closed' : 'Open';
      restartAlphaRecording();
    } else if (mouseX >= width - 310 && mouseX < width - 225) {
      secondsToSave = secondsToSave === 60 ? 10 : 60;
      restartAlphaRecording();
    } else if (mouseX >= width - 220 && mouseX < width - 115) {
      saveAlphaCSV();
    } else if (mouseX >= width - 110 && mouseX < width - 12) {
      restartAlphaRecording();
    }
  }
}

function draw() {
  background(255);
  let now = millis();

  if (isRecording) {
    if (now - lastEpochMs >= epochIntervalMs) {
      lastEpochMs = now;
      logAlphaEpoch();
    }
    if (now - recordStartMs >= secondsToSave * 1000) {
      saveAlphaCSV();
    }
  }

  // Original sketchFixation.js stimulus: grey disc + red central '+'
  noStroke();
  fill(240, 240, 240);
  let d = min(width, height - 80) * 0.65;
  ellipse(width / 2, height / 2 + 12, d, d);

  fill(255, 0, 0);
  textSize(28);
  text('+', width / 2, height / 2 + 12);

  // Top Recording & CSV Download HUD
  fill(24, 24, 34);
  rect(0, 0, width, 46);
  let recElapsed = min(secondsToSave, (now - recordStartMs) / 1000);
  let pct = constrain(recElapsed / secondsToSave, 0, 1);

  fill(isRecording ? color(255, 75, 95) : color(78, 205, 196));
  ellipse(18, 17, 10, 10);

  fill(245);
  textAlign(LEFT, CENTER);
  textSize(12);
  let statusTxt = isRecording
    ? `REC ${csvMode} (${condition}): ${(secondsToSave - recElapsed).toFixed(1)}s left (${csvRows.length - 1} epochs)`
    : `Downloaded: ${savedFileName}`;
  text(statusTxt, 30, 16);

  fill(55, 58, 75);
  rect(30, 30, 210, 6, 3);
  fill(isRecording ? color(255, 107, 157) : color(78, 205, 196));
  rect(30, 30, 210 * pct, 6, 3);

  // Condition button (Eyes Open / Eyes Closed)
  fill(condition === 'Open' ? color(50, 110, 190) : color(130, 75, 180));
  rect(width - 418, 9, 102, 28, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(`👁 Eyes ${condition}`, width - 367, 23);

  // Duration toggle (60s / 10s)
  fill(55, 60, 82);
  rect(width - 308, 9, 80, 28, 5);
  fill(255);
  text(`⏱ ${secondsToSave}s`, width - 268, 23);

  // Save CSV button
  fill(45, 135, 115);
  rect(width - 220, 9, 100, 28, 5);
  fill(255);
  text('💾 Save CSV (S)', width - 170, 23);

  // Restart button
  fill(65, 70, 95);
  rect(width - 112, 9, 98, 28, 5);
  fill(255);
  text('🔄 Restart (R)', width - 63, 23);

  fill(40);
  textSize(13);
  text(
    `Condition: Eyes ${condition} (Press O=Open, C=Closed, B=${csvMode} CSV)  |  Alpha Power: ${(eegData.alpha * 100).toFixed(0)}%`,
    width / 2,
    height - 22
  );
}
""",

    "eegeduPredictVisual.js": """/**
 * @id eegeduPredictVisual
 * @title Brain State Classifier A vs B (EEGEdu)
 * @category EEGEdu Modules
 * @order 12
 *
 * Original EEGEdu Predict module sketch (sketchPredict.js).
 * Classifies live EEG into State A (Alpha/Meditation dominant) vs State B (Beta/Attention dominant)
 * and visualizes classification confidence across a split decision boundary.
 */
function setup() {
  createCanvas(width, height);
}

function draw() {
  let scoreA = (eegData.alpha + eegData.meditation) * 0.5;
  let scoreB = (eegData.beta + eegData.attention) * 0.5;
  let diff = Math.abs(scoreA - scoreB);
  let confidence = constrain(0.5 + diff * 1.4, 0, 1);
  let label = scoreA >= scoreB ? 'A' : 'B';

  background(250, 250, 150);
  fill(0);
  stroke(0);
  strokeWeight(5);
  line(width / 2, 0, width / 2, height);

  noStroke();
  textAlign(CENTER, TOP);
  textSize(30);
  text('A (Calm / Alpha)', width / 4, 24);
  text('B (Focus / Beta)', width - width / 4, 24);

  if (label === 'A') {
    fill(120, 120, 250);
    if (confidence > 0.72) {
      ellipse(width / 6, height / 2, 80, 80);
    } else {
      ellipse(width / 3, height / 2, 34, 34);
    }
  } else {
    fill(120, 250, 120);
    if (confidence > 0.72) {
      ellipse(width - width / 6, height / 2, 80, 80);
    } else {
      ellipse(width - width / 3, height / 2, 34, 34);
    }
  }

  fill(40);
  textSize(15);
  text(`Predicted State: ${label}  |  Confidence: ${(confidence * 100).toFixed(0)}%`, width / 2, height - 36);
}
""",

    "eegeduPredictSound.js": """/**
 * @id eegeduPredictSound
 * @title Brain State Major Triad Sound (EEGEdu)
 * @category EEGEdu Modules
 * @order 13
 *
 * Original EEGEdu Predict Sound module sketch (sketchPredictSound.js).
 * Maps classified brain state into a C-E-G Major Triad (4:5:6 frequency ratio:
 * 262 Hz, 327.5 Hz, 393 Hz) with amplitude driven by classification confidence.
 * Click canvas to toggle continuous tone on/off.
 */
let osc;
let soundOn = false;

function setup() {
  createCanvas(width, height);
  background(255);
  osc = new p5.Oscillator();
  osc.setType('sine');
}

function startSound() {
  userStartAudio();
  osc.freq(262);
  osc.amp(0);
  osc.start();
}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (soundOn) {
      osc.amp(0, 0.05);
      osc.stop();
      soundOn = false;
    } else {
      startSound();
      soundOn = true;
    }
  }
}

function draw() {
  background(250);
  let a = eegData.alpha;
  let b = eegData.beta;
  let t = eegData.theta;

  let label = 'A';
  let maxVal = a;
  if (b > maxVal) { label = 'B'; maxVal = b; }
  if (t > maxVal) { label = 'C'; maxVal = t; }
  let confidence = constrain(maxVal * 1.3, 0, 1);

  stroke(0);
  strokeWeight(5);

  if (label === 'A') {
    if (confidence > 0.5) {
      fill(120, 120, 250);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(262); }
    } else {
      fill(225, 225, 255);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(262); }
    }
  } else if (label === 'B') {
    if (confidence > 0.5) {
      fill(120, 250, 120);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(327.5); }
    } else {
      fill(225, 255, 225);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(327.5); }
    }
  } else {
    if (confidence > 0.5) {
      fill(250, 120, 120);
      if (soundOn) { osc.amp(0.4, 0.1); osc.freq(393); }
    } else {
      fill(255, 225, 225);
      if (soundOn) { osc.amp(0.12, 0.1); osc.freq(393); }
    }
  }

  rect(40, 40, width - 80, height - 110, 12);

  noStroke();
  fill(20);
  textAlign(CENTER, CENTER);
  textSize(18);
  let noteLabel = label === 'A' ? 'C4 (262 Hz - Alpha)' : label === 'B' ? 'E4 (327.5 Hz - Beta)' : 'G4 (393 Hz - Theta)';
  text(`State ${label}: ${noteLabel}  |  Click canvas to ${soundOn ? 'MUTE' : 'ENABLE'} sound`, width / 2, height - 35);
}
""",
}

BRAINGAMES_LIST = [
    ("gameGolfShooter",    "Golf Driving Range",          1,  GAMES_DIR / "GolfShooter.js"),
    ("gameArcheryShooter", "Archery Range",               2,  GAMES_DIR / "archeryShooter.js"),
    ("gameBballShooter",   "Basketball",                  3,  GAMES_DIR / "bballShooter.js"),
    ("gameSoccerPenalty",  "Soccer Shoot-Out",            4,  GAMES_DIR / "soccerPenalty.js"),
    ("gameRowingCalm",     "Rowing Calm",                 5,  GAMES_DIR / "RowingCalm.js"),
    ("gameBalanceBeam",    "Balance Beam",                6,  GAMES_DIR / "balanceBeam.js"),
    ("gameBalloonPop",     "Balloon Pop (Focus Trainer)", 7,  GAMES_DIR / "balloonPop.js"),
    ("gameDeepDiver",      "Deep Sea Diver",              8,  GAMES_DIR / "deepDiver.js"),
    ("gameMazeFocus",      "Maze Focus (Navigator)",      9,  GAMES_DIR / "mazeFocus.js"),
    ("gameReactionRace",   "F1 Reaction Race",            10, GAMES_DIR / "reactionRace.js"),
    ("gameSnakeFeast",     "Snake Feast",                 11, BRAINGAMES_TMP / "snakeFeast.js"),
    ("gameZenBreakout",    "Zen Breakout",                12, BRAINGAMES_TMP / "ZenBreakout.js"),
    ("gameBrainvaders",    "Brainvaders",                 13, BRAINGAMES_TMP / "Brainvaders.js"),
    ("gameEegFPS",         "EEG FPS Range",               14, BRAINGAMES_TMP / "eegFPS.js"),
]


def strip_leading_docblock(code: str) -> str:
    return re.sub(r"^\s*/\*\*[\s\S]*?\*/\s*", "", code, count=1)


def main():
    EXAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Write 12 EEGEdu Module sketches
    for filename, content in EEGEDU_MODULE_SKETCHES.items():
        out_path = EXAMPLES_DIR / filename
        out_path.write_text(content.strip() + "\n", encoding="utf-8")
        print(f"Wrote EEGEdu Module sketch: {out_path.name}")

    # 2. Write 14 BrainGames sketches
    for ex_id, title, order, src_path in BRAINGAMES_LIST:
        out_path = EXAMPLES_DIR / f"{ex_id}.js"
        if not src_path.exists() and out_path.exists():
            print(f"Kept existing BrainGames sketch: {out_path.name}")
            continue
        raw = src_path.read_text(encoding="utf-8")
        body = strip_leading_docblock(raw)

        # Adapt BrainGames standalone canvas calls (windowWidth, windowHeight - 48)
        # so they fill Brainimation's #canvas-container cleanly
        body = body.replace("createCanvas(windowWidth, windowHeight - 48);", "createCanvas(width, height);")
        body = body.replace("const w = windowWidth;\n  const h = windowHeight - 48;", "const w = width;\n  const h = height;")

        header = f"""/**
 * @id {ex_id}
 * @title {title}
 * @category BrainGames
 * @order {order}
 */
"""
        out_path = EXAMPLES_DIR / f"{ex_id}.js"
        out_path.write_text(header + body.strip() + "\n", encoding="utf-8")
        print(f"Wrote BrainGames sketch: {out_path.name} (from {src_path.name})")


if __name__ == "__main__":
    main()
