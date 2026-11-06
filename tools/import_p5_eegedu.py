#!/usr/bin/env python3
"""
Convert all 14 main-branch p5.eegedu.art sketches and all 21 gallery-branch
student sketches into clean Brainimation global-mode p5.js examples in
../examples/.
"""
from pathlib import Path

EXAMPLES_DIR = Path(__file__).resolve().parent.parent / "examples"

SKETCHES = {
    # =========================================================================
    # 14 Classic p5.eegedu.art (main branch) sketches
    # =========================================================================
    "eegedu3dTorus.js": """/**
 * @id eegedu3dTorus
 * @title 3D Torus (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 1
 *
 * Original p5.eegedu.art sketch by Kyle Mathewson.
 * Demonstration of WEBGL 3D animation with frequency bands and mouse-driven point light.
 */
let clickValue = 0;

function setup() {
  createCanvas(width, height, WEBGL);
  clickValue = 0;
}

function draw() {
  // Available EEG Variables (scaled to classic p5.eegedu range):
  let DELTA = eegData.getChannelBand('delta', 0) * 150;
  let THETA = eegData.getChannelBand('theta', 0) * 150;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 150;
  let BETA  = eegData.getChannelBand('beta', 0) * 150;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 150;

  background(clickValue * 0.2);
  ambientLight(100);
  pointLight(250, 255, 255, mouseX - width / 2, mouseY - height / 2, 200);

  push();
  ambientMaterial(250);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  let r = max(20, DELTA);
  torus(r, r / 4, 64, 64);
  pop();
}

function mouseClicked() {
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
""",

    "eegeduAlphaSnake.js": """/**
 * @id eegeduAlphaSnake
 * @title Alpha Snake Game (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 2
 *
 * Original p5.eegedu.art sketch by Kyle Mathewson.
 * Playable W/A/S/D Snake game with difficulty and fruit size controlled by frequency bands.
 */
let numSegments = 10;
let direction = 'right';
let xStart = 50;
let yStart = 250;
let diff = 10;
let xCor = [];
let yCor = [];
let xFruit = 250;
let yFruit = 250;
let score = 0;

function setup() {
  numSegments = 10;
  direction = 'right';
  xStart = 50;
  yStart = Math.floor(height / 20) * 10;
  diff = 10;
  xCor = [];
  yCor = [];
  xFruit = Math.floor(width / 20) * 10;
  yFruit = Math.floor(height / 20) * 10;
  score = 0;

  frameRate(15);
  stroke(255);
  strokeWeight(10);
  textSize(15);

  for (let i = 0; i < numSegments; i++) {
    xCor.push(xStart + i * diff);
    yCor.push(yStart);
  }
}

function draw() {
  let ALPHA = 50 - eegData.getChannelBand('alpha', 0) * 40;
  let DELTA = map(eegData.getChannelBand('delta', 0) * 100, 0, 100, 2, 12, true);

  diff = DELTA;

  background(0);

  fill(255);
  noStroke();
  text('Use keys W A S & D to steer', 30, 40);
  text('Score: ' + score, 30, 70);

  strokeWeight(10);
  for (let i = 0; i < numSegments - 1; i++) {
    stroke(200, DELTA * 20, 20);
    line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
  }
  stroke(255);

  updateSnakeCoordinates();
  checkGameStatus();
  checkForFruit();
}

function updateSnakeCoordinates() {
  for (let i = 0; i < numSegments - 1; i++) {
    xCor[i] = xCor[i + 1];
    yCor[i] = yCor[i + 1];
  }
  switch (direction) {
    case 'right':
      xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'up':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
      break;
    case 'left':
      xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'down':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
      break;
  }
}

function checkGameStatus() {
  if (
    xCor[xCor.length - 1] > width ||
    xCor[xCor.length - 1] < 0 ||
    yCor[yCor.length - 1] > height ||
    yCor[yCor.length - 1] < 0 ||
    checkSnakeCollision()
  ) {
    noLoop();
    noStroke();
    fill(255, 80, 80);
    text('Game Over! Click Run Code to play again.', 30, 105);
  }
}

function checkSnakeCollision() {
  const snakeHeadX = xCor[xCor.length - 1];
  const snakeHeadY = yCor[yCor.length - 1];
  for (let i = 0; i < xCor.length - 1; i++) {
    if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
      return true;
    }
  }
  return false;
}

function checkForFruit() {
  let ALPHA = 50 - eegData.getChannelBand('alpha', 0) * 40;
  strokeWeight(max(8, ALPHA));
  stroke(20, ALPHA * 5, ALPHA * 5);
  point(xFruit, yFruit);
  stroke(255);
  strokeWeight(10);

  let give = max(10, ALPHA - 10);
  if (
    xCor[xCor.length - 1] > xFruit - give &&
    xCor[xCor.length - 1] < xFruit + give &&
    yCor[yCor.length - 1] > yFruit - give &&
    yCor[yCor.length - 1] < yFruit + give
  ) {
    score++;
    xCor.unshift(xCor[0]);
    yCor.unshift(yCor[0]);
    numSegments++;
    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  xFruit = floor(random(10, (width - 100) / 10)) * 10;
  yFruit = floor(random(10, (height - 100) / 10)) * 10;
}

function keyPressed() {
  switch (keyCode) {
    case 65: // A
    case LEFT_ARROW:
      if (direction !== 'right') direction = 'left';
      break;
    case 68: // D
    case RIGHT_ARROW:
      if (direction !== 'left') direction = 'right';
      break;
    case 87: // W
    case UP_ARROW:
      if (direction !== 'down') direction = 'up';
      break;
    case 83: // S
    case DOWN_ARROW:
      if (direction !== 'up') direction = 'down';
      break;
  }
}
""",

    "eegeduBasicFrequencyBands.js": """/**
 * @id eegeduBasicFrequencyBands
 * @title Mouse Band Stack (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 3
 *
 * Original BasicFrequencyBands.p5 sketch by Kyle Mathewson.
 * Demonstration of text and circle animation following the mouse with frequency bands.
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  clickValue = 0;
}

function draw() {
  background(clickValue, 255, 200);

  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let DELTA = eegData.getChannelBand('delta', 0) * 80;
  let THETA = eegData.getChannelBand('theta', 0) * 80;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 80;
  let BETA  = eegData.getChannelBand('beta', 0) * 80;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 80;

  let gap = (DELTA + THETA + ALPHA + BETA + GAMMA) / 5;

  textSize(max(10, DELTA));
  fill(clickValue, DELTA * 3, 20);
  text('Delta', MOUSEX + 40, MOUSEY - 2 * gap);
  ellipse(MOUSEX, MOUSEY - 2 * gap, DELTA);

  textSize(max(10, THETA));
  fill(20, clickValue, THETA * 3);
  text('Theta', MOUSEX + 40, MOUSEY - 1 * gap);
  ellipse(MOUSEX, MOUSEY - 1 * gap, THETA);

  textSize(max(10, ALPHA));
  fill(ALPHA * 3, clickValue, clickValue);
  text('Alpha', MOUSEX + 40, MOUSEY);
  ellipse(MOUSEX, MOUSEY, ALPHA);

  textSize(max(10, BETA));
  fill(BETA * 3, clickValue, BETA * 3);
  text('Beta', MOUSEX + 40, MOUSEY + 1 * gap);
  ellipse(MOUSEX, MOUSEY + 1 * gap, BETA);

  textSize(max(10, GAMMA));
  fill(clickValue, (GAMMA * 3) / 2, GAMMA * 3);
  text('Gamma', MOUSEX + 40, MOUSEY + 2 * gap);
  ellipse(MOUSEX, MOUSEY + 2 * gap, GAMMA);
}

function mouseClicked() {
  background(200, 255, 210);
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
""",

    "eegeduBrainDraw.js": """/**
 * @id eegeduBrainDraw
 * @title Brain Draw Brush (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 4
 *
 * Original BrainDraw.p5 sketch by Kyle Mathewson.
 * Uses frequency bands to directly map cursor location (Alpha/Beta) and RGB shade (Theta/Delta/Gamma).
 */
let xVar = 0;
let yVar = 0;
let brushWidth = 50;

function setup() {
  colorMode(RGB, 255);
  background(128);
  xVar = 0;
  yVar = 0;
  brushWidth = 50;
  noStroke();
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 255;
  let THETA = eegData.getChannelBand('theta', 0) * 255;
  let ALPHA = eegData.getChannelBand('alpha', 0) * width;
  let BETA  = eegData.getChannelBand('beta', 0) * height;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 255;

  xVar = constrain(ALPHA, brushWidth / 2, width - brushWidth / 2);
  yVar = constrain(BETA, brushWidth / 2, height - brushWidth / 2);

  fill(THETA, DELTA, GAMMA, 40);
  ellipse(xVar, yVar, brushWidth);
}

function mousePressed() {
  background(128);
}
""",

    "eegeduColourBalls.js": """/**
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
""",

    "eegeduMultipleBalls.js": """/**
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
""",

    "eegeduSplineBounce.js": """/**
 * @id eegeduSplineBounce
 * @title Frequency Band Spline (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 7
 *
 * Original SplineBounce.p5 sketch by Kyle Mathewson.
 * Draws a smooth spline curve through the 5 EEG frequency bands (D, T, A, B, G).
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  clickValue = 0;
  textSize(40);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * height * 0.7;
  let THETA = eegData.getChannelBand('theta', 0) * height * 0.7;
  let ALPHA = eegData.getChannelBand('alpha', 0) * height * 0.7;
  let BETA  = eegData.getChannelBand('beta', 0) * height * 0.7;
  let GAMMA = eegData.getChannelBand('gamma', 0) * height * 0.7;

  let bands = ['D', 'T', 'A', 'B', 'G'];
  let xs = [width * 0.1, width * 0.3, width * 0.5, width * 0.7, width * 0.9];
  let ys = [height - DELTA - 40, height - THETA - 40, height - ALPHA - 40, height - BETA - 40, height - GAMMA - 40];

  background(200, clickValue, 210);

  noFill();
  stroke(0);
  strokeWeight(3);
  beginShape();
  curveVertex(xs[0], ys[0]);
  for (let i = 0; i < 5; i++) {
    curveVertex(xs[i], ys[i]);
  }
  curveVertex(xs[4], ys[4]);
  endShape();

  fill(0);
  for (let i = 0; i < 5; i++) {
    ellipse(xs[i], ys[i], 12, 12);
    text(bands[i], xs[i] - 15, ys[i] - 15);
  }
}

function mouseClicked() {
  if (clickValue === 0) {
    clickValue = 255;
  } else {
    clickValue = 0;
  }
}
""",

    "eegeduBandOrbitz.js": """/**
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
""",

    "eegeduBasicShapes.js": """/**
 * @id eegeduBasicShapes
 * @title Left/Right Alpha Trail (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 9
 *
 * Original basicShapes.p5 sketch by Kyle Mathewson.
 * Compares Left Frontal (AF7) vs Right Frontal (AF8) Alpha asymmetry around the mouse cursor.
 */
let value = 0;

function setup() {
  colorMode(RGB, 255);
  value = 0;
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 120;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 120;

  stroke(0);
  fill(200, 120, 100);
  ellipse(MOUSEX - 100, MOUSEY, LEFTALPHA);
  fill(20, 200, 255);
  ellipse(MOUSEX + 100, MOUSEY, RIGHTALPHA);
  fill(20, 255, 0);
  ellipse(MOUSEX, MOUSEY, 50);
}

function mouseClicked() {
  background(255, 255, 200);
  if (value === 0) {
    value = 255;
  } else {
    value = 0;
  }
}
""",

    "eegeduBouncingLine.js": """/**
 * @id eegeduBouncingLine
 * @title Bouncing Line Screensaver (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 10
 *
 * Original bouncingLine.p5 sketch by Kyle Mathewson.
 * Classic bouncing line screensaver with endpoint speeds controlled by Left & Right Alpha.
 */
let startX, startY, endX, endY;
let deltaStartX, deltaStartY, deltaEndX, deltaEndY;
let h, s, b;

function setup() {
  startX = random(width);
  startY = random(height);
  endX = random(width);
  endY = random(height);
  let range = 5;
  deltaStartX = random(-range, range);
  deltaStartY = random(-range, range);
  deltaEndX = random(-range, range);
  deltaEndY = random(-range, range);
  h = random(255);
  s = 255;
  b = 255;
  noFill();
  colorMode(HSB, 255);
  background(32);
}

function draw() {
  stroke(h, s, b, 100);
  strokeWeight(2);
  line(startX, startY, endX, endY);

  h += random(-5, 5);
  h = constrain(h, 0, 255);

  let leftAlpha  = 0.5 + eegData.getChannelBand('alpha', 1) * 3;
  let rightAlpha = 0.5 + eegData.getChannelBand('alpha', 2) * 3;

  startX += deltaStartX * leftAlpha;
  startY += deltaStartY * leftAlpha;
  endX   += deltaEndX * rightAlpha;
  endY   += deltaEndY * rightAlpha;

  if (startX < 0 || startX > width)  deltaStartX *= -1;
  if (startY < 0 || startY > height) deltaStartY *= -1;
  if (endX < 0 || endX > width)      deltaEndX *= -1;
  if (endY < 0 || endY > height)      deltaEndY *= -1;
}
""",

    "eegeduEegTrace.js": """/**
 * @id eegeduEegTrace
 * @title 4-Channel EEG Trace (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 11
 *
 * Original eegTrace.p5 sketch by Kyle Mathewson.
 * Draws the 4 incoming EEG channels like clinical recording software with millisecond markers.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  noFill();
}

function draw() {
  background(255);
  let channels = eegData.getAllChannels(128);
  let data = [channels.TP9, channels.AF7, channels.AF8, channels.TP10];
  let srate = eegData.sampleRate || 256;
  let period = 1 / srate;
  let nSamples = data[0].length;

  if (nSamples > 2) {
    let colors = [
      [217, 95, 2],
      [27, 158, 119],
      [117, 112, 179],
      [231, 41, 138]
    ];
    let offsets = [height / 1.5, height / 2, height / 2.5, height / 3];

    for (let ch = 0; ch < 4; ch++) {
      stroke(colors[ch][0], colors[ch][1], colors[ch][2]);
      strokeWeight(2);
      noFill();
      beginShape();
      for (let i = 0; i < nSamples; i++) {
        let xpos = map(i, 0, nSamples - 1, 0, width);
        curveVertex(xpos, height - data[ch][i] / 2 - offsets[ch]);
      }
      endShape();
    }

    // Millisecond markers along bottom
    textSize(11);
    fill(0);
    noStroke();
    for (let i = 0; i < nSamples; i += 32) {
      let xpos = map(i, 0, nSamples - 1, 0, width);
      text(round(i * period * 1000) + ' ms', xpos, height - 10);
    }
  }
}
""",

    "eegeduEpochs.js": """/**
 * @id eegeduEpochs
 * @title Overlapping Epochs Butterfly (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 12
 *
 * Original epochs.p5 sketch by Kyle Mathewson.
 * Draws incoming EEG epochs overlapping one another with translucent red ink. Click to clear.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  background(255);
  noFill();
}

function draw() {
  let data = eegData.getRawChannel('TP9', 128);
  let srate = eegData.sampleRate || 256;
  let period = 1 / srate;

  stroke(255, 0, 0, 0.04);
  strokeWeight(1.5);
  noFill();
  textSize(10);

  if (data && data.length > 2) {
    beginShape();
    for (let i = 0; i < data.length; i++) {
      let xpos = map(i, 0, data.length - 1, 0, width);
      curveVertex(xpos, height - data[i] / 2 - height / 2);
      if (i % 50 === 0 || i === data.length - 1) {
        fill(0);
        noStroke();
        text(round(i * period * 1000) + 'ms', xpos, height - 10);
        noFill();
        stroke(255, 0, 0, 0.04);
      }
    }
    endShape();
  }

  if (mouseIsPressed) {
    background(255);
  }
}
""",

    "eegeduFunctionExample.js": """/**
 * @id eegeduFunctionExample
 * @title Custom Function Triplet (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 13
 *
 * Original functionExample.p5 sketch by Kyle Mathewson.
 * Demonstrates creating custom drawing functions inside draw() driven by Left and Right Alpha.
 */
function setup() {
  colorMode(RGB, 255);
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 100;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 100;

  function drawCircle(r, g, b, x, y, d) {
    fill(r, g, b);
    ellipse(x, y, d);
  }

  drawCircle(10, 0, 255, MOUSEX, MOUSEY, RIGHTALPHA);
  drawCircle(10, 255, 10, MOUSEX + 100, MOUSEY, RIGHTALPHA);
  drawCircle(255, 10, 10, MOUSEX - 100, MOUSEY, LEFTALPHA);
}

function mousePressed() {
  background(255, 255, 200);
}
""",

    "eegeduGhostLines.js": """/**
 * @id eegeduGhostLines
 * @title Cascading Ghost Traces (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 14
 *
 * Original ghostLines.p5 sketch by Kyle Mathewson.
 * Draws multi-weight layered EEG waveforms cascading down the screen like a joy-division plot.
 */
let border = 20;
let offset = 20;
let alphas = [0.2, 0.4, 0.6, 1.0];
let weights = [10, 4, 2, 1];
let bias = [2, 3, 4, 5];

function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  noFill();
  background(0);
  border = 20;
  offset = border + 30;
  frameRate(8);
}

function draw() {
  let data = eegData.getRawChannel('AF7', 128);
  if (data && data.length > 2) {
    for (let b = 0; b < alphas.length; b++) {
      stroke(255, 255, 255, alphas[b]);
      strokeWeight(weights[b]);
      beginShape();
      for (let i = 0; i < data.length; i++) {
        let xpos = map(i, 0, data.length - 1, border, width - border);
        curveVertex(xpos, data[i] / bias[b] + offset);
      }
      endShape();
    }
    offset = offset + 35;
    if (offset > height - border) {
      offset = border + 30;
      background(0);
    }
  }
}

function mouseClicked() {
  background(0);
  offset = border + 30;
}
""",

    "eegeduPiWedges.js": """/**
 * @id eegeduPiWedges
 * @title Radial Band Wedges (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 15
 *
 * Original piWedges.p5 sketch by Kyle Mathewson.
 * Displays the 5 frequency bands as fixed-angle wedges whose radius and brightness scale with power.
 */
function setup() {
  noStroke();
  colorMode(HSB, 100, 255, 255, 1);
  frameRate(10);
}

function draw() {
  background(0, 0, 128);

  let tao = TWO_PI;
  let nbands = 5;
  let part = tao / nbands;

  let DELTA = eegData.getChannelBand('delta', 0) * 35;
  let THETA = eegData.getChannelBand('theta', 0) * 35;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 35;
  let BETA  = eegData.getChannelBand('beta', 0) * 35;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 35;

  let size = 10;
  let cx = width / 2;
  let cy = height / 2;

  fill(1, 255, DELTA * size);
  arc(cx, cy, DELTA * size, DELTA * size, -PI, -PI + part);

  fill(20, 255, THETA * size);
  arc(cx, cy, THETA * size, THETA * size, -PI + part, -PI + part * 2);

  fill(40, 255, ALPHA * size);
  arc(cx, cy, ALPHA * size, ALPHA * size, -PI + part * 2, -PI + part * 3);

  fill(60, 255, ALPHA * size);
  arc(cx, cy, BETA * size, BETA * size, -PI + part * 3, -PI + part * 4);

  fill(80, 255, GAMMA * size);
  arc(cx, cy, GAMMA * size, GAMMA * size, -PI + part * 4, -PI + part * 5);
}
""",

    "eegeduSpectra.js": """/**
 * @id eegeduSpectra
 * @title Overlapping FFT Spectra (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 16
 *
 * Original spectra.p5 sketch by Kyle Mathewson.
 * Draws incoming FFT power spectra overlapping one another. Click to clear background.
 */
function setup() {
  colorMode(RGB, 255, 255, 255, 1);
  background(255);
  noFill();
}

function draw() {
  let spec = eegData.getSpectrum(0);
  let spectra = spec.psd;
  let freqs = spec.freqs;

  stroke(255, 0, 0, 0.04);
  strokeWeight(1.5);
  textSize(10);
  noFill();

  if (freqs && freqs.length > 0) {
    beginShape();
    for (let i = 0; i < freqs.length; i++) {
      let xpos = map(i, 0, freqs.length - 1, 20, width - 20);
      let yval = constrain(height - 30 - spectra[i] * 8, 20, height - 30);
      curveVertex(xpos, yval);
      if (i % 10 === 0 || i === freqs.length - 1) {
        fill(0);
        noStroke();
        text(freqs[i] + 'Hz', xpos, height - 10);
        noFill();
        stroke(255, 0, 0, 0.04);
      }
    }
    endShape();
  }

  if (mouseIsPressed) {
    background(255);
  }
}
""",

    # =========================================================================
    # 21 Student Gallery Sketches (2022 NeuroArt Class Gallery)
    # =========================================================================
    "studentAhmedFTelekinesis.js": """/**
 * @id studentAhmedFTelekinesis
 * @title Telekinesis (Faiyaz Ahmed)
 * @category 2022 NeuroArt Class Gallery
 * @order 1
 *
 * Student NeuroArt Project by Faiyaz Ahmed.
 * Focus & levitate the trees with your Delta brainwaves! Blink and you reset your score.
 */
let distractions = ["BLINK", "HAHAHAHA", "LOOK BEHIND YOU!"];
let score = 0;
let highscore = 0;

function setup() {
  colorMode(RGB, 255);
  score = 0;
  highscore = 0;
  frameRate(6);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 1400;

  background('#a8fcff');

  push();
  scale(width / 800, height / 720);

  // Texts on the screen
  textSize(30);
  fill(random(0, 255), random(0, 255), random(0, 255));
  text("TELEKINESIS", 250, 60);
  fill('black');
  textSize(20);
  text("Focus & Levitate the Trees with your brainwaves!", 140, 100);
  text("!!! YOU BLINK, YOU LOSE !!!", 230, 140);

  let letter = random(distractions);
  textSize(20);
  fill(random(0, 255), random(0, 255), random(0, 255));
  text(letter, random(10, 750), random(10, 680));

  noStroke();
  ellipseMode(CENTER);

  // Scoring system for how long you can levitate
  score++;
  if (score > highscore) {
    highscore = score;
  }

  textSize(20);
  fill("black");
  text("Score: " + score, 600, 40);
  text("Highest Score: " + highscore, 600, 65);

  let Lvl = 600;
  let Lvl2 = DELTA - 210;

  if (Lvl2 < 200) {
    Lvl2 = 200;
  }
  if (Lvl2 > 600) {
    Lvl2 = 600;
    score = 0;
  }

  // Land
  fill('#429f46');
  rect(100, Lvl, 600, 50, 25);

  // River
  stroke('#4ccfe0');
  strokeWeight(20);
  noFill();
  beginShape();
  vertex(400, Lvl);
  bezierVertex(450, Lvl, 450, Lvl + 20, 390, Lvl + 25);
  bezierVertex(350, Lvl + 25, 340, Lvl + 40, 400, Lvl + 60);
  endShape();
  noStroke();

  // Water
  fill('#4ccfe0');
  rect(120, Lvl + 50, 560, 60, 30);
  fill('#b1eaf1');
  rect(160, Lvl + 60, 60, 10, 5);
  rect(580, Lvl + 90, 60, 10, 5);

  // Mountain right
  fill('#8c6d62');
  triangle(300, Lvl, 465, 265, 648, Lvl);
  fill('#6c4b40');
  triangle(600, Lvl, 465, 265, 648, Lvl);
  fill('#fff');
  beginShape();
  vertex(425, 345);
  vertex(465, 265);
  vertex(515, 355);
  vertex(490, 325);
  vertex(464, 343);
  vertex(454, 334);
  endShape(CLOSE);

  // Mountain left
  fill('#8c6d62');
  triangle(152, Lvl, 285, 335, 452, Lvl);
  fill('#6c4b40');
  triangle(352, Lvl, 285, 335, 452, Lvl);
  fill('#fff');
  beginShape();
  vertex(257, 390);
  vertex(285, 335);
  vertex(314, 380);
  vertex(298, 390);
  vertex(274, 380);
  endShape(CLOSE);

  // Tree 1
  let Xtree1 = 190;
  fill('#4d332d');
  rect(Xtree1, Lvl2 + 20, 5, 20, 3);
  fill('#2d7c31');
  ellipse(Xtree1 + 3, Lvl2 - 10, 50, 70);
  fill('#1a5d1f');
  arc(Xtree1 + 2.5, Lvl2 - 10, 50, 70, -HALF_PI, HALF_PI);

  // Tree 2
  let Xtree2 = 300;
  fill('#4d332d');
  rect(Xtree2, Lvl2 + 5, 4, 10, 2);
  fill('#2d7c31');
  ellipse(Xtree2 + 3, Lvl2 - 20, 30, 50);
  fill('#1a5d1f');
  arc(Xtree2 + 2.5, Lvl2 - 20, 30, 50, -HALF_PI, HALF_PI);

  // Tree 3
  let Xtree3 = 550;
  fill('#4d332d');
  rect(Xtree3, Lvl2 + 10, 5, 20, 3);
  fill('#2d7c31');
  ellipse(Xtree3 + 3, Lvl2 - 20, 50, 70);
  fill('#1a5d1f');
  arc(Xtree3 + 2.5, Lvl2 - 20, 50, 70, -HALF_PI, HALF_PI);

  pop();
}
""",

    "studentAhmedSFireworks.js": """/**
 * @id studentAhmedSFireworks
 * @title Fireworks-VF (Sharmin Ahmed)
 * @category 2022 NeuroArt Class Gallery
 * @order 2
 *
 * Student NeuroArt Project by Sharmin Ahmed.
 * Draws glowing bursts positioned by Alpha and Gamma waves and colored by Theta, Delta, and Beta.
 */
let myFireworks = [];
let posX = 0;
let posY = 0;
let brushWidth = 25;
let DELTA = 0, THETA = 0, ALPHA = 0, BETA = 0, GAMMA = 0;

class Fireworks {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;
  }
  display() {
    fill(THETA, DELTA, BETA);
    circle(posX, posY, brushWidth);
  }
}

function setup() {
  colorMode(RGB, 255);
  background(0);
  posX = width / 2;
  posY = height / 2;
  brushWidth = 25;
  noStroke();
  myFireworks = [new Fireworks(posX, posY, brushWidth)];
}

function draw() {
  DELTA = eegData.getChannelBand('delta', 0) * 255;
  THETA = eegData.getChannelBand('theta', 3) * 255;
  ALPHA = eegData.getChannelBand('alpha', 2) * width;
  BETA  = eegData.getChannelBand('beta', 3) * 255;
  GAMMA = eegData.getChannelBand('gamma', 0) * height;

  posX = ALPHA;
  posY = GAMMA;

  for (let f = 0; f < myFireworks.length; f++) {
    myFireworks[f].display();
    fill(THETA, DELTA, BETA, 150);
    circle(posX, posY, brushWidth);
  }
}

function mousePressed() {
  background(0);
}
""",

    "studentArmstrongFractalTree.js": """/**
 * @id studentArmstrongFractalTree
 * @title Fractal Tree Blossom (Aislinn Armstrong)
 * @category 2022 NeuroArt Class Gallery
 * @order 3
 *
 * Student NeuroArt Project by Aislinn Armstrong.
 * Recursive branching tree whose blossoms change color with EEG frequency bands.
 */
function setup() {
  colorMode(RGB, 255);
  angleMode(DEGREES);
  frameRate(3);
}

function draw() {
  background(255);
  push();
  translate(width / 2, height * 0.82);
  branch(min(width, height) * 0.16);
  pop();
}

function branch(len) {
  push();
  if (len > 10) {
    strokeWeight(map(len, 10, 100, 1, 15));
    stroke(70, 40, 20);
    line(0, 0, 0, -len);
    translate(0, -len);
    rotate(30);
    branch(len * random(0.7, 0.9));
    rotate(-60);
    branch(len * random(0.7, 0.9));
  } else {
    let DELTA = eegData.getChannelBand('delta', 0) * 50;
    let THETA = eegData.getChannelBand('theta', 0) * 50;
    let ALPHA = eegData.getChannelBand('alpha', 0) * 50;
    let BETA  = eegData.getChannelBand('beta', 0) * 50;
    let GAMMA = eegData.getChannelBand('gamma', 0) * 50;

    let r = random(DELTA, max(DELTA + 10, THETA + ALPHA)) * 5 + random(-30, 30);
    let g = random(THETA, max(THETA + 10, BETA + GAMMA)) * 6 + random(-30, 30);
    let b = random(ALPHA, max(ALPHA + 10, DELTA + BETA)) * 3 + random(-30, 30);
    fill(constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255));
    noStroke();
    ellipse(0, 0, 10);
  }
  pop();
}
""",

    "studentAlemuSunrise.js": """/**
 * @id studentAlemuSunrise
 * @title Breath Sunrise (Meron Alemu)
 * @category 2022 NeuroArt Class Gallery
 * @order 4
 *
 * Student NeuroArt Project by Meron Alemu.
 * Take a deep breath and exhale to turn the sky and landscape from night to day with Alpha & Gamma waves!
 */
let sunrise = [];

function setup() {
  colorMode(RGB, 255);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 255;
  let THETA = eegData.getChannelBand('theta', 0) * 255;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 255;
  let BETA  = eegData.getChannelBand('beta', 0) * 255;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 255;

  background(10, ALPHA, 200);

  push();
  scale(width / 500, height / 500);

  fill(255, 250, 100);
  sunrise[1] = arc(250, 350, 280, 270, PI, TWO_PI);

  fill(150, 100, 250);
  rect(10, 170, 80, 100);

  fill(150, BETA, 120);
  triangle(10, 173, 47, 100, 95, 173);

  fill(255, 200, 20);
  rect(30, 210, 40, 60);

  fill(255, 255, 250);
  sunrise[2] = arc(250, 320, 180, 170, PI, TWO_PI);

  fill(50, GAMMA, ALPHA);
  rect(0, 270, 500, 230);
  pop();
}
""",

    "studentAlizadehFlowerBrain.js": """/**
 * @id studentAlizadehFlowerBrain
 * @title FlowerBrain Landscape (Shima Rastgar Alizadeh)
 * @category 2022 NeuroArt Class Gallery
 * @order 5
 *
 * Student NeuroArt Project by Shima Rastgar Alizadeh (PSYC 403).
 * Paint Alpha-sized flowers in the sky above mountains and trees. Click to refresh the sky color!
 */
let clickValue = 0;

function setup() {
  colorMode(RGB, 255);
  background(180, 220, 250);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 120;
  let THETA = eegData.getChannelBand('theta', 3) * 100;
  let ALPHA = eegData.getChannelBand('alpha', 2) * 80;
  let BETA  = eegData.getChannelBand('beta', 1) * 200;
  let GAMMA = eegData.getChannelBand('gamma', 1) * 200;

  let mx = mouseX || width / 2;
  let my = mouseY || height / 3;

  // Flower petals based on ALPHA size and ALPHA, BETA, GAMMA colors
  stroke(0);
  fill(ALPHA * 3, BETA, GAMMA);
  ellipse(mx - 40, my, ALPHA);
  ellipse(mx + 40, my, ALPHA);
  ellipse(mx, my - 40, ALPHA);
  ellipse(mx, my + 40, ALPHA);

  // Flower center
  fill(ALPHA * 2, DELTA, DELTA);
  ellipse(mx, my, ALPHA);

  push();
  scale(width / 700, height / 700);
  // Mountains
  fill(128, 128, 128);
  triangle(200, 500, 600, 500, 400, 200);
  fill(0, 128, 128);
  triangle(400, 500, 600, 500, 500, 300);

  // Left tree
  fill(165, 42, 42);
  rect(50, 300, 10, 200);
  fill(0, 255, 0);
  ellipse(56, 310, 70, 70);
  ellipse(56, 375, 70, 70);
  ellipse(56, 435, 70, 70);

  // Right tree
  fill(165, 42, 42);
  rect(100, 300, 10, 200);
  fill(0, 255, 0);
  ellipse(105, 310, 70, 70);
  ellipse(105, 375, 70, 70);
  ellipse(105, 435, 70, 70);
  pop();
}

function mouseClicked() {
  let DELTA = eegData.getChannelBand('delta', 0) * 120;
  let ALPHA = eegData.getChannelBand('alpha', 2) * 200;
  background(DELTA, DELTA * 2, ALPHA);
  clickValue = clickValue === 0 ? 255 : 0;
}
""",

    "studentDikaRainyHouse.js": """/**
 * @id studentDikaRainyHouse
 * @title Rainy House (Kirsten Dika)
 * @category 2022 NeuroArt Class Gallery
 * @order 6
 *
 * Student NeuroArt Project by Kirsten Dika.
 * Raindrops fall at a speed controlled by Theta waves while the house windows glow with Alpha power.
 */
let lineY = [];

function setup() {
  colorMode(RGB, 255);
  lineY = [];
  for (let i = 0; i < 100; i++) {
    lineY[i] = random(height);
  }
}

function draw() {
  let alpha  = eegData.getChannelBand('alpha', 0) * 2.5;
  let alpha2 = eegData.getChannelBand('alpha', 2) * 2.5;
  let alpha3 = eegData.getChannelBand('alpha', 3) * 2.5;
  let theta  = eegData.getChannelBand('theta', 3) * 12;

  background(32, 42, 68);

  push();
  scale(width / 300, height / 300);

  // Hills
  noStroke();
  fill(118, 136, 106);
  circle(90, 330, 200);
  circle(220, 370, 200);

  // House
  drawHouse(
    230, 195, 100, 100,
    [84, 7, 7],
    [0, 0, 0],
    [alpha * 100, alpha2 * 100, alpha3 * 100],
    [214, 183, 152]
  );
  pop();

  // Rain
  for (let i = 0; i < lineY.length; i++) {
    let lineX = (width * i) / lineY.length;
    stroke(187, 205, 212);
    strokeWeight(2);
    line(lineX, lineY[i], lineX, lineY[i] + 8);

    lineY[i] += random(1, max(2, theta));
    if (lineY[i] > height) {
      lineY[i] = 0;
    }
  }
}

function drawHouse(squareX, squareY, wide, high, color1, color2, color3, color4) {
  let houseDistance = wide / 2;

  // Main square of house
  fill(color1);
  rect(squareX - houseDistance, squareY - houseDistance, wide, high);

  // Roof
  fill(color2);
  triangle(squareX - wide / 2, squareY - high / 2, squareX, squareY - high, squareX + houseDistance, squareY - high / 2);

  // Chimney
  fill(color1);
  rect(squareX + high / 10, squareY - high, houseDistance / 3, high / 3);

  // Windows
  fill(color3);
  rect(squareX + high / 10, squareY - high / 3, houseDistance / 2, high / 4);
  rect(squareX - high / 3, squareY - high / 3, houseDistance / 2, high / 4);

  // Door
  fill(color4);
  rect(squareX - high / 9, squareY + high / 6, houseDistance / 2, high / 3);

  // Doorknob
  fill(color1);
  circle(squareX + high / 10, squareY + high / 3, wide / 25);
}
""",

    "studentGaidanovFlowerBrain.js": """/**
 * @id studentGaidanovFlowerBrain
 * @title Popping Meadow Flower (Andrada Gaidanov)
 * @category 2022 NeuroArt Class Gallery
 * @order 7
 *
 * Student NeuroArt Project by Andrada Gaidanov.
 * Random flowers bloom across a green meadow with petal size and color driven by Alpha and Theta waves.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(2);
}

function draw() {
  background(144, 238, 144);
  let flowerX = random(80, width - 80);
  let flowerY = random(80, height - 80);
  let petalSize = 20 + eegData.getChannelBand('alpha', 1) * 140;
  let petalDistance = petalSize * 0.7;

  stroke(0);
  strokeWeight(1.5);
  fill(eegData.getChannelBand('alpha', 2) * 255, 0, eegData.getChannelBand('theta', 3) * 255);

  // 4 outer petals
  circle(flowerX - petalDistance, flowerY - petalDistance, petalSize);
  circle(flowerX + petalDistance, flowerY - petalDistance, petalSize);
  circle(flowerX - petalDistance, flowerY + petalDistance, petalSize);
  circle(flowerX + petalDistance, flowerY + petalDistance, petalSize);

  // Center petal
  fill(218, 165, 32);
  circle(flowerX, flowerY, petalSize);
}
""",

    "studentGrimesNeuroartFinal.js": """/**
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
""",

    "studentHomeakFinalProject.js": """/**
 * @id studentHomeakFinalProject
 * @title Five Band Circles (Kira Homeak)
 * @category 2022 NeuroArt Class Gallery
 * @order 9
 *
 * Student NeuroArt Project by Kira Homeak.
 * Five labeled circles arranged in a quincunx that change size and color with each EEG frequency band.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(30);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 2) * 600;
  let THETA = eegData.getChannelBand('theta', 1) * 600;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 600;
  let BETA  = eegData.getChannelBand('beta', 0) * 600;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 600;

  background(255, 255, 200);
  stroke(2);
  textSize(16);

  fill(ALPHA / 2, 50, 50);
  circle(width / 4, height / 4, ALPHA / 4);
  fill(0);
  text('alpha', width / 4 - 25, height / 4);

  fill(50, BETA / 2, 50);
  circle(width - width / 4, height / 4, BETA / 4);
  fill(0);
  text('beta', width - width / 4 - 25, height / 4);

  fill(50, 50, THETA / 2);
  circle(width / 4, height - height / 4, THETA / 4);
  fill(0);
  text('theta', width / 4 - 25, height - height / 4);

  fill(GAMMA / 2, 50, GAMMA / 2);
  ellipse(width - width / 4, height - height / 4, GAMMA / 4);
  fill(0);
  text('gamma', width - width / 4 - 25, height - height / 4);

  fill(DELTA / 2, DELTA / 2, 50);
  ellipse(width / 2, height / 2, DELTA / 4);
  fill(0);
  text('delta', width / 2 - 20, height / 2);
}
""",

    "studentHosseiniLostMyMind.js": """/**
 * @id studentHosseiniLostMyMind
 * @title Lost My Mind Wave Grid (Rastin Hosseini)
 * @category 2022 NeuroArt Class Gallery
 * @order 10
 *
 * Student NeuroArt Project by Rastin Hosseini.
 * Swirling grid of oscillators whose size responds to Alpha waves and angle responds to mouse position.
 */
let t = 0;

function setup() {
  colorMode(RGB, 255);
  background(250, random(50), 250);
  frameRate(30);
}

function draw() {
  let THETA = eegData.getChannelBand('theta', 3) * 4;
  let ALPHA = 1 + eegData.getChannelBand('alpha', 0) * 6;

  background(250, 30, 250, 25);
  fill(120, THETA * 60, 180);
  stroke(0, 60);

  let mx = mouseX || width / 2;
  let my = mouseY || height / 2;

  for (let x = ALPHA; x <= width; x = x + 30) {
    for (let y = 0; y <= height; y = y + 30) {
      const xAngle = map(mx, 0, width, -4 * (22 / 7), 4 * (22 / 7), true);
      const yAngle = map(my, 0, height, -4 * (22 / 7), 4 * (22 / 7), true);
      const angle = xAngle * (x / width) + yAngle * (y / height);

      const myX = x + 20 * cos(2 * (22 / 7) * t + angle);
      const myY = y + 20 * sin(2 * (22 / 7) * t + angle);

      ellipse(myX, myY, ALPHA * 4);
    }
  }
  t = t + 0.015;
}
""",

    "studentJayaswalFinal.js": """/**
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
""",

    "studentKhamvongsaBikeRace.js": """/**
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
""",

    "studentLeeBrainArts.js": """/**
 * @id studentLeeBrainArts
 * @title BrainArts Band Ribbon (JB Lee)
 * @category 2022 NeuroArt Class Gallery
 * @order 13
 *
 * Student NeuroArt Project by JB Lee.
 * Horizontal ribbon of 5 frequency-band circles that trail the mouse cursor. Click to clear.
 */
function setup() {
  colorMode(RGB, 255);
  background(200, 200, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let DELTA = eegData.getChannelBand('delta', 0) * 60;
  let THETA = eegData.getChannelBand('theta', 0) * 60;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 60;
  let BETA  = eegData.getChannelBand('beta', 0) * 60;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 60;

  stroke(0);
  textSize(12);

  fill(255, 40, 100);
  ellipse(MOUSEX, MOUSEY, DELTA / 2);
  text("Delta", MOUSEX, MOUSEY + DELTA);

  fill(20, 200, 255);
  ellipse(MOUSEX + 120, MOUSEY, THETA);
  text("Theta", MOUSEX + 120, MOUSEY + THETA);

  fill(40, 30, 200);
  ellipse(MOUSEX - 120, MOUSEY, ALPHA);
  text("Alpha", MOUSEX - 120, MOUSEY + ALPHA);

  fill(150, 255, 200);
  ellipse(MOUSEX - 60, MOUSEY, BETA);
  text("Beta", MOUSEX - 60, MOUSEY + BETA);

  fill(255, 255, 0);
  ellipse(MOUSEX + 60, MOUSEY, GAMMA);
  text("Gamma", MOUSEX + 60, MOUSEY + GAMMA);
}

function mouseClicked() {
  background(200, 200, 200);
}
""",

    "studentLocherFinalProject.js": """/**
 * @id studentLocherFinalProject
 * @title Gyroscope Rings 3D (Megan Locher)
 * @category 2022 NeuroArt Class Gallery
 * @order 14
 *
 * Student NeuroArt Project by Megan Locher.
 * Nested 3D WEBGL torus rings and central sphere colored by Alpha, Delta, Theta, and Gamma waves.
 */
function setup() {
  createCanvas(width, height, WEBGL);
}

function draw() {
  let DELTA = eegData.getChannelBand('delta', 0) * 20;
  let THETA = eegData.getChannelBand('theta', 0) * 20;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 20;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 20;

  background(125);
  noStroke();

  // First ring
  rotateZ(frameCount * 0.02);
  rotateY(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  fill(ALPHA * 12, 135, 107);
  torus(200, 7);

  // Second ring
  rotateY(frameCount * 0.02);
  rotateZ(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  fill(DELTA * 12, 85, 190);
  torus(100, 7);

  // Third ring
  rotateZ(frameCount * 0.015);
  rotateY(frameCount * 0.015);
  rotateX(frameCount * 0.015);
  fill(20, THETA * 17, 255);
  torus(150, 7);

  // Fourth ring
  rotateZ(frameCount * 0.001);
  rotateY(frameCount * 0.002);
  rotateX(frameCount * 0.001);
  fill(255);
  torus(180, 7);

  // Center sphere
  fill(140, 120, GAMMA * 12);
  sphere(30);
}
""",

    "studentMallickColouredBallMap.js": """/**
 * @id studentMallickColouredBallMap
 * @title Coloured Ball Map (Roy Mallick)
 * @category 2022 NeuroArt Class Gallery
 * @order 15
 *
 * Student NeuroArt Project by Roy Mallick.
 * Uses the power of 4 electrodes and brainwaves to paint a bubbly bubblegum map of brain activity.
 */
function setup() {
  colorMode(RGB, 255);
  background(0);
  frameRate(5);
  noStroke();
}

function draw() {
  let ONE   = eegData.getChannelBand('alpha', 0) * 45;
  let TWO   = eegData.getChannelBand('theta', 1) * 45;
  let THREE = eegData.getChannelBand('delta', 2) * 45;
  let FOUR  = eegData.getChannelBand('beta', 3) * 45;

  let OneMap   = map(ONE, 0, 40, 0, 255, true);
  let TwoMap   = map(TWO, 0, 40, 0, width, true);
  let ThreeMap = map(THREE, 0, 40, 0, height, true);
  let FourMap  = map(FOUR, 0, 40, 50, 250, true);

  fill(OneMap, 0, 255, 200);
  ellipse(TwoMap, ThreeMap, FourMap);
}

function mousePressed() {
  background(0);
}
""",

    "studentMazidiAnimation.js": """/**
 * @id studentMazidiAnimation
 * @title Stay Calm Smiley (Shafa Mazidi)
 * @category 2022 NeuroArt Class Gallery
 * @order 16
 *
 * Student NeuroArt Project by Shafa Mazidi.
 * Keep your Beta waves lower than your Delta waves to stay calm—otherwise his head inflates and explodes!
 */
let headwidth = 150;

function setup() {
  colorMode(RGB, 255);
  rectMode(CENTER);
  frameRate(15);
  headwidth = 150;
}

function draw() {
  push();
  translate((width - 400) / 2, (height - 400) / 2);

  let center = 200;
  let eyeX = center - 400 / 6;
  let eyeY = center - 400 / 6;

  background('black');

  fill('yellow');
  circle(center, center, headwidth);
  headwidth = headwidth + (eegData.getChannelBand('beta', 1) - eegData.getChannelBand('delta', 1) * 0.85) * 6;

  if (headwidth >= 151) {
    frameRate(15);
  }

  // Mouth
  fill('black');
  circle(center, center + 20, 100);

  // Mouth cover
  noStroke();
  fill('yellow');
  rect(center, 169, 210, 150);

  // Text
  fill(61, 142, 224);
  textSize(18);
  text('Stay calm, otherwise he might explode!', 30, 22);

  // Left & right eyes
  fill(random(0, 256), random(0, 256), random(0, 256));
  circle(134, eyeY, 20);
  circle(eyeX + 400 * 0.34, eyeY, 20);

  if (headwidth < 151) {
    headwidth = 150;
  }

  if (headwidth >= 283) {
    fill(209, 21, 21);
    rect(center, 200, 400, 400);
    fill(0, 0, 0);
    textSize(46);
    text('GameOver :(', 65, 200);
    headwidth = 150;
  }
  pop();
}
""",

    "studentNnanmaniFinalSketch.js": """/**
 * @id studentNnanmaniFinalSketch
 * @title Bullseye Alpha Target (Pearl Nnanmani)
 * @category 2022 NeuroArt Class Gallery
 * @order 17
 *
 * Student NeuroArt Project by Pearl Nnanmani.
 * Concentric target rings follow the mouse while Theta controls ring shade and Alpha scales the text.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(255, 20, 250);

  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let ALPHA = 12 + eegData.getChannelBand('alpha', 0) * 90;
  let theta = eegData.getChannelBand('theta', 1) * 10;
  let thisHeight = 200;
  let alphaShade = map(theta, 0, 10, 0, 255);

  stroke(0);
  fill(alphaShade, 10, 10);
  ellipse(MOUSEX, MOUSEY, thisHeight);
  fill(200, 0, 180);
  ellipse(MOUSEX, MOUSEY, thisHeight / 2);
  fill(0, 90, 180);
  ellipse(MOUSEX, MOUSEY, thisHeight / 4);

  textSize(ALPHA);
  fill(0, 0, 180);
  text('Alpha', MOUSEX + 30, MOUSEY);
}
""",

    "studentPilzSnakeDance.js": """/**
 * @id studentPilzSnakeDance
 * @title Snake Charmer Dance (Pilz)
 * @category 2022 NeuroArt Class Gallery
 * @order 18
 *
 * Student NeuroArt Project by Pilz.
 * Five colorful cobras dance out of their baskets to a charmer's flute, stretching with each EEG band!
 */
let displayNotesArray = [];
let deltaSnake, thetaSnake, alphaSnake, betaSnake, gammaSnake;

class Snake {
  constructor(x, y, length, w, colorset) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = w;
    this.colorset = colorset;
  }

  setSnakeLength(length) {
    this.length = max(10, length);
  }

  drawSnakeBody() {
    if (this.length <= 0) return;

    // Outer snake body
    fill(this.colorset[0][0], this.colorset[0][1], this.colorset[0][2]);
    beginShape();
    let quarter = this.length / 4;
    let halfw = this.width / 2;
    curveVertex(this.x - halfw, this.y);
    curveVertex(this.x - halfw, this.y);
    curveVertex(this.x - 5 - halfw, this.y - quarter);
    curveVertex(this.x - halfw, this.y - 2 * quarter);
    curveVertex(this.x + 5 - halfw, this.y - 3 * quarter);
    curveVertex(this.x - halfw, this.y - this.length);
    curveVertex(this.x + halfw, this.y - this.length);
    curveVertex(this.x + 5 + halfw, this.y - 3 * quarter);
    curveVertex(this.x + halfw, this.y - 2 * quarter);
    curveVertex(this.x - 5 + halfw, this.y - quarter);
    curveVertex(this.x + halfw, this.y);
    curveVertex(this.x - halfw, this.y);
    endShape();

    // Inner snake body
    fill(this.colorset[1][0], this.colorset[1][1], this.colorset[1][2]);
    beginShape();
    let thirdw = this.width / 4;
    curveVertex(this.x - thirdw, this.y);
    curveVertex(this.x - thirdw, this.y);
    curveVertex(this.x - 5 - thirdw, this.y - quarter);
    curveVertex(this.x - thirdw, this.y - 2 * quarter);
    curveVertex(this.x + 5 - thirdw, this.y - 3 * quarter);
    curveVertex(this.x - thirdw, this.y - this.length);
    curveVertex(this.x + thirdw, this.y - this.length);
    curveVertex(this.x + 5 + thirdw, this.y - 3 * quarter);
    curveVertex(this.x + thirdw, this.y - 2 * quarter);
    curveVertex(this.x - 5 + thirdw, this.y - quarter);
    curveVertex(this.x + thirdw, this.y);
    curveVertex(this.x - thirdw, this.y);
    endShape();
  }

  drawSnake() {
    // Tail
    fill(this.colorset[0][0], this.colorset[0][1], this.colorset[0][2]);
    beginShape();
    curveVertex(this.x, this.y);
    curveVertex(this.x, this.y);
    curveVertex(this.x + 10, this.y - 10);
    curveVertex(this.x + 35, this.y - 20);
    curveVertex(this.x + 55, this.y - 30);
    curveVertex(this.x + 45, this.y - 60);
    curveVertex(this.x + 65, this.y - 25);
    curveVertex(this.x + 50, this.y - 15);
    curveVertex(this.x + 10, this.y - 5);
    curveVertex(this.x, this.y);
    curveVertex(this.x, this.y);
    endShape();

    // Body coil
    fill(this.colorset[1][0], this.colorset[1][1], this.colorset[1][2]);
    ellipse(this.x, this.y, 100, 20);
    fill(this.colorset[0][0], this.colorset[0][1], this.colorset[0][2]);
    ellipse(this.x, this.y - 10, 90, 20);

    // Back of head
    fill(this.colorset[1][0], this.colorset[1][1], this.colorset[1][2]);
    circle(this.x, this.y - this.length - 12, 15);
    ellipse(this.x, this.y - this.length + 5, 30, 10);
    ellipse(this.x - 7, this.y - this.length - 10, 20, 40);
    ellipse(this.x + 7, this.y - this.length - 10, 20, 40);

    // Eyes
    fill('white');
    ellipse(this.x - 7, this.y - this.length - 10, 10, 25);
    ellipse(this.x + 7, this.y - this.length - 10, 10, 25);
    fill('black');
    circle(this.x - 7, this.y - this.length - 12, 3);
    circle(this.x + 7, this.y - this.length - 12, 3);
    fill('white');
    circle(this.x - 8, this.y - this.length - 12, 1);
    circle(this.x + 8, this.y - this.length - 12, 1);

    // Mouth & tongue
    fill(this.colorset[2][0], this.colorset[2][1], this.colorset[2][2]);
    ellipse(this.x, this.y - this.length, 30, 15);
    circle(this.x - 15, this.y - this.length, 7);
    circle(this.x + 15, this.y - this.length, 7);

    fill('red');
    rect(this.x - 2, this.y - this.length + 2, 4, 10);
    triangle(this.x - 2, this.y - this.length + 12, this.x - 1, this.y - this.length + 18, this.x, this.y - this.length + 12);
    triangle(this.x + 2, this.y - this.length + 12, this.x + 1, this.y - this.length + 18, this.x, this.y - this.length + 12);

    // Mouth line
    noFill();
    stroke(0);
    beginShape();
    curveVertex(this.x - 18, this.y - this.length);
    curveVertex(this.x - 18, this.y - this.length);
    curveVertex(this.x - 13, this.y - this.length + 5);
    curveVertex(this.x, this.y - this.length + 2);
    curveVertex(this.x + 13, this.y - this.length + 5);
    curveVertex(this.x + 18, this.y - this.length);
    curveVertex(this.x + 18, this.y - this.length);
    endShape();

    // Nostrils
    noStroke();
    fill('black');
    ellipse(this.x - 5, this.y - this.length - 2, 3, 5);
    ellipse(this.x + 5, this.y - this.length - 2, 3, 5);
  }
}

class MusicNote {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.color = col;
  }
  drawNote() {
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.x, this.y, 10, 5);
    rect(this.x + 2, this.y - 15, 2, 15);
    rect(this.x + 2, this.y - 15, 15, 5);
    rect(this.x + 17, this.y - 15, 2, 15);
    ellipse(this.x + 14, this.y, 10, 5);
  }
  moveNote() {
    this.x = this.x + 3;
  }
}

function setup() {
  colorMode(RGB, 255);
  frameRate(15);

  let colorSet1 = [[214, 41, 0], [150, 39, 12], [250, 93, 55]];
  let colorSet2 = [[255, 155, 85], [232, 130, 58], [255, 191, 145]];
  let colorSet3 = [[232, 223, 216], [207, 191, 180], [245, 238, 233]];
  let colorSet4 = [[212, 97, 166], [173, 62, 129], [227, 118, 184]];
  let colorSet5 = [[165, 0, 98], [112, 0, 67], [214, 9, 131]];

  displayNotesArray = [];
  deltaSnake = new Snake(100, 420, 150, 20, colorSet1);
  thetaSnake = new Snake(200, 420, 150, 30, colorSet2);
  alphaSnake = new Snake(300, 420, 150, 10, colorSet3);
  betaSnake  = new Snake(400, 420, 150, 40, colorSet4);
  gammaSnake = new Snake(500, 420, 150, 15, colorSet5);
}

function draw() {
  background(242, 227, 179);

  push();
  scale(width / 600, height / 600);

  let DELTA = eegData.getChannelBand('delta', 0) * 65;
  let THETA = eegData.getChannelBand('theta', 0) * 65;
  let ALPHA = eegData.getChannelBand('alpha', 0) * 65;
  let BETA  = eegData.getChannelBand('beta', 0) * 65;
  let GAMMA = eegData.getChannelBand('gamma', 0) * 65;

  deltaSnake.setSnakeLength(DELTA * 5);
  thetaSnake.setSnakeLength(THETA * 5);
  alphaSnake.setSnakeLength(ALPHA * 5);
  betaSnake.setSnakeLength(BETA * 5);
  gammaSnake.setSnakeLength(GAMMA * 5);

  deltaSnake.drawSnakeBody(); deltaSnake.drawSnake();
  thetaSnake.drawSnakeBody(); thetaSnake.drawSnake();
  alphaSnake.drawSnakeBody(); alphaSnake.drawSnake();
  betaSnake.drawSnakeBody();  betaSnake.drawSnake();
  gammaSnake.drawSnakeBody(); gammaSnake.drawSnake();

  textSize(20);
  fill(214, 41, 0);    text('DELTA', 65, 470);
  fill(255, 155, 85);  text('THETA', 165, 470);
  fill(255);           text('ALPHA', 270, 470);
  fill(212, 97, 166);  text('BETA', 375, 470);
  fill(165, 0, 98);    text('GAMMA', 460, 470);

  // Flute
  let fluteLength = 450;
  let fluteColorSet = [[150, 39, 12], [232, 130, 58], [207, 191, 180], [173, 62, 129], [112, 0, 67]];
  fill(232, 208, 142); rect(0, 40, fluteLength, 40);
  fill(242, 218, 153); rect(0, 40, 450, 20);
  for (let i = 0; i < 5; i++) {
    fill(224, 185, 121);
    ellipse(fluteLength / 6 + (i / 6) * fluteLength, 50, 30, 15);
    fill(fluteColorSet[i][0], fluteColorSet[i][1], fluteColorSet[i][2]);
    ellipse(fluteLength / 6 + (i / 6) * fluteLength, 52, 25, 10);
  }
  fill(224, 185, 121); circle(450, 60, 20);
  fill(128, 100, 56);  circle(450, 60, 15);

  if (DELTA * 5 >= 200) displayNotesArray.push(new MusicNote(450, 70, [214, 41, 0]));
  if (THETA * 5 >= 200) displayNotesArray.push(new MusicNote(450, 85, [255, 155, 85]));
  if (ALPHA * 5 >= 200) displayNotesArray.push(new MusicNote(450, 100, [255, 255, 255]));
  if (BETA * 5 >= 200)  displayNotesArray.push(new MusicNote(450, 115, [212, 97, 166]));
  if (GAMMA * 5 >= 200) displayNotesArray.push(new MusicNote(450, 130, [165, 0, 98]));

  for (let i = displayNotesArray.length - 1; i >= 0; i--) {
    displayNotesArray[i].drawNote();
    displayNotesArray[i].moveNote();
    if (displayNotesArray[i].x > 620) displayNotesArray.splice(i, 1);
  }
  pop();
}
""",

    "studentPriorRainbowPotOfGold.js": """/**
 * @id studentPriorRainbowPotOfGold
 * @title Rainbow & Pot of Gold (Andrea Prior)
 * @category 2022 NeuroArt Class Gallery
 * @order 19
 *
 * Student NeuroArt Project by Andrea Prior.
 * A bright rainbow over a pot of gold with a sun whose rays grow with Right Frontal Alpha power.
 */
let value = 0;

function setup() {
  colorMode(RGB, 255);
  value = 0;
}

function draw() {
  background(0, 255, 255);

  let MOUSEX = mouseX || width / 3;
  let RIGHTALPHA = 20 + eegData.getChannelBand('alpha', 2) * 140;

  stroke(0);
  // Sun
  fill(255, 230, 0);
  ellipse(MOUSEX + 100, 60, RIGHTALPHA);

  // Rainbow colors
  fill(255, 0, 0);
  ellipse(width / 2, height / 2, width / 1.1, height / 1.2);
  fill(255, 165, 0);
  ellipse(width / 1.9, height / 1.9, width / 1.2, height / 1.3);
  fill(250, 220, 30);
  ellipse(width / 1.8, height / 1.8, width / 1.3, height / 1.4);
  fill(0, 255, 0);
  ellipse(width / 1.7, height / 1.7, width / 1.4, height / 1.5);
  fill(0, 0, 200);
  ellipse(width / 1.6, height / 1.6, width / 1.5, height / 1.6);
  fill(150, 0, 200);
  ellipse(width / 1.5, height / 1.5, width / 1.6, height / 1.7);
  fill(0, 255, 255);
  ellipse(width / 1.4, height / 1.4, width / 1.7, height / 1.8);

  // Pot of gold
  fill(0, 0, 0);
  square(width / 1.16, height / 1.9, 100, 20);

  // Grass
  fill(30, 140, 30);
  rect(0, height / 1.5, width, height);
}

function mouseClicked() {
  value = value === 0 ? 255 : 0;
}
""",

    "studentRennieFinalRobot.js": """/**
 * @id studentRennieFinalRobot
 * @title Smiling EEG Robot (Victoria Rennie)
 * @category 2022 NeuroArt Class Gallery
 * @order 20
 *
 * Student NeuroArt Project by Victoria Rennie.
 * Robot pupils track your mouse! Hold the mouse button to make the robot smile and color the background with Alpha & Theta.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(15);
}

function draw() {
  let alpha = eegData.getChannelBand('alpha', 1) * 255;
  let theta = eegData.getChannelBand('theta', 3) * 255;

  if (mouseIsPressed) {
    background(alpha, theta, 100);
  } else {
    background(128, 128, 128);
  }

  let s = min(width, height);
  push();
  translate((width - s) / 2, (height - s) / 2);

  // Face
  stroke(0);
  strokeWeight(10);
  fill(112, 212, 255);
  square(s * 0.1, s * 0.1, s * 0.8);

  // Inner eyes
  fill(247, 201, 74);
  circle(s * 0.35, s * 0.375, s * 0.16);
  circle(s * 0.65, s * 0.375, s * 0.16);

  // Pupils
  fill(0, 0, 0);
  let px = constrain((mouseX - width / 2) * 0.08, -s * 0.04, s * 0.04);
  let py = constrain((mouseY - height / 2) * 0.08, -s * 0.04, s * 0.04);
  circle(s * 0.35 + px, s * 0.375 + py, s * 0.025);
  circle(s * 0.65 + px, s * 0.375 + py, s * 0.025);

  // Smile
  noFill();
  if (mouseIsPressed) {
    arc(s / 2, s * 0.65, s * 0.15, s * 0.15, 0.1 * PI, 0.9 * PI);
  } else {
    arc(s / 2, s * 0.7, s * 0.15, s * 0.15, PI, 2 * PI);
  }

  // Ears
  fill(247, 201, 74);
  rect(s * 0.05, s * 0.3, s * 0.05, s / 3);
  rect(s * 0.9, s * 0.3, s * 0.05, s / 3);

  // Antennae
  strokeWeight(5);
  line(s / 2, s * 0.1, s * 0.45, s * 0.05);
  line(s / 2, s * 0.1, s * 0.55, s * 0.05);
  circle(s * 0.45, s * 0.05, 10);
  circle(s * 0.55, s * 0.05, 10);
  pop();
}
""",

    "studentRyuTrippyFlower.js": """/**
 * @id studentRyuTrippyFlower
 * @title Trippy Pulsing Flower (Nayoung Ryu)
 * @category 2022 NeuroArt Class Gallery
 * @order 21
 *
 * Student NeuroArt Project by Nayoung Ryu.
 * Funky layered flower that pulses and blooms with changes in Alpha power.
 */
function setup() {
  colorMode(RGB, 255);
  background(105, 118, 67);
  noStroke();
}

function draw() {
  let ALPHA = max(0.35, eegData.getChannelBand('alpha', 0) * 3.5);

  function drawFlower(flowerX, flowerY, flowerSize) {
    flowerSize = flowerSize / ALPHA;

    // Light green leaves
    push();
    fill(184, 178, 100, 5);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 12; i++) {
      ellipse(0, flowerSize, flowerSize, flowerSize * 3);
      rotate(PI / 6);
    }
    pop();

    // Lighter petals
    push();
    fill(247, 230, 228, 10);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 16; i++) {
      ellipse(0, flowerSize, flowerSize / 3, flowerSize);
      rotate(PI / 8);
    }
    pop();

    // Darker petals
    push();
    fill(245, 168, 168, 5);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 10; i++) {
      ellipse(0, flowerSize, flowerSize / 3, flowerSize);
      rotate(PI / 4);
    }
    pop();

    // Flower centers
    fill(211, 228, 176, 5);
    circle(flowerX, flowerY, flowerSize / 2);

    fill(209, 124, 124, 50);
    circle(flowerX, flowerY, flowerSize / 4);
  }

  drawFlower(width / 2, height / 2, 100);
}

function mousePressed() {
  background(105, 118, 67);
}
""",

    "studentSchulzMySketch.js": """/**
 * @id studentSchulzMySketch
 * @title Minimalist Alpha-Gamma Circle (Schulz)
 * @category 2022 NeuroArt Class Gallery
 * @order 22
 *
 * Student NeuroArt Project by Schulz.
 * Maps Alpha to X position, Gamma to Y position, and Beta to circle diameter.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(50);

  let ALPHA = eegData.getChannelBand('alpha', 0) * width;
  let GAMMA = eegData.getChannelBand('gamma', 0) * height;
  let BETA  = 20 + eegData.getChannelBand('beta', 0) * 180;

  fill(255);
  stroke(0);
  circle(ALPHA, GAMMA, BETA);
}
""",

    "studentSimonBrainTyphoon.js": """/**
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
""",

    "studentStonehouseColouredDataGraphs.js": """/**
 * @id studentStonehouseColouredDataGraphs
 * @title 4-Electrode Band Bar Graph (Grace Stonehouse)
 * @category 2022 NeuroArt Class Gallery
 * @order 24
 *
 * Student NeuroArt Project by Grace Stonehouse.
 * Displays all 20 band-by-electrode power values (5 bands x 4 Muse electrodes) with a color-coded legend.
 */
function setup() {
  colorMode(RGB, 255);
}

function draw() {
  background(0);

  push();
  scale(width / 500, height / 700);

  let bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  let eColors = [
    [0, 0, 255],
    [0, 255, 0],
    [255, 0, 0],
    [255, 255, 0]
  ];

  stroke(0);
  strokeWeight(1);

  for (let b = 0; b < 5; b++) {
    for (let ch = 0; ch < 4; ch++) {
      let val = eegData.getChannelBand(bands[b], ch) * 480;
      fill(eColors[ch][0], eColors[ch][1], eColors[ch][2]);
      rect(b * 100 + ch * 25, 0, 25, val);
    }
  }

  // Grid lines
  strokeWeight(2);
  stroke(255);
  line(100, 0, 100, 550);
  line(200, 0, 200, 550);
  line(300, 0, 300, 550);
  line(400, 0, 400, 550);
  line(0, 550, 500, 550);

  // Band Labels
  stroke(0);
  fill(255);
  textSize(14);
  text('DELTA', 25, 520);
  text('THETA', 125, 520);
  text('ALPHA', 225, 520);
  text('BETA', 325, 520);
  text('GAMMA', 425, 520);

  // Legend
  let labels = ['ELECTRODE 0 (TP9)', 'ELECTRODE 1 (AF7)', 'ELECTRODE 2 (AF8)', 'ELECTRODE 3 (TP10)'];
  for (let ch = 0; ch < 4; ch++) {
    fill(eColors[ch][0], eColors[ch][1], eColors[ch][2]);
    rect(25, 565 + ch * 35, 15, 15);
    text(labels[ch], 60, 578 + ch * 35);
  }
  pop();
}
""",

    "studentThunderchildFlowerDrawing.js": """/**
 * @id studentThunderchildFlowerDrawing
 * @title Orange Flower Brush (Thunderchild)
 * @category 2022 NeuroArt Class Gallery
 * @order 25
 *
 * Student NeuroArt Project by Thunderchild.
 * Paints multi-petal orange and red flowers across the canvas sized by Left and Right Alpha waves.
 */
function setup() {
  colorMode(RGB, 255);
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 1.5;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 1.5;

  function drawCircle(r, g, b, x, y, d) {
    stroke(0);
    fill(r, g, b);
    ellipse(x, y, d);
  }

  drawCircle(255, 0, 0, MOUSEX, MOUSEY, RIGHTALPHA * 50);
  drawCircle(255, 128, 0, MOUSEX / 1.25, MOUSEY / 1.25, RIGHTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 95, MOUSEY - 20, LEFTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 40, MOUSEY + 40, LEFTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX - 30, MOUSEY + 50, RIGHTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 35, MOUSEY - 35, LEFTALPHA * 35);
}

function mousePressed() {
  background(255, 255, 200);
}
""",

    "studentVillaflorTerrain3D.js": """/**
 * @id studentVillaflorTerrain3D
 * @title 3D Perlin Terrain (Lance Villaflor)
 * @category 2022 NeuroArt Class Gallery
 * @order 26
 *
 * Student NeuroArt Project by Lance Villaflor (PSYCO 403 Final Project).
 * 3D WEBGL Perlin-noise terrain flyover whose horizon depth is modulated by Delta EEG activity.
 */
let cols = 70;
let rows = 35;
let scl = 20;
let w = 1400;
let h = 700;
let color_Codes = ["#4f5bdb", "#66cdaa", "#00a4b2", "#be149a"];
let flying = 0;
let terrain = [];

function setup() {
  createCanvas(width, height, WEBGL);
  cols = w / scl;
  rows = h / scl;
  terrain = [];
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0;
    }
  }
}

function draw() {
  let DELTA = constrain(floor(8 + eegData.getChannelBand('delta', 0) * (rows - 8)), 6, rows);

  flying -= 0.1;
  let yoff = flying;
  for (let y = 0; y < DELTA; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xoff, yoff), 0, 1, -100, 100);
      xoff += 0.2;
    }
    yoff += 0.2;
  }

  background("black");
  translate(0, 50);
  rotateX(PI / 3);
  let random_Color = floor(random(color_Codes.length));
  fill(color_Codes[random_Color]);
  stroke(20);

  translate(-w / 2, -h / 2);
  for (let y = 0; y < DELTA - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
}
"""
}


def main():
    for filename, content in SKETCHES.items():
        path = EXAMPLES_DIR / filename
        path.write_text(content.lstrip(), encoding="utf-8")
        print(f"Wrote {path.name}")


if __name__ == "__main__":
    main()
