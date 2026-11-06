/**
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
