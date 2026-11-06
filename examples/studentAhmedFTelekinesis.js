/**
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
