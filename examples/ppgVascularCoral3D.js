/**
 * @id ppgVascularCoral3D
 * @title 3D Bioluminescent Vascular Coral (Oxy/Deoxy & Pulse)
 * @category PPG & Optical (fNIRS)
 * @order 7
 */
// Complex 3D PPG & Hemodynamic Animation
// A living 3D fractal arterial/venous coral tree whose:
//   - Branch expansion & systolic wave propagation pulse with `eegData.ppgPulse`
//   - Arterial crimson (HbO2) vs venous sapphire (HHb) bioluminescence shifts with cerebral oxygenation
//   - Floating oxygen micro-bubbles rise at a speed proportional to Heart Rate (`eegData.heartRate`)

let bubbles = [];

function setup() {
  createCanvas(width, height, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = 0; i < 48; i++) {
    bubbles.push({
      x: random(-220, 220),
      y: random(-180, 180),
      z: random(-160, 160),
      size: random(2.5, 6.5),
      isOxy: i % 3 !== 0
    });
  }
}

function drawBranch(len, depth, pulse, oxyRatio, t) {
  if (depth <= 0) {
    // Glowing capillary tip
    noStroke();
    const tipHue = lerp(215, 352, oxyRatio);
    fill(tipHue, 88, 100, 0.85);
    sphere(3.2 + pulse * 3.5, 8, 8);
    return;
  }

  // Color transitions from deep arterial ruby at trunk to oxygenated tips
  const branchHue = depth > 2 ? lerp(220, 345, oxyRatio) : lerp(200, 355, oxyRatio);
  stroke(branchHue, 82, 95);
  strokeWeight(depth * 1.45);
  line(0, 0, 0, 0, -len, 0);

  translate(0, -len, 0);

  const spread = 0.42 + pulse * 0.14 + sin(t * 1.4 + depth) * 0.06;
  const twist = 2.094; // 120 degrees

  for (let i = 0; i < 3; i++) {
    push();
    rotateY(i * twist + t * 0.25);
    rotateZ(spread);
    drawBranch(len * 0.68, depth - 1, pulse, oxyRatio, t);
    pop();
  }
}

function draw() {
  background(228, 45, 6);

  const t = millis() * 0.001;
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.45 + 0.45 * Math.pow(max(0, sin(t * 3.7)), 3);

  // Compute oxy/deoxy balance from live Red & IR optical channels (and fNIRS cleanHbO2)
  const irArr = eegData.getPPGChannel('infrared', 32);
  const redArr = eegData.getPPGChannel('red', 32);
  let oxyRatio = 0.72 + 0.22 * sin(t * 0.8);
  if (eegData.connected && irArr.length) {
    if (eegData.fnirsRegression && typeof eegData.fnirsRegression.cleanHbO2 === 'number') {
      const hbo2 = eegData.fnirsRegression.cleanHbO2;
      const hhb  = eegData.fnirsRegression.cleanHHb || 0;
      oxyRatio = constrain(0.68 + 0.18 * Math.tanh((hbo2 - hhb) * 0.4) + (pulse - 0.5) * 0.15, 0.2, 0.98);
    } else if (redArr.length) {
      const irLast = irArr[irArr.length - 1] || 1;
      const redLast = redArr[redArr.length - 1] || 1;
      const ratio = irLast / Math.max(1, irLast + redLast);
      oxyRatio = constrain(map(ratio, 0.35, 0.65, 0.3, 0.95) + (pulse - 0.5) * 0.15, 0.2, 0.98);
    }
  }

  ambientLight(220, 30, 35);
  pointLight(350, 90, 100, 0, -120, 160);
  pointLight(195, 90, 90, 140, 100, -120);

  const s = Math.min(width, height) / 420;
  scale(s);
  rotateY(t * 0.32);

  // Floating HbO2 (crimson) and HHb (cobalt) micro-bubbles
  noStroke();
  const speedMul = map(eegData.heartRate || 72, 50, 120, 0.8, 2.2, true);
  for (const b of bubbles) {
    b.y -= (0.8 + pulse * 1.8) * speedMul;
    if (b.y < -190) b.y = 190;
    push();
    translate(b.x + sin(t * 2 + b.z) * 8, b.y, b.z);
    fill(b.isOxy ? 352 : 205, 85, 98, 0.75);
    sphere(b.size * (0.85 + pulse * 0.35), 8, 6);
    pop();
  }

  // Pulsing vascular root bed
  push();
  translate(0, 135, 0);
  rotateX(HALF_PI);
  noFill();
  stroke(350, 80, 85, 0.45);
  strokeWeight(2);
  torus(55 + pulse * 18, 3, 18, 12);
  stroke(195, 80, 85, 0.35);
  torus(88 + pulse * 26, 2, 18, 12);
  pop();

  // Recursive 3D Vascular Coral Tree
  push();
  translate(0, 135, 0);
  drawBranch(78 + pulse * 14, 4, pulse, oxyRatio, t);
  pop();
}
