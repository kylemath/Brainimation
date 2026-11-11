# Technical Specification & Handoff Report: Requirement R3 (Neurophysiological Nuances) & Requirement R4 (Figure Design and Academic Writing Standards)

**Author:** Explorer 3 (Neurophysiology & Writing Explorer)  
**Target Recipient:** Orchestrator (19b884d0-bc13-434a-b900-b62ef20b94f8)  
**Date:** 2026-11-09T19:27:00Z  
**Target Codebase & Manuscript:**
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/PeerReview_Report.md`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/Response_to_Reviewers.md`
- `/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md`

---

## 1. Observation

### 1.1 Requirement R3: Neurophysiological Nuances

#### Observation 1.1.1: Polarity Discrepancy between Section 4.2 and Figure 3C
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Lines 201, 226)
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Lines 490–520)
- **Verbatim Text in `.tex` (Line 226):**
  > "Because the Muse headband places its reference (`REF`) and driven right leg (`DRL`) electrodes on the center of the forehead (`Fpz`), the posterior temporo-parietal channels behind the ears (`TP9` and `TP10`, near the mastoids) measure voltage relative to `Fpz`. This forehead-referenced montage reverses the polarity of a classic mastoid-referenced vertex or parietal dipole, giving instructors a concrete opportunity to teach differential amplifier geometry and why students inspect `TP9` and `TP10` for visual N170 responses and compare posterior (`TP9`/`TP10`) and anterior (`AF7`/`AF8`) channels during oddball P300 tasks."
- **Verbatim Text in `.tex` (Line 201, Fig 3C Caption):**
  > "(C) Online 256 Hz ERP trial averaging in `epochs.js` (-200 to +800 ms, positive-up voltage convention in $\mu\text{V}$ on simulated channel `TP9` relative to forehead `Fpz`... to reveal simulated N170 ($-6.5\ \mu\text{V}$ at $+170\text{ ms}$) and P300 ($+9.5\ \mu\text{V}$ at $+340\text{ ms}$) components."
- **Verbatim Code in `generate_figures.py` (Lines 491–494):**
  ```python
  true_erp = (
      -6.5 * np.exp(-((t_erp - 170.0) ** 2) / (2 * 26.0 ** 2))
      + 9.5 * np.exp(-((t_erp - 340.0) ** 2) / (2 * 58.0 ** 2))
  )
  ```
- **Discrepancy:** The text in Line 226 claims that recording relative to forehead `Fpz` reverses the polarity of the dipole, yet Figure 3C plots an unreversed canonical negative N170 ($-6.5\ \mu\text{V}$) and positive P300 ($+9.5\ \mu\text{V}$) on simulated `TP9`. There is no explanation reconciling why the simulated trace is canonical while physical recordings require sign-inversion or re-referencing against anterior electrodes (`AF7`/`AF8`).

#### Observation 1.1.2: Incorrect Terminology for Optical Sensing Channels
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Line 188)
- **Verbatim Text in `.tex` (Line 188):**
  > "...starting from a basic pulse ring and the three raw optical wavelengths (Ambient, Red $660\text{ nm}$, and Infrared $850\text{ nm}$)..."
- **Discrepancy:** "Ambient" is not an optical wavelength; it is the dark-current photodetector baseline reading used for ambient light subtraction. Furthermore, this description omits the Near-Infrared ($730\text{ nm}$) LED present on the Muse S Athena headband.

#### Observation 1.1.3: Missing Physical and Mathematical Foundations in fNIRS Text
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Lines 260–281, Section 4.3)
- **Verbatim Text in `.tex` (Lines 261):**
  > "The optical studio sketches introduce students to how consumer headbands measure forehead pulse and blood oxygenation using Red ($660\text{ nm}$) and Infrared ($850\text{ nm}$) light \citep{delpy1988estimation,scholkmann2014review}, and how slow hemodynamic responses (peaking $4\text{--}6\text{ s}$ after cognitive task onset) differ from millisecond EEG deflections. A key concept in functional near-infrared spectroscopy (fNIRS) is that light traveling to the outer $20\text{ mm}$ detector passes through both the skin of the forehead and the underlying brain tissue..."
- **Discrepancy:** Section 4.3 lacks three critical physical and spectroscopic principles required for scientific rigor:
  1. Why $660\text{ nm}$ and $850\text{ nm}$ are selected: they straddle the hemoglobin isosbestic point ($\sim 800\text{ nm}$), where $\text{HbO}_2$ and $\text{HHb}$ molar extinction coefficients cross.
  2. The assumptions of the continuous-wave Modified Beer--Lambert Law (CW-MBLL): constant differential pathlength factors ($\text{DPF}$) over time and homogeneous tissue scattering.
  3. Reflectance banana-shaped photon penetration depth: effective maximum depth is roughly $\sim d/3\text{ to }d/2$ of optode separation $d$ (yielding $\sim 2.7\text{--}4.0\text{ mm}$ for the $8\text{ mm}$ short channel and $\sim 6.7\text{--}10.0\text{ mm}$ for the $20\text{ mm}$ long channel).

#### Observation 1.1.4: Inaccurate Heartbeat Trigger Terminology and Missing PTT Jitter
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Line 222)
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Line 192)
- **Verbatim Code in `generate_figures.py` (Line 222):**
  ```python
  ["13. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, R-peak locked HEP ERP"],
  ```
- **Verbatim Text in `.tex` (Line 192):**
  > "...In particular, the Heartbeat-Evoked Potential (HEP) sketch locks 256~Hz EEG epochs to the internal systolic peak of the forehead optical pulse wave rather than an external visual flash, helping students understand endogenous event-locked averaging, brain--heart interoception, and the $\sim 150\text{--}250\text{ ms}$ pulse-wave transit delay between the electrical R-wave in the chest and optical pulse arrival at the forehead."
- **Discrepancy:** Muse headbands have no ECG leads; the trigger is locked to the forehead photoplethysmogram (PPG) systolic peak, not the ECG R-peak. While line 192 mentions the $150\text{--}250\text{ ms}$ pulse transit time (PTT) delay, it omits the $\sim 10\text{--}25\text{ ms}$ beat-to-beat PTT jitter that physiologically broadens and low-pass filters the recovered optical HEP waveform relative to an ECG-gated HEP.

#### Observation 1.1.5: BibTeX Hyphens in Coordinate Compounds
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib` (Lines 63, 82, 84)
- **Verbatim Text in `references2.bib`:**
  - Line 63: `title={Flaws in current human training protocols for spontaneous Brain-Computer Interfaces: lessons learned from instructional design},`
  - Line 82: `title={Brain-computer music interfacing: Interdisciplinary milestone in music and neuroscience},`
  - Line 84: `booktitle={Guide to Brain-Computer Music Interfacing},`
- **Discrepancy:** In contrast to line 147 (`time--frequency signal processing, and brain--computer interfaces`), lines 63, 82, and 84 use single hyphens in "Brain-Computer" where coordinate compounds require en-dashes (`--`).

---

### 1.2 Requirement R4: Figure Design & Layout Standards

#### Observation 1.2.1: Figure 3C and 5A Axis Headroom and Legend Clipping
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Lines 515, 725)
- **Verbatim Code in Line 515:**
  ```python
  ax_c.set_ylim(-33, 30)
  ax_c.legend(loc="lower right", frameon=True, fontsize=7.5)
  ```
- **Verbatim Code in Line 725:**
  ```python
  ax_a.set_ylim(-4.6, 5.75)
  ax_a.legend(loc="upper right", ncol=2, frameon=True, fontsize=6.9)
  ```
- **Discrepancy:** In Figure 3C, the raw $K=1$ trace dips below $-33\ \mu\text{V}$ and passes directly behind the lower-right legend box. In Figure 5A, the raw long-channel $\Delta[\text{HbO}_2]$ peak reaches $+5.5\ \mu\text{M}$ at $t \approx 12.7\text{ s}$ and collides with the upper-right legend box, while the shifted short-channel trace clips at the bottom below $-4.6\ \mu\text{M}$.

#### Observation 1.2.2: Figure 1A Box 3 Label Inconsistency
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Lines 166–167)
- **Verbatim Code:**
  ```python
  "• 6-Tab Reference Drawer:\n"
  "  P5, Input, Sound, EEG, IMU/PPG\n"
  ```
- **Discrepancy:** Box 3 states "6-Tab Reference Drawer" while listing only 5 reference tabs (`P5, Input, Sound, EEG, IMU/PPG`), conflicting with Section 3.1 line 179 which defines the 5 topic tabs plus an optional AI Helper tab.

#### Observation 1.2.3: Spurious Scatter Dot Mention in Figure 2C Caption
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Line 172)
- **Verbatim Text:**
  > "(C) Lines of code across the \NCatalogueCategories\ categories in the Visual Catalogue ($N = \NCatalogueSketches$ sketches; bars show category median, lines span min--max range, and dots show individual sketches)."
- **Discrepancy:** In `generate_figures.py` lines 382–384, only `barh`, min–max horizontal line segments, and text labels are plotted. No individual scatter dots are drawn.

#### Observation 1.2.4: Banker's Rounding Discrepancy for Category 18
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Line 384)
- **Verbatim Code:**
  ```python
  ax_c.text(max_v + 10.0, y, f"{int(round(med_v))} ({min_v}–{max_v})", va="center", ha="left", fontsize=6.5, fontweight="bold")
  ```
- **Discrepancy:** Category 18 (`2022 NeuroArt Class Gallery`, $N=26$) has an exact median of $42.5\text{ LOC}$. In Python 3, `round(42.5)` executes banker's rounding to the nearest even number, yielding `42`. Consequently, Figure 2C displays `42 (12–189)` while Figure 1C (line 227), manuscript prose (line 196), and `stats_macros.tex` report `43`.

---

### 1.3 Requirement R4: LaTeX Typography, Structure, and Academic Writing

#### Observation 1.3.1: Mid-Sentence Boldface Clutter in Body Paragraphs and Table 1
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Violations Identified:**
  1. *Inline Cross-References:* Lines 94, 118, 167, 179, 184, 196, 208, 223, 226, 251, 280, 283, 304, 341, 343, 345, 350 all wrap figure/table references in `\textbf{...}` (e.g., `(\textbf{Figure~\ref{fig:ide}A})`, `\textbf{Table~\ref{tab:gatt_comparison}}`).
  2. *Body Text Phrases:* Line 179 (`\textbf{\NRefAPIs\ functions and variables across \NRefTabs\ topic tabs}`), Line 184 (`searchable \textbf{Visual Catalogue Window (\texttt{Catalogue})} containing \textbf{\NCatalogueSketches\ runnable sketches across \NCatalogueCategories\ categories}`).
  3. *Table 1 Body Cells (Lines 130–135):* Every body cell in the BrainImation column is wrapped in `\textbf{...}` (`\textbf{$\MuseBrowserKB\text{ KB}$}`, `\textbf{Two-Step Wake-Up + Athena Decoder}`, etc.).

#### Observation 1.3.2: Formatting of the Six Tracks in Section 3.2
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Lines 186, 188, 190, 192, 194, 196)
- **Current Formatting:** Inline bold phrases embedded inside paragraphs (`the first track consists of the \textbf{Core ... Scaffolds}`, `the second track is the \textbf{PPG and Optical (fNIRS) Studio}`, etc.).

#### Observation 1.3.3: Inconsistent Small-Caps `\textsc{BrainImation}` vs. Roman `BrainImation`
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Occurrences:** Small caps is used 4 times (Lines 66, 94, 348, 354: `\textsc{BrainImation}`), whereas standard roman `BrainImation` is used 20 times (Title line 49, lines 68, 69, 88, 113, 118, 122, 128, 179, 184, 309, 317, 341, 348, 350, 354). Small caps applied to CamelCase renders unevenly.

#### Observation 1.3.4: Passive Voice Constructions
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Violations Identified:**
  1. *Line 66:* "Second, all live and simulated signals are placed into a single shared JavaScript object..."
  2. *Line 345:* "Explicit signal conditioning... was implemented in $\StuPctCond\%$... of all submissions..."
  3. *Line 345:* "These $N = \NStudentSketches$ graded examination files are preserved alongside 26 additional course and laboratory sketches..."
  4. *Line 348:* "\textsc{BrainImation} is designed as a practical, easy-to-adopt browser environment..."
  5. *Line 350:* "Several practical limitations should be kept in mind by instructors and researchers."

#### Observation 1.3.5: Listing Splitting and Float Collisions
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Current State:** Listing 1 (lines 96–110) has a minipage wrapper, but Listings 2–6 (lines 142, 210, 228, 263, 285) are bare `\begin{lstlisting}` blocks. In the compiled PDF, Listings 2, 4, and 5 split across page breaks, and Listing 5 is intersected by a figure float.

#### Observation 1.3.6: Misplacement of Table 2 in Section 5
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Lines 313–341)
- **Current State:** Table 2 (`\begin{table}[t!]`) is placed immediately below `\section{Classroom Evaluation...}` at line 315, prior to the introductory text at line 341. In LaTeX float evaluation, this causes Table 2 to float backwards into Section 4.4 above the Section 5 section header.

#### Observation 1.3.7: Figure 4 and Figure 5 Numbering and Ordering Inversion
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py` (Lines 661, 870)
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex` (Lines 255, 308)
- **File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md` (Lines 197, 201, 222, 228, 230, 232, 240)
- **Discrepancy:**
  - In `generate_figures.py`, `make_fig5_multimodal_athena_ppg_imu` creates `fig5_multimodal_...` and `make_fig4_student_submissions` creates `fig4_psych403_...`.
  - In `paper2_brainimation.tex`, the multimodal figure is inserted in Section 4.3 (making it Figure 4 in LaTeX numbering) using filename `fig5_...`, while the student submissions figure is inserted in Section 5 (making it Figure 5 in LaTeX numbering) using filename `fig4_...`.
  - In `manuscript.md`, Section 4 cites "Figure 5" and Section 5 cites "Figure 4", which inverts the chronological appearance of figures in prose.

---

## 2. Logic Chain

### 2.1 Neurophysiology Rationale
1. **Reference Geometry and Polarities (Observation 1.1.1):**
   - An electrophysiological channel measures the potential difference $V_{\text{active}} - V_{\text{ref}}$. For posterior channels relative to forehead Fpz ($V_{\text{TP9/TP10}} - V_{\text{Fpz}}$), a positive parietal dipole creates negative voltage relative to the active anterior site unless re-referenced (Krigolson et al., 2017).
   - In `EEGSimulator`, however, beginners must first understand standard waveform morphology (negative N170, positive P300) and $\sqrt{K}$ averaging before navigating montage transformations.
   - *Inference:* Explicitly decoupling `EEGSimulator`'s canonical morphology in Figure 3C from physical Fpz-referenced differential recording in Section 4.2 resolves the contradiction while providing an authentic pedagogical rationale.

2. **Optical Physics and Hemodynamics (Observations 1.1.2 & 1.1.3):**
   - Ambient is a dark-current subtraction channel, not a wavelength. Adding the $730\text{ nm}$ Near-Infrared channel accurately describes the Muse S Athena optode array.
   - Dual-wavelength continuous-wave fNIRS relies on differential absorption across the $\sim 800\text{ nm}$ isosbestic point. Below $800\text{ nm}$ ($660\text{ nm}$ and $730\text{ nm}$), $\text{HHb}$ extinction is higher; above $800\text{ nm}$ ($850\text{ nm}$), $\text{HbO}_2$ extinction dominates.
   - Diffusion theory dictates that backscattered reflectance photons sample tissue in a banana-shaped path with max penetration depth $\sim d/3\text{ to }d/2$. Thus, an $8\text{ mm}$ channel samples only superficial scalp/skull ($\sim 2.7\text{--}4.0\text{ mm}$), while a $20\text{ mm}$ channel penetrates the cortex ($\sim 6.7\text{--}10.0\text{ mm}$), mathematically justifying short-channel regression.
   - *Inference:* Incorporating isosbestic straddling, CW-MBLL assumptions (constant DPF, homogeneous scattering), and depth scaling directly elevates the paper's scientific rigor.

3. **Cardiovascular Dynamics and HEP (Observation 1.1.4):**
   - Headband optical sensors detect the forehead blood-volume pulse (PPG). Locking EEG to the PPG systolic peak incurs beat-to-beat pulse transit time (PTT) jitter ($\sim 10\text{--}25\text{ ms}$) on top of the $\sim 150\text{--}250\text{ ms}$ baseline delay from chest to head.
   - *Inference:* Changing "R-peak locked" to "PPG-peak locked" in Figure 1C and noting PTT jitter in Section 3.2 correctly bridges cardiac and electrophysiological time scales.

4. **BibTeX Typography (Observation 1.1.5):**
   - Coordinate noun compounds ("Brain--Computer", "time--frequency") take en-dashes (`--`) in standard academic typography.
   - *Inference:* Standardizing all instances in `references2.bib` enforces stylistic consistency.

### 2.2 Figure Design & Writing Standards Rationale
1. **Axis Headroom (`clean-scientific-figures/SKILL.md` Rule 2; Observation 1.2.1):**
   - Plotted data lines must never touch or pass beneath legend boxes. Expanding Figure 3C to `ylim(-42, 36)` and Figure 5A to `ylim(-5.2, 6.5)` guarantees clean margins around all traces.
2. **Data-Prose Alignment (Observations 1.2.2, 1.2.3, 1.2.4):**
   - Figure 1A Box 3 must reflect the 5 reference tabs + optional AI Helper tab.
   - Removing the phantom "dots" mention from Figure 2C caption eliminates an ungrounded claim.
   - Standard rounding half up (`int(np.floor(med_v + 0.5))`) on Category 18 resolves banker's rounding to `42`, unifying `43` across Figure 1C, Figure 2C, and prose.
3. **Typographic Restraint & Active Voice (`mathewson-academic-writing/SKILL.md`; Observations 1.3.1–1.3.4):**
   - Mid-sentence boldface clutter degrades readability. Replacing inline bold cross-references with plain text and using `\emph{...}` for learning tracks establishes clean academic hierarchy.
   - Unifying on roman `BrainImation` removes distracting small-caps variations.
   - Converting passive sentences to active first-person plural voice ("We unify...", "Students implemented...", "We preserve...", "We designed...", "Instructors should consider...") provides direct narrative momentum.
4. **Layout Hygiene & Sequential Figure Ordering (Observations 1.3.5–1.3.7):**
   - Wrapping listings in `\noindent\begin{minipage}{\textwidth}...\end{minipage}` prevents awkward page splits and float interleaving.
   - Moving Table 2 after the first narrative paragraph of Section 5 ensures stable top-of-page floating within its own section.
   - Renaming and re-ordering Figure 4 (`fig4_multimodal_...`) and Figure 5 (`fig5_psych403_...`) establishes strict 1, 2, 3, 4, 5 sequential numbering across figures, prose, and scripts.

---

## 3. Caveats

1. **Read-Only Investigation:** This report provides exact technical specifications and replacement snippets but does not directly modify any repository or manuscript files.
2. **Coordination with Peer Explorers:**
   - Explorer 1 is auditing the JavaScript implementations (`basic.js`, `epochs.js`, `index.html`) and DSP constants. The listing snippets specified here are verified for typographical layout and must be synchronized with Explorer 1's functional code.
   - Explorer 2 is auditing statistical macros in `stats_macros.tex` and feature regexes. The macro names specified here (`\CatMedPPG`, etc.) align with the 32-macro expansion plan.
3. **Float Restructuring:** Wrapping all code listings in minipages increases their vertical rigidity. When recompiling, page breaks should be visually verified to ensure paragraphs fill the pages without excessive underfull vbox warnings.

---

## 4. Conclusion & Concrete Implementation Specifications

### 4.1 Specification for Requirement R3 (Neurophysiological Nuances)

#### 4.1.1 Figure 3C Caption and Section 4.2 Polarity Clarification
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`

- **Line 201 (Fig 3C Caption) — Target Content:**
  ```latex
  \textbf{(C)} Online 256~Hz ERP trial averaging in \texttt{epochs.js} ($-200\text{ to }+800\text{ ms}$, positive-up voltage convention in $\mu\text{V}$ on simulated channel \texttt{TP9} relative to forehead \texttt{Fpz}, baseline-corrected over $-200\text{ to }0\text{ ms}$; \citealp{picton2000guidelines,keil2014committee}) across $K = 1, 5,$ and $20$ trials, illustrating how averaging reduces background EEG noise to reveal simulated N170 ($-6.5\ \mu\text{V}$ at $+170\text{ ms}$) and P300 ($+9.5\ \mu\text{V}$ at $+340\text{ ms}$) components.
  ```
- **Replacement Content:**
  ```latex
  \textbf{(C)} Online 256~Hz ERP trial averaging in \texttt{epochs.js} ($-200\text{ to }+800\text{ ms}$, positive-up voltage convention in $\mu\text{V}$, baseline-corrected over $-200\text{ to }0\text{ ms}$; \citealp{picton2000guidelines,keil2014committee}) across $K = 1, 5,$ and $20$ trials. Here, \texttt{EEGSimulator} injects canonical textbook polarities ($-6.5\ \mu\text{V}$ N170 at $+170\text{ ms}$, $+9.5\ \mu\text{V}$ P300 at $+340\text{ ms}$) directly onto simulated channel \texttt{TP9} so beginners first recognize standard component morphology; by contrast, physical headband recordings measure $V_{\text{channel}} - V_{\text{Fpz}}$, which inverts vertex/parietal oddball dipoles unless re-referenced against frontal electrodes (\citealp{krigolson2017choosing}).
  ```

- **Line 226 (Section 4.2 Prose) — Target Content:**
  ```latex
  Because the Muse headband places its reference (\texttt{REF}) and driven right leg (\texttt{DRL}) electrodes on the center of the forehead (\texttt{Fpz}), the posterior temporo-parietal channels behind the ears (\texttt{TP9} and \texttt{TP10}, near the mastoids) measure voltage relative to \texttt{Fpz}. This forehead-referenced montage reverses the polarity of a classic mastoid-referenced vertex or parietal dipole, giving instructors a concrete opportunity to teach differential amplifier geometry and why students inspect \texttt{TP9} and \texttt{TP10} for visual N170 responses and compare posterior (\texttt{TP9}/\texttt{TP10}) and anterior (\texttt{AF7}/\texttt{AF8}) channels during oddball P300 tasks.
  ```
- **Replacement Content:**
  ```latex
  Because the Muse headband places its reference (\texttt{REF}) and driven right leg (\texttt{DRL}) electrodes on the center of the forehead (\texttt{Fpz}), physical posterior recordings ($V_{\text{TP9/TP10}} - V_{\text{Fpz}}$) reflect a differential potential against an active anterior site. In physical recordings, this montage reverses the polarity of classic mastoid-referenced vertex or parietal oddball dipoles unless students re-reference posterior channels against anterior electrodes ($V_{\text{TP}} - V_{\text{AF}}$; \citealp{krigolson2017choosing}). In \texttt{EEGSimulator}, however, we intentionally inject canonical textbook polarities ($-6.5\ \mu\text{V}$ N170, $+9.5\ \mu\text{V}$ P300) directly into simulated channel \texttt{TP9} (Figure~\ref{fig:sonification}C). This ensures that beginners first recognize standard component morphology and master $\sqrt{K}$ averaging before navigating differential montage re-referencing.
  ```

#### 4.1.2 Section 3.2 Optical Channels Wording
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`

- **Line 188 — Target Content:**
  ```latex
  starting from a basic pulse ring and the three raw optical wavelengths (Ambient, Red $660\text{ nm}$, and Infrared $850\text{ nm}$), moving to oxygenated and deoxygenated hemoglobin traces
  ```
- **Replacement Content:**
  ```latex
  starting from a basic pulse ring and three raw optical channels (ambient photodetector baseline, Red $660\text{ nm}$, and Infrared $850\text{ nm}$, plus Near-Infrared $730\text{ nm}$ on Muse~S Athena), moving to oxygenated and deoxygenated hemoglobin traces
  ```

#### 4.1.3 Section 4.3 fNIRS Physics (Isosbestic, CW-MBLL, Depth)
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`

- **Line 261 — Target Content:**
  ```latex
  The optical studio sketches introduce students to how consumer headbands measure forehead pulse and blood oxygenation using Red ($660\text{ nm}$) and Infrared ($850\text{ nm}$) light \citep{delpy1988estimation,scholkmann2014review}, and how slow hemodynamic responses (peaking $4\text{--}6\text{ s}$ after cognitive task onset) differ from millisecond EEG deflections. A key concept in functional near-infrared spectroscopy (fNIRS) is that light traveling to the outer $20\text{ mm}$ detector passes through both the skin of the forehead and the underlying brain tissue, so the raw signal is dominated by systemic heartbeats and skin blood-flow waves. Because the Muse~S Athena headband (and the built-in simulator) includes both an inner $8\text{ mm}$ detector (which measures only shallow skin blood flow; \citealp{saager2005direct}) and an outer $20\text{ mm}$ detector (which measures skin plus deeper cortex), students can see how linear regression removes shallow skin noise to isolate the slower brain blood-flow response:
  ```
- **Replacement Content:**
  ```latex
  The optical studio sketches introduce students to how consumer headbands measure forehead pulse and blood oxygenation using Red ($660\text{ nm}$) and Infrared ($850\text{ nm}$) light \citep{delpy1988estimation,scholkmann2014review}, and how slow hemodynamic responses (peaking $4\text{--}6\text{ s}$ after cognitive task onset) differ from millisecond EEG deflections. Dual wavelengths are selected because they straddle the hemoglobin isosbestic point ($\sim 800\text{ nm}$), where oxygenated ($\text{HbO}_2$) and deoxygenated ($\text{HHb}$) hemoglobin exhibit equal molar absorption: below $800\text{ nm}$, $\text{HHb}$ absorption dominates, whereas above $800\text{ nm}$, $\text{HbO}_2$ dominates, providing the differential contrast required by the continuous-wave Modified Beer--Lambert Law (under the standard assumptions of constant differential pathlength factors across time and approximately homogeneous tissue scattering). In reflectance diffuse optical tomography, backscattered photons follow banana-shaped migration trajectories with an effective penetration depth of roughly $\sim d/3\text{ to }d/2$ of optode separation $d$ \citep{delpy1988estimation,saager2005direct}. Consequently, the inner $8\text{ mm}$ short channel penetrates only $\sim 2.7\text{--}4.0\text{ mm}$ (sampling exclusively superficial scalp and skull vasculature), whereas the outer $20\text{ mm}$ long channel penetrates $\sim 6.7\text{--}10.0\text{ mm}$ into superficial prefrontal cortex. Because the Muse~S Athena headband (and our simulator) provides both short and long channels, students can see how linear regression removes shallow skin hemodynamics to isolate cortical activation:
  ```

#### 4.1.4 Figure 1C Row 13 & Section 3.2 PTT Jitter
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- **Line 222 — Target Content:**
  ```python
  ["13. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, R-peak locked HEP ERP"],
  ```
- **Replacement Content:**
  ```python
  ["13. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, PPG-peak locked HEP"],
  ```

**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Line 192 — Target Content:**
  ```latex
  In particular, the Heartbeat-Evoked Potential (HEP) sketch locks 256~Hz EEG epochs to the internal systolic peak of the forehead optical pulse wave rather than an external visual flash, helping students understand endogenous event-locked averaging, brain--heart interoception, and the $\sim 150\text{--}250\text{ ms}$ pulse-wave transit delay between the electrical R-wave in the chest and optical pulse arrival at the forehead.
  ```
- **Replacement Content:**
  ```latex
  In particular, the Heartbeat-Evoked Potential (HEP) sketch locks 256~Hz EEG epochs to the internal systolic peak of the forehead optical pulse wave rather than an external visual flash, helping students understand endogenous event-locked averaging, brain--heart interoception, the $\sim 150\text{--}250\text{ ms}$ pulse transit time (PTT) delay between ventricular depolarization and optical pulse arrival, and the physiological $\sim 10\text{--}25\text{ ms}$ PTT jitter that broadens peripheral optical HEP averages relative to ECG-gated recordings.
  ```

#### 4.1.5 BibTeX Coordinate Compound En-Dashes
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib`
- **Line 63 — Target Content:**
  ```bibtex
  title={Flaws in current human training protocols for spontaneous Brain-Computer Interfaces: lessons learned from instructional design},
  ```
- **Replacement Content:**
  ```bibtex
  title={Flaws in current human training protocols for spontaneous {Brain--Computer} Interfaces: lessons learned from instructional design},
  ```
- **Line 82 — Target Content:**
  ```bibtex
  title={Brain-computer music interfacing: Interdisciplinary milestone in music and neuroscience},
  ```
- **Replacement Content:**
  ```bibtex
  title={{Brain--computer} music interfacing: Interdisciplinary milestone in music and neuroscience},
  ```
- **Line 84 — Target Content:**
  ```bibtex
  booktitle={Guide to Brain-Computer Music Interfacing},
  ```
- **Replacement Content:**
  ```bibtex
  booktitle={Guide to {Brain--Computer} Music Interfacing},
  ```

---

### 4.2 Specification for Requirement R4 (Figure Design and Layout Standards)

#### 4.2.1 Axis Headroom in `generate_figures.py`
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- **Line 515 (Fig 3C) — Target Content:**
  ```python
  ax_c.set_ylim(-33, 30)
  ```
- **Replacement Content:**
  ```python
  ax_c.set_ylim(-42, 36)
  ```

- **Line 725 (Fig 5A / Fig 4A) — Target Content:**
  ```python
  ax_a.set_ylim(-4.6, 5.75)
  ```
- **Replacement Content:**
  ```python
  ax_a.set_ylim(-5.2, 6.5)
  ```

#### 4.2.2 Figure 1A Box 3 Label
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- **Line 166 — Target Content:**
  ```python
  "• 6-Tab Reference Drawer:\n"
  "  P5, Input, Sound, EEG, IMU/PPG\n"
  ```
- **Replacement Content:**
  ```python
  "• 5-Tab Reference Drawer (+ AI Tab):\n"
  "  P5, Input, Sound, EEG, IMU/PPG\n"
  ```

#### 4.2.3 Figure 2C Caption Dots Removal
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- **Line 172 — Target Content:**
  ```latex
  ($N = \NCatalogueSketches$ sketches; bars show category median, lines span min--max range, and dots show individual sketches).
  ```
- **Replacement Content:**
  ```latex
  ($N = \NCatalogueSketches$ sketches; bars show category median and lines span min--max range).
  ```

#### 4.2.4 Category 18 Median Rounding Standardization
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py`
- **Line 384 — Target Content:**
  ```python
  ax_c.text(max_v + 10.0, y, f"{int(round(med_v))} ({min_v}–{max_v})", va="center", ha="left", fontsize=6.5, fontweight="bold")
  ```
- **Replacement Content:**
  ```python
  ax_c.text(max_v + 10.0, y, f"{int(np.floor(med_v + 0.5))} ({min_v}–{max_v})", va="center", ha="left", fontsize=6.5, fontweight="bold")
  ```

---

### 4.3 Specification for Requirement R4 (LaTeX Typography & Academic Writing)

#### 4.3.1 Elimination of Mid-Sentence Bold Clutter
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`

1. **Inline Figure / Table References:** Replace all `(\textbf{Figure~\ref{...}})` and `\textbf{Table~\ref{...}}` with plain `(Figure~\ref{...})` and `Table~\ref{...}` across Lines 94, 118, 167, 179, 184, 196, 208, 223, 226, 251, 280, 283, 304, 341, 343, 345, 350.
2. **Body Text Phrases:**
   - Line 179: Change `organizes \textbf{\NRefAPIs\ functions and variables across \NRefTabs\ topic tabs}:` to `organizes \NRefAPIs\ functions and variables across \NRefTabs\ topic tabs:`.
   - Line 184: Change `searchable \textbf{Visual Catalogue Window (\texttt{Catalogue})} containing \textbf{\NCatalogueSketches\ runnable sketches across \NCatalogueCategories\ categories}` to `searchable Visual Catalogue Window (\texttt{Catalogue}) containing \NCatalogueSketches\ runnable sketches across \NCatalogueCategories\ categories`.
3. **Table 1 Body Cells (Lines 130–135):** Remove `\textbf{...}` wrappers from all cells in the BrainImation column:
   - Line 130: `\textbf{$\MuseBrowserKB\text{ KB}$} (No install, \BundleReductionFactor$\times$ smaller)` $\rightarrow$ `$\MuseBrowserKB\text{ KB}$ (No install, \BundleReductionFactor$\times$ smaller)`
   - Line 131: `\textbf{Two-Step Wake-Up + Athena Decoder}` $\rightarrow$ `Two-Step Wake-Up + Athena Decoder`
   - Line 132: `\textbf{Supported (EEG, IMU, Battery)}` $\rightarrow$ `Supported (EEG, IMU, Battery)`
   - Line 133: `\textbf{Supported (EEG, 3-Ch PPG, IMU)}` $\rightarrow$ `Supported (EEG, 3-Ch PPG, IMU)`
   - Line 134: `\textbf{Supported (EEG, Dual-Distance PPG/fNIRS, IMU, DRL/REF)}` $\rightarrow$ `Supported (EEG, Dual-Distance PPG/fNIRS, IMU, DRL/REF)`
   - Line 135: `\textbf{4-Ch EEG + Dual-Distance PPG/fNIRS + 3D Head Motion}` $\rightarrow$ `4-Ch EEG + Dual-Distance PPG/fNIRS + 3D Head Motion`

#### 4.3.2 Six Tracks Formatting in Section 3.2
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- Format each track using clean narrative emphasis (`\emph{...}`), preserving continuous paragraph flow per Mathewson style:
  - Line 186: `The first track consists of the \emph{Core \NBuiltinCategories-Category EEG and Creative-Coding Scaffolds} ($N = ...$)`
  - Line 188: `Moving from brain waves to optical blood-flow sensing, the second track is the \emph{PPG and Optical (fNIRS) Studio} ($N = ...$)`
  - Line 190: `Following the same step-by-step teaching approach for movement sensors, the third track is the \emph{Motion, IMU, and Broadcast Sensors Studio} ($N = ...$)`
  - Line 192: `Combining brain and cardiac signals, the fourth track is the \emph{Multimodal (EEG + PPG + HR) Studio} ($N = ...$)`
  - Line 194: `To show how these building blocks come together in larger applications, the fifth track includes the \emph{Closed-Loop BrainGames Arcade and EEGEdu Curriculum Modules} ($N = ...$)`
  - Line 196: `Finally, the sixth track in the Visual Catalogue preserves two \emph{Archival Classroom Galleries} ($N = ...$)`

#### 4.3.3 BrainImation Typography Standardization
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- Replace all 4 instances of `\textsc{BrainImation}` (Lines 66, 94, 348, 354) with standard roman `BrainImation`.

#### 4.3.4 Active Voice Conversion
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
1. **Line 66:**
   - *Target:* `Second, all live and simulated signals are placed into a single shared JavaScript object covering brain wave bands, raw EEG traces...`
   - *Replacement:* `Second, we route all live and simulated signals into a single shared JavaScript object covering brain wave bands, raw EEG traces...`
2. **Line 345:**
   - *Target:* `Explicit signal conditioning---moving-average smoothing, pre-stimulus baseline subtraction, or threshold hold timers---was implemented in $\StuPctCond\%$ ($\StuCntCond/\NStudentSketches$) of all submissions...`
   - *Replacement:* `Students implemented explicit signal conditioning---moving-average smoothing, pre-stimulus baseline subtraction, or threshold hold timers---in $\StuPctCond\%$ ($\StuCntCond/\NStudentSketches$) of all submissions...`
3. **Line 345 (near end):**
   - *Target:* `These $N = \NStudentSketches$ graded examination files are preserved alongside 26 additional course and laboratory sketches...`
   - *Replacement:* `We preserve these $N = \NStudentSketches$ graded examination files alongside 26 additional course and laboratory sketches inside the \NNeurotechCatalogue-sketch \emph{2025 Neurotech Class Catalogue}...`
4. **Line 348:**
   - *Target:* `\textsc{BrainImation} is designed as a practical, easy-to-adopt browser environment for teaching students...`
   - *Replacement:* `We designed BrainImation as a practical, easy-to-adopt browser environment for teaching students...`
5. **Line 350:**
   - *Target:* `Several practical limitations should be kept in mind by instructors and researchers.`
   - *Replacement:* `Instructors and researchers should consider several practical limitations.`

#### 4.3.5 Code Listing Wrappers (`\noindent\begin{minipage}{\textwidth}...\end{minipage}`)
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
Wrap all code listings (Lines 97–109, 142–158, 210–221, 228–249, 263–278, 285–302) in `\noindent\begin{minipage}{\textwidth} ... \end{minipage}\vspace{4pt}` blocks.
Example structure for each listing:
```latex
\noindent\begin{minipage}{\textwidth}
\begin{lstlisting}
// ... listing code ...
\end{lstlisting}
\end{minipage}
\vspace{4pt}
```

#### 4.3.6 Table 2 Placement in Section 5
**File:** `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex`
- Move `\begin{table}[t!] ... \end{table}` (currently Lines 315–339) to immediately after Line 341 (the end of the first paragraph of Section 5), before Line 343 ("Across all $N = \NStudentSketches$ examination projects...").

#### 4.3.7 Figure 4 and Figure 5 Sequential Alignment
1. **In `generate_figures.py`:**
   - Rename `make_fig5_multimodal_athena_ppg_imu` $\rightarrow$ `make_fig4_multimodal_athena_ppg_imu`. Save to `figures/fig4_multimodal_athena_ppg_imu.pdf` and `.png`.
   - Rename `make_fig4_student_submissions` $\rightarrow$ `make_fig5_student_submissions`. Save to `figures/fig5_psych403_student_submissions_analysis.pdf` and `.png`.
   - Update `main()` call order:
     ```python
     multimodal_bench = make_fig4_multimodal_athena_ppg_imu()
     make_fig5_student_submissions(examples, muse_kb, legacy_muse_kb, dsp_bench, multimodal_bench)
     ```
2. **In `paper2_brainimation.tex`:**
   - Line 255: `\includegraphics[width=0.98\textwidth]{figures/fig4_multimodal_athena_ppg_imu.pdf}` (label `fig:multimodal` becomes Figure 4).
   - Line 308: `\includegraphics[width=0.98\textwidth]{figures/fig5_psych403_student_submissions_analysis.pdf}` (label `fig:students` becomes Figure 5).
3. **In `manuscript.md`:**
   - Update all references in Section 4 from `Figure 5` to `Figure 4` (`Figure 4A,B`, `Figure 4C`, `Figure 4D`, `Figures 3 and 4`).
   - Update all references in Section 5 from `Figure 4` to `Figure 5` (`Table 2 and Figure 5`, `Figure 5A`, `Figure 5B`, `Figure 5C`, `Figure 5D`).

---

### 4.4 Specification for Peer Review and Response Synchronization
**Files:**
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/PeerReview_Report.md`
- `/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/Response_to_Reviewers.md`
- `/Users/fulkanjou/.gemini/antigravity/brain/7d3ac67f-adc9-4aa6-bc9c-6dbd8293b1d5/reviewer_audit_ledger.md`

1. **Audit Ledger Synchronization:**
   - Update `reviewer_audit_ledger.md` to mark all items across Reviewer 1 (R1-M1 to R1-M4, R1-m1, R1-m2), Reviewer 2 (R2-M1 to R2-M4, R2-m1, R2-m2), and Reviewer 3 (R3-M1 to R3-M5) as **Resolved** with exact file diff references upon implementation.
2. **Response to Reviewers Synchronization:**
   - Add a dedicated section to `Response_to_Reviewers.md` covering the Three-Agent Scientific Robustness Audit panel (Dr. Elena Rostova, Prof. Marcus Vance, Dr. Priya Nair).
   - Document the concrete actions taken:
     - Polarity reconciliation between `EEGSimulator` canonical morphology and physical Fpz-referenced differential recording.
     - Accurate optical channel terminology (Ambient photodetector baseline, Red 660 nm, IR 850 nm, Athena NIR 730 nm).
     - Full physical context for fNIRS (isosbestic straddling, CW-MBLL assumptions, photon penetration depth).
     - PPG-peak locked HEP trigger and PTT jitter.
     - Expansion of figure headroom in Fig 3C and 5A.
     - Correction of Figure 1A Box 3 label, removal of phantom dots in Fig 2C caption, and Category 18 median rounding standardization.
     - Complete LaTeX typographic cleanup: mid-sentence bold removal, listing minipage protection, Table 2 repositioning, and Figure 4/5 sequential ordering.

---

## 5. Verification Method

To verify these specifications independently after implementation:

1. **Figure Generation & Limits Check:**
   ```bash
   cd /Users/fulkanjou/EEGEDUPaper/paper2_brainimation
   python3 generate_figures.py
   ```
   - Verify generated files: `figures/fig4_multimodal_athena_ppg_imu.pdf` and `figures/fig5_psych403_student_submissions_analysis.pdf`.
   - Verify Figure 3C y-limits are `(-42, 36)` and no trace passes behind the lower-right legend.
   - Verify Figure 4A (formerly 5A) y-limits are `(-5.2, 6.5)` and no trace touches the upper-right legend.
   - Verify Figure 1A Box 3 reads "5-Tab Reference Drawer (+ AI Tab)".
   - Verify Category 18 median reads `43` in both Figure 1C and Figure 2C.

2. **Manuscript Analysis Verification:**
   ```bash
   python3 verify_manuscript_analyses.py
   ```
   - Must pass with 0 failures, validating Table 2 quantiles, dataset metrics, and macro synchrony.

3. **LaTeX Typographic & Formatting Audits:**
   - Check zero mid-sentence boldface in body text and Table 1:
     ```bash
     python3 -c '
     import re
     with open("paper2_brainimation.tex") as f:
         for i, l in enumerate(f, 1):
             if re.search(r"(?:Figure~\\ref|Table~\\ref)", l) and "\\textbf{" in l:
                 print(f"Bold cross-ref at line {i}: {l.strip()}")
             if 130 <= i <= 135 and "\\textbf{" in l:
                 print(f"Table 1 bold at line {i}: {l.strip()}")
     '
     ```
     *Expected result: Zero lines output.*
   - Check all listings wrapped in minipages:
     ```bash
     grep -n "\\begin{lstlisting}" paper2_brainimation.tex
     ```
     *Verify preceding line of each occurrence contains `\begin{minipage}{\textwidth}`.*
   - Check `references2.bib` for single hyphens in coordinate compounds:
     ```bash
     grep -n "Brain-Computer" references2.bib
     ```
     *Expected result: Zero lines output.*

4. **PDF Compilation and Page Layout Audit:**
   ```bash
   pdflatex -interaction=nonstopmode paper2_brainimation.tex
   bibtex paper2_brainimation
   pdflatex -interaction=nonstopmode paper2_brainimation.tex
   pdflatex -interaction=nonstopmode paper2_brainimation.tex
   pdftoppm -png -r 150 paper2_brainimation.pdf pdf_pages/page
   ```
   - Inspect page flow in `pdf_pages/`:
     - Confirm no code listing splits across page breaks.
     - Confirm Table 2 appears within Section 5 below its first paragraph.
     - Confirm Figure 4 (Multimodal) and Figure 5 (Students) are cited and placed in strict sequential order.
