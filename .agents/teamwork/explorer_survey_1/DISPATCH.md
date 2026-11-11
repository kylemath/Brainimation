## 2026-11-09T19:18:56Z
You are Explorer 1 (Codebase & Listing Spec Miner).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Also consult the audit ledger at:
/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md

YOUR MISSION:
Investigate and produce an exhaustive technical specification for Requirement R1 (Code Synchronization & Live JavaScript Implementations):
1. Compare `/Users/fulkanjou/Brainimation/examples/basic.js` and Listing 1 in `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (and `manuscript.md`). Check the exact mapping of `eegData.alpha` and `eegData.attention` to `size` and `hue`. Determine how to make them completely identical while strictly preserving 11 executable LOC (non-empty, non-comment lines).
2. Inspect `/Users/fulkanjou/Brainimation/examples/epochs.js` and Listing 3 in `paper2_brainimation.tex` and `manuscript.md`. Check how peak-to-peak blink rejection (>100 uV) is currently handled, how per-channel `trialCount` desynchronization occurs (e.g. frontal AF7/AF8 blinks while TP9/TP10 remain <100 uV), and design the exact whole-epoch rejection logic across all channels before incrementing `trialCount` / `epochData`. Verify how to strictly preserve 85 executable LOC in `examples/epochs.js`.
3. Inspect `index.html` (`updateShortChannelRegression`) in `/Users/fulkanjou/Brainimation` and compare with `generate_figures.py` fNIRS simulation. Check how the 96-sample (1.5 s) rolling mean is subtracted and where covariance/variance estimation occurs, and identify the slow I0 baseline time constant needed for `cleanHbO2`/`cleanHHb` to preserve 4-14 s cortical HRFs.
4. Inspect `index.html` (`updateEEGImuMotionFilter`) in `/Users/fulkanjou/Brainimation`, compare with `generate_figures.py` and Listing 5 in `paper2_brainimation.tex`. Determine how to support both numeric (`0..3`) and channel-name (`TP9, AF7, AF8, TP10`) keys on `eegData.motionFilterWeights` (or use `chNames[ch]`), and check NLMS constants (mu, leakage, reference scaling) to align them across all three locations.
5. Inspect Section 2.2 in `paper2_brainimation.tex` regarding live hardware 1-second sliding Hanning FFT (`MuseEEGManager.calculateFrequencyBands`) vs `EEGSimulator` band envelopes and synthesis.

CONSTRAINTS:
- You are read-only for codebase and manuscript files. Do NOT modify any source code or paper files.
- Remember: NEVER modify `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation`.
- Write your detailed findings and actionable recommendations to:
  `/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1/handoff.md`
- Update your progress in:
  `/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1/progress.md`
- When complete, send a message to your parent (19b884d0-bc13-434a-b900-b62ef20b94f8) summarizing your findings and referencing your handoff report.
