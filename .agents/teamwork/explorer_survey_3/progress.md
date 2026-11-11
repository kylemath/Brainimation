# Progress Tracking — Explorer 3 (Neurophysiology & Writing Explorer)

Last visited: 2026-11-09T19:28:30Z
Status: Completed

## Tasks Checklist
- [x] Read ORIGINAL_REQUEST.md and reviewer_audit_ledger.md
- [x] Read relevant skills: mathewson-academic-writing and clean-scientific-figures
- [x] Audit Requirement R3:
  - [x] Fig 3C & Sec 4.2: EEGSimulator canonical polarity vs physical Fpz reference (identified lines 201, 226, 490-520)
  - [x] Sec 3.2: Optical wavelengths replacement ('three raw optical channels...') (identified line 188)
  - [x] Sec 4.3: fNIRS text on isosbestic straddling (~800 nm), continuous-wave MBLL, penetration depth (~d/3 to d/2) (identified lines 260-281)
  - [x] Fig 1C: Row 13 'R-peak locked HEP ERP' -> 'PPG-peak locked HEP' (identified line 222 in generate_figures.py)
  - [x] Sec 3.2: PTT (~150-250 ms) jitter (~10-25 ms) (identified line 192)
  - [x] references2.bib: Hyphens vs en-dashes (`--`) in coordinate compound terms (identified lines 63, 82, 84)
- [x] Audit Requirement R4:
  - [x] Fig 3C: y-limits `ylim(-42, 36)` (identified line 515 in generate_figures.py)
  - [x] Fig 5A: y-limits `ylim(-5.2, 6.5)` (identified line 725 in generate_figures.py)
  - [x] Fig 1A Box 3: '5-Tab Reference Drawer (+ AI Tab)' (identified line 166 in generate_figures.py)
  - [x] Fig 2C caption: remove 'and dots show individual sketches' (identified line 172 in paper2_brainimation.tex)
  - [x] Category 18 median rounding: `43` consistency check across Fig 1C, Fig 2C, prose (identified line 384 in generate_figures.py: banker's rounding of 42.5 to 42)
  - [x] Mid-sentence `\textbf{...}` clutter in body paragraphs & Table 1 body cells (audited all 42 occurrences)
  - [x] Six tracks in Sec 3.2: `\paragraph{...}` or `\emph{...}` formatting (designed clean `\emph{...}` narrative integration)
  - [x] BrainImation typography consistency (identified inconsistent `\textsc{BrainImation}` vs `BrainImation`)
  - [x] Passive voice conversion to active first-person plural (Mathewson style) (identified lines 66, 345, 348, 350)
  - [x] Code listings 1-6: `\noindent\begin{minipage}{\textwidth}...\end{minipage}` wrappers (audited lines 96, 142, 210, 228, 263, 285)
  - [x] Table 2 placement in Sec 5 below first paragraph (identified line 315 vs 341)
  - [x] Fig 4 & Fig 5 numbering/ordering alignment between `generate_figures.py`, `paper2_brainimation.tex`, and `manuscript.md` (identified figure order mismatch)
- [x] Audit Peer Review & Response synchronization
- [x] Write handoff.md
- [x] Update BRIEFING.md
- [x] Send completion message to parent
