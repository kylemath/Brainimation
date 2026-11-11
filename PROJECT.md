# Project: Brainimation Manuscript and Codebase Remediation

## Architecture
Brainimation is an in-browser creative neurotechnology platform combining Web Bluetooth (Muse 2 and Muse S headbands), p5.js generative animation, DSP pipelines (fNIRS short-channel regression and IMU NLMS motion artifact removal), and online electrophysiological averaging (ERP). The remediation synchronizes live JavaScript implementations with academic manuscript listings, corrects signal processing and statistics macros, refines neurophysiological terminology, enforces clean scientific figure and Mathewson academic writing standards, and updates peer review response artifacts.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | `basic.js` & Listing 1 Sync | Align `basic.js` and Listing 1 (alpha -> size, attention -> hue, noStroke), preserve 11 executable LOC | M1 | Survey E1 |
| 2 | `epochs.js` & Listing 3 Sync | Whole-epoch peak-to-peak blink rejection (>100 uV) across all 4 channels, prevent trialCount desync, preserve 85 LOC | M1 | Survey E1 |
| 3 | fNIRS Short-Channel Regression | In `index.html`, rolling-mean subtraction strictly inside cov/var; slow baseline tau (~31.25 s) preserving 4-14 s HRF | M1 | Survey E1 |
| 4 | IMU NLMS Filter & Listing 5 | Support numeric 0..3 and channel name keys on `motionFilterWeights`, align NLMS constants (mu=0.035, leak=0.9992, eps=1e-4) | M1 | Survey E1 |
| 5 | Section 2.2 FFT Clarification | Clarify 1s sliding Hanning FFT (`MuseEEGManager`) vs `EEGSimulator` slider-driven envelopes | M1 | Survey E1 |
| 6 | Feature Regexes Expansion | Expand regexes in `generate_figures.py` to capture optional chaining (`eegData?.alpha`) and aliases (`e.alpha`, `src.alpha`) | M2 | Survey E2 |
| 7 | Explicit ERP Code Regex | Replace tautological `"erp_oddball": is_erp_cohort` with explicit code regex matching ERP logic | M2 | Survey E2 |
| 8 | Student Deduplication & Cluster Rationale | Explain N=69 across N=30 (iterative versions) motivating per-student clustered median analysis in Section 5 | M2 | Survey E2 |
| 9 | Wilcoxon Test & 1-Clause LOC Definition | Report Cohort 2 ERP vs 85-LOC epochs.js (100% exceed, p=1.86e-9) and 1-clause LOC definition | M2 | Survey E2 |
| 10 | Wire 32 Hardcoded Numbers to Macros | Wire all 32 hardcoded numbers in Sec 3.1, 3.2, Table 1, Table 2 into `stats_macros.tex` | M2 | Survey E2 |
| 11 | `muse-browser.js` Size Sync | Update `stats_macros.tex` and `manuscript.md` to reflect exact 38.0 KB (12.5x reduction vs 473.0 KB) | M2 | Survey E2 |
| 12 | Table 2 Subgroup Verification Suite | Add Table 2 subgroup LOC quantiles & feature adoption checks to `verify_manuscript_analyses.py` | M2 | Survey E2 |
| 13 | Fpz-Referenced Polarity Reconciliation | Reconcile Fig 3C canonical textbook polarity (-6.5 uV N170, +9.5 uV P300) with physical Fpz polarity inversion | M3 | Survey E3 |
| 14 | Optical Channels Terminology | Update Sec 3.2 to 'three raw optical channels (ambient photodetector baseline, Red 660 nm, and Infrared 850 nm, plus Near-Infrared 730 nm on Muse S Athena)' | M3 | Survey E3 |
| 15 | fNIRS Physics & MBLL Principles | Add isosbestic straddling (~800 nm), CW-MBLL assumptions (constant DPF, homogeneous scattering), penetration depth (~d/3 to d/2) in Sec 4.3 | M3 | Survey E3 |
| 16 | PPG-Peak Locked HEP & PTT Jitter | Fig 1C row 13 'PPG-peak locked HEP', Sec 3.2 PTT delay (150-250 ms) and jitter (10-25 ms) | M3 | Survey E3 |
| 17 | BibTeX En-Dashes | Standardize coordinate compound hyphens to en-dashes (`{Brain--Computer}`) in `references2.bib` | M3 | Survey E3 |
| 18 | Figure Axis Headroom & Labels | Fig 3C `ylim(-42, 36)`, Fig 5A `ylim(-5.2, 6.5)`, Fig 1A Box 3 label, Fig 2C caption scatter dot removal, Cat 18 median rounding (`43`) | M4 | Survey E3 |
| 19 | LaTeX Typography & Writing Polish | Strip mid-sentence bolding, format tracks via `\emph{...}`, unify BrainImation, convert passive to active first-person plural | M4 | Survey E3 |
| 20 | Listing Minipages & Table Placement | Wrap Listings 1-6 in minipages, place Table 2 cleanly below Sec 5 paragraph 1, align Fig 4/5 order between .tex and .md | M4 | Survey E3 |
| 21 | Figure Generation & PDF Build | Regenerate figures via `generate_figures.py`, recompile PDF (`pdflatex` + `bibtex`), generate `pdf_pages/*.png` | M4 | Survey E3 |
| 22 | Forensic Audit & Ledger Updates | Run `verify_manuscript_analyses.py`, forensic integrity audit, update `reviewer_audit_ledger.md`, `PeerReview_Report.md`, and `Response_to_Reviewers.md` | M5 | Survey All |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Code Synchronization & Live JS | F1, F2, F3, F4, F5 | none | DONE |
| M2 | Regexes, Deduplication, Macros & Stats Suite | F6, F7, F8, F9, F10, F11, F12 | M1 | DONE |
| M3 | Neurophysiology & Citations | F13, F14, F15, F16, F17 | M2 | DONE |
| M4 | Figure Styling, Typography, Formatting & PDF | F18, F19, F20, F21 | M3 | DONE |
| M5 | Final Verification, Audit & Ledger Updates | F22 | M4 | DONE |

## Interface Contracts
### Codebase ↔ Manuscript Listings
- `examples/basic.js` is byte-for-byte identical in code logic with Listing 1 (11 executable LOC).
- `examples/epochs.js` contains whole-epoch >100 uV peak-to-peak rejection across 4 channels, matching Listing 3 (85 executable LOC).
- `index.html` `eegData.motionFilterWeights` supports integer indices `0..3` matching Listing 5.

### DSP Constants
- NLMS: $\mu = 0.035$, leakage $= 0.9992$, $\varepsilon = 10^{-4}$, linear accel scaling $= 0.25$, gyro scaling $= 1.0/80.0$.
- fNIRS: rolling mean window $= 96$ samples (1.5 s at 64 Hz), baseline tracker update rate $= 0.0005$ ($\tau \approx 31.25$ s).

### Stats Macros ↔ Manuscript & Python
- All statistical quantities in `paper2_brainimation.tex` and `manuscript.md` are driven by `\statsmacro` definitions generated by `generate_figures.py` and exported to `stats_macros.tex` and `stats_summary.json`.

## Code Layout
- Target Codebase: `/Users/fulkanjou/Brainimation/`
  - `examples/basic.js`
  - `examples/epochs.js`
  - `index.html`
  - `muse-browser.js`
- Target Manuscript: `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/`
  - `paper2_brainimation.tex`
  - `manuscript.md`
  - `generate_figures.py`
  - `verify_manuscript_analyses.py`
  - `stats_macros.tex`
  - `stats_summary.json`
  - `references2.bib`
  - `PeerReview_Report.md`
  - `Response_to_Reviewers.md`
- Audit Ledger: `/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md`
- PROHIBITED DIRECTORY: `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation` (DO NOT MODIFY)
