## 2026-11-09T20:25:00Z
You are Worker 3 (Neurophysiology & Academic Citations Specialist).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/worker_m3
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Read the complete technical specification prepared by Explorer 3 at:
/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_3/handoff.md

Read and enforce Dr. Mathewson's academic writing style at:
/Users/fulkanjou/.gemini/config/skills/mathewson-academic-writing/SKILL.md

PROJECT SCOPE & FILE OWNERSHIP:
You own exclusively:
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex (Section 3.2, Section 4.2, Section 4.3, Figure 3C caption)
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md (Section 3.2, Section 4.2, Section 4.3, Figure 3C caption)
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py (Row 13 label in Figure 1C table)
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib (titles with compound hyphens)

DO NOT modify /Users/fulkanjou/EEGEDUPaper/repos/Brainimation.

YOUR TASKS (Requirement R3):
1. Distinguish Textbook Polarity from Physical Fpz Inversion:
   - In Figure 3C caption and Section 4.2 of `paper2_brainimation.tex` and `manuscript.md`: explicitly reconcile `EEGSimulator`'s canonical textbook N170 (-6.5 uV) / P300 (+9.5 uV) morphology in Figure 3C with the physical forehead Fpz-referenced differential recording ($V_{\text{TP}} - V_{\text{Fpz}}$), explaining that while the simulator provides students with canonical polarity for textbook component identification, real-world headbands invert the dipole polarity unless software inverts the sign or re-references against frontal channels (AF7/AF8).
2. Optical Sensing Terminology:
   - In Section 3.2 of `paper2_brainimation.tex` and `manuscript.md`: replace 'three raw optical wavelengths (Ambient, Red 660 nm, and Infrared 850 nm)' with 'three raw optical channels (ambient photodetector baseline, Red 660 nm, and Infrared 850 nm, plus Near-Infrared 730 nm on Muse S Athena)'.
3. fNIRS Biophysics and MBLL Principles:
   - In Section 4.3 of `paper2_brainimation.tex` and `manuscript.md`: add concise, rigorous neurophysiological notes explaining:
     a) Red 660 nm and Infrared 850 nm straddle the hemoglobin isosbestic point (~800 nm), where HbO2 and HHb extinction coefficients cross.
     b) The continuous-wave Modified Beer-Lambert Law (CW-MBLL) assumes constant differential pathlength factors (DPF) over time and homogeneous tissue scattering.
     c) The banana-shaped reflectance photon penetration depth scales as approximately d/3 to d/2 of optode separation d (yielding ~2.7-4.0 mm for the 8 mm short skin channel and ~6.7-10.0 mm for the 20 mm cortical channel).
4. PPG-Peak Locked HEP & Pulse Transit Time Jitter:
   - In Figure 1C Row 13 of `generate_figures.py` (and Section 3.2 prose): change 'R-peak locked HEP ERP' to 'PPG-peak locked HEP'.
   - In Section 3.2 of `paper2_brainimation.tex` and `manuscript.md`: note that because triggering relies on the forehead PPG systolic wave rather than an ECG chest R-wave, beat-to-beat pulse transit time (PTT ~ 150-250 ms) jitter (~10-25 ms) introduces physiological temporal smoothing to the recovered optical HEP relative to an ECG-gated potential.
5. Standardize BibTeX En-Dashes:
   - In `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib`, change single hyphens in coordinate compound terms in titles to en-dashes (`{Brain--Computer}`) on lines 63, 82, and 84.

VERIFICATION REQUIREMENTS:
- Run `pdflatex -interaction=batchmode paper2_brainimation.tex` and `bibtex paper2_brainimation` followed by `pdflatex` to verify 0 errors, 0 undefined citations, and 0 missing references.
- Verify that `generate_figures.py` runs cleanly.
- Document all verification commands and outcomes in your handoff report.

Write your final report to:
/Users/fulkanjou/Brainimation/.agents/teamwork/worker_m3/handoff.md
Send a completion message to your parent orchestrator (19b884d0-bc13-434a-b900-b62ef20b94f8).
