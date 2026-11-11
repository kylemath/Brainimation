# Handoff Report — Worker 3: Neurophysiology & Academic Citations Specialist

**Author:** Worker 3 (Neurophysiology & Academic Citations Specialist)  
**Recipient:** Orchestrator (`19b884d0-bc13-434a-b900-b62ef20b94f8`)  
**Date:** 2026-11-09T20:32:00Z  
**Milestone:** Requirement R3 (Neurophysiological Nuances & Academic Citations)  
**Status:** COMPLETE (Hard Handoff)

---

## 1. Observation

### 1.1 Direct Observations in Target Files

1. **BibTeX Hyphens in Coordinate Compounds (`references2.bib`):**
   - Lines 63, 82, and 84 used single hyphens for coordinate noun compounds in titles:
     - Line 63: `title={Flaws in current human training protocols for spontaneous Brain-Computer Interfaces: lessons learned from instructional design},`
     - Line 82: `title={Brain-computer music interfacing: Interdisciplinary milestone in music and neuroscience},`
     - Line 84: `booktitle={Guide to Brain-Computer Music Interfacing},`
   - Ripgrep confirmed zero other occurrences of `brain-computer` across `references2.bib`.

2. **Optical Modality Label in Figure 1C (`generate_figures.py`):**
   - Line 222 of `generate_figures.py` previously read:
     `["13. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, R-peak locked HEP ERP"],`
   - Muse headbands lack chest electrocardiogram (ECG) leads; the Heartbeat-Evoked Potential (HEP) is locked to the forehead photoplethysmogram (PPG) systolic peak.

3. **Optical Channels and HEP PTT Jitter in Section 3.2:**
   - In `paper2_brainimation.tex` (Line 188) and `manuscript.md` (Line 114): optical sensing was previously described as "three raw optical wavelengths (Ambient, Red 660 nm, and Infrared 850 nm)". Ambient is not a wavelength; it is the dark photodetector reading for baseline ambient-light subtraction. Additionally, the Muse S Athena headband includes an extra Near-Infrared 730 nm optode.
   - In `paper2_brainimation.tex` (Line 192) and `manuscript.md` (Line 118): the HEP description noted pulse transit time (PTT) delay (~150--250 ms) but omitted beat-to-beat PTT jitter (~10--25 ms), which physiologically broadens and low-pass filters the peripheral optical HEP relative to an ECG R-wave triggered potential.

4. **Polarity Reconciliation in Figure 3C Caption & Section 4.2:**
   - In `paper2_brainimation.tex` (Line 201), Figure 3C caption described simulated channel TP9 relative to forehead Fpz with canonical textbook polarities (-6.5 uV N170 at +170 ms, +9.5 uV P300 at +340 ms).
   - In Section 4.2 (`paper2_brainimation.tex` Line 226; `manuscript.md` Line 149), the text explained that forehead Fpz-referenced differential recording reverses the polarity of classic vertex/parietal dipoles, but did not explain why the simulator injected canonical un-inverted polarities.

5. **fNIRS Biophysics and MBLL Principles in Section 4.3:**
   - In `paper2_brainimation.tex` (Line 269) and `manuscript.md` (Line 183): the introductory fNIRS text lacked:
     a) Why 660 nm and 850 nm are chosen (straddling the ~800 nm hemoglobin isosbestic point where HbO2 and HHb extinction coefficients cross).
     b) The assumptions underlying continuous-wave Modified Beer--Lambert Law (CW-MBLL: constant differential pathlength factors across time and approximately homogeneous tissue scattering).
     c) Reflectance banana-shaped photon penetration depth scaling (~d/3 to d/2 of optode separation d: ~2.7--4.0 mm for 8 mm short channel vs. ~6.7--10.0 mm for 20 mm cortical channel).

---

## 2. Logic Chain

1. **Academic Typography (Task 5):**
   - Coordinate compound modifiers and nouns in formal academic English require en-dashes (`--`) rather than hyphens.
   - Bracing `{Brain--Computer}` in BibTeX ensures that BibTeX styles (like `apalike`) do not inadvertently downcase or mangle the compound term.
   - Replaced lines 63, 82, and 84 in `references2.bib`.

2. **Cardiovascular & Optical Terminology (Tasks 2 & 4):**
   - Photoplethysmography measures light transmission/reflectance changes driven by blood volume pulses. Muse hardware triggers HEP on the optical systolic upstroke, not on an ECG electrical R-wave.
   - Updating Row 13 in `generate_figures.py` to `"Neurovascular lag, PPG-peak locked HEP"` corrects the modality label.
   - In Section 3.2, explaining that PPG triggering incurs beat-to-beat PTT jitter (~10--25 ms) on top of the ~150--250 ms transit delay provides students with an authentic physiological rationale for the temporal smoothing observed in optical HEP compared to ECG gating.
   - Correcting "three raw optical wavelengths" to "three raw optical channels (ambient photodetector baseline, Red 660 nm, and Infrared 850 nm, plus Near-Infrared 730 nm on Muse S Athena)" distinguishes optical wavelengths from dark-current photodetector baseline subtraction and accurately documents Athena hardware.

3. **Polarity Discrepancy Reconciliation (Task 1):**
   - Physical Muse differential recording measures $V_{\text{channel}} - V_{\text{Fpz}}$. For posterior temporo-parietal electrodes (`TP9`/`TP10`) referenced to forehead `Fpz`, a positive parietal dipole produces a negative deflection unless re-referenced ($V_{\text{TP}} - V_{\text{AF}}$) or sign-inverted.
   - However, in introductory educational tools (`EEGSimulator`), students must first grasp canonical textbook morphology (negative N170, positive P300) and $1/\sqrt{K}$ noise reduction before learning montage math.
   - Reconciling this explicitly in Figure 3C caption and Section 4.2 in both `paper2_brainimation.tex` and `manuscript.md` eliminates ambiguity while enriching the pedagogical discussion.

4. **Spectroscopic Rigor for fNIRS (Task 3):**
   - The CW-MBLL relies on differential absorption below vs. above the ~800 nm isosbestic point: HHb dominates at 660 nm; HbO2 dominates at 850 nm.
   - CW-MBLL assumes constant differential pathlength factors (DPF) over time and homogeneous scattering.
   - Diffuse optical reflectance paths form banana-shaped photon clouds penetrating to depth $\sim d/3\text{ to }d/2$. Thus the 8 mm optode samples only superficial scalp/skull tissue (~2.7--4.0 mm), while the 20 mm optode reaches superficial cortex (~6.7--10.0 mm), mathematically justifying the dual-distance linear regression.
   - Added these explanations to Section 4.3 of both `paper2_brainimation.tex` and `manuscript.md`.

5. **Style Compliance:**
   - Adhered strictly to Dr. Mathewson's style guide: no bullet lists in body sections, active voice, plain-English clauses followed by parenthetical technical specifications, and clean LaTeX hygiene.

---

## 3. Caveats

- **Scope Adherence:** Worker 3 modified only the assigned files (`paper2_brainimation.tex`, `manuscript.md`, `generate_figures.py`, and `references2.bib`) within the designated sections (3.2, 4.2, 4.3, Figure 3C caption, Figure 1C table).
- **Untracked / Repository Boundaries:** `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation` was untouched.
- **PDF Rendering Tools:** `pdftoppm` is not installed on the system, but `pdflatex` directly produced the 1.6 MB publication-ready PDF (`paper2_brainimation.pdf`) with 0 errors and 0 undefined references.

---

## 4. Conclusion

All five requirements of Milestone M3 (Requirement R3) have been implemented and verified:
1. Reconciled textbook N170/P300 polarities with physical Fpz-referenced differential recording in Figure 3C caption and Section 4.2 across `.tex` and `.md`.
2. Updated optical sensing terminology in Section 3.2 across `.tex` and `.md` to reflect ambient photodetector baseline, 660 nm, 850 nm, and Athena 730 nm.
3. Added concise, rigorous notes on isosbestic straddling, CW-MBLL assumptions, and photon penetration depth scaling in Section 4.3 across `.tex` and `.md`.
4. Corrected Row 13 of Figure 1C table in `generate_figures.py` to "PPG-peak locked HEP" and detailed PTT (~150--250 ms) beat-to-beat jitter (~10--25 ms) in Section 3.2 across `.tex` and `.md`.
5. Standardized coordinate compound terms to `{Brain--Computer}` / `{Brain--computer}` with en-dashes in `references2.bib`.

---

## 5. Verification Method

To independently verify all changes:

1. **Verify BibTeX En-Dashes:**
   ```bash
   grep -n "Brain-Computer" /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/references2.bib
   ```
   *Expected outcome:* Zero matches (all converted to `{Brain--Computer}`).

2. **Verify Figure 1C Row 13 in `generate_figures.py`:**
   ```bash
   grep -n "PPG-peak locked HEP" /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py
   ```
   *Expected outcome:* Match on line 222.

3. **Verify Execution of `generate_figures.py`:**
   ```bash
   python3 /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py
   ```
   *Expected outcome:* Exit code 0, all figures and macros generated cleanly.

4. **Verify LaTeX Compilation & Zero Missing Citations:**
   ```bash
   cd /Users/fulkanjou/EEGEDUPaper/paper2_brainimation
   pdflatex -interaction=batchmode paper2_brainimation.tex
   bibtex paper2_brainimation
   pdflatex -interaction=batchmode paper2_brainimation.tex
   pdflatex -interaction=batchmode paper2_brainimation.tex
   grep -i "undefined" paper2_brainimation.log
   ```
   *Expected outcome:* All commands exit 0. BibTeX reports 0 warnings, log reports 0 undefined citations and 0 undefined references.

5. **Verify Statistical and Numerical Integrity Suite:**
   ```bash
   python3 /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/verify_manuscript_analyses.py
   ```
   *Expected outcome:* `ALL VERIFICATION CHECKS PASSED (100% SUCCESS)`.
