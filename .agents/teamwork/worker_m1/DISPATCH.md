## 2026-11-09T19:32:23Z
You are Worker 1 (Codebase & Listing Synchronization Specialist).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/worker_m1
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Read the complete technical specification prepared by Explorer 1 at:
/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1/handoff.md

PROJECT SCOPE & FILE OWNERSHIP:
You own exclusively:
- /Users/fulkanjou/Brainimation/examples/basic.js
- /Users/fulkanjou/Brainimation/examples/epochs.js
- /Users/fulkanjou/Brainimation/index.html
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex (Listings 1, 3, 5, and Section 2.2 only)
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md (Listings 1, 3, 5, and Section 2.2 only)

DO NOT modify /Users/fulkanjou/EEGEDUPaper/repos/Brainimation.

YOUR TASKS:
1. `examples/basic.js` & Listing 1:
   - Make `examples/basic.js` and Listing 1 in `paper2_brainimation.tex` and `manuscript.md` identical in code logic.
   - Map `eegData.alpha` to `size` (50..300) and `eegData.attention` to `hue` (180..360). Include `noStroke();`, remove `console.log`.
   - Preserve exactly 11 executable lines of code (LOC) in both `examples/basic.js` and Listing 1 (verified using the project's executable LOC definition: non-empty, non-comment lines).
2. `examples/epochs.js` & Listing 3:
   - In Listing 3 (`paper2_brainimation.tex` and `manuscript.md`), fix the per-channel `continue` trialCount desynchronization bug by checking peak-to-peak amplitude (>100 uV) across ALL channels over the whole epoch BEFORE advancing `trialCount` and `avgERP`.
   - In `/Users/fulkanjou/Brainimation/examples/epochs.js`, implement whole-epoch peak-to-peak blink rejection (>100 uV) across all channels before pushing to `epochData`.
   - Strictly preserve exactly 85 executable LOC in `examples/epochs.js`.
3. `index.html` (`updateShortChannelRegression`):
   - Modify rolling-mean de-meaning so the 96-sample mean is subtracted ONLY inside the covariance and variance estimation loops for beta, leaving the raw optical density traces unattenuated.
   - Adjust baseline tracker update rate to `0.0005` (slow time constant tau ~ 31.25 s at 64 Hz) so 4-14 s cortical hemodynamic responses (cleanHbO2/cleanHHb) are preserved as in `generate_figures.py`.
4. `index.html` (`updateEEGImuMotionFilter`) & Listing 5:
   - In `index.html`, support both numeric keys (`0..3`) and channel-name keys (`'TP9', 'AF7', 'AF8', 'TP10'`) on `eegData.motionFilterWeights` (e.g. `this.eegData.motionFilterWeights[ch] = this.motionFilterWeights[chNames[ch]];`).
   - Align NLMS constants across `index.html`, `generate_figures.py`, and Listing 5: mu = 0.035, leakage = 0.9992, epsilon = 1e-4, linear acceleration reference scaling = 0.25, gyroscope scaling = 1.0 / 80.0.
5. Section 2.2 in `paper2_brainimation.tex` and `manuscript.md`:
   - Clarify that live hardware uses a 1-second sliding Hanning FFT (`MuseEEGManager.calculateFrequencyBands`) on 256 Hz raw data, whereas `EEGSimulator` drives band power envelopes directly from the Attention/Meditation sliders alongside 256 Hz raw EEG synthesis.

VERIFICATION REQUIREMENTS:
- Verify that `examples/basic.js` has exactly 11 executable LOC.
- Verify that `examples/epochs.js` has exactly 85 executable LOC.
- Check syntax of `basic.js`, `epochs.js`, and `index.html` (e.g. `node -c examples/basic.js`, `node -c examples/epochs.js`).
- Document all verification commands and outcomes in your handoff report.

Write your final report to:
/Users/fulkanjou/Brainimation/.agents/teamwork/worker_m1/handoff.md
Send a completion message to your parent orchestrator (19b884d0-bc13-434a-b900-b62ef20b94f8).

## 2026-11-09T19:43:07Z
**Context**: Milestone 1 Implementation (Code Synchronization & Live JS)
**Content**: Checking on your progress. Your progress file shows status 'Initializing' since 19:33:00Z.
**Action**: Please report your current status or progress on Tasks 1-5.
