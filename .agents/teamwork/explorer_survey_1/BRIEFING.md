# BRIEFING — 2026-11-09T19:27:30Z

## Mission
Investigate and produce an exhaustive technical specification for Requirement R1 (Code Synchronization & Live JavaScript Implementations).

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Teamwork specialist, External domain expert
- Working directory: /Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1
- Original parent: 19b884d0-bc13-434a-b900-b62ef20b94f8
- Milestone: Requirement R1 (Code Synchronization & Live JavaScript Implementations)

## 🔒 Key Constraints
- Read-only for codebase and manuscript files. Do NOT modify any source code or paper files.
- NEVER modify /Users/fulkanjou/EEGEDUPaper/repos/Brainimation.
- Write only to working directory: /Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_1.
- No silent specification weakening or surrogate substitution (Universal Anti-Goodharting & Integrity Rules).
- Deliver findings in handoff.md and report to parent via send_message.

## Current Parent
- Conversation ID: 19b884d0-bc13-434a-b900-b62ef20b94f8
- Updated: 2026-11-09T19:27:30Z

## Task Summary
- **What to build**: Comprehensive technical specification & audit report for Requirement R1
- **Success criteria**: Exhaustive comparison of basic.js vs Listing 1, epochs.js vs Listing 3, updateShortChannelRegression vs generate_figures.py fNIRS, updateEEGImuMotionFilter vs Listing 5, and Sec 2.2 FFT vs Simulator.
- **Interface contracts**: /Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md
- **Code layout**: Brainimation root repo and EEGEDUPaper/paper2_brainimation

## Key Decisions Made
- Confirmed exact mapping for basic.js: eegData.alpha -> size, eegData.attention -> hue, strictly preserving 11 executable LOC.
- Identified per-channel trialCount desynchronization mechanism in Listing 3 and designed whole-epoch rejection across all 4 channels prior to trialCount increment.
- Formatted epochs.js whole-epoch rejection and baseline correction to preserve exactly 85 executable LOC.
- Formulated index.html updateShortChannelRegression fix: slow I0 baseline tracker (tau ~ 31 s) and local de-meaning strictly within covariance/variance estimation to preserve 4-14 s cortical HRFs.
- Aligned NLMS constants across index.html, generate_figures.py, and Listing 5 (mu = 0.035, leakage = 0.9992, epsilon = 1e-4, reference scaling: linAccel * 0.25, gyro / 80.0) and aliased numeric keys 0..3 on motionFilterWeights.
- Clarified Section 2.2 live hardware sliding Hanning FFT vs EEGSimulator slider-driven envelopes.

## Artifact Index
- DISPATCH.md — Dispatch assignment record
- progress.md — Liveness heartbeat
- BRIEFING.md — Working memory
- handoff.md — Final hard handoff report
