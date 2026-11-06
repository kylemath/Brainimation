/**
 * @id neurotech2025ToriALilypadFrogPond
 * @title Lilypad Frog Pond & Bug Catcher (Tori Anderson)
 * @category 2025 Neurotech Class Catalogue
 * @order 89
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Five frogs perched on lilypads shoot out their tongues to catch flying bugs powered by Delta, Theta, Alpha, Beta, and Gamma waves!
 */
let lilypads = [];
const pondHeight = 200;
const numFrogs = 5;
let bugs = [];
const maxBugs = 12;

// Brain wave colors and simulated strength
const frogsData = [
  { color: [150, 50, 200], strength: 0.8 }, // Alpha
  { color: [50, 100, 255], strength: 0.6 }, // Beta
  { color: [255, 150, 50], strength: 0.3 }, // Delta
  { color: [255, 100, 200], strength: 0.5 }, // Theta
  { color: [255, 50, 50], strength: 0.9 } // Gamma
];

// Initialize lily pads and frogs
function setupLilypads() {
  let spacing = width / (numFrogs + 1);
  for (let i = 0; i < numFrogs; i++) {
    lilypads.push({
      x: spacing * (i + 1),
      y: height - pondHeight + 30,
      size: 60,
      color: frogsData[i].color,
      strength: frogsData[i].strength,
      score: 0
    });
  }
}

// Spawn bugs in the sky
function spawnBug() {
  if (bugs.length < maxBugs) {
    bugs.push({
      x: random(width),
      y: random(50, height - pondHeight - 100),
      speed: random(1, 2.5),
      caughtBy: null,
      progress: 0,
      angle: random(TWO_PI),
      amplitude: random(10, 25),
      frequency: random(0.05, 0.1),
      age: 0,
      catchable: random() < 0.8
    });
  }
}

// Draw sun with glow and animated rays
function drawSun() {
  let sunX = 80;
  let sunY = 80;
  let sunRadius = 50;
  let numRays = 12;
  
  // Sun core
  noStroke();
  fill(255, 204, 0);
  ellipse(sunX, sunY, sunRadius * 2);
  
  // Glow
  for (let r = sunRadius + 10; r <= sunRadius + 50; r += 10) {
    fill(255, 204, 0, map(r, sunRadius + 10, sunRadius + 50, 50, 0));
    ellipse(sunX, sunY, r * 2);
  }
  
  // Animated rays
  push();
  translate(sunX, sunY);
  for (let i = 0; i < numRays; i++) {
    let angle = TWO_PI / numRays * i + frameCount * 0.01;
    let rayLength = sunRadius + 10 + 5 * sin(frameCount * 0.05 + i);
    let x1 = cos(angle) * sunRadius;
    let y1 = sin(angle) * sunRadius;
    let x2 = cos(angle) * rayLength;
    let y2 = sin(angle) * rayLength;
    stroke(255, 220, 100, 180);
    strokeWeight(3);
    line(x1, y1, x2, y2);
  }
  pop();
}

function drawLilyPad(lp) {
  noStroke();
  // Draw shaded ellipse with gradient effect
  for (let r = lp.size * 0.6; r > 0; r -= 1) {
    let inter = map(r, 0, lp.size * 0.6, 0, 1);
    let c = lerpColor(color(80, 200, 80), color(40, 140, 40), inter);
    fill(c);
    ellipse(lp.x, lp.y, r * 2, r); // slightly squashed vertically for natural shape
  }
}

// Draw frog
function drawFrog(lp) {
  fill(lp.color);
  ellipse(lp.x, lp.y - lp.size * 0.05, lp.size * 0.4, lp.size * 0.3);
  ellipse(lp.x, lp.y - lp.size * 0.18, lp.size * 0.3, lp.size * 0.25);
  
  // Eyes
  fill(255);
  ellipse(lp.x - lp.size * 0.08, lp.y - lp.size * 0.25, lp.size * 0.12, lp.size * 0.12);
  ellipse(lp.x + lp.size * 0.08, lp.y - lp.size * 0.25, lp.size * 0.12, lp.size * 0.12);
  fill(0);
  ellipse(lp.x - lp.size * 0.08, lp.y - lp.size * 0.25, lp.size * 0.06, lp.size * 0.06);
  ellipse(lp.x + lp.size * 0.08, lp.y - lp.size * 0.25, lp.size * 0.06, lp.size * 0.06);
  
  // Legs
  stroke(lp.color);
  strokeWeight(3);
  line(lp.x - lp.size * 0.15, lp.y - lp.size * 0.05, lp.x - lp.size * 0.35, lp.y + lp.size * 0.05);
  line(lp.x + lp.size * 0.15, lp.y - lp.size * 0.05, lp.x + lp.size * 0.35, lp.y + lp.size * 0.05);
  line(lp.x - lp.size * 0.1, lp.y - lp.size * 0.05, lp.x - lp.size * 0.2, lp.y - lp.size * 0.12);
  line(lp.x + lp.size * 0.1, lp.y - lp.size * 0.05, lp.x + lp.size * 0.2, lp.y - lp.size * 0.12);
  
  // Mouth
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(lp.x, lp.y - lp.size * 0.1, lp.size * 0.18, lp.size * 0.08, 0, PI);
  
  // Score counter
  noStroke();
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text(lp.score, lp.x, lp.y - lp.size * 0.3);
}

// Draw bug
function drawBug(bug) {
  fill(0);
  noStroke();
  ellipse(bug.x, bug.y, 8, 8);
}

// Update bug positions
function updateBugs() {
  for (let b of bugs) {
    b.age++;
    if (!b.caughtBy) {
      // Zig-zag motion
      b.x += b.speed;
      b.y += sin(b.angle) * b.amplitude * b.frequency;
      b.angle += 0.2;
      
      // Keep within sky area
      if (b.x > width) b.x = 0;
      if (b.y < 50) b.y = 50;
      if (b.y > height - pondHeight - 50) b.y = height - pondHeight - 50;
    }
  }
}

// Frogs try to catch bugs
function frogsCatchBugs() {
  for (let b of bugs) {
    if (b.caughtBy || !b.catchable || b.age < 20) continue;
    
    let candidates = lilypads.filter(lp => dist(lp.x, lp.y - lp.size * 0.18, b.x, b.y) < 320);
    if (candidates.length > 0) {
      let totalStrength = candidates.reduce((sum, lp) => sum + lp.strength, 0);
      let r = random(totalStrength);
      let cumulative = 0;
      for (let lp of candidates) {
        cumulative += lp.strength;
        if (r <= cumulative) {
          b.caughtBy = lp;
          b.progress = 0;
          break;
        }
      }
    }
  }
}

// Draw bugs being pulled into frogs' mouths
function drawPulledBugs() {
  for (let i = bugs.length - 1; i >= 0; i--) {
    let b = bugs[i];
    if (b.caughtBy) {
      let lp = b.caughtBy;
      b.progress += 0.15;
      let bx = lerp(b.x, lp.x, b.progress);
      let by = lerp(b.y, lp.y - lp.size * 0.18, b.progress);
      
      // Tongue
      stroke(255, 182, 193);
      strokeWeight(3);
      line(lp.x, lp.y - lp.size * 0.18, bx, by);
      fill(0);
      noStroke();
      ellipse(bx, by, 8, 8);
      
      if (b.progress >= 1) {
        bugs.splice(i, 1);
        lp.score += 1;
      }
    }
  }
}

// Draw pond ripples as zig-zag lines
function drawRipples() {
  noFill();
  stroke(0, 80, 200, 120); // darker blue
  strokeWeight(2);
  for (let y = height - pondHeight + 20; y < height; y += 25) {
    beginShape();
    for (let x = 0; x <= width; x += 10) {
      // More exaggerated wave using sin and cos combined
      let wave = sin((frameCount * 0.08 + x * 0.2)) * 8 + cos((frameCount * 0.05 + x * 0.15)) * 5;
      vertex(x, y + wave);
    }
    endShape();
  }
}

function draw() {
  // Sky
  noStroke();
  fill(180, 220, 255);
  rect(0, 0, width, height - pondHeight);
  
  // Sun
  drawSun();
  
  // Pond
  fill(20, 40, 200);
  rect(0, height - pondHeight, width, pondHeight);
  
  // Ripples
  drawRipples();
  
  // Spawn bugs
  if (frameCount % 30 === 0) spawnBug();
  
  // Update bugs
  updateBugs();
  
  // Draw lily pads and frogs
  for (let lp of lilypads) {
    drawLilyPad(lp);
    drawFrog(lp);
  }
  
  // Frogs catch bugs
  frogsCatchBugs();
  
  // Draw flying bugs
  for (let b of bugs) {
    if (!b.caughtBy) drawBug(b);
  }
  
  // Draw pulled bugs into frogs' mouths
  drawPulledBugs();
}

// Initialize lily pads
setupLilypads();
