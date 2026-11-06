/**
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
