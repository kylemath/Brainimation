/**
 * @id imuHeadMovementArtifactFilter
 * @title Adaptive IMU Head-Movement Filter (NLMS Artifact Cancellation)
 * @category Motion, IMU & Broadcast Sensors
 * @order 11
 */

// 🛡️ Real-Time 6-DOF IMU Adaptive Filter for Head-Movement Artifacts (NLMS)
// Head nods, shakes, and cable/headband shifts cause mechanical electrode slip on the
// skin that induces large low-frequency voltage swings (15–80 µV) in EEG and optical
// coupling shifts in PPG. Because Muse simultaneously streams 52 Hz 3-axis Accelerometer
// and 3-axis Gyroscope data, we can treat the 6-DOF IMU vector u(t) as a noise reference
// and train a 6-tap Normalized Least Mean Squares (NLMS) adaptive filter in real time:
//
//   Reference Vector:  u(t) = [ a_lin,x,  a_lin,y,  a_lin,z,  ω_x/100,  ω_y/100,  ω_z/100 ]^T
//   Artifact Estimate: m̂(t) = w(t)^T · u(t)                  (eegData.motionArtifact)
//   Cleaned Signal:    e(t) = x_raw(t) - m̂(t)                (eegData.clean)
//   NLMS Weight Step:  w(t+1) = (1 - γ)·w(t) + μ · e(t) · u(t) / (||u(t)||² + ε)
//
// Controls:
//   • Click electrode buttons [AF7] [AF8] [TP9] [TP10] (or keys 1–4) to inspect each channel
//   • Click [⚡ Trigger Head Nod / Jolt] (or press SPACE) to inject a strong 6-DOF motion burst
//     and watch the adaptive NLMS filter lock on and cancel the motion artifact in real time!

var FILT_HIST_LEN = 220;
var FILT_CHANNELS = ['AF7', 'AF8', 'TP9', 'TP10'];
var selectedChIdx = 0; // Default AF7 (forehead channel sensitive to nods)
var joltEnvelope = 0;
var simT = 0;

var localHistory = {
  raw: [],
  artifact: [],
  clean: [],
  trueNeural: [],
  accelMag: [],
  gyroMag: [],
  linAx: [],
  linAz: [],
  gyroY: [],
  gyroZ: []
};

var demoWeights = [12.4, -5.8, 10.2, 6.5, 16.8, -8.4];
var uiButtons = [];
var wasLiveFilter = false;
var lastLoadedChIdx = -1;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  for (let i = 0; i < FILT_HIST_LEN; i++) {
    stepFilterDemo(true);
  }
}

function triggerHeadJolt() {
  joltEnvelope = 1.0;
}

function stepFilterDemo(isWarmup = false) {
  simT += 1 / 60;
  joltEnvelope *= 0.955;

  const chName = FILT_CHANNELS[selectedChIdx];
  const hasLive = !isWarmup && typeof eegData !== 'undefined' && eegData.connected &&
                  Array.isArray(eegData.raw) && eegData.rawHistory &&
                  Array.isArray(eegData.rawHistory[chName]) &&
                  eegData.rawHistory[chName].length > 5;

  let rawVal, artVal, cleanVal, trueBrainVal;
  let linAx, linAy, linAz, gx, gy, gz;

  if (hasLive) {
    // Map channel name to eegData index (0=TP9, 1=AF7, 2=AF8, 3=TP10)
    const eegIdx = chName === 'TP9' ? 0 : chName === 'AF7' ? 1 : chName === 'AF8' ? 2 : 3;

    // Sync rolling buffer on first live frame or when user switches electrode tab
    if (!wasLiveFilter || lastLoadedChIdx !== selectedChIdx) {
      wasLiveFilter = true;
      lastLoadedChIdx = selectedChIdx;
      const rawH = (eegData.rawHistory && eegData.rawHistory[chName]) || [];
      const artH = (eegData.motionArtifactHistory && eegData.motionArtifactHistory[chName]) || [];
      const clnH = (eegData.cleanHistory && eegData.cleanHistory[chName]) || [];
      const kAx  = (eegData.kinematicsHistory && eegData.kinematicsHistory.linAccX) || [];
      const kAz  = (eegData.kinematicsHistory && eegData.kinematicsHistory.linAccZ) || [];
      const gYH  = (eegData.gyroHistory && eegData.gyroHistory.y) || [];
      const gZH  = (eegData.gyroHistory && eegData.gyroHistory.z) || [];
      const nCopy = Math.min(FILT_HIST_LEN, rawH.length);
      localHistory.raw = rawH.slice(-nCopy);
      localHistory.artifact = artH.length >= nCopy ? artH.slice(-nCopy) : new Array(nCopy).fill(0);
      localHistory.clean = clnH.length >= nCopy ? clnH.slice(-nCopy) : localHistory.raw.slice();
      localHistory.trueNeural = localHistory.clean.slice();
      localHistory.linAx = kAx.length ? kAx.slice(-nCopy) : new Array(nCopy).fill(0);
      localHistory.linAz = kAz.length ? kAz.slice(-nCopy) : new Array(nCopy).fill(0);
      localHistory.gyroY = gYH.length ? gYH.slice(-nCopy).map(v => v / 15.0) : new Array(nCopy).fill(0);
      localHistory.gyroZ = gZH.length ? gZH.slice(-nCopy).map(v => v / 15.0) : new Array(nCopy).fill(0);
    }

    rawVal   = (eegData.raw && eegData.raw[eegIdx]) || 0;
    artVal   = (eegData.motionArtifact && eegData.motionArtifact[eegIdx]) || 0;
    cleanVal = (eegData.clean && eegData.clean[eegIdx]) || (rawVal - artVal);

    linAx = (eegData.linearAccel && eegData.linearAccel.x) || 0;
    linAy = (eegData.linearAccel && eegData.linearAccel.y) || 0;
    linAz = (eegData.linearAccel && eegData.linearAccel.z) || 0;
    gx    = (eegData.gyro && eegData.gyro.x) || 0;
    gy    = (eegData.gyro && eegData.gyro.y) || 0;
    gz    = (eegData.gyro && eegData.gyro.z) || 0;

    if (eegData.motionFilterWeights && eegData.motionFilterWeights[chName]) {
      demoWeights = eegData.motionFilterWeights[chName].slice();
    }

    // Optional interactive Jolt impulse superimposed on live stream when user clicks Jolt / presses Space
    if (joltEnvelope > 0.01) {
      const joltWave = 2.2 * joltEnvelope * sin(simT * 14.0);
      linAx += 1.2 * joltWave;
      linAz += 0.9 * joltWave;
      gy    += 42.0 * joltWave;
      const joltArt = (demoWeights[0] * 1.2 + demoWeights[2] * 0.9 + demoWeights[4] * (42.0 / 60.0)) * joltWave;
      rawVal += joltArt;
      artVal += joltArt * 0.92;
      cleanVal = rawVal - artVal;
    }
    trueBrainVal = cleanVal;
  } else {
    wasLiveFilter = false;
    // Biophysical + 6-DOF kinematic head movement generator (continuous rhythmic motion + optional jolt)
    const t = simT;
    const burst = 1.0 + 2.4 * joltEnvelope * sin(t * 14.0);

    // 6-DOF IMU components: rhythmic head nod (pitch ω_y, a_x/a_z) + head turn (yaw ω_z, a_y)
    linAx = (1.35 * sin(t * 2.1) + 0.55 * cos(t * 4.3)) * burst;
    linAy = (0.95 * cos(t * 1.55)) * burst;
    linAz = (1.15 * sin(t * 2.1 - 0.35)) * burst;
    gx    = (22.0 * sin(t * 1.55)) * burst;
    gy    = (48.0 * cos(t * 2.1) + 18.0 * sin(t * 4.3)) * burst;
    gz    = (34.0 * sin(t * 1.25)) * burst;

    // Underlying clean cortical EEG (10 Hz Alpha + 21 Hz Beta + 6 Hz Theta, ~14 µV p-p)
    const chPhase = selectedChIdx * 0.85;
    trueBrainVal = 8.5 * sin(TWO_PI * 10.2 * t + chPhase) +
                   4.2 * sin(TWO_PI * 21.5 * t - chPhase) +
                   3.8 * cos(TWO_PI * 5.8 * t);

    // True mechanical electrode movement artifact coupled from 6-DOF IMU
    const u = [linAx, linAy, linAz, gx / 100.0, gy / 100.0, gz / 100.0];
    const trueCoupling = selectedChIdx < 2
      ? [13.5, -5.2, 11.0, 6.0, 22.5, -9.0]  // Frontal AF7/AF8 (strong pitch nod sensitivity)
      : [-8.5, 14.8, 7.5, 16.0, -9.5, 21.0]; // Temporal TP9/TP10 (strong roll/yaw ear sensitivity)

    let trueMotionArtifact = 0;
    for (let k = 0; k < 6; k++) trueMotionArtifact += trueCoupling[k] * u[k];

    rawVal = trueBrainVal + trueMotionArtifact;

    // Run live 6-tap NLMS adaptive filter step
    let mHat = 0;
    let normSq = 0.02;
    for (let k = 0; k < 6; k++) {
      mHat += demoWeights[k] * u[k];
      normSq += u[k] * u[k];
    }
    cleanVal = rawVal - mHat;
    artVal = mHat;

    const mu = 0.14;
    for (let k = 0; k < 6; k++) {
      demoWeights[k] = constrain(0.995 * demoWeights[k] + (mu * cleanVal * u[k]) / normSq, -26, 26);
    }
  }

  pushHist(localHistory.raw, rawVal);
  pushHist(localHistory.artifact, artVal);
  pushHist(localHistory.clean, cleanVal);
  pushHist(localHistory.trueNeural, trueBrainVal);
  pushHist(localHistory.linAx, linAx);
  pushHist(localHistory.linAz, linAz);
  pushHist(localHistory.gyroY, gy / 15.0);
  pushHist(localHistory.gyroZ, gz / 15.0);
}

function pushHist(arr, v) {
  arr.push(v);
  if (arr.length > FILT_HIST_LEN) arr.shift();
}

function computeSnrGainDb() {
  const n = localHistory.raw.length;
  if (n < 25) return 0;
  let powRaw = 0, powClean = 0;
  for (let i = n - 60; i < n; i++) {
    if (i < 0) continue;
    powRaw += localHistory.raw[i] * localHistory.raw[i];
    powClean += localHistory.clean[i] * localHistory.clean[i];
  }
  if (powClean <= 1e-9 || powRaw <= powClean) return 0;
  return 10 * Math.log10(powRaw / powClean);
}

function draw() {
  background(11, 15, 25);
  stepFilterDemo(false);

  const pad = 14;
  const chName = FILT_CHANNELS[selectedChIdx];
  const snrDb = computeSnrGainDb();

  // =========================================================================
  // 1. TOP CONTROL & FORMULA HEADER
  // =========================================================================
  fill(18, 25, 42);
  stroke(45, 65, 105);
  strokeWeight(1);
  rect(pad, 10, width - pad * 2, 62, 8);

  noStroke();
  fill(235, 245, 255);
  textStyle(BOLD);
  textSize(12);
  text('🛡️ Adaptive IMU Head-Movement Filter (NLMS)', pad + 10, 28);

  textStyle(NORMAL);
  fill(155, 182, 220);
  textSize(9.5);
  text(
    `Ch: ${chName}  |  e_clean(t) = x_raw(t) − wᵀ·u_IMU(t)  |  API: eegData.getCleanChannel("${chName}")  |  Gain: -${snrDb.toFixed(1)} dB`,
    pad + 10, 48
  );

  // Interactive Electrode & Jolt Buttons on top right
  uiButtons = [];
  textSize(9.5);
  let bx = width - pad - 8;

  // Jolt trigger button
  const joltLabel = '⚡ Jolt (Space)';
  const joltW = textWidth(joltLabel) + 14;
  bx -= joltW;
  fill(joltEnvelope > 0.15 ? color(225, 65, 85) : color(145, 45, 75));
  stroke(255, 130, 150);
  rect(bx, 14, joltW, 22, 5);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  text(joltLabel, bx + joltW / 2, 25);
  uiButtons.push({ type: 'jolt', x: bx, y: 14, w: joltW, h: 22 });
  bx -= 8;

  // Channel selector pills
  for (let i = FILT_CHANNELS.length - 1; i >= 0; i--) {
    const lbl = `${FILT_CHANNELS[i]}`;
    const bw = textWidth(lbl) + 14;
    bx -= bw;
    const active = selectedChIdx === i;
    fill(active ? color(37, 99, 235) : color(28, 38, 62));
    stroke(active ? color(147, 197, 253) : color(65, 85, 125));
    rect(bx, 14, bw, 22, 5);
    noStroke();
    fill(active ? 255 : 185);
    text(lbl, bx + bw / 2, 25);
    uiButtons.push({ type: 'ch', idx: i, x: bx, y: 14, w: bw, h: 22 });
    bx -= 5;
  }
  textAlign(LEFT, BASELINE);

  // =========================================================================
  // 2. LEFT PANEL: 3D HEAD MOTION VECTOR & LIVE 6-TAP NLMS WEIGHTS w(t)
  // =========================================================================
  const topY = 80;
  const contentH = height - topY - 12;
  const leftW = Math.max(250, Math.min(320, width * 0.32));
  const rightX = pad + leftW + 12;
  const rightW = width - rightX - pad;

  drawLeftFilterPanel(pad, topY, leftW, contentH, chName, snrDb);

  // =========================================================================
  // 3. RIGHT PANEL: 4-TIER TIME-ALIGNED ADAPTIVE FILTERING CASCADE
  // =========================================================================
  drawRightFilterCascade(rightX, topY, rightW, contentH, chName);
}

function drawLeftFilterPanel(x, y, w, h, chName, snrDb) {
  fill(16, 22, 37);
  stroke(42, 60, 95);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(225, 238, 255);
  textStyle(BOLD);
  textSize(11.5);
  text(`6-TAP NLMS WEIGHTS (${chName})`, x + 12, y + 22);
  textStyle(NORMAL);
  fill(145, 170, 205);
  textSize(9.5);
  text('eegData.motionFilterWeights.' + chName, x + 12, y + 36);

  // Draw 6 horizontal diverging weight bars for [w_ax, w_ay, w_az, w_gx, w_gy, w_gz]
  const tapLabels = [
    'w_ax (Lin Accel X)',
    'w_ay (Lin Accel Y)',
    'w_az (Lin Accel Z)',
    'w_gx (Roll Gyro X)',
    'w_gy (Pitch Gyro Y)',
    'w_gz (Yaw Gyro Z)'
  ];
  const barX = x + 12;
  const barW = w - 24;
  let by = y + 48;
  const rowH = Math.min(28, (h * 0.44) / 6);

  for (let k = 0; k < 6; k++) {
    const wk = demoWeights[k] || 0;
    fill(22, 30, 50);
    stroke(45, 62, 95);
    rect(barX, by, barW, rowH - 4, 4);

    // Center zero line
    const midX = barX + barW * 0.58;
    stroke(90, 115, 155);
    line(midX, by + 2, midX, by + rowH - 6);

    // Weight bar
    const maxW = barW * 0.38;
    const len = constrain(map(Math.abs(wk), 0, 28, 0, maxW), 0, maxW);
    noStroke();
    fill(k < 3 ? color(56, 189, 248) : color(250, 204, 21));
    if (wk >= 0) {
      rect(midX, by + 4, len, rowH - 12, 2);
    } else {
      rect(midX - len, by + 4, len, rowH - 12, 2);
    }

    fill(200, 218, 245);
    textSize(9);
    text(tapLabels[k], barX + 6, by + rowH * 0.62);
    textAlign(RIGHT, BASELINE);
    fill(240, 248, 255);
    text((wk >= 0 ? '+' : '') + wk.toFixed(1), barX + barW - 5, by + rowH * 0.62);
    textAlign(LEFT, BASELINE);

    by += rowH;
  }

  // Signal Flow Block Diagram Card below weights
  const cardY = by + 8;
  const cardH = h - (cardY - y) - 12;
  fill(12, 17, 30);
  stroke(38, 54, 86);
  rect(barX, cardY, barW, cardH, 6);

  noStroke();
  let ty = cardY + 15;
  fill(230, 240, 255);
  textStyle(BOLD);
  textSize(9);
  text('NLMS NOISE CANCELLATION', barX + 8, ty);
  textStyle(NORMAL);
  ty += 12;

  fill(170, 195, 228);
  textSize(8.2);
  text('1. Raw EEG: s_brain + m_motion', barX + 8, ty); ty += 11;
  fill(56, 189, 248);
  text('2. IMU Ref: u = [a_lin, ω]ᵀ', barX + 8, ty); ty += 11;
  fill(52, 211, 153);
  text('3. Clean:   e = x_raw − wᵀ·u', barX + 8, ty); ty += 12;
  fill(150, 175, 210);
  text('Removes head-nod drift while', barX + 8, ty); ty += 10;
  text('preserving Alpha/Beta waves.', barX + 8, ty);

  // Bottom SNR suppression bar
  if (cardY + cardH - 28 > ty) {
    fill(165, 190, 225);
    textSize(9);
    text(`Artifact Rejection Gain: -${snrDb.toFixed(1)} dB`, barX + 10, cardY + cardH - 18);
    fill(26, 36, 58);
    rect(barX + 10, cardY + cardH - 13, barW - 20, 7, 3);
    fill(52, 211, 153);
    rect(barX + 10, cardY + cardH - 13, map(constrain(snrDb, 0, 18), 0, 18, 0, barW - 20), 7, 3);
  }
}

function drawRightFilterCascade(x, y, w, h, chName) {
  const tiers = [
    {
      title: `TIER 1: Raw Contaminated EEG (${chName})`,
      eq: 's_brain + m_motion',
      dataA: localHistory.raw,
      colA: color(248, 113, 113),
      labelA: `Raw ${chName}`,
      unit: 'µV',
      fixedMax: 12
    },
    {
      title: 'TIER 2: 6-DOF IMU Regressors',
      eq: 'u_IMU = [a_lin, ω]ᵀ',
      dataA: localHistory.linAx,
      colA: color(56, 189, 248),
      labelA: 'LinAccel X (m/s²)',
      dataB: localHistory.gyroY,
      colB: color(250, 204, 21),
      labelB: 'Pitch ω_y',
      unit: '',
      fixedMax: 0.45
    },
    {
      title: 'TIER 3: NLMS Artifact Fit m̂(t)',
      eq: 'm̂(t) = wᵀ · u_IMU(t)',
      dataA: localHistory.raw,
      colA: color(248, 113, 113, 115),
      labelA: `Raw ${chName}`,
      dataB: localHistory.artifact,
      colB: color(251, 146, 60),
      labelB: 'Artifact m̂(t)',
      unit: 'µV',
      fixedMax: 12
    },
    {
      title: `TIER 4: Cleaned EEG Output (${chName})`,
      eq: 'e_clean = x_raw − m̂(t)',
      dataA: localHistory.clean,
      colA: color(52, 211, 153),
      labelA: `Clean ${chName}`,
      dataGhost: localHistory.raw,
      colGhost: color(248, 113, 113, 80),
      labelGhost: '',
      unit: 'µV',
      fixedMax: 12
    }
  ];

  const gap = 8;
  const tierH = (h - gap * (tiers.length - 1)) / tiers.length;
  const hoverIdx = (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h)
    ? Math.floor(map(mouseX, x + 12, x + w - 12, 0, Math.max(1, localHistory.raw.length - 1), true))
    : -1;

  for (let i = 0; i < tiers.length; i++) {
    const ty = y + i * (tierH + gap);
    const t = tiers[i];

    fill(16, 22, 37);
    stroke(42, 60, 95);
    strokeWeight(1);
    rect(x, ty, w, tierH, 7);

    noStroke();
    fill(225, 238, 255);
    textStyle(BOLD);
    textSize(9.5);
    text(t.title, x + 10, ty + 15);

    fill(135, 165, 205);
    textStyle(NORMAL);
    textSize(8.5);
    textAlign(RIGHT, BASELINE);
    text(t.eq, x + w - 10, ty + 15);
    textAlign(LEFT, BASELINE);

    const px = x + 12;
    const py = ty + 22;
    const pw = w - 24;
    const ph = tierH - 36;

    stroke(45, 62, 95, 140);
    strokeWeight(1);
    line(px, py + ph / 2, px + pw, py + ph / 2);

    let maxAbs = t.fixedMax || 10;
    const allSeries = [t.dataA, t.dataB, t.dataGhost].filter(Boolean);
    for (const s of allSeries) {
      for (let k = 0; k < s.length; k++) {
        if (Math.abs(s[k]) * 1.15 > maxAbs) maxAbs = Math.abs(s[k]) * 1.15;
      }
    }

    if (t.dataGhost && t.dataGhost.length > 1) {
      drawSeries(t.dataGhost, px, py, pw, ph, maxAbs, t.colGhost, 1.2);
    }
    if (t.dataA && t.dataA.length > 1) {
      drawSeries(t.dataA, px, py, pw, ph, maxAbs, t.colA, 2.0);
    }
    if (t.dataB && t.dataB.length > 1) {
      drawSeries(t.dataB, px, py, pw, ph, maxAbs, t.colB, 1.9);
    }

    // Legend row
    let lx = px + 6;
    const ly = ty + tierH - 4;
    noStroke();
    textStyle(NORMAL);
    textSize(8.5);
    if (t.labelA && t.dataA.length) {
      fill(t.colA);
      const vA = t.dataA[hoverIdx >= 0 ? hoverIdx : t.dataA.length - 1];
      const strA = `● ${t.labelA}: ${vA >= 0 ? '+' : ''}${vA.toFixed(1)} ${t.unit}`;
      text(strA, lx, ly);
      lx += textWidth(strA) + 14;
    }
    if (t.labelB && t.dataB && t.dataB.length) {
      fill(t.colB);
      const vB = t.dataB[hoverIdx >= 0 ? hoverIdx : t.dataB.length - 1];
      const strB = `● ${t.labelB}: ${vB >= 0 ? '+' : ''}${vB.toFixed(1)} ${t.unit}`;
      text(strB, lx, ly);
      lx += textWidth(strB) + 14;
    }
    if (t.labelGhost) {
      fill(248, 113, 113, 185);
      text(`┄ ${t.labelGhost}`, lx, ly);
    }

    if (hoverIdx >= 0 && t.dataA.length > hoverIdx) {
      const cx = map(hoverIdx, 0, Math.max(1, t.dataA.length - 1), px, px + pw);
      stroke(255, 255, 255, 110);
      strokeWeight(1);
      line(cx, py, cx, py + ph);
      const cy = map(constrain(t.dataA[hoverIdx], -maxAbs, maxAbs), -maxAbs, maxAbs, py + ph, py);
      fill(t.colA);
      noStroke();
      circle(cx, cy, 6);
    }
  }
}

function drawSeries(arr, px, py, pw, ph, maxAbs, col, sw) {
  noFill();
  stroke(col);
  strokeWeight(sw);
  beginShape();
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    const vx = map(i, 0, Math.max(1, n - 1), px, px + pw);
    const vy = map(constrain(arr[i], -maxAbs, maxAbs), -maxAbs, maxAbs, py + ph, py);
    vertex(vx, vy);
  }
  endShape();
}

function mousePressed() {
  for (const b of uiButtons) {
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      if (b.type === 'jolt') {
        triggerHeadJolt();
      } else if (b.type === 'ch') {
        selectedChIdx = b.idx;
      }
      return;
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    triggerHeadJolt();
    return false;
  }
  if (key >= '1' && key <= '4') {
    selectedChIdx = int(key) - 1;
  }
}
