# BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors

**Kyle E. Mathewson**$^{a,b,*}$, **Tamari Shalamberidze**$^{b}$, **Claire J. Scavuzzo**$^{a}$  
$^a$Department of Psychology, Faculty of Science, University of Alberta, Edmonton, AB, T6G 2E9, Canada  
$^b$Neuroscience and Mental Health Institute, University of Alberta, Edmonton, AB, T6G 2E1, Canada  
$^*$Correspondence: `kyle.mathewson@ualberta.ca` $\cdot$ `shalambe@ualberta.ca` $\cdot$ `scavuzzo@ualberta.ca`  
Live Tool: https://kylemath.github.io/Brainimation/ $\cdot$ Repository: https://github.com/kylemath/Brainimation

---

## Abstract (*Behavior Research Methods*)

We present BrainImation (https://kylemath.github.io/Brainimation/), a free, zero-install browser environment designed for neuroscience and psychology educators, students, and researchers that connects four generations of InteraXon Muse headbands—Muse 2016, Muse 2, Classic Muse S, and Muse S Athena—directly to interactive graphics and audio synthesis in a single webpage (`p5.js`, `p5.sound`). To eliminate operating-system driver and software-installation barriers in university courses, a built-in WebBluetooth client pairs with a hardware-free signal simulator to populate a single shared signal object providing filtered and raw 4-channel EEG, frequency-band powers, forehead optical pulse and blood oxygenation (PPG/fNIRS), and 3D head motion, supported by a visual catalogue of runnable examples and a click-to-insert API reference drawer (37.4 KB client, 12.6$\times$ smaller than legacy bundles; 234 sketches across 21 categories, starting from 7 one-sensor starters/diagnostics and 36 core scaffolds of median 32 lines of code [LOC]; 153 reference items). Deterministic simulation benchmarks illustrate four core teaching modules and address key methodological questions in portable neurophysiology: converting EEG rhythms into frequency-modulated sound while separating periodic alpha peaks from the $1/f^{\chi}$ aperiodic background spectrum, extracting event-related potentials (ERPs) via multi-trial averaging, blink rejection, and fractional-area or template-matching latency estimation under browser frame jitter, separating deeper prefrontal blood-oxygen responses from superficial skin pulse via short-channel optical regression and validating forehead PPG-locked heartbeat-evoked potentials against surrogate pseudotrial nulls, and removing head-movement artifacts from EEG via instantaneous and multi-tap delayed adaptive motion filtering ($\sigma_{\text{noise}}: 17.4 \rightarrow 2.7\ \mu\text{V}$ over 20 trials; $98.4\%$ control-jitter reduction; $20.1\text{ dB}$ superficial pulse suppression; $19.2\text{ dB}$ motion-artifact attenuation). In an upper-level undergraduate cognitive neuroscience laboratory course, students with minimal prior coding experience expanded the short starter templates into complete closed-loop neurofeedback games and 4-channel ERP experiments ($N = 69$ graded examination projects from $N_{\text{students}} = 30$ learners, median 155 LOC; per-student clustered $\text{median} = 164\text{ LOC}$, $p < 10^{-11}$; Cohort 1 $N = 40$, Cohort 2 $N = 29$).

**Keywords:** electroencephalography (EEG); functional near-infrared spectroscopy (fNIRS); photoplethysmography (PPG); brain–computer interface (BCI); event-related potential (ERP); neuroscience and psychology education

\newpage

## Manuscript Outline

- **[1. Introduction](#1-introduction)**
  - [1.1 Classroom & Research Motivation](#11-classroom--research-motivation)
    - [1.1.1 Closed-Loop BCIs & Neurofeedback](#111-closed-loop-bcis--neurofeedback)
    - [1.1.2 Headbands vs. Pre-Built Dashboards](#112-headbands-vs-pre-built-dashboards)
  - [1.2 Constructionist Design & Setup Barriers](#12-constructionist-design--setup-barriers)
    - [1.2.1 Constructionist Design Goals](#121-constructionist-design-goals)
    - [1.2.2 Eliminating Desktop Dependencies](#122-eliminating-desktop-dependencies)
    - [1.2.3 Classroom Neuroimaging Lessons](#123-classroom-neuroimaging-lessons)
  - [1.3 BrainImation Overview & Minimal Example](#13-brainimation-overview--minimal-example)
    - [1.3.1 Browser-Native Hardware & Simulator](#131-browser-native-hardware--simulator)
    - [1.3.2 11-Line Neurofeedback](#132-11-line-neurofeedback)
- **[2. Browser Hardware & Simulation](#2-browser-hardware--simulation)**
  - [2.1 Multi-Generation Muse Client](#21-multi-generation-muse-client)
  - [2.2 Shared Signal State & Simulator](#22-shared-signal-state--simulator)
- **[3. IDE Supports & Visual Catalogue](#3-ide-supports--visual-catalogue)**
  - [3.1 Autocomplete & Reference Drawer](#31-autocomplete--reference-drawer)
  - [3.2 234-Sketch Visual Catalogue](#32-234-sketch-visual-catalogue)
- **[4. Core Teaching Modules](#4-core-teaching-modules)**
  - [4.1 Audio Sonification](#41-audio-sonification)
    - [4.1.1 EEG-to-FM Parameter Mapping](#411-eeg-to-fm-parameter-mapping)
    - [4.1.2 Relaxed vs. Engaged Spectra](#412-relaxed-vs-engaged-spectra)
    - [4.1.3 Periodic vs. Aperiodic Spectra](#413-periodic-vs-aperiodic-spectra)
  - [4.2 Online ERP Averaging](#42-online-erp-averaging)
    - [4.2.1 Forehead Reference & Polarity](#421-forehead-reference--polarity)
    - [4.2.2 Epoch Extraction & Blink Rejection](#422-epoch-extraction--blink-rejection)
    - [4.2.3 $\sqrt{K}$ Scaling, SME, & Hysteresis](#423-sqrtk-scaling-sme--hysteresis)
    - [4.2.4 Frame Jitter & Latency](#424-frame-jitter--latency)
  - [4.3 Optical PPG/fNIRS Regression](#43-optical-ppgfnirs-regression)
    - [4.3.1 Beer–Lambert Contrast & Depth](#431-beerlambert-contrast--depth)
    - [4.3.2 Short-Channel Skin Regression](#432-short-channel-skin-regression)
    - [4.3.3 Heartbeat Potentials & Surrogates](#433-heartbeat-potentials--surrogates)
  - [4.4 Head Motion & NLMS Filtering](#44-head-motion--nlms-filtering)
    - [4.4.1 6-DOF Kinematics Integration](#441-6-dof-kinematics-integration)
    - [4.4.2 6-Tap NLMS Motion Filter](#442-6-tap-nlms-motion-filter)
    - [4.4.3 Viscoelastic Delay & Multi-Tap](#443-viscoelastic-delay--multi-tap)
- **[5. Classroom Evaluation](#5-classroom-evaluation)**
  - [5.1 Course Context & Workflow](#51-course-context--workflow)
    - [5.1.1 Participant Pool & Ethics](#511-participant-pool--ethics)
    - [5.1.2 Lab-to-Home-to-Lab Cycle](#512-lab-to-home-to-lab-cycle)
    - [5.1.3 Two-Cohort Exam Structure](#513-two-cohort-exam-structure)
  - [5.2 Code Complexity & Scaffold Expansion](#52-code-complexity--scaffold-expansion)
    - [5.2.1 Executable LOC Metric & Clustering](#521-executable-loc-metric--clustering)
    - [5.2.2 Cohort 1 & Cohort 2 Exemplars](#522-cohort-1--cohort-2-exemplars)
    - [5.2.3 Template Expansion Test](#523-template-expansion-test)
  - [5.3 Disaggregated Feature Adoption](#53-disaggregated-feature-adoption)
    - [5.3.1 Signal Conditioning](#531-signal-conditioning)
    - [5.3.2 Cohort 1 Frequency-Band Usage](#532-cohort-1-frequency-band-usage)
    - [5.3.3 Cohort 2 Buffer Usage](#533-cohort-2-buffer-usage)
    - [5.3.4 Archival Preservation](#534-archival-preservation)
- **[6. Discussion](#6-discussion)**
  - [6.1 Pedagogical & Research Synthesis](#61-pedagogical--research-synthesis)
    - [6.1.1 From Dashboards to Creative Coding](#611-from-dashboards-to-creative-coding)
    - [6.1.2 Zero-Install Lab & Off-Lab Workflow](#612-zero-install-lab--off-lab-workflow)
  - [6.2 Technical & Methodological Limitations](#62-technical--methodological-limitations)
    - [6.2.1 Synthetic Benchmarks vs. Clinical Validation](#621-synthetic-benchmarks-vs-clinical-validation)
    - [6.2.2 WebBluetooth & 60 Hz Jitter](#622-webbluetooth--60-hz-jitter)
    - [6.2.3 Dry-Sensor Artifacts & NLMS Bounds](#623-dry-sensor-artifacts--nlms-bounds)
    - [6.2.4 Browser Compatibility](#624-browser-compatibility)
    - [6.2.5 Classroom Evaluation Scope](#625-classroom-evaluation-scope)
- **[Declarations & References](#declarations)**

\newpage

## 1. Introduction

### 1.1 Classroom & Research Motivation

#### 1.1.1 Closed-Loop BCIs & Neurofeedback
Closed-loop brain–computer interfaces (BCIs) and neurofeedback systems translate ongoing brain, cardiac, and movement signals into real-time visual or auditory feedback, allowing participants to observe internal physiological states or control interactive displays (Sitaram et al., 2017; Enriquez-Geppert et al., 2017; Lotte et al., 2013). For university lecturers in neuroscience and psychology, giving students the ability to record and respond to live physiological signals in the classroom turns abstract textbook topics—such as oscillatory brain rhythms, phasic alertness and cognitive control (de Kleijn et al., 2023, 2025), sensory and cognitive evoked potentials, neurovascular coupling, and movement artifacts—into concrete, hands-on experiments (Mathewson, 2024; Miranda & Castet, 2014; Janssen et al., 2021).

#### 1.1.2 Headbands vs. Pre-Built Dashboards
Over the past two decades, open-source analysis toolboxes (Delorme & Makeig, 2004; Makowski et al., 2021; Cannard et al., 2024), affordable dry-electrode EEG headbands, and portable computing hardware have made it practical to record human brain activity in undergraduate teaching laboratories and naturalistic settings rather than electrically shielded research suites (Krigolson et al., 2017; Mathewson et al., 2017; Kuziek et al., 2017, 2018; Cannard et al., 2021; Sabio et al., 2024; van Bueren et al., 2026). In parallel, browser-based teaching dashboards such as *EEGEdu* (https://eegedu.com; Mathewson, 2026) allow instructors to demonstrate live brain waves, frequency spectra, and event-related averages through ready-made interactive charts. Once students grasp those foundational displays, however, a natural instructional challenge arises: how can neuroscience and psychology educators help students with little or no programming experience move from passively viewing pre-built graphs to designing and coding their own closed-loop neurofeedback tasks, auditory sonifications, prefrontal blood-oxygen visualizers, and event-related potential (ERP) experiments?

> **Figure 1 (`figures/fig1_brainimation_ide_architecture.pdf`):** **BrainImation Classroom Coding Environment and 21-Category Visual Catalogue (234 Sketches).** **(A)** Overview of the browser workflow: a built-in WebBluetooth client for Muse 2016, Muse 2, Classic Muse S, and Muse S Athena headbands pairs with a hardware-free signal simulator to populate a shared signal object (EEG, optical PPG/fNIRS, and 6-axis head motion; `eegData`), which drives user sketches in the split-screen code editor at 60 FPS. **(B)** The BrainImation browser interface with the Visual Catalogue open. **(C)** Summary of the 234 teaching examples and student projects organized across 21 categories.

### 1.2 Constructionist Design & Setup Barriers

#### 1.2.1 Constructionist Design Goals
Widely adopted creative-coding and behavioral-science platforms such as `Processing` (Reas & Fry, 2007), `Scratch` (Resnick et al., 2009), `p5.js` (McCarthy et al., 2015), `jsPsych` (de Leeuw, 2015; de Leeuw et al., 2023; de Leeuw, 2024), and `lab.js` (Henninger et al., 2022) follow a constructionist learning philosophy (Papert, 1980): students learn computational and scientific methods most effectively when an environment combines a "low floor" (allowing beginners to run a meaningful first program within minutes), a "high ceiling" (supporting full multi-condition laboratory experiments as skills grow), and "wide walls" (accommodating diverse student projects across cognitive neuroscience, experimental psychology, biofeedback games, and media art). In behavioral and perception research, browser-based toolkits have transformed how instructors and investigators build online tasks (Woods et al., 2015), measure visual attention via cursor-aperture tracking (Anwyl-Irvine et al., 2022), estimate psychometric thresholds (Kuroki & Pronk, 2023), stream born-open behavioral datasets (de Leeuw, 2024), and simulate synthetic participant behavior so researchers and students can verify experimental logic and analysis pipelines before testing human participants (de Leeuw et al., 2023).

#### 1.2.2 Eliminating Desktop Dependencies
Extending that same zero-install browser workflow to live physiological recording has historically been difficult. In research laboratories, multimodal synchronization and physiological preprocessing are well served by desktop middleware such as the Lab Streaming Layer (Kothe et al., 2025), mobile brain/body imaging pipelines (Klug et al., 2022), Python neurophysiological toolboxes such as `NeuroKit2` (Makowski et al., 2021), EEGLAB cardiovascular plugins such as `BrainBeats` (Cannard et al., 2024), and synchronous multimodal web viewers (Pijálek et al., 2026). In an undergraduate classroom, however, even a simple live exercise—such as scaling the size of a circle on screen with alpha band power ($8\text{--}12\text{ Hz}$), forehead blood oxygenation, or head tilt—typically requires installing an operating-system Bluetooth utility, streaming data over a local network socket, running a background Python or MATLAB script to filter and epoch the data, and forwarding values to a separate display window. Troubleshooting operating-system permissions, package versions, and broken network streams across dozens of student laptops routinely consumes entire laboratory periods before students can engage with the neuroscience itself.

#### 1.2.3 Classroom Neuroimaging Lessons
Recent pedagogical work in undergraduate neuroscience education has underscored both the enthusiasm students bring to live physiological recording and the value of structured coding scaffolds (Janssen et al., 2021; Hatton et al., 2023; Smith et al., 2024; Iemi et al., 2026). For example, Hatton et al. (2023) showed that pairing qualitative wave inspection with quantitative spectral analysis across consumer and teaching EEG setups deepens students' conceptual understanding of both introductory and advanced neurophysiology, while Smith et al. (2024) designed accessible classroom and laboratory exercises that guide undergraduates through both continuous brain rhythms and event-related potentials on low-cost hardware. Complementing hardware laboratories, Iemi et al. (2026) demonstrated through their "I Can Code" workshop that introducing neuroscience students to programming within the direct context of brain data substantially boosts coding self-efficacy, and Clin Deffarges et al. (2026) recently used wearable brain sensing to compare Socratic questioning against direct AI instruction during interactive learning. BrainImation builds directly on these educational advances by uniting live multi-generation headband streaming, hardware-free simulation (de Leeuw et al., 2023), and scaffolded creative coding inside a single browser tab.

### 1.3 BrainImation Overview & Minimal Example

#### 1.3.1 Browser-Native Hardware & Simulator
To provide a zero-install starting point for both neuroscience and psychology instruction and rapid research prototyping, we developed BrainImation (https://github.com/kylemath/Brainimation), a browser-based coding environment that connects four generations of InteraXon Muse headbands—Muse 2016, Muse 2, Classic Muse S, and Muse S Athena—directly to live graphics and Web Audio synthesis inside a single webpage (McCarthy et al., 2015; **Figure 1**; `p5.js`, `p5.sound`).

#### 1.3.2 11-Line Neurofeedback
By opening a single web link in a Chromium browser, an instructor or student can pair a physical Muse headband (Krigolson et al., 2017; Kuziek et al., 2017, 2018; Sabio et al., 2024)—or click the built-in signal simulator button in any browser when working at home without hardware (de Leeuw et al., 2023)—and run a complete closed-loop neurofeedback animation in just 11 lines of JavaScript (`examples/basic.js`):

```javascript
function setup() {
  colorMode(HSB, 360, 100, 100);
}
function draw() {
  background(0, 0, 10);
  let size = map(eegData.alpha, 0, 1, 50, 300);
  let hue = map(eegData.attention, 0, 1, 180, 360);
  fill(hue, 80, 90);
  noStroke();
  ellipse(width/2, height/2, size, size);
}
```

The remainder of this paper explains how BrainImation is organized and how it can be used in neuroscience and psychology courses. Section 2 describes how the built-in Bluetooth client connects all four Muse headset generations and how live and simulated streams converge into a single shared signal object. Section 3 presents the classroom coding supports, including the 153-item Reference Drawer and the 234-sketch Visual Catalogue across 21 categories. Section 4 walks through four core teaching modules—audio sonification and periodic/aperiodic spectral parameterization, online ERP trial averaging and latency extraction under browser frame jitter, optical fNIRS short-channel skin regression and heartbeat-evoked potential validation, and 3D head-motion integration with instantaneous and multi-tap adaptive artifact filtering—pairing readable JavaScript examples with simulation benchmarks that illustrate why each signal-processing step is needed. Finally, Section 5 evaluates $N = 69$ examination projects authored by $N_{\text{students}} = 30$ undergraduate students in an upper-level cognitive neuroscience laboratory course, and Section 6 discusses practical guidelines and limitations for classroom and laboratory adoption.

---

## 2. Browser Hardware & Simulation

### 2.1 Multi-Generation Muse Client
University neuroscience and psychology teaching laboratories commonly maintain mixed fleets of older and newer headbands purchased across several academic years (Hatton et al., 2023; Sabio et al., 2024). A major practical obstacle for browser-based instruction is that older WebBluetooth libraries only connect reliably to the original Muse 2016 headband (`muse-js`): they fail during connection on Muse 2 and Classic Muse S headsets, which require an explicit wake-up command before turning on their sensor streams, and they cannot decode the newer Muse S Athena, which packs all of its sensors into a single combined data stream. To let students and instructors pair whichever headband is on the lab bench without installing external software, BrainImation includes a compact, self-contained WebBluetooth client (**Table 1**; 37.4 KB, 12.6$\times$ smaller than legacy bundles; `muse-browser.js`).

| Feature | Desktop LSL (`muselsl`+Py) | Legacy `muse-js` (v3.0) | **BrainImation (`muse-browser.js`)** |
| :--- | :--- | :--- | :--- |
| **Setup Required** | OS BLE + Python + LSL | $473.0\text{ KB}$ (`RxJS` bundle) | **$37.4\text{ KB}$ (No install, $12.6\times$ smaller)** |
| **Connection Flow** | Native desktop app | Single-step (fails on Muse 2/S) | **Two-Step Wake-Up + Athena Decoder** |
| **Muse 2016** | Supported | Supported (EEG only) | **Supported (EEG, IMU, Battery)** |
| **Muse 2 / Classic S** | OS-dependent | Fails to connect | **Supported (EEG, 3-Ch PPG, IMU)** |
| **Muse S Athena** | Unsupported | Unsupported | **Supported (EEG, Dual-Distance PPG/fNIRS, IMU, DRL/REF)** |
| **Built-In Simulator** | None (Hardware req.) | Single-channel demo | **4-Ch EEG + Dual-Distance PPG/fNIRS + 3D Head Motion** |

When a user clicks the Bluetooth button in the top toolbar, the client automatically detects whether the paired headband is a Classic Muse (Muse 2016, Muse 2, or Classic Muse S) or a Muse S Athena. For Classic Muse headsets, the client first opens the control channel, sends a preset command and a start command to wake up the onboard sensors, and then subscribes to the separate EEG, forehead optical pulse (PPG), motion (accelerometer and gyroscope), and battery streams. For the Muse S Athena, the client subscribes to the headset's combined stream and unpacks the tagged sensor packets for 4- or 8-channel EEG, multi-wavelength 16-channel forehead optical readings (verified via hardware diagnostic scripts as Red $660\text{ nm}$, Ambient, Near-Infrared $730\text{ nm}$, and Infrared $850\text{ nm}$ light across short $8\text{ mm}$ and long $20\text{ mm}$ source–detector spacings; `tools/`), 6-axis head motion, forehead reference voltages, and battery level. The top toolbar also provides a one-click optical toggle button so instructors and students can turn the forehead optical sensors on during blood-flow and fNIRS lessons or switch the LEDs off during EEG-only exercises (`muse.setPPGMode(enabled)`; presets `p1042`/`p50` vs. `p1035`/`p21`):

```javascript
// Simplified two-step connection flow in muse-browser.js
// Step 1: Connect control channel first, then wake up sensor streams
this.controlChar = await this.service.getCharacteristic(CONTROL_CHAR_UUID);
await this.sendCommand('h');      // Halt previous stream
await this.sendCommand(preset);   // 'p50' (Classic EEG+PPG) or 'p1042' (Athena 16-ch optics)
await this.sendCommand('s');      // Start streaming so sensor channels appear
await this.delay(500);

// Step 2: Subscribe to Classic Muse channels or Muse S Athena combined stream (273e0013)
const chars = await this.service.getCharacteristics();
if (chars.some(c => c.uuid.includes('273e0013'))) {
  athenaChar.addEventListener('characteristicvaluechanged', e => this.parseAthenaNotification(e));
} else {
  this.bindClassicMuseStreams(chars); // EEG (256 Hz), PPG (64 Hz), IMU (52 Hz), Telemetry
}
```

### 2.2 Shared Signal State & Simulator
A core pedagogical design principle of BrainImation is that student code should run identically whether driven by a physical headband in the teaching lab or by the built-in signal simulator on a personal laptop at home (de Leeuw et al., 2023). Both the Bluetooth client and the simulator write their live values into the same shared signal object, which organizes real-time measurements into five intuitive sensor groups accessible inside the main animation loop (`EEGSimulator`; `window.eegData`; `draw()`).

For frequency-band neurofeedback, the shared signal object provides continuous power estimates scaled between $0.0$ and $1.0$ across the five standard EEG frequency bands: delta ($1\text{--}4\text{ Hz}$), theta ($4\text{--}8\text{ Hz}$), alpha ($8\text{--}12\text{ Hz}$), beta ($13\text{--}30\text{ Hz}$), and gamma ($30\text{--}50\text{ Hz}$). Each band is available both as a whole-head average and individually across the two behind-the-ear temporal electrodes and two forehead electrodes (`TP9`, `AF7`, `AF8`, `TP10`). During live headband recordings, the incoming 256 Hz EEG signal first passes through an automatic filter chain that removes electrical wall-outlet hum ($60\text{ Hz}$ or $50\text{ Hz}$ notch filter) and slow baseline drift caused by forehead perspiration or subtle posture shifts ($0.5\text{ Hz}$ high-pass filter; `eegData.lineFilter`). Band powers are then updated from 1-second (256-sample) sliding Fourier windows while automatically skipping 1-second windows that contain large $>150\ \mu\text{V}$ eye-blink or jaw-clench spikes so band readings remain stable (`MuseEEGManager.calculateFrequencyBands`; Cannard et al., 2021). For cognitive state monitoring and time-locked ERP experiments, the shared signal object provides summary attention and meditation scores in $[0.0, 1.0]$ alongside 256 Hz microvolt sample buffers, clean-sample counters, epoch extraction helpers, and a one-click spreadsheet export function for offline statistical analysis or joint neurocognitive modeling in Python or R (`raw`, `cleanCount`, `getRawChannel(ch, N)`, `getRecentEpoch(N)`, `downloadCSV()`; Makowski et al., 2021; Nunez et al., 2024; Frischkorn & Schubert, 2018).

Beyond electrical brain waves, the shared signal object provides forehead optical blood-flow measures, 3D head movement, and headset contact diagnostics. For cardiovascular and prefrontal optical imaging (64 Hz PPG and fNIRS; Wyser et al., 2020; Russo et al., 2025; Cannard et al., 2024), it supplies the arterial pulse wave, heart rate in beats per minute, shallow short-channel ($8\text{ mm}$) and deeper long-channel ($20\text{ mm}$) forehead light intensities, and continuous estimates of relative oxygenated and deoxygenated hemoglobin ($\Delta[\text{HbO}_2]$, $\Delta[\text{HHb}]$, $\text{SpO}_2$; `ppgPulse`, `heartRate`, `ppgShort`, `ppgLong`, `fnirsRegression`). For movement interaction and artifact removal (52 Hz 6-axis motion sensors; Rosanne et al., 2021; Klug et al., 2022), it supplies 3-axis accelerometer and gyroscope readings, 3D head tilt angles (pitch, roll, and yaw), head movement velocity, 3D head displacement, and motion-cleaned EEG traces (`accel`, `gyro`, `orientation`, `velocity`, `position`, `clean`). Finally, for classroom setup checks, it reports battery percentage, sensor temperature, forehead reference voltages, and per-electrode skin contact quality so students can verify that all four electrodes are making good skin contact before collecting data (`drlRef`, `contactQuality`).

When a user clicks the simulator button in the toolbar (**Figure 2B**), the built-in signal simulator generates realistic live streams across all five sensor groups simultaneously—including 256 Hz 4-channel EEG with spontaneous frontal eye blinks and event-locked N170/P300 responses, 64 Hz dual-distance forehead optical waves, and 52 Hz 3D head nodding and tilting—while providing interactive Attention and Meditation sliders in the sidebar so students can test state thresholds and debug their programs anywhere (de Leeuw et al., 2023).

> **Figure 2 (`figures/fig2_ide_scaffolding_and_corpus.pdf`):** **Classroom Coding Supports, Hardware-Free Simulation, and 21-Category Visual Catalogue Profile ($N = 234$ Sketches).** **(A)** Distribution of the 153 click-to-insert API entries across 30 groups and 5 reference tabs (*Sensors / IMU & PPG*: 53; *P5.js*: 38; *Input*: 27; *EEG Data*: 19; *Sound*: 16). **(B)** Two-second 4-channel simulated 256 Hz EEG traces showing ongoing oscillations and synchronous frontal eye blinks (`TP9`, `AF7`, `AF8`, `TP10` in `EEGSimulator`). **(C)** Executable lines of code across the 21 categories in the Visual Catalogue ($N = 234$ sketches, overall $\text{median} = 110\text{ LOC}$, range $11\text{--}1438\text{ LOC}$; bars show category median and lines span min–max range). **(D)** Percentage of the 234 catalogue sketches demonstrating each sensor and multimedia capability: alpha ($56.4\%$, $132/234$), beta ($41.0\%$, $96/234$), attention ($32.5\%$, $76/234$), theta ($32.1\%$, $75/234$), 256 Hz raw/ERP buffers ($18.8\%$, $44/234$), 52 Hz IMU motion ($16.7\%$, $39/234$), 64 Hz optical PPG/fNIRS ($8.1\%$, $19/234$), and Web Audio synthesis ($7.7\%$, $18/234$).

---

## 3. IDE Supports & Visual Catalogue

### 3.1 Autocomplete & Reference Drawer
Because most undergraduate neuroscience, psychology, and media-arts students enter the course with little or no programming background, the BrainImation editor includes several built-in supports designed to prevent syntax errors and lower coding anxiety (Iemi et al., 2026; **Figure 2A**). The left pane embeds the VS Code Monaco editor configured with custom autocomplete: as soon as a student types the shared signal object prefix, a pop-up menu lists the available brain, optical, and motion properties along with plain-English descriptions (`eegData.*`). Alongside the code editor, a collapsible right-hand Reference Drawer organizes 153 functions and variables across 5 topic tabs covering optical and motion sensors, 2D and 3D drawing functions, keyboard and mouse controls, EEG band and ERP buffer properties, and Web Audio synthesis tools, plus an optional AI tutor tab where students can paste an API key for Socratic or direct code explanations if permitted by the instructor (Clin Deffarges et al., 2026; **Figure 2A**). Clicking any entry in the Reference Drawer displays a short explanation of what the function does, and clicking it a second time inserts a ready-to-edit code snippet directly into the student's program at the cursor.

To streamline classroom troubleshooting, open data sharing (de Leeuw, 2024), and assignment grading, the top toolbar also includes an audio test button that plays a 1-second 440 Hz tone to unlock browser audio permissions, a quick-start guide, mobile fullscreen controls, and shareable web links that open a specific sketch automatically (`?sketch=`). Whenever a student clicks Run, the editor resets the graphics canvas and binds all drawing and audio functions automatically so standard introductory creative-coding tutorials work without extra boilerplate (`p5.js`, `p5.sound`).

### 3.2 234-Sketch Visual Catalogue
Rather than asking students or instructors to write code from a blank page, BrainImation provides a searchable Visual Catalogue containing 234 runnable sketches across 21 categories, each previewed with a visual thumbnail card (**Figure 1B,C** and **Figure 2C,D**; $\text{median} = 110\text{ LOC}$, range $11\text{--}1438\text{ LOC}$). The 21 categories are organized into six progressive learning tracks that guide users from short single-sensor examples to complete multimodal experiments and past student projects.

The first track pairs brief one-sensor starters and hardware check scripts with core creative-coding templates across ten foundational topics: getting started, brain wave visualizations, attention and meditation, particle systems, 3D geometry, interactive drawing, raw EEG waves, generative patterns, webcam motion, and sound synthesis (starters/diagnostics: $N = 7$, $\text{median} = 25\text{ LOC}$, range $21\text{--}135\text{ LOC}$; core scaffolds: $N = 36$, $\text{median} = 32\text{ LOC}$, range $11\text{--}111\text{ LOC}$). Students can open a 20–35 line template, see immediately how a single EEG rhythm changes screen color, particle speed, 3D rotation, or webcam effects, and begin experimenting by changing a few numbers.

The second track, the optical PPG and fNIRS studio, introduces forehead pulse and prefrontal blood-oxygen sensing through step-by-step visual lessons ($N = 11$, $\text{median} = 211\text{ LOC}$; Wyser et al., 2020; Russo et al., 2025). Sequential sketches progress from a simple heartbeat pulse ring and raw red/infrared light traces to oxygenated and deoxygenated hemoglobin curves, a visual walkthrough of the Modified Beer–Lambert Law (comparing $660\text{ nm}/850\text{ nm}$ on Classic Muse with $730\text{ nm}/850\text{ nm}$ on Muse S Athena, where $730\text{ nm}$ penetrates adult forehead tissue more effectively than $660\text{ nm}$ across the $20\text{ mm}$ spacing), an interactive 3D headband diagram comparing sensor layouts across headset generations, shallow ($8\text{ mm}$) versus deeper ($20\text{ mm}$) skin-pulse subtraction, and heart- or breath-paced biofeedback games.

The third track, the motion and diagnostics studio, applies the same step-by-step approach to the headband's 6-axis motion and status sensors ($N = 11$, $\text{median} = 215\text{ LOC}$; Rosanne et al., 2021; Klug et al., 2022). Individual lessons introduce the 3-axis accelerometer tilt meter, 3-axis gyroscope turn-rate display, 3D head pitch and roll horizon, battery and temperature gauges, and forehead electrode contact indicators, before showing how head acceleration integrates into velocity and 3D head position, how adaptive filtering subtracts head-movement artifacts from EEG, and how head tilt can steer musical instruments or 3D games.

The fourth track, the multimodal brain and heart studio, helps students compare physiological signals that unfold across three very different time scales ($N = 5$, $\text{median} = 120\text{ LOC}$; Makowski et al., 2021; Cannard et al., 2024; Steinfath et al., 2025): fast millisecond event-related EEG potentials ($50\text{--}800\text{ ms}$), second-by-second fluctuations in oscillatory EEG band power and beat-to-beat heart rate ($0.5\text{--}2\text{ s}$), and the slower $4\text{--}6\text{ s}$ rise and fall of prefrontal blood oxygenation ($\Delta[\text{HbO}_2]$ and $\Delta[\text{HHb}]$). In particular, the Heartbeat-Evoked Potential (HEP) lesson time-locks 256 Hz EEG epochs to the participant's own heartbeat peak detected by the forehead optical sensor rather than an external screen flash, providing an intuitive classroom demonstration of brain–heart interoception, internal event-locked averaging, and the pulse travel time from ventricular contraction in the heart to the forehead vasculature ($\sim 150\text{--}250\text{ ms}$ transit delay with $\sim 10\text{--}25\text{ ms}$ beat-to-beat variability).

The fifth track shows how these signal-processing building blocks come together inside complete interactive applications through closed-loop neurofeedback arcade games and ready-to-run laboratory modules ($N = 43$ sketches total). The arcade collection includes 14 playable games (such as *Golf Driving Range*, *Archery Range*, *Rowing Calm*, *Balance Beam*, and *Zen Breakout*) built on a shared smoothing and scoreboard engine ($\text{median} = 514\text{ LOC}$; `window.BGShared`), paired with 13 interactive curriculum lessons and 16 classic laboratory ports covering standard neuroscience paradigms such as oddball ERPs and steady-state visual evoked potentials with CSV spreadsheet export (Hatton et al., 2023; Smith et al., 2024).

The sixth track preserves two archival classroom galleries of playable student projects ($N = 121$ total: 95 submissions from the 2025 Neurotech cohort, $\text{median} = 149\text{ LOC}$; 26 projects from the 2022 NeuroArt cohort, $\text{median} = 43\text{ LOC}$). Including past student work directly inside the Visual Catalogue gives incoming students concrete, runnable examples of what peers with similar neuroscience and psychology backgrounds created in a single semester. Across all 234 catalogue sketches, continuous EEG band powers and attention/meditation indices are the most commonly used signals, followed by raw 256 Hz ERP buffers, 6-axis head motion, optical PPG/fNIRS blood-flow metrics, and Web Audio synthesis (**Figure 2D**).

> **Figure 3 (`figures/fig3_sonification_and_erp_engine.pdf`):** **Teaching Modules for Audio Sonification, Online 4-Channel ERP Averaging, Frame-Jitter Transfer, and Periodic/Aperiodic Spectra.** **(A)** Audio waveforms comparing a relaxed high-alpha state ($650\text{ Hz}$ smooth tone) against an active high-beta/theta state (`brainSynth.js`). **(B)** Corresponding audio frequency spectra showing a single dominant frequency during relaxation versus harmonic sidebands during active engagement (`p5.FFT`). **(C)** Online 256 Hz ERP trial averaging ($-200\text{ to }+800\text{ ms}$, positive-up voltage convention in $\mu\text{V}$, baseline-corrected over $-200\text{ to }0\text{ ms}$; Picton et al., 2000; Keil et al., 2014) across $K = 1, 5,$ and $20$ trials (`epochs.js`). Across 1,000 Monte Carlo runs, pre-stimulus baseline RMS noise scales by $1/\sqrt{K}$ ($13.8 \rightarrow 6.1 \rightarrow 3.1\ \mu\text{V}$); in the single realization shown, baseline RMS drops from $17.4\ \mu\text{V}$ ($\text{SNR} = 0.55$) to $5.7\ \mu\text{V}$ ($\text{SNR} = 1.66$) and $2.7\ \mu\text{V}$ ($\text{SNR} = 3.48$), while P300 Standardized Measurement Error ($\text{SME} = \text{SD}_{\text{trials}}/\sqrt{K}$; Luck et al., 2021) drops from $8.7 \rightarrow 3.6 \rightarrow 1.9\ \mu\text{V}$. Rejecting a single $115\ \mu\text{V}$ blink trial ($166.2\ \mu\text{V}$ peak-to-peak) eliminates $+6.7\ \mu\text{V}$ of P300 peak bias ($\text{RMSE}: 4.52 \rightarrow 3.33\ \mu\text{V}$, vs. $3.04\ \mu\text{V}$ blink-free). **(D)** Exponential moving-average smoothing and dual-threshold hysteresis used in student neurofeedback games to prevent rapid on/off flicker ($98.4\%$ jitter variance reduction). **(E)** Frequency-domain sinc transfer function $|H(f)| = |\text{sinc}(fW)|$ for browser/Bluetooth trigger jitter of $W = 16.7\text{ ms}$ (1 frame @ 60 FPS, $f_c = 26.6\text{ Hz}$), $30\text{ ms}$ ($f_c = 14.8\text{ Hz}$, null at $33.3\text{ Hz}$), and $45\text{ ms}$ ($f_c = 9.8\text{ Hz}$, null at $22.2\text{ Hz}$) overlaid on normalized spectral profiles of the P300 ($\sigma = 58\text{ ms}$), N170 ($\sigma = 26\text{ ms}$), and a narrow $20\text{ ms}$ FWHM peak; across 1,000 20-trial runs under $30\text{ ms}$ jitter, P300 latency SD drops from $31.5\text{ ms}$ (peak picking) to $13.4\text{ ms}$ (dynamic template matching; Schubert et al., 2026) and $10.4\text{ ms}$ (50% fractional-area latency; Schubert et al., 2024). **(F)** Log-log power spectral density ($2\text{--}40\text{ Hz}$) separating periodic $10\text{ Hz}$ alpha ($+8.5\text{ dB}$ vs. $+2.4\text{ dB}$ above the $1/f^{\chi}$ background; $\Delta = 6.2\text{ dB}$ vs. $5.4\text{ dB}$ unadjusted) from the aperiodic $1/f^{\chi}$ exponent ($\chi = 1.41$ relaxed vs. $1.07$ active; van Bueren et al., 2026).

---

## 4. Core Teaching Modules

### 4.1 Audio Sonification

#### 4.1.1 EEG-to-FM Parameter Mapping
Turning continuous brain activity into sound (sonification) is especially valuable in neuroscience and psychology labs that study eyes-closed relaxation, mindfulness, emotion-driven musical feedback, or auditory biofeedback, where asking a participant to watch a computer screen would interfere with the state being measured (Miranda & Castet, 2014; Livingstone & Russo, 2018; Takabatake et al., 2021; Livingstone et al., 2026; Monroy-D'Croz et al., 2026; **Figure 3A,B**). After starting with simple pitch mapping and musical scale notes (`brainBeats.js`, `alphaMusic.js`), students can open the frequency-modulation (FM) synthesizer lesson to see how four EEG rhythms simultaneously shape a continuous musical tone (Chowning, 1973; `brainSynth.js`). In FM synthesis, one oscillator generates the main musical pitch (the carrier) while a second oscillator (the modulator) rapidly vibrates that pitch to create harmonic overtones. In the sketch code below, alpha power controls the main pitch, beta power controls how fast the modulator vibrates, theta power controls how strongly the modulator adds overtones (timbre complexity), and the attention index smoothly adjusts the overall volume:

```javascript
// Core FM synthesis mapping from examples/brainSynth.js
let carrierFreq = map(eegData.alpha, 0, 1, 200, 800); // Alpha -> pitch (200-800 Hz)
let modFreq     = map(eegData.beta,  0, 1, 0, 100);   // Beta  -> modulation rate
let modDepth    = map(eegData.theta, 0, 1, 0, 500);   // Theta -> harmonic depth
let volume      = map(eegData.attention, 0, 1, 0, 0.2);

carrier.freq(carrierFreq);
modulator.freq(modFreq);
modulator.amp(modDepth);
carrier.amp(volume, 0.1); // 100 ms ramp prevents audio clicks between frames
```

#### 4.1.2 Relaxed vs. Engaged Spectra
As illustrated in **Figure 3A,B**, when a participant relaxes with eyes closed (high alpha power, low beta and theta power; Takabatake et al., 2021; de Kleijn et al., 2023), the synthesizer produces a pure, flute-like $650\text{ Hz}$ sine wave with a single peak in the frequency spectrum. When beta and theta power rise during active mental engagement or interactive performance loops (Livingstone et al., 2026; Monroy-D'Croz et al., 2026), the modulator introduces sideband frequencies on either side of the main pitch, creating a richer harmonic texture that students can both hear through their headphones and observe on the live spectrum display.

#### 4.1.3 Periodic vs. Aperiodic Spectra
Recent validation studies comparing consumer-grade headbands with research-grade EEG systems have emphasized that raw narrowband power ($P(f)$) conflates true periodic brain oscillations (such as the $8\text{--}12\text{ Hz}$ alpha peak) with the broadband $1/f^{\chi}$ aperiodic background slope that reflects shifts in excitation–inhibition balance and overall neural noise (Cannard et al., 2021; van Bueren et al., 2026). As demonstrated in **Figure 3F**, fitting a straight line to the log-log power spectrum across non-oscillatory frequencies ($2\text{--}6\text{ Hz}$ and $30\text{--}40\text{ Hz}$) teaches students how to separate the aperiodic exponent ($\chi = 1.41$ during eyes-closed relaxation vs. $\chi = 1.07$ during active engagement) from the periodic $10\text{ Hz}$ alpha peak rising above that $1/f^{\chi}$ baseline ($+8.5\text{ dB}$ relaxed vs. $+2.4\text{ dB}$ active; aperiodic-adjusted state difference $\Delta = 6.2\text{ dB}$ vs. $5.4\text{ dB}$ unadjusted). Including this comparison in the spectral teaching module prepares students to interpret both periodic band ratios and aperiodic spectral slopes in modern neurocognitive research (van Bueren et al., 2026).

### 4.2 Online ERP Averaging

#### 4.2.1 Forehead Reference & Polarity
In cognitive neuroscience and experimental psychology courses, event-related potentials (ERPs) teach students how time-locked averaging extracts small sensory and cognitive brain responses (typically $2\text{--}10\ \mu\text{V}$) from ongoing background EEG waves that are several times larger (Luck, 2014; Krigolson et al., 2017; Smith et al., 2024; **Figure 3C**; `epochs.js`). When introducing ERPs on a portable headband, an important concept for instructors to explain is the location of the reference electrode. Traditional laboratory EEG caps place their reference electrode on the earlobe or mastoid bone behind the ear, whereas the Muse headband places its reference and ground electrodes on the center of the forehead (`REF`/`DRL` at `Fpz`). Because every EEG channel measures the voltage difference between the recording electrode and the reference site, recording from the behind-the-ear sensors against an active forehead reference ($V_{\text{TP9/TP10}} - V_{\text{Fpz}}$) reverses the upward/downward direction of classic parietal or vertex oddball waves unless students re-reference the behind-the-ear channels against the forehead channels ($V_{\text{TP}} - V_{\text{AF}}$; Krigolson et al., 2017) or flip the sign in code. To avoid confusing beginners when they first learn how ERP waves look, our built-in signal simulator injects the familiar textbook polarities directly into the left temporal channel—a negative-going N170 peak ($-6.5\ \mu\text{V}$) followed by a positive-going P300 peak ($+9.5\ \mu\text{V}$)—so students can first master trial averaging and component identification before exploring reference montages on live headbands (**Figure 3C**; `TP9` in `EEGSimulator`).

#### 4.2.2 Epoch Extraction & Blink Rejection
Every $1.5\text{ s}$ (90 animation frames), the ERP teaching template flashes a visual stimulus on screen. It then waits 48 frames ($+800\text{ ms}$) so the full post-stimulus brain response has been recorded into the 256 Hz buffer, extracts a 1-second window of data (256 samples spanning $-200\text{ ms}$ before the flash to $+800\text{ ms}$ after the flash), subtracts the average voltage during the $-200\text{ to }0\text{ ms}$ pre-stimulus baseline so every trial starts aligned at $0\ \mu\text{V}$, rejects any trial containing a large $>100\ \mu\text{V}$ eye-blink spike, and folds the clean trial into a running average across all four electrodes:

```javascript
// Online ERP epoch extraction, blink rejection, and baseline correction (examples/epochs.js)
if (waitingForEpoch && frameCount >= stimulusFrame + 48) { // +800 ms post-stimulus
  let rawEpoch = eegData.getRecentEpoch(256); // 256 samples (1000 ms @ 256 Hz) x 4 channels
  let baselineSamples = 51;                   // First 51 samples = -200 ms to 0 ms baseline
  let hasBlink = false, baseMean = [0, 0, 0, 0];
  for (let ch = 0; ch < 4; ch++) {
    let minV = Infinity, maxV = -Infinity;
    for (let s = 0; s < 256; s++) {
      if (s < baselineSamples) baseMean[ch] += rawEpoch[s][ch] / baselineSamples;
      if (rawEpoch[s][ch] < minV) minV = rawEpoch[s][ch];
      if (rawEpoch[s][ch] > maxV) maxV = rawEpoch[s][ch];
    }
    if (maxV - minV > 100) hasBlink = true;   // >100 uV peak-to-peak whole-epoch rejection
  }
  if (!hasBlink) {                            // Update running average only on clean epochs
    trialCount++;
    for (let ch = 0; ch < 4; ch++) {
      for (let s = 0; s < 256; s++) {
        let corrected = rawEpoch[s][ch] - baseMean[ch];
        avgERP[s][ch] = ((avgERP[s][ch] * (trialCount - 1)) + corrected) / trialCount;
      }
    }
  }
  waitingForEpoch = false;
}
```

#### 4.2.3 $\sqrt{K}$ Scaling, SME, & Hysteresis
Because ongoing background EEG oscillations are not locked to the timing of the visual flash, averaging $K$ independent trials cancels out background noise in proportion to the square root of the trial count ($\sqrt{K}$). Over 20 trials, this noise reduction lowers the trial-to-trial Standardized Measurement Error (SME; Luck et al., 2021; Schubert et al., 2023) by more than fourfold and allows the N170 and P300 peaks to stand out clearly from the background EEG ($1/\sqrt{K}$ scaling: $\text{RMS} = 17.4 \rightarrow 2.7\ \mu\text{V}$, $\text{SNR} = 0.55 \rightarrow 3.48$, P300 $\text{SME} = 8.7 \rightarrow 1.9\ \mu\text{V}$; see **Figure 3C** caption for Monte Carlo benchmarks). The blink-rejection check teaches an equally important practical lesson: because a single eye blink generates a voltage spike more than ten times larger than an ERP peak, leaving just one blink trial inside a 20-trial average severely distorts the P300 wave, whereas rejecting that single contaminated trial restores the true waveform ($\text{RMSE}: 4.52 \rightarrow 3.33\ \mu\text{V}$; **Figure 3C**). For continuous neurofeedback games, students also learn two simple techniques to keep on-screen control smooth and responsive: blending each new frame of band power with the previous value (an exponential moving average) to calm rapid moment-to-moment fluctuations, and using separate turn-on and turn-off thresholds (hysteresis, much like a home thermostat) so game states do not flicker rapidly when a player's brain state hovers near the threshold ($98.4\%$ jitter variance reduction; `smoothAlpha = 0.85 * smoothAlpha + 0.15 * eegData.alpha`; **Figure 3D**).

#### 4.2.4 Frame Jitter & Latency
When students build visual ERP paradigms inside a web browser, instructors can also connect display timing precision from the online behavioral literature (Pronk et al., 2020; Anwyl-Irvine et al., 2021; Lukács & Gartus, 2023) directly to frequency-domain signal processing and psychometric ERP measurement (Schubert et al., 2023, 2024, 2026; Nunez et al., 2024). Because a 60 Hz browser display refreshes every $16.7\text{ ms}$ and Bluetooth packets arrive asynchronously in small bursts, trial-to-trial onset jitter distributed over a window $W$ acts mathematically as a rectangular moving-average filter with transfer function $|H(f)| = |\text{sinc}(fW)|$. As shown in **Figure 3E**, a $30\text{ ms}$ uniform trigger jitter ($f_c = 14.8\text{ Hz}$) attenuates a narrow $20\text{ ms}$ early sensory peak to $65.5\%$ of its true amplitude, but retains $94.7\%$ of the broader N170 ($\sigma = 26\text{ ms}$) and $98.9\%$ of the P300 ($\sigma = 58\text{ ms}$). Furthermore, when students measure P300 timing across 20 noisy trials under $30\text{ ms}$ jitter, naive maximum peak picking exhibits high latency variability ($\text{SD} = 31.5\text{ ms}$), whereas modern psychometric approaches—such as dynamic Gaussian template matching ($\text{SD} = 13.4\text{ ms}$; Schubert et al., 2026) and 50% fractional-area latency ($\text{SD} = 10.4\text{ ms}$; Schubert et al., 2024)—reduce P300 latency measurement error by nearly threefold.

> **Figure 4 (`figures/fig4_multimodal_athena_ppg_imu.pdf`):** **Teaching Modules for Optical fNIRS Short-Channel Skin Regression, Heartbeat-Evoked Potentials, and 6-DOF IMU Motion Filtering.** **(A)** Simulated dual-distance ($8\text{ mm}$ short channel vs. $20\text{ mm}$ long channel) optical blood-flow traces, showing how subtracting the scaled $8\text{ mm}$ superficial skin signal removes heart-pulse ($1.18\text{ Hz}$), breathing ($0.26\text{ Hz}$), and Mayer-wave ($0.10\text{ Hz}$) contamination ($20.1\text{ dB}$ reduction; $\text{RMSE}: 1.15 \rightarrow 0.11\ \mu\text{M}$ [$1.147 \rightarrow 0.113\ \mu\text{M}$ unrounded], $r: 0.46 \rightarrow 0.99$; Wyser et al., 2020; Russo et al., 2025). **(B)** Resulting prefrontal oxyhemoglobin ($\Delta[\text{HbO}_2]$), deoxyhemoglobin ($\Delta[\text{HHb}]$), and total hemoglobin ($\Delta[\text{HbT}]$) response during a simulated task block ($4\text{--}14\text{ s}$). **(C)** 52 Hz 6-DOF IMU head tilt angle (`pitch`, peak $\pm 16^{\circ}$), gravity-removed linear acceleration (peak $\pm 1.4\text{ m/s}^2$), 1st-order head velocity ($\text{cm/s}$), and 2nd-order 3D head displacement ($\text{cm}$), each normalized to unit peak amplitude ($[-1, 1]$) for joint comparison. **(D)** Adaptive 6-tap NLMS filtering of simulated head-movement artifacts on frontal EEG (`AF7`), reducing synchronous motion artifact by $19.2\text{ dB}$ ($\text{RMSE}: 43.7 \rightarrow 4.8\ \mu\text{V}$, $r: 0.31 \rightarrow 0.95$). **(E)** Forehead PPG-locked Heartbeat-Evoked Potential ($K = 60$ beats, $\sim 180\text{ ms}$ pulse transit delay with $\sigma_{\text{PTT}} = 12\text{ ms}$ jitter; peak $4.27\ \mu\text{V}$, window mean $1.64\ \mu\text{V}$, $\text{SME} = 0.79\ \mu\text{V}$) compared against a 500-permutation surrogate pseudotrial null distribution (95% null band $\pm 3.12\ \mu\text{V}$, permutation $p = 0.0200$; Cannard et al., 2024; Steinfath et al., 2025). **(F)** Motion artifact suppression across mechanical electrode-skin viscoelastic phase lags ($\tau_{\text{lag}} = 0\text{--}62.5\text{ ms}$), comparing the instantaneous 1-tap-per-axis (6-weight) NLMS filter against a 4-tap-per-axis (24-weight) delayed FIR NLMS filter ($11.0\text{ dB}$ vs. $2.4\text{ dB}$ at $\tau_{\text{lag}} = 31.3\text{ ms}$, $+8.6\text{ dB}$ gain; Rosanne et al., 2021; Klug et al., 2022).

### 4.3 Optical PPG/fNIRS Regression

#### 4.3.1 Beer–Lambert Contrast & Depth
Whereas EEG measures fast electrical activity in milliseconds, functional near-infrared spectroscopy (fNIRS) teaches students how optical sensors measure the slower hemodynamic response—the local rise in oxygenated hemoglobin ($\text{HbO}_2$) and dip in deoxygenated hemoglobin ($\text{HHb}$) that peaks $4\text{--}6\text{ s}$ after a brain region becomes active during auditory or cognitive load, reflecting the same neurovascular coupling measured by functional MRI (Delpy et al., 1988; Scholkmann et al., 2014; Russo et al., 2025). To separate oxygenated from deoxygenated blood, the headband shines two wavelengths of light located on opposite sides of $800\text{ nm}$, the crossover point where both forms of hemoglobin absorb light equally: below $800\text{ nm}$ (Red $660\text{ nm}$ on Classic Muse, or Near-Infrared $730\text{ nm}$ on Muse S Athena, which passes through adult forehead tissue more easily than $660\text{ nm}$), deoxygenated blood absorbs more light, whereas at $850\text{ nm}$ (Infrared), oxygenated blood absorbs more light. Comparing the returning light at both wavelengths allows the software to calculate relative concentration changes via the Modified Beer–Lambert Law.

When light shines into the forehead, the scattered photons travel from the LED to the photodetector along a curved, banana-shaped path whose depth reaches roughly one-third to one-half of the distance between the light source and detector (Delpy et al., 1988; Saager & Berger, 2005; Wyser et al., 2020). Consequently, a detector placed close to the LED ($8\text{ mm}$ short channel) reaches only $\sim 3\text{--}4\text{ mm}$ deep, measuring blood flow exclusively in the superficial scalp and forehead skin. By contrast, a detector placed farther from the LED ($20\text{ mm}$ long channel) reaches $\sim 7\text{--}10\text{ mm}$ deep, capturing signals that pass through both the overlying skin and the surface of the prefrontal cortex.

#### 4.3.2 Short-Channel Skin Regression
Because the deeper $20\text{ mm}$ channel still passes through the scalp, its raw optical trace is heavily rhythmic with superficial skin activity—including the heartbeat pulse, breathing cycles, and slow blood-pressure waves (Mayer waves around $0.1\text{ Hz}$; Scholkmann et al., 2014; Wyser et al., 2020). Because the Muse S Athena headband (and our simulator) records both the $8\text{ mm}$ and $20\text{ mm}$ channels simultaneously, students can see how simple linear regression removes superficial skin noise to uncover the deeper cortical response:

```javascript
// Short-channel (8 mm) vs. Long-channel (20 mm) regression in updateShortChannelRegression()
// 1. Estimate scaling factor beta between short (skin) and long (skin + brain) optical density
let covSL = 0, varS = 0;
for (let k = 0; k < W; k++) {
  let ds = shortOD[k] - meanShort;
  let dl = longOD[k]  - meanLong;
  covSL += ds * dl;
  varS  += ds * ds;
}
let beta = covSL / (varS + 1e-6);

// 2. Subtract scaled skin signal from long channel, then convert to HbO2 and HHb
let cleanOD_Red = currentLongOD_Red - betaRed * currentShortOD_Red;
let cleanOD_IR  = currentLongOD_IR  - betaIR  * currentShortOD_IR;
```

As shown in **Figure 4A,B**, subtracting the scaled $8\text{ mm}$ skin signal from the $20\text{ mm}$ long channel strips away the large heartbeat, breathing, and blood-pressure oscillations and clearly reveals the slow prefrontal rise in oxygenated hemoglobin and accompanying drop in deoxygenated hemoglobin during the cognitive task block ($20.1\text{ dB}$ superficial artifact suppression; $\text{RMSE}: 1.15 \rightarrow 0.11\ \mu\text{M}$, $r = 0.46 \rightarrow 0.99$; Wyser et al., 2020; Russo et al., 2025).

#### 4.3.3 Heartbeat Potentials & Surrogates
Beyond continuous hemodynamic trends, pairing the 64 Hz forehead PPG sensor with 256 Hz EEG enables students to explore brain–heart interoception by time-locking EEG epochs to systolic pulse peaks to compute Heartbeat-Evoked Potentials (HEPs; Makowski et al., 2021; Cannard et al., 2024; Steinfath et al., 2025). As Steinfath et al. (2025) recently demonstrated, however, apparent HEP waveforms or condition differences can easily arise from ongoing background EEG fluctuations or cardiac field artifacts unless tested against a *surrogate pseudotrial null distribution* that shuffles inter-beat intervals to break true cardiac locking while preserving background autocorrelation. In **Figure 4E**, locking $K = 60$ epochs to forehead PPG peaks (accounting for the $\sim 180\text{ ms}$ pulse transit delay from the ECG R-wave to the forehead vasculature with $\sigma_{\text{PTT}} = 12\text{ ms}$ jitter) recovers the cortical HEP waveform ($110\text{--}260\text{ ms}$ post-PPG peak; peak $4.27\ \mu\text{V}$, window mean $1.64\ \mu\text{V}$, $\text{SME} = 0.79\ \mu\text{V}$) well above the 95% confidence envelope of 500 random pseudotrial permutations ($\pm 3.12\ \mu\text{V}$, permutation $p = 0.0200$), teaching students how surrogate controls guard against false positives in interoceptive neuroscience.

### 4.4 Head Motion & NLMS Filtering

#### 4.4.1 6-DOF Kinematics Integration
The motion studio sketches introduce two complementary uses for the headband's 52 Hz 3-axis accelerometer and 3-axis gyroscope (Rosanne et al., 2021; Klug et al., 2022). In the kinematics lesson (**Figure 4C**), students see how combining accelerometer and gyroscope measurements tracks 3D head tilt angles (nodding pitch, side-to-side roll, and turning yaw), how subtracting the constant pull of gravity isolates true linear head acceleration, and how accumulating acceleration over time estimates head movement speed ($\text{cm/s}$) and 3D head displacement ($\text{cm}$).

#### 4.4.2 6-Tap NLMS Motion Filter
In the adaptive motion-filtering lesson (**Figure 4D**), students learn how those same 6-axis head-movement signals can clean up movement artifacts in the EEG trace (Widrow et al., 1975; Rosanne et al., 2021; Klug et al., 2022; Mathewson, 2024). Whenever a participant nods or tilts their head, slight mechanical shifts of the dry electrodes create large voltage swings that mirror the head motion. Because the headband measures 6-axis head motion at the same time as the EEG, an adaptive filter can continuously estimate how much of the current EEG voltage is predicted by the six motion axes, subtract that predicted movement artifact from each electrode, and gently update its six scaling weights on every sample:

```javascript
// 6-tap adaptive (NLMS) head-movement filter in updateEEGImuMotionFilter()
let u = [0.25*linAx, 0.25*linAy, 0.25*linAz, gx/80, gy/80, gz/80]; // 6-axis IMU reference
let normU = u.reduce((sum, v) => sum + v * v, 0) + 1e-4;

for (let ch = 0; ch < 4; ch++) {
  let w = eegData.motionFilterWeights[ch];
  let estArtifact = 0;
  for (let i = 0; i < 6; i++) estArtifact += w[i] * u[i];
  let cleanEEG = eegData.raw[ch] - estArtifact; // Subtract predicted motion artifact

  // Update filter weights slightly on each sample (mu = 0.035)
  for (let i = 0; i < 6; i++) {
    w[i] = 0.9992 * w[i] + (0.035 * cleanEEG * u[i]) / normU;
  }
  eegData.clean[ch] = cleanEEG;
}
```

In the simulation benchmark, when head nodding introduces large movement swings into the frontal EEG trace, the adaptive filter learns the relationship between head motion and electrode voltage within a few hundred milliseconds and removes the synchronous movement artifact while leaving the underlying brain rhythm intact (**Figure 4D**; $19.2\text{ dB}$ attenuation; $\text{RMSE}: 43.7 \rightarrow 4.8\ \mu\text{V}$, $r = 0.31 \rightarrow 0.95$).

#### 4.4.3 Viscoelastic Delay & Multi-Tap
In mobile brain/body imaging and ambulatory workload studies, mechanical coupling between a wearable headband and the scalp often introduces a viscoelastic settling delay ($\tau_{\text{lag}} \approx 15\text{--}50\text{ ms}$) between physical head acceleration and the resulting half-cell potential shift at the dry electrode interface (Rosanne et al., 2021; Klug et al., 2022). When transient, broadband head movements ($1\text{--}8\text{ Hz}$) undergo viscoelastic delay and dispersion, an instantaneous 1-tap-per-axis (6-weight) filter can only cancel the zero-lag component of the motion artifact, whereas a multi-tap finite impulse response (FIR) adaptive filter that includes delayed copies of the 6-axis IMU reference vector can span the full mechanical impulse response (Widrow et al., 1975; Rosanne et al., 2021). As shown in **Figure 4F**, whereas the instantaneous 6-weight filter's attenuation drops to $2.4\text{ dB}$ when viscoelastic electrode settling introduces a $31.3\text{ ms}$ (8-sample) phase lag, extending the reference vector to 4 delayed taps per axis (24 weights spanning $0, 15.6, 31.3,$ and $46.9\text{ ms}$) maintains $11.0\text{ dB}$ of artifact suppression ($+8.6\text{ dB}$ improvement), providing an instructive demonstration for advanced biomedical engineering and mobile neuroimaging courses.

> **Figure 5 (`figures/fig5_psych403_student_submissions_analysis.pdf`):** **Classroom Evaluation of $N = 69$ Undergraduate Student Projects from $N_{\text{students}} = 30$ Learners in `PSYCH 403`.** **(A)** Executable Lines of Code (LOC) comparing BrainImation's introductory scaffolds ($N = 36$, median $32\text{ LOC}$) against Student Cohort 1 (Neurofeedback Games & Art; $N = 40$, median $121\text{ LOC}$), Student Cohort 2 (Online 4-Channel ERP Experiments; $N = 29$, median $176\text{ LOC}$), and per-student median lengths ($N_{\text{students}} = 30$, median $164\text{ LOC}$, $\text{IQR} = 122\text{--}173\text{ LOC}$, Mann–Whitney $U = 1074.0, p < 10^{-11}, r_{rb} = 0.99$). **(B)** Percentage of student submissions using signal conditioning ($66.7\%$, $46/69$; Cohort 1: $57.5\%$, Cohort 2: $79.3\%$), alpha ($92.5\%$ of Cohort 1, $53.6\%$ overall), beta ($72.5\%$ of Cohort 1, $42.0\%$ overall), attention ($52.5\%$ of Cohort 1, $34.8\%$ overall), custom object/particle classes ($70.0\%$ of Cohort 1, $20.7\%$ of Cohort 2), online ERP state machines ($100.0\%$ of Cohort 2, $42.0\%$ overall), and 256 Hz raw electrode arrays ($93.1\%$ of Cohort 2, $39.1\%$ overall). **(C)** Example Cohort 1 student neurofeedback game (*Catch 20 Cones*, 195 LOC), showing the falling ice-cream cone sprite, horizontal catcher paddle, score/timer HUD, and bottom alpha/beta target zone indicator bar. **(D)** Example Cohort 2 student 4-channel Face vs. Object ERP experiment (148 LOC), showing the four color-coded electrode traces (`TP9`, `AF7`, `AF8`, `TP10`), real-time condition waveforms, and trial counter.

---

## 5. Classroom Evaluation

### 5.1 Course Context & Workflow

#### 5.1.1 Participant Pool & Ethics
To evaluate how undergraduate neuroscience and psychology students used BrainImation in an authentic classroom setting, we analyzed all verified unique examination projects from an upper-level cognitive neuroscience laboratory course at the University of Alberta (**Table 2** and **Figure 5**; $N = 69$ submissions from $N_{\text{students}} = 30$ learners in `PSYCH 403`, Research Ethics Board Protocol `Pro00050069`). Because some students saved multiple iterative versions of their work (such as an early draft alongside a final revised submission), we report both the full submission pool and a per-student clustered summary that reduces each student's work to a single median value so that every learner contributes equally to the statistical comparison.

#### 5.1.2 Lab-to-Home-to-Lab Cycle
Most students enrolled in the course had little or no prior programming experience (Hatton et al., 2023; Smith et al., 2024; Iemi et al., 2026). Instruction followed a three-step weekly cycle inspired by simulation-driven experiment building (de Leeuw et al., 2023): during in-person laboratory sessions, students first explored and modified the short built-in starter templates while wearing physical Muse headbands; at home on their personal laptops, they built and debugged their own assignment code using the built-in signal simulator (testing game states with the Attention and Meditation sliders and verifying trial averaging on simulated ERP peaks; `EEGSimulator`); finally, they returned to the teaching lab to test their finished programs on live headbands and submitted playable web links so the instructor and teaching assistants could open, run, and grade each project directly in the browser (`?sketch=`).

#### 5.1.3 Two-Cohort Exam Structure
Each student completed two graded practical coding examinations over the semester: an interactive frequency-band neurofeedback game or visualizer in the first midterm module and an online 4-channel event-related potential experiment in the second midterm module (Cohort 1: $N = 40$; Cohort 2: $N = 29$).

| Catalogue Group / Student Cohort | $N$ | Med. LOC | IQR LOC | Min–Max | Primary Signals Used | Project Type |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| One-Sensor Starters & Diagnostics | 7 | 25 | $22\text{--}120$ | $21\text{--}135$ | Single-sensor, 16-ch Athena | Minimal starters & hardware checks |
| Core 10-Category Scaffolds | 36 | 32 | $27\text{--}36$ | $11\text{--}111$ | EEG bands, Att/Med, 256 Hz raw | Short introductory teaching templates |
| PPG, fNIRS, IMU & Multimodal Studios | 27 | 208 | $136\text{--}257$ | $69\text{--}1438$ | 64 Hz PPG/fNIRS, 8/20 mm, 6-DOF IMU | Step-by-step optical & motion lessons |
| BrainGames, EEGEdu & Classic `p5.eegedu` | 43 | 131 | $38\text{--}438$ | $17\text{--}758$ | Closed-loop bands, SSVEP, ERP | 14 arcade games + 29 lab modules |
| Archival Class Galleries (2022 & 2025) | 121 | 126 | $50\text{--}174$ | $12\text{--}414$ | Student BCI & NeuroArt sketches | Playable past student projects |
| **Full Visual Catalogue (`manifest.json`)** | **234** | **110** | **$38\text{--}183$** | **$11\text{--}1438$** | **21 categories with thumbnails** | **Complete in-browser sketch library** |
| Exam Cohort 1: Neurofeedback & Games | 40 | 121 | $99\text{--}171$ | $38\text{--}378$ | `eegData.alpha`, `beta`, `attention` | Student neurofeedback games & art |
| Exam Cohort 2: Online 4-Ch ERP Tasks | 29 | 176 | $153\text{--}221$ | $117\text{--}306$ | 256 Hz `TP9, AF7, AF8, TP10` | Oddball P300, Face N170, Stroop, MMN |
| Per-Student Clustered Medians | 30 | 164 | $122\text{--}173$ | $87\text{--}302$ | One median value per student | Independent student-level summary |
| **All Exam Submissions Combined** | **69** | **155** | **$116\text{--}189$** | **$38\text{--}378$** | **Smoothing (66.7%), $\alpha$ (53.6%), ERP (42.0%)** | **Graded `PSYCH 403` exam archive** |

### 5.2 Code Complexity & Scaffold Expansion

#### 5.2.1 Executable LOC Metric & Clustering
We quantified program size using executable lines of JavaScript code, excluding blank lines and comments (lines starting with `//`, `/*`, `*`, or `*/`). Across both examination modules, students began from the brief introductory templates and authored substantially larger, self-contained applications (**Figure 5A**; $\text{median} = 155\text{ LOC}$, $\text{IQR} = 116\text{--}189\text{ LOC}$, range $38\text{--}378\text{ LOC}$ vs. starter scaffold $\text{median} = 32\text{ LOC}$; Mann–Whitney $U = 2437.0, p < 10^{-15}$). Collapsing multiple submissions from the same student into a single per-learner median confirmed a fivefold expansion above the starter templates ($N_{\text{students}} = 30$, $\text{median} = 164\text{ LOC}$, $\text{IQR} = 122\text{--}173\text{ LOC}$, range $87\text{--}302\text{ LOC}$, $U = 1074.0, p < 10^{-11}, r_{rb} = 0.99$).

#### 5.2.2 Cohort 1 & Cohort 2 Exemplars
In the first midterm cohort, students created original closed-loop games such as an *Ice Cream Cone Catcher* steered by alpha/beta target zones and an *EEG Flappy Bird* with adaptive difficulty (**Figure 5C**; Cohort 1 $\text{median} = 121\text{ LOC}$, exemplars: 195 and 160 LOC). In the second midterm cohort, students expanded the ERP starter template into complete two-condition experiments comparing target versus standard oddball stimuli or Face versus Object N170 responses across all four electrodes (**Figure 5D**; Cohort 2 $\text{median} = 176\text{ LOC}$, exemplar: 148 LOC; `epochs.js`).

#### 5.2.3 Template Expansion Test
Notably, every single student project in the ERP cohort exceeded the 85-line starter template, typically doubling its length by adding multi-condition stimulus schedules, condition-specific running averages, custom legends, and statistical summary displays ($29/29 = 100\%$, median $2.07\times$ code expansion, range $117\text{--}306\text{ LOC}$, Wilcoxon signed-rank $W = 435.0, p = 1.86\times 10^{-9}$; `epochs.js`).

### 5.3 Disaggregated Feature Adoption

#### 5.3.1 Signal Conditioning
Inspecting student code across the two midterm assignments shows how learners selected signal-processing tools suited to each neuroscience paradigm (**Figure 5B**). Two-thirds of all student projects included explicit signal conditioning—such as moving-average smoothing, pre-stimulus baseline subtraction, or threshold hold timers—with especially high adoption in the ERP cohort ($66.7\%$, $46/69$ overall; Cohort 1: $57.5\%$, $23/40$; Cohort 2: $79.3\%$, $23/29$).

#### 5.3.2 Cohort 1 Frequency-Band Usage
Continuous frequency-band powers, attention scores, and custom object-oriented particle classes were the primary building blocks in the first cohort's neurofeedback games (alpha: $92.5\%$, $37/40$; beta: $72.5\%$, $29/40$; attention: $52.5\%$, $21/40$; ES6 classes/particles: $70.0\%$, $28/40$; see **Figure 5B** caption).

#### 5.3.3 Cohort 2 Buffer Usage
By contrast, time-domain buffer operations defined the second cohort, where every project implemented a multi-trial ERP averaging state machine and nearly all projects indexed directly into the 256 Hz raw four-channel electrode arrays, with one-fifth also defining custom object classes to manage stimulus trials (ERP state machines: $100.0\%$, $29/29$; 256 Hz raw arrays: $93.1\%$, $27/29$; ES6 trial classes: $20.7\%$, $6/29$).

#### 5.3.4 Archival Preservation
All graded examination projects are preserved alongside additional laboratory exercises inside the Visual Catalogue's classroom galleries, giving future neuroscience and psychology students a growing library of playable peer examples ($N = 69$ exam projects plus 26 lab sketches in the 95-sketch 2025 Neurotech gallery, alongside 26 projects in the 2022 NeuroArt gallery).

---

## 6. Discussion

### 6.1 Pedagogical & Research Synthesis

#### 6.1.1 From Dashboards to Creative Coding
BrainImation offers neuroscience and psychology lecturers a practical, zero-install browser environment for both undergraduate laboratory instruction and rapid behavioral research prototyping. Whereas companion dashboard tools such as *EEGEdu* (https://eegedu.com; Mathewson, 2026) introduce brain waves and frequency spectra through pre-built charts, BrainImation empowers students and researchers to write their own interactive programs driven by live EEG rhythms, time-locked ERP epochs, forehead optical blood-flow signals (PPG/fNIRS), and 3D head motion (Papert, 1980; Resnick et al., 2009; de Leeuw, 2015; Henninger et al., 2022). In doing so, it bridges browser-based behavioral experiment builders (Woods et al., 2015; Anwyl-Irvine et al., 2022; Kuroki & Pronk, 2023; de Leeuw, 2024) and hands-on undergraduate neurophysiology curricula (Janssen et al., 2021; Hatton et al., 2023; Smith et al., 2024; Iemi et al., 2026).

#### 6.1.2 Zero-Install Lab & Off-Lab Workflow
By supporting all four Muse headset generations through a single browser button, providing a realistic multi-sensor simulator for homework and lecture demonstrations (de Leeuw et al., 2023), and pairing a 153-item Reference Drawer with a 234-sketch Visual Catalogue, the platform shifts classroom time away from software installation and driver troubleshooting toward experimental design, physiological signal interpretation, and joint neurocognitive modeling (Frischkorn & Schubert, 2018; Schubert et al., 2023; Nunez et al., 2024; de Kleijn et al., 2025). When students are ready to transition from in-browser prototyping to advanced offline pipelines, one-click CSV export connects seamlessly with open-source Python, R, and MATLAB ecosystems including EEGLAB (Delorme & Makeig, 2004), `BrainBeats` (Cannard et al., 2024), `NeuroKit2` (Makowski et al., 2021), the Lab Streaming Layer (Kothe et al., 2025), and synchronous multimodal web viewers (Pijálek et al., 2026).

### 6.2 Technical & Methodological Limitations

#### 6.2.1 Synthetic Benchmarks vs. Clinical Validation
When adopting BrainImation in a course or laboratory, several practical boundaries are helpful to keep in mind. First, the simulation benchmarks in Section 4 (**Figures 3** and **4**) test in-browser algorithms on repeatable synthetic signals with known ground truth; they are designed as clear teaching demonstrations rather than clinical hardware validations against research-grade fNIRS systems or wet-electrode EEG caps (Cannard et al., 2021; Sabio et al., 2024; van Bueren et al., 2026; Russo et al., 2025). In classroom ERP and spectral labs, instructors can also have students compute the trial-to-trial Standardized Measurement Error (SME; Luck et al., 2021; Schubert et al., 2023), inspect the $1/f^{\chi}$ aperiodic slope alongside narrowband alpha power (van Bueren et al., 2026), and test heartbeat-locked averages against surrogate pseudotrial permutations (Steinfath et al., 2025) so students learn rigorous modern reporting standards (Picton et al., 2000; Keil et al., 2014).

#### 6.2.2 WebBluetooth & 60 Hz Jitter
Second, because Bluetooth packets arrive in small bursts and browser animation loops redraw the screen at 60 frames per second ($16.67\text{ ms}$ per frame), visual stimulus timestamps in browser ERP tasks have $\sim 15\text{--}45\text{ ms}$ of frame-to-frame timing variability compared with dedicated laboratory trigger cables (Krigolson et al., 2017; Kuziek et al., 2017, 2018; Pronk et al., 2020; Anwyl-Irvine et al., 2021; Lukács & Gartus, 2023). As quantified in **Figure 3E**, averaging across trials with slight timing jitter acts like a gentle temporal smoothing filter: it attenuates very brief sensory spikes ($<20\text{ ms}$ wide) but preserves broader cognitive waves such as the N170 face response and the P300 oddball response across 20 averaged trials ($30\text{ ms}$ [$45\text{ ms}$] uniform jitter low-pass cutoff: $f_c = 14.8\text{ Hz}$ [$9.8\text{ Hz}$], first spectral null at $33.3\text{ Hz}$ [$22.2\text{ Hz}$]; amplitude retained under $30\text{ ms}$ jitter: $65.5\%$ for a narrow $20\text{ ms}$ peak vs. $94.7\%$ for N170 and $98.9\%$ for P300), especially when paired with fractional-area or dynamic template-matching latency estimators (Schubert et al., 2024, 2026).

#### 6.2.3 Dry-Sensor Artifacts & NLMS Bounds
Third, dry forehead and behind-the-ear sensors are naturally sensitive to eye blinks, forehead or jaw muscle tension, and mechanical headband slippage (Lotte et al., 2013; Mathewson et al., 2017; Saager & Berger, 2005; Wyser et al., 2020). Although the built-in blink-rejection threshold, short-channel optical regression, and 6-axis adaptive motion filter provide effective classroom demonstrations of artifact removal, the default in-browser motion filter uses a single instantaneous weight per motion axis; when ambulatory head movements involve viscoelastic electrode-skin settling delays, extending the reference vector to a multi-tap delayed FIR filter (**Figure 4F**) or exporting data to offline mobile brain/body imaging pipelines (Rosanne et al., 2021; Klug et al., 2022) recovers substantially stronger suppression.

#### 6.2.4 Browser Compatibility
Fourth, connecting a physical Muse headband via WebBluetooth requires a Chromium-based browser (such as Google Chrome, Microsoft Edge, Opera, or the Bluefy browser on iOS and iPadOS). However, the built-in signal simulator, code editor, Reference Drawer, and Visual Catalogue work in any modern browser, including Safari and Firefox, so students on any laptop or tablet can complete homework and explore every example.

#### 6.2.5 Classroom Evaluation Scope
Finally, our classroom evaluation measured program complexity and feature adoption across $N = 69$ graded student projects rather than pre- and post-course quiz scores. Because students could build upon catalogue templates and use optional AI coding explanations (Clin Deffarges et al., 2026), program length reflects the scope of the interactive experiments students constructed rather than memorized syntax. Together, these features make BrainImation an approachable, zero-install bridge between introductory neuroscience demonstrations and hands-on computational experimentation.

---

## Declarations

- **Open Practices Statement:** All source code (`muse-browser.js`, `index.html`, Python `bleak` hardware diagnostics in `tools/`), the live browser environment (https://kylemath.github.io/Brainimation/), all 234 catalogue sketches and thumbnails in `examples/`, simulation benchmark generators, and the automated manuscript verification suite (`verify_manuscript_analyses.py`) are openly available without restriction at https://github.com/kylemath/Brainimation and https://github.com/kylemath/eegeduPaper. The classroom evaluation analyzed de-identified archival student code rather than a preregistered hypothesis test.
- **Ethics and SAGER Statement:** Classroom code artifacts from `PSYCH 403` were analyzed in de-identified form in accordance with procedures approved by the University of Alberta Research Ethics Board (Protocol `Pro00050069`). Because software source files were analyzed in de-identified archival form without demographic linkage, participant sex and gender dimensions were not recorded and do not affect the deterministic signal-processing benchmarks.
- **Data and Code Availability:** The live BrainImation environment is available at https://kylemath.github.io/Brainimation/. Source code and analysis scripts are archived at https://github.com/kylemath/Brainimation and https://github.com/kylemath/eegeduPaper.
- **Funding:** This work was supported by a Natural Sciences and Engineering Research Council of Canada (NSERC) Discovery Grant to K.E.M. The funding source had no involvement in study design; in the collection, analysis, and interpretation of data; in the writing of the report; or in the decision to submit the article for publication.
- **Declaration of Competing Interest:** The authors declare that there are no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.
- **CRediT Authorship Contribution Statement:** **Kyle E. Mathewson:** Conceptualization, Methodology, Software, Validation, Formal analysis, Investigation, Resources, Data curation, Writing – original draft, Writing – review & editing, Visualization, Supervision, Project administration, Funding acquisition. **Tamari Shalamberidze:** Methodology, Software, Validation, Investigation, Data curation, Writing – review & editing. **Claire J. Scavuzzo:** Conceptualization, Methodology, Investigation, Supervision, Writing – review & editing.
- **Declaration of Generative AI and AI-Assisted Technologies in the Manuscript Preparation Process:** During the preparation of this work the authors used large language model coding and editing assistants to verify code-to-manuscript consistency and polish prose formatting. After using these tools, the authors reviewed and edited the content as needed and take full responsibility for the content of the published article.
- **Acknowledgements:** The authors thank the undergraduate students and teaching assistants of `PSYCH 403` and the NeuroArt and Neurotech laboratory cohorts at the University of Alberta for testing BrainImation in the classroom.

---

## References (62 Cited Works)

- Anwyl-Irvine, A., Dalmaijer, E. S., Hodges, N., & Evershed, J. K. (2021). Realistic precision and accuracy of online experiment platforms, web browsers, and devices. *Behavior Research Methods*, 53(4), 1407–1426.
- Anwyl-Irvine, A. L., Armstrong, T., & Dalmaijer, E. S. (2022). MouseView.js: Reliable and valid attention tracking in web-based experiments using a cursor-directed aperture. *Behavior Research Methods*, 54(4), 1663–1687.
- Cannard, C., Wahbeh, H., & Delorme, A. (2021). Validating the wearable MUSE headset for EEG spectral analysis and Frontal Alpha Asymmetry. In *2021 IEEE International Conference on Bioinformatics and Biomedicine (BIBM)* (pp. 3603–3610).
- Cannard, C., Wahbeh, H., & Delorme, A. (2024). BrainBeats as an open-source EEGLAB plugin to jointly analyze EEG and cardiovascular signals. *Journal of Visualized Experiments*, 206, e65829.
- Chowning, J. M. (1973). The synthesis of complex audio spectra by means of frequency modulation. *Journal of the Audio Engineering Society*, 21(7), 526–534.
- Clin Deffarges, A., Kosmyna, N., & Maes, P. (2026). Socrates went nuclear: Comparing interaction strategies for AI systems in a learning context using brain sensing. In *Proceedings of the 14th International Conference on Human-Agent Interaction (HAI '26)*. arXiv:2609.00584.
- de Kleijn, R., et al. (2023). Short-term transcutaneous vagus nerve stimulation increases pupil size but does not affect EEG alpha power. *Brain Stimulation*, 16(4), 1126–1128.
- de Kleijn, R., et al. (2025). Phasic alertness impairs cognitive control by amplifying competition between evidence accumulators. *Journal of Neuroscience*, 45(36), e1595242025.
- de Leeuw, J. R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. *Behavior Research Methods*, 47(1), 1–12.
- de Leeuw, J. R. (2024). DataPipe: Born-open data collection for online experiments. *Behavior Research Methods*, 56(3), 2499–2506.
- de Leeuw, J. R., Gilbert, R. A., Petrov, N., & Luchterhandt, B. (2023). Simulating behavior to help researchers build experiments. *Behavior Research Methods*, 55(4), 1863–1873.
- Delorme, A., & Makeig, S. (2004). EEGLAB: An open source toolbox for analysis of single-trial EEG dynamics including independent component analysis. *Journal of Neuroscience Methods*, 134(1), 9–21.
- Delpy, D. T., Cope, M., van der Zee, P., Arridge, S., Wray, S., & Wyatt, J. (1988). Estimation of optical pathlength through tissue from direct time of flight measurement. *Physics in Medicine & Biology*, 33(12), 1433–1442.
- Enriquez-Geppert, S., Huster, R. J., & Herrmann, C. S. (2017). EEG-based neurofeedback: A systematic review of designs, methodologies and clinical applications. *Current Behavioral Neuroscience Reports*, 4(2), 156–168.
- Frischkorn, G. T., & Schubert, A.-L. (2018). Cognitive models in intelligence research: Advantages and recommendations for their application. *Journal of Intelligence*, 6(3), 34.
- Hatton, S. L., Rathore, S., Vilinsky, I., & Stowasser, A. (2023). Quantitative and qualitative representation of introductory and advanced EEG concepts: An exploration of different EEG setups. *Journal of Undergraduate Neuroscience Education*, 21(2), A119–A129.
- Henninger, F., Shevchenko, Y., Mertens, U. K., Kieslich, P. J., & Hilbig, B. E. (2022). lab.js: A free, open, online study builder. *Behavior Research Methods*, 54(2), 556–573.
- Iemi, L., Wright, M., Pham, K., & Alexandrescu, A. (2026). "I Can Code": An innovative workshop introducing students to coding in the context of neuroscience research. *Journal of Undergraduate Neuroscience Education*, 24(1), A42–A50.
- Janssen, T. W. P., Grammer, J. K., Bleichner, M. G., Bulgarelli, C., Davidesco, I., Dikker, S., Jasińska, K. K., Siugzdaite, R., Vassena, E., Vatakis, A., Zion-Golumbic, E., & van Atteveldt, N. (2021). Opportunities and limitations of mobile neuroimaging technologies in educational neuroscience. *Mind, Brain, and Education*, 15(4), 354–370.
- Keil, A., Debener, S., Gratton, G., Junghöfer, M., Kappenman, E. S., Luck, S. J., Luu, P., Miller, G. A., & Yee, C. M. (2014). Committee report: Publication guidelines and recommendations for studies using electroencephalography and magnetoencephalography. *Psychophysiology*, 51(1), 1–21.
- Klug, M., Jeung, S., Wunderlich, A., Gehrke, L., Protzak, J., Djebbara, Z., Argubi-Wollesen, A., Wollesen, B., & Gramann, K. (2022). The BeMoBIL pipeline for automated analyses of multimodal mobile brain and body imaging data. *bioRxiv*, 2022.09.29.510051.
- Kothe, C., Shirazi, S. Y., Stenner, T., Medine, D., Boulay, C., Grivich, M. I., Artoni, F., Mullen, T., Delorme, A., & Makeig, S. (2025). The Lab Streaming Layer for synchronized multimodal recording. *Imaging Neuroscience*, 3, imag.a.136.
- Krigolson, O. E., Williams, C. C., Norton, A., Hassall, C. D., & Colino, F. L. (2017). Choosing MUSE: Validation of a low-cost, portable EEG system for ERP research. *Frontiers in Neuroscience*, 11, 109.
- Kuroki, D., & Pronk, T. (2023). jsQuestPlus: A JavaScript implementation of the QUEST+ method for estimating psychometric thresholds in online experiments. *Behavior Research Methods*, 55(6), 3183–3192.
- Kuziek, J. W., Redman, E. X., Splinter, G. D., & Mathewson, K. E. (2018). Increasing the mobility of EEG data collection using a LattePanda computer. *Journal of Neuroscience Methods*, 308, 34–47.
- Kuziek, J. W., Shienh, A., & Mathewson, K. E. (2017). Transitioning EEG experiments away from the laboratory using a Raspberry Pi 2. *Journal of Neuroscience Methods*, 277, 75–82.
- Livingstone, S. R., et al. (2026). AI in music performance: The human–AI performance loop. *Frontiers in Psychology*, 17, 2001824.
- Livingstone, S. R., & Russo, F. A. (2018). The Ryerson Audio-Visual Database of Emotional Speech and Song (RAVDESS): A dynamic, multimodal set of facial and vocal expressions in North American English. *PLOS ONE*, 13(5), e0196391.
- Lotte, F., Larrue, F., & Mühl, C. (2013). Flaws in current human training protocols for spontaneous Brain–Computer Interfaces: Lessons learned from instructional design. *Frontiers in Human Neuroscience*, 7, 568.
- Luck, S. J. (2014). *An Introduction to the Event-Related Potential Technique* (2nd ed.). MIT Press.
- Luck, S. J., Stewart, A. X., Simmons, A. M., & Rhemtulla, M. (2021). Standardized measurement error: A universal metric of data quality for averaged event-related potentials. *Psychophysiology*, 58(6), e13793.
- Lukács, G., & Gartus, A. (2023). Precise display time measurement in JavaScript for web-based experiments. *Behavior Research Methods*, 55(3), 1255–1269.
- Makowski, D., Pham, T., Lau, Z. J., Brammer, J. C., Lespinasse, F., Pham, H., Schölzel, C., & Chen, S. H. A. (2021). NeuroKit2: A Python toolbox for neurophysiological signal processing. *Behavior Research Methods*, 53(4), 1689–1696.
- Mathewson, K. E. (2024). The moving wave: Applications of the mobile EEG approach to study human attention. *Psychophysiology*, 61(10), e14635.
- Mathewson, K. E. (2026). EEGEdu: A zero-install, reactive WebBluetooth platform for human electrophysiology, time–frequency signal processing, and brain–computer interfaces. *PsyArXiv*. https://eegedu.com
- Mathewson, K. E., Harrison, T. J., & Kizuk, S. A. (2017). High and dry? Comparing active dry EEG electrodes to active and passive wet electrodes. *Psychophysiology*, 54(1), 74–82.
- McCarthy, L., Reas, C., & Fry, B. (2015). *Make: Getting Started with p5.js: Making Interactive Graphics in JavaScript and Processing*. Maker Media.
- Miranda, E. R., & Castet, J. (2014). Brain–computer music interfacing: Interdisciplinary milestone in music and neuroscience. In *Guide to Brain–Computer Music Interfacing* (pp. 1–27). Springer.
- Monroy-D'Croz, P. A., Ramirez-Melendez, R., & Cespedes-Guevara, J. (2026). A minimalist brain–computer musical interface for real-time emotion-driven sonification: System design and preliminary evaluation. *arXiv preprint arXiv:2606.01473*.
- Nunez, M. D., Fernandez, K., Srinivasan, R., & Vandekerckhove, J. (2024). A tutorial on fitting joint models of M/EEG and behavior to understand cognition. *Behavior Research Methods*, 56(6), 6020–6050.
- Papert, S. (1980). *Mindstorms: Children, Computers, and Powerful Ideas*. Basic Books.
- Picton, T. W., Bentin, S., Berg, P., Donchin, E., Hillyard, S. A., Johnson, R., Jr., Miller, G. A., Ritter, W., Ruchkin, D. S., Rugg, M. D., & Taylor, M. J. (2000). Guidelines for using human event-related potentials to study cognition: Recording standards and publication criteria. *Psychophysiology*, 37(2), 127–152.
- Pijálek, J., Vlk, K., & Bojar, O. (2026). MEEDAV: A synchronous web viewer for EEG, eye-tracking and speech data. *arXiv preprint arXiv:2605.18296*.
- Pronk, T., Wiers, R. W., Molenaar, D., & Murre, J. M. J. (2020). Mental chronometry in the pocket? Timing accuracy of web applications on touchscreen and keyboard devices. *Behavior Research Methods*, 52(3), 1371–1382.
- Reas, C., & Fry, B. (2007). *Processing: A Programming Handbook for Visual Designers and Artists*. MIT Press.
- Resnick, M., Maloney, J., Monroy-Hernández, A., Rusk, N., Eastmond, E., Brennan, K., Millner, A., Rosenbaum, E., Silver, J., Silverman, B., & Kafai, Y. (2009). Scratch: Programming for all. *Communications of the ACM*, 52(11), 60–67.
- Rosanne, O., Albuquerque, I., Cassani, R., Gagnon, J.-F., Tremblay, S., & Falk, T. H. (2021). Adaptive filtering for improved EEG-based mental workload assessment of ambulant users. *Frontiers in Neuroscience*, 15, 611962.
- Russo, F. A., et al. (2025). Prefrontal cortical hemodynamics and auditory cognitive load measured via functional near-infrared spectroscopy. *Scientific Reports*, 15, 29080.
- Saager, R. B., & Berger, A. J. (2005). Direct characterization and removal of interfering absorption trends in two-layer turbid media. *Journal of the Optical Society of America A*, 22(9), 1874–1882.
- Sabio, J., Williams, N. S., McArthur, G. M., & Badcock, N. A. (2024). A scoping review on the use of consumer-grade EEG devices for research. *PLOS ONE*, 19(3), e0291186.
- Scholkmann, F., Kleiser, S., Metz, A. J., Zimmermann, R., Mata Pavia, J., Wolf, U., & Wolf, M. (2014). A review on continuous wave functional near-infrared spectroscopy and imaging instrumentation and methodology. *NeuroImage*, 85, 6–27.
- Schubert, A.-L., Löffler, C., & Hagemann, D. (2026). Exploring a dynamic template matching algorithm for the automatic extraction of P3 latencies. *Psychophysiology*, 63(1), e70212.
- Schubert, A.-L., Löffler, C., Hagemann, D., & Sadus, K. (2023). Enhancing precision in human neuroscience. *eLife*, 12, e85180.
- Schubert, A.-L., Löffler, C., Sadus, K., Göttmann, J., & Hagemann, D. (2024). An explorative multiverse study for extracting differences in P3 latencies between young and old adults. *Psychophysiology*, 61(3), e14459.
- Sitaram, R., Ros, T., Stoeckel, L., Haller, S., Scharnowski, F., Lewis-Peacock, J., Weiskopf, N., Blefari, M. L., Rana, M., Oblak, E., Birbaumer, N., & Sulzer, J. (2017). Closed-loop brain training: The science of neurofeedback. *Nature Reviews Neuroscience*, 18(2), 86–100.
- Smith, K., Pilger, A., Amorim, M. L. M., Mircic, S., Reining, Z., Ristow, N., Miller, D., Leonhardt, A., Donovan, J. C., Meier, M., Marzullo, T. C., Serbe-Kamp, E., Steiner, A. P., & Gage, G. J. (2024). Low-cost classroom and laboratory exercises for investigating both wave and event-related electroencephalogram potentials. *Journal of Undergraduate Neuroscience Education*, 22(2), A129–A138.
- Steinfath, P., Herzog, N., Fourcade, A., Sander, C., Nikulin, V. V., & Villringer, A. (2025). Validating genuine changes in heartbeat-evoked potentials using pseudotrials and surrogate procedures. *Imaging Neuroscience*, 3, imag.a.30.
- Takabatake, K., Kunii, N., Nakatomi, H., Shimada, S., Yanai, K., Takasago, M., & Saito, N. (2021). Musical auditory alpha wave neurofeedback: Validation and cognitive perspectives. *Applied Psychophysiology and Biofeedback*, 46(4), 323–334.
- van Bueren, N. E. R., van Hoogmoed, A. H., van der Ven, S. H. G., & Jonkman, L. M. (2026). Comparing aperiodic activity in consumer-grade and research-grade EEG: Reliability and association with mathematical ability. *Behavior Research Methods*, 58, 25.
- Widrow, B., Glover, J. R., McCool, J. M., Kaunitz, J., Williams, C. S., Hearn, R. H., Zeidler, J. R., Dong, E., & Goodlin, R. C. (1975). Adaptive noise cancelling: Principles and applications. *Proceedings of the IEEE*, 63(12), 1692–1716.
- Woods, A. T., Velasco, C., Levitan, C. A., Wan, X., & Spence, C. (2015). Conducting perception research over the internet: A tutorial review. *PeerJ*, 3, e1058.
- Wyser, D., Mattille, M., Wolf, M., Lambercy, O., Scholkmann, F., & Gassert, R. (2020). Short-channel regression in functional near-infrared spectroscopy is more effective when considering heterogeneous scalp hemodynamics. *Neurophotonics*, 7(3), 035011.
