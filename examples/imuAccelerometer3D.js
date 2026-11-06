/**
 * @id imuAccelerometer3D
 * @title Accelerometer: 3-Axis Gravity & G-Force Inclinometer
 * @category Motion, IMU & Broadcast Sensors
 * @order 1
 */

// 🧭 3-Axis Accelerometer Demonstration (eegData.accel)
// Visualizes the Muse 52 Hz 3-axis accelerometer:
//   - eegData.accel.x (Forward/Backward g-force)
//   - eegData.accel.y (Left/Right lateral g-force)
//   - eegData.accel.z (Vertical gravity g-force, ~1.0g upright)
//   - eegData.accel.magnitude (Total vector norm ||a|| = √(x² + y² + z²))
//   - eegData.getAccelChannel('x'|'y'|'z'|'magnitude', numSamples)

let smoothAx = 0;
let smoothAy = 0;
let smoothAz = 1.0;
let smoothMag = 1.0;
let simT = 0;
let peakG = 1.0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  simT += 0.025;

  // Read live 52 Hz accelerometer or synthesize smooth demo motion if disconnected
  let ax = 0, ay = 0, az = 1.0, mag = 1.0;
  if (eegData && eegData.connected && eegData.accel) {
    ax = eegData.accel.x;
    ay = eegData.accel.y;
    az = eegData.accel.z;
    mag = eegData.accel.magnitude;
  } else {
    let pitchRad = radians(16 * sin(simT * 0.9) + 6 * sin(simT * 2.3));
    let rollRad = radians(20 * cos(simT * 0.65) + 5 * cos(simT * 1.8));
    let jolt = pow(max(0, sin(simT * 3.1)), 12) * 0.45;
    ax = sin(pitchRad) + 0.08 * cos(simT * 4.2);
    ay = sin(rollRad) * cos(pitchRad) + 0.08 * sin(simT * 3.7);
    az = cos(pitchRad) * cos(rollRad) + jolt;
    mag = sqrt(ax * ax + ay * ay + az * az);
  }

  smoothAx = lerp(smoothAx, ax, 0.22);
  smoothAy = lerp(smoothAy, ay, 0.22);
  smoothAz = lerp(smoothAz, az, 0.22);
  smoothMag = lerp(smoothMag, mag, 0.22);
  peakG = max(peakG * 0.996, mag);
  if (peakG < 1.0) peakG = 1.0;

  // Header
  drawHeader();

  // Top split: Left = 2D Bubble Inclinometer & G-Sphere, Right = 3-Axis Vector Cube
  let topY = 58;
  let topH = height * 0.48;
  let leftW = width * 0.48 - 20;
  let rightX = width * 0.48 + 4;
  let rightW = width - rightX - 16;

  drawBubbleInclinometer(16, topY, leftW, topH);
  drawVectorCubePanel(rightX, topY, rightW, topH);

  // Bottom: 4-Channel Time-Series Strip Chart (X, Y, Z, ||a|| Magnitude)
  let botY = topY + topH + 12;
  let botH = height - botY - 14;
  drawAccelHistoryChart(16, botY, width - 32, botH);
}

function drawHeader() {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 46);
  stroke(45, 65, 100);
  line(0, 46, width, 46);

  noStroke();
  fill(56, 189, 248);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🧭 SENSOR 1/5 — 3-AXIS ACCELEROMETER (eegData.accel @ 52 Hz)', 16, 16);

  textStyle(NORMAL);
  fill(155, 175, 205);
  textSize(11);
  let statusStr = (eegData && eegData.connected) ? 'LIVE / SIMULATED 52 Hz STREAM' : 'DEMO PREVIEW (Click "Simulate Data" or "Connect Muse")';
  text(`${statusStr}   |   ||a|| = ${smoothMag.toFixed(3)} g   |   Peak = ${peakG.toFixed(2)} g`, 16, 34);
}

function drawBubbleInclinometer(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('GRAVITY SPIRIT LEVEL & LATERAL G-METER', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.55;
  let maxR = min(w, h - 42) * 0.39;

  // Concentric g-rings (0.25g, 0.5g, 0.75g, 1.0g)
  noFill();
  for (let i = 1; i <= 4; i++) {
    let r = maxR * (i / 4);
    stroke(45, 65, 100, i === 4 ? 220 : 120);
    strokeWeight(i === 4 ? 1.8 : 1);
    ellipse(cx, cy, r * 2, r * 2);
  }

  // Crosshairs
  stroke(55, 78, 115, 150);
  line(cx - maxR - 8, cy, cx + maxR + 8, cy);
  line(cx, cy - maxR - 8, cx, cy + maxR + 8);

  // Axis labels
  noStroke();
  fill(130, 155, 190);
  textSize(9);
  textAlign(CENTER, BOTTOM);
  text('+X (FWD)', cx, cy - maxR - 3);
  textAlign(CENTER, TOP);
  text('-X (BACK)', cx, cy + maxR + 3);
  textAlign(LEFT, CENTER);
  text('+Y', cx + maxR + 4, cy);
  textAlign(RIGHT, CENTER);
  text('-Y', cx - maxR - 4, cy);

  // Bubble position mapped from Ay (left/right) and Ax (fwd/back)
  let bx = cx + constrain(smoothAy, -1.0, 1.0) * maxR;
  let by = cy - constrain(smoothAx, -1.0, 1.0) * maxR;

  // Vector line from center to bubble
  stroke(250, 204, 21, 200);
  strokeWeight(2);
  line(cx, cy, bx, by);

  // Glowing bubble
  noStroke();
  fill(56, 189, 248, 55);
  ellipse(bx, by, 34, 34);
  fill(56, 189, 248, 230);
  ellipse(bx, by, 16, 16);
  fill(255);
  ellipse(bx - 3, by - 3, 5, 5);
}

function drawVectorCubePanel(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('3D ACCELERATION VECTOR & COMPONENT GAUGES', x + 12, y + 10);

  // Isometric 3D axes on left half of this card
  let cx = x + w * 0.34;
  let cy = y + h * 0.58;
  let scaleLen = min(w * 0.26, h * 0.32);

  // Isometric projection helper
  const iso = (vx, vy, vz) => ({
    px: cx + (vy - vx * 0.6) * scaleLen,
    py: cy - (vz - (vx * 0.35 + vy * 0.25)) * scaleLen
  });

  // Draw reference axes
  let o = iso(0, 0, 0);
  let xEnd = iso(1.1, 0, 0);
  let yEnd = iso(0, 1.1, 0);
  let zEnd = iso(0, 0, 1.1);

  strokeWeight(1.4);
  stroke(248, 113, 113, 140); line(o.px, o.py, xEnd.px, xEnd.py);
  stroke(52, 211, 153, 140);  line(o.px, o.py, yEnd.px, yEnd.py);
  stroke(96, 165, 250, 140);  line(o.px, o.py, zEnd.px, zEnd.py);

  noStroke();
  textSize(9);
  fill(248, 113, 113); text('X', xEnd.px - 8, xEnd.py + 8);
  fill(52, 211, 153);  text('Y', yEnd.px + 5, yEnd.py + 4);
  fill(96, 165, 250);  text('Z (1g)', zEnd.px - 10, zEnd.py - 8);

  // Resulting 3D acceleration vector
  let vTip = iso(constrain(smoothAx, -1.3, 1.3), constrain(smoothAy, -1.3, 1.3), constrain(smoothAz, -1.3, 1.3));
  stroke(250, 204, 21);
  strokeWeight(3);
  line(o.px, o.py, vTip.px, vTip.py);
  noStroke();
  fill(250, 204, 21);
  ellipse(vTip.px, vTip.py, 9, 9);

  // Component bar gauges on right half of card
  let gx = x + w * 0.60;
  let gw = w * 0.35;
  let rows = [
    { label: 'accel.x (Fwd)', val: smoothAx, min: -1.5, max: 1.5, col: [248, 113, 113] },
    { label: 'accel.y (Lat)', val: smoothAy, min: -1.5, max: 1.5, col: [52, 211, 153] },
    { label: 'accel.z (Vert)', val: smoothAz, min: -1.5, max: 1.5, col: [96, 165, 250] },
    { label: 'accel.magnitude', val: smoothMag, min: 0.0, max: 2.5, col: [250, 204, 21] }
  ];

  for (let i = 0; i < rows.length; i++) {
    let r = rows[i];
    let ry = y + 38 + i * ((h - 48) / 4);
    noStroke();
    fill(185, 205, 230);
    textSize(10);
    textAlign(LEFT, BOTTOM);
    text(r.label, gx, ry);
    textAlign(RIGHT, BOTTOM);
    fill(r.col[0], r.col[1], r.col[2]);
    text(`${r.val >= 0 ? '+' : ''}${r.val.toFixed(3)} g`, gx + gw, ry);

    // Track bar
    fill(26, 36, 56);
    rect(gx, ry + 3, gw, 8, 4);
    let norm = constrain((r.val - r.min) / (r.max - r.min), 0, 1);
    let zeroNorm = constrain((0 - r.min) / (r.max - r.min), 0, 1);
    fill(r.col[0], r.col[1], r.col[2]);
    let barStart = min(zeroNorm, norm) * gw;
    let barW = max(2, abs(norm - zeroNorm) * gw);
    rect(gx + barStart, ry + 3, barW, 8, 3);
  }
}

function drawAccelHistoryChart(x, y, w, h) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('52 Hz ACCELEROMETER WAVEFORMS — eegData.getAllAccelChannels(180)', x + 12, y + 8);

  let N = 180;
  let ch = (eegData && typeof eegData.getAllAccelChannels === 'function')
    ? eegData.getAllAccelChannels(N)
    : { x: [], y: [], z: [], magnitude: [] };

  let plotX = x + 48;
  let plotY = y + 28;
  let plotW = w - 62;
  let plotH = h - 38;

  // Reference lines (-1g, 0g, +1g)
  let yPlus1 = map(1.0, -1.6, 1.8, plotY + plotH, plotY);
  let yZero  = map(0.0, -1.6, 1.8, plotY + plotH, plotY);
  let yMinus1 = map(-1.0, -1.6, 1.8, plotY + plotH, plotY);

  stroke(38, 52, 82);
  strokeWeight(1);
  line(plotX, yPlus1, plotX + plotW, yPlus1);
  line(plotX, yZero, plotX + plotW, yZero);
  line(plotX, yMinus1, plotX + plotW, yMinus1);

  noStroke();
  fill(120, 145, 180);
  textSize(9);
  textAlign(RIGHT, CENTER);
  text('+1.0g', plotX - 6, yPlus1);
  text(' 0.0g', plotX - 6, yZero);
  text('-1.0g', plotX - 6, yMinus1);

  const traces = [
    { arr: ch.x, col: [248, 113, 113], label: 'X' },
    { arr: ch.y, col: [52, 211, 153],  label: 'Y' },
    { arr: ch.z, col: [96, 165, 250],  label: 'Z' },
    { arr: ch.magnitude, col: [250, 204, 21], label: '||a||' }
  ];

  for (let t = 0; t < traces.length; t++) {
    let tr = traces[t];
    noFill();
    stroke(tr.col[0], tr.col[1], tr.col[2], t === 3 ? 240 : 200);
    strokeWeight(t === 3 ? 2.0 : 1.5);
    beginShape();
    let len = tr.arr && tr.arr.length ? tr.arr.length : N;
    for (let i = 0; i < len; i++) {
      let val = (tr.arr && tr.arr.length)
        ? tr.arr[i]
        : (t === 0 ? 0.25 * sin(simT - (len - i) * 0.05)
          : t === 1 ? 0.3 * cos(simT * 0.7 - (len - i) * 0.05)
          : t === 2 ? 0.95 + 0.06 * sin(simT * 1.9 - (len - i) * 0.05)
          : 1.02 + 0.05 * sin(simT * 2.1 - (len - i) * 0.05));
      let px = plotX + (i / max(1, len - 1)) * plotW;
      let py = constrain(map(val, -1.6, 1.8, plotY + plotH, plotY), plotY, plotY + plotH);
      vertex(px, py);
    }
    endShape();

    // Legend pill
    noStroke();
    fill(tr.col[0], tr.col[1], tr.col[2]);
    let lx = x + w - 210 + t * 50;
    rect(lx, y + 10, 10, 8, 2);
    fill(200, 215, 235);
    textAlign(LEFT, TOP);
    text(tr.label, lx + 13, y + 8);
  }
}
