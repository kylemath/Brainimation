/**
 * @id fNIRSBeerLambert
 * @title Modified Beer-Lambert (HbO2 & Hb)
 * @category PPG & Optical (fNIRS)
 * @order 2
 */
// Modified Beer-Lambert Law (MBLL) — Real-Time Oxyhemoglobin (HbO2) & Deoxyhemoglobin (HHb)
//
// Physics & Optical Model:
//   1. Optical Density (attenuation) change at wavelength lambda:
//        dOD(lambda, t) = -ln( I(lambda, t) / I0(lambda) )
//   2. Modified Beer-Lambert Law:
//        dOD(lambda) = [ eps_HbO2(lambda) * dHbO2 + eps_HHb(lambda) * dHHb ] * d * DPF(lambda)
//
//   Wavelength & Tissue Parameters (Forehead fNIRS / PPG):
//     - lambda_1 = 660 nm (Red):      eps_HbO2 = 0.3196, eps_HHb = 3.2266 mM^-1 cm^-1, DPF = 6.5
//     - lambda_2 = 730 nm (Near-IR):  eps_HbO2 = 0.3900, eps_HHb = 1.1022 mM^-1 cm^-1, DPF = 6.2
//     - lambda_3 = 850 nm (Infrared): eps_HbO2 = 1.0580, eps_HHb = 0.6913 mM^-1 cm^-1, DPF = 5.8
//     - Optode spacing d = 2.0 cm
//
// Controls:
//   - Press 'B' or click canvas to re-zero the baseline optical intensity I0(lambda)
//   - Press 'M' to cycle solver mode:
//       [1] 3-Wavelength Least-Squares (660 + 730 + 850 nm)
//       [2] Dual-Wavelength Red + IR   (660 + 850 nm)
//       [3] Dual-Wavelength NIR + IR   (730 + 850 nm)

const OPTODE_DISTANCE_CM = 2.0;

const WAVELENGTH_PARAMS = {
  660: { epsHbO2: 0.3196, epsHHb: 3.2266, dpf: 6.5, label: '660 nm (Red)', hue: 355 },
  730: { epsHbO2: 0.3900, epsHHb: 1.1022, dpf: 6.2, label: '730 nm (NIR)', hue: 40 },
  850: { epsHbO2: 1.0580, epsHHb: 0.6913, dpf: 5.8, label: '850 nm (IR)',  hue: 195 }
};

const MAX_HISTORY = 360; // ~6 seconds of frame-rate history
let baselineI0 = { 660: null, 730: null, 850: null };
let hemoHistory = [];
let solverMode = 0; // 0 = 3-Wavelength LSQ (660+730+850), 1 = Dual (660+850), 2 = Dual (730+850)
const SOLVER_LABELS = [
  '3-Wavelength Least-Squares (660 + 730 + 850 nm)',
  'Dual-Wavelength Red/IR (660 + 850 nm)',
  'Dual-Wavelength NIR/IR (730 + 850 nm)'
];

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  resetBaseline();
}

function resetBaseline() {
  baselineI0 = { 660: null, 730: null, 850: null };
  hemoHistory = [];
}

function mousePressed() {
  resetBaseline();
}

function keyPressed() {
  if (key === 'b' || key === 'B') {
    resetBaseline();
  } else if (key === 'm' || key === 'M') {
    solverMode = (solverMode + 1) % 3;
  }
}

function getSmoothedIntensity(channelName, fallbackName, windowLen = 24) {
  let samples = eegData.getPPGChannel(channelName, windowLen);
  if (!samples || samples.length === 0) {
    samples = eegData.getPPGChannel(fallbackName, windowLen);
  }
  if (!samples || samples.length === 0) return null;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i];
  return sum / samples.length;
}

/**
 * Solve 2x2 or 3x2 Modified Beer-Lambert linear system:
 *   dOD_i = (eps_HbO2_i * L_i) * dHbO2_mM + (eps_HHb_i * L_i) * dHHb_mM
 * Returns concentrations in micromolar (uM = mM * 1000).
 */
function solveMBLL(dOD660, dOD730, dOD850, mode) {
  const rows = [];
  if (mode === 0) {
    rows.push({ w: 660, y: dOD660 }, { w: 730, y: dOD730 }, { w: 850, y: dOD850 });
  } else if (mode === 1) {
    rows.push({ w: 660, y: dOD660 }, { w: 850, y: dOD850 });
  } else {
    rows.push({ w: 730, y: dOD730 }, { w: 850, y: dOD850 });
  }

  // Normal equations (A^T A) x = A^T y for 2 unknowns [dHbO2_mM, dHHb_mM]
  let a00 = 0, a01 = 0, a11 = 0;
  let b0 = 0, b1 = 0;

  for (const r of rows) {
    const p = WAVELENGTH_PARAMS[r.w];
    const L = OPTODE_DISTANCE_CM * p.dpf;
    const kHbO2 = p.epsHbO2 * L;
    const kHHb  = p.epsHHb  * L;
    a00 += kHbO2 * kHbO2;
    a01 += kHbO2 * kHHb;
    a11 += kHHb  * kHHb;
    b0  += kHbO2 * r.y;
    b1  += kHHb  * r.y;
  }

  const det = a00 * a11 - a01 * a01;
  if (Math.abs(det) < 1e-9) {
    return { dHbO2: 0, dHHb: 0, dHbT: 0, dHbD: 0 };
  }

  // Convert mM -> uM (x 1000)
  const dHbO2 = (( a11 * b0 - a01 * b1) / det) * 1000.0;
  const dHHb  = ((-a01 * b0 + a00 * b1) / det) * 1000.0;
  const dHbT  = dHbO2 + dHHb;
  const dHbD  = dHbO2 - dHHb;
  return { dHbO2, dHHb, dHbT, dHbD };
}

function draw() {
  background(225, 35, 8);

  // 1. Read smoothed optical intensities I(lambda, t)
  const i660 = getSmoothedIntensity('red', 'infrared', 24);
  const i730 = getSmoothedIntensity('nir', 'ambient', 24);
  const i850 = getSmoothedIntensity('infrared', 'red', 24);

  if (i660 !== null && i730 !== null && i850 !== null && i660 > 0 && i730 > 0 && i850 > 0) {
    // Initialize or re-zero baseline I0 on >8% step jump (e.g. connecting Athena or adjusting headband), and track slow DC drift
    if (!baselineI0[660] || !baselineI0[730] || !baselineI0[850] ||
        Math.abs(i850 - baselineI0[850]) / baselineI0[850] > 0.08 ||
        Math.abs(i660 - baselineI0[660]) / baselineI0[660] > 0.08) {
      baselineI0[660] = i660;
      baselineI0[730] = i730;
      baselineI0[850] = i850;
      hemoHistory = [];
    } else {
      baselineI0[660] = 0.996 * baselineI0[660] + 0.004 * i660;
      baselineI0[730] = 0.996 * baselineI0[730] + 0.004 * i730;
      baselineI0[850] = 0.996 * baselineI0[850] + 0.004 * i850;
    }

    // 2. Compute Optical Density change dOD(lambda) = -ln(I(t) / I0)
    const dOD660 = -Math.log(Math.max(i660, 1e-3) / baselineI0[660]);
    const dOD730 = -Math.log(Math.max(i730, 1e-3) / baselineI0[730]);
    const dOD850 = -Math.log(Math.max(i850, 1e-3) / baselineI0[850]);

    // 3. Solve Modified Beer-Lambert Law for d[HbO2], d[HHb], d[HbT] (in uM)
    const sol = solveMBLL(dOD660, dOD730, dOD850, solverMode);

    // Exponential smoothing for clean visualization
    const prev = hemoHistory.length > 0 ? hemoHistory[hemoHistory.length - 1] : null;
    const alpha = 0.25;
    const entry = prev ? {
      dOD660: prev.dOD660 * (1 - alpha) + dOD660 * alpha,
      dOD730: prev.dOD730 * (1 - alpha) + dOD730 * alpha,
      dOD850: prev.dOD850 * (1 - alpha) + dOD850 * alpha,
      dHbO2:  prev.dHbO2  * (1 - alpha) + sol.dHbO2  * alpha,
      dHHb:   prev.dHHb   * (1 - alpha) + sol.dHHb   * alpha,
      dHbT:   prev.dHbT   * (1 - alpha) + sol.dHbT   * alpha,
      dHbD:   prev.dHbD   * (1 - alpha) + sol.dHbD   * alpha
    } : { dOD660, dOD730, dOD850, ...sol };

    hemoHistory.push(entry);
    if (hemoHistory.length > MAX_HISTORY) {
      hemoHistory.shift();
    }
  }

  const latest = hemoHistory.length > 0
    ? hemoHistory[hemoHistory.length - 1]
    : { dOD660: 0, dOD730: 0, dOD850: 0, dHbO2: 0, dHHb: 0, dHbT: 0, dHbD: 0 };

  // Header
  noStroke();
  fill(0, 0, 98);
  textAlign(LEFT, TOP);
  textSize(15);
  text('🩸 Modified Beer-Lambert Law (MBLL): Δ[HbO₂] & Δ[HHb] Oxygenation', 18, 12);

  fill(210, 20, 74);
  textSize(10.5);
  text(`Mode [M]: ${SOLVER_LABELS[solverMode]}  |  d = ${OPTODE_DISTANCE_CM.toFixed(1)} cm  |  Click or [B] Re-Zero Baseline I₀`, 18, 33);

  const plotLeft = 225;
  const plotRight = width - 22;

  // =========================================================================
  // TOP PANEL: Optical Density Attenuation dOD(lambda) = -ln(I / I0)
  // =========================================================================
  const odTop = 56;
  const odH = (height - 84) * 0.34;
  const odMid = odTop + odH / 2;

  fill(225, 30, 13, 0.95);
  stroke(220, 30, 30);
  strokeWeight(1);
  rect(16, odTop, width - 32, odH, 6);

  noStroke();
  fill(0, 0, 95);
  textSize(12);
  text('1. Optical Attenuation ΔOD(λ)', 26, odTop + 10);
  fill(215, 18, 68);
  textSize(10);
  text('ΔOD(λ) = -ln(I(λ,t) / I₀(λ))', 26, odTop + 26);

  const odItems = [
    { key: 'dOD660', label: '660nm (Red)', val: latest.dOD660, hue: 355, dpf: 6.5 },
    { key: 'dOD730', label: '730nm (NIR)', val: latest.dOD730, hue: 40,  dpf: 6.2 },
    { key: 'dOD850', label: '850nm (IR)',  val: latest.dOD850, hue: 195, dpf: 5.8 }
  ];

  for (let i = 0; i < odItems.length; i++) {
    const it = odItems[i];
    fill(it.hue, 80, 96);
    textSize(10.5);
    const sign = it.val >= 0 ? '+' : '';
    text(`${it.label}: ${sign}${it.val.toFixed(4)} (DPF ${it.dpf})`, 26, odTop + 46 + i * 18);
  }

  // Zero line & traces for dOD
  stroke(220, 20, 26);
  line(plotLeft, odMid, plotRight, odMid);
  line(plotLeft, odTop + 8, plotLeft, odTop + odH - 8);

  if (hemoHistory.length > 2) {
    let maxOD = 0.005;
    for (let i = 0; i < hemoHistory.length; i++) {
      const h = hemoHistory[i];
      maxOD = Math.max(maxOD, Math.abs(h.dOD660), Math.abs(h.dOD730), Math.abs(h.dOD850));
    }
    const odScale = (odH * 0.40) / maxOD;

    for (const it of odItems) {
      noFill();
      stroke(it.hue, 82, 95);
      strokeWeight(1.6);
      beginShape();
      for (let i = 0; i < hemoHistory.length; i++) {
        const x = map(i, 0, MAX_HISTORY - 1, plotLeft, plotRight);
        const y = constrain(odMid - hemoHistory[i][it.key] * odScale, odTop + 6, odTop + odH - 6);
        vertex(x, y);
      }
      endShape();
    }
  }

  // =========================================================================
  // BOTTOM PANEL: Hemodynamic Concentrations Δ[HbO2], Δ[HHb], Δ[HbT] (µM)
  // =========================================================================
  const hbTop = odTop + odH + 14;
  const hbH = height - hbTop - 16;
  const hbMid = hbTop + hbH / 2;

  fill(225, 30, 13, 0.95);
  stroke(350, 45, 38);
  strokeWeight(1);
  rect(16, hbTop, width - 32, hbH, 6);

  noStroke();
  fill(0, 0, 96);
  textSize(12);
  text('2. Hemoglobin Concentration (μM)', 26, hbTop + 10);
  fill(215, 18, 68);
  textSize(10);
  text('[ΔHbO₂, ΔHHb] = (E·L)⁺ · ΔOD', 26, hbTop + 26);

  const hbSeries = [
    { key: 'dHbO2', label: 'Δ[HbO₂] Oxy-Hb',   val: latest.dHbO2, hue: 355, sat: 85, bri: 98, weight: 2.5 },
    { key: 'dHHb',  label: 'Δ[HHb]  Deoxy-Hb', val: latest.dHHb,  hue: 210, sat: 85, bri: 98, weight: 2.5 },
    { key: 'dHbT',  label: 'Δ[HbT]  Total Hb', val: latest.dHbT,  hue: 48,  sat: 85, bri: 95, weight: 1.6 }
  ];

  for (let i = 0; i < hbSeries.length; i++) {
    const s = hbSeries[i];
    fill(s.hue, s.sat, s.bri);
    textSize(11.5);
    const sign = s.val >= 0 ? '+' : '';
    text(`${s.label}: ${sign}${s.val.toFixed(2)} μM`, 26, hbTop + 48 + i * 22);
  }

  // Oxygenation difference index dHbD = dHbO2 - dHb
  const oxySign = latest.dHbD >= 0 ? '+' : '';
  fill(140, 75, 92);
  textSize(11);
  text(`Δ[HbD] (Oxy-Deoxy): ${oxySign}${latest.dHbD.toFixed(2)} μM`, 26, hbTop + 118);

  // Extinction reference table in sidebar
  fill(215, 15, 62);
  textSize(9.5);
  text('Extinction ε (mM⁻¹cm⁻¹):', 26, hbTop + 144);
  text('λ(nm)  ε(HbO₂)  ε(HHb)', 26, hbTop + 158);
  text(' 660    0.320    3.227', 26, hbTop + 171);
  text(' 730    0.390    1.102', 26, hbTop + 184);
  text(' 850    1.058    0.691', 26, hbTop + 197);

  // Plot axes
  stroke(220, 20, 26);
  strokeWeight(1);
  line(plotLeft, hbMid, plotRight, hbMid);
  line(plotLeft, hbTop + 8, plotLeft, hbTop + hbH - 8);

  if (hemoHistory.length > 2) {
    let maxHb = 0.5; // minimum +/- 0.5 uM scale
    for (let i = 0; i < hemoHistory.length; i++) {
      const h = hemoHistory[i];
      maxHb = Math.max(maxHb, Math.abs(h.dHbO2), Math.abs(h.dHHb), Math.abs(h.dHbT));
    }
    const hbScale = (hbH * 0.40) / maxHb;

    // Scale labels on axis
    noStroke();
    fill(220, 15, 60);
    textAlign(RIGHT, TOP);
    textSize(9.5);
    text(`+${maxHb.toFixed(2)} μM`, plotRight - 4, hbTop + 8);
    textAlign(RIGHT, BOTTOM);
    text(`-${maxHb.toFixed(2)} μM`, plotRight - 4, hbTop + hbH - 8);
    textAlign(LEFT, TOP);

    // Shaded oxygenation envelope between HbO2 and HHb
    noStroke();
    fill(355, 80, 90, 0.10);
    beginShape();
    for (let i = 0; i < hemoHistory.length; i++) {
      const x = map(i, 0, MAX_HISTORY - 1, plotLeft, plotRight);
      const y = constrain(hbMid - hemoHistory[i].dHbO2 * hbScale, hbTop + 6, hbTop + hbH - 6);
      vertex(x, y);
    }
    for (let i = hemoHistory.length - 1; i >= 0; i--) {
      const x = map(i, 0, MAX_HISTORY - 1, plotLeft, plotRight);
      const y = constrain(hbMid - hemoHistory[i].dHHb * hbScale, hbTop + 6, hbTop + hbH - 6);
      vertex(x, y);
    }
    endShape(CLOSE);

    // Draw Δ[HbT], Δ[HHb], and Δ[HbO2] traces
    for (let sIdx = hbSeries.length - 1; sIdx >= 0; sIdx--) {
      const s = hbSeries[sIdx];
      noFill();
      stroke(s.hue, s.sat, s.bri);
      strokeWeight(s.weight);
      beginShape();
      for (let i = 0; i < hemoHistory.length; i++) {
        const x = map(i, 0, MAX_HISTORY - 1, plotLeft, plotRight);
        const y = constrain(hbMid - hemoHistory[i][s.key] * hbScale, hbTop + 6, hbTop + hbH - 6);
        vertex(x, y);
      }
      endShape();
    }
  } else {
    noStroke();
    fill(220, 15, 55);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Connect Muse (PPG: ON) or click Simulate Data to stream optical hemodynamics', (plotLeft + plotRight) / 2, hbMid);
  }
}
