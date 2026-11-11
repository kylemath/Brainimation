# Original User Request

## Initial Request — 2026-11-09T19:15:50Z

Execute the comprehensive remediation plan for the Brainimation manuscript and codebase across `/Users/fulkanjou/Brainimation` and `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation`, addressing all feedback from the Three-Reviewer & Action Editor Panel to prepare the final publication-ready manuscript revision and synchronized codebase for academic journal resubmission.

Integrity mode: development

Reference material:
- Audit Ledger File: `/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md`
- Target Manuscript Directory: `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation` (`paper2_brainimation.tex`, `manuscript.md`, `generate_figures.py`, `verify_manuscript_analyses.py`, `stats_macros.tex`, `stats_summary.json`, `references2.bib`)
- Target Codebase Directory: `/Users/fulkanjou/Brainimation` (`index.html`, `muse-browser.js`, `examples/basic.js`, `examples/epochs.js`)
- Repository constraint: Only modify `/Users/fulkanjou/Brainimation` and `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation`; do NOT modify `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation`
- Skills to enforce: `/Users/fulkanjou/.gemini/config/skills/mathewson-academic-writing/SKILL.md` and `/Users/fulkanjou/.gemini/config/skills/clean-scientific-figures/SKILL.md`

## Requirements

### R1. Synchronize Code Listings & Live JavaScript Implementations
Synchronize the code listings in `paper2_brainimation.tex` and `manuscript.md` with the live JavaScript implementations in `/Users/fulkanjou/Brainimation/`:
- Make `examples/basic.js` and Listing 1 in `paper2_brainimation.tex` identical (preserving 11 executable LOC), aligning the mapping of `eegData.alpha` and `eegData.attention` to `size` and `hue`.
- Add whole-epoch peak-to-peak blink rejection (>100 uV) to `/Users/fulkanjou/Brainimation/examples/epochs.js` (preserving 85 executable LOC) and update Listing 3 in `paper2_brainimation.tex` and `manuscript.md` so that rejection is evaluated across the whole epoch before incrementing `trialCount` / `epochData` (preventing per-channel `trialCount` desynchronization when frontal `AF7`/`AF8` blink while `TP9`/`TP10` remain <100 uV).
- In `index.html` (`updateShortChannelRegression`), subtract the 96-sample (1.5 s) rolling mean only inside covariance/variance estimation of beta and use a slow I0 baseline time constant for `cleanHbO2`/`cleanHHb` so slow 4-14 s cortical HRFs are preserved as in `generate_figures.py`.
- In `index.html` (`updateEEGImuMotionFilter`), support both numeric (`0..3`) and channel-name (`TP9, AF7, AF8, TP10`) keys on `eegData.motionFilterWeights` (or use `chNames[ch]` in Listing 5) and align NLMS constants (mu, leakage, reference scaling) across `index.html`, `generate_figures.py`, and Listing 5.
- In Section 2.2 (`paper2_brainimation.tex`), clarify that live hardware uses the 1-second sliding Hanning FFT (`MuseEEGManager.calculateFrequencyBands`) while `EEGSimulator` drives band envelopes from the Attention/Meditation sliders alongside 256 Hz raw EEG synthesis.

### R2. Update Feature Regexes, Deduplication, & Table 2 / Section 3 Macros
Update code analysis regexes, student submission deduplication, and manuscript statistics macros:
- Expand feature regexes in `generate_figures.py` (both `analyze_builtin_examples()` and `make_fig4_student_submissions()`) to capture optional chaining (`eegData?.alpha`, `eegData?.beta`, `eegData?.theta`, `eegData?.gamma`, `eegData?.delta`, `eegData?.attention`, `eegData?.meditation`) and aliased variables (`e.alpha`, `src.alpha`), and use an explicit code regex for `erp_oddball` rather than tautologically setting `"erp_oddball": is_erp_cohort`.
- Check student submission deduplication/filtering in `generate_figures.py` and explain clearly in Section 5 why N = 69 submissions across N_students = 30 learners include iterative/assignment versions alongside Midterm Part 1 and Part 2, motivating the per-student clustered analysis. Report the specific Wilcoxon signed-rank comparison of Cohort 2 ERP submissions against the 85-LOC `epochs.js` template (100% exceed 85 LOC, p = 1.86e-9) and add a 1-clause definition of executable LOC (non-empty, non-comment lines).
- Wire all 32 hardcoded numbers in Section 3.1, Section 3.2, Table 1, and Table 2 into `stats_macros.tex`, and add verification checks for Table 2 subgroup quantiles in `verify_manuscript_analyses.py`. Ensure `stats_macros.tex` and `manuscript.md` reflect the current 38.0 KB size of `muse-browser.js`.

### R3. Clarify Neurophysiological Nuances
Refine neurophysiological descriptions across manuscript prose and citations:
- Explicitly distinguish `EEGSimulator`'s canonical textbook N170 (-6.5 uV) / P300 (+9.5 uV) polarity in Figure 3C from the physical Fpz-referenced polarity inversion in Section 4.2 and Figure 3C caption.
- Change 'three raw optical wavelengths (Ambient, Red 660 nm, and Infrared 850 nm)' in Section 3.2 to 'three raw optical channels (ambient photodetector baseline, Red 660 nm, and Infrared 850 nm, plus Near-Infrared 730 nm on Muse S Athena)'.
- In Section 4.3, briefly note isosbestic straddling (~800 nm), continuous-wave MBLL assumptions, and reflectance photon penetration depth (~d/3 to d/2).
- In Figure 1C Row 13 (`generate_figures.py`), change 'R-peak locked HEP ERP' to 'PPG-peak locked HEP', and note pulse transit time (PTT ~ 150-250 ms) jitter (~10-25 ms) in Section 3.2. Standardize hyphens to en-dashes in `references2.bib`.

### R4. Enforce Figure Design and Academic Writing Standards
Apply styling, typography, and compilation standards across figures and manuscript:
- Expand vertical axis headroom in Figure 3C (`ylim(-42, 36)`) and Figure 5A (`ylim(-5.2, 6.5)`) so no trace clips or touches a legend box; fix Figure 1A Box 3 ('5-Tab Reference Drawer (+ AI Tab)'), Figure 2C caption (remove 'and dots show individual sketches'), and Category 18 median rounding (`43` consistently across Figure 1C, Figure 2C, and prose).
- Remove mid-sentence `\textbf{...}` clutter in body paragraphs and Table 1 body cells; use `\paragraph{...}` or `\emph{...}` for the six tracks in Section 3.2; unify BrainImation typography; convert the 3 passive sentences to active first-person plural voice.
- Wrap all code listings in `\noindent\begin{minipage}{\textwidth}...\end{minipage}` blocks so no listing splits across page breaks or gets cut by a figure float; place Table 2 cleanly inside Section 5 below its first paragraph; align Figure 4 and Figure 5 ordering/numbering between `paper2_brainimation.tex` and `manuscript.md`.
- Recompile the PDF (`pdflatex` + `bibtex`), regenerate `pdf_pages/*.png`, update `PeerReview_Report.md` and `Response_to_Reviewers.md`, and verify everything with an independent verification check.

## Verification Resources
- Primary verification script: `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/verify_manuscript_analyses.py`
- Figure generation script: `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- Audit ledger: `/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md`
- LaTeX PDF build: `pdflatex` and `bibtex` in `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation`

## Acceptance Criteria

### Code Synchronization
- [ ] `examples/basic.js` and Listing 1 in `paper2_brainimation.tex` are identical in code logic and preserve 11 executable LOC.
- [ ] `examples/epochs.js` contains whole-epoch >100 uV peak-to-peak blink rejection while preserving 85 executable LOC.
- [ ] Listing 3 in `paper2_brainimation.tex` and `manuscript.md` rejects blinks across the whole epoch before incrementing `trialCount` / `epochData`.
- [ ] `index.html` `updateShortChannelRegression` subtracts the 96-sample rolling mean only inside covariance/variance estimation.
- [ ] `index.html` `updateEEGImuMotionFilter` supports both numeric and channel-name keys for `motionFilterWeights`, matching Listing 5 and `generate_figures.py`.

### Macro & Analysis Verification
- [ ] Feature regexes in `generate_figures.py` capture optional chaining (`eegData?.alpha`, etc.) and aliased variables (`e.alpha`, `src.alpha`).
- [ ] All 32 identified numbers across Section 3.1, Section 3.2, Table 1, and Table 2 are driven by `stats_macros.tex`.
- [ ] `verify_manuscript_analyses.py` runs and passes all verification checks, including Table 2 subgroup quantiles.
- [ ] Wilcoxon signed-rank comparison and 1-clause LOC definition are present in Section 5.

### Neurophysiological Clarifications
- [ ] Figure 3C caption and Section 4.2 explicitly distinguish textbook polarity from physical Fpz-referenced polarity inversion.
- [ ] Optical channels description in Section 3.2 mentions ambient photodetector baseline, Red 660 nm, Infrared 850 nm, and NIR 730 nm on Muse S Athena.
- [ ] Section 4.3 includes notes on isosbestic straddling, continuous-wave MBLL assumptions, and photon penetration depth.
- [ ] PPG-peak locked HEP is used in Figure 1C and PTT jitter is noted in Section 3.2.
- [ ] `references2.bib` standardizes hyphens to en-dashes for compound terms.

### Formatting, Figures, and Compilation
- [ ] Figure 3C (`ylim(-42, 36)`) and Figure 5A (`ylim(-5.2, 6.5)`) y-axis limits avoid clipping and legend collision.
- [ ] No code listing splits across page breaks.
- [ ] Body paragraphs and Table 1 body cells are free of mid-sentence bold formatting.
- [ ] Manuscript compiles cleanly via `pdflatex` and `bibtex` with zero missing citations or unresolved references.
- [ ] `pdf_pages/*.png` are regenerated from the newly compiled PDF.
- [ ] `reviewer_audit_ledger.md`, `PeerReview_Report.md`, and `Response_to_Reviewers.md` are updated to reflect all completed remediations.
