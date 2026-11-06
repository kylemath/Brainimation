/**
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
