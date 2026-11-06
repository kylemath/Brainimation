/**
 * @id neurotech2025RanaRCaterpillarDominantWave
 * @title 1-Second Averaged Caterpillar Wave Visualizer (Rana Radiansyah)
 * @category 2025 Neurotech Class Catalogue
 * @order 77
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Averages all 5 EEG frequency bands every second to smoothly position glowing caterpillars and highlight the dominant brainwave.
 */
// --- EEG Caterpillar Brainwave Visualizer (Averaged per Second) ---

// Uses BrainImation global eegData
let scaledEEG = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };

// --- Visual Settings ---
let startLine = 50;
let spacing = 20;
let baseSegmentSize = 30;
let eyeSize = 15;
let numCaterpillars = 5;

// --- Animation Variables ---
let caterpillarPositions = [];
let trails = [[], [], [], [], []];
let names = ["Alpha", "Beta", "Gamma", "Theta", "Delta"];
let winnerIndex = -1;

// --- Averaging Variables ---
let eegHistory = {
  alpha: [],
  beta: [],
  gamma: [],
  theta: [],
  delta: [],
};
let lastUpdateTime = 0;
let averagedEEG = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };

function setup() {
  frameRate(30);
  for (let i = 0; i < numCaterpillars; i++) {
    caterpillarPositions.push(startLine);
  }
}

function draw() {
  background(0);
;

  // --- Simulate EEG data every frame ---
  scaledEEG.alpha = constrain((eegData.alpha || 0.5) * 15, 0, 15);
  scaledEEG.beta  = constrain((eegData.beta  || 0.5) * 15, 0, 15);
  scaledEEG.gamma = constrain((eegData.gamma || 0.5) * 15, 0, 15);
  scaledEEG.theta = constrain((eegData.theta || 0.5) * 15, 0, 15);
  scaledEEG.delta = constrain((eegData.delta || 0.5) * 15, 0, 15);

  // --- Collect EEG data for 1-second averaging ---
  collectEEGData();

  // --- Determine dominant wave from averaged data ---
  const values = [
    averagedEEG.alpha,
    averagedEEG.beta,
    averagedEEG.gamma,
    averagedEEG.theta,
    averagedEEG.delta,
  ];
  let maxVal = Math.max(...values);
  winnerIndex = values.indexOf(maxVal);

  // --- Draw ---
  drawCaterpillars();
  drawDominantWaveLabel();
}

// --- Function to collect EEG values per frame and average every second ---
function collectEEGData() {
  // Push current frame data into history arrays
  for (let key in scaledEEG) {
    eegHistory[key].push(scaledEEG[key]);
  }

  // Check time elapsed (1 second = 1000 ms)
  if (millis() - lastUpdateTime > 1000) {
    // Average each EEG band
    for (let key in eegHistory) {
      let arr = eegHistory[key];
      averagedEEG[key] = arr.reduce((a, b) => a + b, 0) / arr.length;
      eegHistory[key] = []; // reset after averaging
    }
    lastUpdateTime = millis();
  }
}

// --- Draw caterpillars based on averaged EEG values ---
function drawCaterpillars() {
  for (let i = 0; i < numCaterpillars; i++) {
    let y = ((i + 0.5) * height) / numCaterpillars;
    let eegValue = Object.values(averagedEEG)[i];

    // Target x-position scaled to EEG intensity
    let targetX = startLine + ((width - 150 - startLine) * (eegValue / 15));

    // Smooth interpolation
    caterpillarPositions[i] += (targetX - caterpillarPositions[i]) * 0.05;

    // Gentle oscillation to simulate waveform nature
    let oscillation = Math.sin(frameCount * (0.02 + i * 0.01)) * 10;
    let displayX = caterpillarPositions[i] + oscillation;

    // --- Trail ---
    trails[i].push({ x: displayX, y });
    if (trails[i].length > 30) trails[i].shift();

    noStroke();
    for (let j = 0; j < trails[i].length; j++) {
      let alpha = (j / trails[i].length) * 180 + 50;
      fill(255, 255, 255, alpha);
      ellipse(trails[i][j].x, trails[i][j].y, 6);
    }

    // --- Caterpillar Body ---
    let segmentSize = baseSegmentSize + Math.sin(frameCount * 0.3 + i) * (eegValue / 3);
    if (i === winnerIndex) {
      stroke(255, 255, 150);
      strokeWeight(3);
    } else {
      stroke(0);
      strokeWeight(1);
    }
    fill(getCaterpillarColor(i));
    for (let s = 0; s < 6; s++) {
      ellipse(displayX - s * spacing, y, segmentSize);
    }

    // --- Eyes ---
    fill(0);
    noStroke();
    ellipse(displayX - 5, y - 5, eyeSize / 2);
    ellipse(displayX + 5, y - 5, eyeSize / 2);

    // --- Label above ---
    textAlign(CENTER);
    textSize(18);
    fill(i === winnerIndex ? 255 : 0);
    text(names[i], displayX, y - 40);
  }
}

// --- Color mapping per EEG band ---
function getCaterpillarColor(i) {
  if (i === 0) return color(255, 100, 100);   // Alpha
  if (i === 1) return color(100, 255, 100);   // Beta
  if (i === 2) return color(100, 100, 255);   // Gamma
  if (i === 3) return color(255, 200, 100);   // Theta
  if (i === 4) return color(200, 100, 255);   // Delta
  return color(255);
}

// --- Display dominant wave label at top ---
function drawDominantWaveLabel() {
  if (winnerIndex !== -1) {
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255);
    text(`💡 Dominant Wave: ${names[winnerIndex]}`, width / 2, 40);
  }
}
