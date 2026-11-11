# BrainImation: A Browser-Based Teaching Environment for Learning Creative Coding with Live EEG, Optical PPG/fNIRS, and Head Motion Sensors

**Kyle E. Mathewson**$^{1,2,*}$, **Tamari Shalamberidze**$^{2}$, **Claire J. Scavuzzo**$^{1}$  
$^1$Department of Psychology, Faculty of Science, University of Alberta, Edmonton, AB, Canada  
$^2$Neuroscience and Mental Health Institute, Faculty of Medicine and Dentistry, University of Alberta, Edmonton, AB, Canada  
$^*$Correspondence: `kyle.mathewson@ualberta.ca` (K.E. Mathewson), `shalambe@ualberta.ca` (T. Shalamberidze), `scavuzzo@ualberta.ca` (C.J. Scavuzzo)  
Live Tool: https://kylemath.github.io/Brainimation/ $\cdot$ Repository: https://github.com/kylemath/Brainimation

---

## Structured Abstract (*Journal of Neuroscience Methods*)

**Background:** Teaching students to build interactive brain–computer interfaces (BCIs), audio sonifications, optical blood-flow displays, and event-related potential (ERP) experiments with portable headbands is difficult when classes must first install separate Bluetooth utilities, network streaming layers, and desktop programming environments.

**New Method:** We present BrainImation (`https://kylemath.github.io/Brainimation/`), a free browser-based teaching environment connecting four generations of InteraXon Muse headbands—Muse 2016, Muse 2, Classic Muse S, and Muse S Athena—directly to `p5.js` graphics and `p5.sound` audio in a single webpage. A built-in WebBluetooth client pairs with a hardware-free signal simulator to populate a shared JavaScript object (`eegData`) covering EEG bands, 256 Hz raw traces, 64 Hz optical pulse and forehead blood oxygenation (PPG/fNIRS), and 52 Hz 3D head motion, supported by a visual catalogue of 226 sketches across 18 categories (starting from 36 scaffolds, median 32 lines of code [LOC]) and a 148-item reference drawer.

**Results:** Simulation benchmarks confirm expected classroom behavior: online ERP averaging reduces background noise across 20 trials ($\sigma_{\text{noise}}: 17.4 \rightarrow 2.7\ \mu\text{V}$), moving-average smoothing reduces control jitter by $98.4\%$, short-channel optical regression suppresses superficial skin pulse artifacts by $20.1\text{ dB}$, and adaptive motion filtering suppresses head-movement EEG artifacts by $19.2\text{ dB}$. In an undergraduate laboratory course ($N = 69$ exam projects from $N_{\text{students}} = 30$ `PSYCH 403` students), learners expanded the 32-LOC templates into working programs with a median of 155 LOC (clustered $\text{median} = 164\text{ LOC}$, $p < 10^{-11}$), building neurofeedback games ($N = 40$, $\text{median} = 121\text{ LOC}$) and 4-channel ERP tasks ($N = 29$, $\text{median} = 176\text{ LOC}$).

**Comparison with Existing Methods:** Unlike desktop `LabStreamingLayer`/Python setups or legacy browser libraries that fail on newer Muse 2, Muse S, and Muse S Athena headsets, BrainImation runs in a standard browser with zero installation.

**Conclusions:** BrainImation provides an accessible classroom platform for teaching multimodal neuroscience and physiological signal processing.

**Keywords:** neuroscience education; electroencephalography (EEG); functional near-infrared spectroscopy (fNIRS); photoplethysmography (PPG); brain–computer interface (BCI); event-related potential (ERP)

---

## 1. Introduction

Closed-loop brain–computer interfaces (BCIs) and neurofeedback systems turn ongoing brain, cardiac, or movement signals into real-time visual or auditory feedback so that users can observe physiological states or control interactive programs (Sitaram et al., 2017; Enriquez-Geppert et al., 2017; Lotte et al., 2013). Beyond clinical research, working with live physiological signals is a valuable hands-on way for students to learn about human neuroscience, mobile brain imaging (Mathewson, 2024), media art, and brain–computer music interfacing (Miranda & Castet, 2014). Over the past two decades, open-source analysis toolboxes (Delorme & Makeig, 2004), portable dry-electrode EEG headbands, and small single-board computers have made it practical to record brain activity in regular classrooms rather than shielded laboratory rooms (Krigolson et al., 2017; Mathewson et al., 2017; Kuziek et al., 2017, 2018). In parallel, browser-based teaching dashboards such as *EEGEdu* (https://eegedu.com; Mathewson, 2026) allow students to inspect live brain waves, frequency spectra, and band powers in pre-built graphs. Once students understand those basic graphs, however, a common teaching question arises: how can students with little or no programming background move from passively watching pre-made charts to building their own neurofeedback games, sound synthesizers, blood-flow visualizers, and event-related potential (ERP) experiments?

Educational programming tools such as `Processing` (Reas & Fry, 2007), `Scratch` (Resnick et al., 2009), `p5.js` (McCarthy et al., 2015), and `jsPsych` (de Leeuw, 2015) follow a constructionist approach (Papert, 1980): beginners learn best when a tool has a "low floor" (making it easy to run a first working program in minutes), a "high ceiling" (allowing more complete experiments as skills grow), and "wide walls" (supporting many kinds of student projects, from visual art and music to psychology tasks). In typical BCI workflows, the starting barrier is too high for a semester course. Changing the size of a circle on screen with live alpha waves ($8\text{--}12\text{ Hz}$), forehead oxygenation, or head tilt usually requires installing an operating-system Bluetooth program, streaming data over a network socket (`LabStreamingLayer`), running a Python or C++ filtering script, and sending values to a separate graphics engine. Setting up and troubleshooting these separate programs often takes up valuable lab time before students can focus on the neuroscience concepts.

To give students and instructors a simpler starting point, we created **BrainImation** (https://github.com/kylemath/Brainimation), a browser-based coding environment that links consumer Muse headbands—including EEG, optical pulse and blood oxygenation (PPG/fNIRS), and 3D head motion sensors—directly to the `p5.js` graphics and `p5.sound` audio libraries (McCarthy et al., 2015) (**Figure 1**). By opening a single web link in Chrome, Edge, or Opera, a student can connect a Muse headband (Krigolson et al., 2017; Kuziek et al., 2017, 2018)—or click `Simulate Data` in any browser when working at home without hardware—and run a complete neurofeedback animation in just 11 lines of JavaScript (`examples/basic.js`):

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

In the sections that follow, we describe how BrainImation is organized for classroom use and report how undergraduate students used it in a laboratory course. Section 2 explains how the browser connects to different generations of Muse headbands and how both live and simulated signals are organized into a single `eegData` object. Section 3 describes the learning supports built into the editor, including the 148-item reference drawer and the visual catalogue of 226 sketches across 18 categories. Section 4 presents four core teaching modules—audio sonification, online ERP trial averaging, optical fNIRS superficial skin regression, and head-motion tracking with adaptive artifact filtering—showing the core code alongside simulation plots that illustrate how each method works. Finally, Section 5 reports an analysis of $N = 69$ examination programs written by $N_{\text{students}} = 30$ undergraduate students in an upper-level cognitive neuroscience laboratory course.

---

## 2. Connecting Headbands and Simulating Signals in the Browser

### 2.1 Supporting Four Generations of Muse Headsets (`muse-browser.js`)

In a university teaching lab, a classroom set of equipment often includes a mix of older and newer headsets bought over several years. A practical challenge for browser-based instruction is that older WebBluetooth libraries (`muse-js`) only work reliably with the original Muse 2016 headband: they fail with a connection error on Muse 2 and Classic Muse S headbands because those headsets wait for a wake-up command before listing their sensor streams, and they do not recognize the newer Muse S Athena headband, which packs all of its sensors into a single combined data stream. To let students connect whichever headband they are handed in lab without installing external software, BrainImation includes a lightweight (38.0 KB), self-contained WebBluetooth connection script (`muse-browser.js`; **Table 1**).

| Feature | Desktop LSL (`muselsl`+Py) | Legacy `muse-js` (v3.0) | **BrainImation (`muse-browser.js`)** |
| :--- | :--- | :--- | :--- |
| **Setup Required** | OS BLE + Python + LSL | $473.0\text{ KB}$ (`RxJS` bundle) | **$38.0\text{ KB}$ (No install, $12.5\times$ smaller)** |
| **Connection Flow** | Native desktop app | Single-step (fails on Muse 2/S) | **Two-Step Wake-Up + Athena Decoder** |
| **Muse 2016** | Supported | Supported (EEG only) | **Supported (EEG, IMU, Battery)** |
| **Muse 2 / Classic S** | OS-dependent | Fails to connect | **Supported (EEG, 3-Ch PPG, IMU)** |
| **Muse S Athena** | Unsupported | Unsupported | **Supported (EEG, Dual-Distance PPG/fNIRS, IMU, DRL/REF)** |
| **Built-In Simulator** | None (Hardware req.) | Single-channel demo | **4-Ch EEG + Dual-Distance PPG/fNIRS + 3D Head Motion** |

When a student clicks `Connect Muse`, the connection script automatically checks whether the paired headset is a Classic Muse (Muse 2016, Muse 2, or Classic Muse S) or a Muse S Athena. For Classic Muse headsets, the script first opens the control channel, sends a preset and stream-start command so the headset exposes its sensor streams, and then subscribes to the EEG, optical PPG, accelerometer, gyroscope, and battery streams. For the Muse S Athena, the script subscribes to the headset's combined sensor stream and unpacks the tagged subpackets for 4- or 8-channel EEG, multi-wavelength optical PPG/fNIRS (Red $660\text{ nm}$, Near-Infrared $730\text{ nm}$, and Infrared $850\text{ nm}$ across both short $8\text{ mm}$ and long $20\text{ mm}$ forehead sensor spacings), 6-axis head motion, forehead contact voltages, and battery telemetry. The top toolbar also provides a `PPG: ON/OFF` button (`muse.setPPGMode(enabled)`) so students can turn the bright Red and Infrared forehead LEDs on when studying optical blood flow (`p1041`/`p50`) or turn them off during EEG-only exercises (`p1035`/`p21`):

```javascript
// Simplified two-step connection flow in muse-browser.js
// Step 1: Connect control channel first, then wake up sensor streams
this.controlChar = await this.service.getCharacteristic(CONTROL_CHAR_UUID);
await this.sendCommand('h');      // Halt previous stream
await this.sendCommand(preset);   // 'p50' (Classic EEG+PPG) or 'p1041' (Athena 16-ch optics)
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

### 2.2 A Shared `eegData` Object and Built-In Simulator for Homework and Lab Use

A central design goal for classroom use is that student code should look identical whether it is running on a physical headband in the lab or running on a student's laptop at home. To make this possible, both the live Bluetooth manager and the built-in signal simulator (`EEGSimulator`) write their outputs to the same global JavaScript object, `window.eegData`. This object organizes signals into five everyday categories that students can read inside `draw()`.

First, for frequency-band neurofeedback projects, `eegData` provides smoothed band powers scaled between $0.0$ and $1.0$ (`delta`, `theta`, `alpha`, `beta`, and `gamma`), both averaged across the headband and for each individual electrode (`TP9`, `AF7`, `AF8`, `TP10`). During live hardware recordings, these values are updated from 1-second (256-sample) sliding Hanning-windowed Fourier transforms (`MuseEEGManager.calculateFrequencyBands`) on 256 Hz raw data after rejecting windows with large $>150\ \mu\text{V}$ eye-blink or muscle spikes, whereas the built-in signal simulator (`EEGSimulator`) drives band power envelopes directly from the interactive Attention and Meditation sidebar sliders alongside 256 Hz raw multi-channel EEG synthesis. Second, for state-monitoring and time-domain ERP tasks, `eegData` provides summary `attention` and `meditation` indices in $[0.0, 1.0]$ along with 256 Hz microvolt sample buffers (`raw`, `getRawChannel(ch, N)`, `getRecentEpoch(N)`, and `downloadCSV()`).

Third, for cardiac and optical brain-imaging lessons, `eegData` provides 64 Hz forehead photoplethysmography (PPG) and functional near-infrared spectroscopy (fNIRS) values, including the pulse waveform (`ppgPulse`), heart rate in beats per minute (`heartRate`), separate short-distance ($8\text{ mm}$) and long-distance ($20\text{ mm}$) optical channels (`ppgShort`, `ppgLong`), and real-time oxygenated and deoxygenated hemoglobin estimates ($\Delta[\text{HbO}_2]$, $\Delta[\text{HHb}]$, $\text{SpO}_2$) in `fnirsRegression`. Fourth, for movement interaction and artifact-removal lessons, `eegData` provides 52 Hz 3-axis accelerometer (`accel`) and gyroscope (`gyro`) readings, 3D head tilt angles (`orientation.pitch`, `roll`, `yaw`), 1st-order head velocity (`velocity`), 2nd-order 3D head position (`position`), and motion-cleaned EEG traces (`clean`). Fifth, for hardware diagnostics, `eegData` exposes battery level, die temperature, forehead ground voltages (`drlRef`), and per-electrode skin contact quality (`contactQuality`).

When a student clicks `Simulate Data` (**Figure 2B**), `EEGSimulator` generates realistic multi-channel signals across all five of these categories at their native sampling rates (256 Hz 4-channel EEG with occasional frontal eye blinks and triggered N170/P300 ERP responses, 64 Hz dual-distance optical pulse and blood-flow waves, and 52 Hz 3D head nodding and tilting) and displays Attention and Meditation sliders in the sidebar so students can test how their sketches respond to changing brain states.

---

## 3. Classroom Coding Supports and the 226-Sketch Visual Catalogue

### 3.1 Autocomplete, Click-to-Insert Reference Drawer, and Sharing Tools

Because most psychology, neuroscience, and media-arts students enter the course with little or no JavaScript experience, the BrainImation editor includes several built-in supports to reduce typing errors and syntax frustration (**Figure 2A**). The left pane uses the VS Code Monaco editor configured with custom autocomplete: typing `eegData.` pops up a menu of available brain, optical, and motion properties with brief explanations. Alongside the editor, a collapsible right-hand Reference Drawer organizes **148 functions and variables across 5 topic tabs**: *Sensors / IMU & PPG* (41 items), *P5.js* drawing and math functions (38 items), *Input* mouse, keyboard, and touch handlers (27 items), *EEG Data* properties and buffers (26 items), and *Sound* synthesis tools (16 items), plus an optional *AI Helper* tab where students can paste their own API key if permitted by the instructor. Clicking any item in the Reference Drawer shows how it works, and clicking it a second time inserts a fill-in-the-blank code snippet directly into the editor at the cursor.

To help students troubleshoot audio and share their work for grading, the top toolbar also includes a `Test Sound` button that plays a 1-second 440 Hz reference tone to wake up browser audio permissions, an `About` guide, mobile fullscreen controls, and URL sketch loading (`?sketch=`) so students and instructors can share complete playable programs via a single web link. Behind the scenes, whenever a student clicks `Run Code`, the editor automatically resets the canvas and binds all `p5.js` and `p5.sound` functions to the global window so standard introductory `p5.js` tutorials work without modification.

### 3.2 The Visual Catalogue: 226 Sketches Organized Across 18 Categories

Rather than asking students to start from a blank page, BrainImation includes a searchable **Visual Catalogue Window (`Catalogue`)** containing **226 runnable sketches across 18 categories** ($\text{median} = 111\text{ LOC}$, range $11\text{--}758\text{ LOC}$; **Figure 1B,C** and **Figure 2C,D**), each shown with a preview thumbnail card. The 18 categories are grouped into six learning tracks that progress from 11-line introductory examples to complete multimodal experiments and past student projects.

The first track consists of the **Core 10-Category EEG and Creative-Coding Scaffolds** ($N = 36$ sketches, $\text{median} = 32\text{ LOC}$, range $11\text{--}111\text{ LOC}$). These short examples introduce one concept at a time across ten topics: *Getting Started*, *Brain Wave Visualizations*, *Attention & Meditation*, *Particle Systems*, *3D & Advanced*, *Drawing & Interaction*, *Raw EEG Data*, *Noise & Generative*, *Animation & Motion*, and *Sound & Music*. Students can open a 20–35 line sketch, see how a brain wave band controls color, particle speed, 3D rotation, or webcam effects, and immediately modify the numbers to test their own ideas.

Moving from brain waves to optical blood-flow sensing, the second track is the **PPG and Optical (fNIRS) Studio** ($N = 10$ sketches, $\text{median} = 198\text{ LOC}$). These visual lessons walk students step by step through forehead optical sensing: starting from a basic pulse ring and three raw optical channels (ambient photodetector baseline, Red $660\text{ nm}$, and Infrared $850\text{ nm}$, plus Near-Infrared $730\text{ nm}$ on Muse S Athena), moving to oxygenated and deoxygenated hemoglobin traces and a 6-row visual derivation of the Modified Beer–Lambert Law, inspecting a 3D rotatable headband diagram that compares the Muse S Athena and Muse 2 sensor layouts, comparing $8\text{ mm}$ short-channel skin signals against $20\text{ mm}$ cortical signals, and playing pulse- and breath-paced biofeedback games.

Following the same step-by-step teaching approach for movement sensors, the third track is the **Motion, IMU, and Broadcast Sensors Studio** ($N = 11$ sketches, $\text{median} = 215\text{ LOC}$). Individual sketches let students explore the 3-axis accelerometer inclinometer, 3-axis gyroscope gimbal, 3D head pitch and roll horizon, battery and temperature monitors, and forehead electrode contact quality. Building on these basics, dedicated lessons visually demonstrate how raw acceleration integrates into velocity and 3D head position, how head motion can be subtracted from noisy EEG traces, and how head pitch and roll can steer musical instruments (a head-controlled theremin and beat synthesizer) or 3D tilt-labyrinth and starfield flight games.

Combining brain and cardiac signals, the fourth track is the **Multimodal (EEG + PPG + HR) Studio** ($N = 5$ sketches, $\text{median} = 120\text{ LOC}$). These examples illustrate how electrical brain activity and cardiovascular signals interact across three distinct physiological time scales: fast millisecond phase-locked ERP deflections ($50\text{--}800\text{ ms}$), sub-second to second changes in oscillatory EEG band power and beat-to-beat heart rate intervals ($0.5\text{--}2\text{ s}$), and the slower $4\text{--}6\text{ s}$ hemodynamic lag of prefrontal blood oxygenation ($\Delta[\text{HbO}_2]$ and $\Delta[\text{HHb}]$). In particular, the Heartbeat-Evoked Potential (HEP) sketch locks 256 Hz EEG epochs to the internal systolic peak of the forehead optical pulse wave rather than an external visual flash, helping students understand endogenous event-locked averaging, brain–heart interoception, and pulse transit time (PTT). Because triggering relies on the forehead PPG systolic wave rather than an ECG chest R-wave, the $\sim 150\text{--}250\text{ ms}$ baseline transit delay from ventricular depolarization and its beat-to-beat PTT jitter ($\sim 10\text{--}25\text{ ms}$) introduce physiological temporal smoothing to the recovered optical HEP relative to an ECG-gated potential.

To show how these building blocks come together in larger applications, the fifth track includes the **Closed-Loop BrainGames Arcade and EEGEdu Curriculum Modules** ($N = 43$ sketches total). The *BrainGames* category ($N = 14$, $\text{median} = 514\text{ LOC}$) provides 14 complete neurofeedback arcade games (such as *Golf Driving Range*, *Archery Range*, *Rowing Calm*, *Balance Beam*, and *Zen Breakout*) that share a common scoreboard and smoothing helper (`window.BGShared`), while 13 *EEGEdu Modules* and 16 *Classic `p5.eegedu`* sketches provide interactive versions of standard classroom labs (such as oddball ERPs and 4 Hz / 11 Hz steady-state visual evoked potentials with CSV data export).

Finally, the sixth track in the Visual Catalogue preserves two **Archival Classroom Galleries** ($N = 121$ student projects total): 95 submissions from the *2025 Neurotech Class Catalogue* ($\text{median} = 149\text{ LOC}$) and 26 projects from the *2022 NeuroArt Class Gallery* ($\text{median} = 43\text{ LOC}$). Keeping past student projects directly inside the catalogue gives new cohorts concrete examples of what peers with similar backgrounds were able to build. Across all 226 catalogue sketches (**Figure 2D**), `eegData.alpha` is the most frequently used signal ($58.0\%$, $131/226$), followed by `eegData.beta` ($42.0\%$, $95/226$), `eegData.attention` ($33.6\%$, $76/226$), `eegData.theta` ($33.2\%$, $75/226$), 256 Hz raw/epoch buffers ($19.0\%$, $43/226$), 52 Hz IMU head motion ($15.5\%$, $35/226$), Web Audio synthesis ($8.0\%$, $18/226$), and 64 Hz optical PPG/fNIRS ($7.1\%$, $16/226$).

---

## 4. Core Teaching Modules: Code Examples and Simulation Benchmarks

### 4.1 Audio Sonification and Frequency-Modulation Synthesis (`brainSynth.js`)

In the *Sound & Music* sketches, students learn how continuous brain wave bands can control live sound synthesis in the browser (**Figure 3A,B**). After starting with simple pitch mapping (`brainBeats.js`) and pentatonic scale notes (`alphaMusic.js`), students can open `brainSynth.js` to see how four EEG metrics control a frequency-modulation (FM) synthesizer (Chowning, 1973). In the sketch code below, `alpha` sets the main carrier pitch, `beta` sets the modulator speed, `theta` sets the modulation depth (how rich or complex the tone sounds), and `attention` smoothly ramps the volume:

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

As shown in the simulation plots in **Figure 3A,B**, when a user relaxes with eyes closed (high alpha, low beta and theta), the synthesizer produces a clean, steady $650\text{ Hz}$ sine wave; when beta and theta increase during active engagement, the modulator adds sideband frequencies around the carrier that students can both hear and see on the live canvas spectrum analyzer.

### 4.2 Online 4-Channel ERP Averaging (`epochs.js`) and Control Smoothing

To teach event-related potentials (ERPs), `epochs.js` shows students how time-locked averaging extracts small evoked brain responses from much larger ongoing EEG waves (Luck, 2014; Krigolson et al., 2017) (**Figure 3C**). Because the Muse headband places its reference (`REF`) and driven right leg (`DRL`) electrodes on the center of the forehead (`Fpz`), physical posterior recordings ($V_{\text{TP9/TP10}} - V_{\text{Fpz}}$) reflect a differential potential against an active anterior site. In physical recordings, this montage reverses the polarity of classic mastoid-referenced vertex or parietal oddball dipoles unless students re-reference posterior channels against anterior electrodes ($V_{\text{TP}} - V_{\text{AF}}$; Krigolson et al., 2017) or invert the sign in software. In `EEGSimulator`, however, we intentionally inject canonical textbook polarities ($-6.5\ \mu\text{V}$ N170, $+9.5\ \mu\text{V}$ P300) directly into simulated channel `TP9` (**Figure 3C**). This ensures that beginners first recognize standard component morphology and master $\sqrt{K}$ averaging before navigating differential montage re-referencing. Every $1.5\text{ s}$ (90 frames), the sketch flashes a visual stimulus on screen. It then waits 48 frames ($+800\text{ ms}$) so the full post-stimulus response has arrived in the 256 Hz buffer, pulls the latest 256 samples ($1,000\text{ ms}$, covering $-200\text{ ms}$ before the flash to $+800\text{ ms}$ after the flash), subtracts the $-200\text{ to }0\text{ ms}$ pre-stimulus baseline average, rejects epochs with large $>100\ \mu\text{V}$ peak-to-peak eye-blink spikes, and averages the clean trial into a running grand average across all four electrodes:

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

In theory, averaging $K$ independent trials reduces background EEG noise by a factor of $1/\sqrt{K}$ ($2.24\times$ at $K=5$ and $4.47\times$ at $K=20$), a scaling confirmed across 1,000 simulated Monte Carlo runs where the mean pre-stimulus baseline root-mean-square (RMS) noise drops from $13.7\ \mu\text{V}$ at $K=1$ to $6.1\ \mu\text{V}$ at $K=5$ and $3.1\ \mu\text{V}$ at $K=20$. In the single illustrative realization plotted in **Figure 3C** (where random trial-to-trial fluctuations over the short 51-sample baseline window cause slight deviations from the exact $1/\sqrt{K}$ curve), the single-trial baseline RMS is $17.4\ \mu\text{V}$ ($\text{SNR} = 0.55$), dropping to $5.7\ \mu\text{V}$ at $K=5$ ($\text{SNR} = 1.66$) and $2.7\ \mu\text{V}$ at $K=20$ ($\text{SNR} = 3.48$) to reveal the simulated N170 ($-6.5\ \mu\text{V}$ at $+170\text{ ms}$) and P300 ($+9.5\ \mu\text{V}$ at $+340\text{ ms}$) peaks. Correspondingly, the trial-to-trial Standardized Measurement Error ($\text{SME} = \text{SD}_{\text{trials}} / \sqrt{K}$; Luck et al., 2021) for the P300 mean amplitude window ($+280\text{ to }+400\text{ ms}$) improves from $8.7\ \mu\text{V}$ ($K=1$) to $3.6\ \mu\text{V}$ ($K=5$) and $1.9\ \mu\text{V}$ ($K=20$). Including the $100\ \mu\text{V}$ peak-to-peak rejection check is equally instructive for students: when a single $115\ \mu\text{V}$ frontal eye blink ($166.2\ \mu\text{V}$ peak-to-peak excursion) occurs during the P300 window in 1 of the 20 trials, an unrejected average suffers up to $+6.7\ \mu\text{V}$ of false positive bias (inflating P300-window error from $3.04\ \mu\text{V}$ to $4.52\ \mu\text{V}$), whereas rejecting that contaminated epoch restores the P300-window error to $3.33\ \mu\text{V}$. For continuous neurofeedback games (**Figure 3D**), students also learn to smooth frame-to-frame fluctuations with a one-line exponential moving average (`smoothAlpha = 0.85 * smoothAlpha + 0.15 * eegData.alpha`), which reduces frame-to-frame jitter variance by $98.4\%$, and to use separate turn-on and turn-off thresholds (hysteresis) so game states do not flicker rapidly.

### 4.3 Optical PPG/fNIRS and Short-Channel Skin Regression

The optical studio sketches introduce students to how consumer headbands measure forehead pulse and blood oxygenation using Red ($660\text{ nm}$) and Infrared ($850\text{ nm}$) light (Delpy et al., 1988; Scholkmann et al., 2014), and how slow hemodynamic responses (peaking $4\text{--}6\text{ s}$ after cognitive task onset) differ from millisecond EEG deflections. Dual wavelengths are selected because they straddle the hemoglobin isosbestic point ($\sim 800\text{ nm}$), where oxygenated ($\text{HbO}_2$) and deoxygenated ($\text{HHb}$) hemoglobin exhibit equal molar absorption: below $800\text{ nm}$, $\text{HHb}$ absorption dominates, whereas above $800\text{ nm}$, $\text{HbO}_2$ dominates, providing the differential contrast required by the continuous-wave Modified Beer–Lambert Law (under the standard assumptions of constant differential pathlength factors across time and approximately homogeneous tissue scattering). In reflectance diffuse optical tomography, backscattered photons follow banana-shaped migration trajectories with an effective penetration depth of roughly $\sim d/3\text{ to }d/2$ of optode separation $d$ (Delpy et al., 1988; Saager & Berger, 2005). Consequently, the inner $8\text{ mm}$ short channel penetrates only $\sim 2.7\text{--}4.0\text{ mm}$ (sampling exclusively superficial scalp and skull vasculature), whereas the outer $20\text{ mm}$ long channel penetrates $\sim 6.7\text{--}10.0\text{ mm}$ into superficial prefrontal cortex. Because the Muse S Athena headband (and our simulator) provides both short and long channels, students can see how linear regression removes shallow skin hemodynamics to isolate cortical activation:

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

As shown in **Figure 4A,B**, subtracting the scaled $8\text{ mm}$ short-channel signal from the $20\text{ mm}$ long-channel signal suppresses simulated heartbeat, breathing, and Mayer-wave skin fluctuations by $20.1\text{ dB}$, reducing the error of the recovered cortical oxyhemoglobin ($\Delta[\text{HbO}_2]$) curve from $1.15\ \mu\text{M}$ to $0.11\ \mu\text{M}$ ($1.147 \rightarrow 0.113\ \mu\text{M}$ unrounded; $r = 0.46 \rightarrow 0.99$).

### 4.4 3D Head Motion Integration and Adaptive EEG Artifact Removal

The motion studio sketches teach two ways of using the headband's 52 Hz 3-axis accelerometer and 3-axis gyroscope. First, in the stacked kinematics lesson (**Figure 4C**), students see how accelerometer and gyroscope readings are combined to track 3D head tilt (`pitch`, `roll`, `yaw`), how gravity is subtracted to isolate linear head acceleration, and how integrating once gives head velocity ($\text{cm/s}$) and integrating a second time gives 3D head displacement ($\text{cm}$). Second, in the adaptive motion filter lesson (**Figure 4D**), students see how those same 6-axis motion signals can be used as a zero-lag linear spatial combiner (one instantaneous weight per IMU axis) to subtract synchronous head-movement artifacts from the EEG electrodes in real time (Widrow et al., 1975; Mathewson, 2024):

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

In the simulation benchmark in **Figure 4D**, when head nodding and tilting add $\pm 85\ \mu\text{V}$ movement swings to the frontal EEG trace, the 6-tap adaptive filter learns the coupling weights within a few hundred milliseconds and reduces the synchronous motion artifact by $19.2\text{ dB}$, lowering the trace error from $43.7\ \mu\text{V}$ to $4.8\ \mu\text{V}$ ($r = 0.31 \rightarrow 0.95$).

---

## 5. Classroom Evaluation ($N = 69$ Projects from $N_{\text{students}} = 30$ Undergraduate Students)

To see how undergraduate psychology and neuroscience students used BrainImation in an actual course, we examined all $N = 69$ verified unique examination submissions written by $N_{\text{students}} = 30$ students in an upper-level cognitive neuroscience laboratory class (`PSYCH 403`, University of Alberta, Research Ethics Board Protocol `Pro00050069`; **Table 2** and **Figure 5**). The archive contains $N = 69$ submissions from $N_{\text{students}} = 30$ unique learners because several students submitted iterative assignment versions (such as Assignment 2 exploratory sketches preceding Midterm Part 1, or early draft files preserved alongside revised submissions). To prevent pseudoreplication from multiple submissions per learner, we evaluated both the aggregate submission pool and a per-student clustered summary that collapses each learner's submissions into a single median value. Most students entered the class with little or no prior coding experience. Instruction followed a multi-week sequence: during guided weekly laboratory sessions, students first opened and modified the short built-in teaching scaffolds while paired with physical Muse headbands; for homework and exam preparation, they developed and debugged their own state machines on their personal laptops using `EEGSimulator` (testing threshold transitions with the Attention and Meditation sliders and verifying epoch extraction on synthetic ERP triggers); finally, they validated their finished programs on live Muse headbands in lab and submitted their code and playable `?sketch=` web links so instructors and teaching assistants could run and grade each submission directly in the browser. Each student completed two graded practical examination assignments: a continuous neurofeedback game or visualizer (Cohort 1, Midterm Part 1, $N = 40$) and an online 4-channel event-related potential experiment (Cohort 2, Midterm Part 2, $N = 29$).

| Catalogue Group / Student Cohort | $N$ | Med. LOC | IQR LOC | Min–Max | Primary Signals Used | Project Type |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Core 10-Category Scaffolds** | 36 | 32 | $27\text{--}36$ | $11\text{--}111$ | EEG bands, Att/Med, 256 Hz raw | Short introductory teaching templates |
| **PPG, fNIRS, IMU & Multimodal Studios** | 26 | 200 | $130\text{--}245$ | $69\text{--}510$ | 64 Hz PPG/fNIRS, 8/20 mm, 6-DOF IMU | Step-by-step optical & motion lessons |
| **BrainGames, EEGEdu & Classic `p5.eegedu`** | 43 | 131 | $38\text{--}438$ | $17\text{--}758$ | Closed-loop bands, SSVEP, ERP | 14 arcade games + 29 lab modules |
| **Archival Class Galleries (2022 & 2025)** | 121 | 126 | $50\text{--}174$ | $12\text{--}414$ | Student BCI & NeuroArt sketches | Playable past student projects |
| **Full Visual Catalogue (`manifest.json`)** | **226** | **111** | **$38\text{--}185$** | **$11\text{--}758$** | **18 categories with thumbnails** | **Complete in-browser sketch library** |
| **Exam Cohort 1: Neurofeedback & Games** | 40 | 121 | $99\text{--}171$ | $38\text{--}378$ | `eegData.alpha`, `beta`, `attention` | Student neurofeedback games & art |
| **Exam Cohort 2: Online 4-Ch ERP Tasks** | 29 | 176 | $153\text{--}221$ | $117\text{--}306$ | 256 Hz `TP9, AF7, AF8, TP10` | Oddball P300, Face N170, Stroop, MMN |
| **Per-Student Clustered Medians** | 30 | 164 | $122\text{--}173$ | $87\text{--}302$ | One median value per student | Independent student-level summary |
| **All Exam Submissions Combined** | **69** | **155** | **$116\text{--}189$** | **$38\text{--}378$** | **Smoothing (66.7%), $\alpha$ (53.6%), ERP (42.0%)** | **Graded `PSYCH 403` exam archive** |

*Table 2 Note:* The $N = 69$ graded examination projects (Cohort 1 $N = 40$; Cohort 2 $N = 29$) are preserved alongside 26 additional course and laboratory sketches inside the 95-sketch *2025 Neurotech Class Catalogue*.

Here, executable LOC is defined by a simple single-clause rule: non-empty, non-comment lines of JavaScript code (excluding blank lines and lines starting with `//`, `/*`, `*`, or `*/`). Across all $N = 69$ examination projects, students started from the 32-line introductory scaffolds and wrote working programs with a median length of $155\text{ executable lines of code}$ ($\text{IQR} = 116\text{--}189\text{ LOC}$, range $38\text{--}378\text{ LOC}$; Mann–Whitney $U = 2437.0$, $p < 10^{-15}$; **Figure 5A**). When we grouped multiple submissions from the same person into a single median value per student ($N_{\text{students}} = 30$ independent learners), the per-student median was $164\text{ LOC}$ ($\text{IQR} = 122\text{--}173\text{ LOC}$, range $87\text{--}302\text{ LOC}$, $p < 10^{-11}$, rank-biserial correlation $r_{rb} = 0.99$). In Cohort 1 ($\text{median} = 121\text{ LOC}$, range $38\text{--}378\text{ LOC}$), students built custom closed-loop games such as an *Ice Cream Cone Catcher* driven by alpha/beta target zones (195 LOC; **Figure 5C**) and an *EEG Flappy Bird* with adaptive difficulty (160 LOC). In Cohort 2 ($\text{median} = 176\text{ LOC}$), students expanded the 85-line `epochs.js` scaffold into complete multi-condition ERP experiments comparing target vs. standard oddball stimuli or Face vs. Object N170 responses across all four electrodes (148 LOC; **Figure 5D**). Crucially, every single student submission in Cohort 2 ($29/29 = 100\%$) exceeded the 85-LOC `epochs.js` starter template (range $117\text{--}306\text{ LOC}$, median $176\text{ LOC}$, median $2.07\times$ code expansion; Wilcoxon signed-rank $W = 435.0, p = 1.86 \times 10^{-9}$), demonstrating substantial student-authored experimental scaffolding.

Inspecting the non-comment lines of student code both across the combined cohort ($N = 69$; **Figure 5B**) and disaggregated by assignment type reveals how students adapted their code to each paradigm. Explicit signal conditioning—moving-average smoothing, pre-stimulus baseline subtraction, or threshold hold timers—was implemented in $66.7\%$ ($46/69$) of all submissions, including $57.5\%$ ($23/40$) of Cohort 1 neurofeedback games and $79.3\%$ ($23/29$) of Cohort 2 ERP tasks. Continuous frequency-band and state metrics were concentrated in Cohort 1, where $92.5\%$ ($37/40$; $53.6\%$ overall) read `eegData.alpha`, $72.5\%$ ($29/40$; $42.0\%$ overall) read `eegData.beta`, $52.5\%$ ($21/40$; $34.8\%$ overall) read `eegData.attention`, and $70.0\%$ ($28/40$; $49.3\%$ overall) defined custom ES6 object classes or particle systems. Conversely, time-domain buffer operations defined Cohort 2, where $100.0\%$ ($29/29$; $42.0\%$ overall) implemented multi-trial ERP averaging state machines and $93.1\%$ ($27/29$; $39.1\%$ overall) indexed directly into the 256 Hz raw electrode arrays (`TP9`, `AF7`, `AF8`, `TP10`), while $20.7\%$ ($6/29$) also used custom object classes to manage stimulus trials. These $N = 69$ graded examination files are preserved alongside 26 additional course and laboratory sketches inside the 95-sketch *2025 Neurotech Class Catalogue* (together with 26 projects from the *2022 NeuroArt Class Gallery*), giving future classes a rich library of working peer examples.

---

## 6. Discussion

We designed BrainImation as a practical, easy-to-adopt browser environment for teaching students how to work with live physiological signals through creative coding. While companion dashboard tools such as *EEGEdu* (https://eegedu.com; Mathewson, 2026) help students understand EEG concepts through pre-built charts, BrainImation gives learners a place to write their own code using live brain waves, optical forehead blood-flow signals (PPG/fNIRS), and 3D head motion sensors (Papert, 1980; Resnick et al., 2009; de Leeuw, 2015). By handling Bluetooth connections for Muse 2016, Muse 2, Classic Muse S, and Muse S Athena headsets inside the webpage, providing a built-in signal simulator for homework use, and organizing 226 runnable examples and past student projects into a visual catalogue alongside a 148-item reference drawer, the tool lets classes spend their time on experimental design and signal interpretation rather than software installation.

Instructors and researchers should consider several practical limitations. First, the simulation benchmarks in Section 4 (**Figures 3** and **4**) illustrate how the in-browser algorithms work on synthetic signals with known ground truth; they are meant as clear teaching demonstrations rather than clinical hardware validations against research-grade fNIRS or wet-electrode EEG systems. In classroom ERP labs, instructors can also have students compute the trial-to-trial Standardized Measurement Error (SME; Luck et al., 2021) in the post-stimulus component window alongside pre-stimulus baseline RMS so learners can directly compare both data-quality metrics (Picton et al., 2000; Keil et al., 2014). Second, because Bluetooth packets arrive in small bursts and browser animation loops run at $60\text{ Hz}$ ($16.67\text{ ms}$ per frame), stimulus timestamps in browser ERP tasks have $\sim 15\text{--}45\text{ ms}$ of timing jitter compared with dedicated laboratory trigger cables (Krigolson et al., 2017; Kuziek et al., 2017, 2018). In the frequency domain, a uniform $30\text{ ms}$ ($45\text{ ms}$) timing jitter acts as a $\text{sinc}$ low-pass filter with a $-3\text{ dB}$ cutoff at $14.8\text{ Hz}$ ($9.8\text{ Hz}$) and a first spectral null at $33.3\text{ Hz}$ ($22.2\text{ Hz}$). Under $30\text{ ms}$ uniform jitter, a narrow $20\text{ ms}$ early sensory deflection retains only $65.5\%$ of its peak amplitude, whereas the broader N170 ($94.7\%$ retention) and P300 ($98.9\%$ retention) components remain well preserved across 20 averaged trials and offer a useful classroom lesson on real-time timing trade-offs. Third, dry forehead and ear sensors are naturally sensitive to eye blinks, forehead muscle tension, and head movement (Lotte et al., 2013; Mathewson et al., 2017; Saager & Berger, 2005); the built-in spike rejection, short-channel optical regression, and 6-tap adaptive IMU filter help students see how these artifacts are addressed in practice, though because the 6-tap NLMS filter uses one instantaneous weight per IMU axis, delayed mechanical settling or nonlinear electrode slip on the skin is only partially removed and does not replace careful recording habits. Fourth, pairing a physical Muse headband via WebBluetooth requires a Chromium-based browser (Chrome, Edge, Opera, or Bluefy on iOS/iPadOS), although the signal simulator and full coding editor work in Safari and Firefox on any laptop. Finally, our classroom evaluation measured the length and features of $N = 69$ student projects rather than pre/post exam scores, and students could draw on both the built-in examples and optional AI coding tools, so code length reflects the scope of the projects students put together rather than memorized syntax. Within these everyday classroom bounds, BrainImation provides a straightforward, zero-install way for students to learn neuroscience and physiological signal processing by building their own interactive programs.
