/**
 * @id imuStackedKinematicsDerivation
 * @title Stacked IMU Kinematics: Accel & Gyro → Velocity → 2nd-Order Position
 * @category Motion, IMU & Broadcast Sensors
 * @order 6
 */

// 📐 Technical Stacked IMU Kinematics Derivation (All Sensors + 1st & 2nd Order Integration)
// Time-aligned 5-tier stacked signal processing cascade showing step-by-step how 2nd-order
// 3D spatial position p(t) is mathematically derived from raw 52 Hz IMU measurements:
//
//   Tier 1 (0th Order Raw):    Raw Accelerometer a_raw(t) [g] & Gyroscope ω(t) [°/s]
//   Tier 2 (Attitude Fusion):  Complementary Filter Orientation (Pitch θ, Roll φ, Yaw ψ)
//                              θ(t) = α(θ + ω_y·Δt) + (1-α)·atan2(a_x, √(a_y²+a_z²))
//   Tier 3 (Gravity Removal):  World-Frame Linear Acceleration a_lin(t) = R(θ,φ)·a_raw - g₀  [m/s²]
//   Tier 4 (1st-Order ∫ dt):   Leaky Integrated Velocity v(t) = γ_v·v(t-Δt) + a_lin(t)·Δt   [cm/s]
//   Tier 5 (2nd-Order ∬ dt²):  Double-Integrated Position p(t) = γ_p·p(t-Δt) + v(t)·Δt      [cm]
//
// Hover mouse horizontally across any graph to inspect the exact time-locked sample across all 5 tiers!
// Press 'R' to zero/re-center the integrated kinematics state.

const N_SAMPLES = 180;
let demoBuf = {
  ax: [], ay: [], az: [],
  gx: [], gy: [], gz: [],
  pitch: [], roll: [], yaw: [],
  linAx: [], linAy: [], linAz: [],
  vx: [], vy: [], vz: [],
  px: [], py: [], pz: []
};
let simT = 0;
let demoState = { pitch: 0, roll: 0, yaw: 0, vx: 0, vy: 0, vz: 0, px: 0, py: 0, pz: 0 };

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  for (let i = 0; i < N_SAMPLES; i++) {
    stepDemoKinematics(1 / 52);
  }
}

function stepDemoKinematics(dt) {
  simT += dt;
  let pitchTrue = 16 * sin(simT * 1.15) + 6 * sin(simT * 2.6);
  let rollTrue  = 20 * cos(simT * 0.85) + 5 * cos(simT * 2.0);
  let yawRate   = 38 * cos(simT * 0.65);

  let pRad = radians(pitchTrue);
  let rRad = radians(rollTrue);

  // Simulated dynamic linear jolt (head nod / bob translation)
  let dynAx = 0.14 * sin(simT * 2.3);
  let dynAy = 0.16 * cos(simT * 1.7);
  let dynAz = 0.12 * sin(simT * 3.1);

  let ax = sin(pRad) + dynAx;
  let ay = sin(rRad) * cos(pRad) + dynAy;
  let az = cos(pRad) * cos(rRad) + dynAz;

  let gx = -20 * 0.85 * sin(simT * 0.85) * 1.4;
  let gy = 16 * 1.15 * cos(simT * 1.15) * 1.4;
  let gz = yawRate;

  let accelPitch = degrees(atan2(ax, sqrt(ay * ay + az * az)));
  let accelRoll  = degrees(atan2(ay, sqrt(ax * ax + az * az)));
  demoState.pitch = 0.94 * (demoState.pitch + gy * dt) + 0.06 * accelPitch;
  demoState.roll  = 0.94 * (demoState.roll  + gx * dt) + 0.06 * accelRoll;
  demoState.yaw  += gz * dt;
  if (demoState.yaw > 180) demoState.yaw -= 360;
  if (demoState.yaw < -180) demoState.yaw += 360;

  let gravX = sin(radians(demoState.pitch));
  let gravY = sin(radians(demoState.roll)) * cos(radians(demoState.pitch));
  let gravZ = cos(radians(demoState.pitch)) * cos(radians(demoState.roll));

  let linAx = (ax - gravX) * 9.81;
  let linAy = (ay - gravY) * 9.81;
  let linAz = (az - gravZ) * 9.81;

  demoState.vx = (demoState.vx + linAx * dt * 100) * 0.94;
  demoState.vy = (demoState.vy + linAy * dt * 100) * 0.94;
  demoState.vz = (demoState.vz + linAz * dt * 100) * 0.94;

  demoState.px = constrain((demoState.px + demoState.vx * dt) * 0.96, -35, 35);
  demoState.py = constrain((demoState.py + demoState.vy * dt) * 0.96, -35, 35);
  demoState.pz = constrain((demoState.pz + demoState.vz * dt) * 0.96, -35, 35);

  const pushCap = (arr, v) => { arr.push(v); if (arr.length > N_SAMPLES) arr.shift(); };
  pushCap(demoBuf.ax, ax); pushCap(demoBuf.ay, ay); pushCap(demoBuf.az, az);
  pushCap(demoBuf.gx, gx); pushCap(demoBuf.gy, gy); pushCap(demoBuf.gz, gz);
  pushCap(demoBuf.pitch, demoState.pitch); pushCap(demoBuf.roll, demoState.roll); pushCap(demoBuf.yaw, demoState.yaw);
  pushCap(demoBuf.linAx, linAx); pushCap(demoBuf.linAy, linAy); pushCap(demoBuf.linAz, linAz);
  pushCap(demoBuf.vx, demoState.vx); pushCap(demoBuf.vy, demoState.vy); pushCap(demoBuf.vz, demoState.vz);
  pushCap(demoBuf.px, demoState.px); pushCap(demoBuf.py, demoState.py); pushCap(demoBuf.pz, demoState.pz);
}

function draw() {
  background(9, 13, 23);
  stepDemoKinematics(1 / 52);

  let K = demoBuf;
  if (eegData && eegData.connected && typeof eegData.getKinematicsHistory === 'function' && eegData.kinematicsHistory && eegData.kinematicsHistory.linAccX && eegData.kinematicsHistory.linAccX.length > 5) {
    let rawK = eegData.getKinematicsHistory(N_SAMPLES);
    K = {
      ax: (rawK.accel && rawK.accel.x) || demoBuf.ax,
      ay: (rawK.accel && rawK.accel.y) || demoBuf.ay,
      az: (rawK.accel && rawK.accel.z) || demoBuf.az,
      gx: (rawK.gyro && rawK.gyro.x) || demoBuf.gx,
      gy: (rawK.gyro && rawK.gyro.y) || demoBuf.gy,
      gz: (rawK.gyro && rawK.gyro.z) || demoBuf.gz,
      pitch: rawK.pitch || demoBuf.pitch,
      roll: rawK.roll || demoBuf.roll,
      yaw: rawK.yaw || demoBuf.yaw,
      linAx: rawK.linAccX || demoBuf.linAx,
      linAy: rawK.linAccY || demoBuf.linAy,
      linAz: rawK.linAccZ || demoBuf.linAz,
      vx: rawK.velX || demoBuf.vx,
      vy: rawK.velY || demoBuf.vy,
      vz: rawK.velZ || demoBuf.vz,
      px: rawK.posX || demoBuf.px,
      py: rawK.posY || demoBuf.py,
      pz: rawK.posZ || demoBuf.pz
    };
  }

  let len = max(1, K.ax.length);

  drawHeader();

  // Layout: Left 68% = 5 Time-Aligned Stacked Derivation Lanes, Right 32% = 3D Position Trajectory & Live Cascade Block Diagram
  let pad = 12;
  let topY = 50;
  let availH = height - topY - 10;
  let leftW = floor(width * 0.67) - pad * 1.5;
  let rightX = pad + leftW + pad;
  let rightW = width - rightX - pad;

  let plotLeft = pad + 128;
  let plotRight = pad + leftW - 10;
  let plotW = plotRight - plotLeft;

  // Determine hover inspection index across all 5 stacked lanes
  let hoverIdx = len - 1;
  let isHovering = false;
  if (mouseX >= plotLeft && mouseX <= plotRight && mouseY >= topY && mouseY <= topY + availH) {
    isHovering = true;
    hoverIdx = constrain(floor(map(mouseX, plotLeft, plotRight, 0, len - 1)), 0, len - 1);
  }

  const tiers = [
    {
      step: 'TIER 1 — 0TH ORDER RAW IMU',
      title: 'Raw Accel a(t) [g] & Gyro ω(t) [°/s]',
      formula: 'a_raw = a_body + R^T·g₀',
      min: -1.5, max: 1.5, unit: 'g',
      series: [
        { arr: K.ax, col: [248, 113, 113], name: 'ax' },
        { arr: K.ay, col: [52, 211, 153],  name: 'ay' },
        { arr: K.az, col: [96, 165, 250],  name: 'az' }
      ]
    },
    {
      step: 'TIER 2 — SENSOR FUSION ATTITUDE',
      title: 'Complementary Filter Attitude (θ, φ, ψ)',
      formula: 'θ = α(θ + ω·Δt) + (1-α)·atan2(a)',
      min: -45, max: 45, unit: '°',
      series: [
        { arr: K.pitch, col: [248, 113, 113], name: 'Pitch' },
        { arr: K.roll,  col: [52, 211, 153],  name: 'Roll' },
        { arr: K.yaw,   col: [250, 204, 21],  name: 'Yaw' }
      ]
    },
    {
      step: 'TIER 3 — GRAVITY SUBTRACTION',
      title: 'Linear Acceleration a_lin(t) [m/s²]',
      formula: 'a_lin = (a_raw - g_est(θ,φ)) × 9.81',
      min: -4.0, max: 4.0, unit: 'm/s²',
      series: [
        { arr: K.linAx, col: [248, 113, 113], name: 'linX' },
        { arr: K.linAy, col: [52, 211, 153],  name: 'linY' },
        { arr: K.linAz, col: [96, 165, 250],  name: 'linZ' }
      ]
    },
    {
      step: 'TIER 4 — 1ST-ORDER INTEGRAL (∫ dt)',
      title: 'Velocity v(t) = ∫ a_lin(t) dt [cm/s]',
      formula: 'v_k = γ_v · (v_{k-1} + a_lin · Δt)',
      min: -40, max: 40, unit: 'cm/s',
      series: [
        { arr: K.vx, col: [248, 113, 113], name: 'vx' },
        { arr: K.vy, col: [52, 211, 153],  name: 'vy' },
        { arr: K.vz, col: [96, 165, 250],  name: 'vz' }
      ]
    },
    {
      step: 'TIER 5 — 2ND-ORDER INTEGRAL (∬ dt²)',
      title: '3D Position p(t) = ∫ v(t) dt [cm]',
      formula: 'p_k = γ_p · (p_{k-1} + v_k · Δt)',
      min: -25, max: 25, unit: 'cm',
      series: [
        { arr: K.px, col: [248, 113, 113], name: 'px' },
        { arr: K.py, col: [52, 211, 153],  name: 'py' },
        { arr: K.pz, col: [96, 165, 250],  name: 'pz' }
      ]
    }
  ];

  let gap = 6;
  let laneH = (availH - gap * (tiers.length - 1)) / tiers.length;

  for (let t = 0; t < tiers.length; t++) {
    let ly = topY + t * (laneH + gap);
    drawStackedLane(pad, ly, leftW, laneH, plotLeft, plotW, tiers[t], len, hoverIdx);

    // Draw downward integration arrow between stacked tiers
    if (t < tiers.length - 1) {
      stroke(96, 165, 250, 180);
      strokeWeight(1.5);
      let axMid = pad + 62;
      line(axMid, ly + laneH - 2, axMid, ly + laneH + gap + 2);
    }
  }

  // Draw synchronized vertical time-alignment cursor across all 5 lanes
  let cursorX = plotLeft + (hoverIdx / max(1, len - 1)) * plotW;
  stroke(250, 204, 21, isHovering ? 220 : 110);
  strokeWeight(1.2);
  line(cursorX, topY, cursorX, topY + availH);

  // Right column: Top = 3D 2nd-Order Position Trajectory Cube, Bottom = Live Derivation State Table + Telemetry/EEG bar
  let rightTopH = availH * 0.56;
  let rightBotY = topY + rightTopH + 8;
  let rightBotH = availH - rightTopH - 8;

  draw3DTrajectoryCube(rightX, topY, rightW, rightTopH, K, hoverIdx);
  drawDerivationSummaryCard(rightX, rightBotY, rightW, rightBotH, K, hoverIdx);
}

function drawHeader() {
  noStroke();
  fill(16, 23, 39);
  rect(0, 0, width, 42);
  stroke(45, 65, 100);
  line(0, 42, width, 42);

  noStroke();
  fill(250, 204, 21);
  textSize(13);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('📐 STACKED IMU KINEMATICS DERIVATION: RAW ACCEL & GYRO → ORIENTATION → VELOCITY → 2ND-ORDER POSITION', 12, 14);

  textStyle(NORMAL);
  fill(160, 182, 215);
  textSize(10);
  text('Hover across graphs to inspect time-aligned derivation samples   |   Red = X (Fwd/Pitch)   Green = Y (Lat/Roll)   Blue = Z (Vert)   |   Press [R] to Reset Drift', 12, 31);
}

function drawStackedLane(x, y, w, h, plotLeft, plotW, tier, len, hoverIdx) {
  fill(15, 21, 35);
  stroke(38, 56, 88);
  strokeWeight(1);
  rect(x, y, w, h, 6);

  // Left metadata column inside lane
  noStroke();
  fill(56, 189, 248);
  textSize(8.5);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(tier.step, x + 8, y + 6);

  fill(225, 235, 250);
  textSize(9.5);
  text(tier.title.split(' ')[0] + ' ' + tier.title.split(' ')[1], x + 8, y + 19);

  fill(145, 168, 200);
  textStyle(NORMAL);
  textSize(8);
  text(tier.formula, x + 8, y + h - 14);

  // Plot area
  let pyTop = y + 8;
  let pyBot = y + h - 8;
  let pyMid = (pyTop + pyBot) * 0.5;

  stroke(32, 46, 72);
  strokeWeight(1);
  line(plotLeft, pyMid, plotLeft + plotW, pyMid);
  line(plotLeft, pyTop, plotLeft, pyBot);

  // Plot each axis trace
  for (let s = 0; s < tier.series.length; s++) {
    let sr = tier.series[s];
    noFill();
    stroke(sr.col[0], sr.col[1], sr.col[2], 220);
    strokeWeight(1.6);
    beginShape();
    for (let i = 0; i < len; i++) {
      let v = sr.arr[i] || 0;
      let px = plotLeft + (i / max(1, len - 1)) * plotW;
      let py = constrain(map(v, tier.min, tier.max, pyBot, pyTop), pyTop, pyBot);
      vertex(px, py);
    }
    endShape();

    // Highlight inspected point at hoverIdx
    let hv = sr.arr[hoverIdx] || 0;
    let hx = plotLeft + (hoverIdx / max(1, len - 1)) * plotW;
    let hy = constrain(map(hv, tier.min, tier.max, pyBot, pyTop), pyTop, pyBot);
    noStroke();
    fill(sr.col[0], sr.col[1], sr.col[2]);
    ellipse(hx, hy, 5.5, 5.5);
  }

  // Instantaneous values at hoverIdx
  let v0 = (tier.series[0].arr[hoverIdx] || 0).toFixed(2);
  let v1 = (tier.series[1].arr[hoverIdx] || 0).toFixed(2);
  let v2 = (tier.series[2].arr[hoverIdx] || 0).toFixed(2);
  noStroke();
  fill(190, 210, 235);
  textSize(8.5);
  textAlign(LEFT, TOP);
  text(`X:${v0} Y:${v1} Z:${v2}${tier.unit}`, x + 8, y + 33);
}

function draw3DTrajectoryCube(x, y, w, h, K, hoverIdx) {
  fill(15, 21, 35);
  stroke(38, 56, 88);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(10.5);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('2ND-ORDER 3D POSITION p(t) RIBBON [cm]', x + 10, y + 8);

  let cx = x + w * 0.5;
  let cy = y + h * 0.56;
  let S = min(w, h - 36) * 0.015; // scale cm to px

  const iso = (px, py, pz) => ({
    x: cx + (py - px * 0.55) * S,
    y: cy - (pz - (px * 0.35 + py * 0.25)) * S
  });

  // Draw 3D bounding wireframe box (-20cm to +20cm)
  let B = 20;
  stroke(38, 58, 92, 160);
  strokeWeight(1);
  const corners = [
    [-B,-B,-B], [B,-B,-B], [B,B,-B], [-B,B,-B],
    [-B,-B, B], [B,-B, B], [B,B, B], [-B,B, B]
  ].map(c => iso(c[0], c[1], c[2]));
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  for (let e of edges) {
    line(corners[e[0]].x, corners[e[0]].y, corners[e[1]].x, corners[e[1]].y);
  }

  // Draw 3D position trail up to hoverIdx
  noFill();
  strokeWeight(2.4);
  stroke(56, 189, 248, 220);
  beginShape();
  for (let i = 0; i <= hoverIdx; i++) {
    let pt = iso(K.px[i] || 0, K.py[i] || 0, K.pz[i] || 0);
    vertex(pt.x, pt.y);
  }
  endShape();

  // Current 2nd-order position head marker + velocity tangent vector
  let curP = iso(K.px[hoverIdx] || 0, K.py[hoverIdx] || 0, K.pz[hoverIdx] || 0);
  let velTip = iso(
    (K.px[hoverIdx] || 0) + (K.vx[hoverIdx] || 0) * 0.35,
    (K.py[hoverIdx] || 0) + (K.vy[hoverIdx] || 0) * 0.35,
    (K.pz[hoverIdx] || 0) + (K.vz[hoverIdx] || 0) * 0.35
  );

  // 1st-order velocity tangent arrow (green)
  stroke(52, 211, 153);
  strokeWeight(2);
  line(curP.x, curP.y, velTip.x, velTip.y);

  // 2nd-order position sphere (gold)
  noStroke();
  fill(250, 204, 21, 70);
  ellipse(curP.x, curP.y, 22, 22);
  fill(250, 204, 21);
  ellipse(curP.x, curP.y, 9, 9);
}

function drawDerivationSummaryCard(x, y, w, h, K, idx) {
  fill(15, 21, 35);
  stroke(38, 56, 88);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(10.5);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('ALL BROADCAST SENSORS SNAPSHOT', x + 10, y + 8);

  textStyle(NORMAL);
  textSize(9.5);
  let ry = y + 28;
  let lh = (h - 34) / 6;

  let bat = (eegData && eegData.batteryLevel) ? eegData.batteryLevel : 88;
  let temp = (eegData && eegData.temperature) ? eegData.temperature : 33.4;
  let drl = (eegData && eegData.drlRef) ? eegData.drlRef.drl : 820;
  let hr = (eegData && eegData.heartRate) ? eegData.heartRate : 72;

  const lines = [
    { k: '0th Accel a(t):', v: `(${(K.ax[idx]||0).toFixed(2)}, ${(K.ay[idx]||0).toFixed(2)}, ${(K.az[idx]||0).toFixed(2)}) g`, c: [56, 189, 248] },
    { k: '0th Gyro  ω(t):', v: `(${(K.gx[idx]||0).toFixed(0)}, ${(K.gy[idx]||0).toFixed(0)}, ${(K.gz[idx]||0).toFixed(0)}) °/s`, c: [192, 132, 252] },
    { k: 'Attitude (θ,φ,ψ):', v: `${(K.pitch[idx]||0).toFixed(1)}° / ${(K.roll[idx]||0).toFixed(1)}° / ${(K.yaw[idx]||0).toFixed(1)}°`, c: [52, 211, 153] },
    { k: '1st Vel   v(t):', v: `(${(K.vx[idx]||0).toFixed(1)}, ${(K.vy[idx]||0).toFixed(1)}, ${(K.vz[idx]||0).toFixed(1)}) cm/s`, c: [251, 146, 60] },
    { k: '2nd Pos   p(t):', v: `(${(K.px[idx]||0).toFixed(1)}, ${(K.py[idx]||0).toFixed(1)}, ${(K.pz[idx]||0).toFixed(1)}) cm`, c: [250, 204, 21] },
    { k: 'Broadcast Aux:', v: `Bat ${bat.toFixed(0)}% | ${temp.toFixed(1)}°C | DRL ${drl.toFixed(0)}µV | ${hr}BPM`, c: [165, 185, 215] }
  ];

  for (let i = 0; i < lines.length; i++) {
    let row = lines[i];
    fill(145, 168, 200);
    textAlign(LEFT, CENTER);
    text(row.k, x + 10, ry + i * lh);
    fill(row.c[0], row.c[1], row.c[2]);
    textAlign(RIGHT, CENTER);
    text(row.v, x + w - 10, ry + i * lh);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    demoState = { pitch: 0, roll: 0, yaw: 0, vx: 0, vy: 0, vz: 0, px: 0, py: 0, pz: 0 };
    if (eegData && typeof eegData.resetKinematics === 'function') {
      eegData.resetKinematics();
    }
  }
}
