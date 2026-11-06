/**
 * @id imuHeadOrientation
 * @title Head Orientation: 3D Pitch, Roll & Yaw Attitude Horizon
 * @category Motion, IMU & Broadcast Sensors
 * @order 3
 */

// 🛩️ 3D Head Attitude & Orientation Fusion (eegData.orientation / pitch, roll, yaw)
// Demonstrates sensor fusion combining accelerometer gravity tilt + gyroscope angular rate:
//   - eegData.pitch (-90° to +90°, nodding up/down)
//   - eegData.roll  (-90° to +90°, tilting ear-to-shoulder)
//   - eegData.yaw   (-180° to +180°, turning head left/right)
//   - eegData.getOrientationChannel('pitch'|'roll'|'yaw', numSamples)

let smoothPitch = 0;
let smoothRoll = 0;
let smoothYaw = 0;
let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  simT += 0.025;

  let pitch = 0, roll = 0, yaw = 0;
  if (eegData && eegData.connected) {
    pitch = eegData.pitch || 0;
    roll = eegData.roll || 0;
    yaw = eegData.yaw || 0;
  } else {
    pitch = 18 * sin(simT * 0.85) + 5 * cos(simT * 2.1);
    roll = 22 * cos(simT * 0.65) + 4 * sin(simT * 1.7);
    yaw = 35 * sin(simT * 0.45);
  }

  smoothPitch = lerp(smoothPitch, pitch, 0.22);
  smoothRoll = lerp(smoothRoll, roll, 0.22);
  smoothYaw = lerp(smoothYaw, yaw, 0.22);

  drawHeader();

  let topY = 56;
  let topH = height * 0.52;
  let leftW = width * 0.50 - 20;
  let rightX = width * 0.50 + 4;
  let rightW = width - rightX - 16;

  drawArtificialHorizon(16, topY, leftW, topH);
  drawWireframeHeadAndCompass(rightX, topY, rightW, topH);

  let botY = topY + topH + 12;
  let botH = height - botY - 14;
  drawOrientationHistory(16, botY, width - 32, botH);
}

function drawHeader() {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 46);
  stroke(45, 65, 100);
  line(0, 46, width, 46);

  noStroke();
  fill(52, 211, 153);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🛩️ SENSOR 3/5 — COMPLEMENTARY FILTER HEAD ORIENTATION (Pitch / Roll / Yaw)', 16, 16);

  textStyle(NORMAL);
  fill(165, 185, 215);
  textSize(11);
  text(`Pitch = ${smoothPitch >= 0 ? '+' : ''}${smoothPitch.toFixed(1)}°   |   Roll = ${smoothRoll >= 0 ? '+' : ''}${smoothRoll.toFixed(1)}°   |   Yaw = ${smoothYaw >= 0 ? '+' : ''}${smoothYaw.toFixed(1)}°   (Press R to zero Yaw)`, 16, 34);
}

function drawArtificialHorizon(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('AVIONICS ARTIFICIAL HORIZON (ADI)', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.55;
  let R = min(w, h - 44) * 0.39;

  push();
  translate(cx, cy);
  rotate(radians(smoothRoll));

  let pitchOffset = constrain(smoothPitch * (R / 45), -R * 0.75, R * 0.75);

  // Sky & Ground hemispheres inside horizon circle
  noStroke();
  fill(24, 92, 168, 210);
  arc(0, 0, R * 2, R * 2, PI, TWO_PI, CHORD);
  fill(110, 68, 34, 210);
  arc(0, 0, R * 2, R * 2, 0, PI, CHORD);

  // Horizon line shifted by pitch
  stroke(255, 245, 200);
  strokeWeight(2.2);
  let hw = sqrt(max(0, R * R - pitchOffset * pitchOffset));
  line(-hw, pitchOffset, hw, pitchOffset);

  // Pitch ladder rungs (-20, -10, +10, +20 deg)
  strokeWeight(1.4);
  for (let deg = -20; deg <= 20; deg += 10) {
    if (deg === 0) continue;
    let py = pitchOffset - deg * (R / 45);
    if (abs(py) < R * 0.82) {
      let lw = deg % 20 === 0 ? 26 : 15;
      line(-lw, py, lw, py);
    }
  }
  pop();

  // Fixed aircraft reference reticle
  noFill();
  stroke(250, 204, 21);
  strokeWeight(2.5);
  line(cx - 34, cy, cx - 12, cy);
  line(cx + 12, cy, cx + 34, cy);
  ellipse(cx, cy, 8, 8);

  // Outer bezel
  stroke(75, 105, 150);
  strokeWeight(3);
  ellipse(cx, cy, R * 2, R * 2);
}

function drawWireframeHeadAndCompass(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('3D HEAD ATTITUDE & MUSE HEADBAND POSE', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.56;
  let R = min(w, h - 46) * 0.34;

  let pRad = radians(smoothPitch);
  let rRad = radians(smoothRoll);
  let yRad = radians(smoothYaw);

  const project = (vx, vy, vz) => {
    // Rotate X (pitch), Z (roll), Y (yaw)
    let y1 = vy * cos(pRad) - vz * sin(pRad);
    let z1 = vy * sin(pRad) + vz * cos(pRad);
    let x2 = vx * cos(rRad) - y1 * sin(rRad);
    let y2 = vx * sin(rRad) + y1 * cos(rRad);
    let x3 = x2 * cos(yRad) + z1 * sin(yRad);
    let z3 = -x2 * sin(yRad) + z1 * cos(yRad);
    return { x: cx + x3 * R, y: cy + y2 * R, z: z3 };
  };

  // Draw latitude/longitude cranium wireframe
  noFill();
  stroke(70, 130, 195, 140);
  strokeWeight(1.3);
  for (let lat = -0.6; lat <= 0.6; lat += 0.6) {
    beginShape();
    let rr = cos(lat);
    let yy = sin(lat);
    for (let a = 0; a <= TWO_PI + 0.1; a += 0.2) {
      let pt = project(rr * cos(a), yy, rr * sin(a));
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  // Highlight Muse headband arc across forehead (z > 0)
  stroke(52, 211, 153);
  strokeWeight(4);
  beginShape();
  for (let a = -PI * 0.75; a <= PI * 0.75; a += 0.12) {
    let pt = project(sin(a) * 1.03, -0.15, cos(a) * 1.03);
    vertex(pt.x, pt.y);
  }
  endShape();

  // Nose direction indicator
  let noseBase = project(0, 0, 1.0);
  let noseTip = project(0, 0.05, 1.38);
  stroke(250, 204, 21);
  strokeWeight(3);
  line(noseBase.x, noseBase.y, noseTip.x, noseTip.y);
  noStroke();
  fill(250, 204, 21);
  ellipse(noseTip.x, noseTip.y, 7, 7);
}

function drawOrientationHistory(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('EULER ATTITUDE HISTORY — eegData.getOrientationChannel("pitch"|"roll"|"yaw", 180)', x + 12, y + 8);

  let N = 180;
  let pArr = (eegData && typeof eegData.getOrientationChannel === 'function') ? eegData.getOrientationChannel('pitch', N) : [];
  let rArr = (eegData && typeof eegData.getOrientationChannel === 'function') ? eegData.getOrientationChannel('roll', N) : [];
  let yArr = (eegData && typeof eegData.getOrientationChannel === 'function') ? eegData.getOrientationChannel('yaw', N) : [];

  let plotX = x + 48;
  let plotY = y + 28;
  let plotW = w - 62;
  let plotH = h - 38;
  let midY = plotY + plotH * 0.5;

  stroke(38, 52, 82);
  line(plotX, midY, plotX + plotW, midY);

  const series = [
    { arr: pArr, col: [248, 113, 113], label: 'Pitch (°)' },
    { arr: rArr, col: [52, 211, 153],  label: 'Roll (°)' },
    { arr: yArr, col: [250, 204, 21],  label: 'Yaw (°)' }
  ];

  for (let s = 0; s < series.length; s++) {
    let sr = series[s];
    noFill();
    stroke(sr.col[0], sr.col[1], sr.col[2], 220);
    strokeWeight(1.8);
    beginShape();
    let len = sr.arr && sr.arr.length ? sr.arr.length : N;
    for (let i = 0; i < len; i++) {
      let val = (sr.arr && sr.arr.length)
        ? sr.arr[i]
        : (s === 0 ? 18 * sin(simT - (len - i) * 0.04)
          : s === 1 ? 22 * cos(simT * 0.7 - (len - i) * 0.04)
          : 35 * sin(simT * 0.45 - (len - i) * 0.04));
      let px = plotX + (i / max(1, len - 1)) * plotW;
      let py = constrain(map(val, -65, 65, plotY + plotH, plotY), plotY, plotY + plotH);
      vertex(px, py);
    }
    endShape();

    noStroke();
    fill(sr.col[0], sr.col[1], sr.col[2]);
    let lx = x + w - 230 + s * 74;
    rect(lx, y + 10, 10, 8, 2);
    fill(200, 215, 235);
    textAlign(LEFT, TOP);
    text(sr.label, lx + 14, y + 8);
  }
}

function keyPressed() {
  if ((key === 'r' || key === 'R') && eegData && typeof eegData.resetKinematics === 'function') {
    eegData.resetKinematics();
  }
}
