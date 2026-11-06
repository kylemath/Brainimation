/**
 * @id multiNeuroCardiacCosmos3D
 * @title 3D Neuro-Cardiac Galaxy (EEG Orbits + PPG Supernova)
 * @category Multimodal (EEG + PPG + HR)
 * @order 5
 */
// Multimodal 3D Visualization combining 4-Electrode EEG, 3-Wavelength PPG, and Heart Rate:
//   - Central Heart Star pulses & flares with every systolic PPG peak (`eegData.ppgPulse` & `eegData.heartRate`)
//   - 4 Orbital Neural Rings represent the 4 Muse EEG electrodes (TP9, AF7, AF8, TP10) driven by Alpha/Beta/Theta/Gamma
//   - Crimson (HbO2) and Cyan (EEG Alpha) starfields swirl in 3D space!

let stars = [];

function setup() {
  createCanvas(width, height, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = 0; i < 90; i++) {
    stars.push({
      r: random(45, 195),
      theta: random(TWO_PI),
      yOff: random(-55, 55),
      speed: random(0.3, 1.1),
      size: random(2, 5.2),
      bandIdx: i % 4
    });
  }
}

function draw() {
  background(232, 48, 6);

  const t = millis() * 0.001;
  const pulse = eegData.connected
    ? (eegData.ppgPulse || 0.5)
    : 0.48 + 0.46 * Math.pow(max(0, sin(t * 3.8)), 3);
  const bpm = eegData.heartRate > 0 ? eegData.heartRate : 74;

  const chBands = [
    eegData.getChannelBand('alpha', 0),
    eegData.getChannelBand('beta',  1),
    eegData.getChannelBand('theta', 2),
    eegData.getChannelBand('gamma', 3)
  ];

  const s = Math.min(width, height) / 420;
  scale(s);
  rotateX(0.52 + sin(t * 0.35) * 0.14);
  rotateY(t * 0.28);

  ambientLight(220, 30, 40);
  pointLight(352, 90, 100, 0, 0, 120);

  // 1. Central Cardiac PPG Supernova Core
  push();
  noStroke();
  const coreR = 24 + pulse * 22;
  fill(352, 88, 100);
  sphere(coreR, 18, 14);
  fill(35, 90, 100, 0.32);
  sphere(coreR * 1.45, 14, 12);
  pop();

  // 2. 4 Electrode Orbital Rings (TP9, AF7, AF8, TP10)
  const ringHues = [190, 140, 280, 42];
  for (let c = 0; c < 4; c++) {
    push();
    rotateX((c - 1.5) * 0.32 + sin(t + c) * 0.15);
    rotateY(c * 0.78);
    noFill();
    stroke(ringHues[c], 85, 98, 0.75);
    strokeWeight(2.2);
    const ringR = 68 + c * 28 + chBands[c] * 22;
    torus(ringR, 1.8 + chBands[c] * 2.2, 24, 12);
    pop();
  }

  // 3. Swirling Multimodal Starfield
  noStroke();
  const hrFactor = map(bpm, 55, 115, 0.75, 1.75, true);
  for (const st of stars) {
    const angle = st.theta + t * st.speed * hrFactor;
    const rad = st.r + pulse * 14;
    const x = cos(angle) * rad;
    const z = sin(angle) * rad;
    const y = st.yOff * (0.6 + chBands[st.bandIdx] * 0.9) + sin(angle * 2 + t * 2) * 10;

    push();
    translate(x, y, z);
    fill(ringHues[st.bandIdx], 85, 100, 0.9);
    sphere(st.size * (0.8 + pulse * 0.5), 6, 6);
    pop();
  }
}
