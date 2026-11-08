/**
 * @id museAthena3dDiagram
 * @title 3D Muse S Athena / Muse 2 LED & Electrode Anatomy
 * @category PPG & Optical (fNIRS)
 * @order 5
 */
// Interactive 3D Headband Optode & Electrode Signal Path Diagram
// Visualizes the physical sensor layout on Muse S Athena, Muse S, and Muse 2:
//   - EEG Dry Electrodes: TP9 (Left Ear), AF7 (Left Forehead), AF8 (Right Forehead), TP10 (Right Ear), FPz (Ref)
//   - Optical fNIRS / PPG LEDs: 660 nm (Red), 730 nm (Near-IR), 850 nm (Infrared) -> Photodiode Detector
//   - Animated banana-shaped cortical photon diffusion paths (d = 2.0 cm, penetration depth ~1.0 cm into PFC)
//
// Controls:
//   - Drag mouse to rotate the 3D head & headband model
//   - Press 'M' or click top-left button to switch model: [Muse S Athena] vs [Muse 2 / Muse S Classic]

let rotY = -0.35;
let rotX = 0.18;
let isAthena = true;
let userOverrodeModel = false;
let hudGraphics;

function setup() {
  createCanvas(width, height, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  hudGraphics = createGraphics(width, height);
  hudGraphics.colorMode(HSB, 360, 100, 100, 1);
  hudGraphics.textFont('monospace');
}

function windowResized() {
  hudGraphics = createGraphics(width, height);
  hudGraphics.colorMode(HSB, 360, 100, 100, 1);
  hudGraphics.textFont('monospace');
}

function mouseDragged() {
  rotY += (mouseX - pmouseX) * 0.01;
  rotX = constrain(rotX - (mouseY - pmouseY) * 0.01, -0.8, 0.8);
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    userOverrodeModel = true;
    isAthena = !isAthena;
  }
}

function mousePressed() {
  if (mouseX < 280 && mouseY < 58) {
    userOverrodeModel = true;
    isAthena = !isAthena;
  }
}

function projectPoint(x, y, z, rX, rY, s) {
  // Apply Y rotation then X rotation matching the 3D scene
  let x1 = x * cos(rY) + z * sin(rY);
  let y1 = y;
  let z1 = -x * sin(rY) + z * cos(rY);

  let x2 = x1;
  let y2 = y1 * cos(rX) - z1 * sin(rX);
  let z2 = y1 * sin(rX) + z1 * cos(rX);

  const fov = (height / 2) / tan(PI / 6);
  const scaleProj = fov / Math.max(80, fov - z2 * s);
  return {
    sx: width / 2 + x2 * s * scaleProj,
    sy: height / 2 + 15 + y2 * s * scaleProj,
    z: z2
  };
}

function draw() {
  background(225, 42, 7);

  const t = millis() * 0.001;
  if (!mouseIsPressed) {
    rotY = -0.32 + sin(t * 0.45) * 0.38;
  }

  if (!userOverrodeModel && typeof eegData !== 'undefined' && eegData.connected) {
    isAthena = Boolean(eegData.hasDualDistancePPG);
  }
  const pulse = eegData.connected ? (eegData.ppgPulse || 0.5) : 0.5 + 0.45 * sin(t * 7.2);
  const sceneScale = Math.min(width, height) / 430;

  push();
  translate(0, 15, 0);
  scale(sceneScale);
  rotateX(rotX);
  rotateY(rotY);

  ambientLight(220, 30, 45);
  directionalLight(0, 0, 90, 0.5, 0.6, -1);

  // 1. Translucent 3D Human Head & Prefrontal Cortex (PFC)
  push();
  noStroke();
  fill(215, 35, 32, 0.42);
  scale(1.0, 1.22, 1.12);
  sphere(102, 24, 18);
  pop();

  // Wireframe cranial grid for 3D depth perception
  push();
  noFill();
  stroke(205, 50, 55, 0.16);
  strokeWeight(1);
  scale(1.01, 1.23, 1.13);
  sphere(102, 14, 10);
  pop();

  // Glowing Prefrontal Cortex (PFC) hemisphere inside forehead
  push();
  translate(0, -24, 38);
  noStroke();
  fill(335, 75, 75, 0.28 + pulse * 0.22);
  scale(0.76, 0.62, 0.68);
  sphere(68, 18, 14);
  pop();

  // 2. Muse Headband Arc wrapping from TP9 (-X) across forehead (+Z) to TP10 (+X)
  noFill();
  stroke(220, 20, 88);
  strokeWeight(9);
  beginShape();
  for (let a = -PI * 0.68; a <= PI * 0.68; a += 0.08) {
    const hx = sin(a) * 107;
    const hz = cos(a) * 116;
    const hy = -28 + Math.pow(abs(a) / (PI * 0.68), 2.2) * 44;
    vertex(hx, hy, hz);
  }
  endShape();

  // 3. Define Sensor Nodes (3D coordinates on the headband)
  const nodes = [
    { id: 'TP9',  label: 'TP9 (Left Ear EEG)',  sub: 'Temporal Ch 0 (256 Hz)', x: -94, y: 12,  z: -48, hue: 280, r: 8,  type: 'eeg', ch: 0 },
    { id: 'AF7',  label: 'AF7 (Left Frontal)',  sub: 'Prefrontal Ch 1 (256 Hz)', x: -56, y: -27, z: 102, hue: 195, r: 8,  type: 'eeg', ch: 1 },
    { id: 'FPz',  label: 'FPz (Reference/DRL)', sub: 'Midline Forehead Ref',   x: 0,   y: -31, z: 117, hue: 55,  r: 6,  type: 'ref' },
    { id: 'AF8',  label: 'AF8 (Right Frontal)', sub: 'Prefrontal Ch 2 (256 Hz)', x: 56,  y: -27, z: 102, hue: 140, r: 8,  type: 'eeg', ch: 2 },
    { id: 'TP10', label: 'TP10 (Right Ear EEG)',sub: 'Temporal Ch 3 (256 Hz)', x: 94,  y: 12,  z: -48, hue: 35,  r: 8,  type: 'eeg', ch: 3 },
    // Optical fNIRS / PPG Cluster on Forehead
    { id: 'LED660', label: '660 nm Red LED',     sub: 'Deoxy-Hb (HHb) sensitive', x: -28, y: -26, z: 114, hue: 355, r: 6.5, type: 'led' },
    { id: 'LED730', label: isAthena ? '730 nm NIR LED (Athena)' : 'Ambient / Aux Sensor', sub: isAthena ? 'Athena Multi-λ fNIRS' : 'Ambient Light Cancellation', x: -20, y: -18, z: 115, hue: 38, r: 6.0, type: 'led' },
    { id: 'LED850', label: '850 nm IR LED',      sub: 'Oxy-Hb (HbO₂) sensitive',  x: -12, y: -26, z: 116, hue: 190, r: 6.5, type: 'led' },
    { id: 'DET',    label: 'Photodiode Detector',sub: 'Receives scattered photons (d=2cm)', x: 24, y: -24, z: 114, hue: 120, r: 7.5, type: 'det' }
  ];

  // Draw glowing sensor spheres in 3D
  for (const n of nodes) {
    push();
    translate(n.x, n.y, n.z);
    noStroke();
    const glow = n.type === 'led' ? (0.65 + pulse * 0.55) : 1.0;
    fill(n.hue, 88, 98);
    sphere(n.r * glow, 12, 10);
    // Outer halo
    fill(n.hue, 85, 98, 0.28);
    sphere(n.r * glow * 1.65, 10, 8);
    pop();
  }

  // 4. Draw Banana-Shaped Photon Diffusion Paths from LEDs into PFC Cortex -> Photodiode Detector
  const ledIds = ['LED660', 'LED730', 'LED850'];
  const detNode = nodes.find(n => n.id === 'DET');
  for (let lIdx = 0; lIdx < ledIds.length; lIdx++) {
    const src = nodes.find(n => n.id === ledIds[lIdx]);
    noFill();
    stroke(src.hue, 90, 98, 0.75);
    strokeWeight(2.4);
    beginShape();
    const steps = 20;
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const bx = lerp(src.x, detNode.x, u);
      const by = lerp(src.y, detNode.y, u) + (lIdx - 1) * 3.5 * sin(u * PI);
      // Banana curve penetrates ~22 units inward into the Prefrontal Cortex
      const bz = lerp(src.z, detNode.z, u) - 24 * sin(u * PI);
      vertex(bx, by, bz);
    }
    endShape();

    // Animated photon packet traveling along the banana trajectory
    const uPacket = (t * 0.9 + lIdx * 0.33) % 1.0;
    const px = lerp(src.x, detNode.x, uPacket);
    const py = lerp(src.y, detNode.y, uPacket) + (lIdx - 1) * 3.5 * sin(uPacket * PI);
    const pz = lerp(src.z, detNode.z, uPacket) - 24 * sin(uPacket * PI);
    push();
    translate(px, py, pz);
    noStroke();
    fill(src.hue, 60, 100);
    sphere(3.6, 8, 8);
    pop();
  }

  pop();

  // 5. Render Crisp 2D Callout Labels & Live Signal Legend on HUD Overlay
  hudGraphics.clear();
  hudGraphics.noStroke();

  // Top Header & Model Switcher Button
  hudGraphics.fill(225, 35, 14, 0.92);
  hudGraphics.stroke(190, 70, 80);
  hudGraphics.strokeWeight(1.2);
  hudGraphics.rect(14, 12, 268, 42, 6);

  hudGraphics.noStroke();
  hudGraphics.fill(190, 85, 98);
  hudGraphics.textAlign(LEFT, TOP);
  hudGraphics.textSize(12.5);
  hudGraphics.text(isAthena ? '🎧 MODEL: MUSE S ATHENA (p1041)' : '🎧 MODEL: MUSE 2 / MUSE S (p50)', 24, 18);
  hudGraphics.fill(215, 20, 78);
  hudGraphics.textSize(9.5);
  hudGraphics.text('Click here or press [M] to switch  |  Drag to rotate', 24, 36);

  // Right Info Card: Where Signals Come From & Go To
  const infoW = 248;
  const infoX = width - infoW - 14;
  hudGraphics.fill(225, 35, 13, 0.9);
  hudGraphics.stroke(350, 55, 55);
  hudGraphics.rect(infoX, 12, infoW, 138, 6);

  hudGraphics.noStroke();
  hudGraphics.fill(0, 0, 98);
  hudGraphics.textSize(11);
  hudGraphics.text('OPTICAL SIGNAL PATH (fNIRS/PPG)', infoX + 10, 20);
  hudGraphics.fill(355, 80, 96);
  hudGraphics.textSize(9.5);
  hudGraphics.text('• 660nm Red → Deoxy-Hb (HHb)', infoX + 10, 38);
  hudGraphics.fill(38, 85, 96);
  hudGraphics.text(isAthena ? '• 730nm NIR → Isosbestic / NIR' : '• Ambient   → Noise Subtraction', infoX + 10, 53);
  hudGraphics.fill(190, 85, 96);
  hudGraphics.text('• 850nm IR  → Oxy-Hb (HbO₂)', infoX + 10, 68);
  hudGraphics.fill(120, 75, 95);
  hudGraphics.text('• Banana Arc → Penetrates ~1 cm', infoX + 10, 83);
  hudGraphics.text('  into Prefrontal Cortex to PD', infoX + 10, 96);
  hudGraphics.fill(55, 80, 96);
  hudGraphics.text(`• Heart Rate: ${eegData.heartRate || 72} BPM | Pulse: ${pulse.toFixed(2)}`, infoX + 10, 114);
  hudGraphics.fill(200, 30, 80);
  hudGraphics.text(`• EEG Alpha : ${(eegData.alpha * 100).toFixed(0)}% | Beta: ${(eegData.beta * 100).toFixed(0)}%`, infoX + 10, 130);

  // Project 3D sensor coordinates to 2D callout pills
  const labelOffsets = {
    TP9:    { dx: -115, dy: -22 },
    AF7:    { dx: -125, dy: -42 },
    FPz:    { dx: -48,  dy: -66 },
    AF8:    { dx: 42,   dy: -48 },
    TP10:   { dx: 35,   dy: -22 },
    LED660: { dx: -148, dy: 28 },
    LED730: { dx: -148, dy: 58 },
    LED850: { dx: -148, dy: 88 },
    DET:    { dx: 42,   dy: 46 }
  };

  for (const n of nodes) {
    const p = projectPoint(n.x, n.y, n.z, rotX, rotY, sceneScale);
    const off = labelOffsets[n.id] || { dx: 20, dy: -20 };
    const lx = constrain(p.sx + off.dx, 14, width - 165);
    const ly = constrain(p.sy + off.dy, 62, height - 38);

    // Leader line
    hudGraphics.stroke(n.hue, 80, 95, 0.75);
    hudGraphics.strokeWeight(1.2);
    hudGraphics.line(p.sx, p.sy, lx + 8, ly + 12);
    hudGraphics.fill(n.hue, 90, 100);
    hudGraphics.noStroke();
    hudGraphics.ellipse(p.sx, p.sy, 5, 5);

    // Label pill
    hudGraphics.fill(225, 40, 12, 0.88);
    hudGraphics.stroke(n.hue, 70, 75, 0.85);
    hudGraphics.strokeWeight(1);
    hudGraphics.rect(lx, ly, 152, 28, 4);

    hudGraphics.noStroke();
    hudGraphics.fill(n.hue, 85, 98);
    hudGraphics.textSize(9.5);
    hudGraphics.text(n.label, lx + 6, ly + 4);
    hudGraphics.fill(215, 18, 74);
    hudGraphics.textSize(8.2);
    hudGraphics.text(n.sub, lx + 6, ly + 16);
  }

  // Draw 2D HUD onto WEBGL canvas
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  image(hudGraphics, 0, 0);
  pop();
}
