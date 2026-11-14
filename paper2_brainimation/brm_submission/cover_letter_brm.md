November 14, 2026

Dr. Erin M. Buchanan and Dr. Dora Matzke  
Co-Editors-in-Chief, *Behavior Research Methods*  
Springer Nature / Psychonomic Society

Dear Drs. Buchanan and Matzke,

Please find enclosed our manuscript entitled **"BrainImation: Bringing Brain Waves to Life in the Browser with Affordable Muse Headbands"** by Kyle E. Mathewson, Tamari Shalamberidze, and Claire J. Scavuzzo, submitted for consideration as an Original Article in *Behavior Research Methods*.

Rapid prototyping and classroom instruction of closed-loop neurofeedback protocols, event-related potential (ERP) paradigms, and multimodal physiological displays with portable headbands typically require installing operating-system Bluetooth utilities, network streaming layers (`LabStreamingLayer`), and desktop programming environments. BrainImation (`https://kylemath.github.io/Brainimation/`) eliminates this setup barrier for neuroscience and psychology educators, students, and researchers by running entirely in a single webpage. A self-contained `37.4 KB` WebBluetooth client (`muse-browser.js`, `12.6x` smaller than legacy bundles) connects four generations of InteraXon Muse headbands—Muse 2016, Muse 2, Classic Muse S, and Muse S Athena (`p1042` 16-channel optical streaming with `730 nm + 850 nm` Modified Beer–Lambert forehead oxygenation)—directly to `p5.js` graphics and `p5.sound` audio, paired with a hardware-free multi-rate signal simulator (`EEGSimulator`) that populates the same `window.eegData` API for off-lab prototyping and classroom use.

The environment integrates a Monaco code editor, a `153`-item click-to-insert Reference Drawer across `30` topic groups and `5` tabs, and a Visual Catalogue of `234` runnable sketches across `21` categories. Deterministic simulation benchmarks across six-panel methodological evaluations illustrate core signal-conditioning behavior and address key technical questions in portable neurophysiology:
1. **Audio Sonification & Periodic/Aperiodic Spectral Decomposition:** Multi-band Chowning FM synthesis paired with log-log power spectral density modeling that separates narrowband periodic alpha oscillations ($+8.5\text{ dB}$ vs. $+2.4\text{ dB}$ above the $1/f^{\chi}$ background) from shifts in the broadband $1/f^{\chi}$ aperiodic exponent ($\chi = 1.41$ vs. $1.07$).
2. **Online ERP Averaging, Frame-Jitter Transfer, & Latency Extraction:** Online 256 Hz ERP trial averaging reduces background noise across 20 trials ($17.4 \rightarrow 2.7\ \mu\text{V}$, Standardized Measurement Error $5.6 \rightarrow 1.2\ \mu\text{V}$), exponential moving-average smoothing reduces control jitter by $98.4\%$, and frequency-domain $\text{sinc}$ transfer modeling ($W = 16.7, 30,$ and $45\text{ ms}$) paired with 1,000-run Monte Carlo latency benchmarks demonstrates that 50% fractional-area latency ($\text{SD} = 10.4\text{ ms}$) and dynamic Gaussian template matching ($\text{SD} = 13.4\text{ ms}$) reduce P300 latency error nearly threefold compared with peak picking ($\text{SD} = 31.5\text{ ms}$).
3. **Short-Channel Optical fNIRS Regression & Heartbeat-Evoked Potentials:** Dual-distance $8\text{ mm}/20\text{ mm}$ short-channel optical regression suppresses superficial skin pulse artifacts by $20.1\text{ dB}$, while forehead PPG-locked Heartbeat-Evoked Potential (HEP) averaging ($K = 60$ beats, peak $4.27\ \mu\text{V}$, $\text{SME} = 0.79\ \mu\text{V}$) exceeds a 500-permutation surrogate pseudotrial null distribution ($p = 0.0200$).
4. **Adaptive 6-Axis IMU Motion Filtering Across Viscoelastic Lags:** Instantaneous 6-weight NLMS filtering suppresses synchronous head-movement EEG artifacts by $19.2\text{ dB}$, while a 4-tap-per-axis (24-weight) delayed FIR NLMS extension preserves $11.0\text{ dB}$ suppression under $31.3\text{ ms}$ mechanical electrode-skin settling lag ($+8.6\text{ dB}$ over instantaneous filtering).

In an upper-level cognitive neuroscience laboratory course (`PSYCH 403`, $N = 69$ examination projects from $N_{\text{students}} = 30$ learners), students expanded introductory templates into complete closed-loop neurofeedback games ($N = 40$) and 4-channel ERP tasks ($N = 29$), with every Cohort 2 submission exceeding the 85-line `epochs.js` template ($W = 435.0, p = 1.86 \times 10^{-9}$).

### Suggested Action Editors (*Behavior Research Methods* Associate Editors)
- **Dr. Joshua R. de Leeuw** (Vassar College) — Creator of `jsPsych` and `DataPipe`; expert in browser-based behavioral instrumentation, JavaScript timing, and simulation-driven experiment building.
- **Dr. Anna-Lena Schubert** (University of Mainz) — Expert in EEG/ERP psychometrics, P300 latency extraction, multiverse reliability, and neurocognitive methods.
- **Dr. Roy de Kleijn** (Leiden University) — Expert in EEG oscillatory dynamics, human–machine control, and psychophysiological methods.
- **Dr. Steven R. Livingstone** (University of Ottawa) — Expert in auditory/musical psychophysiology, multimodal affective datasets (RAVDESS), and acoustic synthesis.
- **Dr. Andy T. Woods** (Royal Holloway, University of London) — Expert in browser-based perception and behavioral experimentation.

### Suggested Peer Reviewers (Conflict-of-Interest Free)
- **Dr. Dominique Makowski** (University of Sussex; *BRM* Consulting Editor) — Lead developer of `NeuroKit2`; expert in EEG, PPG, and HEP neurophysiological signal processing.
- **Dr. Michael D. Nunez** (University of Amsterdam; *BRM* Consulting Editor) — Expert in EEG/ERP signal processing and joint neurocognitive modeling.
- **Dr. Edwin S. Dalmaijer** (University of Bristol; *BRM* Consulting Editor) — Expert in browser timing precision and open-source JavaScript experimental instrumentation.
- **Dr. Thomas Pronk** ( Tilburg University / Amsterdam UMC; *BRM* Consulting Editor) — Expert in JavaScript mental chronometry and browser display/input timing.
- **Dr. Cédric Cannard** (Centre de Recherche Cerveau et Cognition / Institute of Noetic Sciences) — Lead developer of `BrainBeats`; expert in Muse headband validation and joint EEG–cardiovascular analysis.
- **Dr. Nienke E. R. van Bueren** (Radboud University / Maastricht University) — Expert in consumer-grade vs. research-grade EEG validation and $1/f$ aperiodic spectral analysis.
- **Dr. Gregory J. Gage** (Backyard Brains) — Expert in accessible undergraduate neuroscience education and classroom EEG/ERP laboratory exercises.

This manuscript has not been published elsewhere and is not under consideration by another journal. All source code, the live browser tool, the 234-sketch catalogue, Python `bleak` hardware diagnostic tools, and the automated manuscript verification script (`verify_manuscript_analyses.py`) are openly available at `https://github.com/kylemath/Brainimation` and `https://github.com/kylemath/eegeduPaper`. Classroom code artifacts were analyzed in de-identified form under University of Alberta Research Ethics Board Protocol `Pro00050069`. All authors have approved the manuscript and declare no competing interests.

Thank you for your time and consideration.

Sincerely,

Kyle E. Mathewson, Ph.D.  
Department of Psychology, Faculty of Science  
Neuroscience and Mental Health Institute, Faculty of Medicine and Dentistry  
University of Alberta, Edmonton, AB, T6G 2E9, Canada  
Email: `kyle.mathewson@ualberta.ca`
