/**
 * @id ppgStackedDerivation
 * @title Stacked Derivation: Raw LEDs -> ΔOD -> Oxy/Deoxy/Total Hb
 * @category PPG & Optical (fNIRS)
 * @order 4
 */
// Technical 4-Tier Stacked Derivation Cascade
// Shows step-by-step how raw optical LED channels are transformed into hemodynamic signals:
//   Tier 1: Individual Raw Optical Channels I(λ, t) — 660 nm (Red), 730 nm (NIR), 850 nm (IR), Ambient
//   Tier 2: Optical Density Attenuation Stack ΔOD(λ, t) = -ln( I(λ, t) / I0(λ) )
//   Tier 3: Modified Beer-Lambert Matrix Inversion — Oxy-Hb (Δ[HbO2]) vs Deoxy-Hb (Δ[HHb])
//   Tier 4: Total Hemoglobin (Δ[HbT] = ΔHbO2 + ΔHHb) vs Oxygenation Differential (Δ[HbD] = ΔHbO2 - ΔHHb) & SpO2
//
// Controls:
//   - Click anywhere to reset baseline I0(λ)
//   - Move mouse horizontally over the stack to inspect exact time-aligned values across all 4 tiers!

const HIST_LEN = 260;
let stackHistory = [];
let baseI0 = { red: null, nir: null, ir: null, amb: null };

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function mousePressed() {
  baseI0 = { red: null, nir: null, ir: null, amb: null };
  stackHistory = [];
}

function meanSample(chKey, fallbackKey, n = 16) {
  let arr = eegData.getPPGChannel(chKey, n);
  if (!arr || arr.length === 0) arr = eegData.getPPGChannel(fallbackKey, n);
  if (!arr || arr.length === 0) return null;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function draw() {
  background(225, 38, 7);

  // Sample 4 optical channels (or realistic live fallback when disconnected)
  const t = millis() * 0.001;
  let iRed = meanSample('red', 'infrared', 16);
  let iNIR = meanSample('nir', 'optics4', 16);
  let iIR  = meanSample('infrared', 'red', 16);
  let iAmb = meanSample('ambient', 'nir', 16);

  if (iRed === null || iIR === null || iRed <= 0) {
    const pulse = 0.5 + 0.45 * sin(t * 7.2) + 0.18 * sin(t * 14.4 - 0.8);
    const slowWave = sin(t * 0.55) * 0.0018;
    iAmb = 12000 + 30 * sin(t * 0.9);
    iRed = 162000 * exp(-(0.004 * (pulse - 0.5) - slowWave * 2.2));
    iNIR = 178000 * exp(-(0.005 * (pulse - 0.5) + slowWave * 1.1));
    iIR  = 185000 * exp(-(0.008 * (pulse - 0.5) + slowWave * 4.5));
  }

  if (!baseI0.red) {
    baseI0.red = iRed;
    baseI0.nir = iNIR || iIR;
    baseI0.ir  = iIR;
    baseI0.amb = iAmb || 12000;
  }

  // Step 1 -> Step 2: Optical Density ΔOD(λ) = -ln(I(λ,t) / I0(λ))
  const dOD660 = -Math.log(Math.max(1, iRed) / baseI0.red);
  const dOD730 = -Math.log(Math.max(1, iNIR) / baseI0.nir);
  const dOD850 = -Math.log(Math.max(1, iIR)  / baseI0.ir);

  // Step 2 -> Step 3: 3-wavelength Least-Squares MBLL Inversion (d = 2.0 cm)
  // Extinction coefficients eps [mM^-1 cm^-1] * pathlength L = d * DPF [cm]
  // 660nm: L=13.0, epsHbO2=0.3196, epsHHb=3.2266
  // 730nm: L=12.4, epsHbO2=0.3900, epsHHb=1.1022
  // 850nm: L=11.6, epsHbO2=1.0580, epsHHb=0.6913
  const rows = [
    { kOxy: 0.3196 * 13.0, kDeoxy: 3.2266 * 13.0, od: dOD660 },
    { kOxy: 0.3900 * 12.4, kDeoxy: 1.1022 * 12.4, od: dOD730 },
    { kOxy: 1.0580 * 11.6, kDeoxy: 0.6913 * 11.6, od: dOD850 }
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
  const rawHbO2 = (( a11 * b0 - a01 * b1) / det) * 1000.0; // uM
  const rawHHb  = ((-a01 * b0 + a00 * b1) / det) * 1000.0; // uM

  // Step 3 -> Step 4: Derived Total Hb (HbT) and Differential Oxygenation (HbD)
  const rawHbT = rawHbO2 + rawHHb;
  const rawHbD = rawHbO2 - rawHHb;

  const prev = stackHistory.length ? stackHistory[stackHistory.length - 1] : null;
  const sm = 0.28;
  const sample = prev ? {
    rawRed: iRed - baseI0.red,
    rawNIR: iNIR - baseI0.nir,
    rawIR:  iIR  - baseI0.ir,
    rawAmb: iAmb - baseI0.amb,
    dOD660: lerp(prev.dOD660, dOD660, sm),
    dOD730: lerp(prev.dOD730, dOD730, sm),
    dOD850: lerp(prev.dOD850, dOD850, sm),
    hbO2:   lerp(prev.hbO2, rawHbO2, sm),
    hhb:    lerp(prev.hhb,  rawHHb,  sm),
    hbT:    lerp(prev.hbT,  rawHbT,  sm),
    hbD:    lerp(prev.hbD,  rawHbD,  sm)
  } : {
    rawRed: 0, rawNIR: 0, rawIR: 0, rawAmb: 0,
    dOD660, dOD730, dOD850,
    hbO2: rawHbO2, hhb: rawHHb, hbT: rawHbT, hbD: rawHbD
  };

  stackHistory.push(sample);
  if (stackHistory.length > HIST_LEN) stackHistory.shift();

  // Header
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(14);
  text('🔬 Stacked Hemodynamic Derivation: Individual Channels → ΔOD → Oxy/Deoxy → Total Hb', 16, 10);
  fill(210, 20, 72);
  textSize(10);
  text('Hover horizontally to inspect time-locked derivation across all 4 tiers  |  Click to Re-Zero I₀', 16, 28);

  const topY = 48;
  const botMargin = 14;
  const gap = 10;
  const tierH = (height - topY - botMargin - gap * 3) / 4;
  const plotL = 240;
  const plotR = width - 18;

  // Inspection cursor index
  const hoverActive = mouseX >= plotL && mouseX <= plotR && mouseY >= topY && mouseY <= height - botMargin;
  const inspectIdx = hoverActive && stackHistory.length > 1
    ? constrain(Math.round(map(mouseX, plotL, plotR, 0, stackHistory.length - 1)), 0, stackHistory.length - 1)
    : stackHistory.length - 1;
  const cur = stackHistory[inspectIdx] || sample;

  const tiers = [
    {
      step: 'TIER 1: INDIVIDUAL CHANNELS',
      formula: 'ΔI(λ,t) = I(λ,t) - I₀(λ)',
      hue: 195,
      series: [
        { key: 'rawRed', label: '660nm Red', val: cur.rawRed, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 355, w: 1.8 },
        { key: 'rawNIR', label: '730nm NIR', val: cur.rawNIR, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 40,  w: 1.8 },
        { key: 'rawIR',  label: '850nm IR ', val: cur.rawIR,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 190, w: 1.8 },
        { key: 'rawAmb', label: 'Ambient  ', val: cur.rawAmb, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(0)} cnt`, hue: 280, w: 1.2 }
      ]
    },
    {
      step: 'TIER 2: OPTICAL ATTENUATION',
      formula: 'ΔOD(λ) = -ln( I(λ,t) / I₀(λ) )',
      hue: 40,
      series: [
        { key: 'dOD660', label: 'ΔOD 660nm', val: cur.dOD660, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 355, w: 1.9 },
        { key: 'dOD730', label: 'ΔOD 730nm', val: cur.dOD730, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 40,  w: 1.9 },
        { key: 'dOD850', label: 'ΔOD 850nm', val: cur.dOD850, fmt: v => `${v >= 0 ? '+' : ''}${(v * 1000).toFixed(2)} mOD`, hue: 190, w: 1.9 }
      ]
    },
    {
      step: 'TIER 3: OXY vs DEOXY-Hb',
      formula: '[ΔHbO₂, ΔHHb]ᵀ = (E·L)⁺ · ΔOD',
      hue: 355,
      fillBetween: ['hbO2', 'hhb'],
      series: [
        { key: 'hbO2', label: 'Δ[HbO₂] Oxy  ', val: cur.hbO2, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 355, w: 2.5 },
        { key: 'hhb',  label: 'Δ[HHb]  Deoxy', val: cur.hhb,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 215, w: 2.5 }
      ]
    },
    {
      step: 'TIER 4: TOTAL vs DIFF Hb',
      formula: 'HbT = HbO₂+HHb | HbD = HbO₂-HHb',
      hue: 135,
      series: [
        { key: 'hbT',  label: 'Δ[HbT] Total ', val: cur.hbT,  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 50,  w: 2.5 },
        { key: 'hbD',  label: 'Δ[HbD] OxyDiff', val: cur.hbD, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 140, w: 2.2 },
        { key: 'hbO2', label: 'Δ[HbO₂] Ref  ', val: cur.hbO2, fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(2)} μM`, hue: 355, w: 1.1 }
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
      strokeWeight(1.5);
      line(115, y0 + tierH - 2, 115, y0 + tierH + gap + 2);
      fill(180, 70, 90);
      noStroke();
      triangle(111, arrowY, 119, arrowY, 115, arrowY + 4);
    }

    // Left sidebar metadata
    noStroke();
    fill(tier.hue, 80, 98);
    textAlign(LEFT, TOP);
    textSize(10.5);
    text(tier.step, 22, y0 + 6);

    fill(215, 18, 66);
    textSize(9);
    text(tier.formula, 22, y0 + 20);

    for (let sIdx = 0; sIdx < tier.series.length; sIdx++) {
      const s = tier.series[sIdx];
      fill(s.hue, 85, 98);
      textSize(9.5);
      text(`${s.label}: ${s.fmt(s.val)}`, 22, y0 + 34 + sIdx * 13);
    }

    // Zero baseline & plot frame
    stroke(220, 20, 24);
    strokeWeight(1);
    line(plotL, yMid, plotR, yMid);
    line(plotL, y0 + 6, plotL, y0 + tierH - 6);

    if (stackHistory.length > 2) {
      let maxMag = 1e-5;
      for (let i = 0; i < stackHistory.length; i++) {
        for (const s of tier.series) {
          maxMag = Math.max(maxMag, Math.abs(stackHistory[i][s.key]));
        }
      }
      const yScale = (tierH * 0.40) / maxMag;

      // Optional shaded area between Oxy & Deoxy
      if (tier.fillBetween) {
        const [k1, k2] = tier.fillBetween;
        noStroke();
        fill(355, 80, 90, 0.13);
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

        // Highlight inspected point
        const ix = map(inspectIdx, 0, HIST_LEN - 1, plotL, plotR);
        const iy = constrain(yMid - stackHistory[inspectIdx][s.key] * yScale, y0 + 4, y0 + tierH - 4);
        fill(s.hue, 85, 100);
        noStroke();
        ellipse(ix, iy, 5, 5);
      }
    }
  }

  // Draw vertical time-locked inspection crosshair across all 4 tiers
  if (stackHistory.length > 2) {
    const cx = map(inspectIdx, 0, HIST_LEN - 1, plotL, plotR);
    stroke(0, 0, 100, hoverActive ? 0.55 : 0.2);
    strokeWeight(1);
    line(cx, topY, cx, height - botMargin);
  }
}
