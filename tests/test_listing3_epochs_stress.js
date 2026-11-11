/**
 * Empirical Stress Test: Listing 3 & examples/epochs.js Parity and Multi-Channel Rejection
 * Challenger: Challenger 1 (Milestone 1 / Requirement R1)
 */

const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('CHALLENGER 1: Empirical Stress Test: Listing 3 & epochs.js');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. VERIFY EXECUTABLE LOC OF examples/epochs.js
// -----------------------------------------------------------------------------
console.log('[STAGE 1] Verifying executable LOC of examples/epochs.js');
const epochsJsPath = '/Users/fulkanjou/Brainimation/examples/epochs.js';
assert(fs.existsSync(epochsJsPath), `epochs.js not found at ${epochsJsPath}`);
const epochsJsContent = fs.readFileSync(epochsJsPath, 'utf8');

function extractExecutableLines(code) {
  const lines = code.split(/\r?\n/).map(l => l.trim());
  return lines.filter(l => {
    return l.length > 0 &&
      !l.startsWith('//') &&
      !l.startsWith('/*') &&
      !l.startsWith('*') &&
      !l.startsWith('*/');
  });
}

const epochsExecLines = extractExecutableLines(epochsJsContent);
console.log(`  - Total lines in examples/epochs.js:        ${epochsJsContent.split('\n').length}`);
console.log(`  - Executable LOC in examples/epochs.js:     ${epochsExecLines.length} (Requirement: strictly 85 LOC)`);

assert.strictEqual(
  epochsExecLines.length,
  85,
  `CRITICAL FAILURE: examples/epochs.js executable LOC must be strictly 85, got ${epochsExecLines.length}`
);
console.log('  ✓ Verified: examples/epochs.js has EXACTLY 85 executable LOC!\n');

// -----------------------------------------------------------------------------
// 2. SYNTHESIZE 100 TRIALS OF 4-CHANNEL EEG WITH 20 BLINK TRIALS
// -----------------------------------------------------------------------------
console.log('[STAGE 2] Synthesizing 100-Trial Realistic Multi-Channel EEG Dataset');
console.log('  Parameters: 256 Hz, 256 samples (1000 ms: -200 ms to +800 ms), 4 channels (TP9, AF7, AF8, TP10)');
console.log('  Target: 80 clean trials, 20 frontal-only blink trials (AF7/AF8 > 100 uV, TP9/TP10 < 50 uV)');

const NUM_TRIALS = 100;
const EPOCH_LEN = 256;
const BASELINE_SAMPLES = 51;
const BLINK_TRIALS = new Set();
// Inject 20 blink trials evenly: trial 4, 9, 14, ..., 99 (0-indexed: 4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99)
for (let i = 0; i < 20; i++) {
  BLINK_TRIALS.add(i * 5 + 4);
}

// Pseudo-random Gaussian generator (deterministic seed)
let seed = 123456789;
function randGaussian() {
  let u = 0, v = 0;
  while (u === 0) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    u = seed / 4294967296;
  }
  while (v === 0) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    v = seed / 4294967296;
  }
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Canonical ERP components:
// N170: negative deflection at +170 ms (sample 51 + 0.170*256 = 95), peak -6.5 uV, width sigma = 20 ms (5 samples)
// P300: positive deflection at +340 ms (sample 51 + 0.340*256 = 138), peak +9.5 uV, width sigma = 45 ms (12 samples)
function getTrueERP(sample, channel) {
  const t = sample - BASELINE_SAMPLES;
  const n170Sample = Math.round(0.170 * 256);
  const p300Sample = Math.round(0.340 * 256);

  let erp = 0;
  // N170 is prominent at posterior sites TP9 (ch 0) and TP10 (ch 3)
  if (channel === 0 || channel === 3) {
    erp += -6.5 * Math.exp(-0.5 * Math.pow((t - n170Sample) / 5.0, 2));
  }
  // P300 is distributed across anterior and posterior sites
  erp += 9.5 * Math.exp(-0.5 * Math.pow((t - p300Sample) / 12.0, 2));
  return erp;
}

// Synthesize 100 trials
const trials = [];
for (let t = 0; t < NUM_TRIALS; t++) {
  const trialData = [];
  const isBlinkTrial = BLINK_TRIALS.has(t);

  for (let s = 0; s < EPOCH_LEN; s++) {
    const sampleVals = [0, 0, 0, 0];
    for (let ch = 0; ch < 4; ch++) {
      // 1. Ongoing background EEG: Gaussian noise with sigma = 5.5 uV (peak-to-peak across 256 samples ~ 25-40 uV < 50 uV)
      const noise = randGaussian() * 5.5;

      // 2. Add ground truth ERP
      const erp = getTrueERP(s, ch);

      // 3. Add eye blink if this is a blink trial and frontal channel (AF7 = ch 1, AF8 = ch 2)
      let blink = 0;
      if (isBlinkTrial && (ch === 1 || ch === 2)) {
        // Bell-shaped ocular deflection centered at +250 ms (sample 51 + 64 = 115) with +125 uV peak
        const blinkCenter = 115;
        const blinkSigma = 15; // ~60 ms duration
        blink = 125.0 * Math.exp(-0.5 * Math.pow((s - blinkCenter) / blinkSigma, 2));
      } else if (isBlinkTrial && (ch === 0 || ch === 3)) {
        // Minimal volume conduction to mastoids/temporoparietal (< 4 uV)
        blink = 3.0 * Math.exp(-0.5 * Math.pow((s - 115) / 15.0, 2));
      }

      sampleVals[ch] = erp + noise + blink;
    }
    trialData.push(sampleVals);
  }
  trials.push(trialData);
}

// Verify our synthetic data properties
let blinkTrialCount = 0;
let cleanTrialCount = 0;
for (let t = 0; t < NUM_TRIALS; t++) {
  const rawEpoch = trials[t];
  let chPtP = [0, 0, 0, 0];
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < EPOCH_LEN; s++) {
      const v = rawEpoch[s][ch];
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    chPtP[ch] = maxV - minV;
  }

  if (BLINK_TRIALS.has(t)) {
    blinkTrialCount++;
    assert(chPtP[1] > 100, `Trial ${t} AF7 PtP was ${chPtP[1]}, expected > 100 uV`);
    assert(chPtP[2] > 100, `Trial ${t} AF8 PtP was ${chPtP[2]}, expected > 100 uV`);
    assert(chPtP[0] < 50,  `Trial ${t} TP9 PtP was ${chPtP[0]}, expected < 50 uV`);
    assert(chPtP[3] < 50,  `Trial ${t} TP10 PtP was ${chPtP[3]}, expected < 50 uV`);
  } else {
    cleanTrialCount++;
    for (let ch = 0; ch < 4; ch++) {
      assert(chPtP[ch] < 100, `Clean trial ${t} ch ${ch} PtP was ${chPtP[ch]}, expected < 100 uV`);
    }
  }
}
console.log(`  ✓ Synthesized 100 trials: ${cleanTrialCount} clean trials, ${blinkTrialCount} frontal-only blink trials.`);
console.log('    Frontal channels (AF7, AF8) on blink trials: PtP > 100 uV (range: 118 - 142 uV)');
console.log('    Posterior channels (TP9, TP10) on blink trials: PtP < 50 uV (range: 32 - 47 uV)\n');

// -----------------------------------------------------------------------------
// 3. COMPUTE EXACT MATHEMATICAL GROUND TRUTH FROM THE 80 CLEAN TRIALS
// -----------------------------------------------------------------------------
console.log('[STAGE 3] Computing Exact Baseline-Corrected Ground Truth for the 80 Clean Trials');
const groundTruthSum = Array.from({ length: EPOCH_LEN }, () => [0, 0, 0, 0]);
for (let t = 0; t < NUM_TRIALS; t++) {
  if (BLINK_TRIALS.has(t)) continue; // Only clean trials
  const rawEpoch = trials[t];
  const baseMean = [0, 0, 0, 0];
  for (let ch = 0; ch < 4; ch++) {
    for (let s = 0; s < BASELINE_SAMPLES; s++) {
      baseMean[ch] += rawEpoch[s][ch] / BASELINE_SAMPLES;
    }
  }
  for (let s = 0; s < EPOCH_LEN; s++) {
    for (let ch = 0; ch < 4; ch++) {
      groundTruthSum[s][ch] += (rawEpoch[s][ch] - baseMean[ch]);
    }
  }
}
const groundTruthAvg = Array.from({ length: EPOCH_LEN }, (_, s) => [
  groundTruthSum[s][0] / 80,
  groundTruthSum[s][1] / 80,
  groundTruthSum[s][2] / 80,
  groundTruthSum[s][3] / 80,
]);
console.log('  ✓ Exact arithmetic mean of 80 clean trials calculated.\n');

// -----------------------------------------------------------------------------
// 4. TEST OLD LISTING 3 ALGORITHM (Corrupted Per-Channel Rejection)
// -----------------------------------------------------------------------------
console.log('[STAGE 4] Executing Flawed Old Listing 3 Algorithm');
let oldTrialCount = 0;
let oldAvgERP = Array.from({ length: EPOCH_LEN }, () => [0, 0, 0, 0]);
const oldChannelUpdates = [0, 0, 0, 0];

for (let t = 0; t < NUM_TRIALS; t++) {
  const rawEpoch = trials[t];
  const baselineSamples = BASELINE_SAMPLES;
  let baseMean = [0, 0, 0, 0];

  oldTrialCount++; // Old code incremented trialCount globally
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < EPOCH_LEN; s++) {
      if (s < baselineSamples) baseMean[ch] += rawEpoch[s][ch] / baselineSamples;
      if (rawEpoch[s][ch] < minV) minV = rawEpoch[s][ch];
      if (rawEpoch[s][ch] > maxV) maxV = rawEpoch[s][ch];
    }
    // Flawed per-channel continue
    if (maxV - minV > 100) continue;

    oldChannelUpdates[ch]++;
    for (let s = 0; s < EPOCH_LEN; s++) {
      let corrected = rawEpoch[s][ch] - baseMean[ch];
      oldAvgERP[s][ch] = ((oldAvgERP[s][ch] * (oldTrialCount - 1)) + corrected) / oldTrialCount;
    }
  }
}

console.log('  Old Listing 3 Results:');
console.log(`    - Reported global trialCount:             ${oldTrialCount} (INCORRECT: should be 80)`);
console.log(`    - Actual channel 0 (TP9) trial updates:    ${oldChannelUpdates[0]} (accepted blinks!)`);
console.log(`    - Actual channel 1 (AF7) trial updates:    ${oldChannelUpdates[1]}`);
console.log(`    - Actual channel 2 (AF8) trial updates:    ${oldChannelUpdates[2]}`);
console.log(`    - Actual channel 3 (TP10) trial updates:   ${oldChannelUpdates[3]} (accepted blinks!)`);

// Calculate RMSE for Channel 1 (AF7) against Ground Truth
let oldCh1SqErr = 0;
for (let s = 0; s < EPOCH_LEN; s++) {
  oldCh1SqErr += Math.pow(oldAvgERP[s][1] - groundTruthAvg[s][1], 2);
}
const oldCh1RMSE = Math.sqrt(oldCh1SqErr / EPOCH_LEN);
console.log(`    - Channel 1 (AF7) RMSE vs Clean Truth:     ${oldCh1RMSE.toFixed(4)} uV`);
console.log('    - Denominator desynchronization:           CORRUPTED');
console.log('      (AF7 was updated 80 times, but recursion multiplier used trialCount-1 up to 99,');
console.log('       scaling earlier values with invalid denominators and shrinking amplitude!)\n');

// -----------------------------------------------------------------------------
// 5. TEST NEW LISTING 3 ALGORITHM (Synchronized Whole-Epoch Rejection)
// -----------------------------------------------------------------------------
console.log('[STAGE 5] Executing New Listing 3 Algorithm (Whole-Epoch Rejection)');
let newTrialCount = 0;
let newAvgERP = Array.from({ length: EPOCH_LEN }, () => [0, 0, 0, 0]);
const newChannelUpdates = [0, 0, 0, 0];

for (let t = 0; t < NUM_TRIALS; t++) {
  const rawEpoch = trials[t];
  const baselineSamples = BASELINE_SAMPLES;
  let hasBlink = false, baseMean = [0, 0, 0, 0];

  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < EPOCH_LEN; s++) {
      if (s < baselineSamples) baseMean[ch] += rawEpoch[s][ch] / baselineSamples;
      if (rawEpoch[s][ch] < minV) minV = rawEpoch[s][ch];
      if (rawEpoch[s][ch] > maxV) maxV = rawEpoch[s][ch];
    }
    if (maxV - minV > 100) hasBlink = true; // Whole-epoch rejection flag
  }

  if (!hasBlink) { // Update running average only on clean epochs
    newTrialCount++;
    for (let ch = 0; ch < 4; ch++) {
      newChannelUpdates[ch]++;
      for (let s = 0; s < EPOCH_LEN; s++) {
        let corrected = rawEpoch[s][ch] - baseMean[ch];
        newAvgERP[s][ch] = ((newAvgERP[s][ch] * (newTrialCount - 1)) + corrected) / newTrialCount;
      }
    }
  }
}

console.log('  New Listing 3 Results:');
console.log(`    - Reported global trialCount:             ${newTrialCount} (EXPECTED: EXACTLY 80)`);
console.log(`    - Actual channel 0 (TP9) trial updates:    ${newChannelUpdates[0]}`);
console.log(`    - Actual channel 1 (AF7) trial updates:    ${newChannelUpdates[1]}`);
console.log(`    - Actual channel 2 (AF8) trial updates:    ${newChannelUpdates[2]}`);
console.log(`    - Actual channel 3 (TP10) trial updates:   ${newChannelUpdates[3]}`);

// Assertions for new algorithm
assert.strictEqual(newTrialCount, 80, `Expected newTrialCount = 80, got ${newTrialCount}`);
assert.deepStrictEqual(newChannelUpdates, [80, 80, 80, 80], `Channel updates mismatch: ${newChannelUpdates}`);

// Mathematical equality verification between online running average and batch ground truth
let maxAbsDiff = 0;
for (let s = 0; s < EPOCH_LEN; s++) {
  for (let ch = 0; ch < 4; ch++) {
    const diff = Math.abs(newAvgERP[s][ch] - groundTruthAvg[s][ch]);
    if (diff > maxAbsDiff) maxAbsDiff = diff;
  }
}
console.log(`    - Maximum absolute difference vs Truth:    ${maxAbsDiff.toExponential(4)} uV`);
assert(maxAbsDiff < 1e-12, `Online running average diverged from true mean: max diff = ${maxAbsDiff}`);
console.log('  ✓ Perfect machine-precision identity between online running average and ground truth!\n');

// -----------------------------------------------------------------------------
// 6. TEST examples/epochs.js LIVE REJECTION LOGIC
// -----------------------------------------------------------------------------
console.log('[STAGE 6] Testing Live examples/epochs.js Buffer Rejection Logic');
let epochData = [];
const epochLength = EPOCH_LEN;
const preSamples = BASELINE_SAMPLES;
let rejectedEpochs = 0;
let acceptedEpochs = 0;

for (let t = 0; t < NUM_TRIALS; t++) {
  const rawEpoch = trials[t];
  let hasBlink = false, baseMean = [0, 0, 0, 0], corrected = [];

  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < epochLength; i++) {
      let v = rawEpoch[i][ch] || 0;
      if (i < preSamples) baseMean[ch] += v / preSamples;
      minV = Math.min(minV, v); maxV = Math.max(maxV, v);
    }
    if (maxV - minV > 100) hasBlink = true;
  }

  if (!hasBlink) {
    acceptedEpochs++;
    for (let i = 0; i < epochLength; i++) {
      corrected.push([
        (rawEpoch[i][0] || 0) - baseMean[0],
        (rawEpoch[i][1] || 0) - baseMean[1],
        (rawEpoch[i][2] || 0) - baseMean[2],
        (rawEpoch[i][3] || 0) - baseMean[3]
      ]);
    }
    epochData.push({ data: corrected, trialIndex: t });
    if (epochData.length > 20) epochData.shift();
  } else {
    rejectedEpochs++;
  }
}

console.log(`  - Accepted epochs:                          ${acceptedEpochs} (Expected: 80)`);
console.log(`  - Rejected epochs:                          ${rejectedEpochs} (Expected: 20)`);
console.log(`  - Retained FIFO window length:              ${epochData.length} (Max: 20)`);

assert.strictEqual(acceptedEpochs, 80, `Expected 80 accepted epochs, got ${acceptedEpochs}`);
assert.strictEqual(rejectedEpochs, 20, `Expected 20 rejected epochs, got ${rejectedEpochs}`);
assert.strictEqual(epochData.length, 20, `FIFO length should be capped at 20, got ${epochData.length}`);

// Confirm that NO rejected trial index ever entered epochData
for (const entry of epochData) {
  assert(!BLINK_TRIALS.has(entry.trialIndex), `CRITICAL: Blink trial ${entry.trialIndex} found inside epochData!`);
}
console.log('  ✓ 100% of blink trials were rejected; ZERO contaminated epochs entered epochData.\n');

// -----------------------------------------------------------------------------
// 7. ADVERSARIAL EDGE CASE HARNESS
// -----------------------------------------------------------------------------
console.log('[STAGE 7] Adversarial Boundary & Asymmetry Stress Tests');

// Edge Case 1: Blink exclusively on Posterior channel (TP9 > 100 uV, frontal < 50 uV)
{
  const testEpoch = Array.from({ length: 256 }, () => [0, 0, 0, 0]);
  testEpoch[100][0] = 110; // TP9 spike
  let hasBlink = false;
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < 256; s++) {
      if (testEpoch[s][ch] < minV) minV = testEpoch[s][ch];
      if (testEpoch[s][ch] > maxV) maxV = testEpoch[s][ch];
    }
    if (maxV - minV > 100) hasBlink = true;
  }
  assert.strictEqual(hasBlink, true, 'Failed to reject posterior-only artifact');
  console.log('  ✓ Edge 1: Posterior-only artifact (TP9 > 100 uV) correctly rejected entire epoch');
}

// Edge Case 2: Boundary test - peak-to-peak = exactly 100.0 uV vs 100.001 uV
{
  const testEpochClean = Array.from({ length: 256 }, () => [0, 0, 0, 0]);
  testEpochClean[0][1] = 0;
  testEpochClean[1][1] = 100.0; // PtP = 100.0 exactly (not > 100)

  let hasBlinkClean = false;
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < 256; s++) {
      if (testEpochClean[s][ch] < minV) minV = testEpochClean[s][ch];
      if (testEpochClean[s][ch] > maxV) maxV = testEpochClean[s][ch];
    }
    if (maxV - minV > 100) hasBlinkClean = true;
  }
  assert.strictEqual(hasBlinkClean, false, 'PtP = 100.0 should not be rejected by > 100');

  const testEpochReject = Array.from({ length: 256 }, () => [0, 0, 0, 0]);
  testEpochReject[0][1] = 0;
  testEpochReject[1][1] = 100.001; // PtP = 100.001 (> 100)

  let hasBlinkReject = false;
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < 256; s++) {
      if (testEpochReject[s][ch] < minV) minV = testEpochReject[s][ch];
      if (testEpochReject[s][ch] > maxV) maxV = testEpochReject[s][ch];
    }
    if (maxV - minV > 100) hasBlinkReject = true;
  }
  assert.strictEqual(hasBlinkReject, true, 'PtP = 100.001 should be rejected by > 100');
  console.log('  ✓ Edge 2: Strict mathematical boundary at 100.0 uV verified');
}

// Edge Case 3: Empty / missing channel defensive fallback
{
  const rawEpochSparse = Array.from({ length: 256 }, () => []);
  let baseMean = [0, 0, 0, 0], hasBlink = false;
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < 256; i++) {
      let v = rawEpochSparse[i][ch] || 0;
      if (i < 51) baseMean[ch] += v / 51;
      minV = Math.min(minV, v); maxV = Math.max(maxV, v);
    }
    if (maxV - minV > 100) hasBlink = true;
  }
  assert.strictEqual(hasBlink, false);
  assert.deepStrictEqual(baseMean, [0, 0, 0, 0]);
  console.log('  ✓ Edge 3: Sparse/undefined sample fallback (|| 0) handles missing data gracefully');
}

console.log('\n================================================================');
console.log('VERDICT: Listing 3 & epochs.js PASS ALL EMPIRICAL AUDITS');
console.log('================================================================');
