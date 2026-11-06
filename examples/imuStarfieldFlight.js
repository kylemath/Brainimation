/**
 * @id imuStarfieldFlight
 * @title 🚀 Head-Steered Warp Cockpit (6-DOF IMU + 2nd-Order Parallax)
 * @category Motion, IMU & Broadcast Sensors
 * @order 9
 */

// 🚀 Head-Steered Warp Cockpit (6-DOF IMU + 2nd-Order Position Parallax + EEG Boost)
// Fly through an infinite neon warp tunnel steered by your head orientation and 2nd-order position:
//   - Head Roll (`eegData.roll`): Banks the spacecraft horizon left/right
//   - Head Pitch & Yaw (`eegData.pitch`, `eegData.yaw`): Aims the flight vector through warp gates
//   - 2nd-Order Head Position (`eegData.position`): Shifts cockpit camera parallax in 3D
//   - EEG Beta / Attention (`eegData.beta`): Controls warp drive velocity!

let stars = [];
let gates = [];
let gateScore = 0;
let smoothPitch = 0, smoothRoll = 0, smoothYaw = 0;
let smoothPx = 0, smoothPy = 0;
let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: random(-900, 900),
      y: random(-700, 700),
      z: random(50, 1200)
    });
  }
  for (let i = 0; i < 5; i++) {
    gates.push(makeGate(260 + i * 230));
  }
}

function makeGate(zPos) {
  return {
    x: random(-180, 180),
    y: random(-110, 110),
    z: zPos,
    hueCol: random([[56, 189, 248], [52, 211, 153], [192, 132, 252], [250, 204, 21]])
  };
}

function draw() {
  background(7, 10, 20);
  simT += 0.03;

  let pitch = 0, roll = 0, yaw = 0, px = 0, py = 0, beta = 0.45;
  if (eegData && eegData.connected) {
    pitch = eegData.pitch || 0;
    roll = eegData.roll || 0;
    yaw = eegData.yaw || 0;
    px = eegData.position ? eegData.position.x : 0;
    py = eegData.position ? eegData.position.y : 0;
    beta = eegData.beta || 0.45;
  } else {
    pitch = 14 * sin(simT * 0.8);
    roll = 22 * cos(simT * 0.6);
    yaw = 20 * sin(simT * 0.5);
    px = 6 * cos(simT * 1.1);
    py = 6 * sin(simT * 1.1);
    beta = 0.5 + 0.3 * sin(simT * 0.4);
  }

  smoothPitch = lerp(smoothPitch, pitch, 0.18);
  smoothRoll = lerp(smoothRoll, roll, 0.18);
  smoothYaw = lerp(smoothYaw, yaw, 0.18);
  smoothPx = lerp(smoothPx, px, 0.2);
  smoothPy = lerp(smoothPy, py, 0.2);

  let warpSpeed = 8 + beta * 18;
  let steerX = smoothRoll * 5.5 + smoothPy * 4.0;
  let steerY = -smoothPitch * 5.0 - smoothPx * 4.0;

  push();
  translate(width * 0.5, height * 0.54);
  rotate(radians(-smoothRoll * 0.65));

  // Starfield warp streaks
  let fov = 340;
  for (let s of stars) {
    let oldZ = s.z;
    s.z -= warpSpeed;
    if (s.z < 20) {
      s.z = 1200;
      s.x = random(-900, 900) + steerX;
      s.y = random(-700, 700) + steerY;
      oldZ = s.z;
    }
    let sx1 = ((s.x - steerX) / s.z) * fov;
    let sy1 = ((s.y - steerY) / s.z) * fov;
    let sx2 = ((s.x - steerX) / (oldZ + warpSpeed * 1.6)) * fov;
    let sy2 = ((s.y - steerY) / (oldZ + warpSpeed * 1.6)) * fov;

    let alpha = map(s.z, 20, 1200, 255, 30);
    stroke(160, 215, 255, alpha);
    strokeWeight(map(s.z, 20, 1200, 2.8, 0.8));
    line(sx1, sy1, sx2, sy2);
  }

  // Warp gates
  gates.sort((a, b) => b.z - a.z);
  for (let g of gates) {
    g.z -= warpSpeed;
    let gx = ((g.x - steerX) / max(20, g.z)) * fov;
    let gy = ((g.y - steerY) / max(20, g.z)) * fov;
    let gr = (115 / max(20, g.z)) * fov;

    noFill();
    stroke(g.hueCol[0], g.hueCol[1], g.hueCol[2], map(g.z, 30, 1200, 240, 35));
    strokeWeight(map(g.z, 30, 1200, 4.5, 1.2));
    ellipse(gx, gy, gr * 2, gr * 2);

    if (g.z < 45) {
      if (dist(gx, gy, 0, 0) < gr * 1.15) {
        gateScore++;
      }
      g.z = 1150;
      g.x = steerX + random(-170, 170);
      g.y = steerY + random(-105, 105);
    }
  }

  // Cockpit HUD reticle
  noFill();
  stroke(52, 211, 153, 200);
  strokeWeight(1.8);
  ellipse(0, 0, 44, 44);
  line(-34, 0, -14, 0);
  line(14, 0, 34, 0);
  line(0, -34, 0, -14);
  line(0, 14, 0, 34);
  pop();

  drawCockpitHeader(warpSpeed);
}

function drawCockpitHeader(warpSpeed) {
  noStroke();
  fill(15, 22, 38, 235);
  rect(0, 0, width, 48);
  stroke(45, 65, 100);
  line(0, 48, width, 48);

  noStroke();
  fill(56, 189, 248);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🚀 HEAD-STEERED WARP COCKPIT — 6-DOF ATTITUDE + 2ND-ORDER POSITION PARALLAX', 16, 16);

  textStyle(NORMAL);
  fill(180, 205, 235);
  textSize(11);
  text(`WARP GATES: ${gateScore}   |   Pitch/Roll: ${smoothPitch.toFixed(1)}° / ${smoothRoll.toFixed(1)}°   |   2nd-Order Parallax: (${smoothPx.toFixed(1)}, ${smoothPy.toFixed(1)}) cm   |   Speed: ${(warpSpeed * 12).toFixed(0)} km/s`, 16, 35);
}
