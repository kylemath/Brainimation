/**
 * @id imuGyroscope3D
 * @title Gyroscope: 3-Axis Angular Velocity Gimbal
 * @category Motion, IMU & Broadcast Sensors
 * @order 2
 */

// 🌀 3-Axis Gyroscope Demonstration (eegData.gyro)
// Visualizes the Muse 52 Hz 3-axis gyroscope angular rate (°/s):
//   - eegData.gyro.x (Roll angular velocity, °/s)
//   - eegData.gyro.y (Pitch/Nod angular velocity, °/s)
//   - eegData.gyro.z (Yaw/Turn angular velocity, °/s)
//   - eegData.gyro.magnitude (Total angular speed ||ω||, °/s)
//   - eegData.getGyroChannel('x'|'y'|'z'|'magnitude', numSamples)

let ringAngleX = 0;
let ringAngleY = 0;
let ringAngleZ = 0;
let smoothGx = 0, smoothGy = 0, smoothGz = 0, smoothGMag = 0;
let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function draw() {
  background(10, 13, 24);
  simT += 0.025;

  let gx = 0, gy = 0, gz = 0, gmag = 0;
  if (eegData && eegData.connected && eegData.gyro) {
    gx = eegData.gyro.x;
    gy = eegData.gyro.y;
    gz = eegData.gyro.z;
    gmag = eegData.gyro.magnitude;
  } else {
    gx = 38 * sin(simT * 1.1) + 12 * cos(simT * 2.7);
    gy = 44 * cos(simT * 0.85) + 15 * sin(simT * 2.1);
    gz = 52 * sin(simT * 0.55);
    gmag = sqrt(gx * gx + gy * gy + gz * gz);
  }

  smoothGx = lerp(smoothGx, gx, 0.25);
  smoothGy = lerp(smoothGy, gy, 0.25);
  smoothGz = lerp(smoothGz, gz, 0.25);
  smoothGMag = lerp(smoothGMag, gmag, 0.25);

  // Spin the 3 gimbal rings proportionally to live angular velocity
  ringAngleX += radians(smoothGx) * 0.035;
  ringAngleY += radians(smoothGy) * 0.035;
  ringAngleZ += radians(smoothGz) * 0.035;

  drawHeader();

  let topY = 56;
  let topH = height * 0.50;
  let leftW = width * 0.52 - 20;
  let rightX = width * 0.52 + 4;
  let rightW = width - rightX - 16;

  drawGimbalSphere(16, topY, leftW, topH);
  drawTachometerGauges(rightX, topY, rightW, topH);

  let botY = topY + topH + 12;
  let botH = height - botY - 14;
  drawGyroWaveforms(16, botY, width - 32, botH);
}

function drawHeader() {
  noStroke();
  fill(18, 24, 42);
  rect(0, 0, width, 46);
  stroke(45, 65, 100);
  line(0, 46, width, 46);

  noStroke();
  fill(192, 132, 252);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🌀 SENSOR 2/5 — 3-AXIS GYROSCOPE ANGULAR VELOCITY (eegData.gyro @ 52 Hz)', 16, 16);

  textStyle(NORMAL);
  fill(165, 185, 215);
  textSize(11);
  text(`ωx = ${smoothGx.toFixed(1)} °/s   |   ωy = ${smoothGy.toFixed(1)} °/s   |   ωz = ${smoothGz.toFixed(1)} °/s   |   ||ω|| = ${smoothGMag.toFixed(1)} °/s`, 16, 34);
}

function drawGimbalSphere(x, y, w, h) {
  fill(15, 21, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('AEROSPACE 3-RING INERTIAL GIMBAL', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.56;
  let R = min(w, h - 42) * 0.39;

  // Outer housing ring
  noFill();
  stroke(55, 75, 110);
  strokeWeight(2);
  ellipse(cx, cy, R * 2.12, R * 2.12);

  // Project 3D points on each rotating gimbal ring
  const rings = [
    { r: R * 0.96, col: [248, 113, 113], ax: ringAngleX, ay: 0.3, az: 0.2, rate: smoothGx, name: 'ωx Roll' },
    { r: R * 0.78, col: [52, 211, 153],  ax: 0.4, ay: ringAngleY, az: -0.2, rate: smoothGy, name: 'ωy Pitch' },
    { r: R * 0.60, col: [96, 165, 250],  ax: 0.65, ay: 0.2, az: ringAngleZ, rate: smoothGz, name: 'ωz Yaw' }
  ];

  for (let k = 0; k < rings.length; k++) {
    let rg = rings[k];
    noFill();
    stroke(rg.col[0], rg.col[1], rg.col[2], 220);
    strokeWeight(2.4);
    beginShape();
    for (let a = 0; a <= TWO_PI + 0.05; a += 0.12) {
      let px = rg.r * cos(a);
      let py = rg.r * sin(a);
      let pz = 0;

      // Rotate X
      let y1 = py * cos(rg.ax) - pz * sin(rg.ax);
      let z1 = py * sin(rg.ax) + pz * cos(rg.ax);
      // Rotate Y
      let x2 = px * cos(rg.ay) + z1 * sin(rg.ay);
      let z2 = -px * sin(rg.ay) + z1 * cos(rg.ay);
      // Rotate Z
      let x3 = x2 * cos(rg.az) - y1 * sin(rg.az);
      let y3 = x2 * sin(rg.az) + y1 * cos(rg.az);

      let persp = 280 / (280 - z2 * 0.5);
      vertex(cx + x3 * persp, cy + y3 * persp);
    }
    endShape();
  }

  // Core angular momentum hub
  noStroke();
  fill(192, 132, 252, 45 + constrain(smoothGMag * 1.2, 0, 140));
  ellipse(cx, cy, 34, 34);
  fill(235, 215, 255);
  ellipse(cx, cy, 10, 10);
}

function drawTachometerGauges(x, y, w, h) {
  fill(15, 21, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('ANGULAR RATE TACHOMETERS (°/s)', x + 12, y + 10);

  const dials = [
    { label: 'gyro.x (Roll)',  val: smoothGx, col: [248, 113, 113] },
    { label: 'gyro.y (Pitch)', val: smoothGy, col: [52, 211, 153] },
    { label: 'gyro.z (Yaw)',   val: smoothGz, col: [96, 165, 250] }
  ];

  let dialR = min(w / 3.5, h * 0.52) * 0.46;
  for (let i = 0; i < 3; i++) {
    let d = dials[i];
    let dx = x + (w / 3) * (i + 0.5);
    let dy = y + h * 0.56;

    // Arc track
    noFill();
    stroke(34, 48, 76);
    strokeWeight(6);
    arc(dx, dy, dialR * 2, dialR * 2, PI * 0.8, TWO_PI + PI * 0.2);

    // Zero center tick at top (-PI/2)
    let norm = constrain(d.val / 150, -1, 1);
    let targetAngle = -HALF_PI + norm * (PI * 0.7);
    stroke(d.col[0], d.col[1], d.col[2]);
    strokeWeight(6);
    if (norm >= 0) {
      arc(dx, dy, dialR * 2, dialR * 2, -HALF_PI, targetAngle);
    } else {
      arc(dx, dy, dialR * 2, dialR * 2, targetAngle, -HALF_PI);
    }

    // Needle
    stroke(255);
    strokeWeight(2);
    line(dx, dy, dx + cos(targetAngle) * (dialR - 4), dy + sin(targetAngle) * (dialR - 4));
    noStroke();
    fill(d.col[0], d.col[1], d.col[2]);
    ellipse(dx, dy, 8, 8);

    // Value & label
    fill(235, 242, 255);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text(`${d.val >= 0 ? '+' : ''}${d.val.toFixed(1)}°/s`, dx, dy + dialR * 0.55);
    fill(150, 170, 200);
    textSize(9.5);
    textStyle(NORMAL);
    text(d.label, dx, dy + dialR * 0.55 + 15);
  }
}

function drawGyroWaveforms(x, y, w, h) {
  fill(15, 21, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('52 Hz GYROSCOPE STREAM — eegData.getAllGyroChannels(180)', x + 12, y + 8);

  let N = 180;
  let ch = (eegData && typeof eegData.getAllGyroChannels === 'function')
    ? eegData.getAllGyroChannels(N)
    : { x: [], y: [], z: [], magnitude: [] };

  let plotX = x + 52;
  let plotY = y + 28;
  let plotW = w - 66;
  let plotH = h - 38;
  let midY = plotY + plotH * 0.5;

  stroke(38, 52, 82);
  strokeWeight(1);
  line(plotX, midY, plotX + plotW, midY);

  noStroke();
  fill(120, 145, 180);
  textSize(9);
  textAlign(RIGHT, CENTER);
  text('+120°/s', plotX - 6, plotY + 6);
  text('   0°/s', plotX - 6, midY);
  text('-120°/s', plotX - 6, plotY + plotH - 6);

  const traces = [
    { arr: ch.x, col: [248, 113, 113], label: 'ωx' },
    { arr: ch.y, col: [52, 211, 153],  label: 'ωy' },
    { arr: ch.z, col: [96, 165, 250],  label: 'ωz' },
    { arr: ch.magnitude, col: [250, 204, 21], label: '||ω||' }
  ];

  for (let t = 0; t < traces.length; t++) {
    let tr = traces[t];
    noFill();
    stroke(tr.col[0], tr.col[1], tr.col[2], 215);
    strokeWeight(t === 3 ? 2.0 : 1.5);
    beginShape();
    let len = tr.arr && tr.arr.length ? tr.arr.length : N;
    for (let i = 0; i < len; i++) {
      let val = (tr.arr && tr.arr.length)
        ? tr.arr[i]
        : (t === 0 ? 38 * sin(simT - (len - i) * 0.05)
          : t === 1 ? 44 * cos(simT * 0.85 - (len - i) * 0.05)
          : t === 2 ? 52 * sin(simT * 0.55 - (len - i) * 0.05)
          : 65 + 20 * sin(simT * 1.4 - (len - i) * 0.05));
      let px = plotX + (i / max(1, len - 1)) * plotW;
      let py = constrain(map(val, -140, 140, plotY + plotH, plotY), plotY, plotY + plotH);
      vertex(px, py);
    }
    endShape();

    noStroke();
    fill(tr.col[0], tr.col[1], tr.col[2]);
    let lx = x + w - 200 + t * 48;
    rect(lx, y + 10, 10, 8, 2);
    fill(200, 215, 235);
    textAlign(LEFT, TOP);
    text(tr.label, lx + 13, y + 8);
  }
}
