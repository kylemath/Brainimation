/**
 * @id ppgStackedDerivation
 * @title Stacked Derivation: Long/Short LEDs -> ΔOD -> Short-Ch Regression -> Oxy/Deoxy & HR
 * @category PPG & Optical (fNIRS)
 * @order 4
 */
// Technical 5-Tier Stacked Hemodynamic & Short-Channel Regression Derivation Cascade
// Shows step-by-step how raw Long (20 mm) and Short (8 mm) optical channels are transformed into
// skin-regressed cortical hemodynamics and a smoothed Oxy-Hb / ΔOD cardiac pulse wave:
//   Tier 1: Long (20 mm) & Short (8 mm) Raw Optical Channels ΔI_L(λ, t) & ΔI_S(λ, t) (660/730/850 nm)
//   Tier 2: Long vs Short Optical Density Attenuation ΔOD_L(λ) & ΔOD_S(λ) = -ln( I(λ,t) / I0(λ) )
//   Tier 3: Short-Channel Skin Regression Derivation ΔOD_clean(λ) = ΔOD_long(λ) - β · ΔOD_short(λ)
//   Tier 4: MBLL Matrix Inversion — Clean Cortical Δ[HbO2]_clean & Δ[HHb]_clean vs Skin Δ[HbO2]_skin
//   Tier 5: Clean Cortical Δ[HbT], Δ[HbD] & Smoothed Vascular Oxy-Hb / ΔOD Cardiac Wave (Heart Rate BPM)
//
// Controls (Top Bar Buttons or Keyboard Shortcuts):
//   - [Smooth Tier 1: ON/OFF] (or 'S'): Toggle EMA smoothing on Tier 1 raw channels to compare BLE packet steps vs smooth interpolation
//   - [↺ Re-Zero I₀ & β]      (or 'R'): Reset baseline I0(λ) and adaptive regression buffer
//   - Move mouse horizontally over the stack to inspect exact time-aligned values across all 5 tiers!

const HIST_LEN = 260;
let stackHistory = [];
let baseI0 = {
  lRed: null, lNIR: null, lIR: null, lAmb: null,
  sRed: null, sNIR: null, sIR: null
};
let smoothRawTier1 = true;
let betaOls = 0.78;
let cardiacBaseOxy = 0;
let lastBeatFrame = -999;
let uiButtons = [];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function resetDerivation() {
  baseI0 = {
    lRed: null, lNIR: null, lIR: null, lAmb: null,
    sRed: null, sNIR: null, sIR: null
  };
  stackHistory = [];
  betaOls = 0.78;
  cardiacBaseOxy = 0;
}

function mousePressed() {
  for (const btn of uiButtons) {
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h) {
      if (btn.id === 'smoothRaw') smoothRawTier1 = !smoothRawTier1;
      else if (btn.id === 'reset') resetDerivation();
      return;
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') smoothRawTier1 = !smoothRawTier1;
  else if (key === 'r' || key === 'R') resetDerivation();
}

function meanLongSample(chKey, fallbackKey, n = 3) {
  if (typeof eegData.getLongPPGChannel === 'function') {
    const lArr = eegData.getLongPPGChannel(chKey, n);
    if (lArr && lArr.length > 0) {
      let s = 0;
      for (let i = 0; i < lArr.length; i++) s += lArr[i];
      return s / lArr.length;
    }
  }
  let arr = eegData.getPPGChannel(chKey, n);
  if (!arr || arr.length === 0) arr = eegData.getPPGChannel(fallbackKey, n);
  if (!arr || arr.length === 0) return null;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function meanShortSample(chKey, fallbackLongVal, n = 3) {
  if (typeof eegData.getShortPPGChannel === 'function') {
    const sArr = eegData.getShortPPGChannel(chKey, n);
    if (sArr && sArr.length > 0) {
      let s = 0;
      for (let i = 0; i < sArr.length; i++) s += sArr[i];
      return s / sArr.length;
    }
  }
  if (eegData.ppgShort && eegData.ppgShort[chKey] > 0) {
    return eegData.ppgShort[chKey];
  }
  return fallbackLongVal;
}

/**
 * 3-wavelength Modified Beer-Lambert Law (MBLL) Least-Squares Inversion:
 * Given ΔOD at 660 nm, 730 nm, and 850 nm and pathlengths L = d * DPF [cm],
 * solves [ΔHbO2, ΔHHb]^T = (E * L)^+ * ΔOD in µM.
 */
function solveMBLL3(od660, od730, od850, pathScale = 1.0) {
  const rows = [
    { kOxy: 0.3196 * 13.0 * pathScale, kDeoxy: 3.2266 * 13.0 * pathScale, od: od660 },
    { kOxy: 0.3900 * 12.4 * pathScale, kDeoxy: 1.1022 * 12.4 * pathScale, od: od730 },
    { kOxy: 1.0580 * 11.6 * pathScale, kDeoxy: 0.6913 * 11.6 * pathScale, od: od850 }
  ];
  let a00 = 0, a01 = 0, a11 = 0, b0 = 0, b1 = 0;
  for (const r of rows) {
    a00 += r.kOxy * r.kOxy;
    a01 += r.kOxy * r.kDeoxy;
    a11 += r.kDeoxy * r.kDeoxy;
    b0  += r.kOxy * r.od;
    b1  += r.kDeoxy * r.od;
  }
  const det = a00 * a11 - a01 * a01 || 1e-9;
  return {
    hbO2: (( a11 * b0 - a01 * b1) / det) * 1000.0, // µM
    hhb:  ((-a01 * b0 + a00 * b1) / det) * 1000.0  // µM
  };
}

function draw() {
  background(225, 38, 7);

  // Sample Long (20 mm) and Short (8 mm) optical channels (or realistic live fallback when disconnected)
  const t = millis() * 0.001;
  let lRed = meanLongSample('red660', 'red', 3);
  let lNIR = meanLongSample('nir730', 'optics4', 3);
  let lIR  = meanLongSample('ir850',  'infrared', 3);
  let lAmb = meanLongSample('ambient', 'ambient', 3);

  let sRed = meanShortSample('red660', lRed, 3);
  let sNIR = meanShortSample('nir730', lNIR, 3);
  let sIR  = meanShortSample('ir850',  lIR, 3);

  if (lRed === null || lIR === null || lRed <= 0) {
    const pulse = 0.5 + 0.45 * sin(t * 7.2) + 0.18 * sin(t * 14.4 - 0.8);
    const mayerWave = sin(t * 0.62) * 0.0016;
    const corticalWave = (0.55 * sin(t * 0.38) + 0.35 * cos(t * 0.82)) * 0.0019;
    lAmb = 12000 + 30 * sin(t * 0.9);
    // Short 8mm channels: superficial arterial pulse + Mayer wave only
    sRed = 162000 * exp(-(0.0038 * (pulse - 0.5) + mayerWave * 1.6));
    sNIR = 178000 * exp(-(0.0046 * (pulse - 0.5) + mayerWave * 1.9));
    sIR  = 185000 * exp(-(0.0072 * (pulse - 0.5) + mayerWave * 2.5));
    // Long 20mm channels: superficial skin + deep prefrontal cortical response
    lRed = 162000 * exp(-(0.0042 * (pulse - 0.5) + mayerWave * 1.8 - corticalWave * 1.4));
    lNIR = 178000 * exp(-(0.0052 * (pulse - 0.5) + mayerWave * 2.1 + corticalWave * 0.9));
    lIR  = 185000 * exp(-(0.0082 * (pulse - 0.5) + mayerWave * 2.8 + corticalWave * 3.6));
  }

  // Adaptive baseline I0(λ) tracking for both Long (20 mm) and Short (8 mm) channels
  if (!baseI0.lRed ||
      Math.abs(lIR - baseI0.lIR) / Math.max(1, baseI0.lIR) > 0.08 ||
      Math.abs(sIR - baseI0.sIR) / Math.max(1, baseI0.sIR) > 0.08) {
    baseI0.lRed = lRed; baseI0.lNIR = lNIR || lIR; baseI0.lIR = lIR; baseI0.lAmb = lAmb || 12000;
    baseI0.sRed = sRed || lRed; baseI0.sNIR = sNIR || lNIR || lIR; baseI0.sIR = sIR || lIR;
    stackHistory = [];
  } else {
    const a0 = 0.992, b0 = 0.008;
    baseI0.lRed = a0 * baseI0.lRed + b0 * lRed;
    baseI0.lNIR = a0 * baseI0.lNIR + b0 * (lNIR || lIR);
    baseI0.lIR  = a0 * baseI0.lIR  + b0 * lIR;
    baseI0.lAmb = a0 * baseI0.lAmb + b0 * (lAmb || 12000);
    baseI0.sRed = a0 * baseI0.sRed + b0 * (sRed || lRed);
    baseI0.sNIR = a0 * baseI0.sNIR + b0 * (sNIR || lNIR || lIR);
    baseI0.sIR  = a0 * baseI0.sIR  + b0 * (sIR || lIR);
  }

  // =========================================================================
  // TIER 1 -> TIER 2: Long (20mm) & Short (8mm) Optical Density ΔOD(λ) = -ln(I / I0)
  // =========================================================================
  const lOD660 = -Math.log(Math.max(1, lRed) / baseI0.lRed);
  const lOD730 = -Math.log(Math.max(1, lNIR) / baseI0.lNIR);
  const lOD850 = -Math.log(Math.max(1, lIR)  / baseI0.lIR);

  let sOD660 = -Math.log(Math.max(1, sRed) / baseI0.sRed);
  let sOD730 = -Math.log(Math.max(1, sNIR) / baseI0.sNIR);
  let sOD850 = -Math.log(Math.max(1, sIR)  / baseI0.sIR);

  // If connected to Classic single-distance Muse where sIR == lIR, use shallower 660nm Red + Ambient as superficial proxy
  if (Math.abs(sOD850 - lOD850) < 1e-7 && Math.abs(lOD660) > 1e-7) {
    sOD850 = lOD660 * 0.82;
    sOD730 = lOD660 * 0.85;
    sOD660 = lOD660 * 0.88;
  }

  // =========================================================================
  // TIER 2 -> TIER 3: Short-Channel OLS Regression ΔOD_clean(λ) = ΔOD_long(λ) - β · ΔOD_short(λ)
  // =========================================================================
  if (eegData.fnirsRegression && typeof eegData.fnirsRegression.beta850 === 'number' && eegData.connected) {
    betaOls = lerp(betaOls, eegData.fnirsRegression.beta850, 0.25);
  } else if (stackHistory.length >= 16) {
    let cov = 0, varS = 0;
    const W = Math.min(96, stackHistory.length);
    for (let i = stackHistory.length - W; i < stackHistory.length; i++) {
      const dl = stackHistory[i].lOD850;
      const ds = stackHistory[i].sOD850;
      cov += dl * ds;
      varS += ds * ds;
    }
    if (varS > 1e-11) {
      const estBeta = constrain(Math.abs(cov) / (varS + 1e-11), 0.25, 1.55);
      betaOls = 0.92 * betaOls + 0.08 * estBeta;
    }
  }

  const skinFit850 = betaOls * sOD850;
  const skinFit730 = (betaOls * 1.01) * sOD730;
  const skinFit660 = (betaOls * 1.03) * sOD660;

  const cleanOD850 = lOD850 - skinFit850;
  const cleanOD730 = lOD730 - skinFit730;
  const cleanOD660 = lOD660 - skinFit660;

  // =========================================================================
  // TIER 3 -> TIER 4: MBLL Matrix Inversion for Uncorrected, Skin, and Clean Cortical Hb
  // =========================================================================
  const rawHb   = solveMBLL3(lOD660, lOD730, lOD850, 1.0);
  const skinHb  = solveMBLL3(skinFit660, skinFit730, skinFit850, 1.0);
  const cleanHb = solveMBLL3(cleanOD660, cleanOD730, cleanOD850, 1.0);

  // =========================================================================
  // TIER 4 -> TIER 5: Clean Cortical HbT / HbD & Smoothed Vascular Oxy-Hb Cardiac Wave
  // =========================================================================
  const cleanHbT = cleanHb.hbO2 + cleanHb.hhb;
  const cleanHbD = cleanHb.hbO2 - cleanHb.hhb;

  const prev = stackHistory.length ? stackHistory[stackHistory.length - 1] : null;
  const sm = 0.26; // 1st-order EMA low-pass coefficient (interpolates across BLE packet steps & removes shot noise)
  const smRaw = smoothRawTier1 ? 0.28 : 1.0;

  const rawLongIR  = lIR  - baseI0.lIR;
  const rawLongRed = lRed - baseI0.lRed;
  const rawLongNIR = lNIR - baseI0.lNIR;
  const rawShortIR  = sIR  - baseI0.sIR;
  const rawShortRed = sRed - baseI0.sRed;

  // Smoothed vascular Oxy-Hb + ΔOD cardiac wave (band-passed 0.45 - 2.8 Hz) used for BPM & R-peak estimation
  const vascularOxy = 0.65 * rawHb.hbO2 + 0.35 * skinHb.hbO2;
  const smVascularOxy = prev ? lerp(prev.smVascularOxy, vascularOxy, 0.24) : vascularOxy;
  cardiacBaseOxy = prev ? lerp(cardiacBaseOxy, smVascularOxy, 0.045) : smVascularOxy;
  const cardiacPulseWave = smVascularOxy - cardiacBaseOxy;

  const sample = prev ? {
    // Tier 1: Long (20mm) & Short (8mm) Raw Optical Channels
    lRawIR:  lerp(prev.lRawIR,  rawLongIR,  smRaw),
    lRawRed: lerp(prev.lRawRed, rawLongRed, smRaw),
    lRawNIR: lerp(prev.lRawNIR, rawLongNIR, smRaw),
    sRawIR:  lerp(prev.sRawIR,  rawShortIR,  smRaw),
    sRawRed: lerp(prev.sRawRed, rawShortRed, smRaw),
    // Tier 2: Long vs Short Optical Attenuation ΔOD
    lOD660: lerp(prev.lOD660, lOD660, sm),
    lOD730: lerp(prev.lOD730, lOD730, sm),
    lOD850: lerp(prev.lOD850, lOD850, sm),
    sOD850: lerp(prev.sOD850, sOD850, sm),
    sOD660: lerp(prev.sOD660, sOD660, sm),
    // Tier 3: Short-Channel Regression (ΔOD_long - β·ΔOD_short = ΔOD_clean)
    skinFit850: lerp(prev.skinFit850, skinFit850, sm),
    cleanOD850: lerp(prev.cleanOD850, cleanOD850, sm),
    cleanOD660: lerp(prev.cleanOD660, cleanOD660, sm),
    beta: betaOls,
    // Tier 4: Clean Cortical Oxy/Deoxy vs Superficial Skin Oxy-Hb
    cleanHbO2: lerp(prev.cleanHbO2, cleanHb.hbO2, sm),
    cleanHHb:  lerp(prev.cleanHHb,  cleanHb.hhb,  sm),
    skinHbO2:  lerp(prev.skinHbO2,  skinHb.hbO2,  sm),
    rawHbO2:   lerp(prev.rawHbO2,   rawHb.hbO2,   sm),
    // Tier 5: Clean Cortical Total/Diff Hb & Smoothed Cardiac Pulse Wave
    cleanHbT: lerp(prev.cleanHbT, cleanHbT, sm),
    cleanHbD: lerp(prev.cleanHbD, cleanHbD, sm),
    smVascularOxy,
    cardiacWave: lerp(prev.cardiacWave, cardiacPulseWave, 0.30),
    isSystolicPeak: false
  } : {
    lRawIR: 0, lRawRed: 0, lRawNIR: 0, sRawIR: 0, sRawRed: 0,
    lOD660, lOD730, lOD850, sOD850, sOD660,
    skinFit850, cleanOD850, cleanOD660, beta: betaOls,
    cleanHbO2: cleanHb.hbO2, cleanHHb: cleanHb.hhb, skinHbO2: skinHb.hbO2, rawHbO2: rawHb.hbO2,
    cleanHbT, cleanHbD, smVascularOxy, cardiacWave: 0, isSystolicPeak: false
  };

  stackHistory.push(sample);
  if (stackHistory.length > HIST_LEN) stackHistory.shift();

  // Detect systolic peaks on the smoothed Oxy-Hb / ΔOD cardiacWave in Tier 5
  const nH = stackHistory.length;
  if (nH >= 6 && frameCount - lastBeatFrame > 24) {
    let maxCard = 1e-4;
    for (let i = Math.max(0, nH - 120); i < nH; i++) {
      maxCard = Math.max(maxCard, Math.abs(stackHistory[i].cardiacWave));
    }
    const cPrev2 = stackHistory[nH - 3].cardiacWave;
    const cPrev1 = stackHistory[nH - 2].cardiacWave;
    const cCur   = stackHistory[nH - 1].cardiacWave;
    if (cPrev1 > maxCard * 0.28 && cPrev1 >= cPrev2 && cPrev1 >= cCur) {
      stackHistory[nH - 2].isSystolicPeak = true;
      lastBeatFrame = frameCount;
    }
  }

  // =========================================================================
  // HEADER & INTERACTIVE CONTROLS
  // =========================================================================
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(13.5);
  textStyle(BOLD);
  text('🔬 5-Tier Hemodynamic & Short-Channel Regression Derivation Cascade', 16, 8);
  textStyle(NORMAL);
  fill(210, 20, 74);
  textSize(9.5);
  const hwMode = eegData.hasDualDistancePPG ? 'Muse S Athena (8mm Short + 20mm Long)' : 'Dual-Distance 8mm Short + 20mm Long';
  const bpm = eegData.heartRate > 0 ? `${eegData.heartRate} BPM` : '72 BPM';
  text(`${hwMode}  |  HR (from Smoothed ΔOD/HbO₂): ${bpm}  |  Hover to inspect all 5 tiers`, 16, 26);

  // Top-right buttons
  uiButtons = [];
  const btnH = 22;
  const btnY = 10;
  let bx = width - 16;
  textSize(9.5);
  const drawBtn = (id, label, hue, sat, bri) => {
    const bw = textWidth(label) + 14;
    bx -= bw;
    const hovered = mouseX >= bx && mouseX <= bx + bw && mouseY >= btnY && mouseY <= btnY + btnH;
    fill(hue, sat, hovered ? Math.min(100, bri + 10) : bri, 0.92);
    stroke(hue, Math.max(20, sat - 15), 95, 0.9);
    strokeWeight(1.1);
    rect(bx, btnY, bw, btnH, 5);
    noStroke();
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    text(label, bx + bw / 2, btnY + btnH / 2);
    uiButtons.push({ id, x: bx, y: btnY, w: bw, h: btnH });
    bx -= 6;
  };

  drawBtn('reset', '↺ Re-Zero I₀ & β [R]', 352, 75, 68);
  drawBtn(
    'smoothRaw',
    smoothRawTier1 ? '〰 Tier 1 Raw: Smoothed [S]' : '🪜 Tier 1 Raw: BLE Steps [S]',
    smoothRawTier1 ? 150 : 35,
    75,
    smoothRawTier1 ? 58 : 72
  );

  const topY = 44;
  const botMargin = 10;
  const gap = 7;
  const numTiers = 5;
  const tierH = (height - topY - botMargin - gap * (numTiers - 1)) / numTiers;
  const plotL = 258;
  const plotR = width - 18;

  // Inspection cursor index
  const hoverActive = mouseX >= plotL && mouseX <= plotR && mouseY >= topY && mouseY <= height - botMargin;
  const inspectIdx = hoverActive && stackHistory.length > 1
    ? constrain(Math.round(map(mouseX, plotL, plotR, 0, stackHistory.length - 1)), 0, stackHistory.length - 1)
    : stackHistory.length - 1;
  const cur = stackHistory[inspectIdx] || sample;

  const suppDb = Math.max(0, 10 * Math.log10((cur.rawHbO2 * cur.rawHbO2 + 1e-4) / (cur.cleanHbO2 * cur.cleanHbO2 + 1e-4)));

  const tiers = [
    {
      step: 'TIER 1: LONG (20mm) & SHORT (8mm) LEDs',
      formula: 'ΔI_L(λ,t) & ΔI_S(λ,t) = I(λ,t) - I₀(λ)',
      hue: 195,
      series: [
        { key: 'lRawIR',  label: 'Long 850nm IR ', val: cur.lRawIR,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 190, w: 1.9 },
        { key: 'lRawRed', label: 'Long 660nm Red', val: cur.lRawRed, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 355, w: 1.7 },
        { key: 'sRawIR',  label: 'Short 850nm IR', val: cur.sRawIR,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 42,  w: 1.6 },
        { key: 'sRawRed', label: 'Short 660nm Rd', val: cur.sRawRed, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 285, w: 1.4 }
      ]
    },
    {
      step: 'TIER 2: LONG vs SHORT ATTENUATION (ΔOD)',
      formula: 'ΔOD_L/S(λ) = -ln( I_L/S(λ,t) / I₀(λ) )',
      hue: 40,
      series: [
        { key: 'lOD850', label: 'ΔOD_long 850nm ', val: cur.lOD850, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 190, w: 2.0 },
        { key: 'lOD660', label: 'ΔOD_long 660nm ', val: cur.lOD660, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 355, w: 1.7 },
        { key: 'sOD850', label: 'ΔOD_short 850nm', val: cur.sOD850, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 42,  w: 1.8 },
        { key: 'sOD660', label: 'ΔOD_short 660nm', val: cur.sOD660, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 285, w: 1.4 }
      ]
    },
    {
      step: 'TIER 3: SHORT-CHANNEL SKIN REGRESSION',
      formula: `ΔOD_clean = ΔOD_long - β·ΔOD_short (β=${cur.beta.toFixed(2)}, -${suppDb.toFixed(1)}dB)`,
      hue: 280,
      fillBetween: ['lOD850', 'cleanOD850'],
      series: [
        { key: 'lOD850',     label: 'ΔOD_long (Raw) ', val: cur.lOD850,     fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 195, w: 1.4 },
        { key: 'skinFit850', label: 'β·ΔOD_short Skin', val: cur.skinFit850, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 40,  w: 1.8 },
        { key: 'cleanOD850', label: 'ΔOD_clean Cortex', val: cur.cleanOD850, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 145, w: 2.5 }
      ]
    },
    {
      step: 'TIER 4: REGRESSED CORTICAL vs SKIN Hb',
      formula: '[ΔHbO₂, ΔHHb]_clean = (E·L)⁺ · ΔOD_clean',
      hue: 355,
      fillBetween: ['cleanHbO2', 'cleanHHb'],
      series: [
        { key: 'cleanHbO2', label: 'Δ[HbO₂] Cortex ', val: cur.cleanHbO2, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 355, w: 2.5 },
        { key: 'cleanHHb',  label: 'Δ[HHb]  Cortex ', val: cur.cleanHHb,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 215, w: 2.3 },
        { key: 'skinHbO2',  label: 'Δ[HbO₂] SkinArt', val: cur.skinHbO2,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 40,  w: 1.5 }
      ]
    },
    {
      step: 'TIER 5: CORTICAL HbT & SMOOTH CARDIAC HR',
      formula: 'HbT_clean = HbO₂+HHb | Cardiac Wave → BPM',
      hue: 140,
      showPeaksOn: 'cardiacWave',
      series: [
        { key: 'cleanHbT',    label: 'Δ[HbT] Cortical', val: cur.cleanHbT,    fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 55,  w: 2.2 },
        { key: 'cleanHbD',    label: 'Δ[HbD] OxyDiff ', val: cur.cleanHbD,    fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 140, w: 1.9 },
        { key: 'cardiacWave', label: `Cardiac (${bpm})`, val: cur.cardiacWave, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 345, w: 2.3 }
      ]
    }
  ];

  for (let tIdx = 0; tIdx < tiers.length; tIdx++) {
    const tier = tiers[tIdx];
    const y0 = topY + tIdx * (tierH + gap);
    const yMid = y0 + tierH / 2;

    // Tier container
    fill(225, 32, 12, 0.96);
    stroke(tier.hue, 55, 42);
    strokeWeight(1);
    rect(14, y0, width - 28, tierH, 6);

    // Downward derivation arrow between tiers
    if (tIdx < tiers.length - 1) {
      const arrowY = y0 + tierH + gap / 2;
      stroke(180, 70, 90, 0.8);
      strokeWeight(1.4);
      line(125, y0 + tierH - 1, 125, y0 + tierH + gap + 1);
      fill(180, 70, 90);
      noStroke();
      triangle(121, arrowY - 1, 129, arrowY - 1, 125, arrowY + 3);
    }

    // Left sidebar metadata
    noStroke();
    fill(tier.hue, 80, 98);
    textAlign(LEFT, TOP);
    textSize(9.5);
    textStyle(BOLD);
    text(tier.step, 20, y0 + 5);
    textStyle(NORMAL);

    fill(215, 18, 68);
    textSize(8.2);
    text(tier.formula, 20, y0 + 17);

    const lineSpacing = Math.min(11.5, (tierH - 31) / Math.max(1, tier.series.length));
    for (let sIdx = 0; sIdx < tier.series.length; sIdx++) {
      const s = tier.series[sIdx];
      fill(s.hue, 85, 98);
      textSize(8.8);
      text(`${s.label}: ${s.fmt(s.val)}`, 20, y0 + 29 + sIdx * lineSpacing);
    }

    // Zero baseline & plot frame
    stroke(220, 20, 24);
    strokeWeight(1);
    line(plotL, yMid, plotR, yMid);
    line(plotL, y0 + 5, plotL, y0 + tierH - 5);

    if (stackHistory.length > 2) {
      let maxMag = 1e-5;
      for (let i = 0; i < stackHistory.length; i++) {
        for (const s of tier.series) {
          maxMag = Math.max(maxMag, Math.abs(stackHistory[i][s.key]));
        }
      }
      const yScale = (tierH * 0.41) / maxMag;

      // Optional shaded area between two curves
      if (tier.fillBetween) {
        const [k1, k2] = tier.fillBetween;
        noStroke();
        fill(tier.hue, 80, 90, 0.13);
        beginShape();
        for (let i = 0; i < stackHistory.length; i++) {
          const x = map(i, 0, HIST_LEN - 1, plotL, plotR);
          const y = constrain(yMid - stackHistory[i][k1] * yScale, y0 + 4, y0 + tierH - 4);
          vertex(x, y);
        }
        for (let i = stackHistory.length - 1; i >= 0; i--) {
          const x = map(i, 0, HIST_LEN - 1, plotL, plotR);
          const y = constrain(yMid - stackHistory[i][k2] * yScale, y0 + 4, y0 + tierH - 4);
          vertex(x, y);
        }
        endShape(CLOSE);
      }

      // Draw traces
      for (const s of tier.series) {
        noFill();
        stroke(s.hue, 85, 98);
        strokeWeight(s.w);
        beginShape();
        for (let i = 0; i < stackHistory.length; i++) {
          const x = map(i, 0, HIST_LEN - 1, plotL, plotR);
          const y = constrain(yMid - stackHistory[i][s.key] * yScale, y0 + 4, y0 + tierH - 4);
          vertex(x, y);
        }
        endShape();

        // Draw detected systolic R-peak dots on the smoothed cardiac wave in Tier 5
        if (tier.showPeaksOn === s.key) {
          for (let i = 0; i < stackHistory.length; i++) {
            if (stackHistory[i].isSystolicPeak) {
              const px = map(i, 0, HIST_LEN - 1, plotL, plotR);
              const py = constrain(yMid - stackHistory[i][s.key] * yScale, y0 + 4, y0 + tierH - 4);
              fill(50, 95, 100);
              noStroke();
              ellipse(px, py, 6, 6);
            }
          }
        }

        // Highlight inspected point
        const ix = map(inspectIdx, 0, HIST_LEN - 1, plotL, plotR);
        const iy = constrain(yMid - stackHistory[inspectIdx][s.key] * yScale, y0 + 4, y0 + tierH - 4);
        fill(s.hue, 85, 100);
        noStroke();
        ellipse(ix, iy, 5, 5);
      }
    }
  }

  // Draw vertical time-locked inspection crosshair across all 5 tiers
  if (stackHistory.length > 2) {
    const cx = map(inspectIdx, 0, HIST_LEN - 1, plotL, plotR);
    stroke(0, 0, 100, hoverActive ? 0.55 : 0.2);
    strokeWeight(1);
    line(cx, topY, cx, height - botMargin);
  }
}
