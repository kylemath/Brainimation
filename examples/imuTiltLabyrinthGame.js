/**
 * @id imuTiltLabyrinthGame
 * @title 🎮 Head-Tilt Neon Labyrinth (IMU Balance Game)
 * @category Motion, IMU & Broadcast Sensors
 * @order 8
 */

// 🎮 Head-Tilt Neon Labyrinth Game (IMU Pitch/Roll Gravity + EEG Focus Boost)
// Tilt your head (or use Simulate Data / Mouse fallback) to roll the glowing plasma
// orb through the neon labyrinth, collect quantum stars, and avoid vortex hazards!
//   - Head Roll (`eegData.roll`): Tilts the board left / right
//   - Head Pitch (`eegData.pitch`): Tilts the board forward / backward
//   - EEG Meditation (`eegData.meditation`): Stabilizes ball damping (smooth control)
//   - EEG Attention (`eegData.attention`): Activates magnetic star pull radius!

let ball = { x: 0, y: 0, vx: 0, vy: 0, r: 11, trail: [] };
let walls = [];
let holes = [];
let targetOrb = { x: 0, y: 0, r: 14 };
let score = 0;
let streak = 0;
let flashMsg = '';
let flashTimer = 0;
let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  initBoard();
}

function initBoard() {
  ball.x = width * 0.16;
  ball.y = height * 0.24;
  ball.vx = 0;
  ball.vy = 0;
  ball.trail = [];
  rebuildMazeGeometry();
  spawnTargetOrb();
}

function rebuildMazeGeometry() {
  let bx = 28, by = 60, bw = width - 56, bh = height - 76;
  walls = [
    { x: bx + bw * 0.26, y: by, w: 12, h: bh * 0.62 },
    { x: bx + bw * 0.52, y: by + bh * 0.38, w: 12, h: bh * 0.62 },
    { x: bx + bw * 0.75, y: by + bh * 0.18, w: 12, h: bh * 0.58 },
    { x: bx + bw * 0.26, y: by + bh * 0.62, w: bw * 0.14, h: 12 }
  ];
  holes = [
    { x: bx + bw * 0.18, y: by + bh * 0.78, r: 15 },
    { x: bx + bw * 0.40, y: by + bh * 0.22, r: 15 },
    { x: bx + bw * 0.64, y: by + bh * 0.75, r: 15 },
    { x: bx + bw * 0.88, y: by + bh * 0.32, r: 15 }
  ];
}

function spawnTargetOrb() {
  let bx = 50, by = 82, bw = width - 100, bh = height - 120;
  for (let tries = 0; tries < 40; tries++) {
    let tx = random(bx, bx + bw);
    let ty = random(by, by + bh);
    let ok = dist(tx, ty, ball.x, ball.y) > 90;
    for (let w of walls) {
      if (tx > w.x - 24 && tx < w.x + w.w + 24 && ty > w.y - 24 && ty < w.y + w.h + 24) ok = false;
    }
    for (let h of holes) {
      if (dist(tx, ty, h.x, h.y) < h.r + 32) ok = false;
    }
    if (ok) {
      targetOrb.x = tx;
      targetOrb.y = ty;
      return;
    }
  }
  targetOrb.x = width * 0.85;
  targetOrb.y = height * 0.80;
}

function draw() {
  background(10, 14, 24);
  simT += 0.03;
  rebuildMazeGeometry();

  // Read tilt angles from IMU or fallback
  let pitch = 0, roll = 0, att = 0.5, med = 0.5;
  if (eegData && eegData.connected) {
    pitch = eegData.pitch || 0;
    roll = eegData.roll || 0;
    att = eegData.attention || 0.5;
    med = eegData.meditation || 0.5;
  } else if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    roll = map(mouseX, 0, width, -25, 25);
    pitch = map(mouseY, height, 0, -25, 25);
  } else {
    // Autonomous demo driver steers toward targetOrb
    roll = constrain((targetOrb.x - ball.x) * 0.12, -22, 22);
    pitch = constrain((ball.y - targetOrb.y) * 0.12, -22, 22);
  }

  // Physics update
  let gx = sin(radians(constrain(roll, -45, 45))) * 0.42;
  let gy = -sin(radians(constrain(pitch, -45, 45))) * 0.42;
  ball.vx += gx;
  ball.vy += gy;

  // Attention magnetic star pull
  let dTarget = dist(ball.x, ball.y, targetOrb.x, targetOrb.y);
  let magnetRadius = 45 + att * 85;
  if (dTarget < magnetRadius && dTarget > 1) {
    ball.vx += ((targetOrb.x - ball.x) / dTarget) * (0.22 * att);
    ball.vy += ((targetOrb.y - ball.y) / dTarget) * (0.22 * att);
  }

  // Meditation improves stability / damping
  let damping = map(med, 0, 1, 0.975, 0.94);
  ball.vx *= damping;
  ball.vy *= damping;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Board boundary collisions
  let bx = 28, by = 60, bw = width - 56, bh = height - 76;
  if (ball.x - ball.r < bx) { ball.x = bx + ball.r; ball.vx *= -0.65; }
  if (ball.x + ball.r > bx + bw) { ball.x = bx + bw - ball.r; ball.vx *= -0.65; }
  if (ball.y - ball.r < by) { ball.y = by + ball.r; ball.vy *= -0.65; }
  if (ball.y + ball.r > by + bh) { ball.y = by + bh - ball.r; ball.vy *= -0.65; }

  // Wall collisions
  for (let w of walls) {
    let cx = constrain(ball.x, w.x, w.x + w.w);
    let cy = constrain(ball.y, w.y, w.y + w.h);
    let dx = ball.x - cx;
    let dy = ball.y - cy;
    let d = sqrt(dx * dx + dy * dy);
    if (d < ball.r && d > 0.001) {
      let nx = dx / d, ny = dy / d;
      ball.x = cx + nx * ball.r;
      ball.y = cy + ny * ball.r;
      let dot = ball.vx * nx + ball.vy * ny;
      ball.vx = (ball.vx - 1.7 * dot * nx);
      ball.vy = (ball.vy - 1.7 * dot * ny);
    }
  }

  // Check vortex hazards
  for (let h of holes) {
    if (dist(ball.x, ball.y, h.x, h.y) < h.r) {
      streak = 0;
      flashMsg = '⚠️ VORTEX HAZARD! Streak Reset';
      flashTimer = 45;
      ball.x = bx + 32;
      ball.y = by + 32;
      ball.vx = 0;
      ball.vy = 0;
      ball.trail = [];
    }
  }

  // Check star collection
  if (dTarget < ball.r + targetOrb.r) {
    score += 100 + streak * 25;
    streak++;
    flashMsg = `✨ +${100 + (streak - 1) * 25} PTS! (Streak ×${streak})`;
    flashTimer = 50;
    spawnTargetOrb();
  }

  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 28) ball.trail.shift();

  // Render labyrinth board
  drawBoard(bx, by, bw, bh, magnetRadius);
  drawHeader(pitch, roll, att, med);
}

function drawBoard(bx, by, bw, bh, magnetRadius) {
  fill(14, 20, 34);
  stroke(56, 189, 248, 180);
  strokeWeight(2.5);
  rect(bx, by, bw, bh, 10);

  // Subtle perspective grid lines
  stroke(26, 38, 62);
  strokeWeight(1);
  for (let gx = bx + 40; gx < bx + bw; gx += 40) line(gx, by, gx, by + bh);
  for (let gy = by + 40; gy < by + bh; gy += 40) line(bx, gy, bx + bw, gy);

  // Draw walls
  fill(35, 55, 92);
  stroke(96, 165, 250);
  strokeWeight(1.8);
  for (let w of walls) {
    rect(w.x, w.y, w.w, w.h, 4);
  }

  // Draw vortex hazards
  for (let h of holes) {
    noStroke();
    fill(248, 113, 113, 45);
    ellipse(h.x, h.y, h.r * 2.5, h.r * 2.5);
    fill(18, 10, 22);
    stroke(248, 113, 113);
    strokeWeight(2);
    ellipse(h.x, h.y, h.r * 2, h.r * 2);
  }

  // Draw target star orb + attention magnet ring
  noFill();
  stroke(250, 204, 21, 55);
  strokeWeight(1.2);
  ellipse(targetOrb.x, targetOrb.y, magnetRadius * 2, magnetRadius * 2);

  noStroke();
  fill(250, 204, 21, 70);
  ellipse(targetOrb.x, targetOrb.y, targetOrb.r * 3.0 + sin(simT * 4) * 6);
  fill(250, 204, 21);
  ellipse(targetOrb.x, targetOrb.y, targetOrb.r * 1.6);

  // Draw ball trail & ball
  noFill();
  for (let i = 1; i < ball.trail.length; i++) {
    let alpha = map(i, 0, ball.trail.length, 10, 180);
    stroke(52, 211, 153, alpha);
    strokeWeight(map(i, 0, ball.trail.length, 2, 8));
    line(ball.trail[i - 1].x, ball.trail[i - 1].y, ball.trail[i].x, ball.trail[i].y);
  }

  noStroke();
  fill(52, 211, 153, 80);
  ellipse(ball.x, ball.y, ball.r * 3.2);
  fill(52, 211, 153);
  ellipse(ball.x, ball.y, ball.r * 2);
  fill(255);
  ellipse(ball.x - 3, ball.y - 3, 5, 5);

  if (flashTimer > 0) {
    flashTimer--;
    fill(250, 204, 21, map(flashTimer, 0, 50, 0, 255));
    textSize(14);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(flashMsg, width * 0.5, by + 24);
  }
}

function drawHeader(pitch, roll, att, med) {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 48);
  stroke(45, 65, 100);
  line(0, 48, width, 48);

  noStroke();
  fill(52, 211, 153);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🎮 HEAD-TILT NEON LABYRINTH — TILT HEAD TO ROLL ORB, FOCUS FOR MAGNET PULL', 16, 16);

  textStyle(NORMAL);
  fill(185, 205, 235);
  textSize(11);
  text(`SCORE: ${score}   |   STREAK: ×${streak}   |   Tilt (Pitch/Roll): ${pitch.toFixed(1)}° / ${roll.toFixed(1)}°   |   Focus Magnet: ${Math.round(att * 100)}%`, 16, 35);
}
