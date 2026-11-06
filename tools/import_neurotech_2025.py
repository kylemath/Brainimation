#!/usr/bin/env python3
"""
Import all 94 student BrainImation sketches from the Fall 2025 Neurotech course
(kylemath/NeuroimagingClass - PSYCH 403A1: Neuroimaging & Neurostimulation)
student portfolio catalogues (`portfolio_test/` and `finalPortfolio/`) into
`examples/neurotech2025*.js` under the category `"2025 Neurotech Class Catalogue"`.

Includes:
  - 81 URL-encoded BrainImation sketches from `portfolio_test/*.html` and `finalPortfolio/*.html`
  - 1 external final project file (`finalPortfolio/IvanSketch.js`)
  - 12 inline Assignment 2 BrainImation sketches extracted from student PDF reports
"""

from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
EXAMPLES_DIR = REPO / "examples"
URL_SKETCHES_DIR = Path("/tmp/neurotech_sketches")
INLINE_SKETCHES_DIR = Path("/tmp/neurotech_sketches_inline")
NEUROCLASS_DIR = Path("/tmp/NeuroimagingClass")

CATEGORY = "2025 Neurotech Class Catalogue"

# Full roster of 30 students and their 94 BrainImation sketches
# Tuple format: (ex_id, title, description, source_type, source_ref)
# source_type:
#   - "url": file in /tmp/neurotech_sketches/<source_ref>
#   - "ivan_final": /tmp/NeuroimagingClass/finalPortfolio/IvanSketch.js
#   - "alicia_heels": converted p5.js version of Alicia Osorio's EEG Heels Runner
#   - "inline": inline code key in INLINE_A2_SKETCHES
SKETCH_MANIFEST = [
    # 1. Alicia Osorio (2 sketches)
    (
        "neurotech2025AliciaOCatErp",
        "Cat Oddball ERP Monitor (Alicia Osorio)",
        "Cat-themed cognitive P300 oddball ERP experiment comparing Standard (gray cat, 80%) vs. Oddball (gold cat, 20%) with baseline-corrected 4-channel ERP traces.",
        "url",
        "portfolio_test__Alicia_O_portfolio__1_bfe0f103.js",
    ),
    (
        "neurotech2025AliciaOHeelsRunner",
        "Sunset Heels Runner (Alicia Osorio)",
        "EEG-driven side-scrolling runner against a sunset cloudscape where Alpha speed, Attention, and Stress modulate stride speed, obstacle spacing, and auto-jump.",
        "alicia_heels",
        "portfolio_test__Alicia_O_portfolio__2_ff6ea542.js",
    ),

    # 2. Amna Khan (4 sketches)
    (
        "neurotech2025AmnaKJellyfishAquarium",
        "Jellyfish Meditation Aquarium (Amna Khan)",
        "Glowing bioluminescent jellyfish aquarium where tentacle sway slows with high Delta waves, glow intensifies with Alpha, and bell size grows with Attention.",
        "url",
        "portfolio_test__Amna_K_portfolio__1_d88583fb.js",
    ),
    (
        "neurotech2025AmnaKJellyfishSleepTrainer",
        "Jellyfish Sleep Trainer & Bell Music (Amna Khan)",
        "Closed-loop sleep and deep-rest trainer with a live Delta trend progress graph, target sleep threshold line, and gentle harmonic bell music.",
        "url",
        "portfolio_test__Amna_K_portfolio__2_16dcf943.js",
    ),
    (
        "neurotech2025AmnaKEmotionalFaceErp",
        "Happy vs. Sad Emotional Face ERP (Amna Khan)",
        "Two-condition emotional face ERP experiment comparing Frequent Happy vs. Rare Sad face stimuli across TP9, AF7, AF8, and TP10.",
        "url",
        "portfolio_test__Amna_K_portfolio__3_a5c477d6.js",
    ),
    (
        "neurotech2025AmnaKNeuroTetris",
        "NeuroTetris Mini-Game (Amna Khan)",
        "EEG-controlled Tetris mini-game with full block collision where brainwave states steer horizontal movement and drop speed.",
        "url",
        "finalPortfolio__Amna_K_final_project__1_bdf6bbc7.js",
    ),

    # 3. Angel Nwaka (3 sketches)
    (
        "neurotech2025AngelNMandalaWorkout",
        "StairMaster Neural Mandala (Angel Nwaka)",
        "EEG-responsive geometric mandala designed to compare resting vs. post-StairMaster workout brainwave states.",
        "inline",
        "Angel_N_A2",
    ),
    (
        "neurotech2025AngelNMandalaSound",
        "Neural Mandala & Harmonic Sound (Angel Nwaka)",
        "Multi-ring EEG mandala visualizer with conditional harmonic sound feedback triggered by sustained calm Alpha states.",
        "url",
        "portfolio_test__Angel_N_portfolio__1_76387422.js",
    ),
    (
        "neurotech2025AngelNMmnErp",
        "Moonlight Mismatch Negativity ERP (Angel Nwaka)",
        "Two-category Mismatch Negativity (MMN) ERP averaging display with frequent standard and rare deviant visual stimuli.",
        "url",
        "portfolio_test__Angel_N_portfolio__2_f73845ff.js",
    ),

    # 4. Ayaan Jimale (3 sketches)
    (
        "neurotech2025AyaanJZenBloodParticles",
        "Zen vs. Stress Particle Field (Ayaan Jimale)",
        "Dual-state particle system contrasting calm rainbow meditation orbits on a dark canvas against fast crimson stress bursts.",
        "inline",
        "Ayaan_J_A2",
    ),
    (
        "neurotech2025AyaanJP300OddballErp",
        "4-Channel P300 Oddball ERP (Ayaan Jimale)",
        "4-channel P300 ERP averaging across TP9, AF7, AF8, and TP10 with frequent blue and rare red circle flashes.",
        "url",
        "portfolio_test__Ayaan_J_portfolio__1_8ec10387.js",
    ),
    (
        "neurotech2025AyaanJTargetParticles",
        "Target Brain State Particle Trainer (Ayaan Jimale)",
        "HSB brain particle neurofeedback system that tracks sustained calm vs. stress ratios and celebrates when target mindfulness is achieved.",
        "url",
        "portfolio_test__Ayaan_J_portfolio__2_43cc01e2.js",
    ),

    # 5. Bani Sekhon (5 sketches)
    (
        "neurotech2025BaniSKaleidoscope",
        "4-Band Neural Kaleidoscope (Bani Sekhon)",
        "8-fold symmetrical EEG kaleidoscope with wave-specific particles for Alpha, Theta, Beta, and Delta.",
        "inline",
        "Bani_S_A2",
    ),
    (
        "neurotech2025BaniSKaleidoscopeConnections",
        "Pulsing Network Kaleidoscope (Bani Sekhon)",
        "EEG-responsive kaleidoscope with wave-specific pulsing network connections, size growth, and mental state classification.",
        "url",
        "portfolio_test__Bani_S_portfolio__1_df2953f0.js",
    ),
    (
        "neurotech2025BaniSP300SimErp",
        "Simulated P300 Oddball ERP (Bani Sekhon)",
        "Interactive P300 oddball ERP simulation comparing Standard (blue) and Rare (red) trials across 4 EEG channels.",
        "url",
        "portfolio_test__Bani_S_portfolio__2_6a0ef982.js",
    ),
    (
        "neurotech2025BaniSBaselineP300Erp",
        "Baseline-Corrected P300 ERP (Bani Sekhon)",
        "P300 oddball ERP experiment with pre-stimulus baseline correction and stimulus onset markers.",
        "url",
        "portfolio_test__Bani_S_portfolio__3_c3cdcf52.js",
    ),
    (
        "neurotech2025BaniSLilyGarden",
        "Lily of the Valley & Butterfly Garden (Bani Sekhon)",
        "Botanical neurofeedback garden where Lily of the Valley bell flowers bloom and butterflies flutter in response to EEG band activity.",
        "url",
        "finalPortfolio__Bani_S_final_project__1_0fc169c3.js",
    ),

    # 6. Caitlyn Archibald (3 sketches)
    (
        "neurotech2025CaitlynAMindGarden",
        "Five-Band EEG Mind Garden (Caitlyn Archibald)",
        "Botanical visualizer featuring five distinct flower species (tulip, daisy, lotus, sunflower, rose) that grow and sway with Delta, Theta, Alpha, Beta, and Gamma.",
        "inline",
        "Caitlyn_A_A2",
    ),
    (
        "neurotech2025CaitlynASunflowerReward",
        "Sunflower Neurofeedback Trainer (Caitlyn Archibald)",
        "Interactive sunflower garden neurofeedback trainer with progress bar, score tracking, and celebratory reward bursts.",
        "url",
        "portfolio_test__Caitlyn_A_portfolio__1_07f37979.js",
    ),
    (
        "neurotech2025CaitlynAFaceObjectN170",
        "N170 Faces vs. Star Objects ERP (Caitlyn Archibald)",
        "N170-focused ERP experiment alternating expressive face stimuli and geometric star objects across TP9, AF7, AF8, and TP10.",
        "url",
        "portfolio_test__Caitlyn_A_portfolio__2_7f97702c.js",
    ),

    # 7. Chloe Sorochan (2 sketches)
    (
        "neurotech2025ChloeSAlphaBetaRing",
        "Alpha/Beta Ratio Ring & Chime (Chloe Sorochan)",
        "Circular neon trail tracker that orbits smoothly and plays an 880 Hz WebAudio chime when the Alpha/Beta ratio stays inside the target zone.",
        "url",
        "portfolio_test__Chloe_S_portfolio__1_af640e70.js",
    ),
    (
        "neurotech2025ChloeSStroopErp",
        "Color-Word Stroop Oddball ERP (Chloe Sorochan)",
        "Congruent (Standard) vs. Incongruent (Target) Stroop color-word ERP paradigm with live baseline-corrected waveform averaging.",
        "url",
        "portfolio_test__Chloe_S_portfolio__2_15011fb0.js",
    ),

    # 8. Ella Thorsen-Bell (4 sketches)
    (
        "neurotech2025EllaTSolarSystem",
        "EEG Frequency Band Solar System (Ella Thorsen-Bell)",
        "Planetary orbit visualizer where five planets representing Delta, Theta, Alpha, Beta, and Gamma orbit a glowing sun.",
        "inline",
        "Ella_T_A2",
    ),
    (
        "neurotech2025EllaTOddballErpMonitor",
        "Oddball ERP & Stimulus Monitor (Ella Thorsen-Bell)",
        "Split-screen ERP experiment displaying multi-channel frequent vs. rare averaged waveforms above a live stimulus monitor.",
        "url",
        "portfolio_test__Ella_T_portfolio__1_b48bc212.js",
    ),
    (
        "neurotech2025EllaTSynthWaves",
        "Harmonic Ocean Waves & Synth (Ella Thorsen-Bell)",
        "Five layered HSB ocean waves paired with filtered Alpha, Beta, and Theta p5.Oscillator synthesizers, reverb, and delay.",
        "url",
        "portfolio_test__Ella_T_portfolio__2_34472d6b.js",
    ),
    (
        "neurotech2025EllaTEegPacMan",
        "EEG Pac-Man Pellet Collector (Ella Thorsen-Bell)",
        "Arcade Pac-Man mini-game where Alpha and Beta brainwaves steer Pac-Man across the arena to chomp glowing pellets.",
        "url",
        "finalPortfolio__Ella_T_final_project__1_ec24926b.js",
    ),

    # 9. Grace Shin (3 sketches)
    (
        "neurotech2025GraceSOceanSky",
        "Alpha Ocean Waves & Shifting Sky (Grace Shin)",
        "Serene ocean wave animation where Alpha power calms the waves and shifts the sky hue.",
        "inline",
        "Grace_S_A2",
    ),
    (
        "neurotech2025GraceSP300Oddball",
        "P300 Oddball ERP Averager (Grace Shin)",
        "P300 oddball ERP experiment plotting averaged frequent vs. rare EEG responses alongside stimulus sequence counters.",
        "url",
        "portfolio_test__Grace_S_portfolio__1_71fd1fff.js",
    ),
    (
        "neurotech2025GraceSCalmnessWaves",
        "Calmness Bar & Ocean Neurofeedback (Grace Shin)",
        "Builds on the Alpha ocean wave visualizer by adding a smoothed neurofeedback calmness meter driven by Alpha and Meditation.",
        "url",
        "portfolio_test__Grace_S_portfolio__2_617f2451.js",
    ),

    # 10. Hamza Razzo (3 sketches)
    (
        "neurotech2025HamzaRNeuralFireflies",
        "Neural Fireflies Swarm (Hamza Razzo)",
        "Glowing firefly swarm whose drift speed, pulse rate, and warm bioluminescent hues respond to live EEG band power.",
        "inline",
        "Hamza_R_A2",
    ),
    (
        "neurotech2025HamzaRP300Paradigm",
        "4-Channel P300 Oddball Display (Hamza Razzo)",
        "Comprehensive 4-channel P300 oddball ERP display with baseline correction, confidence shading, and trial progress HUD.",
        "url",
        "portfolio_test__Hamza_R_portfolio__1_21063686.js",
    ),
    (
        "neurotech2025HamzaRBrainFlowFlappy",
        "Brain Flow Adaptive Flappy Bird (Hamza Razzo)",
        "EEG Flappy Bird game with adaptive pipe gap difficulty modulated by live Meditation and Attention levels.",
        "url",
        "portfolio_test__Hamza_R_portfolio__2_3d3e3901.js",
    ),

    # 11. Hannah Cooper (3 sketches)
    (
        "neurotech2025HannahCBloomingMandala",
        "Blooming Neural Mandala (Hannah Cooper)",
        "Multi-layered blooming mandala flower whose petals expand with Alpha meditation and shimmer with Beta focus.",
        "inline",
        "Hannah_C_A2",
    ),
    (
        "neurotech2025HannahCAdaptiveSnake",
        "Adaptive EEG Snake & Auto-Calibration (Hannah Cooper)",
        "Neurofeedback Snake game featuring fast baseline auto-calibration, target-zone streak tracking, and adaptive speed.",
        "url",
        "portfolio_test__Hannah_C_portfolio__1_b602439a.js",
    ),
    (
        "neurotech2025HannahCAnnulusOddballErp",
        "Circle vs. Annulus Oddball ERP (Hannah Cooper)",
        "4-channel online-averaged ERP experiment (−200 to +800 ms) comparing Standard solid circles against Rare annulus rings.",
        "url",
        "portfolio_test__Hannah_C_portfolio__2_02677822.js",
    ),

    # 12. Hardi Patel (4 sketches)
    (
        "neurotech2025HardiPConnect3Math",
        "Connect-3 Match Game & Alpha/Beta Tracker (Hardi Patel)",
        "Interactive match-3 puzzle grid paired with mental math prompts and a live Alpha/Beta brainwave tracker.",
        "inline",
        "Hardi_P_A2",
    ),
    (
        "neurotech2025HardiPFaceObjectErp",
        "Face vs. Object ERP with Timing Axis (Hardi Patel)",
        "4-channel Face vs. Object ERP experiment with pre-stimulus baseline, post-stimulus timing axis, and live trial counters.",
        "url",
        "portfolio_test__Hardi_P_portfolio__1_fe3005e0.js",
    ),
    (
        "neurotech2025HardiPIceCreamCatch",
        "EEG Ice Cream Cone Catcher (Hardi Patel)",
        "Arcade ice cream catcher where Alpha moves the server left and Beta moves right to stack falling soft-serve cones inside the optimal zone.",
        "url",
        "portfolio_test__Hardi_P_portfolio__2_4336fa6e.js",
    ),
    (
        "neurotech2025HardiPNeuroArtTracing",
        "NeuroArt Star Template Tracing & Sound (Hardi Patel)",
        "Interactive star-and-spiral tracing canvas where brush color and musical pitch shift with live Alpha and Beta waves.",
        "url",
        "finalPortfolio__Hardi_P_final_project__1_023d6f5a.js",
    ),

    # 13. Ivan Espino Lopez (3 sketches)
    (
        "neurotech2025IvanLP300N400Detector",
        "P300 & N400 Component Detector (Ivan Espino Lopez)",
        "Multi-channel epoch visualizer that automatically detects P300 (blue circle) and N400 (hazard triangle) ERP components.",
        "url",
        "portfolio_test__Ivan_L_portfolio__1_0e2eac13.js",
    ),
    (
        "neurotech2025IvanLOddballHazardSim",
        "P300 Oddball & Hazard Overlay Simulator (Ivan Espino Lopez)",
        "Simulated ERP oddball paradigm comparing blue Standard stimuli against red Rare stimuli with a geometric hazard overlay.",
        "url",
        "portfolio_test__Ivan_L_portfolio__2_03909813.js",
    ),
    (
        "neurotech2025IvanLThresholdErpDetector",
        "P300/N400 Detector with Alpha/Beta Thresholds (Ivan Espino Lopez)",
        "Enhanced multi-channel ERP component detector adding real-time Alpha (>0.43) and Beta (>0.62) corner threshold indicators.",
        "ivan_final",
        "IvanSketch.js",
    ),

    # 14. Jake Gannon (3 sketches)
    (
        "neurotech2025JakeGEegFlappyBird",
        "Alpha-Controlled Flappy Bird (Jake Gannon)",
        "Side-scrolling Flappy Bird game where bursts of Alpha brainwave power flap the bird upward through incoming pipes.",
        "url",
        "portfolio_test__Jake_G_portfolio__1_c54b5e6b.js",
    ),
    (
        "neurotech2025JakeGMmnErpDisplay",
        "Mismatch Negativity (MMN) ERP Display (Jake Gannon)",
        "4-channel Mismatch Negativity (MMN) ERP experiment with baseline correction, channel legend, and stimulus onset markers.",
        "url",
        "portfolio_test__Jake_G_portfolio__2_d079e704.js",
    ),
    (
        "neurotech2025JakeGAdaptiveFlappyBird",
        "Adaptive Difficulty EEG Flappy Bird (Jake Gannon)",
        "Enhanced EEG Flappy Bird where Alpha controls flight and the Alpha/Beta ratio dynamically unlocks and scales difficulty levels.",
        "url",
        "portfolio_test__Jake_G_portfolio__3_f01d1062.js",
    ),

    # 15. Jia Guina (4 sketches)
    (
        "neurotech2025JiaGNeonRibbons",
        "Expanding Alpha Neon Ribbons (Jia Guina)",
        "Concentric wavy neon ribbons that radiate from the center of the canvas at a rate and brightness driven by Alpha waves.",
        "url",
        "portfolio_test__Jia_G_portfolio__1_17848601.js",
    ),
    (
        "neurotech2025JiaGFaceObjectErp",
        "Face vs. Object ERP Averager (Jia Guina)",
        "Split-panel Face vs. Object ERP experiment displaying live EEG status, stimulus cards, and running epoch averages.",
        "url",
        "portfolio_test__Jia_G_portfolio__2_adf528cd.js",
    ),
    (
        "neurotech2025JiaGAlphaStateRibbons",
        "5-State Alpha Classifier Ribbons (Jia Guina)",
        "Classifies live Alpha power into five mental states (Eyes Closed, Relaxed, Focused, Eyes Open, Stressed) with custom gradient backgrounds and neon ribbons.",
        "url",
        "portfolio_test__Jia_G_portfolio__3_15ea3ba9.js",
    ),
    (
        "neurotech2025JiaGParolStarLantern",
        "Filipino Parol Star Lantern (Jia Guina)",
        "Traditional Filipino Parol holiday star lantern whose geometric rays, outer glow rings, and HSL color palette pulse with EEG frequency bands.",
        "url",
        "finalPortfolio__Jia_G_final_project__1_14161dfb.js",
    ),

    # 16. Kiara Ruda (4 sketches)
    (
        "neurotech2025KiaraRAlphaBetaParticles",
        "Alpha/Beta Brain Particle Fountain (Kiara Ruda)",
        "HSB particle fountain where Alpha and Beta waves control emission rate, velocity, and color.",
        "inline",
        "Kiara_R_A2",
    ),
    (
        "neurotech2025KiaraREmotionalOddballErp",
        "Happy vs. Angry Emotional Oddball ERP (Kiara Ruda)",
        "4-channel emotional oddball ERP comparing Frequent Happy (80%) vs. Rare Angry (20%) faces with a dashed white Angry−Happy difference wave.",
        "url",
        "portfolio_test__Kiara_R_portfolio__1_c5416ad0.js",
    ),
    (
        "neurotech2025KiaraRBciTargetParticles",
        "Adaptive BCI Target Particle Game (Kiara Ruda)",
        "Interactive BCI particle task with adaptive target rings that shrink or expand based on sustained focus and calm metrics.",
        "url",
        "portfolio_test__Kiara_R_portfolio__2_cba10478.js",
    ),
    (
        "neurotech2025KiaraRNeuroWeather",
        "NeuroWeather Storm & Sun Simulator (Kiara Ruda)",
        "Dynamic weather ecosystem where Alpha brings warm sun glow, Theta rolls in layered fog, and high Beta triggers rain and branching lightning bolts.",
        "url",
        "finalPortfolio__Kiara_R_final_project__1_f69a4db7.js",
    ),

    # 17. Kora Budzyk (3 sketches)
    (
        "neurotech2025KoraBEmotionPalette",
        "Emotion Palette Abstract Painter (Kora Budzyk)",
        "Generative abstract painting where relative Alpha (blue/green), Beta (red/orange), and Theta (purple/pink) concentrations drive brushstroke color and length.",
        "url",
        "portfolio_test__Kora_B_portfolio__1_f651becf.js",
    ),
    (
        "neurotech2025KoraBEegTetris",
        "Brain-State Controlled Tetris (Kora Budzyk)",
        "Full Tetris game integrating smoothed Attention, Theta, and Alpha EEG inputs to control piece movement, rotation, and drop speed.",
        "url",
        "portfolio_test__Kora_B_portfolio__2_c854175a.js",
    ),
    (
        "neurotech2025KoraBP300OddballErp",
        "P300 Oddball & ERP Averager (Kora Budzyk)",
        "Two-condition P300 oddball paradigm plotting running Standard vs. Rare ERP waveforms across 4 channels.",
        "url",
        "portfolio_test__Kora_B_portfolio__3_c9cef713.js",
    ),

    # 18. Kyle Cordez (3 sketches)
    (
        "neurotech2025KyleCAttentionRain",
        "Beta Velocity Rainstorm & Attention Meter (Kyle Cordez)",
        "Atmospheric rainstorm where Beta wave intensity accelerates raindrop fall velocity alongside a live vertical Attention meter.",
        "url",
        "portfolio_test__Kyle_C_portfolio__1_0d05e027.js",
    ),
    (
        "neurotech2025KyleCAuditoryN1Erp",
        "Auditory N1 High vs. Low Tone ERP (Kyle Cordez)",
        "Auditory ERP paradigm playing randomized high and low frequency tones while averaging multi-channel N1/P2 EEG epochs.",
        "url",
        "portfolio_test__Kyle_C_portfolio__2_b272389a.js",
    ),
    (
        "neurotech2025KyleCStarFlowJourney",
        "Journey Through the Stars Flow Game (Kyle Cordez)",
        "3D starfield warp-speed game where remaining in a balanced flow state navigates you smoothly through the stars and builds your score.",
        "url",
        "portfolio_test__Kyle_C_portfolio__3_272217b5.js",
    ),

    # 19. Marinaya Saigh (2 sketches)
    (
        "neurotech2025MarinayaSN170FaceObject",
        "4-Channel N170 Faces vs. Objects ERP (Marinaya Saigh)",
        "Alternating Face and Object N170 ERP paradigm plotting baseline-corrected 4-channel averages across TP9, AF7, AF8, and TP10.",
        "url",
        "portfolio_test__Marinaya_S_portfolio__1_b0c28821.js",
    ),
    (
        "neurotech2025MarinayaSCalmBloomParticles",
        "Calm Bloom vs. Stress Particle Trainer (Marinaya Saigh)",
        "Neurofeedback particle system that fills a Calm Bloom progress bar with rainbow orbits when Meditation exceeds Attention.",
        "url",
        "portfolio_test__Marinaya_S_portfolio__2_40cbe2d1.js",
    ),

    # 20. Mohamed Jomha (3 sketches)
    (
        "neurotech2025MohamedJCalmSpectrumParticles",
        "Blue-to-Red Calmness Spectrum Particles (Mohamed Jomha)",
        "EEG particle cloud whose spheres expand and shift smoothly across a blue-to-red spectrum with rising Alpha calmness.",
        "url",
        "portfolio_test__Mohamed_J_portfolio__2_55952b21.js",
    ),
    (
        "neurotech2025MohamedJP300OddballCsv",
        "P300 Oddball ERP with CSV Export (Mohamed Jomha)",
        "Robust 4-channel P300 oddball experiment (80% circle vs. 20% annulus) with 20-trial rolling buffers and press-D CSV export.",
        "url",
        "portfolio_test__Mohamed_J_portfolio__3_4f4d1e35.js",
    ),
    (
        "neurotech2025MohamedJPitchDingTrainer",
        "Pitch-Scaled Audio Ding Calmness Trainer (Mohamed Jomha)",
        "Target Alpha state trainer with adaptive threshold tuning and pitch-scaled harmonic ding audio feedback.",
        "url",
        "portfolio_test__Mohamed_J_portfolio__4_684189b1.js",
    ),

    # 21. Natasha Chemello (4 sketches)
    (
        "neurotech2025NatashaCMeditationGarden",
        "Meditation Garden with Fireflies (Natasha Chemello)",
        "Tranquil day-to-dusk garden with swaying flowers, drifting clouds, and glowing fireflies driven by Alpha, Theta, and Attention.",
        "inline",
        "Natasha_C_A2",
    ),
    (
        "neurotech2025NatashaCN400SemanticErp",
        "N400 Semantic Word Pair ERP (Natasha Chemello)",
        "Semantic N400 ERP paradigm presenting related vs. unrelated word pairs and highlighting the 300–500 ms N400 window.",
        "url",
        "portfolio_test__Natasha_C_portfolio__1_5334c1e9.js",
    ),
    (
        "neurotech2025NatashaCSmoothedGardenTrainer",
        "Smoothed Alpha/Theta Garden Trainer (Natasha Chemello)",
        "Smoothed neurofeedback garden trainer tracking the Alpha/Theta ratio against a target zone with blooming flowers and fireflies.",
        "url",
        "portfolio_test__Natasha_C_portfolio__2_6d932582.js",
    ),
    (
        "neurotech2025NatashaCWolfIslandRun",
        "Wolf Island Run: Aurora Platformer (Natasha Chemello)",
        "Brain-responsive endless platformer where a running wolf leaps across floating islands beneath a shimmering aurora borealis.",
        "url",
        "finalPortfolio__Natasha_C_final_project__1_b2eab81f.js",
    ),

    # 22. Portia Wainwright (3 sketches)
    (
        "neurotech2025PortiaWAlphaPulseFlowers",
        "Alpha Wave Pulsing Meadow Flowers (Portia Wainwright)",
        "Spawns and pulses multi-petal meadow flowers across the canvas whenever Alpha waves enter a calm state.",
        "url",
        "portfolio_test__Portia_W_portfolio__1_b4b0314f.js",
    ),
    (
        "neurotech2025PortiaWMandalaCalmMonitor",
        "Alpha/Theta Mandala & Calmness Monitor (Portia Wainwright)",
        "Breathing mandala visualizer with exponential EEG smoothing, harmonic chime notes, and a live Alpha/Theta calmness gauge.",
        "url",
        "portfolio_test__Portia_W_portfolio__2_55010c06.js",
    ),
    (
        "neurotech2025PortiaWTwoCategoryErp",
        "Two-Category Oddball ERP Plotter (Portia Wainwright)",
        "Clean two-category ERP experiment displaying Frequent vs. Rare stimulus flashes and microvolt-scaled averaged waveforms.",
        "url",
        "portfolio_test__Portia_W_portfolio__3_27b33cc6.js",
    ),

    # 23. Raissa Shariff (3 sketches)
    (
        "neurotech2025RaissaSContrastBrainNetwork",
        "High-Contrast Brain Particle Network (Raissa Shariff)",
        "Connected neural particle network that shifts contrast, link density, and speed with Attention and Meditation.",
        "inline",
        "Raissa_S_A2",
    ),
    (
        "neurotech2025RaissaSFourStateErpAverager",
        "4-Brain-State Stratified ERP Averager (Raissa Shariff)",
        "Oddball ERP averager that classifies live EEG into Calm, Focused, Drowsy, or Stressed states and averages ERP epochs separately per state.",
        "url",
        "portfolio_test__Raissa_S_portfolio__1_9e429bd0.js",
    ),
    (
        "neurotech2025RaissaSFourStateFlowGame",
        "4-State Geometry & Flow Speed Game (Raissa Shariff)",
        "Hysteresis-stabilized 4-state visualizer rendering Calm circles, Focused networks, Stressed triangles, and Drowsy squares with EEG speed control.",
        "url",
        "portfolio_test__Raissa_S_portfolio__2_f715d249.js",
    ),

    # 24. Rana Radiansyah (4 sketches)
    (
        "neurotech2025RanaRCaterpillarRace",
        "Five-Band Caterpillar Race (Rana Radiansyah)",
        "Five colorful caterpillars representing Alpha, Beta, Gamma, Theta, and Delta wiggle and race toward the green finish line!",
        "url",
        "portfolio_test__Rana_R_portfolio__1_ea166b0d.js",
    ),
    (
        "neurotech2025RanaRN170FaceObjectErp",
        "Multi-Channel N170 Face vs. Object ERP (Rana Radiansyah)",
        "Multi-channel N170 ERP simulation comparing averaged Face vs. Object responses across 4 electrodes.",
        "url",
        "portfolio_test__Rana_R_portfolio__2_67251417.js",
    ),
    (
        "neurotech2025RanaRCaterpillarDominantWave",
        "1-Second Averaged Caterpillar Wave Visualizer (Rana Radiansyah)",
        "Averages all 5 EEG frequency bands every second to smoothly position glowing caterpillars and highlight the dominant brainwave.",
        "url",
        "portfolio_test__Rana_R_portfolio__3_b086bed1.js",
    ),
    (
        "neurotech2025RanaRPainterlyEegCanvas",
        "Living Painterly EEG Canvas & Sound (Rana Radiansyah)",
        "Painterly generative canvas combining indigo Theta micro-textures, flowing Alpha/Beta ribbons, Delta depth, and ambient WebAudio synthesis.",
        "url",
        "finalPortfolio__Rana_R_final_project__1_e473a240.js",
    ),

    # 25. Ryan Park (3 sketches)
    (
        "neurotech2025RyanPFourLaneWaveMonitor",
        "4-Lane Wave Monitor & Target Trainer (Ryan Park)",
        "Four-lane real-time EEG wave monitor for Alpha, Beta, Theta, and Delta with interactive target-band selection.",
        "inline",
        "Ryan_P_A2",
    ),
    (
        "neurotech2025RyanPMultiStateClassifier",
        "Multi-State Classifier & 4-Lane Neurofeedback (Ryan Park)",
        "Detects Eyes Open vs. Closed (Alpha spike hysteresis) and Relaxed/Focused/Stressed arousal states atop a 4-lane wave visualizer.",
        "url",
        "portfolio_test__Ryan_P_portfolio__1_704be90b.js",
    ),
    (
        "neurotech2025RyanPClosedLoopMmnErp",
        "Attention-Adaptive Closed-Loop MMN ERP (Ryan Park)",
        "Closed-loop Mismatch Negativity (MMN) ERP paradigm that dynamically adapts inter-stimulus timing based on live Attention.",
        "url",
        "portfolio_test__Ryan_P_portfolio__2_8f9acc77.js",
    ),

    # 26. Samir Jaber (3 sketches)
    (
        "neurotech2025SamirJWaveAffectMonitor",
        "4-Lane Wave & Stress/Relax Affect HUD (Samir Jaber)",
        "Non-overlapping 4-lane EEG wave visualizer with interactive target lane selection and live Relax vs. Stress affect meters.",
        "url",
        "portfolio_test__Samir_J_portfolio__1_ba890818.js",
    ),
    (
        "neurotech2025SamirJP300RareBeepErp",
        "P300 Oddball ERP with Rare Trial Audio Beep (Samir Jaber)",
        "Multi-channel P300 oddball ERP experiment with WebAudio tone bursts on rare trials and adjustable microvolt scaling.",
        "url",
        "portfolio_test__Samir_J_portfolio__2_bcca6373.js",
    ),
    (
        "neurotech2025SamirJTargetStateTrainer",
        "Adaptive Alpha/Theta Target State Trainer (Samir Jaber)",
        "Closed-loop Alpha/Theta ratio trainer with adaptive target thresholds, progress bar, and eyes-open/closed detection.",
        "url",
        "portfolio_test__Samir_J_portfolio__3_1d16524b.js",
    ),

    # 27. Sarah Badran (2 sketches)
    (
        "neurotech2025SarahBN400WordPairErp",
        "N400 Semantic Match vs. Mismatch ERP (Sarah Badran)",
        "4-channel N400 ERP experiment flashing semantically congruent vs. incongruent word pairs across TP9, AF7, AF8, and TP10.",
        "url",
        "portfolio_test__Sarah_B_portfolio__1_cee9cc1e.js",
    ),
    (
        "neurotech2025SarahBAdaptiveFlowTrainer",
        "Adaptive Flow Window Neurofeedback (Sarah Badran)",
        "Extends the zen particle visualizer with an adaptive Beta−Alpha flow window trainer, 60-second history HUD, streak counter, and chime cues.",
        "url",
        "portfolio_test__Sarah_B_portfolio__2_7e043c0c.js",
    ),

    # 28. Tori Anderson (3 sketches)
    (
        "neurotech2025ToriAN170DarkErp",
        "Dark-Mode Neon N170 Face ERP (Tori Anderson)",
        "Neon dark-mode N170 ERP averaging visualizer comparing Face vs. Non-Face stimuli across 4 EEG channels.",
        "url",
        "portfolio_test__Tori_A_portfolio__1_bca190cd.js",
    ),
    (
        "neurotech2025ToriABrainwaveFlowerGarden",
        "Smoothed Brainwave Flower Garden (Tori Anderson)",
        "Grows a colorful meadow of swaying flowers, drifting clouds, and a glowing sun powered by smoothed EEG frequency bands.",
        "url",
        "portfolio_test__Tori_A_portfolio__2_a9a1b059.js",
    ),
    (
        "neurotech2025ToriALilypadFrogPond",
        "Lilypad Frog Pond & Bug Catcher (Tori Anderson)",
        "Five frogs perched on lilypads shoot out their tongues to catch flying bugs powered by Delta, Theta, Alpha, Beta, and Gamma waves!",
        "url",
        "finalPortfolio__Tori_A_final_project__1_66b62246.js",
    ),

    # 29. Yan Luo (3 sketches)
    (
        "neurotech2025YanLMandalaSnakeGame",
        "Breathing Mandala & Fruit Snake Game (Yan Luo)",
        "Combines a spinning, Beta-breathing geometric mandala with an EEG-steered snake that slithers around the mandala to eat glowing fruit.",
        "url",
        "portfolio_test__Yan_L_portfolio__1_0f906cb9.js",
    ),
    (
        "neurotech2025YanLFaceObjectErpDemo",
        "Continuous Face vs. Object ERP Averager (Yan Luo)",
        "Baseline-corrected (−200 to +800 ms) Face vs. Object ERP averager across TP9, AF7, AF8, and TP10.",
        "url",
        "portfolio_test__Yan_L_portfolio__2_fc954323.js",
    ),
    (
        "neurotech2025YanLOceanRainfallSplash",
        "Alpha/Theta Ocean Rainfall & Adaptive Ripples (Yan Luo)",
        "Teardrop rain falls into a breathing multi-layered ocean with expanding splash ripples sized by the Alpha/Theta ratio.",
        "url",
        "portfolio_test__Yan_L_portfolio__3_c3565328.js",
    ),

    # 30. Zainab Samiuddin (3 sketches)
    (
        "neurotech2025ZainabSGalaxyCalmExplosion",
        "Expanding Galaxy: Blue Calm vs. Red Supernova (Zainab Samiuddin)",
        "Cosmic nebula visualizer where high Meditation expands a calm blue galaxy with smiley stars, while high Attention triggers red supernova fragments.",
        "url",
        "portfolio_test__Zainab_S_portfolio__1_a6421d79.js",
    ),
    (
        "neurotech2025ZainabSAdaptiveGalaxySparkles",
        "Adaptive Difficulty Cosmic Nebula Trainer (Zainab Samiuddin)",
        "Adds closed-loop adaptive difficulty scaling and sparkle rewards to the Blue Calm vs. Red Supernova galaxy visualizer.",
        "url",
        "portfolio_test__Zainab_S_portfolio__2_8545cdc4.js",
    ),
    (
        "neurotech2025ZainabSMultiChannelFaceErp",
        "Multi-Channel Face vs. Object ERP Plotter (Zainab Samiuddin)",
        "4-channel Face vs. Object ERP averaging display with live stimulus cards and post-stimulus waveform traces.",
        "url",
        "portfolio_test__Zainab_S_portfolio__3_39d5447d.js",
    ),
]


ALICIA_HEELS_P5_CODE = """// EEG-Driven Sunset Heels Runner (Converted from Alicia Osorio's React Canvas Sketch to p5.js)
// Sunset sky (pink -> orange -> lavender), soft clouds, runner with long black hair,
// matte red dress, and thin stiletto heels. Press SPACE or click to jump!

const GROUND_OFFSET = 70;
const GRAVITY = 0.85;
const JUMP_VY = -13.5;

let runner = { t: 0, x: 110, y: 0, vy: 0, obstacles: [], timeToNext: 1200 };
let autoJump = true;
let attHistory = new Array(80).fill(0.5);
let stressHistory = new Array(80).fill(0.5);

const clouds = [
  { x: 80,  y: 45,  s: 1.2 },
  { x: 260, y: 75,  s: 0.9 },
  { x: 460, y: 55,  s: 1.4 },
  { x: 680, y: 90,  s: 1.1 },
  { x: 820, y: 40,  s: 0.8 },
  { x: 150, y: 125, s: 1.0 },
  { x: 540, y: 135, s: 0.95 }
];

function setup() {
  createCanvas(width, height);
  runner.y = height - GROUND_OFFSET;
}

function jumpRunner() {
  let groundY = height - GROUND_OFFSET;
  if (Math.abs(runner.y - groundY) < 2) {
    runner.vy = JUMP_VY;
  }
}

function keyPressed() {
  if (key === ' ' || keyCode === UP_ARROW) {
    jumpRunner();
  } else if (key === 'a' || key === 'A') {
    autoJump = !autoJump;
  }
}

function mousePressed() {
  jumpRunner();
}

function draw() {
  let groundY = height - GROUND_OFFSET;
  let ctx = drawingContext;

  // Read live or simulated EEG metrics
  let alpha = constrain(eegData.alpha || 0.5, 0, 1);
  let beta  = constrain(eegData.beta  || 0.4, 0, 1);
  let theta = constrain(eegData.theta || 0.3, 0, 1);
  let gamma = constrain(eegData.gamma || 0.3, 0, 1);

  let attention = constrain(beta / (alpha + theta + 0.15), 0, 1);
  let stress = constrain(beta / (alpha + 0.5 * theta + 0.15), 0, 1);
  let activation = constrain((alpha + beta + theta + gamma) / 4, 0, 1);

  let stateName = "Relaxed";
  if (stress > 0.72) stateName = "Stressed";
  else if (attention > 0.62) stateName = "Focused";
  else if (theta > alpha && theta > 0.55) stateName = "Drowsy";

  if (frameCount % 4 === 0) {
    attHistory.push(attention);
    if (attHistory.length > 80) attHistory.shift();
    stressHistory.push(stress);
    if (stressHistory.length > 80) stressHistory.shift();
  }

  // EEG -> difficulty & speed mapping
  let difficulty = constrain(1 - attention, 0, 1);
  let easeByStress = constrain(1 - stress * 0.5, 0, 1);
  let combinedDifficulty = constrain(difficulty * 0.7 + (1 - easeByStress) * 0.3, 0, 1);
  let walkerSpeed = lerp(2.5, 7.8, constrain(alpha * 1.2 - stress * 0.2 + 0.1, 0, 1));
  let targetInterval = lerp(1700, 750, combinedDifficulty);

  // Auto-jump when obstacle is close and brain is active
  for (let o of runner.obstacles) {
    if (autoJump && o.x - runner.x > 10 && o.x - runner.x < 75 && (activation > 0.45 || alpha > 0.45)) {
      jumpRunner();
    }
  }

  // Physics update
  let dt = 16.7;
  runner.t += dt;
  runner.timeToNext -= dt;

  if (runner.timeToNext <= 0) {
    let h = 24 + random(42) * (0.5 + combinedDifficulty);
    let w = 14 + random(18);
    runner.obstacles.push({ x: width + 15, w: w, h: h });
    runner.timeToNext = targetInterval * random(0.8, 1.4);
  }

  runner.vy += GRAVITY;
  runner.y += runner.vy;
  if (runner.y > groundY) {
    runner.y = groundY;
    runner.vy = 0;
  }

  for (let o of runner.obstacles) {
    o.x -= walkerSpeed;
  }
  runner.obstacles = runner.obstacles.filter(o => o.x + o.w > -10);

  let collided = false;
  for (let o of runner.obstacles) {
    let ox1 = o.x, ox2 = o.x + o.w;
    let oy1 = groundY - o.h, oy2 = groundY;
    let rx1 = runner.x - 14, rx2 = runner.x + 14;
    let ry1 = runner.y - 45, ry2 = runner.y;
    if (ox1 < rx2 && ox2 > rx1 && oy1 < ry2 && oy2 > ry1) {
      collided = true;
      break;
    }
  }

  // 1. Sunset gradient sky
  let grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#ff9a8b");
  grad.addColorStop(0.45, "#ff6a88");
  grad.addColorStop(0.8, "#ffd1a1");
  grad.addColorStop(1, "#f7e4ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Soft clouds
  for (let c of clouds) {
    drawSoftCloud(ctx, (c.x + frameCount * 0.15) % (width + 120) - 60, c.y, c.s);
  }

  // 3. Ground runway
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, groundY + 1, width, 3);
  ctx.fillStyle = "rgba(31, 41, 55, 0.12)";
  ctx.fillRect(0, groundY + 4, width, height - groundY);

  // 4. Obstacles
  ctx.fillStyle = "#7c3aed";
  for (let o of runner.obstacles) {
    ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
  }

  // 5. Runner in matte red dress & stiletto heels
  drawHeelsRunner(ctx, runner.x, runner.y, runner.t, walkerSpeed);

  // 6. HUD & Sparklines
  let pad = 16;
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(`EEG Sunset Heels Runner  |  State: ${stateName}`, pad, 24);
  ctx.font = "12px sans-serif";
  ctx.fillText(
    `Attention: ${attention.toFixed(2)}   Stress: ${stress.toFixed(2)}   Alpha: ${alpha.toFixed(2)}   Beta: ${beta.toFixed(2)}`,
    pad, 44
  );
  ctx.fillText(
    `Speed: ${walkerSpeed.toFixed(1)}   Difficulty: ${combinedDifficulty.toFixed(2)}   AutoJump (A): ${autoJump ? "ON" : "OFF"}   [Space/Click to Jump]`,
    pad, 62
  );

  drawSpark(ctx, attHistory, pad, 76, 180, 30, "Attention");
  drawSpark(ctx, stressHistory, pad + 200, 76, 180, 30, "Stress");

  if (collided) {
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Ouch! Relax (high Alpha) to stride smoothly!", pad, 130);
  }
}

function drawHeelsRunner(ctx, x, y, t, walkerSpeed) {
  let skinColor = "#b37a56";
  let hairColor = "#0b0b0f";
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.25, 1.25);

  let stride = Math.sin(t * 0.022 * (2 + Math.min(6, walkerSpeed))) * 5;

  // Stiletto heels (matte red)
  ctx.fillStyle = "#dc2626";
  drawStiletto(ctx, -7 + stride * 0.5, 0, -6);
  drawStiletto(ctx,  7 - stride * 0.5, 0,  6);

  // Legs
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3.0;
  ctx.beginPath(); ctx.moveTo(-4.5, -10); ctx.lineTo(-4.5 + stride * 0.5, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( 4.5, -10); ctx.lineTo( 4.5 - stride * 0.5, 0); ctx.stroke();

  // Hourglass silhouette
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.quadraticCurveTo(-12, -18, -5.5, -22);
  ctx.quadraticCurveTo(-1, -28, 5, -24);
  ctx.quadraticCurveTo(11, -18, 9, -10);
  ctx.quadraticCurveTo(6, -8, 4.5, -8);
  ctx.lineTo(-4.5, -8);
  ctx.quadraticCurveTo(-7, -8, -9, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Matte red dress
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.quadraticCurveTo(-9, -17, -4.5, -20.5);
  ctx.quadraticCurveTo(0, -23.5, 4.5, -21);
  ctx.quadraticCurveTo(9, -17, 8, -10);
  ctx.lineTo(8, -10);
  ctx.quadraticCurveTo(0, -8.5, -8, -10);
  ctx.closePath();
  ctx.fill();

  // Swinging arms
  let arm = Math.sin(t * 0.022 * (2 + Math.min(6, walkerSpeed))) * 9;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.moveTo(-1, -18); ctx.lineTo(-12 + arm, -10); ctx.stroke();
  ctx.globalAlpha = 1.0;
  ctx.beginPath(); ctx.moveTo(1, -18); ctx.lineTo(12 - arm, -10); ctx.stroke();

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(2, -36, 7.6, 0, Math.PI * 2); ctx.fill();

  // Long flowing black hair
  let sway = Math.sin(t * 0.02 * walkerSpeed) * 4;
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(0, -37, 10, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-2, -40);
  ctx.quadraticCurveTo(-16, -38 + sway, -14, -22 + sway);
  ctx.quadraticCurveTo(-12, -10 + sway, -6, -8 + sway);
  ctx.quadraticCurveTo(-2, -10 + sway, -1, -20 + sway);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawStiletto(ctx, x, y, dir) {
  let s = Math.sign(dir);
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 1);
  ctx.lineTo(x + 6 * s, y - 1);
  ctx.lineTo(x + 2 * s, y + 2);
  ctx.lineTo(x - 5 * s, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 4 * s, y + 2);
  ctx.lineTo(x - 4 * s, y + 7);
  ctx.stroke();
}

function drawSoftCloud(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#ffffff";
  cloudEllipse(ctx, 0, 0, 40, 24);
  cloudEllipse(ctx, -22, 6, 28, 18);
  cloudEllipse(ctx, 22, 8, 32, 18);
  cloudEllipse(ctx, -40, 10, 22, 14);
  cloudEllipse(ctx, 40, 12, 22, 14);
  ctx.restore();
}

function cloudEllipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpark(ctx, values, x, y, w, h, label) {
  ctx.fillStyle = "#1f2937";
  ctx.font = "10px sans-serif";
  ctx.fillText(label, x, y - 3);
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(31, 41, 55, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  let n = values.length;
  for (let i = 0; i < n; i++) {
    let vx = x + (i / (n - 1)) * w;
    let vy = y + (1 - values[i]) * h;
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1.8;
  ctx.stroke();
}
"""


def load_inline_a2_sketches() -> dict[str, str]:
    """Load and clean the 13 unique inline Assignment 2 sketches extracted from student portfolios."""
    sketches: dict[str, str] = {}

    def read_lines(filename: str, start_line: int, end_line: int | None = None) -> str:
        name = filename.replace("portfolio_test__", "")
        lines = (INLINE_SKETCHES_DIR / name).read_text(encoding="utf-8").splitlines()
        s = start_line - 1
        e = end_line if end_line is not None else len(lines)
        return "\n".join(lines[s:e])

    # 1. Angel_N_A2 (lines 12..40)
    sketches["Angel_N_A2"] = read_lines("Angel_N_portfolio__A2_inline.txt", 12, 40)

    # 2. Ayaan_J_A2 (lines 4..53)
    sketches["Ayaan_J_A2"] = read_lines("Ayaan_J_portfolio__A2_inline.txt", 4, 53)

    # 3. Bani_S_A2 (lines 104..245)
    sketches["Bani_S_A2"] = read_lines("Bani_S_portfolio__A2_inline.txt", 104, 245)

    # 4. Caitlyn_A_A2 (lines 6..119)
    caitlyn = read_lines("Caitlyn_A_portfolio__A2_inline.txt", 6, 119)
    caitlyn = (
        caitlyn.replace("let eegData = {", "let fallbackEegData = {")
        .replace("f .currentSize", "f.currentSize")
        .replace("// sits directly on stem ", "/* sits directly on stem */ ")
        .replace("// Central petal ", "/* Central petal */ ")
        .replace("// Left petal ", "/* Left petal */ ")
        .replace("// Right petal ", "/* Right petal */ ")
        .replace("// Center lip detail ", "/* Center lip detail */ ")
        .replace("// ----------------------------- LABELS ----------------------------- // ", "\n// ----------------------------- LABELS ----------------------------- //\n")
        .replace('"cognition + \ninfo-process"', '"cognition + info-process"')
        .replace(
            "function simulateEEG() { \neegData.delta = noise(time * 0.2 + 100 ); \neegData.theta = noise(time * 0.2 + 200 ); \neegData.alpha = noise(time * 0.2 + 300 ); \neegData.beta = noise(time * 0.25 + 400 ); \neegData.gamma = noise(time * 0.3 + 500 ); \neegData.attention = noise(time * 0.4 + 600 ); \neegData.meditation = noise(time * 0.25 + 700 ); \neegData.connected = true ; \n}",
            "function simulateEEG() {\n  // Uses BrainImation live or simulated eegData directly\n}",
        )
    )
    sketches["Caitlyn_A_A2"] = caitlyn

    # 5. Ella_T_A2 (lines 27..103)
    sketches["Ella_T_A2"] = read_lines("Ella_T_portfolio__A2_inline.txt", 27, 103)

    # 6. Grace_S_A2 (lines 39..102)
    grace = read_lines("Grace_S_portfolio__A2_inline.txt", 39, 102)
    grace = (
        grace.replace("\nstate ", " state ")
        .replace("\nactivity, where low theta makes sky cooler (bluish) and high theta makes ", " activity, where low theta makes sky cooler (bluish) and high theta makes ")
        .replace("\nit look warmer (pinkish) to represent meditative state ", " it look warmer (pinkish) to represent meditative state ")
        .replace("\nalso increases with meditation level ", " also increases with meditation level ")
        .replace("\nsmooth or wavy the waves look, higher alpha = smoother waves", " smooth or wavy the waves look, higher alpha = smoother waves")
        .replace("\nmotion based on beta activity (stress/alertness) ", " motion based on beta activity (stress/alertness) ")
        .replace("\nsine waves to create natural wave pattern ", " sine waves to create natural wave pattern ")
        .replace("\n0.3x when calm ", " 0.3x when calm ")
    )
    sketches["Grace_S_A2"] = grace

    # 7. Hamza_R_A2 (lines 5..59)
    sketches["Hamza_R_A2"] = read_lines("Hamza_R_portfolio__A2_inline.txt", 5, 59)

    # 8. Hannah_C_A2 (lines 32..100)
    hannah = read_lines("Hannah_C_portfolio__A2_inline.txt", 32, 100)
    hannah = (
        hannah.replace("\n(meditation)", " (meditation)")
        .replace("\nreal-time)", " real-time)")
        .replace("\nlayer depth", " layer depth")
        .replace("\ncolors", " colors")
        .replace("\nsize (relaxed flow)", " size (relaxed flow)")
        .replace("let eegData = {", "let fallbackEegData = {")
        + "\n}\n"
    )
    sketches["Hannah_C_A2"] = hannah

    # 9. Hardi_P_A2 (lines 39..356)
    hardi = read_lines("Hardi_P_portfolio__A2_inline.txt", 39, 356)
    hardi = hardi.replace("\nfalling ---", " falling ---")
    hardi_setup = """
function setup() {
  createCanvas(width, height);
  grid = [];
  for (var r = 0; r < rows; r++) {
    grid[r] = [];
    for (var c = 0; c < cols; c++) grid[r][c] = randomPiece();
  }
  generateMathQuestion();
}
"""
    sketches["Hardi_P_A2"] = hardi + "\n" + hardi_setup

    # 10. Kiara_R_A2 (lines 22..63)
    sketches["Kiara_R_A2"] = read_lines("Kiara_R_portfolio__A2_inline.txt", 22, 63)

    # 11. Natasha_C_A2 (lines 3..133)
    sketches["Natasha_C_A2"] = read_lines("Natasha_C_portfolio__A2_inline.txt", 3, 133)

    # 12. Raissa_S_A2 (lines 4..95)
    raissa = read_lines("Raissa_S_portfolio__A2_inline.txt", 4, 95)
    raissa = (
        raissa.replace("\nfocus contrast.", " focus contrast.")
        .replace("-. 6 ,. 6", "-0.6, 0.6")
    )
    sketches["Raissa_S_A2"] = raissa

    # 13. Ryan_P_A2 (lines 65..339)
    sketches["Ryan_P_A2"] = read_lines("Ryan_P_portfolio__A2_inline.txt", 65, 339)

    return sketches


def convert_ivan_instance_mode(code: str) -> str:
    """Convert Ivan Espino Lopez's `new p5((p) => { ... });` sketch to standard global-mode p5.js."""
    # Strip outer `new p5((p) => {` and trailing resize listener + `});`
    code = re.sub(r"new\s+p5\s*\(\s*\(\s*p\s*\)\s*=>\s*\{", "", code, count=1)
    code = re.sub(
        r"(?:// Fix resize observer issue|// Make canvas responsive to container resize)[\s\S]*?\}\);\s*$",
        "",
        code,
    )
    # Replace p.setup = function () { ... } with standard function setup()
    code = re.sub(
        r"p\.setup\s*=\s*function\s*\(\)\s*\{\s*const container[\s\S]*?c\.parent\(container\);",
        "function setup() {\n    createCanvas(width, height);",
        code,
    )
    code = re.sub(r"p\.draw\s*=\s*function\s*\(\)\s*\{", "function draw() {", code)
    # Replace p.<ident> with <ident>
    code = re.sub(r"\bp\.([A-Za-z_][A-Za-z0-9_]*)", r"\1", code)
    return code.strip()


def normalize_url_sketch(ref_name: str, code: str) -> str:
    """Apply targeted fixes to individual URL-extracted sketches so all 81 run cleanly in BrainImation."""
    # 1. Ivan_L #1 uses `new p5((p) => { ... })`
    if ref_name == "portfolio_test__Ivan_L_portfolio__1_0e2eac13.js":
        return convert_ivan_instance_mode(code)

    # 2. Ella_T final project had `arc(` accidentally commented out on line 32
    if ref_name == "finalPortfolio__Ella_T_final_project__1_ec24926b.js":
        code = code.replace(
            "let open = abs(sin(frameCount * 0.2)) * 40; // mouth opening angle arc( \n"
            "//  pacman.x, pacman.y, \n"
            "//  pacman.size, pacman.size, \n"
            "//  radians(open), \n"
            "//  radians(360 - open), \n"
            "//  PIE\n"
            "// );",
            "let open = abs(sin(frameCount * 0.2)) * 40; // mouth opening angle\n"
            "arc(\n"
            "  pacman.x, pacman.y,\n"
            "  pacman.size, pacman.size,\n"
            "  radians(open),\n"
            "  radians(360 - open),\n"
            "  PIE\n"
            ");",
        )

    # 3. Hardi_P #1 (ERP Face/Object) has no setup() and uses HSB colors
    if ref_name == "portfolio_test__Hardi_P_portfolio__1_fe3005e0.js":
        setup_block = """function setup() {
  createCanvas(width, height);
  colorMode(HSB, 360, 100, 100);
  stimTimer = millis();
}

"""
        code = setup_block + code

    # 4. Hardi_P #2 (Ice Cream Catch) has no setup()
    if ref_name == "portfolio_test__Hardi_P_portfolio__2_4336fa6e.js":
        setup_block = """function setup() {
  createCanvas(width, height);
  cones = [];
  splatters = [];
  fireworks = [];
  score = 0;
  basket = { x: width / 2, y: height - 60, w: 100, h: 25, stack: [] };
}

"""
        code = setup_block + code

    # 5. Jia_G #1 & #3 (Neon Ribbons) have no setup()
    if ref_name in (
        "portfolio_test__Jia_G_portfolio__1_17848601.js",
        "portfolio_test__Jia_G_portfolio__3_15ea3ba9.js",
    ):
        setup_block = """function setup() {
  createCanvas(width, height);
  waves = [];
  background(0);
}

"""
        code = setup_block + code

    # 6. Rana_R #1 (Caterpillar Race) redeclares `let eegData = ...` and overwrites with random(5,15)
    if ref_name == "portfolio_test__Rana_R_portfolio__1_ea166b0d.js":
        code = code.replace(
            "let eegData = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };",
            "// Uses BrainImation global eegData\nlet scaledEEG = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };",
        )
        code = code.replace("finishLine = 900;", "finishLine = 520;")
        code = code.replace(
            "  eegData.alpha = random(5, 15);\n"
            "  eegData.beta = random(5, 15);\n"
            "  eegData.gamma = random(5, 15);\n"
            "  eegData.theta = random(0, 10);\n"
            "  eegData.delta = random(0, 5);",
            "  finishLine = max(320, width - 110);\n"
            "  scaledEEG.alpha = constrain((eegData.alpha || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.beta  = constrain((eegData.beta  || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.gamma = constrain((eegData.gamma || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.theta = constrain((eegData.theta || 0.5) * 10, 0, 10);\n"
            "  scaledEEG.delta = constrain((eegData.delta || 0.5) * 5,  0, 5);",
        )
        code = code.replace("eegData.", "scaledEEG.")

    # 7. Rana_R #3 (1-Second Averaged Caterpillar Visualizer) redeclares `let eegData = ...`
    if ref_name == "portfolio_test__Rana_R_portfolio__3_b086bed1.js":
        code = code.replace(
            "let eegData = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };",
            "// Uses BrainImation global eegData\nlet scaledEEG = { alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 };",
        )
        code = code.replace(
            "  eegData.alpha = Math.random() * 15;\n"
            "  eegData.beta = Math.random() * 15;\n"
            "  eegData.gamma = Math.random() * 15;\n"
            "  eegData.theta = Math.random() * 15;\n"
            "  eegData.delta = Math.random() * 15;",
            "  scaledEEG.alpha = constrain((eegData.alpha || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.beta  = constrain((eegData.beta  || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.gamma = constrain((eegData.gamma || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.theta = constrain((eegData.theta || 0.5) * 15, 0, 15);\n"
            "  scaledEEG.delta = constrain((eegData.delta || 0.5) * 15, 0, 15);",
        )
        code = code.replace("for (let key in eegData)", "for (let key in scaledEEG)")
        code = code.replace("eegHistory[key].push(eegData[key]);", "eegHistory[key].push(scaledEEG[key]);")

    return code.strip()


def main():
    EXAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    inline_sketches = load_inline_a2_sketches()

    written_files: list[Path] = []

    for order, (ex_id, title, desc, src_type, src_ref) in enumerate(SKETCH_MANIFEST, start=1):
        if src_type == "url":
            raw_code = (URL_SKETCHES_DIR / src_ref).read_text(encoding="utf-8", errors="replace")
            body = normalize_url_sketch(src_ref, raw_code)
        elif src_type == "ivan_final":
            raw_code = (NEUROCLASS_DIR / "finalPortfolio" / src_ref).read_text(encoding="utf-8")
            body = convert_ivan_instance_mode(raw_code)
        elif src_type == "alicia_heels":
            body = ALICIA_HEELS_P5_CODE.strip()
        elif src_type == "inline":
            body = inline_sketches[src_ref].strip()
        else:
            raise ValueError(f"Unknown source type: {src_type}")

        # Strip any leading JSDoc block so our `@id / @title / @category` header is first
        body = re.sub(r"^\s*/\*\*[\s\S]*?\*/\s*", "", body, count=1)

        header = f"""/**
 * @id {ex_id}
 * @title {title}
 * @category {CATEGORY}
 * @order {order}
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * {desc}
 */
"""
        out_path = EXAMPLES_DIR / f"{ex_id}.js"
        out_path.write_text(header + body + "\n", encoding="utf-8")
        written_files.append(out_path)

    print(f"Wrote {len(written_files)} student sketches to {EXAMPLES_DIR}")

    # Verify syntax of every generated file with `node --check`
    errors = []
    for p in written_files:
        res = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
        if res.returncode != 0:
            errors.append((p.name, res.stderr.strip()))

    if errors:
        print(f"Syntax errors found in {len(errors)} files:")
        for name, err in errors:
            print(f"  {name}: {err}")
        raise SystemExit(1)
    else:
        print(f"All {len(written_files)} generated files passed `node --check`!")


if __name__ == "__main__":
    main()
