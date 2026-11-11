## 2026-11-09T20:32:28Z
You are Worker 4 (Figure Design, Academic Typography & LaTeX Compilation Specialist).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/worker_m4
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Read the complete technical specification prepared by Explorer 3 at:
/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_3/handoff.md

Read and enforce Dr. Mathewson's academic writing style and clean scientific figure design at:
/Users/fulkanjou/.gemini/config/skills/mathewson-academic-writing/SKILL.md
/Users/fulkanjou/.gemini/config/skills/clean-scientific-figures/SKILL.md

PROJECT SCOPE & FILE OWNERSHIP:
You own exclusively:
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md
- /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/pdf_pages/

DO NOT modify /Users/fulkanjou/EEGEDUPaper/repos/Brainimation.

YOUR TASKS (Requirement R4):
1. Figure Axis Headroom & Labels in `generate_figures.py`:
   - Figure 3C: set `ylim(-42, 36)` so no trace clips or touches the legend box.
   - Figure 5A: set `ylim(-5.2, 6.5)` so no trace clips or touches the legend box.
   - Figure 1A Box 3 label: update to '5-Tab Reference Drawer (+ AI Tab)'.
   - Figure 2C caption in `paper2_brainimation.tex` and `manuscript.md`: remove 'and dots show individual sketches'.
   - Category 18 median rounding: ensure `43` is consistently output across Figure 1C, Figure 2C, and manuscript text.
2. Academic Typography & Mathewson Writing Standards:
   - Strip all mid-sentence `\textbf{...}` clutter in body paragraphs and Table 1 body cells in `paper2_brainimation.tex` (refer to Explorer 3's exact list of 42 occurrences).
   - Format the six learning tracks in Section 3.2 with clean `\emph{...}` narrative emphasis rather than bold headers.
   - Unify typography to roman `BrainImation` (eliminate inconsistent `\textsc{BrainImation}`).
   - Convert passive voice sentences to active first-person plural voice (e.g. lines 66, 345, 348, 350 identified in Explorer 3's report).
   - Wrap all code listings (Listings 1–6) in `\noindent\begin{minipage}{\textwidth}...\end{minipage}\vspace{4pt}` blocks so no listing splits across page breaks or gets cut by figure floats.
   - Verify Table 2 placement cleanly below Section 5 paragraph 1.
   - Align Figure 4 (Multimodal Athena PPG/IMU) and Figure 5 (PSYCH 403 Student Submissions) ordering/numbering between `paper2_brainimation.tex` and `manuscript.md`.
3. Execution & Regeneration:
   - Run `python3 generate_figures.py` to regenerate all updated figures.
   - Recompile the PDF cleanly: `pdflatex -interaction=batchmode paper2_brainimation.tex`, `bibtex paper2_brainimation`, and two passes of `pdflatex` to ensure zero missing citations or unresolved cross-references.
   - Regenerate all page images in `pdf_pages/*.png` from the newly compiled `paper2_brainimation.pdf` (e.g. using `pymupdf`/`fitz` or `pdf2image` in Python).

VERIFICATION REQUIREMENTS:
- Verify that `generate_figures.py` runs with exit code 0.
- Verify that `verify_manuscript_analyses.py` passes 100% of checks.
- Verify that `paper2_brainimation.pdf` compiles cleanly with zero errors.
- Verify that all `pdf_pages/*.png` are generated and match the new PDF pages.
- Document all verification commands and outcomes in your handoff report.

Write your final report to:
/Users/fulkanjou/Brainimation/.agents/teamwork/worker_m4/handoff.md
Send a completion message to your parent orchestrator (19b884d0-bc13-434a-b900-b62ef20b94f8).

## 2026-11-09T20:42:46Z
**Context**: Milestone 4 Implementation (Figure Design, Academic Typography & LaTeX Compilation)
**Content**: Checking on your progress. 10 minutes have elapsed since dispatch.
**Action**: Please report your current progress across the figure updates, typography cleanup, minipage wrapping, and PDF compilation.
