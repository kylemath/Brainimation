/**
 * @id neurotech2025AmnaKNeuroTetris
 * @title NeuroTetris Mini-Game (Amna Khan)
 * @category 2025 Neurotech Class Catalogue
 * @order 6
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * EEG-controlled Tetris mini-game with full block collision where brainwave states steer horizontal movement and drop speed.
 */
// NeuroTetris – EEG-Controlled Mini Game (Fully Robust with Collision)
let grid = [];
let cols = 10;
let rows = 20;
let cellSize = 25;
let block = null;
let fallAccumulator = 0;
let driftAccumulator = 0; // horizontal movement accumulator

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Initialize grid
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = 0;
    }
  }
  
  spawnBlock();
}

function draw() {
  // --- BACKGROUND ---
  let bgAlpha = map(eegData.meditation, 0, 1, 0.05, 0.2);
  background(220, 30, 10, bgAlpha);
  
  // --- EEG DATA ---
  let alpha = eegData.alpha; // rotation stability
  let beta = eegData.beta; // falling speed
  let theta = eegData.theta; // horizontal drift
  let attention = eegData.attention; // optional lock
  
  // --- VERTICAL FALL ---
  let fallSpeed = map(beta, 0, 1, 0.5, 6); // cells/sec
  fallAccumulator += fallSpeed / 60;
  
  if (fallAccumulator >= 1) {
    // Target position
    let nextY = block.y + 1;
    let gridX = floor(block.x);
    let gridY = floor(nextY);
    
    // Check vertical collision
    if (gridY >= rows || grid[gridY][gridX]) {
      lockBlock(floor(block.x), floor(block.y));
      spawnBlock();
    } else {
      block.y = nextY;
    }
    
    fallAccumulator = 0;
  }
  
  // --- HORIZONTAL MOVEMENT WITH ACCUMULATOR & WRAP-AROUND ---
  let driftSpeed = map(theta, 0, 1, -5, 5); // columns/sec
  driftAccumulator += driftSpeed / 60;
  
  if (abs(driftAccumulator) >= 1) {
    let direction = driftAccumulator > 0 ? 1 : -1;
    let targetX = block.x + direction;
    
    // Wrap-around horizontally
    if (targetX < 0) targetX += cols;
    if (targetX >= cols) targetX -= cols;
    
    // Check horizontal collision at current row
    let gridY = floor(block.y);
    let gridX = floor(targetX);
    
    if (!grid[gridY][gridX]) {
      block.x = targetX;
    }
    
    driftAccumulator = 0;
  }
  
  // --- ATTENTION LOCK ---
  let gridX = floor(block.x);
  let gridY = floor(block.y);
  
  if (attention > 0.8) {
    lockBlock(gridX, gridY);
    spawnBlock();
  }
  
  // --- DRAW ---
  drawGrid();
  drawBlock(alpha);
  
  // --- HUD ---
  noStroke();
  fill(140, 80, 90);
  rect(20, height - 20, alpha * 80, 6);
  fill(0, 80, 90);
  rect(20, height - 30, beta * 80, 6);
  fill(60, 80, 90);
  rect(20, height - 40, theta * 80, 6);
}

// ---------------- BLOCK LOGIC ----------------
function spawnBlock() {
  block = {
    x: cols / 2, // float for smooth movement
    y: 0,
    rot: 0
  };
}

function lockBlock(gridX, gridY) {
  if (gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols) {
    grid[gridY][gridX] = 1;
  }
}

// ---------------- DRAW ----------------
function drawGrid() {
  stroke(220, 20, 30);
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x]) fill(180, 80, 90);
      else noFill();
      
      rect(x * cellSize + 50, y * cellSize + 20, cellSize);
    }
  }
}

function drawBlock(alpha) {
  push();
  translate(
    block.x * cellSize + 50 + cellSize / 2,
    block.y * cellSize + 20 + cellSize / 2
  );
  
  // Rotation jitter controlled by alpha
  let jitter = map(alpha, 0, 1, 0.4, 0);
  rotate(block.rot + random(-jitter, jitter));
  
  rectMode(CENTER);
  fill(60, 80, 90);
  rect(0, 0, cellSize, cellSize);
  pop();
}
