/**
 * @id ppgShortChannelSkinRegression
 * @title Short-Channel PPG Skin Artifact Regression (Athena vs. Classic)
 * @category PPG & Optical (fNIRS)
 * @order 5
 */

// 🔬 Short-Separation PPG / fNIRS Superficial Skin Artifact Regression
// Demonstrates how short-distance optical channels measure superficial scalp/skin
// hemodynamics (cardiac pulse, respiration, Mayer waves) and regress them out of
// deep prefrontal cortical fNIRS signals:
//
//   ΔOD_cortical(t) = ΔOD_long(t) - β · ΔOD_short(t)
//   β = Cov(ΔOD_long, ΔOD_short) / Var(ΔOD_short)
//
// 💡 HARDWARE COMPARISON (Click pills at top or press '1' / '2' / '3' to switch):
//   [1] AUTO-DETECT HARDWARE: Uses eegData.hasDualDistancePPG from your connected Muse
//   [2] MUSE S ATHENA (MS-03): True Dual-Distance Optodes!
//       • Inner Short Channel (d ≈ 8 mm, LI_850 / RI_850): samples ONLY superficial skin/dermis
//       • Outer Long Channel  (d ≈ 20 mm, LO_850 / RO_850): traverses skin + skull + prefrontal cortex
//   [3] CLASSIC MUSE 2 / MUSE S: Single-Distance Optodes (No physical 8 mm channel)
//       • Uses Ambient photodiode (surface light leak/optode slip) + shallow 660 nm Red / high-pass
//         cardiac template as a proxy regressor for superficial scalp pulse.

var SHORT_HIST_LEN = 220;
var uiMode = 'auto'; // 'auto' | 'athena' | 'classic'
var wasLive = false;
var liveHighPassLp = 0;
var traceBuf = {
  longOd: [],
  shortOd: [],
  scaledShortOd: [],
  cleanOd: [],
  rawHbO2: [],
  skinHbO2: [],
  cleanHbO2: [],
  cleanHHb: []
};

var rlsBeta = 0.74;
var rlsCov = 0.0012;
var rlsVar = 0.0016;
var simPhase = 0;
var btnBounds = [];

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
  // Pre-populate history so the visualization is rich immediately on load
  for (let i = 0; i < SHORT_HIST_LEN; i++) {
    stepRegressionSample(true);
  }
}

function getEffectiveHardwareMode() {
  if (uiMode === 'athena') return 'athena';
  if (uiMode === 'classic') return 'classic';
  // Auto mode checks live eegData.hasDualDistancePPG
  if (typeof eegData !== 'undefined' && eegData.connected) {
    return eegData.hasDualDistancePPG ? 'athena' : 'classic';
  }
  return 'athena';
}

function stepRegressionSample(isWarmup = false) {
  simPhase += 1 / 60;
  const effMode = getEffectiveHardwareMode();
  const hasLive = !isWarmup && typeof eegData !== 'undefined' && eegData.connected &&
                  eegData.fnirsRegression && eegData.fnirsRegressionHistory &&
                  Array.isArray(eegData.fnirsRegressionHistory.rawOD850) &&
                  eegData.fnirsRegressionHistory.rawOD850.length > 5;

  let longOd, shortOd, cleanOd, rawHbO2, skinHbO2, cleanHbO2, cleanHHb, beta;

  if (hasLive) {
    const reg = eegData.fnirsRegression;
    const hist = eegData.fnirsRegressionHistory;

    // On first transition from warmup/disconnected to live hardware, replace synthetic buffer with live history
    if (!wasLive) {
      wasLive = true;
      const nCopy = Math.min(SHORT_HIST_LEN, hist.rawOD850.length);
      traceBuf.longOd = hist.rawOD850.slice(-nCopy);
      traceBuf.shortOd = (hist.shortOD850 || []).slice(-nCopy);
      traceBuf.scaledShortOd = (hist.skinFit850 || []).slice(-nCopy);
      traceBuf.cleanOd = (hist.cleanOD850 || []).slice(-nCopy);
      traceBuf.rawHbO2 = (hist.rawHbO2 || []).slice(-nCopy);
      traceBuf.skinHbO2 = (hist.skinHbO2 || []).slice(-nCopy);
      traceBuf.cleanHbO2 = (hist.cleanHbO2 || []).slice(-nCopy);
      traceBuf.cleanHHb = (hist.cleanHHb || []).slice(-nCopy);
    }

    longOd = reg.rawOD850 || 0;
    const liveShortOd = reg.shortOD850 || 0;
    const liveOd660 = reg.rawOD660 || (longOd * 0.75);

    if (effMode === 'athena') {
      // True dual-distance 8mm short + 20mm long optical regression from live headband stream
      shortOd = liveShortOd;
      beta = reg.beta850 || 0.78;
      cleanOd = reg.cleanOD850 !== undefined ? reg.cleanOD850 : (longOd - beta * shortOd);
      rawHbO2 = reg.rawHbO2 || 0;
      skinHbO2 = reg.skinHbO2 || 0;
      cleanHbO2 = reg.cleanHbO2 || 0;
      cleanHHb = reg.cleanHHb || 0;
      rlsBeta = beta;
    } else {
      // Classic Single-Distance Proxy applied to live optical stream (high-pass cardiac + shallow 660nm Red proxy)
      liveHighPassLp = 0.94 * liveHighPassLp + 0.06 * longOd;
      const highPassCardiac = longOd - liveHighPassLp;
      shortOd = 0.65 * highPassCardiac + 0.35 * liveOd660;
      rlsCov = 0.96 * rlsCov + 0.04 * (longOd * shortOd);
      rlsVar = 0.96 * rlsVar + 0.04 * (shortOd * shortOd);
      rlsBeta = constrain(rlsCov / Math.max(1e-9, rlsVar), 0.20, 1.45);
      beta = rlsBeta;
      cleanOd = longOd - beta * shortOd;
      rawHbO2 = reg.rawHbO2 || (longOd * 95.0);
      skinHbO2 = (beta * shortOd) * 95.0;
      cleanHbO2 = cleanOd * 95.0;
      cleanHHb = (reg.cleanHHb || 0) + (liveHighPassLp * 42.0);
    }
  } else {
    wasLive = false;
    // Realistic biophysical generator comparing Athena 8mm/20mm vs Classic Single-Distance Proxy
    const t = simPhase;
    // Superficial scalp interference: strong 1.15 Hz cardiac pulse + 0.25 Hz respiration + 0.1 Hz Mayer wave
    const cardiac = 0.0110 * (0.68 * sin(t * TWO_PI * 1.18) + 0.26 * sin(t * TWO_PI * 2.36 - 0.7));
    const resp    = 0.0042 * sin(t * TWO_PI * 0.26);
    const mayer   = 0.0055 * sin(t * TWO_PI * 0.095 + 0.4);
    const trueSkinOd = cardiac + resp + mayer;

    // Deep prefrontal cortical neurovascular response (slow task-evoked hemodynamic wave)
    const attentionDrive = (typeof eegData !== 'undefined' && eegData.connected) ? eegData.attention : 0.6;
    const trueCorticalOd850 = (0.0052 + 0.0025 * attentionDrive) * sin(t * 0.55) + 0.0022 * cos(t * 0.27);
    const trueCorticalOd660 = -0.42 * trueCorticalOd850; // Reciprocal HHb drop during neural activation

    // Long 20mm channel always contains superficial skin (scaled by ~0.78) + deep cortical signal
    longOd = 0.78 * trueSkinOd + trueCorticalOd850;

    if (effMode === 'athena') {
      // Muse S Athena (MS-03): True 8mm Inner Optode samples pure superficial skin/scalp dermis
      shortOd = trueSkinOd + 0.0003 * sin(t * 9.7);
    } else {
      // Classic Muse 2 / S: Single-distance optode lacks an 8mm channel.
      // Proxy regressor uses Ambient coupling + shallow 660nm high-pass cardiac/respiratory estimate,
      // which captures cardiac well but leaves ~32% residual slow Mayer wave & partial cortical bleed.
      shortOd = 0.88 * cardiac + 0.72 * resp + 0.42 * mayer + 0.15 * trueCorticalOd850;
    }

    // Online Recursive Least Squares (RLS) adaptive scaling factor β
    rlsCov = 0.96 * rlsCov + 0.04 * (longOd * shortOd);
    rlsVar = 0.96 * rlsVar + 0.04 * (shortOd * shortOd);
    rlsBeta = constrain(rlsCov / Math.max(1e-7, rlsVar), 0.25, 1.35);
    beta = rlsBeta;

    cleanOd = longOd - beta * shortOd;

    // Convert ΔOD to Hemoglobin concentrations (µM)
    rawHbO2   = longOd * 95.0;
    skinHbO2  = (beta * shortOd) * 95.0;
    cleanHbO2 = cleanOd * 95.0;
    cleanHHb  = (trueCorticalOd660 + (effMode === 'classic' ? 0.0012 * sin(t * TWO_PI * 0.095) : 0)) * 78.0;
  }

  pushSample(traceBuf.longOd, longOd);
  pushSample(traceBuf.shortOd, shortOd);
  pushSample(traceBuf.scaledShortOd, beta * shortOd);
  pushSample(traceBuf.cleanOd, cleanOd);
  pushSample(traceBuf.rawHbO2, rawHbO2);
  pushSample(traceBuf.skinHbO2, skinHbO2);
  pushSample(traceBuf.cleanHbO2, cleanHbO2);
  pushSample(traceBuf.cleanHHb, cleanHHb);
}

function pushSample(arr, val) {
  arr.push(val);
  if (arr.length > SHORT_HIST_LEN) arr.shift();
}

function computeSuppressionDb() {
  const n = traceBuf.longOd.length;
  if (n < 20) return 0;
  let varRaw = 0, varClean = 0;
  for (let i = n - 60; i < n; i++) {
    if (i < 0) continue;
    varRaw += traceBuf.longOd[i] * traceBuf.longOd[i];
    varClean += traceBuf.cleanOd[i] * traceBuf.cleanOd[i];
  }
  if (varClean <= 1e-12 || varRaw <= varClean) return 0;
  return 10 * Math.log10(varRaw / varClean);
}

function draw() {
  background(11, 15, 25);
  stepRegressionSample(false);

  const effMode = getEffectiveHardwareMode();
  const isAthena = effMode === 'athena';
  const suppDb = computeSuppressionDb();

  // =========================================================================
  // 1. TOP HEADER & INTERACTIVE HARDWARE MODE BAR (Athena vs. Classic Muse)
  // =========================================================================
  const pad = 14;
  fill(18, 25, 42);
  stroke(45, 65, 105);
  strokeWeight(1);
  rect(pad, 10, width - pad * 2, 68, 8);

  noStroke();
  fill(235, 245, 255);
  textSize(11.5);
  textStyle(BOLD);
  text('🔬 Short-Channel PPG Skin Regression', pad + 10, 27);

  textStyle(NORMAL);
  fill(160, 185, 220);
  textSize(9.5);
  const hwDetectedLabel = (typeof eegData !== 'undefined' && eegData.connected)
    ? (eegData.hasDualDistancePPG ? 'Athena Dual-Distance' : 'Classic Muse Proxy')
    : 'Simulator Active';
  text(`ΔOD_clean = ΔOD_long − β·ΔOD_short  |  RLS β = ${rlsBeta.toFixed(2)}  |  Suppression: -${suppDb.toFixed(1)} dB`, pad + 10, 44);

  // Mode explanation badge
  if (isAthena) {
    fill(16, 185, 129, 38);
    stroke(16, 185, 129, 180);
  } else {
    fill(245, 158, 11, 38);
    stroke(245, 158, 11, 180);
  }
  rect(pad + 10, 51, width - pad * 2 - 20, 20, 4);
  noStroke();
  fill(isAthena ? color(110, 245, 195) : color(255, 210, 120));
  textSize(9);
  text(
    isAthena
      ? '✓ MUSE S ATHENA (MS-03): True 8 mm Inner Short Optode (Skin Only) + 20 mm Outer Long Optode (Skin + Cortex)'
      : '⚠ CLASSIC MUSE 2 / S: Single-Distance Only — Using Ambient + Shallow 660 nm Proxy Regressor (Partial Mayer Leak)',
    pad + 16, 64
  );

  // Interactive Mode Switcher Buttons (Top Right)
  btnBounds = [];
  const modes = [
    { id: 'athena',  label: '[1] Athena 8+20mm' },
    { id: 'classic', label: '[2] Classic Proxy' },
    { id: 'auto',    label: '[3] Auto' }
  ];
  textSize(9.5);
  let bx = width - pad - 8;
  for (let i = modes.length - 1; i >= 0; i--) {
    const m = modes[i];
    const bw = textWidth(m.label) + 14;
    bx -= bw;
    const by = 14;
    const bh = 22;
    const active = uiMode === m.id;
    fill(active ? (m.id === 'classic' ? color(195, 115, 15) : color(14, 145, 110)) : color(28, 38, 62));
    stroke(active ? color(140, 255, 220) : color(65, 85, 125));
    strokeWeight(active ? 1.5 : 1);
    rect(bx, by, bw, bh, 5);
    noStroke();
    fill(active ? 255 : 185);
    textAlign(CENTER, CENTER);
    text(m.label, bx + bw / 2, by + bh / 2);
    btnBounds.push({ id: m.id, x: bx, y: by, w: bw, h: bh });
    bx -= 5;
  }
  textAlign(LEFT, BASELINE);

  // =========================================================================
  // 2. LEFT COLUMN: FOREHEAD PHOTON BANANA PATH & HARDWARE OPTODE GEOMETRY
  // =========================================================================
  const topY = 86;
  const contentH = height - topY - 12;
  const leftW = Math.max(255, Math.min(335, width * 0.34));
  const rightX = pad + leftW + 12;
  const rightW = width - rightX - pad;

  drawAnatomicalOptodePanel(pad, topY, leftW, contentH, isAthena, suppDb);

  // =========================================================================
  // 3. RIGHT COLUMN: 4-TIER TIME-ALIGNED SHORT-CHANNEL REGRESSION CASCADE
  // =========================================================================
  drawRegressionStack(rightX, topY, rightW, contentH, isAthena);
}

function drawAnatomicalOptodePanel(x, y, w, h, isAthena, suppDb) {
  fill(16, 22, 37);
  stroke(42, 60, 95);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(220, 235, 255);
  textStyle(BOLD);
  textSize(11.5);
  text(isAthena ? 'FOREHEAD OPTODE GEOMETRY (ATHENA)' : 'FOREHEAD OPTODE GEOMETRY (CLASSIC)', x + 12, y + 22);
  textStyle(NORMAL);
  fill(145, 170, 205);
  textSize(9.5);
  text(
    isAthena
      ? 'Dual-Distance: 8 mm Short + 20 mm Long'
      : 'Single-Distance: ~20 mm Long + Surface Proxy',
    x + 12, y + 36
  );

  // Anatomical Tissue Cross-Section Box
  const diagX = x + 10;
  const diagY = y + 58;
  const diagW = w - 20;
  const diagH = Math.min(132, h * 0.40);

  // Tissue Layers:
  // 1) Epidermis & Dermis (Scalp Skin with superficial arterial pulse)
  const skinH = diagH * 0.28;
  fill(68, 38, 48);
  noStroke();
  rect(diagX, diagY, diagW, skinH, 6, 6, 0, 0);

  // Animated superficial capillary pulse glow inside skin layer
  const pulseGlow = 0.5 + 0.5 * sin(millis() * 0.0075);
  fill(255, 90, 110, 35 + 45 * pulseGlow);
  rect(diagX, diagY, diagW, skinH, 6, 6, 0, 0);

  // 2) Skull / Cranial Bone & CSF
  const skullH = diagH * 0.24;
  fill(45, 52, 68);
  rect(diagX, diagY + skinH, diagW, skullH);

  // 3) Prefrontal Cortex (Gray Matter)
  const cortexH = diagH - skinH - skullH;
  fill(32, 42, 78);
  rect(diagX, diagY + skinH + skullH, diagW, cortexH, 0, 0, 6, 6);

  // Layer labels on left
  fill(255, 165, 175);
  textSize(9);
  text('SCALP / SKIN (~4 mm)\nCardiac + Mayer Artifact', diagX + 6, diagY + 14);
  fill(175, 190, 215);
  text('SKULL & CSF (~7 mm)', diagX + 6, diagY + skinH + 15);
  fill(130, 220, 255);
  text('PREFRONTAL CORTEX\nDeep Neural Δ[HbO2]', diagX + 6, diagY + skinH + skullH + 16);

  // Optode positions on forehead surface (top edge of diagY)
  const srcX   = diagX + diagW * 0.30;
  const shortX = diagX + diagW * 0.54; // 8 mm Inner detector (Athena)
  const longX  = diagX + diagW * 0.86; // 20 mm Outer detector

  // Draw Deep Long-Channel Banana Photon Path (Source -> 20 mm Detector)
  noFill();
  for (let k = 3; k >= 1; k--) {
    stroke(56, 189, 248, 35 * k);
    strokeWeight(k * 3.2);
    bezier(
      srcX, diagY + 2,
      srcX + (longX - srcX) * 0.25, diagY + skinH + skullH + cortexH * 0.78,
      srcX + (longX - srcX) * 0.75, diagY + skinH + skullH + cortexH * 0.78,
      longX, diagY + 2
    );
  }

  // Draw Short-Channel Shallow Banana Path (Athena 8mm) or Surface Proxy (Classic)
  if (isAthena) {
    for (let k = 3; k >= 1; k--) {
      stroke(251, 146, 60, 50 * k);
      strokeWeight(k * 2.6);
      bezier(
        srcX, diagY + 2,
        srcX + (shortX - srcX) * 0.3, diagY + skinH * 0.92,
        srcX + (shortX - srcX) * 0.7, diagY + skinH * 0.92,
        shortX, diagY + 2
      );
    }
  } else {
    // Classic Muse: dashed shallow red/ambient proxy arc
    stroke(250, 204, 21, 180);
    strokeWeight(2);
    bezier(
      srcX, diagY + 2,
      srcX + (longX - srcX) * 0.25, diagY + skinH * 0.85,
      srcX + (longX - srcX) * 0.75, diagY + skinH * 0.85,
      longX, diagY + 2
    );
  }

  // Optode hardware blocks on skin surface
  stroke(255);
  strokeWeight(1);
  // LED Source
  fill(239, 68, 68);
  rect(srcX - 14, diagY - 7, 28, 10, 2);
  // Short Detector (8 mm)
  if (isAthena) {
    fill(251, 146, 60);
    rect(shortX - 14, diagY - 7, 28, 10, 2);
  } else {
    fill(75, 85, 99);
    rect(shortX - 14, diagY - 7, 28, 10, 2);
  }
  // Long Detector (20 mm)
  fill(56, 189, 248);
  rect(longX - 14, diagY - 7, 28, 10, 2);

  noStroke();
  fill(255);
  textSize(7.5);
  textAlign(CENTER, BOTTOM);
  text('LED', srcX, diagY - 8);
  fill(isAthena ? color(253, 186, 116) : color(140, 150, 165));
  text(isAthena ? 'SHORT 8mm' : 'NO 8mm', shortX, diagY - 8);
  fill(125, 211, 252);
  text('LONG 20mm', longX, diagY - 8);
  textAlign(LEFT, BASELINE);

  // Hardware Comparison & Mathematical Summary Card below diagram
  const infoY = diagY + diagH + 8;
  const infoH = h - (infoY - y) - 8;
  fill(12, 17, 30);
  stroke(38, 54, 86);
  rect(diagX, infoY, diagW, infoH, 6);

  noStroke();
  let ty = infoY + 14;
  fill(230, 240, 255);
  textStyle(BOLD);
  textSize(9);
  text('WHY SHORT-CHANNEL REGRESSION?', diagX + 8, ty);
  textStyle(NORMAL);
  ty += 12;
  fill(170, 192, 222);
  textSize(8.2);
  text('• NIR light passes 2× through scalp', diagX + 8, ty); ty += 10.5;
  text('  dermis before/after PFC cortex.', diagX + 8, ty); ty += 12;

  if (isAthena) {
    fill(110, 245, 195);
    textStyle(BOLD);
    text('✓ Muse S Athena (MS-03):', diagX + 8, ty); ty += 10.5;
    textStyle(NORMAL);
    fill(175, 225, 205);
    text('  8mm inner optode (LI/RI) measures', diagX + 8, ty); ty += 10.5;
    text('  pure skin pulse & Mayer waves.', diagX + 8, ty); ty += 12;
  } else {
    fill(255, 210, 120);
    textStyle(BOLD);
    text('⚠ Classic Muse 2 / Muse S:', diagX + 8, ty); ty += 10.5;
    textStyle(NORMAL);
    fill(225, 200, 160);
    text('  Single distance only; regresses', diagX + 8, ty); ty += 10.5;
    text('  Ambient + shallow 660nm proxy.', diagX + 8, ty); ty += 12;
  }

  // Suppression meter bar at bottom of left panel
  if (ty + 22 < infoY + infoH) {
    fill(150, 175, 210);
    textSize(9);
    text(`Artifact Suppression: -${suppDb.toFixed(1)} dB`, diagX + 10, infoY + infoH - 22);
    fill(26, 36, 58);
    rect(diagX + 10, infoY + infoH - 16, diagW - 20, 8, 4);
    fill(isAthena ? color(16, 185, 129) : color(245, 158, 11));
    const barW = map(constrain(suppDb, 0, 16), 0, 16, 0, diagW - 20);
    rect(diagX + 10, infoY + infoH - 16, barW, 8, 4);
  }
}

function drawRegressionStack(x, y, w, h, isAthena) {
  const tiers = [
    {
      title: 'TIER 1: Long Channel ΔOD_long (20 mm)',
      eq: 'Cortex + Skin',
      dataA: traceBuf.longOd,
      colA: color(248, 113, 113),
      labelA: 'Raw 20mm ΔOD_long',
      unit: 'OD'
    },
    {
      title: isAthena
        ? 'TIER 2: Short Ref ΔOD_short (8 mm Inner)'
        : 'TIER 2: Classic Proxy (Ambient + 660nm)',
      eq: isAthena ? '8mm Skin Only' : 'Surface Proxy',
      dataA: traceBuf.shortOd,
      colA: color(251, 146, 60),
      labelA: isAthena ? '8mm Short ΔOD_short' : 'Surface Proxy',
      unit: 'OD'
    },
    {
      title: 'TIER 3: RLS Skin Fit (β·ΔOD_short vs ΔOD_long)',
      eq: `β = ${rlsBeta.toFixed(2)}`,
      dataA: traceBuf.longOd,
      colA: color(248, 113, 113, 130),
      labelA: 'ΔOD_long',
      dataB: traceBuf.scaledShortOd,
      colB: color(250, 204, 21),
      labelB: 'β·ΔOD_short',
      unit: 'OD'
    },
    {
      title: 'TIER 4: Clean Cortical Δ[HbO2] & Δ[HHb]',
      eq: 'ΔOD_long − β·ΔOD_short',
      dataA: traceBuf.cleanHbO2,
      colA: color(52, 211, 153),
      labelA: 'Clean Δ[HbO2]',
      dataB: traceBuf.cleanHHb,
      colB: color(96, 165, 250),
      labelB: 'Clean Δ[HHb]',
      dataGhost: traceBuf.rawHbO2,
      colGhost: color(248, 113, 113, 85),
      labelGhost: '',
      unit: 'µM'
    }
  ];

  const gap = 8;
  const tierH = (h - gap * (tiers.length - 1)) / tiers.length;
  const hoverIdx = (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h)
    ? Math.floor(map(mouseX, x + 12, x + w - 12, 0, Math.max(1, traceBuf.longOd.length - 1), true))
    : -1;

  for (let i = 0; i < tiers.length; i++) {
    const ty = y + i * (tierH + gap);
    const t = tiers[i];

    fill(16, 22, 37);
    stroke(42, 60, 95);
    strokeWeight(1);
    rect(x, ty, w, tierH, 7);

    // Header bar
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

    // Plot area
    const px = x + 12;
    const py = ty + 22;
    const pw = w - 24;
    const ph = tierH - 36;

    // Zero baseline
    stroke(45, 62, 95, 140);
    strokeWeight(1);
    line(px, py + ph / 2, px + pw, py + ph / 2);

    // Compute dynamic scale across active series in this tier
    let maxAbs = 1e-6;
    const allArrays = [t.dataA, t.dataB, t.dataGhost].filter(Boolean);
    for (const arr of allArrays) {
      for (let k = 0; k < arr.length; k++) {
        const v = Math.abs(arr[k]);
        if (v > maxAbs) maxAbs = v;
      }
    }
    maxAbs *= 1.18;

    // Optional ghost trace (e.g. unregressed raw HbO2 on Tier 4)
    if (t.dataGhost && t.dataGhost.length > 1) {
      drawTraceLine(t.dataGhost, px, py, pw, ph, maxAbs, t.colGhost, 1.3);
    }
    // Primary trace A
    if (t.dataA && t.dataA.length > 1) {
      drawTraceLine(t.dataA, px, py, pw, ph, maxAbs, t.colA, 2.1);
    }
    // Secondary trace B
    if (t.dataB && t.dataB.length > 1) {
      drawTraceLine(t.dataB, px, py, pw, ph, maxAbs, t.colB, 1.9);
    }

    // Legend pills inside bottom-left of plot
    let lx = px + 6;
    const ly = ty + tierH - 4;
    noStroke();
    textStyle(NORMAL);
    textSize(8.5);
    if (t.labelA) {
      fill(t.colA);
      const valA = t.dataA.length ? t.dataA[hoverIdx >= 0 ? hoverIdx : t.dataA.length - 1] : 0;
      const sA = `● ${t.labelA}: ${valA >= 0 ? '+' : ''}${valA.toFixed(t.unit === 'µM' ? 2 : 4)} ${t.unit}`;
      text(sA, lx, ly);
      lx += textWidth(sA) + 14;
    }
    if (t.labelB) {
      fill(t.colB);
      const valB = t.dataB.length ? t.dataB[hoverIdx >= 0 ? hoverIdx : t.dataB.length - 1] : 0;
      const sB = `● ${t.labelB}: ${valB >= 0 ? '+' : ''}${valB.toFixed(t.unit === 'µM' ? 2 : 4)} ${t.unit}`;
      text(sB, lx, ly);
      lx += textWidth(sB) + 14;
    }
    if (t.labelGhost) {
      fill(248, 113, 113, 190);
      text(`┄ ${t.labelGhost}`, lx, ly);
    }

    // Time-aligned inspection crosshair across all 4 tiers
    if (hoverIdx >= 0 && t.dataA.length > hoverIdx) {
      const cx = map(hoverIdx, 0, Math.max(1, t.dataA.length - 1), px, px + pw);
      stroke(255, 255, 255, 110);
      strokeWeight(1);
      line(cx, py, cx, py + ph);
      const cy = map(t.dataA[hoverIdx], -maxAbs, maxAbs, py + ph, py);
      fill(t.colA);
      noStroke();
      circle(cx, cy, 6);
    }
  }
}

function drawTraceLine(arr, px, py, pw, ph, maxAbs, col, sw) {
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
  for (const b of btnBounds) {
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      uiMode = b.id;
      return;
    }
  }
}

function keyPressed() {
  if (key === '1') uiMode = 'athena';
  if (key === '2') uiMode = 'classic';
  if (key === '3') uiMode = 'auto';
}
