November 14, 2026

Editorial Office  
*Behavior Research Methods*  
Springer Nature / Psychonomic Society

Dear Editors,

Please find enclosed our manuscript entitled **"BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors"** by Kyle E. Mathewson, Tamari Shalamberidze, and Claire J. Scavuzzo, submitted for consideration as an Original Article in *Behavior Research Methods*.

Rapid prototyping of closed-loop neurofeedback protocols, event-related potential (ERP) paradigms, and multimodal physiological displays with portable headbands typically requires installing operating-system Bluetooth utilities, network streaming layers (`LabStreamingLayer`), and desktop programming environments. BrainImation (`https://kylemath.github.io/Brainimation/`) eliminates this setup barrier by running entirely in a single webpage. A self-contained `37.4 KB` WebBluetooth client (`muse-browser.js`, `12.6x` smaller than legacy bundles) connects four generations of InteraXon Muse headbands—Muse 2016, Muse 2, Classic Muse S, and Muse S Athena (`p1042` 16-channel optical streaming with `730 nm + 850 nm` Modified Beer–Lambert forehead oxygenation)—directly to `p5.js` graphics and `p5.sound` audio, paired with a hardware-free multi-rate signal simulator (`EEGSimulator`) that populates the same `window.eegData` API for off-lab prototyping and classroom use.

The environment integrates a Monaco code editor, a `153`-item click-to-insert Reference Drawer across `30` topic groups and `5` tabs, and a Visual Catalogue of `234` runnable sketches across `21` categories. Deterministic simulation benchmarks demonstrate core signal-conditioning behavior: online ERP trial averaging reduces background noise across 20 trials ($17.4 \rightarrow 2.7\ \mu\text{V}$), exponential moving-average smoothing reduces control jitter by $98.4\%$, $8\text{ mm}/20\text{ mm}$ short-channel optical regression suppresses superficial skin pulse artifacts by $20.1\text{ dB}$, and 6-tap adaptive IMU filtering suppresses head-movement EEG artifacts by $19.2\text{ dB}$. In an upper-level cognitive neuroscience laboratory course (`PSYCH 403`, $N = 69$ examination projects from $N_{\text{students}} = 30$ learners), students expanded introductory templates into complete closed-loop neurofeedback games ($N = 40$) and 4-channel ERP tasks ($N = 29$), with every Cohort 2 submission exceeding the 85-line `epochs.js` template ($W = 435.0, p = 1.86 \times 10^{-9}$).

This manuscript has not been published elsewhere and is not under consideration by another journal. All source code, the live browser tool, the 234-sketch catalogue, Python `bleak` hardware diagnostic tools, and the automated manuscript verification script (`verify_manuscript_analyses.py`) are openly available at `https://github.com/kylemath/Brainimation` and `https://github.com/kylemath/eegeduPaper`. Classroom code artifacts were analyzed in de-identified form under University of Alberta Research Ethics Board Protocol `Pro00050069`. All authors have approved the manuscript and declare no competing interests.

Thank you for your time and consideration.

Sincerely,

Kyle E. Mathewson, Ph.D.  
Department of Psychology, Faculty of Science  
Neuroscience and Mental Health Institute, Faculty of Medicine and Dentistry  
University of Alberta, Edmonton, AB, T6G 2E9, Canada  
Email: `kyle.mathewson@ualberta.ca`
