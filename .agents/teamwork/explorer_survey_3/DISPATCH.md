## 2026-11-09T19:19:25Z
You are Explorer 3 (Neurophysiology & Writing Explorer).
Your working directory is: /Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_3
Your parent orchestrator is: 19b884d0-bc13-434a-b900-b62ef20b94f8

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/fulkanjou/Brainimation/.agents/teamwork/ORIGINAL_REQUEST.md

Also consult the audit ledger at:
/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md

Relevant skills to examine and enforce:
- /Users/fulkanjou/.gemini/config/skills/mathewson-academic-writing/SKILL.md
- /Users/fulkanjou/.gemini/config/skills/clean-scientific-figures/SKILL.md

YOUR MISSION:
Investigate and produce an exhaustive technical specification for Requirement R3 (Neurophysiological Nuances) and Requirement R4 (Figure Design and Academic Writing Standards):
1. In `paper2_brainimation.tex` and `generate_figures.py`:
   - Figure 3C and Section 4.2: Detail the current wording and how to explicitly distinguish `EEGSimulator` canonical textbook N170 (-6.5 uV) / P300 (+9.5 uV) polarity in Fig 3C from physical Fpz-referenced polarity inversion.
   - Section 3.2: Inspect current wording for optical wavelengths and specify replacement: 'three raw optical channels (ambient photodetector baseline, Red 660 nm, and Infrared 850 nm, plus Near-Infrared 730 nm on Muse S Athena)'.
   - Section 4.3: Detail current fNIRS text and specify concise notes on isosbestic straddling (~800 nm), continuous-wave MBLL assumptions, and reflectance photon penetration depth (~d/3 to d/2).
   - Figure 1C in `generate_figures.py`: Check Row 13 ('R-peak locked HEP ERP' -> 'PPG-peak locked HEP'), and check Section 3.2 for pulse transit time (PTT ~ 150-250 ms) jitter (~10-25 ms).
   - References in `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib`: Audit for hyphens that should be en-dashes (`--`) in page ranges, compound terms, etc.
2. Figure styling & layout in `generate_figures.py`:
   - Figure 3C: Check current y-limits and specify `ylim(-42, 36)` so no trace clips or touches legend box.
   - Figure 5A: Check current y-limits and specify `ylim(-5.2, 6.5)` so no trace clips or touches legend box.
   - Figure 1A Box 3: Check label and specify '5-Tab Reference Drawer (+ AI Tab)'.
   - Figure 2C caption: Locate 'and dots show individual sketches' and specify its removal.
   - Category 18 median rounding: Verify consistency of `43` across Figure 1C, Figure 2C, and manuscript prose.
3. LaTeX typography, structure, and writing standards in `paper2_brainimation.tex` and `manuscript.md`:
   - Identify all mid-sentence `\textbf{...}` clutter in body paragraphs and Table 1 body cells.
   - Inspect the six tracks in Section 3.2 and specify formatting with `\paragraph{...}` or `\emph{...}`.
   - Audit BrainImation typography for consistency (e.g. BrainImation vs Brainimation).
   - Locate passive sentences and specify conversion to active first-person plural voice (per Mathewson style).
   - Locate all code listings (Listings 1-5) and design `\noindent\begin{minipage}{\textwidth}...\end{minipage}` wrappers to prevent page splits and float collisions.
   - Check placement of Table 2 in Section 5 below its first paragraph.
   - Check Figure 4 and Figure 5 numbering/ordering alignment between `paper2_brainimation.tex` and `manuscript.md`.
4. Peer review report and audit ledger synchronization:
   - Check `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/PeerReview_Report.md` and `Response_to_Reviewers.md` alongside the reviewer audit ledger.

CONSTRAINTS:
- You are read-only. Do NOT modify any source code or paper files.
- Remember: NEVER modify `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation`.
- Write your detailed findings and actionable recommendations to:
  `/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_3/handoff.md`
- Update your progress in:
  `/Users/fulkanjou/Brainimation/.agents/teamwork/explorer_survey_3/progress.md`
- When complete, send a message to your parent (19b884d0-bc13-434a-b900-b62ef20b94f8) summarizing your findings and referencing your handoff report.
