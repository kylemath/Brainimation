## 2026-11-09T19:59:37Z

You are Worker 2 (Feature Regexes, Student Deduplication & Stats Macro Specialist).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/worker_m2
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Read the complete technical specification prepared by Explorer 2 at:
/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_2/handoff.md

PROJECT SCOPE & FILE OWNERSHIP:
You own exclusively:
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/stats_macros.tex
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/stats_summary.json
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/verify_manuscript_analyses.py
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex (Section 3.1, 3.2, Table 1, Table 2, and Section 5 Wilcoxon/clustering prose)
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md (Section 3.1, 3.2, Table 1, Table 2, and Section 5 Wilcoxon/clustering prose)

DO NOT modify /Users/fulkanjou/EEGEDUPaper/repos/Brainimation.

YOUR TASKS (Requirement R2):
1. Expand feature regexes in `generate_figures.py`:
   - In both `analyze_builtin_examples()` and `make_fig4_student_submissions()`, expand band power and state regexes to capture optional chaining (`eegData?.alpha`, `eegData?.beta`, `eegData?.theta`, `eegData?.gamma`, `eegData?.delta`, `eegData?.attention`, `eegData?.meditation`) and aliased variables (`e.alpha`, `src.alpha`, `d.alpha`):
     Use pattern: `r"(?:eegData\??\.|\b(?:e|src)\.)" + prop + r"\b|getChannelBand\(\s*['\"]" + prop`
   - In `make_fig4_student_submissions()`, replace the tautological `"erp_oddball": is_erp_cohort` with an explicit code regex matching ERP/epoching logic (`getRecentEpoch|epochData|avgStd|avgTgt|avgERP|epochBuffer|trialCount|targetTrials|standardTrials|preStim|postStim|oddball|stimulusType|targetEpoch|standardEpoch|triggerTime|triggerOnset|n170|p300|mmn|EPOCH_SAMPLES|PRE_SAMPLES|POST_SAMPLES|onlineMeanUpdate`), which matches all 29 Cohort 2 submissions and 0 Cohort 1 false positives.
2. Section 5 student submission deduplication & Wilcoxon analysis:
   - In Section 5 of `paper2_brainimation.tex` and `manuscript.md`, explain clearly why N = 69 submissions across N_students = 30 learners include iterative/assignment versions alongside Midterm Part 1 and Part 2 (e.g., Assignment 2 preceding Midterm Part 1, or early draft + revised submission), which motivates the per-student clustered median analysis to prevent pseudoreplication.
   - Report the specific Wilcoxon signed-rank comparison of Cohort 2 ERP submissions against the 85-LOC `epochs.js` template: 100% (29/29) exceed 85 LOC (min = 117 LOC, median = 176 LOC, median 2.07x expansion, W = 435.0, p = 1.86e-9).
   - Add a 1-clause definition of executable LOC: non-empty, non-comment lines of JavaScript code (excluding blank lines and lines starting with `//`, `/*`, `*`, or `*/`).
3. Wire all 32 hardcoded numbers across Section 3.1, Section 3.2, Table 1, and Table 2 into `stats_macros.tex` / `paper2_brainimation.tex`:
   - 5 Reference Drawer tab counts (`\NRefSensors`, `\NRefPFive`, `\NRefInput`, `\NRefEEGData`, `\NRefSound`)
   - 8 Section 3.2 numbers (`\StudioPPGLOCMedian`, `\StudioIMULOCMedian`, `\StudioMultiLOCMedian`, `\NGamesAndEEGEdu`, `\BrainGamesLOCMedian`, `\NArchivalTotal`, `\NeurotechLOCMedian`, `\NeuroArtLOCMedian` with standardized rounding of Category 18 median to `43`)
   - Table 1 bundle size (`\LegacyMuseKB` = 473.0)
   - Table 2 Rows 2–4 and Row 7 (`\StudiosLOCMedian`, `\StudiosLOCIQRLow`, `\StudiosLOCIQRHigh`, `\StudiosLOCMin`, `\StudiosLOCMax`, etc.)
   - Additional course sketches (`\NAdditionalSketches` = 26)
   - Ensure `generate_figures.py` writes all these macro definitions into `stats_macros.tex` and `stats_summary.json`.
4. Update `muse-browser.js` size:
   - Reflect the exact 38.0 KB size (38,899 bytes, 12.5x reduction vs 473.0 KB) in `stats_macros.tex`, `paper2_brainimation.tex`, and `manuscript.md`.
5. Update `verify_manuscript_analyses.py`:
   - Add verification checks for Table 2 subgroup quantiles (Q1, median, Q3, min, max for LOC and feature adoption percentages).
   - Verify that running `python3 verify_manuscript_analyses.py` passes 100% of all checks with exit code 0.

VERIFICATION REQUIREMENTS:
- Run `python3 generate_figures.py` to regenerate `stats_macros.tex` and `stats_summary.json`.
- Run `python3 verify_manuscript_analyses.py` and ensure ALL checks pass.
- Run `pdflatex -interaction=batchmode paper2_brainimation.tex` and verify exit code 0.
- Document all verification commands and outcomes in your handoff report.

## 2026-11-09T20:09:53Z

**Context**: Milestone 2 Implementation (Regexes, Deduplication, & Stats Macros)
**Content**: Checking on your progress. 10 minutes have elapsed since dispatch.
**Action**: Please report your current progress across Tasks 1–5.
