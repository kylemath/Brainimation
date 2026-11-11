# Cover Letter — *Journal of Neuroscience Methods* (Elsevier)

**Date:** November 9, 2026

**To:**  
Editorial Board  
*Journal of Neuroscience Methods*  
Elsevier

**Subject:** Manuscript Submission — *"BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors"*

Dear Editors of *Journal of Neuroscience Methods*,

I am pleased to submit our manuscript entitled **"BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors"** for consideration for publication as a Research Article in *Journal of Neuroscience Methods*.

### Summary of Scope

*Journal of Neuroscience Methods* has served as an important venue for accessible and open-source electrophysiological teaching and recording tools—including our laboratory's earlier work running portable EEG experiments on Raspberry Pi and LattePanda computers (Kuziek, Shienh, & Mathewson, 2017, *J. Neurosci. Methods*; Kuziek, Redman, Splinter, & Mathewson, 2018, *J. Neurosci. Methods*) as well as open-source analysis toolboxes (Delorme & Makeig, 2004, *J. Neurosci. Methods*).

In undergraduate neuroscience, psychology, and media-arts courses, teaching students to build interactive brain–computer interfaces (BCIs), audio sonifications, optical blood-flow displays, or event-related potential (ERP) tasks with portable headbands is often slowed down by software setup. Students typically have to install separate Bluetooth utilities, network streaming sockets (`LabStreamingLayer`), and desktop scripts before they can run a simple experiment. In addition, older browser WebBluetooth libraries fail to connect to newer Muse 2, Classic Muse S, and Muse S Athena headsets.

In this manuscript, we describe **BrainImation** (`https://kylemath.github.io/Brainimation/`), a browser-based teaching environment that connects four generations of InteraXon Muse headbands (Muse 2016, Muse 2, Classic Muse S, and Muse S Athena) directly to the `p5.js` graphics and `p5.sound` audio libraries in a single webpage. First, a built-in WebBluetooth script connects to both Classic Muse and Muse S Athena headbands without external software and pairs with a built-in signal simulator so students can write and test code on their own laptops without hardware. Second, all signals are organized into a shared `eegData` object covering EEG frequency bands, 256 Hz raw traces, 64 Hz forehead optical pulse and blood oxygenation (PPG/fNIRS with $8\text{ mm}$ vs. $20\text{ mm}$ short-channel skin regression), and 52 Hz 3D head motion (with adaptive EEG motion artifact filtering). Third, the environment includes a 148-item click-to-insert reference drawer and a visual catalogue of 226 runnable example and student sketches across 18 categories. We also report a classroom evaluation of $N = 69$ examination projects written by $N_{\text{students}} = 30$ undergraduate students in an upper-level cognitive neuroscience laboratory course (`PSYCH 403`).

### Companion Manuscript & Ethics Disclosure

A companion paper describing a separate guided dashboard application (`EEGEdu`, `https://eegedu.com`) for introductory time-domain ECG and spectral alpha observation is cited in the manuscript, archived on *PsyArXiv* (Mathewson, 2026), and submitted separately to *Psychophysiology*. All empirical student code metrics were analyzed in de-identified form under University of Alberta Research Ethics Board approval (`Protocol Pro00050069`). The live teaching environment (`https://kylemath.github.io/Brainimation/`), source repository (`https://github.com/kylemath/Brainimation`), and analysis scripts (`https://github.com/kylemath/eegeduPaper`) are openly archived.

### Suggested Reviewers

- **Dr. Arnaud Delorme** (UC San Diego / SCCN & CNRS; `adelorme@ucsd.edu`) — Co-creator of EEGLAB and expert in wearable Muse EEG software and signal processing.
- **Dr. Fabien Lotte** (Inria Bordeaux Sud-Ouest; `fabien.lotte@inria.fr`) — Authority on closed-loop BCI human training protocols, neurofeedback design, and BCI education.
- **Dr. Felix Scholkmann** (University Hospital Zurich / University of Bern; `felix.scholkmann@usz.ch`) — Authority on functional near-infrared spectroscopy (fNIRS), Modified Beer–Lambert Law modeling, and short-channel superficial regression.
- **Dr. Joshua R. de Leeuw** (Vassar College; `jdeleeuw@vassar.edu`) — Creator of `jsPsych` and expert in browser-based JavaScript tools for psychology and neuroscience education.

Thank you for considering our manuscript for *Journal of Neuroscience Methods*.

Sincerely,

**Kyle E. Mathewson, Ph.D.** (Corresponding Author; `kyle.mathewson@ualberta.ca`)  
Associate Professor, Department of Psychology & Neuroscience and Mental Health Institute  
University of Alberta, Edmonton, AB, Canada  

**Tamari Shalamberidze** (`shalambe@ualberta.ca`)  
Neuroscience and Mental Health Institute  
University of Alberta, Edmonton, AB, Canada  

**Claire J. Scavuzzo, Ph.D.** (`scavuzzo@ualberta.ca`)  
Department of Psychology, Faculty of Science  
University of Alberta, Edmonton, AB, Canada
