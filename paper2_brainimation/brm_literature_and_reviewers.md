# *Behavior Research Methods* (BRM) Literature Synthesis, Action Editor Cross-Reference, and Reviewer Recommendations for BrainImation

*Generated via parallel swarm search across `literature-search-arxiv`, `pubmed-database`, `literature-search-biorxiv`, `literature-search-europepmc`, and live journal verification on `link.springer.com/journal/13428` and `psychonomic.org`.*

---

## Part 1: Top 18 Recent Papers (2020–2026) to Consider Discussing / Citing

All 18 deduplicated papers below were verified against `references2.bib` (none are currently cited) and mapped to specific subsections of `paper2_brainimation.tex`. Eight were independently surfaced by multiple database agents.

### Theme 1: Browser-Based & Online Experiment / BCI Instrumentation
1. **Henninger, F., Shevchenko, Y., Mertens, U. K., Kieslich, P. J., & Hilbig, B. E. (2022).** `lab.js`: A free, open, online study builder. *Behavior Research Methods*, 54(2), 556–573.
   - **Identifiers:** PMID: `34322854` | PMCID: `PMC9046347` | DOI: `10.3758/s13428-019-01283-5`
   - **Where to Cite (`paper2_brainimation.tex`):** **Section 1.2.1 (Constructionist Design Goals)** and **Section 3.1 (Autocomplete & Reference Drawer)**. Alongside `jsPsych` (`deleeuw2015jspsych`), `lab.js` is the flagship *BRM* open-source browser study builder combining visual scaffolding with direct JavaScript code customization.
2. **de Leeuw, J. R., Gilbert, R. A., Petrov, N., & Luchterhandt, B. (2023).** Simulating behavior to help researchers build experiments. *Behavior Research Methods*, 55(4), 1863–1873.
   - **Identifiers:** PMID: `35768741` | PMCID: `PMC9239891` | DOI: `10.3758/s13428-022-01899-0`
   - **Where to Cite:** **Section 1.3.1 (Browser-Native Hardware & Simulator)**, **Section 2.2 (Shared Signal State & Simulator)**, and **Section 5.1.2 (Lab-to-Home-to-Lab Cycle)**. Directly supports BrainImation's core design philosophy of pairing live hardware acquisition with an in-browser simulator (`EEGSimulator`) so students and researchers can build, test, and debug experiments without hardware attached.
3. **Anwyl-Irvine, A., Dalmaijer, E. S., Hodges, N., & Evershed, J. K. (2021).** Realistic precision and accuracy of online experiment platforms, web browsers, and devices. *Behavior Research Methods*, 53(4), 1407–1426.
   - **Identifiers:** PMID: `33140376` | PMCID: `PMC8367876` | DOI: `10.3758/s13428-020-01501-5`
   - **Where to Cite:** **Section 6.2.2 (WebBluetooth & 60 Hz Jitter)**. Provides the canonical *BRM* empirical benchmark for browser frame-rendering jitter ($\sim 15\text{--}45\text{ ms}$) that underpins our analytical low-pass filter derivation for N170 and P300 ERP amplitude retention at 60 FPS.
4. **Lukács, G., & Gartus, A. (2023).** Precise display time measurement in JavaScript for web-based experiments. *Behavior Research Methods*, 55(3), 1255–1269.
   - **Identifiers:** PMID: `35581437` | PMCID: `PMC10085926` | DOI: `10.3758/s13428-022-01835-2`
   - **Where to Cite:** **Section 4.2.2 (Epoch Extraction & Blink Rejection)** and **Section 6.2.2 (WebBluetooth & 60 Hz Jitter)**. Analyzes JavaScript `requestAnimationFrame` (RAF) display timing in browser experiments, directly relevant to `p5.js` `draw()` frame-locked stimulus presentation in `examples/epochs.js`.
5. **Kothe, C., Shirazi, S. Y., Stenner, T., Medine, D., Boulay, C., Grivich, M. I., Artoni, F., Mullen, T., Delorme, A., & Makeig, S. (2025).** The lab streaming layer for synchronized multimodal recording. *Imaging Neuroscience*, 3, imag.a.136 (preprint: **bioRxiv** 2024, `10.1101/2024.02.13.580071`).
   - **Identifiers:** PMID: `40959706` | PMCID: `PMC12434378` | DOI: `10.1162/imag.a.136`
   - **Where to Cite:** **Section 1.2.2 (Eliminating Desktop Dependencies)** and **Section 2.1 (Table 1)**. `paper2_brainimation.tex` explicitly mentions `LabStreamingLayer` and `Desktop LSL` without a bibliography citation; citing Kothe et al. (2025) closes that gap.
6. **Makowski, D., Pham, T., Lau, Z. J., Brammer, J. C., Lespinasse, F., Pham, H., Schölzel, C., & Chen, S. H. A. (2021).** NeuroKit2: A Python toolbox for neurophysiological signal processing. *Behavior Research Methods*, 53(4), 1689–1696.
   - **Identifiers:** PMID: `33528817` | DOI: `10.3758/s13428-020-01516-y`
   - **Where to Cite:** **Section 1.2.2 (Eliminating Desktop Dependencies)** and **Section 2.2 (Shared Signal State & Simulator)**. Positions BrainImation's shared signal object (`eegData.*`) as bringing accessible multimodal neurophysiological scripting (EEG, PPG/HRV, fNIRS, epochs) to the browser with zero Python installation.
7. **Pijálek, J., Vlk, K., & Bojar, O. (2026).** MEEDAV: A Synchronous Web Viewer for EEG, Eye-Tracking and Speech Data. *arXiv preprint*, `arXiv:2605.18296v1`.
   - **Identifiers:** arXiv: `2605.18296v1` | URL: https://arxiv.org/abs/2605.18296v1
   - **Where to Cite:** **Section 1.1.2 (Headbands vs. Pre-Built Dashboards)** and **Section 6.1.1 (From Dashboards to Creative Coding)**. Recent web viewer built for 4-channel Muse 2 EEG data; provides a clear contrast between read-only web inspection dashboards and BrainImation's constructionist live-coding IDE.

### Theme 2: Classroom & Undergraduate EEG / Neuroscience & Psychology Education
8. **Smith, K., Pilger, A., Amorim, M. L. M., Mircic, S., Reining, Z., Ristow, N., Miller, D., Leonhardt, A., Donovan, J. C., Meier, M., Marzullo, T. C., Serbe-Kamp, E., Steiner, A. P., & Gage, G. J. (2024).** Low-Cost Classroom and Laboratory Exercises for Investigating Both Wave and Event-Related Electroencephalogram Potentials. *Journal of Undergraduate Neuroscience Education (JUNE)*, 22(2), A129–A138.
   - **Identifiers:** PMID: `39355672` | PMCID: `PMC11440751` | DOI: `10.59390/YNPH4485`
   - **Where to Cite:** **Section 1.1.2 (Headbands vs. Pre-Built Dashboards)**, **Section 4.2 (Online ERP Averaging)**, and **Section 5.1.3 (Two-Cohort Exam Structure)**. Directly mirrors BrainImation's two-cohort pedagogical progression (continuous EEG alpha rhythms followed by oddball P300 ERP averaging with Monte Carlo noise benchmarks) while illustrating the offline Python/Colab analysis barrier that BrainImation removes.
9. **Hatton, S. L., Rathore, S., Vilinsky, I., & Stowasser, A. (2023).** Quantitative and Qualitative Representation of Introductory and Advanced EEG Concepts: An Exploration of Different EEG Setups. *Journal of Undergraduate Neuroscience Education (JUNE)*, 21(2), A119–A129.
   - **Identifiers:** PMID: `37588651` | PMCID: `PMC10426940` | DOI: `10.59390/GEBE4090`
   - **Where to Cite:** **Section 1.1.2 (Headbands vs. Pre-Built Dashboards)** and **Section 6.1.2 (Zero-Install Lab & Off-Lab Workflow)**. Evaluates portable wireless EEG vs. multi-channel setups for teaching introductory and advanced EEG concepts in undergraduate labs.
10. **Iemi, L., Wright, M., Pham, K., & Alexandrescu, A. (2026).** "I Can Code": An innovative workshop introducing students to coding in the context of neuroscience research. *Journal of Undergraduate Neuroscience Education (JUNE)*, 24(1), A42–A50.
    - **Identifiers:** PMID: `42820046` | PMCID: `PMC13625906` | DOI: `10.59390/001c.160812`
    - **Where to Cite:** **Section 1.2.1 (Constructionist Design Goals)**, **Section 3.1 (Autocomplete & Reference Drawer)**, and **Section 5.1 (Course Context & Workflow)**. Demonstrates how scaffolded coding instruction embedded in neuroscience tasks lowers coding anxiety among undergraduates with no prior programming background.
11. **Janssen, T. W. P., Grammer, J. K., Bleichner, M. G., Bulgarelli, C., Davidesco, I., Dikker, S., Jasińska, K. K., Siugzdaite, R., Vassena, E., Vatakis, A., Zion-Golumbic, E., & van Atteveldt, N. (2021).** Opportunities and limitations of mobile neuroimaging technologies in educational neuroscience. *Mind, Brain, and Education*, 15(4), 354–370. *(Companion preprint: **Davidesco et al., 2021**, Making BrainWaves: Portable Brain Technologies in Biology Education, **bioRxiv**, `10.1101/2021.07.02.450935`)*
    - **Identifiers:** PMID: `35875415` | PMCID: `PMC9292610` | DOI: `10.1111/mbe.12302`
    - **Where to Cite:** **Section 1.1.1 (Closed-Loop BCIs & Neurofeedback)** and **Section 5.1 (Course Context & Workflow)**. Synthesizes classroom portable EEG and mobile fNIRS education (`BrainWaves` curriculum) and documents classroom hardware/software setup bottlenecks.
12. **van Bueren, N. E. R., van Hoogmoed, A. H., van der Ven, S. H. G., & Jonkman, L. M. (2026).** Comparing aperiodic activity in consumer-grade and research-grade EEG: Reliability and association with mathematical ability. *Behavior Research Methods*, 58, 25.
    - **Identifiers:** PMID: `41493531` | PMCID: `PMC12775036` | DOI: `10.3758/s13428-025-02905-x`
    - **Where to Cite:** **Section 1.1.2 (Headbands vs. Pre-Built Dashboards)** and **Section 6.2.1 (Synthetic Benchmarks vs. Clinical Validation)**. 2026 *Behavior Research Methods* benchmark validating wireless consumer-grade EEG against research-grade BioSemi ActiveTwo in an educational setting ($N = 93$).

### Theme 3: Portable Muse EEG/ERP, PPG/HEP, fNIRS Short-Channel, Sonification, & Motion Filtering Validation
13. **Sabio, J., Williams, N. S., McArthur, G. M., & Badcock, N. A. (2024).** A scoping review on the use of consumer-grade EEG devices for research. *PLOS ONE*, 19(3), e0291186. *(See also **Cannard, Wahbeh, & Delorme, 2021**, Muse spectral validation against BioSemi, **bioRxiv** `10.1101/2021.11.02.466989`, and **Krigolson et al., 2021**, $N=1,000$ Muse ERP validation, *Front. Neurosci.*, PMID `33584194`)*
    - **Identifiers:** PMID: `38446762` | PMCID: `PMC10917334` | DOI: `10.1371/journal.pone.0291186`
    - **Where to Cite:** **Section 1.1.2 (Headbands vs. Pre-Built Dashboards)** and **Section 2.1 (Multi-Generation Muse Client)**. Updates consumer-grade EEG validation references beyond 2017–2018 by reviewing 916 studies across Muse, Emotiv, and OpenBCI platforms.
14. **Cannard, C., Wahbeh, H., & Delorme, A. (2024).** BrainBeats as an Open-Source EEGLAB Plugin to Jointly Analyze EEG and Cardiovascular Signals. *Journal of Visualized Experiments (JoVE)*, (206), e65829 (preprint: **bioRxiv** 2023, `10.1101/2023.06.01.543272`). *(Companion HEP validation: **Steinfath et al., 2025**, *Imaging Neuroscience*, PMID `40800754`, DOI `10.1162/imag.a.30`; and **Griadhi et al., 2026**, Muse 2 forehead PPG validation vs. Polar H10 ECG, **medRxiv** `10.64898/2026.10.05.26364782`)*
    - **Identifiers:** PMID: `38738870` | DOI: `10.3791/65829`
    - **Where to Cite:** **Section 3.2 (234-Sketch Visual Catalogue, Track 4 Multimodal Brain & Heart Studio)**. Track 4 highlights BrainImation's Heartbeat-Evoked Potential (HEP) sketch (time-locking 256 Hz Muse EEG to 64 Hz forehead PPG pulse peaks) but currently has no citations for HEP or Muse PPG validation; citing Cannard et al. (2024) and Steinfath et al. (2025) fills this gap.
15. **Takabatake, K., Kunii, N., Nakatomi, H., Shimada, S., Yanai, K., Takasago, M., & Saito, N. (2021).** Musical auditory alpha wave neurofeedback: Validation and cognitive perspectives. *Applied Psychophysiology and Biofeedback*, 46(4), 323–334. *(Companion BCMI preprint: **Monroy-D'Croz, Ramirez-Melendez, & Cespedes-Guevara, 2026**, `AF7`/`AF8` prefrontal alpha musical sonification, `arXiv:2606.01473v1`)*
    - **Identifiers:** PMID: `33929674` | PMCID: `PMC8553721` | DOI: `10.1007/s10484-021-09507-1`
    - **Where to Cite:** **Section 4.1.1 (EEG-to-FM Parameter Mapping)**. Section 4.1 currently cites only Chowning (1973) on FM synthesis; adding Takabatake et al. (2021) grounds continuous eyes-closed musical alpha/beta/theta neurofeedback in recent neurophysiological literature.
16. **Wyser, D., Mattille, M., Wolf, M., Lambercy, O., Scholkmann, F., & Gassert, R. (2020).** Short-channel regression in functional near-infrared spectroscopy is more effective when considering heterogeneous scalp hemodynamics. *Neurophotonics*, 7(3), 035011. *(Companion naturalistic short-channel regression paper: **Lemaire et al., 2025/2026**, *Neurophotonics* / **bioRxiv** `10.1101/2025.05.23.655796`, DOI `10.1117/1.NPh.13.1.015012`)*
    - **Identifiers:** PMID: `33029548` | PMCID: `PMC7523733` | DOI: `10.1117/1.NPh.7.3.035011`
    - **Where to Cite:** **Section 4.3.2 (Short-Channel Skin Regression)**. Co-authored by F. Scholkmann and M. Wolf (already cited in `scholkmann2014review`), directly validating $8\text{ mm}$ short-channel regression against long channels to remove cardiac ($1.18\text{ Hz}$), respiratory ($0.26\text{ Hz}$), and Mayer-wave ($0.10\text{ Hz}$) scalp artifacts.
17. **Rosanne, O., Albuquerque, I., Cassani, R., Gagnon, J.-F., Tremblay, S., & Falk, T. H. (2021).** Adaptive Filtering for Improved EEG-Based Mental Workload Assessment of Ambulant Users. *Frontiers in Neuroscience*, 15, 611962. *(Companion IMU+EEG denoising paper: **Zhang et al., 2025**, *IMU-Enhanced EEG Motion Artifact Removal*, *IEEE NER 2025* / `arXiv:2509.01073v1`; and **Klug & Gramann et al., 2022**, *BeMoBIL Pipeline*, **bioRxiv** `10.1101/2022.09.29.510051`)*
    - **Identifiers:** PMID: `33897342` | PMCID: `PMC8079753` | DOI: `10.3389/fnins.2021.611962`
    - **Where to Cite:** **Section 4.4.2 (6-Tap NLMS Motion Filter)** and **Section 6.2.3 (Dry-Sensor Artifacts & NLMS Bounds)**. Updates the adaptive filtering references in Section 4.4.2 (currently citing Widrow et al., 1975 and Mathewson, 2024) with direct IMU-referenced LMS/NLMS mobile EEG validation.
18. **Clin Deffarges, A., Kosmyna, N., & Maes, P. (2026).** Socrates went Nuclear: Comparing Interaction Strategies for AI systems in a Learning Context using Brain Sensing. *Proceedings of the 14th International Conference on Human-Agent Interaction (HAI '26)* / `arXiv:2609.00584v1`.
    - **Identifiers:** arXiv: `2609.00584v1` | DOI: `10.1145/3841580.3841620`
    - **Where to Cite:** **Section 3.1 (Autocomplete & Reference Drawer)** and **Section 6.2.5 (Classroom Evaluation Scope)**. Uses consumer Muse EEG headbands ($N=50$) to study Socratic vs. direct AI tutoring during learning, directly informing BrainImation's optional in-editor AI coding tutor tab.

---

## Part 2: Ranked Action Editor Recommendations at *Behavior Research Methods*

Verified from the live *Behavior Research Methods* Editorial Board (`link.springer.com/journal/13428/editors` and `psychonomic.org`) and cross-referenced against PubMed/Europe PMC.

> **Important Conflict-of-Interest (COI) Note:**
> An automated PubMed co-author check across all 52 PubMed-indexed publications of University of Alberta co-authors K. E. Mathewson, T. Shalamberidze, and C. J. Scavuzzo flagged that BRM Associate Editor **Dr. Christopher R. Madan** (University of Nottingham, UK) is a University of Alberta Psychology PhD alumnus who co-authored a paper directly with K. E. Mathewson (*Madan, Harrison, & Mathewson, 2018, Psychophysiology*, PMID `28940463`). **Do not request Christopher R. Madan as Action Editor** to avoid an editorial recusal delay. All 5 Associate Editors ranked below have **zero** co-authorship or institutional conflicts.

1. **Dr. Joshua R. de Leeuw, PhD (Top Choice)** — *Associate Editor, BRM*; Associate Professor of Cognitive Science, Vassar College, USA (`jdeleeuw@vassar.edu`).
   - **Verified Publications:** Creator of `jsPsych` (already cited: `deleeuw2015jspsych`); *Simulating behavior to help researchers build experiments* (*Behav. Res. Methods*, 2023, PMID `35768741`); *DataPipe: Born-open data collection for online experiments* (*Behav. Res. Methods*, 2024, PMID `37340239`).
   - **Fit:** Leading authority on JavaScript browser-based behavioral instrumentation, open-source web tool architecture, simulated data streams for building/debugging experiments (`EEGSimulator`), and undergraduate cognitive science instruction.
2. **Dr. Anna-Lena Schubert, PhD** — *Associate Editor, BRM*; Professor of Analysis and Modeling of Complex Data, Johannes Gutenberg University Mainz, Germany (`anna-lena.schubert@uni-mainz.de`).
   - **Verified Publications:** *Exploring a Dynamic Template Matching Algorithm for the Automatic Extraction of P3 Latencies* (*Psychophysiology*, 2026, PMID `41436800`); *An explorative multiverse study for extracting differences in P3 latencies* (*Psychophysiology*, 2024, PMID `37950379`); *Enhancing precision in human neuroscience* (*eLife*, 2023, PMID `37555830`).
   - **Fit:** Premier EEG/ERP methodologist on the BRM Associate Editor roster; deep expertise in P300/ERP signal extraction, trial-level SNR/SME psychometrics, and oscillatory EEG analysis.
3. **Dr. Roy de Kleijn, PhD** — *Associate Editor, BRM*; Associate Professor of Cognitive Robotics and Human–Computer Interaction, Leiden University, The Netherlands (`kleijnrde@fsw.leidenuniv.nl`).
   - **Verified Publications:** *Short-term transcutaneous vagus nerve stimulation increases pupil size but does not affect EEG alpha power* (*Brain Stimulation*, 2023, PMID `37348704`); *Phasic Alertness Impairs Cognitive Control by Amplifying Competition between Evidence Accumulators* (EEG/ERP study, *J. Neurosci.*, 2025, PMID `40925678`).
   - **Fit:** Combines human EEG/ERP and autonomic physiology with interactive human–computer interfaces and open-source experimental tools.
4. **Dr. Steven R. Livingstone, PhD** — *Associate Editor, BRM*; Associate Professor of Computer Science / Affective Computing, Ontario Tech University, Canada (`steven.livingstone@ontariotechu.ca`).
   - **Verified Publications:** *AI in music performance: the human-AI performance loop* (*Front. Psychol.*, 2026, PMID `43005692`); *RAVDESS* (*PLOS ONE*, 2018, PMID `29768426`); *Head movements encode emotions during speech and song* (*Emotion*, 2016, PMID `26501928`).
   - **Fit:** Strong match for BrainImation's multimodal intersection of real-time audio synthesis/sonification (`p5.sound`), 6-DOF head-motion kinematics, psychophysiology, and creative coding.
5. **Dr. Andy T. Woods, PhD** — *Associate Editor, BRM*; Royal Holloway, University of London, UK (`andy.woods@rhul.ac.uk`).
   - **Verified Publications:** *Conducting perception research over the internet: a tutorial review* (*PeerJ*, 2015, PMID `26244107`); *The effects of gamelike features and test location on cognitive test performance and participant enjoyment* (*PeerJ*, 2016, PMID `27441120`).
   - **Fit:** Deep expertise in browser-based experimental timing precision and gamified cognitive tasks (matching BrainImation's 14 BrainGames and Cohort 1 student neurofeedback games).

*(Note: Co-Editors-in-Chief are **Dr. Erin M. Buchanan**, Harrisburg University of Science and Technology, and **Dr. Dora Matzke**, University of Amsterdam.)*

---

## Part 3: Ranked Peer Reviewer Recommendations (12 Total — Zero COI)

### A. From the *Behavior Research Methods* Consulting Editor Board
1. **Dr. Dominique Makowski, PhD** — Assistant Professor of Psychology, University of Sussex, UK (`D.Makowski@sussex.ac.uk`).
   - Creator of `NeuroKit2` (*Behav. Res. Methods*, 2021, PMID `33528817`) and author of PPG/HRV and EEG signal-processing tutorials (*Psychophysiology*, 2025, PMID `41104583`).
2. **Dr. Michael D. Nunez, PhD** — Assistant Professor of Psychological Methods, University of Amsterdam, The Netherlands (`m.d.nunez@uva.nl`).
   - Lead author of *A tutorial on fitting joint models of M/EEG and behavior to understand cognition* (*Behav. Res. Methods*, 2024, PMID `38409458`).
3. **Dr. Edwin S. Dalmaijer, PhD** — Lecturer in Psychological Science, University of Bristol, UK (`edwin.dalmaijer@bristol.ac.uk`).
   - Creator of `PyGaze` (*Behav. Res. Methods*, 2014, PMID `24258321`), `MouseView.js` (*Behav. Res. Methods*, 2022, PMID `34590288`), and co-author of browser timing benchmarks (*Behav. Res. Methods*, 2021, PMID `33140376`).
4. **Dr. Frank A. Russo, PhD** — Professor of Psychology & Director of SMART Lab, Toronto Metropolitan University, Canada (`russo@torontomu.ca`).
   - Expert on prefrontal fNIRS, EEG/ERP, and musical/auditory neurofeedback (*Sci. Rep.*, 2025, PMID `41290802`; *Int. J. Psychophysiol.*, 2026, PMID `42893701`).
5. **Dr. Thomas Pronk, PhD** — Research Software Engineer & Methodologist, Amsterdam UMC / University of Amsterdam, The Netherlands (`t.pronk@amsterdamumc.nl`).
   - Author of `jsQuestPlus` (*Behav. Res. Methods*, 2023, PMID `36070128`) and web application timing accuracy benchmarks (*Behav. Res. Methods*, 2020, PMID `31823223`).

### B. External Domain Experts from Newly Identified Recent Literature (2020–2026)
6. **Dr. Cédric Cannard, PhD** — Senior Scientist, Institute of Noetic Sciences & UC San Diego SCCN, USA (`ccannard@noetic.org`).
   - Lead author of `BrainBeats` (joint EEG + PPG/ECG & Heartbeat-Evoked Potentials, *JoVE*, 2024, PMID `38738870`) and Muse headband validation (**bioRxiv** `10.1101/2021.11.02.466989`).
7. **Dr. Ido Davidesco, PhD** — Assistant Professor of Learning Sciences, University of Connecticut, USA (`ido.davidesco@uconn.edu`).
   - Co-developer of the *BrainWaves* portable EEG classroom curriculum (*Mind, Brain, and Education*, 2021, PMID `35875415`; **bioRxiv** `10.1101/2021.07.02.450935`).
8. **Dr. Gregory J. Gage, PhD** (Backyard Brains & University of Michigan, `greg@backyardbrains.com`) or **Dr. Annette Stowasser, PhD** (University of Cincinnati, `stowasae@ucmail.uc.edu`).
   - Senior authors of the 2024 and 2023 *Journal of Undergraduate Neuroscience Education (JUNE)* papers on low-cost classroom wave and ERP laboratory exercises (PMID `39355672`; PMID `37588651`).
9. **Dr. Felix Henninger, PhD** (LMU Munich / University of Mannheim, `mailbox@felixhenninger.com`) or **Dr. Yury Shevchenko, PhD** (University of Konstanz, `yury.shevchenko@uni-konstanz.de`).
   - Creators of `lab.js` (*Behav. Res. Methods*, 2022, PMID `34322854`) and `Open Lab` (*Behav. Res. Methods*, 2022, PMID `35233751`).
10. **Dr. Nicholas A. Badcock, PhD** (University of Western Australia, `nicholas.badcock@uwa.edu.au`) or **Dr. Nienke E. R. van Bueren, PhD** (Radboud University, `nienke.vanbueren@ru.nl`).
    - Senior/lead authors of the 2024 consumer-grade EEG scoping review (*PLOS ONE*, PMID `38446762`) and the 2026 *Behavior Research Methods* classroom consumer-EEG validation study (PMID `41493531`).
11. **Dr. Felix Scholkmann, PhD** — University Hospital Zurich & ETH Zurich, Switzerland (`Felix.Scholkmann@usz.ch`).
    - Co-author of the short-channel fNIRS regression validation papers (*Neurophotonics*, 2020, PMID `33029548`).
12. **Dr. Rafael Ramirez-Melendez, PhD** — Professor, Music and Machine Learning Lab, Universitat Pompeu Fabra, Barcelona, Spain (`rafael.ramirez@upf.edu`).
    - Senior author on real-time prefrontal (`AF7`/`AF8`) EEG musical sonification (`arXiv:2606.01473v1`) and neurofeedback games.
