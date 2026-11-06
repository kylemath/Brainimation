/**
 * @id neurotech2025AliciaOHeelsRunner
 * @title Sunset Heels Runner (Alicia Osorio)
 * @category 2025 Neurotech Class Catalogue
 * @order 2
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * EEG-driven side-scrolling runner against a sunset cloudscape where Alpha speed, Attention, and Stress modulate stride speed, obstacle spacing, and auto-jump.
 */
// EEG-Driven Sunset Heels Runner (Converted from Alicia Osorio's React Canvas Sketch to p5.js)
// Sunset sky (pink -> orange -> lavender), soft clouds, runner with long black hair,
// matte red dress, and thin stiletto heels. Press SPACE or click to jump!

const GROUND_OFFSET = 70;
const GRAVITY = 0.85;
const JUMP_VY = -13.5;

let runner = { t: 0, x: 110, y: 0, vy: 0, obstacles: [], timeToNext: 1200 };
let autoJump = true;
let attHistory = new Array(80).fill(0.5);
let stressHistory = new Array(80).fill(0.5);

const clouds = [
  { x: 80,  y: 45,  s: 1.2 },
  { x: 260, y: 75,  s: 0.9 },
  { x: 460, y: 55,  s: 1.4 },
  { x: 680, y: 90,  s: 1.1 },
  { x: 820, y: 40,  s: 0.8 },
  { x: 150, y: 125, s: 1.0 },
  { x: 540, y: 135, s: 0.95 }
];

function setup() {
  createCanvas(width, height);
  runner.y = height - GROUND_OFFSET;
}

function jumpRunner() {
  let groundY = height - GROUND_OFFSET;
  if (Math.abs(runner.y - groundY) < 2) {
    runner.vy = JUMP_VY;
  }
}

function keyPressed() {
  if (key === ' ' || keyCode === UP_ARROW) {
    jumpRunner();
  } else if (key === 'a' || key === 'A') {
    autoJump = !autoJump;
  }
}

function mousePressed() {
  jumpRunner();
}

function draw() {
  let groundY = height - GROUND_OFFSET;
  let ctx = (typeof drawingContext !== 'undefined' && drawingContext)
    ? drawingContext
    : (document.querySelector('#canvas-container canvas') && document.querySelector('#canvas-container canvas').getContext('2d'));
  if (!ctx) return;

  // Read live or simulated EEG metrics
  let alpha = constrain(eegData.alpha || 0.5, 0, 1);
  let beta  = constrain(eegData.beta  || 0.4, 0, 1);
  let theta = constrain(eegData.theta || 0.3, 0, 1);
  let gamma = constrain(eegData.gamma || 0.3, 0, 1);

  let attention = constrain(beta / (alpha + theta + 0.15), 0, 1);
  let stress = constrain(beta / (alpha + 0.5 * theta + 0.15), 0, 1);
  let activation = constrain((alpha + beta + theta + gamma) / 4, 0, 1);

  let stateName = "Relaxed";
  if (stress > 0.72) stateName = "Stressed";
  else if (attention > 0.62) stateName = "Focused";
  else if (theta > alpha && theta > 0.55) stateName = "Drowsy";

  if (frameCount % 4 === 0) {
    attHistory.push(attention);
    if (attHistory.length > 80) attHistory.shift();
    stressHistory.push(stress);
    if (stressHistory.length > 80) stressHistory.shift();
  }

  // EEG -> difficulty & speed mapping
  let difficulty = constrain(1 - attention, 0, 1);
  let easeByStress = constrain(1 - stress * 0.5, 0, 1);
  let combinedDifficulty = constrain(difficulty * 0.7 + (1 - easeByStress) * 0.3, 0, 1);
  let walkerSpeed = lerp(2.5, 7.8, constrain(alpha * 1.2 - stress * 0.2 + 0.1, 0, 1));
  let targetInterval = lerp(1700, 750, combinedDifficulty);

  // Auto-jump when obstacle is close and brain is active
  for (let o of runner.obstacles) {
    if (autoJump && o.x - runner.x > 10 && o.x - runner.x < 75 && (activation > 0.45 || alpha > 0.45)) {
      jumpRunner();
    }
  }

  // Physics update
  let dt = 16.7;
  runner.t += dt;
  runner.timeToNext -= dt;

  if (runner.timeToNext <= 0) {
    let h = 24 + random(42) * (0.5 + combinedDifficulty);
    let w = 14 + random(18);
    runner.obstacles.push({ x: width + 15, w: w, h: h });
    runner.timeToNext = targetInterval * random(0.8, 1.4);
  }

  runner.vy += GRAVITY;
  runner.y += runner.vy;
  if (runner.y > groundY) {
    runner.y = groundY;
    runner.vy = 0;
  }

  for (let o of runner.obstacles) {
    o.x -= walkerSpeed;
  }
  runner.obstacles = runner.obstacles.filter(o => o.x + o.w > -10);

  let collided = false;
  for (let o of runner.obstacles) {
    let ox1 = o.x, ox2 = o.x + o.w;
    let oy1 = groundY - o.h, oy2 = groundY;
    let rx1 = runner.x - 14, rx2 = runner.x + 14;
    let ry1 = runner.y - 45, ry2 = runner.y;
    if (ox1 < rx2 && ox2 > rx1 && oy1 < ry2 && oy2 > ry1) {
      collided = true;
      break;
    }
  }

  // 1. Sunset gradient sky
  let grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#ff9a8b");
  grad.addColorStop(0.45, "#ff6a88");
  grad.addColorStop(0.8, "#ffd1a1");
  grad.addColorStop(1, "#f7e4ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Soft clouds
  for (let c of clouds) {
    drawSoftCloud(ctx, (c.x + frameCount * 0.15) % (width + 120) - 60, c.y, c.s);
  }

  // 3. Ground runway
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, groundY + 1, width, 3);
  ctx.fillStyle = "rgba(31, 41, 55, 0.12)";
  ctx.fillRect(0, groundY + 4, width, height - groundY);

  // 4. Obstacles
  ctx.fillStyle = "#7c3aed";
  for (let o of runner.obstacles) {
    ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
  }

  // 5. Runner in matte red dress & stiletto heels
  drawHeelsRunner(ctx, runner.x, runner.y, runner.t, walkerSpeed);

  // 6. HUD & Sparklines
  let pad = 16;
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(`EEG Sunset Heels Runner  |  State: ${stateName}`, pad, 24);
  ctx.font = "12px sans-serif";
  ctx.fillText(
    `Attention: ${attention.toFixed(2)}   Stress: ${stress.toFixed(2)}   Alpha: ${alpha.toFixed(2)}   Beta: ${beta.toFixed(2)}`,
    pad, 44
  );
  ctx.fillText(
    `Speed: ${walkerSpeed.toFixed(1)}   Difficulty: ${combinedDifficulty.toFixed(2)}   AutoJump (A): ${autoJump ? "ON" : "OFF"}   [Space/Click to Jump]`,
    pad, 62
  );

  drawSpark(ctx, attHistory, pad, 76, 180, 30, "Attention");
  drawSpark(ctx, stressHistory, pad + 200, 76, 180, 30, "Stress");

  if (collided) {
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Ouch! Relax (high Alpha) to stride smoothly!", pad, 130);
  }
}

function drawHeelsRunner(ctx, x, y, t, walkerSpeed) {
  let skinColor = "#b37a56";
  let hairColor = "#0b0b0f";
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.25, 1.25);

  let stride = Math.sin(t * 0.022 * (2 + Math.min(6, walkerSpeed))) * 5;

  // Stiletto heels (matte red)
  ctx.fillStyle = "#dc2626";
  drawStiletto(ctx, -7 + stride * 0.5, 0, -6);
  drawStiletto(ctx,  7 - stride * 0.5, 0,  6);

  // Legs
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3.0;
  ctx.beginPath(); ctx.moveTo(-4.5, -10); ctx.lineTo(-4.5 + stride * 0.5, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( 4.5, -10); ctx.lineTo( 4.5 - stride * 0.5, 0); ctx.stroke();

  // Hourglass silhouette
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.quadraticCurveTo(-12, -18, -5.5, -22);
  ctx.quadraticCurveTo(-1, -28, 5, -24);
  ctx.quadraticCurveTo(11, -18, 9, -10);
  ctx.quadraticCurveTo(6, -8, 4.5, -8);
  ctx.lineTo(-4.5, -8);
  ctx.quadraticCurveTo(-7, -8, -9, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Matte red dress
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.quadraticCurveTo(-9, -17, -4.5, -20.5);
  ctx.quadraticCurveTo(0, -23.5, 4.5, -21);
  ctx.quadraticCurveTo(9, -17, 8, -10);
  ctx.lineTo(8, -10);
  ctx.quadraticCurveTo(0, -8.5, -8, -10);
  ctx.closePath();
  ctx.fill();

  // Swinging arms
  let arm = Math.sin(t * 0.022 * (2 + Math.min(6, walkerSpeed))) * 9;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.moveTo(-1, -18); ctx.lineTo(-12 + arm, -10); ctx.stroke();
  ctx.globalAlpha = 1.0;
  ctx.beginPath(); ctx.moveTo(1, -18); ctx.lineTo(12 - arm, -10); ctx.stroke();

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(2, -36, 7.6, 0, Math.PI * 2); ctx.fill();

  // Long flowing black hair
  let sway = Math.sin(t * 0.02 * walkerSpeed) * 4;
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(0, -37, 10, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-2, -40);
  ctx.quadraticCurveTo(-16, -38 + sway, -14, -22 + sway);
  ctx.quadraticCurveTo(-12, -10 + sway, -6, -8 + sway);
  ctx.quadraticCurveTo(-2, -10 + sway, -1, -20 + sway);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawStiletto(ctx, x, y, dir) {
  let s = Math.sign(dir);
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 1);
  ctx.lineTo(x + 6 * s, y - 1);
  ctx.lineTo(x + 2 * s, y + 2);
  ctx.lineTo(x - 5 * s, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 4 * s, y + 2);
  ctx.lineTo(x - 4 * s, y + 7);
  ctx.stroke();
}

function drawSoftCloud(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#ffffff";
  cloudEllipse(ctx, 0, 0, 40, 24);
  cloudEllipse(ctx, -22, 6, 28, 18);
  cloudEllipse(ctx, 22, 8, 32, 18);
  cloudEllipse(ctx, -40, 10, 22, 14);
  cloudEllipse(ctx, 40, 12, 22, 14);
  ctx.restore();
}

function cloudEllipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpark(ctx, values, x, y, w, h, label) {
  ctx.fillStyle = "#1f2937";
  ctx.font = "10px sans-serif";
  ctx.fillText(label, x, y - 3);
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(31, 41, 55, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  let n = values.length;
  for (let i = 0; i < n; i++) {
    let vx = x + (i / (n - 1)) * w;
    let vy = y + (1 - values[i]) * h;
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1.8;
  ctx.stroke();
}
