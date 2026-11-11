# Comprehensive Peer Review Report

**Manuscript Title:** *BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors*  
**Author:** Kyle E. Mathewson  
**Target Journal:** *Journal of Neuroscience Methods*  
**Handling Action Editor:** Prof. T. H. Bullock  
**Panel Transcripts & Reviewer Transcripts:**
- **Action Editor:** Prof. T. H. Bullock (Editorial Synthesis & Quality Assurance)
- **Reviewer 1:** Dr. Elena Rostova (Senior Research Engineer in Real-Time DSP, BLE Firmware, & Embedded BCI Systems)
- **Reviewer 2:** Prof. Marcus Vance (Professor of Quantitative Methods, Corpus Analytics, & Scientific Data Visualization)
- **Reviewer 3:** Dr. Priya Nair (Associate Professor of Cognitive Psychophysiology, Neuroscience Pedagogy, & Academic Writing)

---

## ACTION EDITOR DECISION LETTER & EDITORIAL SYNTHESIS

**Action Editor:** Prof. T. H. Bullock, Ph.D.  
**Decision:** Accept Pending Minor Revisions  

Dear Dr. Mathewson,

Thank you for submitting your manuscript, *"BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors"*, to the *Journal of Neuroscience Methods*. 

Your manuscript has now been evaluated by three independent expert reviewers alongside my own editorial reading. The review panel includes Dr. Elena Rostova (specializing in real-time digital signal processing, BLE/GATT communications, and BCI hardware integration), Prof. Marcus Vance (specializing in quantitative research methodology, corpus linguistics, and data visualization standards), and Dr. Priya Nair (specializing in cognitive psychophysiology, neurotechnology pedagogy, and scientific writing).

The panel is unanimous in praising the utility, pedagogical vision, and technical execution of BrainImation. Moving the full acquisition, simulation, signal-processing, and audiovisual rendering pipeline into a zero-install browser tab directly addresses a notorious bottleneck in undergraduate neuroscience education. The combination of hardware-free simulation (`EEGSimulator`), a 226-sketch visual catalogue, and a unified data model (`window.eegData`) spanning EEG, optical hemodynamics, and 3D kinematics represents a major step forward for classroom instruction.

However, the panel has identified several crucial technical, statistical, psychophysiological, and typographical discrepancies that must be rigorously addressed before the manuscript can be formally accepted for publication. I have organized these requirements into four core themes:

1. **Theme R1: Codebase and Listing Synchronization (Reviewer 1)**  
   The executable listings presented in the manuscript must match the live JavaScript repository with 100% fidelity. Specifically:
   - In `examples/basic.js` and Listing 1, resolve the inverted mapping of `eegData.alpha` and `eegData.attention` to `size` and `hue` while strictly preserving 11 executable lines of code (LOC).
   - In `examples/epochs.js` and Listing 3, implement genuine whole-epoch $>100\ \mu\text{V}$ peak-to-peak blink rejection across all four channels before incrementing `trialCount` and updating running averages, eliminating the denominator desynchronization caused by per-channel `continue` statements while strictly preserving 85 executable LOC.
   - In `index.html` (`updateShortChannelRegression`), eliminate the high-pass attenuation of cortical hemodynamic responses by slowing baseline tracking ($\tau \approx 31\text{ s}$) and subtracting rolling means only inside the covariance/variance estimation loops of OLS $\hat{\beta}$.
   - In `index.html` (`updateEEGImuMotionFilter`), support both numeric (`0..3`) and channel-name string keys on `motionFilterWeights`, and harmonize NLMS constants ($\mu = 0.035$, leakage $= 0.9992$, $\varepsilon = 10^{-4}$) with Listing 5 and the offline simulation benchmark.
   - Clarify in Section 2.2 that live hardware calculates sliding Hanning FFTs while `EEGSimulator` drives band envelopes from interactive sidebar sliders.

2. **Theme R2: Corpus Analytics, Macro Parameterization, and Statistical Rigor (Reviewer 2)**  
   All empirical figures, table cells, and text statistics must be derived reproducibly from underlying data artifacts:
   - Expand feature extraction regular expressions in `generate_figures.py` to capture optional chaining (`eegData?.prop`) and variable aliasing (`const e = eegData; e.prop`), and replace the tautological classification of `erp_oddball` with an explicit code inspection regex.
   - Normalize whitespace in student submission deduplication, clarify why $N = 69$ graded submissions across $N_{\text{students}} = 30$ learners includes iterative drafts, and report the per-student clustered medians ($N_{\text{students}} = 30$, median 164 LOC).
   - Conduct a specific Wilcoxon signed-rank baseline comparison evaluating Cohort 2 ERP projects against the 85-LOC `epochs.js` template ($W = 435.0, p = 1.86 \times 10^{-9}$), and include a crisp 1-clause definition of executable LOC.
   - Eliminate hardcoded numbers in Table 2 and body paragraphs by parameterizing all 32 empirical quantities into `stats_macros.tex` and embedding automated validation into `verify_manuscript_analyses.py`.

3. **Theme R3: Neurophysiological Nuances, Biophysical Rigor, and Citation Hygiene (Reviewer 3)**  
   - Explicitly reconcile the physical forehead Fpz-referenced polarity inversion with `EEGSimulator`'s canonical textbook morphology ($-6.5\ \mu\text{V}$ N170, $+9.5\ \mu\text{V}$ P300) in Figure 3C and Section 4.2.
   - Clarify optical terminology in Section 3.2 (distinguishing ambient photodetector baseline from optical wavelengths, and noting the Athena 730 nm optode); update Figure 1C to "PPG-peak locked HEP" and discuss pulse transit time (PTT) beat-to-beat jitter (~10–25 ms).
   - State the biophysical foundations of fNIRS in Section 4.3: hemoglobin isosbestic crossing (~800 nm), continuous-wave Modified Beer–Lambert Law (CW-MBLL) assumptions, and banana-shaped photon penetration depth scaling (~$d/3$ to $d/2$).
   - Standardize coordinate compound terms in `references2.bib` to en-dashes (`{Brain--Computer}`).

4. **Theme R4: Figure Design, Academic Writing, and Document Layout (Editorial Requirements)**  
   - Enforce `clean-scientific-figures` standards: expand y-axis headroom in Figure 3C (`ylim(-42, 36)`) and Figure 4A (`ylim(-5.2, 6.5)`) to eliminate trace clipping and legend collisions; remove phantom scatter dots from Figure 2C caption; standardize Category 18 median rounding to 43 consistently.
   - Enforce Dr. Mathewson's academic writing standards: strip all mid-sentence boldface in body text and table cells, format the six learning tracks with narrative emphasis (`\emph{...}`), standardize roman `BrainImation`, and convert passive constructions to active first-person plural voice.
   - Protect all six code listings using minipage wrappers (`\noindent\begin{minipage}{\textwidth}...\end{minipage}`) to prevent page breaks; position Table 2 cleanly inside Section 5; ensure 1-to-1 sequential alignment of Figures 1–5 between LaTeX and Markdown.

Please provide a detailed, point-by-point response letter along with the revised manuscript files. I look forward to receiving your revision.

Sincerely,  
**Prof. T. H. Bullock, Ph.D.**  
Action Editor, *Journal of Neuroscience Methods*

---

## REVIEWER 1 REPORT (Dr. Elena Rostova)

**Reviewer Focus:** Real-Time Digital Signal Processing, BLE/GATT Firmware Protocols, & Codebase Architecture  
**Recommendation:** Accept Pending Minor Revisions  

### General Assessment
This manuscript presents BrainImation, an impressive and highly needed browser-based live-coding studio for consumer neurotechnology. Integrating WebBluetooth GATT streaming, interactive p5.js canvas graphics, Web Audio API synthesis, dual-distance fNIRS hemodynamics, and 6-DOF IMU head-motion tracking inside an unbundled web page is a remarkable engineering accomplishment. As someone who builds embedded BCI firmware and real-time DSP pipelines, I particularly commend the author for addressing packet burstiness, browser frame jitter, and hardware-free simulation.

However, an exhaustive line-by-line audit comparing the manuscript code listings against the live JavaScript repository (`/Users/fulkanjou/Brainimation`) revealed four major signal-processing and synchronization discrepancies that must be resolved.

### Detailed Recommendations

#### 1.1 Artifact Rejection & Denominator Desynchronization in Listing 3 vs. `examples/epochs.js` (R1-M1)
In Listing 3 (`paper2_brainimation.tex`), the online ERP averaging loop contains the following check inside the channel iteration:
```javascript
for (let ch = 0; ch < 4; ch++) {
  ...
  if (maxV - minV > 100) continue;
  avgERP[s][ch] = ((avgERP[s][ch] * (trialCount - 1)) + corrected) / trialCount;
}
```
There are two critical issues here:
1. In the actual live file `examples/epochs.js`, there was *no* peak-to-peak rejection whatsoever: every captured epoch was pushed directly into `epochData`, contaminating the buffer during blinks.
2. In Listing 3, placing `if (maxV - minV > 100) continue;` inside the channel loop while dividing by a single scalar `trialCount` creates mathematical desynchronization. Because blink spikes ($>100\ \mu\text{V}$) occur predominantly on frontal channels (`AF7`/`AF8`) while temporo-parietal channels (`TP9`/`TP10`) remain clean, skipping only the blink-contaminated channel while incrementing `trialCount` globally corrupts the running average denominator.
*Required Fix:* Implement whole-epoch $>100\ \mu\text{V}$ peak-to-peak rejection across all 4 channels *before* updating `trialCount` or pushing to `epochData`, ensuring both `examples/epochs.js` (preserving 85 executable LOC) and Listing 3 are mathematically synchronized.

#### 1.2 Mapping and Setup Parity in Listing 1 vs. `examples/basic.js` (R1-M2)
In Listing 1 (`paper2_brainimation.tex`), `eegData.alpha` is mapped to ellipse `size` (`50..300`) and `eegData.attention` is mapped to `hue` (`180..360`), followed by `noStroke();`. In the live file `examples/basic.js`, `eegData.alpha` was mapped to `hue` (`180..300`), `eegData.attention` was mapped to `size` (`50 + attention * 100`), `noStroke()` was missing, and a `console.log()` was present.
*Required Fix:* Synchronize `examples/basic.js` and Listing 1 to be completely identical in code logic, variable mapping, and formatting, preserving exactly 11 executable LOC.

#### 1.3 NLMS Adaptive Filter Dual Key Access & Parameter Parity (R1-M3)
In Listing 5, the 6-tap Normalized Least Mean Squares (NLMS) adaptive filter indexes filter weights via integer channel index: `let w = eegData.motionFilterWeights[ch];` where `ch = 0..3`. In `index.html` line 2280 and 2933, `eegData.motionFilterWeights` was keyed exclusively by channel name strings (`TP9`, `AF7`, `AF8`, `TP10`), which causes integer indexing to return `undefined` and crash the filter loop!
Furthermore, the filter parameters diverged: `index.html` used $\mu = 0.05$, leakage $= 0.9995$, unscaled acceleration, and gyro $/60$, whereas Listing 5 and the offline simulation benchmark in `generate_figures.py` used $\mu = 0.035$, leakage $= 0.9992$, $\varepsilon = 10^{-4}$, linear acceleration $\times 0.25$, and gyro $/80$.
*Required Fix:* Support both numeric (`0..3`) and string keys on `this.motionFilterWeights` in `index.html`, and align all NLMS constants across `index.html`, Listing 5, and `generate_figures.py`.

#### 1.4 Short-Channel fNIRS Baseline Tracking & HRF High-Pass Attenuation (R1-M4)
In `index.html` (`updateShortChannelRegression`), the 96-sample ($1.5\text{ s}$ at 64 Hz) rolling mean was subtracted directly from raw optical densities (`sOD850 = rawSOD850 - mS850; lOD850 = rawLOD850 - mL850;`). In combination with an overly fast baseline tracker (`adaptBase` $\tau \approx 1.04\text{ s}$), this acted as an aggressive high-pass filter ($f_c \approx 0.30\text{ Hz}$), obliterating slow $4\text{--}14\text{ s}$ prefrontal cortical hemodynamic responses ($\Delta[\text{HbO}_2]$). In contrast, `generate_figures.py` subtracted the 96-sample rolling mean *strictly inside* the covariance/variance loop when estimating $\hat{\beta}$, leaving raw optical densities un-attenuated.
*Required Fix:* In `index.html`, slow `adaptBase` tracking to $\tau = 31.25\text{ s}$ (rate $0.0005$) and subtract the 96-sample rolling mean *only* within the covariance/variance estimation loops of $\hat{\beta}$, ensuring slow task-induced cortical HRFs are preserved.

#### 1.5 Accurate Bundle Size Metrics for `muse-browser.js` (R1-m1)
`muse-browser.js` on disk is 38,899 bytes ($38.0\text{ KB}$, representing a $12.5\times$ reduction relative to the 473.0 KB legacy `muselsl`+Python bundle). The manuscript and `stats_macros.tex` contained outdated figures ($36.7\text{ KB}$ and $12.9\times$).
*Required Fix:* Update `stats_macros.tex`, Table 1, and `manuscript.md` to reflect $38.0\text{ KB}$ and $12.5\times$.

#### 1.6 Clarifying Sliding FFT vs. Simulation Envelopes in Section 2.2 (R1-m2)
Section 2.2 stated that frequency band powers are derived from 1-second sliding Hanning FFTs without distinguishing between live hardware streaming and hardware-free simulation.
*Required Fix:* Clarify that live hardware calculates sliding Hanning FFTs (`MuseEEGManager.calculateFrequencyBands`) on 256 Hz data, while `EEGSimulator` drives band envelopes from interactive Attention/Meditation sliders alongside 256 Hz raw synthetic EEG.

---

## REVIEWER 2 REPORT (Prof. Marcus Vance)

**Reviewer Focus:** Quantitative Research Methods, Corpus Analytics, & Scientific Data Visualization  
**Recommendation:** Accept Pending Minor Revisions  

### General Assessment
The quantitative corpus analysis of 226 catalogue sketches and 69 student examination submissions provides empirical grounding that sets this paper apart from typical software announcements. Evaluating code complexity across learning tracks and student cohorts demonstrates the pedagogical efficacy of the tool.

To ensure this work meets the highest standards of scientific reproducibility and data visualization, several discrepancies in sample structure, regex feature extraction, table metrics, and axis margins must be addressed.

### Detailed Recommendations

#### 2.1 Table 2 Subgroup Quantiles & Macro Parameterization (R2-M1)
Inspection of Table 2 rows 2–4 revealed that several reported medians and IQRs did not match the underlying 226-sketch corpus metrics:
- Row 2 (`Studios`, $N=26$): reported `Med = 185, IQR = 132–275`; true data is `Med = 200, IQR = 130–245` (range 69–510 LOC).
- Row 3 (`BrainGames/EEGEdu`, $N=43$): reported `Med = 142, IQR = 43–446`; true data is `Med = 131, IQR = 38–438` (range 17–758 LOC).
- Row 4 (`Archival Galleries`, $N=121$): reported `IQR = 54–176`; true data is `IQR = 50–174` (range 12–414 LOC).
*Required Fix:* Compute exact subgroup quantiles dynamically in `generate_figures.py`, export them to `stats_macros.tex`, wire them into Table 2, and add regression tests in `verify_manuscript_analyses.py`.

#### 2.2 Student Archive Sample Structure & Whitespace Deduplication (R2-M2)
In `generate_figures.py`, the deduplication logic had two subtle issues:
1. Two submissions (`1DVvpkMg_Codefile.AmnaKhanPSYCH403.txt` and `1Z1YzK4q_AmnaK_Assign2.txt`, 52 LOC) were identical except for non-breaking space characters (`\xa0`) preceding inline comments.
2. A rigid check (`"eegData" in txt or "createCanvas" in txt`) excluded 3 valid student ERP files relying on auto-canvas.
Furthermore, readers need to understand why $N = 69$ submissions were produced by $N_{\text{students}} = 30$ learners.
*Required Fix:* Apply whitespace-normalized line hashing, verify inclusion of all 69 valid examination submissions, and explain in Section 5 that learners submitted iterative draft versions alongside Midterms 1 and 2, motivating the per-student clustered median analysis ($N_{\text{students}} = 30$, median 164 LOC, $U = 1074.0, p < 10^{-11}, r_{rb} = 0.99$).

#### 2.3 Feature Regular Expression Undercounting & Tautology Removal (R2-M3)
In `generate_figures.py`, feature regexes used rigid `r"eegData\." + prop + r"\b"`. In 7 student submissions, students accessed properties using optional chaining (`eegData?.alpha`) or local aliases (`const e = eegData; e.alpha`, `src.alpha`). Consequently, student adoption was undercounted. Furthermore, line 918 set `"erp_oddball": is_erp_cohort` based on filename metadata rather than examining code.
*Required Fix:* Expand regexes to `r"(?:eegData\??\.|\b(?:e|src)\.)" + prop + r"\b|getChannelBand\(\s*['\"]" + prop`, and replace the metadata flag with an explicit code regex matching ERP/epoching operations.

#### 2.4 Baseline Comparison Against `epochs.js` (85 LOC) & Executable LOC Definition (R2-M4)
In Section 5, student LOC is compared against the 32-LOC introductory scaffolds. For Cohort 2 (ERP paradigms), students were provided with the 85-LOC `epochs.js` starter template.
*Required Fix:* Report the specific Wilcoxon signed-rank test comparing Cohort 2 projects against the 85-LOC template ($29/29 = 100\%$ exceed 85 LOC, range 117–306 LOC, median 176 LOC, median expansion $2.07\times$, $W = 435.0, p = 1.86 \times 10^{-9}$), and include a single-clause definition of executable LOC (non-empty, non-comment lines of code).

#### 2.5 Visual Headroom Violations in Figure 3C and Figure 4A (R2-m1)
Following the `clean-scientific-figures` guidelines:
- In Figure 3C (`ylim(-33, 30)`), the single-trial raw ERP trace ($K=1$) dipped below $-32\ \mu\text{V}$, colliding with the lower-right legend box.
- In Figure 4A (formerly 5A; `ylim(-4.6, 5.75)`), the raw long-channel peak touched the upper-right legend and the short-channel trace was clipped at $-4.6\ \mu\text{M}$.
*Required Fix:* Expand y-limits in `generate_figures.py`: Figure 3C to `ylim(-42, 36)` and Figure 4A to `ylim(-5.2, 6.5)`.

#### 2.6 Category 18 Rounding Consistency & Phantom Dots in Caption (R2-m2)
Figure 2C caption stated *"and dots show individual sketches"*, but no scatter dots were rendered. Additionally, Category 18 (`2022 NeuroArt Class Gallery`, $N=26$) has an exact median of 42.5 LOC, which was rounded to 42 in Figure 2C due to banker's rounding, while prose and Figure 1C reported 43.
*Required Fix:* Remove *"and dots show individual sketches"* from Figure 2C caption, and standardize half-up rounding (`int(np.floor(v + 0.5))`) to 43 across all figures, tables, and prose.

---

## REVIEWER 3 REPORT (Dr. Priya Nair)

**Reviewer Focus:** Cognitive Psychophysiology, Instructional Scaffolding, & Academic Writing Standards  
**Recommendation:** Accept Pending Minor Revisions  

### General Assessment
BrainImation provides an outstanding instructional environment. Psychophysiology instructors face immense challenges when attempting to teach ERP averaging, artifact rejection, and optical spectroscopy in undergraduate labs. Providing students with transparent, editable 15-line algorithms demystifies what is too often taught as an impenetrable black box.

My recommendations focus on neurophysiological accuracy, biophysical foundations of fNIRS, parameterization of empirical numbers, and rigorous adherence to Dr. Mathewson's academic writing and typography standards.

### Detailed Recommendations

#### 3.1 Reconciling Forehead Fpz Reference Polarity with `EEGSimulator` Morphology (R3-M1)
In Section 4.2, the text correctly explains that because the Muse headband places its reference electrode near forehead `Fpz`, recording posterior temporo-parietal channels (`TP9`/`TP10`) relative to `Fpz` inverts the polarity of classic mastoid-referenced vertex/parietal dipoles. Yet in Figure 3C, `EEGSimulator` plots simulated channel `TP9` with canonical un-inverted textbook polarities (negative N170 at $-6.5\ \mu\text{V}$, positive P300 at $+9.5\ \mu\text{V}$). This apparent contradiction will confuse students and instructors.
*Required Fix:* Explicitly clarify in Section 4.2 and Figure 3C caption that `EEGSimulator` intentionally injects canonical textbook polarities into TP9 so beginners first master $1/\sqrt{K}$ averaging before navigating differential montage re-referencing ($V_{\text{TP}} - V_{\text{AF}}$).

#### 3.2 Precision in Optical Channels, PPG-Peak Locked HEP, and fNIRS Biophysics (R3-M2)
1. Section 3.2 referred to "three raw optical wavelengths (Ambient, Red 660 nm, and Infrared 850 nm)". Ambient light is a photodetector dark-current baseline, not a wavelength. Furthermore, the Athena headband includes a 730 nm optode.
2. In Figure 1C Row 13, the Heartbeat-Evoked Potential was labeled "R-peak locked HEP ERP". Muse headbands lack chest ECG leads; triggering is locked to the forehead PPG systolic peak.
3. In Section 3.2, note pulse transit time (PTT) delay (~150–250 ms) and beat-to-beat jitter (~10–25 ms), which introduces physiological smoothing.
4. In Section 4.3, state why 660 nm and 850 nm are chosen (straddling the ~800 nm isosbestic point), state continuous-wave MBLL assumptions (constant DPF, homogeneous scattering), and explain photon penetration depth scaling (~$d/3$ to $d/2$, justifying $8\text{ mm}$ vs $20\text{ mm}$ dual-distance regression).
*Required Fix:* Update Section 3.2, Section 4.3, and Figure 1C table accordingly.

#### 3.3 Wiring All 32 Hardcoded Empirical Numbers into `stats_macros.tex` (R3-M3)
A manual scan of `paper2_brainimation.tex` revealed 32 empirical numbers hardcoded directly into LaTeX body paragraphs and table cells (Reference Drawer tab counts: 41, 38, 27, 26, 16; Studio medians: 198, 215, 120, 514, 149, 43; Table 2 subgroup ranges and medians; additional sketches: 26).
*Required Fix:* Export all 32 empirical quantities as macros from `generate_figures.py` to `stats_macros.tex` and wire them into `paper2_brainimation.tex`.

#### 3.4 Eliminating Mid-Sentence Boldface & Enforcing Mathewson Writing Style (R3-M4)
The manuscript violated Dr. Mathewson's writing guidelines:
- 42 occurrences of mid-sentence `\textbf{...}` were scattered across body paragraphs and Table 1 body cells.
- `\textsc{BrainImation}` appeared in small-caps inconsistently.
- Three passive sentences were present in the abstract and discussion.
*Required Fix:* Strip all mid-sentence boldface; format the six learning tracks in Section 3.2 with narrative emphasis (`\emph{...}`); standardize to roman `BrainImation`; convert passive constructions to active first-person plural voice (*"We route...", "Students implemented...", "We preserve...", "We designed..."*).

#### 3.5 Code Listing Minipage Wrappers, Table 2 Placement, and Sequential Figure Ordering (R3-M5)
In the compiled PDF, Listings 2, 4, and 5 broke across page boundaries, with Listing 5 cut in half by Figure 4 on Page 11! Table 2 floated into Section 4.4 above Section 5. In `manuscript.md`, Figure 5 was cited before Figure 4.
*Required Fix:* Wrap all six listings in `\noindent\begin{minipage}{\textwidth}...\end{minipage}\vspace{4pt}`; place Table 2 cleanly inside Section 5 below its first paragraph; align Figure 4 (Multimodal Athena) and Figure 5 (Student Submissions) numbering in 1-to-1 sequential order across both LaTeX and Markdown.

---

## EDITORIAL CONCLUSION

The revisions requested by the panel are thorough, constructive, and aimed at ensuring absolute technical and pedagogical excellence. Once these remediations are implemented and verified via automated regression testing, the manuscript will be ready for final acceptance.
