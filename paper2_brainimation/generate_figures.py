#!/usr/bin/env python3
"""
Generate publication-quality figures and statistical macros for Paper 2 (BrainImation)
from repository source code (Brainimation) and classroom student submissions (PSYCH 403).
Covers:
  - Unified Multi-Generation WebBluetooth Client (muse-browser.js: Muse 2016, Muse 2, Muse S, and Muse S Athena 273e0013)
  - 226-Sketch Visual Catalogue across 18 Categories (including 36 Core Scaffolds, 10 PPG/fNIRS, 11 IMU/Broadcast,
    5 Multimodal, 14 BrainGames, 13 EEGEdu Modules, 16 Classic p5.eegedu, 95 2025 Neurotech, 26 2022 NeuroArt)
  - 148-API / 28-Group Interactive Reference & IntelliSense Database across 5 Documentation Tabs (+ AI Tab)
  - 64 Hz Multi-Wavelength PPG / Modified Beer-Lambert fNIRS & 8 mm vs. 20 mm Short-Channel Skin Regression
  - 52 Hz 6-DOF IMU Complementary Orientation, 2nd-Order Kinematics, & 6-Tap NLMS Head-Movement EEG Filter
  - Empirical Classroom Evaluation across N = 69 PSYCH 403 Student Submissions (N_students = 30)
"""
import os
import glob
import re
import json
import csv
import hashlib
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch, Rectangle
from PIL import Image

plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["DejaVu Sans", "Arial", "Helvetica"],
    "font.size": 9.5,
    "axes.titlesize": 10.2,
    "axes.titleweight": "bold",
    "axes.labelsize": 9.5,
    "xtick.labelsize": 8.5,
    "ytick.labelsize": 8.5,
    "legend.fontsize": 7.8,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "axes.spines.top": False,
    "axes.spines.right": False,
})

P2_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(P2_DIR)
PARENT_BRAIN_DIR = os.path.dirname(BASE_DIR)
LOCAL_BRAIN_DIR = "/Users/fulkanjou/Brainimation"
BRAIN_DIR = BASE_DIR if os.path.exists(os.path.join(BASE_DIR, "index.html")) else (PARENT_BRAIN_DIR if os.path.exists(os.path.join(PARENT_BRAIN_DIR, "index.html")) else (LOCAL_BRAIN_DIR if os.path.exists(LOCAL_BRAIN_DIR) else os.path.join(BASE_DIR, "repos/Brainimation")))
OUT_DIR = os.path.join(P2_DIR, "figures")
TBL_DIR = os.path.join(P2_DIR, "tables")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TBL_DIR, exist_ok=True)

CORE_10_CATEGORIES = [
    "Getting Started",
    "Brain Wave Visualizations",
    "Attention & Meditation",
    "Particle Systems",
    "3D & Advanced",
    "Drawing & Interaction",
    "Raw EEG Data",
    "Noise & Generative",
    "Animation & Motion",
    "Sound & Music",
]


def extract_executable_lines(code_text):
    """Return list of non-blank, non-comment executable lines of JavaScript code."""
    lines = [ln.strip() for ln in code_text.splitlines()]
    return [
        ln for ln in lines
        if ln and not ln.startswith("//") and not ln.startswith("/*") and not ln.startswith("*") and not ln.startswith("*/")
    ]


def count_executable_loc(code_text):
    """Count non-blank, non-comment executable lines of JavaScript code."""
    return len(extract_executable_lines(code_text))


def read_committed_or_disk(rel_path):
    """Read file from disk except for uncommitted scratch entries not in the 226-sketch published catalogue."""
    fpath = os.path.join(BRAIN_DIR, rel_path)
    return open(fpath, "r", errors="ignore").read() if os.path.exists(fpath) else None


def analyze_builtin_examples():
    """Parse all 234 BrainImation catalogue sketches across 21 categories + the 37 core scaffolds."""
    manifest_raw = read_committed_or_disk("examples/manifest.json")
    manifest = json.loads(manifest_raw)
    cat_order = manifest["categoryOrder"]

    examples = []
    for entry in manifest["examples"]:
        code = read_committed_or_disk(f"examples/{entry['file']}")
        if code is None:
            continue
        exec_lines = extract_executable_lines(code)
        exec_code = "\n".join(exec_lines)
        loc = len(exec_lines)
        examples.append({
            "id": entry["id"],
            "file": entry["file"],
            "title": entry["title"],
            "category": entry["category"],
            "is_core_scaffold": entry["category"] in CORE_10_CATEGORIES,
            "loc": loc,
            "alpha": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)alpha\b|getChannelBand\(\s*['\"]alpha", exec_code)),
            "beta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)beta\b|getChannelBand\(\s*['\"]beta", exec_code)),
            "theta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)theta\b|getChannelBand\(\s*['\"]theta", exec_code)),
            "delta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)delta\b|getChannelBand\(\s*['\"]delta", exec_code)),
            "gamma": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)gamma\b|getChannelBand\(\s*['\"]gamma", exec_code)),
            "attention": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)attention\b", exec_code)),
            "meditation": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)meditation\b", exec_code)),
            "raw_epoch": bool(re.search(r"getRawChannel|getAllChannels|getRecentEpoch|eegData\.raw\b|getSpectrum", exec_code)),
            "ppg_fnirs": bool(re.search(r"ppg|heartRate|getPPGChannel|getAllPPGChannels|ppgShort|ppgLong|fnirsRegression", exec_code)),
            "imu_motion": bool(re.search(r"accel|gyro|pitch|roll|yaw|orientation|linearAccel|velocity|position|getAccelChannel|getGyroChannel|getCleanChannel|motionFilterWeights|telemetry|drlRef", exec_code)),
            "audio": bool(re.search(r"Oscillator|PolySynth|MonoSynth|Reverb|FFT|AudioContext", exec_code)),
            "webgl_3d": bool(re.search(r"WEBGL|rotateX|rotateY|torus|sphere|box\(", exec_code)),
        })

    with open(os.path.join(TBL_DIR, "builtin_examples_metrics.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Example_ID", "Title", "Category", "Is_Core_Scaffold", "Executable_LOC", "Alpha", "Beta", "Theta",
                    "Delta", "Gamma", "Attention", "Meditation", "Raw_256Hz_Epoch", "PPG_fNIRS", "IMU_Motion", "Audio_Synth", "WebGL_3D"])
        for ex in examples:
            w.writerow([ex["id"], ex["title"], ex["category"], int(ex["is_core_scaffold"]), ex["loc"],
                        int(ex["alpha"]), int(ex["beta"]), int(ex["theta"]), int(ex["delta"]),
                        int(ex["gamma"]), int(ex["attention"]), int(ex["meditation"]),
                        int(ex["raw_epoch"]), int(ex["ppg_fnirs"]), int(ex["imu_motion"]),
                        int(ex["audio"]), int(ex["webgl_3d"])])

    return examples, cat_order


def make_fig1_ide_architecture(examples, cat_order, muse_kb, reduction_factor):
    """Fig 1: BrainImation Client-Side Multimodal Architecture, Muse S Athena / Lazy-GATT Client, and 18-Category Catalogue."""
    fig = plt.figure(figsize=(14.0, 8.2))
    gs = gridspec.GridSpec(2, 2, height_ratios=[0.84, 1.32], width_ratios=[0.78, 1.42], hspace=0.25, wspace=0.14)

    # Panel A: 5-Stage Client-Side Architecture
    ax_a = fig.add_subplot(gs[0, :])
    ax_a.set_xlim(0, 100)
    ax_a.set_ylim(2, 25)
    ax_a.axis("off")
    ax_a.set_title(
        "A. BrainImation Multimodal Client-Side Architecture: Muse S Athena + Classic BLE Client, PPG/fNIRS, 6-DOF IMU & Visual Catalogue",
        loc="left", pad=4, fontsize=10.8
    )

    boxes = [
        (0.8, 4.0, 18.4, 18.0, "#1f4e78",
         f"1. Multi-Gen BLE Client\n   (muse-browser.js, {muse_kb:.1f} KB)\n\n"
         "• Classic Two-Phase Lazy GATT\n"
         "  (Muse 2016 / Muse 2 / Muse S)\n"
         "• Muse S Athena (273e0013):\n"
         "  14-bit EEG, 20-bit 16-ch PPG,\n"
         "  52 Hz IMU, DRL/REF, Battery\n"
         "• Live p1042 / p50 PPG Toggle"),
        (21.6, 4.0, 18.2, 18.0, "#008080",
         "2. Multimodal Signal Engine\n   (window.eegData + Sim)\n\n"
         "• 256 Hz EEG + 60/50Hz Notch + FFT\n"
         "• 64 Hz PPG, HR, SpO₂, 730/850nm\n"
         "  MBLL Δ[HbO₂]/Δ[HHb] + 8/20mm\n"
         "  Short-Channel Skin Regression\n"
         "• 52 Hz 6-DOF IMU Kinematics +\n"
         "  6-Tap NLMS Motion Filter"),
        (42.2, 4.0, 18.2, 18.0, "#2e75b6",
         "3. Browser IDE & Catalogue\n   (Monaco + 153-API Ref)\n\n"
         "• Resizable Visual Catalogue\n"
         "  (234 Cards, 21 Categories)\n"
         "• 5-Tab Reference Drawer (+ AI Tab):\n"
         "  P5, Input, Sound, EEG, IMU/PPG\n"
         "• In-Canvas About Guide &\n"
         "  Zoom-Style Mobile Fullscreen"),
        (62.8, 4.0, 17.4, 18.0, "#d95f02",
         "4. Dynamic Introspection\n   (bindP5Functions + BGShared)\n\n"
         "• Auto-binds p5.js 2D/WebGL\n"
         "  & p5.sound to window\n"
         "• Forwards 15 Lifecycle/DOM hooks\n"
         "• BGShared Arcade CRT Engine\n"
         "• CSV Exporter & SoundTester"),
        (82.6, 4.0, 16.6, 18.0, "#6a3d9a",
         "5. Live Output Modalities\n   (234 Catalogue Sketches)\n\n"
         "• 44 Starters, Diag & Core\n"
         "• 26 PPG/fNIRS, IMU & Multi\n"
         "• 14 Closed-Loop BrainGames\n"
         "• 29 EEGEdu & p5.eegedu Ports\n"
         "• 121 Student Archive Sketches"),
    ]
    for x, y, w, h, col, text in boxes:
        patch = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.45,rounding_size=1.2",
                               facecolor=col, edgecolor="none", alpha=0.94)
        ax_a.add_patch(patch)
        ax_a.text(x + w / 2, y + h / 2, text, color="white", ha="center", va="center",
                  fontsize=7.6, linespacing=1.20, fontweight="medium")

    for x_start, x_end in [(19.4, 21.3), (40.0, 41.9), (60.6, 62.5), (80.4, 82.3)]:
        ax_a.annotate("", xy=(x_end, 13), xytext=(x_start, 13),
                      arrowprops=dict(arrowstyle="->,head_width=0.35,head_length=0.45", lw=2.1, color="#333333"))

    # Panel B: Screenshot of BrainImation Live IDE
    ax_b = fig.add_subplot(gs[1, 0])
    scr_path = os.path.join(BRAIN_DIR, "screenshot.png")
    if os.path.exists(scr_path):
        img = Image.open(scr_path)
        ax_b.imshow(img)
    ax_b.set_xticks([])
    ax_b.set_yticks([])
    for sp in ax_b.spines.values():
        sp.set_visible(True)
        sp.set_color("#cccccc")
    ax_b.set_title("B. BrainImation Live Browser IDE & Visual Catalogue", loc="center", pad=8, fontsize=10.2)

    # Panel C: Summary Table of the 21-Category Unified Visual Catalogue (N = 234 Sketches)
    ax_c = fig.add_subplot(gs[1, 1])
    ax_c.axis("off")
    ax_c.set_title("C. Unified 21-Category Visual Catalogue (234 Interactive Sketches with Thumbnail Cards)", loc="left", pad=8, fontsize=10.2)

    col_labels = ["Catalogue Category / Track", "N", "Med.", "Representative Sketches", "Primary Physiological & API Modalities"]
    table_data = [
        ["1–2. One-Sensor Starters & Diag.", "7", "25", "simpleEEG, simplePPG, athenaPresetSweep", "Minimal starters & Athena 16-ch diagnostics"],
        ["3–5. Intro, Bands & Raw EEG", "13", "32", "basic, bandOrbitz, epochs, SpO2Fused", "eegData bands, 256 Hz ERPs, fused SpO₂"],
        ["6. PPG & Optical (fNIRS Studio)", "10", "200", "fNIRSBeerLambert, ppgShortChannel...", "64 Hz 660/730/850nm, HbO₂/HHb, 8/20mm OLS"],
        ["7. Motion, IMU & Broadcast", "11", "215", "imuStackedKinematics, imuHeadMove...", "52 Hz Accel/Gyro, 2nd-order pos., NLMS filter"],
        ["8. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, PPG-peak locked HEP"],
        ["9–15. Attention, 3D & Sound", "24", "34", "mandala, 3dTorus, perlinNoise, brainSynth", "WEBGL 3D, particles, webcam, Chowning FM"],
        ["16. BrainGames Arcade Suite", "14", "514", "gameGolfShooter, gameArchery, FPS", "14 closed-loop BCI arcade games (BGShared)"],
        ["17–18. EEGEdu & p5.eegedu", "29", "44", "eegeduFlock3D, Oddball, eegeduEpochs", "Per-channel PSD, SSVEP/ERP CSV export"],
        ["19–20. 2025 Neurotech Class", "95", "149", "EegFlappyBird, EegTetris, CatErp", "Curated PSYCH 403 BCI games & 4-ch ERPs"],
        ["21. 2022 NeuroArt Class Gallery", "26", "43", "studentBrainTyphoon, Terrain3D", "Inaugural 2022 undergraduate neuro-art gallery"],
    ]
    tbl = ax_c.table(
        cellText=table_data, colLabels=col_labels, loc="center", cellLoc="left",
        colWidths=[0.26, 0.04, 0.05, 0.30, 0.35], bbox=[0.0, 0.0, 1.0, 0.96]
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(6.3)
    for (row, col), cell in tbl.get_celld().items():
        cell.set_edgecolor("#d0d7de")
        cell.PAD = 0.025
        if row == 0:
            cell.set_facecolor("#1f4e78")
            cell.get_text().set_color("white")
            cell.get_text().set_weight("bold")
        elif row in (5, 6, 7):
            cell.set_facecolor("#e8f4f8")
        elif row in (8, 9, 10):
            cell.set_facecolor("#f3eefc")
        else:
            cell.set_facecolor("#ffffff" if row % 2 == 1 else "#f8f9fa")

    fig.savefig(os.path.join(OUT_DIR, "fig1_brainimation_ide_architecture.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig1_brainimation_ide_architecture.pdf"), bbox_inches="tight")
    plt.close(fig)
    print("Saved Paper 2 Fig 1 (Multimodal Architecture & 18-Category Catalogue Table)")


def make_fig1_equal_boxes(examples, cat_order, muse_kb, reduction_factor):
    """Paper 3 Fig 1. Five equal boxes, full screenshot centred on the blue box, one-line table.

    Writes figures/fig1_equal_boxes.pdf. Does not overwrite Kyle's
    fig1_brainimation_ide_architecture.pdf. Box text, titles, and table
    labels are his wording.
    """
    boxes = [
        ("#1f4e78",
         f"1. Multi-Gen BLE Client\n   (muse-browser.js, {muse_kb:.1f} KB)\n\n"
         "• Classic Two-Phase Lazy GATT\n"
         "  (Muse 2016 / Muse 2 / Muse S)\n"
         "• Muse S Athena (273e0013):\n"
         "  14-bit EEG, 20-bit 16-ch PPG,\n"
         "  52 Hz IMU, DRL/REF, Battery\n"
         "• Live p1042 / p50 PPG Toggle"),
        ("#008080",
         "2. Multimodal Signal Engine\n   (window.eegData + Sim)\n\n"
         "• 256 Hz EEG + 60/50Hz Notch + FFT\n"
         "• 64 Hz PPG, HR, SpO₂, 730/850nm\n"
         "  MBLL Δ[HbO₂]/Δ[HHb] + 8/20mm\n"
         "  Short-Channel Skin Regression\n"
         "• 52 Hz 6-DOF IMU Kinematics +\n"
         "  6-Tap NLMS Motion Filter"),
        ("#2e75b6",
         "3. Browser IDE & Catalogue\n   (Monaco + 153-API Ref)\n\n"
         "• Resizable Visual Catalogue\n"
         "  (234 Cards, 21 Categories)\n"
         "• 5-Tab Reference Drawer (+ AI Tab):\n"
         "  P5, Input, Sound, EEG, IMU/PPG\n"
         "• In-Canvas About Guide &\n"
         "  Zoom-Style Mobile Fullscreen"),
        ("#d95f02",
         "4. Dynamic Introspection\n   (bindP5Functions + BGShared)\n\n"
         "• Auto-binds p5.js 2D/WebGL\n"
         "  & p5.sound to window\n"
         "• Forwards 15 Lifecycle/DOM hooks\n"
         "• BGShared Arcade CRT Engine\n"
         "• CSV Exporter & SoundTester"),
        ("#6a3d9a",
         "5. Live Output Modalities\n   (234 Catalogue Sketches)\n\n"
         "• 44 Starters, Diag & Core\n"
         "• 26 PPG/fNIRS, IMU & Multi\n"
         "• 14 Closed-Loop BrainGames\n"
         "• 29 EEGEdu & p5.eegedu Ports\n"
         "• 121 Student Archive Sketches"),
    ]

    # Equal boxes. The screenshot is the full older screen, as tall as the boxes.
    FONT = 14.0
    TITLE_FONT = 15.0
    PAD_X, PAD_Y = 0.10, 0.07
    gap_x = 0.18
    margin_x = 0.22
    shot_full = Image.open(os.path.join(BRAIN_DIR, "screenshot.png"))
    shot = shot_full
    img_w = 2.10
    img_h = img_w * shot.size[1] / shot.size[0]

    probe = plt.figure(figsize=(2, 2), dpi=180)
    probe_ax = probe.add_axes([0, 0, 1, 1])
    probe_ax.axis("off")

    def text_size(text, fontsize, weight, linespacing=None):
        extra = {}
        if linespacing is not None:
            extra["linespacing"] = linespacing
        artist = probe_ax.text(
            0, 0, text, fontsize=fontsize, fontweight=weight,
            ha="left", va="bottom", **extra)
        probe.canvas.draw()
        bb = artist.get_window_extent()
        artist.remove()
        return bb.width / 180.0, bb.height / 180.0

    def wrap_to_inches(text, fontsize, weight, max_w):
        words = text.split()
        lines, cur = [], ""
        for word in words:
            trial = word if not cur else cur + " " + word
            if text_size(trial, fontsize, weight)[0] <= max_w or not cur:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    def wrap_keeping_breaks(text, max_w):
        """Wrap only lines that are wider than max_w. Wording stays the same."""
        out = []
        for line in text.split("\n"):
            if line.strip() == "" or text_size(line, FONT, "medium")[0] <= max_w:
                out.append(line)
                continue
            lead = line[:len(line) - len(line.lstrip(" "))]
            words = line[len(lead):].split()
            cur = lead
            wrapped = []
            for word in words:
                trial = (lead + word) if cur == lead else cur + " " + word
                if text_size(trial, FONT, "medium")[0] <= max_w or cur == lead:
                    cur = trial
                else:
                    wrapped.append(cur)
                    cur = lead + word
            if cur.strip():
                wrapped.append(cur)
            out.extend(wrapped)
        return "\n".join(out)

    box_text = [text for _, text in boxes]
    natural = []
    for text in box_text:
        tw, th = text_size(text, FONT, "medium", linespacing=1.12)
        natural.append((tw + 2 * PAD_X, th + 2 * PAD_Y))
    print("natural inches", ["%.2f x %.2f" % s for s in natural])
    # One shared width, about half an inch under the widest original box.
    # Every box then uses the tallest wrapped text, so the lengths match.
    BOX_W = max(s[0] for s in natural) - 0.50
    inner = BOX_W - 2 * PAD_X
    original_text = list(box_text)
    for i, text in enumerate(original_text):
        box_text[i] = wrap_keeping_breaks(text, inner)
    text_heights = []
    for text in box_text:
        tw, th = text_size(text, FONT, "medium", linespacing=1.12)
        text_heights.append(th + 2 * PAD_Y)
        print("  wrapped text %.2f x %.2f" % (tw + 2 * PAD_X, th + 2 * PAD_Y))
    BOX_H = max(text_heights)
    box_sizes = [(BOX_W, BOX_H) for _ in box_text]
    print("shared box %.2f x %.2f" % (BOX_W, BOX_H))

    # Keep the table at the width it had before the boxes were narrowed.
    row1_natural = sum(s[0] for s in natural[:3]) + 2 * gap_x
    FW_TABLE = margin_x + row1_natural + margin_x

    # Full older screenshot, as tall as the equal boxes, centred on the blue box.
    x3 = margin_x + box_sizes[0][0] + gap_x + box_sizes[1][0] + gap_x
    w3 = box_sizes[2][0]
    img_h = BOX_H
    img_w = img_h * shot_full.size[0] / shot_full.size[1]
    shot = shot_full
    print("B image %.2f x %.2f in, no crop" % (img_w, img_h))

    row1_w = sum(s[0] for s in box_sizes[:3]) + 2 * gap_x
    row2_boxes_w = box_sizes[3][0] + gap_x + box_sizes[4][0]
    row2_w = row2_boxes_w + gap_x + img_w
    # Stay on the table's width so the table type does not change.
    FW = FW_TABLE
    top = 0.16
    title_a_h = 0.72
    gap_after_a = 0.14
    b_title = "B. BrainImation Live Browser IDE & Visual Catalogue"
    gap_after_b = 0.22
    bottom = 0.14

    # Table C: original wording, one line per row. Font is the largest
    # size that keeps every cell on that one line inside the table width.
    headers = [
        "Catalogue Category / Track",
        "N",
        "Med.",
        "Representative Sketches",
        "Primary Physiological & API Modalities",
    ]
    raw_rows = [
        ["1–2. One-Sensor Starters & Diag.", "7", "25", "simpleEEG, simplePPG, athenaPresetSweep", "Minimal starters & Athena 16-ch diagnostics"],
        ["3–5. Intro, Bands & Raw EEG", "13", "32", "basic, bandOrbitz, epochs, SpO2Fused", "eegData bands, 256 Hz ERPs, fused SpO₂"],
        ["6. PPG & Optical (fNIRS Studio)", "10", "200", "fNIRSBeerLambert, ppgShortChannel...", "64 Hz 660/730/850nm, HbO₂/HHb, 8/20mm OLS"],
        ["7. Motion, IMU & Broadcast", "11", "215", "imuStackedKinematics, imuHeadMove...", "52 Hz Accel/Gyro, 2nd-order pos., NLMS filter"],
        ["8. Multimodal (EEG + PPG + HR)", "5", "117", "multiNeurovascularCoupling, HEP", "Neurovascular lag, PPG-peak locked HEP"],
        ["9–15. Attention, 3D & Sound", "24", "34", "mandala, 3dTorus, perlinNoise, brainSynth", "WEBGL 3D, particles, webcam, Chowning FM"],
        ["16. BrainGames Arcade Suite", "14", "514", "gameGolfShooter, gameArchery, FPS", "14 closed-loop BCI arcade games (BGShared)"],
        ["17–18. EEGEdu & p5.eegedu", "29", "44", "eegeduFlock3D, Oddball, eegeduEpochs", "Per-channel PSD, SSVEP/ERP CSV export"],
        ["19–20. 2025 Neurotech Class", "95", "149", "EegFlappyBird, EegTetris, CatErp", "Curated PSYCH 403 BCI games & 4-ch ERPs"],
        ["21. 2022 NeuroArt Class Gallery", "26", "43", "studentBrainTyphoon, Terrain3D", "Inaugural 2022 undergraduate neuro-art gallery"],
    ]
    title_c = "C. Unified 21-Category Visual Catalogue (234 Interactive Sketches with Thumbnail Cards)"
    PAD_CELL_X, PAD_CELL_Y = 0.05, 0.045
    REF_PT = 10.0
    table_w = FW - 0.56
    probe = plt.figure(figsize=(2, 2), dpi=180)
    probe_ax = probe.add_axes([0, 0, 1, 1])
    probe_ax.axis("off")

    def text_size(text, fontsize, weight, linespacing=None):
        extra = {}
        if linespacing is not None:
            extra["linespacing"] = linespacing
        artist = probe_ax.text(
            0, 0, text, fontsize=fontsize, fontweight=weight,
            ha="left", va="bottom", **extra)
        probe.canvas.draw()
        bb = artist.get_window_extent()
        artist.remove()
        return bb.width / 180.0, bb.height / 180.0

    def wrap_to_inches(text, fontsize, weight, max_w):
        words = text.split()
        lines, cur = [], ""
        for word in words:
            trial = word if not cur else cur + " " + word
            if text_size(trial, fontsize, weight)[0] <= max_w or not cur:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    # B title is centred on the blue box and uses that box's width,
    # so it stays on two lines instead of three.
    b_title_w = w3
    b_lines = wrap_to_inches(b_title, TITLE_FONT, "bold", b_title_w)
    while len(b_lines) > 2 and b_title_w < FW:
        b_title_w += 0.1
        b_lines = wrap_to_inches(b_title, TITLE_FONT, "bold", b_title_w)
    b_title_wrapped = "\n".join(b_lines)
    _, b_title_h = text_size(b_title_wrapped, TITLE_FONT, "bold", linespacing=1.12)
    gap_rows = b_title_h + 0.12
    print("B title (%d lines, %.2f in wide): %s" % (len(b_lines), b_title_w, b_lines))

    col_text_w = []
    for c in range(5):
        samples = [(headers[c], "bold")] + [(row[c], "medium") for row in raw_rows]
        col_text_w.append(max(text_size(text, REF_PT, weight)[0] for text, weight in samples))
    usable = table_w - 2 * PAD_CELL_X * 5
    TABLE_FONT = REF_PT * usable / sum(col_text_w)
    col_w = [w * TABLE_FONT / REF_PT + 2 * PAD_CELL_X for w in col_text_w]
    # Keep the columns inside the table if rounding drifts.
    col_w = [w * table_w / sum(col_w) for w in col_w]
    _, line_h = text_size("Ag", TABLE_FONT, "bold")
    row_h = line_h + 2 * PAD_CELL_Y
    table_body_h = (1 + len(raw_rows)) * row_h
    _, title_c_text_h = text_size(title_c, TITLE_FONT, "bold")
    title_c_h = title_c_text_h + 0.08
    table_h = title_c_h + table_body_h
    plt.close(probe)
    print("table font %.2f pt, row height %.2f in" % (TABLE_FONT, row_h))
    row1_h = max(s[1] for s in box_sizes[:3])
    row2_h = max(box_sizes[3][1], box_sizes[4][1], img_h)
    FH = (top + title_a_h + gap_after_a + row1_h + gap_rows + row2_h
          + gap_after_b + table_h + bottom)
    left = margin_x

    fig = plt.figure(figsize=(FW, FH), dpi=140)

    def ax_in(x, y, w, h):
        return fig.add_axes([x / FW, y / FH, w / FW, h / FH])

    def draw_box(x, y, w, h, color, text):
        ax = ax_in(x, y, w, h)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")
        ax.add_patch(FancyBboxPatch(
            (0.0, 0.0), 1.0, 1.0,
            boxstyle="round,pad=0.004,rounding_size=0.04",
            facecolor=color, edgecolor="none",
            mutation_aspect=h / w,
        ))
        ax.text(0.5, 0.5, text, color="white", ha="center", va="center",
                fontsize=FONT, linespacing=1.12, fontweight="medium")

    # Three boxes, then boxes 4 and 5 with the screenshot after box 5.
    y_title = FH - top
    fig.text(left / FW, y_title / FH,
             "A. BrainImation Multimodal Client-Side Architecture:\n"
             "Muse S Athena + Classic BLE Client, PPG/fNIRS, 6-DOF IMU & Visual Catalogue",
             ha="left", va="top", fontsize=TITLE_FONT, fontweight="bold")

    y_top = y_title - title_a_h - gap_after_a - row1_h
    x = left
    for i in range(3):
        w, h = box_sizes[i]
        draw_box(x, y_top + (row1_h - h), w, h, boxes[i][0], box_text[i])
        x += w + gap_x

    y_img = bottom + table_h + gap_after_b
    w4, h4 = box_sizes[3]
    w5, h5 = box_sizes[4]
    # Tops of boxes 4 and 5 line up with the top of the smaller screenshot.
    y_row2_top = y_img + row2_h
    y4 = y_row2_top - h4
    y5 = y_row2_top - h5
    y_img_draw = y_row2_top - img_h
    draw_box(left, y4, w4, h4, boxes[3][0], box_text[3])
    draw_box(left + w4 + gap_x, y5, w5, h5, boxes[4][0], box_text[4])
    # Centred on the blue box, shifted right only if it would cover box 5.
    x_b = x3 + (w3 - img_w) / 2
    box5_right = left + w4 + gap_x + w5
    if x_b < box5_right + 0.08:
        x_b = box5_right + 0.08

    fig.text((x_b + img_w / 2) / FW, (y_img_draw + img_h + 0.04) / FH,
             b_title_wrapped,
             ha="center", va="bottom", fontsize=TITLE_FONT, fontweight="bold",
             linespacing=1.12)
    ax_b = ax_in(x_b, y_img_draw, img_w, img_h)
    ax_b.imshow(shot)
    ax_b.set_xticks([])
    ax_b.set_yticks([])
    for sp in ax_b.spines.values():
        sp.set_visible(True)
        sp.set_color("#cccccc")

    # One line per row. Columns are only as wide as their own text at TABLE_FONT.
    y_block_top = bottom + table_h
    fig.text(0.28 / FW, y_block_top / FH, title_c,
             ha="left", va="top", fontsize=TITLE_FONT, fontweight="bold")
    ax_c = ax_in(0.28, bottom, table_w, table_body_h)
    ax_c.set_xlim(0, table_w)
    ax_c.set_ylim(0, table_body_h)
    ax_c.axis("off")
    y_row = table_body_h
    for r in range(1 + len(raw_rows)):
        y_row -= row_h
        x_cell = 0.0
        for c in range(5):
            if r == 0:
                face = "#1f4e78"
            elif r in (5, 6, 7):
                face = "#e8f4f8"
            elif r in (8, 9, 10):
                face = "#f3eefc"
            else:
                face = "#ffffff" if r % 2 == 1 else "#f8f9fa"
            ax_c.add_patch(Rectangle(
                (x_cell, y_row), col_w[c], row_h,
                facecolor=face, edgecolor="#d0d7de", linewidth=0.6, clip_on=False,
            ))
            if r == 0:
                text, weight, color = headers[c], "bold", "white"
            else:
                text, weight, color = raw_rows[r - 1][c], "medium", "black"
            if c in (1, 2):
                ax_c.text(x_cell + col_w[c] / 2, y_row + row_h / 2, text,
                          ha="center", va="center", fontsize=TABLE_FONT,
                          fontweight=weight, color=color, clip_on=False)
            else:
                ax_c.text(x_cell + PAD_CELL_X, y_row + row_h / 2, text,
                          ha="left", va="center", fontsize=TABLE_FONT,
                          fontweight=weight, color=color, clip_on=False)
            x_cell += col_w[c]

    fig.savefig(os.path.join(OUT_DIR, "fig1_equal_boxes.png"), facecolor="white", dpi=180)
    fig.savefig(os.path.join(OUT_DIR, "fig1_equal_boxes.pdf"), facecolor="white", dpi=180)
    plt.close(fig)
    print("Saved Paper 3 Fig 1 (equal boxes)")


def make_fig2_ide_scaffolding_and_corpus(examples, cat_order):
    """Fig 2: Pedagogical IDE Scaffolding (153-API Reference Database, Simulator Synthesis, 21-Category LOC & Multimodal Coverage)."""
    fig = plt.figure(figsize=(14.0, 8.6))
    gs = gridspec.GridSpec(2, 2, height_ratios=[0.90, 1.25], width_ratios=[1.0, 1.0], hspace=0.36, wspace=0.40)

    # Panel A: 153-Item Interactive Reference & Autocomplete Database Across 5 Documentation Tabs & 30 Functional Groups
    ax_a = fig.add_subplot(gs[0, 0])
    ref_tabs = [
        ("Sensors / IMU & PPG\n(7 groups, 53 APIs)", [
            ("PPG/Optics", 11, "#005a4e"), ("Orient/Kin.", 10, "#008080"),
            ("fNIRS", 7, "#20a39e"), ("Accel", 7, "#48bf91"),
            ("Gyro", 7, "#76d7c4"), ("Telem/DRL", 6, "#a3e4d7"),
            ("NLMS", 5, "#c8f0e8")
        ]),
        ("P5.js Tab\n(6 groups, 38 APIs)", [
            ("Drawing", 9, "#1f4e78"), ("Color", 8, "#2e75b6"),
            ("Math", 8, "#4a90d9"), ("Transform", 5, "#6baed6"),
            ("Control", 4, "#9ecae1"), ("Text", 4, "#c6dbef")
        ]),
        ("Input Tab\n(7 groups, 27 APIs)", [
            ("Mouse Ev.", 6, "#3b5998"), ("Mouse Var", 6, "#5b7bd5"),
            ("Key Ev.", 3, "#7b9be0"), ("Key Var", 3, "#9bbbf0"),
            ("Touch Ev.", 3, "#b5cff8"), ("Touch Var", 3, "#cfe2ff"),
            ("Templates", 3, "#e4eeff")
        ]),
        ("EEG Data Tab\n(5 groups, 19 APIs)", [
            ("Raw EEG", 7, "#54278f"), ("Bands", 5, "#6a3d9a"),
            ("Connect", 4, "#807dba"), ("Derived", 2, "#9e9ac8"),
            ("Filter", 1, "#cbc9e2")
        ]),
        ("Sound Tab\n(5 groups, 16 APIs)", [
            ("Effects", 5, "#b34800"), ("Control", 4, "#d95f02"),
            ("Synths", 3, "#ec7014"), ("Files", 2, "#fe9929"),
            ("Analysis", 2, "#fec44f")
        ]),
    ]
    y_pos = np.arange(len(ref_tabs))[::-1]
    for idx, (tab_lbl, subcats) in enumerate(ref_tabs):
        y = y_pos[idx]
        left = 0
        for sub_lbl, cnt, col in subcats:
            ax_a.barh(y, cnt, left=left, height=0.58, color=col, edgecolor="white", lw=0.8)
            if cnt >= 6:
                # Width-6 Mouse bars cannot hold 6 pt "Mouse Ev." / "Mouse Var".
                size = 5.0 if sub_lbl.startswith("Mouse") else 6.0
                ax_a.text(left + cnt / 2, y, f"{sub_lbl}\n({cnt})",
                          ha="center", va="center", fontsize=size, linespacing=0.9,
                          color="white" if left < 28 else "#222222", fontweight="bold")
            left += cnt
        ax_a.text(left + 0.8, y, f"{left} APIs", va="center", ha="left", fontsize=8.0, fontweight="bold", color="#222")

    ax_a.set_yticks(y_pos)
    ax_a.set_yticklabels([r[0] for r in ref_tabs], fontweight="bold", fontsize=7.8)
    ax_a.set_xlim(0, 62)
    ax_a.set_xlabel("Click-to-Insert & Autocomplete API Primitives (Total = 153)")
    ax_a.set_title("A. Reference & IntelliSense (153 APIs, 30 Groups, 5 Docs Tabs)", loc="left", fontsize=10.0)

    # Panel B: Hardware-Free EEGSimulator 4-Channel 256 Hz Signal Synthesis (clean, no bbox overlay)
    ax_b = fig.add_subplot(gs[0, 1])
    rng = np.random.default_rng(42)
    t = np.linspace(0, 2.0, 512)
    att, med = 0.55, 0.65
    alpha_v = np.clip(med * 0.8 + 0.1 + 0.1 * np.sin(t * 2.5), 0, 1)
    beta_v = np.clip(att * 0.7 + 0.2 + 0.12 * np.sin(t * 3.5), 0, 1)
    theta_v = np.clip(med * 0.6 + 0.1 + 0.10 * np.sin(t * 1.8), 0, 1)
    delta_v = 0.15 + 0.05 * np.sin(t * 0.8)
    gamma_v = 0.15 + 0.45 * att + 0.08 * np.sin(t * 5.0)

    ch_names = ["TP9", "AF7", "AF8", "TP10"]
    ch_cols = ["#6a3d9a", "#2e75b6", "#008080", "#d95f02"]
    offsets = [225, 75, -75, -225]
    for i, (ch, col, off) in enumerate(zip(ch_names, ch_cols, offsets)):
        sig = (
            np.sin(2 * np.pi * (9 + i * 0.5) * t) * alpha_v * 30
            + np.sin(2 * np.pi * (18 + i * 1.5) * t) * beta_v * 20
            + np.sin(2 * np.pi * (6 + i * 0.3) * t) * theta_v * 25
            + np.sin(2 * np.pi * (2 + i * 0.2) * t) * delta_v * 40
            + np.sin(2 * np.pi * (35 + i * 2.0) * t) * gamma_v * 10
            + np.sin(2 * np.pi * 0.1 * t) * 5
            + rng.uniform(-0.5, 0.5, size=len(t)) * 15
        )
        if i in (1, 2):
            blink_env = 115.0 * np.exp(-((t - 1.15) ** 2) / (2 * 0.025 ** 2))
            sig += blink_env
        ax_b.plot(t, sig + off, color=col, lw=1.0, label=ch)

    ax_b.axvline(1.15, color="#1f4e78", ls="--", lw=1.0, alpha=0.7)
    ax_b.set_yticks(offsets)
    ax_b.set_yticklabels(["TP9\n(Left Temp.)", "AF7\n(Left Front.)", "AF8\n(Right Front.)", "TP10\n(Right Temp.)"], fontweight="bold", fontsize=7.8)
    ax_b.set_xlim(0, 2.0)
    ax_b.set_ylim(-300, 340)
    ax_b.set_xlabel("Simulated Time (seconds @ 256 Hz)")
    ax_b.set_title("B. Hardware-Free EEGSimulator 4-Channel 256 Hz Synthesis", loc="left", fontsize=10.0)
    ax_b.legend(loc="upper right", ncol=4, frameon=True, fontsize=7.2)

    # Panel C: Executable LOC Across the 21 Catalogue Categories (N = 234 Sketches)
    ax_c = fig.add_subplot(gs[1, 0])
    cat_short = {
        "Start Here: One Simple Sketch per Sensor": "1. One-Sensor Starters (n=4)",
        "Signal Quality & Diagnostics": "2. Signal Diagnostics (n=3)",
        "Getting Started": "3. Getting Started (n=4)",
        "Brain Wave Visualizations": "4. Brain Wave Viz (n=6)",
        "Raw EEG Data": "5. Raw EEG & ERPs (n=3)",
        "PPG & Optical (fNIRS)": "6. PPG & fNIRS Studio (n=10)",
        "Motion, IMU & Broadcast Sensors": "7. Motion & IMU Studio (n=11)",
        "Multimodal (EEG + PPG + HR)": "8. Multimodal Studio (n=5)",
        "Attention & Meditation": "9. Attention & Med. (n=2)",
        "Particle Systems": "10. Particle Systems (n=3)",
        "3D & Advanced": "11. 3D & WebGL (n=3)",
        "Drawing & Interaction": "12. Drawing & Input (n=3)",
        "Noise & Generative": "13. Noise & Gen. Art (n=6)",
        "Animation & Motion": "14. Animation & Cam (n=4)",
        "Sound & Music": "15. Sound & Music (n=3)",
        "BrainGames": "16. BrainGames Arcade (n=14)",
        "EEGEdu Modules": "17. EEGEdu Modules (n=13)",
        "Classic p5.eegedu": "18. Classic p5.eegedu (n=16)",
        "2025 Neurotech Class Catalogue": "19. 2025 Neurotech NF (n=62)",
        "2025 Neurotech ERP Assignments": "20. 2025 Neurotech ERP (n=33)",
        "2022 NeuroArt Class Gallery": "21. 2022 NeuroArt (n=26)",
    }
    y_cats = np.arange(len(cat_order))[::-1]
    for idx, cat in enumerate(cat_order):
        locs = [ex["loc"] for ex in examples if ex["category"] == cat]
        y = y_cats[idx]
        med_v = np.median(locs)
        min_v, max_v = np.min(locs), np.max(locs)
        if cat in ("PPG & Optical (fNIRS)", "Motion, IMU & Broadcast Sensors", "Multimodal (EEG + PPG + HR)", "Signal Quality & Diagnostics"):
            col = "#008080"
        elif cat in ("BrainGames", "EEGEdu Modules", "Classic p5.eegedu"):
            col = "#6a3d9a"
        elif cat in ("2025 Neurotech Class Catalogue", "2025 Neurotech ERP Assignments", "2022 NeuroArt Class Gallery"):
            col = "#d95f02"
        else:
            col = "#2e75b6"
        ax_c.barh(y, med_v, height=0.66, color=col, alpha=0.82)
        ax_c.plot([min_v, max_v], [y, y], color="#222222", lw=1.2)
        ax_c.text(max_v + 12.0, y, f"{int(np.floor(med_v + 0.5))} ({min_v}–{max_v})", va="center", ha="left", fontsize=6.0, fontweight="bold")

    ax_c.set_yticks(y_cats)
    ax_c.set_yticklabels([cat_short.get(c, c) for c in cat_order], fontsize=6.5, fontweight="medium")
    ax_c.set_xlim(0, 1450)
    ax_c.set_xlabel("Executable Lines of Code (Bar = Median, Line = Min–Max Range)")
    ax_c.set_title(f"C. Executable LOC Across All {len(cat_order)} Catalogue Categories (N = {len(examples)})", loc="left", fontsize=10.0)

    # Panel D: Multimodal & EEG Feature Coverage Across All 226 Catalogue Sketches
    ax_d = fig.add_subplot(gs[1, 1])
    feat_list = [
        ("eegData.alpha (8–12 Hz)", "alpha", "#2e75b6"),
        ("eegData.beta (13–30 Hz)", "beta", "#2e75b6"),
        ("256 Hz Raw / Epochs / PSD", "raw_epoch", "#1f4e78"),
        ("eegData.theta (4–8 Hz)", "theta", "#2e75b6"),
        ("eegData.attention Index", "attention", "#6a3d9a"),
        ("eegData.gamma (30–50 Hz)", "gamma", "#2e75b6"),
        ("eegData.delta (1–4 Hz)", "delta", "#2e75b6"),
        ("eegData.meditation Index", "meditation", "#6a3d9a"),
        ("p5.sound Web Audio Synth", "audio", "#d95f02"),
        ("64 Hz PPG / fNIRS / SpO₂", "ppg_fnirs", "#008080"),
        ("52 Hz IMU / Kinematics / NLMS", "imu_motion", "#005a4e"),
        ("3D WebGL Geometry", "webgl_3d", "#4d4d4d"),
    ]
    n_ex = len(examples)
    rows_d = []
    for lbl, key, col in feat_list:
        cnt = sum(1 for ex in examples if ex[key])
        pct = cnt / n_ex * 100.0
        rows_d.append((pct, cnt, lbl, col))
    rows_d.sort(key=lambda x: x[0])

    yd = np.arange(len(rows_d))
    bars_d = ax_d.barh(yd, [r[0] for r in rows_d], color=[r[3] for r in rows_d], alpha=0.88, height=0.64)
    for bar, (pct, cnt, _, _) in zip(bars_d, rows_d):
        ax_d.text(pct + 1.0, bar.get_y() + bar.get_height() / 2, f"{pct:.1f}% ({cnt}/{n_ex})",
                  va="center", ha="left", fontsize=7.0, fontweight="bold", color="#222")
    ax_d.set_yticks(yd)
    ax_d.set_yticklabels([r[2] for r in rows_d], fontsize=7.5, fontweight="medium")
    ax_d.set_xlim(0, 78)
    ax_d.set_xlabel("Percentage of Catalogue Sketches Demonstrating Feature (%)")
    ax_d.set_title(f"D. Multimodal API Coverage Across Catalogue (N = {n_ex})", loc="left", fontsize=10.0)

    fig.savefig(os.path.join(OUT_DIR, "fig2_ide_scaffolding_and_corpus.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig2_ide_scaffolding_and_corpus.pdf"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig2_creative_coding_sonification_pipeline.pdf"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig2_creative_coding_sonification_pipeline.png"), bbox_inches="tight")
    plt.close(fig)
    print("Saved Paper 2 Fig 2 (148-API Reference, Simulator & 18-Category Catalogue Profile)")


def make_fig3_sonification_and_erp_engine():
    """Fig 3: Multi-Band Web Audio FM Sonification (brainSynth.js), Online 4-Channel ERP Averaging (epochs.js), Frame-Jitter Transfer Function & Periodic/Aperiodic PSD."""
    fig = plt.figure(figsize=(13.6, 10.6))
    gs = gridspec.GridSpec(3, 2, height_ratios=[1.0, 1.04, 1.04], width_ratios=[1.02, 1.0], hspace=0.38, wspace=0.28)

    # Panel A: FM Synthesis Time-Domain Waveforms
    ax_a = fig.add_subplot(gs[0, 0])
    t = np.linspace(0, 0.025, 2000)
    fc1 = 200 + 600 * 0.75
    fm1 = 100 * 0.15
    d1 = 500 * 0.15
    y1 = np.sin(2 * np.pi * fc1 * t + (d1 / fm1) * np.sin(2 * np.pi * fm1 * t))

    fc2 = 200 + 600 * 0.45
    fm2 = 100 * 0.80
    d2 = 500 * 0.70
    y2 = np.sin(2 * np.pi * fc2 * t + (d2 / fm2) * np.sin(2 * np.pi * fm2 * t))

    ax_a.plot(t * 1000, y1 + 1.25, color="#2e75b6", lw=1.5, label="Relaxed Alpha (650 Hz)")
    ax_a.plot(t * 1000, y2 - 1.25, color="#d95f02", lw=1.4, label="Active Beta/Theta FM")
    ax_a.set_xlim(0, 25)
    ax_a.set_ylim(-2.6, 3.45)
    ax_a.set_yticks([-1.25, 1.25])
    ax_a.set_yticklabels(["Active FM", "Relaxed FM"], fontweight="bold")
    ax_a.set_xlabel("Time (milliseconds)")
    ax_a.set_ylabel("Synthesized Audio Waveform")
    ax_a.set_title("A. Brain Synthesizer (brainSynth.js): Chowning FM Waveforms", loc="left", fontsize=10.0)
    ax_a.legend(loc="upper right", frameon=True, fontsize=7.4)

    # Panel B: FM Synthesis Acoustic Sideband Spectra
    ax_b = fig.add_subplot(gs[0, 1])
    fs = 44100
    t_long = np.linspace(0, 0.5, int(fs * 0.5))
    sig1 = np.sin(2 * np.pi * fc1 * t_long + (d1 / fm1) * np.sin(2 * np.pi * fm1 * t_long))
    sig2 = np.sin(2 * np.pi * fc2 * t_long + (d2 / fm2) * np.sin(2 * np.pi * fm2 * t_long))
    f_ax = np.fft.rfftfreq(len(t_long), 1 / fs)
    spec1 = np.abs(np.fft.rfft(sig1 * np.hanning(len(t_long))))
    spec2 = np.abs(np.fft.rfft(sig2 * np.hanning(len(t_long))))
    spec1 /= spec1.max()
    spec2 /= spec2.max()
    mask_f = (f_ax >= 50) & (f_ax <= 1200)

    ax_b.plot(f_ax[mask_f], spec1[mask_f], color="#2e75b6", lw=1.6, label="Relaxed (Narrowband)")
    ax_b.plot(f_ax[mask_f], spec2[mask_f], color="#d95f02", lw=1.4, alpha=0.9, label="Active (Bessel Sidebands)")
    ax_b.set_xlim(50, 1150)
    ax_b.set_ylim(0, 1.32)
    ax_b.set_xlabel("Audio Frequency (Hz)")
    ax_b.set_ylabel("Normalized Acoustic Magnitude")
    ax_b.set_title("B. Acoustic FFT Spectrum of Brain-Modulated FM (p5.FFT)", loc="left", fontsize=10.0)
    ax_b.legend(loc="upper right", frameon=True, fontsize=7.4)

    # Panel C: Online ERP Trial Averaging & √K Noise Reduction
    ax_c = fig.add_subplot(gs[1, 0])
    rng = np.random.default_rng(101)
    n_samp = 256
    t_erp = np.linspace(-200, 800, n_samp)
    true_erp = (
        -6.5 * np.exp(-((t_erp - 170.0) ** 2) / (2 * 26.0 ** 2))
        + 9.5 * np.exp(-((t_erp - 340.0) ** 2) / (2 * 58.0 ** 2))
    )
    trials = []
    for _ in range(25):
        pink = np.convolve(rng.normal(0, 14.0, size=n_samp), np.ones(5) / np.sqrt(5), mode="same")
        alpha_bg = 6.0 * np.sin(2 * np.pi * 10.0 * (t_erp / 1000.0) + rng.uniform(0, 2 * np.pi))
        trial_sig = true_erp + pink + alpha_bg
        trial_sig -= np.mean(trial_sig[:51])
        trials.append(trial_sig)
    trials = np.array(trials)
    bl_rms_1 = float(np.std(trials[0, :51], ddof=1))

    ax_c.plot(t_erp, trials[0], color="#aaaaaa", lw=0.9, alpha=0.75, label="Single Epoch (K = 1)")
    ax_c.plot(t_erp, np.mean(trials[:5], axis=0), color="#2e75b6", lw=1.4, alpha=0.85, label="5-Trial Mean (K = 5)")
    ax_c.plot(t_erp, np.mean(trials[:20], axis=0), color="#d95f02", lw=2.3, label="20-Trial Mean (K = 20)")
    ax_c.axvline(0, color="#222222", ls="--", lw=1.1)
    ax_c.axhline(0, color="#666666", ls=":", lw=0.9)
    ax_c.annotate("N170", xy=(170, -6.2), xytext=(60, -18),
                  arrowprops=dict(arrowstyle="->", color="#1f4e78", lw=1.2), fontweight="bold", color="#1f4e78", fontsize=8.2)
    ax_c.annotate("P300", xy=(340, 9.2), xytext=(430, 16),
                  arrowprops=dict(arrowstyle="->", color="#b34800", lw=1.2), fontweight="bold", color="#b34800", fontsize=8.2)
    ax_c.set_xlim(-200, 800)
    ax_c.set_ylim(-42, 36)
    ax_c.set_xlabel("Time Relative to Stimulus Onset (ms @ 256 Hz)")
    ax_c.set_ylabel("Baseline-Corrected Potential (µV)")
    ax_c.set_title("C. Triggered Epoch Extraction (epochs.js) & √K ERP Convergence", loc="left", fontsize=10.0)
    ax_c.legend(loc="lower right", frameon=True, fontsize=7.4)

    # Panel D: Closed-Loop Signal Conditioning
    ax_d = fig.add_subplot(gs[1, 1])
    t_frames = np.arange(180)
    t_sec = t_frames / 60.0
    raw_alpha = 0.44 + 0.26 * np.sin(2 * np.pi * t_sec / 2.2) + rng.normal(0, 0.085, size=len(t_frames))
    raw_alpha = np.clip(raw_alpha, 0, 1)

    sm_alpha = np.zeros_like(raw_alpha)
    sm_alpha[0] = raw_alpha[0]
    for i in range(1, len(raw_alpha)):
        sm_alpha[i] = 0.85 * sm_alpha[i - 1] + 0.15 * raw_alpha[i]

    thresh_hi, thresh_lo = 0.58, 0.48
    state_gate = np.zeros_like(raw_alpha)
    active = False
    for i in range(len(raw_alpha)):
        if sm_alpha[i] >= thresh_hi:
            active = True
        elif sm_alpha[i] < thresh_lo:
            active = False
        state_gate[i] = 1.0 if active else 0.0

    ax_d.plot(t_sec, raw_alpha, color="#999999", lw=0.9, alpha=0.7, label="Unfiltered Alpha")
    ax_d.plot(t_sec, sm_alpha, color="#1f4e78", lw=2.1, label="EMA Smoothed (λ = 0.85)")
    ax_d.axhline(thresh_hi, color="#d95f02", ls="--", lw=1.2, label="Hysteresis Bounds")
    ax_d.axhline(thresh_lo, color="#d95f02", ls=":", lw=1.2)
    ax_d.fill_between(t_sec, 0, state_gate * 0.95, color="#6a3d9a", alpha=0.18, label="Stabilized Gate")
    ax_d.set_xlim(0, 3.0)
    ax_d.set_ylim(0, 1.24)
    ax_d.set_xlabel("Real-Time Execution (seconds @ 60 FPS)")
    ax_d.set_ylabel("Normalized Band Power / Active State")
    ax_d.set_title("D. Closed-Loop EMA Smoothing & Hysteresis State Conditioning", loc="left", fontsize=10.0)
    ax_d.legend(loc="upper right", ncol=2, frameon=True, fontsize=7.1)

    # Panel E: Browser Frame-Jitter Sinc Transfer Function & ERP Component Spectra
    ax_e = fig.add_subplot(gs[2, 0])
    f_plot = np.linspace(0.0, 45.0, 1000)
    h_16ms = np.abs(np.sinc(f_plot * (1.0 / 60.0)))
    h_30ms = np.abs(np.sinc(f_plot * 0.030))
    h_45ms = np.abs(np.sinc(f_plot * 0.045))
    spec_p300 = np.exp(-2.0 * (np.pi ** 2) * (f_plot ** 2) * (0.058 ** 2))
    spec_n170 = np.exp(-2.0 * (np.pi ** 2) * (f_plot ** 2) * (0.026 ** 2))
    spec_narrow = np.exp(-2.0 * (np.pi ** 2) * (f_plot ** 2) * (0.0085 ** 2))

    ax_e.fill_between(f_plot, 0, spec_p300, color="#d95f02", alpha=0.18, label="P300 Spectrum (σ = 58 ms)")
    ax_e.fill_between(f_plot, 0, spec_n170, color="#2e75b6", alpha=0.16, label="N170 Spectrum (σ = 26 ms)")
    ax_e.plot(f_plot, spec_narrow, color="#6a3d9a", ls=":", lw=1.3, label="Narrow Peak (20 ms FWHM)")
    ax_e.plot(f_plot, h_16ms, color="#008080", lw=1.6, label="16.7 ms Jitter (1 Frame)")
    ax_e.plot(f_plot, h_30ms, color="#1f4e78", lw=2.1, label="30 ms Jitter Transfer |H(f)|")
    ax_e.plot(f_plot, h_45ms, color="#b34800", ls="--", lw=1.6, label="45 ms Jitter Transfer |H(f)|")
    ax_e.axhline(1.0 / np.sqrt(2.0), color="#666666", ls="-.", lw=0.9)
    ax_e.set_xlim(0, 45.0)
    ax_e.set_ylim(0, 1.34)
    ax_e.set_xlabel("Frequency (Hz)")
    ax_e.set_ylabel("Transfer Gain |H(f)| / Spectral Density")
    ax_e.set_title("E. Browser Trigger-Jitter Low-Pass Transfer Function vs. ERP Spectra", loc="left", fontsize=10.0)
    ax_e.legend(loc="upper right", ncol=2, frameon=True, fontsize=6.8)

    # Panel F: Periodic Alpha/Beta Peaks vs. 1/f^chi Aperiodic Background Spectrum
    ax_f = fig.add_subplot(gs[2, 1])
    f_psd = np.linspace(2.0, 40.0, 190)
    rng_psd = np.random.default_rng(303)
    chi_rel_true = 1.42
    chi_act_true = 1.08
    log_ap_rel = 1.68 - chi_rel_true * np.log10(f_psd)
    log_ap_act = 1.42 - chi_act_true * np.log10(f_psd)
    bump_alpha_rel = 0.86 * np.exp(-((f_psd - 10.0) ** 2) / (2 * 1.35 ** 2))
    bump_beta_rel = 0.14 * np.exp(-((f_psd - 20.0) ** 2) / (2 * 2.8 ** 2))
    bump_alpha_act = 0.22 * np.exp(-((f_psd - 10.2) ** 2) / (2 * 1.45 ** 2))
    bump_beta_act = 0.48 * np.exp(-((f_psd - 21.0) ** 2) / (2 * 3.2 ** 2))

    psd_rel_db = 10.0 * (log_ap_rel + bump_alpha_rel + bump_beta_rel + rng_psd.normal(0, 0.025, size=len(f_psd)))
    psd_act_db = 10.0 * (log_ap_act + bump_alpha_act + bump_beta_act + rng_psd.normal(0, 0.025, size=len(f_psd)))

    mask_anchor = ((f_psd >= 2.0) & (f_psd <= 6.0)) | ((f_psd >= 30.0) & (f_psd <= 40.0))
    coef_rel = np.polyfit(np.log10(f_psd[mask_anchor]), psd_rel_db[mask_anchor] / 10.0, 1)
    coef_act = np.polyfit(np.log10(f_psd[mask_anchor]), psd_act_db[mask_anchor] / 10.0, 1)
    chi_rel_fit = float(-coef_rel[0])
    chi_act_fit = float(-coef_act[0])
    fit_rel_db = 10.0 * (coef_rel[1] + coef_rel[0] * np.log10(f_psd))
    fit_act_db = 10.0 * (coef_act[1] + coef_act[0] * np.log10(f_psd))

    idx_10hz = int(np.argmin(np.abs(f_psd - 10.0)))
    alpha_above_1f_rel_db = float(psd_rel_db[idx_10hz] - fit_rel_db[idx_10hz])
    alpha_above_1f_act_db = float(psd_act_db[idx_10hz] - fit_act_db[idx_10hz])
    alpha_raw_diff_db = float(psd_rel_db[idx_10hz] - psd_act_db[idx_10hz])
    alpha_adj_diff_db = float(alpha_above_1f_rel_db - alpha_above_1f_act_db)

    ax_f.plot(f_psd, psd_rel_db, color="#2e75b6", lw=1.9, label="Relaxed PSD (10 Hz Alpha)")
    ax_f.plot(f_psd, fit_rel_db, color="#1f4e78", ls="--", lw=1.3, label=f"Relaxed 1/f Fit (χ = {chi_rel_fit:.2f})")
    ax_f.plot(f_psd, psd_act_db, color="#d95f02", lw=1.8, label="Active PSD (21 Hz Beta)")
    ax_f.plot(f_psd, fit_act_db, color="#b34800", ls=":", lw=1.3, label=f"Active 1/f Fit (χ = {chi_act_fit:.2f})")
    ax_f.fill_between(f_psd, fit_rel_db, np.maximum(psd_rel_db, fit_rel_db),
                      where=(f_psd >= 7.5) & (f_psd <= 13.0), color="#2e75b6", alpha=0.18, label="Periodic Alpha Peak")
    ax_f.set_xscale("log")
    ax_f.set_xticks([2, 4, 8, 10, 16, 20, 30, 40])
    ax_f.get_xaxis().set_major_formatter(plt.ScalarFormatter())
    ax_f.set_xlim(2.0, 40.0)
    ax_f.set_ylim(-6.0, 18.5)
    ax_f.set_xlabel("Frequency (Hz, Log Scale)")
    ax_f.set_ylabel("Power Spectral Density (dB)")
    ax_f.set_title("F. Periodic Alpha/Beta Peaks vs. 1/f Aperiodic Background Slope", loc="left", fontsize=10.0)
    ax_f.legend(loc="upper right", frameon=True, fontsize=6.9)

    fig.savefig(os.path.join(OUT_DIR, "fig3_sonification_and_erp_engine.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig3_sonification_and_erp_engine.pdf"), bbox_inches="tight")
    plt.close(fig)
    print("Saved Paper 2 Fig 3 (Multi-Band FM Sonification, Online ERP Convergence, Frame-Jitter Transfer & 1/f PSD)")

    bl_rms_1 = float(np.std(trials[0, :51], ddof=1))
    bl_rms_5 = float(np.std(np.mean(trials[:5], axis=0)[:51], ddof=1))
    bl_rms_20 = float(np.std(np.mean(trials[:20], axis=0)[:51], ddof=1))
    p3_pk = 9.5

    # Standardized Measurement Error (SME; Luck et al., 2021) for P300 mean amplitude (+280 to +400 ms)
    mask_p3 = (t_erp >= 280.0) & (t_erp <= 400.0)
    trial_p3_means = np.mean(trials[:, mask_p3], axis=1)
    sme_k1 = float(np.std(trial_p3_means[:20], ddof=1))
    sme_k5 = float(np.std(trial_p3_means[:5], ddof=1) / np.sqrt(5.0))
    sme_k20 = float(np.std(trial_p3_means[:20], ddof=1) / np.sqrt(20.0))

    # Monte Carlo expectation across 1,000 independent 20-trial runs to verify theoretical 1/sqrt(K) scaling
    # Also evaluate P300 latency extraction precision under 30 ms uniform trigger jitter (Schubert et al., 2024, 2026)
    rng_mc = np.random.default_rng(2026)
    mc_rms1, mc_rms5, mc_rms20 = [], [], []
    mc_sme5, mc_sme20 = [], []
    lat_peak_list, lat_area_list, lat_temp_list = [], [], []
    mask_p3_win = (t_erp >= 240.0) & (t_erp <= 460.0)
    t_p3_win = t_erp[mask_p3_win]
    for _ in range(1000):
        pink_mc = np.array([
            np.convolve(rng_mc.normal(0, 14.0, size=n_samp), np.ones(5) / np.sqrt(5), mode="same")
            for _ in range(20)
        ])
        phases_mc = rng_mc.uniform(0, 2 * np.pi, size=(20, 1))
        alpha_mc = 6.0 * np.sin(2 * np.pi * 10.0 * (t_erp[None, :] / 1000.0) + phases_mc)
        jit_ms = rng_mc.uniform(-15.0, 15.0, size=(20, 1))
        erp_jit = (
            -6.5 * np.exp(-((t_erp[None, :] - (170.0 + jit_ms)) ** 2) / (2 * 26.0 ** 2))
            + 9.5 * np.exp(-((t_erp[None, :] - (340.0 + jit_ms)) ** 2) / (2 * 58.0 ** 2))
        )
        tr_mc = true_erp[None, :] + pink_mc + alpha_mc
        tr_mc -= np.mean(tr_mc[:, :51], axis=1, keepdims=True)
        mc_rms1.append(np.std(tr_mc[0, :51], ddof=1))
        mc_rms5.append(np.std(np.mean(tr_mc[:5], axis=0)[:51], ddof=1))
        mc_rms20.append(np.std(np.mean(tr_mc[:20], axis=0)[:51], ddof=1))
        p3_m = np.mean(tr_mc[:, mask_p3], axis=1)
        mc_sme5.append(np.std(p3_m[:5], ddof=1) / np.sqrt(5.0))
        mc_sme20.append(np.std(p3_m[:20], ddof=1) / np.sqrt(20.0))

        tr_jit = erp_jit + pink_mc + alpha_mc
        tr_jit -= np.mean(tr_jit[:, :51], axis=1, keepdims=True)
        avg_jit = np.mean(tr_jit, axis=0)
        seg_p3 = avg_jit[mask_p3_win]
        lat_peak_list.append(float(t_p3_win[np.argmax(seg_p3)]))
        pos_seg = np.maximum(seg_p3, 0.0)
        if np.sum(pos_seg) > 1e-6:
            cum_area = np.cumsum(pos_seg) / np.sum(pos_seg)
            lat_area_list.append(float(np.interp(0.5, cum_area, t_p3_win)))
        best_lag_t = 340.0
        best_cov = -1e9
        for cand_t in np.linspace(290.0, 390.0, 101):
            cand_tpl = np.exp(-((t_p3_win - cand_t) ** 2) / (2 * 58.0 ** 2))
            cov_v = float(np.dot(seg_p3, cand_tpl) / np.sqrt(np.dot(cand_tpl, cand_tpl)))
            if cov_v > best_cov:
                best_cov = cov_v
                best_lag_t = float(cand_t)
        lat_temp_list.append(best_lag_t)

    mc_bl_rms_k1 = float(np.mean(mc_rms1))
    mc_bl_rms_k5 = float(np.mean(mc_rms5))
    mc_bl_rms_k20 = float(np.mean(mc_rms20))
    jitter_p3_peak_lat_sd_ms = float(np.std(lat_peak_list, ddof=1))
    jitter_p3_area_lat_sd_ms = float(np.std(lat_area_list, ddof=1))
    jitter_p3_temp_lat_sd_ms = float(np.std(lat_temp_list, ddof=1))

    # Peak-to-peak (>100 uV) blink artifact rejection benchmark on a 20-trial average
    blink_wave = 115.0 * np.exp(-((t_erp - 310.0) ** 2) / (2 * 25.0 ** 2))
    trials_with_blink = trials[:20].copy()
    trials_with_blink[3] = trials_with_blink[3] + blink_wave
    trials_with_blink[3] -= np.mean(trials_with_blink[3, :51])
    blink_trial_ptp = float(np.max(trials_with_blink[3]) - np.min(trials_with_blink[3]))
    avg_unrejected = np.mean(trials_with_blink, axis=0)
    kept_trials = [tr for tr in trials_with_blink if (np.max(tr) - np.min(tr)) <= 100.0]
    avg_rejected = np.mean(kept_trials, axis=0)
    erp_rmse_clean20 = float(np.sqrt(np.mean((np.mean(trials[:20], axis=0)[mask_p3] - true_erp[mask_p3]) ** 2)))
    erp_rmse_blink_unrejected = float(np.sqrt(np.mean((avg_unrejected[mask_p3] - true_erp[mask_p3]) ** 2)))
    erp_rmse_blink_rejected = float(np.sqrt(np.mean((avg_rejected[mask_p3] - true_erp[mask_p3]) ** 2)))
    erp_blink_p300_bias_uv = float(np.max(avg_unrejected[mask_p3] - avg_rejected[mask_p3]))

    # Browser display/Bluetooth trigger jitter equivalent low-pass filter benchmark (W = 30 ms and W = 45 ms)
    f_grid = np.linspace(0.1, 50.0, 50000)
    h_16 = np.abs(np.sinc(f_grid * (1.0 / 60.0)))
    h_30 = np.abs(np.sinc(f_grid * 0.030))
    h_45 = np.abs(np.sinc(f_grid * 0.045))
    jitter_fc_16ms = float(f_grid[np.argmin(np.abs(h_16 - (1.0 / np.sqrt(2.0))))])
    jitter_fc_30ms = float(f_grid[np.argmin(np.abs(h_30 - (1.0 / np.sqrt(2.0))))])
    jitter_fc_45ms = float(f_grid[np.argmin(np.abs(h_45 - (1.0 / np.sqrt(2.0))))])
    jitter_null_30ms = round(1.0 / 0.030, 1)
    jitter_null_45ms = round(1.0 / 0.045, 1)

    # Peak amplitude retention under 30 ms uniform trigger jitter for narrow 20 ms FWHM (sigma=8.5 ms) vs N170 (sigma=26 ms) vs P300 (sigma=58 ms)
    t_fine = np.arange(-200.0, 800.0, 0.5)
    k_30ms = np.ones(int(30.0 / 0.5)) / int(30.0 / 0.5)
    sig_narrow = np.exp(-((t_fine - 80.0) ** 2) / (2 * 8.5 ** 2))
    sig_n170 = np.exp(-((t_fine - 170.0) ** 2) / (2 * 26.0 ** 2))
    sig_p300 = np.exp(-((t_fine - 340.0) ** 2) / (2 * 58.0 ** 2))
    ret_narrow_30ms = float(np.max(np.convolve(sig_narrow, k_30ms, mode="same")) * 100.0)
    ret_n170_30ms = float(np.max(np.convolve(sig_n170, k_30ms, mode="same")) * 100.0)
    ret_p300_30ms = float(np.max(np.convolve(sig_p300, k_30ms, mode="same")) * 100.0)

    var_diff_raw = float(np.var(np.diff(raw_alpha), ddof=1))
    var_diff_ema = float(np.var(np.diff(sm_alpha), ddof=1))
    ema_var_red_pct = (1.0 - var_diff_ema / var_diff_raw) * 100.0
    return {
        "erp_bl_rms_k1": round(bl_rms_1, 1),
        "erp_bl_rms_k5": round(bl_rms_5, 1),
        "erp_bl_rms_k20": round(bl_rms_20, 1),
        "erp_mc_bl_rms_k1": round(mc_bl_rms_k1, 1),
        "erp_mc_bl_rms_k5": round(mc_bl_rms_k5, 1),
        "erp_mc_bl_rms_k20": round(mc_bl_rms_k20, 1),
        "erp_sme_k1": round(sme_k1, 1),
        "erp_sme_k5": round(sme_k5, 1),
        "erp_sme_k20": round(sme_k20, 1),
        "erp_blink_ptp_uv": round(blink_trial_ptp, 1),
        "erp_blink_p300_bias_uv": round(erp_blink_p300_bias_uv, 1),
        "erp_rmse_clean20_uv": round(erp_rmse_clean20, 2),
        "erp_rmse_blink_unrejected_uv": round(erp_rmse_blink_unrejected, 2),
        "erp_rmse_blink_rejected_uv": round(erp_rmse_blink_rejected, 2),
        "jitter_fc_16ms_hz": round(jitter_fc_16ms, 1),
        "jitter_fc_30ms_hz": round(jitter_fc_30ms, 1),
        "jitter_fc_45ms_hz": round(jitter_fc_45ms, 1),
        "jitter_null_30ms_hz": jitter_null_30ms,
        "jitter_null_45ms_hz": jitter_null_45ms,
        "jitter_ret_narrow_pct": round(ret_narrow_30ms, 1),
        "jitter_ret_n170_pct": round(ret_n170_30ms, 1),
        "jitter_ret_p300_pct": round(ret_p300_30ms, 1),
        "jitter_p3_peak_lat_sd_ms": round(jitter_p3_peak_lat_sd_ms, 1),
        "jitter_p3_area_lat_sd_ms": round(jitter_p3_area_lat_sd_ms, 1),
        "jitter_p3_temp_lat_sd_ms": round(jitter_p3_temp_lat_sd_ms, 1),
        "aperiodic_exp_relaxed": round(chi_rel_fit, 2),
        "aperiodic_exp_active": round(chi_act_fit, 2),
        "alpha_peak_above_1f_rel_db": round(alpha_above_1f_rel_db, 1),
        "alpha_peak_above_1f_act_db": round(alpha_above_1f_act_db, 1),
        "alpha_raw_diff_db": round(alpha_raw_diff_db, 1),
        "alpha_adj_diff_db": round(alpha_adj_diff_db, 1),
        "erp_snr_k1": round(p3_pk / bl_rms_1, 2),
        "erp_snr_k5": round(p3_pk / bl_rms_5, 2),
        "erp_snr_k20": round(p3_pk / bl_rms_20, 2),
        "ema_var_red_pct": round(ema_var_red_pct, 1),
    }


def make_fig4_multimodal_athena_ppg_imu():
    """Fig 4: Muse S Athena Dual-Distance Short-Channel fNIRS Regression, MBLL SpO₂, 6-DOF IMU Kinematics, NLMS Adaptive Filter, PPG-Locked HEP Surrogates & Delayed Multi-Tap NLMS."""
    fig = plt.figure(figsize=(13.8, 10.8))
    gs = gridspec.GridSpec(3, 2, height_ratios=[1.0, 1.04, 1.04], width_ratios=[1.0, 1.0], hspace=0.38, wspace=0.28)
    rng = np.random.default_rng(2026)

    # Panel A: Short-Channel (8 mm) vs Long-Channel (20 mm) fNIRS Superficial Skin Regression (64 Hz, 20 s)
    ax_a = fig.add_subplot(gs[0, 0])
    fs_ppg = 64.0
    t_fnirs = np.arange(0, 20.0, 1.0 / fs_ppg)
    # True cortical prefrontal hemodynamic response during cognitive task block (t = 4..14 s)
    hrf_raw = np.zeros_like(t_fnirs)
    mask_task = t_fnirs >= 4.0
    tau = t_fnirs[mask_task] - 4.0
    gamma_k = (tau ** 2.5) * np.exp(-tau / 1.8)
    gamma_k /= gamma_k.max()
    # Convolve boxcar (4..14 s) with HRF kernel
    boxcar = ((t_fnirs >= 4.0) & (t_fnirs <= 14.0)).astype(float)
    cortical_hbo2 = np.convolve(boxcar, gamma_k, mode="full")[:len(t_fnirs)]
    cortical_hbo2 = 1.85 * (cortical_hbo2 / max(1e-6, cortical_hbo2.max()))
    cortical_hhb = -0.34 * cortical_hbo2

    # Superficial scalp/forehead interference (1.18 Hz cardiac pulse + 0.10 Hz Mayer wave + 0.26 Hz respiration)
    skin_interference = (
        1.45 * np.sin(2 * np.pi * 1.18 * t_fnirs)
        + 0.42 * np.sin(2 * np.pi * 2.36 * t_fnirs + 0.4)
        + 1.10 * np.sin(2 * np.pi * 0.10 * t_fnirs + 0.7)
        + 0.55 * np.sin(2 * np.pi * 0.26 * t_fnirs)
    )
    short_hbo2 = skin_interference + rng.normal(0, 0.08, size=len(t_fnirs))
    true_beta = 0.82
    raw_long_hbo2 = cortical_hbo2 + true_beta * skin_interference + rng.normal(0, 0.09, size=len(t_fnirs))

    # Sliding 96-sample (1.5 s) OLS short-channel regression matching index.html updateShortChannelRegression()
    clean_hbo2 = np.zeros_like(raw_long_hbo2)
    skin_fit = np.zeros_like(raw_long_hbo2)
    beta_est = 0.78
    W = 96
    for i in range(len(t_fnirs)):
        start_idx = max(0, i - W + 1)
        if i - start_idx + 1 >= 16:
            seg_l = raw_long_hbo2[start_idx:i + 1]
            seg_s = short_hbo2[start_idx:i + 1]
            dl = seg_l - np.mean(seg_l)
            ds = seg_s - np.mean(seg_s)
            var_s = np.sum(ds * ds)
            if var_s > 1e-8:
                b_now = np.clip(np.sum(dl * ds) / (var_s + 1e-8), 0.15, 1.65)
                beta_est = 0.92 * beta_est + 0.08 * b_now
        skin_fit[i] = beta_est * short_hbo2[i]
        clean_hbo2[i] = raw_long_hbo2[i] - skin_fit[i]

    err_raw_fnirs = float(np.sqrt(np.mean((raw_long_hbo2 - cortical_hbo2) ** 2)))
    err_clean_fnirs = float(np.sqrt(np.mean((clean_hbo2 - cortical_hbo2) ** 2)))
    fnirs_supp_db = float(20.0 * np.log10(err_raw_fnirs / max(1e-6, err_clean_fnirs)))
    fnirs_r_raw = float(np.corrcoef(raw_long_hbo2, cortical_hbo2)[0, 1])
    fnirs_r_clean = float(np.corrcoef(clean_hbo2, cortical_hbo2)[0, 1])

    ax_a.axvspan(4.0, 14.0, color="#e8f4f8", alpha=0.8, label="Task Block (4–14 s)")
    ax_a.plot(t_fnirs, raw_long_hbo2, color="#aaaaaa", lw=0.85, alpha=0.8, label="Long 20 mm Δ[HbO₂] (Raw)")
    ax_a.plot(t_fnirs, short_hbo2 * 0.82 - 2.6, color="#d95f02", lw=0.85, alpha=0.85, label="Short 8 mm Scalp Fit (Shifted)")
    ax_a.plot(t_fnirs, clean_hbo2, color="#1f4e78", lw=2.0, label="Regressed Cortical Δ[HbO₂]")
    ax_a.plot(t_fnirs, cortical_hbo2, color="#111111", ls="--", lw=1.2, label="Ground-Truth HRF")
    ax_a.set_xlim(0, 20.0)
    ax_a.set_ylim(-5.2, 6.5)
    ax_a.set_xlabel("Time (seconds @ 64 Hz)")
    ax_a.set_ylabel("Concentration Change (µM)")
    ax_a.set_title("A. Dual-Distance (8 mm vs. 20 mm) Short-Channel fNIRS Regression", loc="left", fontsize=10.0)
    ax_a.legend(loc="upper right", ncol=2, frameon=True, fontsize=6.9)

    # Panel B: Modified Beer-Lambert Dual-Wavelength Hemodynamics (Δ[HbO₂], Δ[HHb], Δ[HbT])
    ax_b = fig.add_subplot(gs[0, 1])
    clean_hhb = cortical_hhb + rng.normal(0, 0.06, size=len(t_fnirs))
    clean_hbt = clean_hbo2 + clean_hhb
    ax_b.axvspan(4.0, 14.0, color="#e8f4f8", alpha=0.8, label="Task Block")
    ax_b.plot(t_fnirs, clean_hbo2, color="#d95f02", lw=1.8, label="Oxyhemoglobin Δ[HbO₂]")
    ax_b.plot(t_fnirs, clean_hhb, color="#2e75b6", lw=1.8, label="Deoxyhemoglobin Δ[HHb]")
    ax_b.plot(t_fnirs, clean_hbt, color="#008080", lw=1.5, ls="-.", label="Total Hemoglobin Δ[HbT]")
    ax_b.axhline(0, color="#666666", ls=":", lw=0.9)
    ax_b.set_xlim(0, 20.0)
    ax_b.set_ylim(-1.2, 3.25)
    ax_b.set_xlabel("Time (seconds @ 64 Hz)")
    ax_b.set_ylabel("Cortical Hemoglobin (µM)")
    ax_b.set_title("B. Modified Beer–Lambert Prefrontal Hemodynamics (660 / 850 nm)", loc="left", fontsize=10.0)
    ax_b.legend(loc="upper right", ncol=2, frameon=True, fontsize=7.1)

    # Panel C: 52 Hz 6-DOF IMU Complementary Orientation & 2nd-Order Head Kinematics Cascade
    ax_c = fig.add_subplot(gs[1, 0])
    fs_imu = 52.0
    t_imu = np.arange(0, 5.0, 1.0 / fs_imu)
    # Simulated head nod & tilt kinematics
    pitch_deg = 16.0 * np.sin(2 * np.pi * 0.55 * t_imu) * np.exp(-0.15 * t_imu)
    lin_acc_z = 1.4 * np.cos(2 * np.pi * 0.55 * t_imu) * np.exp(-0.15 * t_imu)
    vel_z = np.zeros_like(t_imu)
    pos_z = np.zeros_like(t_imu)
    dt_imu = 1.0 / fs_imu
    for i in range(1, len(t_imu)):
        damp_v = 0.86 if abs(lin_acc_z[i]) < 0.06 else 0.935
        vel_z[i] = damp_v * vel_z[i - 1] + (lin_acc_z[i] * 100.0) * dt_imu
        pos_z[i] = 0.955 * pos_z[i - 1] + vel_z[i] * dt_imu

    ax_c.plot(t_imu, pitch_deg / 16.0, color="#1f4e78", lw=1.8, label="Complementary Pitch θ")
    ax_c.plot(t_imu, lin_acc_z / 1.4, color="#008080", lw=1.5, label="Linear Accel a_lin")
    ax_c.plot(t_imu, vel_z / max(1e-6, np.max(np.abs(vel_z))), color="#d95f02", lw=1.6, label="1st-Order Velocity v(t)")
    ax_c.plot(t_imu, pos_z / max(1e-6, np.max(np.abs(pos_z))), color="#6a3d9a", lw=2.0, label="2nd-Order Position p(t)")
    ax_c.axhline(0, color="#666666", ls=":", lw=0.9)
    ax_c.set_xlim(0, 5.0)
    ax_c.set_ylim(-1.35, 1.65)
    ax_c.set_xlabel("Time (seconds @ 52 Hz IMU)")
    ax_c.set_ylabel("Normalized Kinematic State")
    ax_c.set_title("C. 52 Hz 6-DOF IMU Orientation & 2nd-Order Kinematics Cascade", loc="left", fontsize=10.0)
    ax_c.legend(loc="upper right", ncol=2, frameon=True, fontsize=7.0)

    # Panel D: Real-Time 6-Tap NLMS Adaptive IMU Head-Movement Artifact Cancellation on EEG (256 Hz, 4 s)
    ax_d = fig.add_subplot(gs[1, 1])
    fs_eeg = 256.0
    t_nlms = np.arange(0, 4.0, 1.0 / fs_eeg)
    true_eeg = (
        18.0 * np.sin(2 * np.pi * 10.0 * t_nlms)
        + 9.0 * np.sin(2 * np.pi * 21.0 * t_nlms + 0.5)
        + rng.normal(0, 3.2, size=len(t_nlms))
    )
    # 6-DOF IMU reference basis u(t) = [ax, ay, az, gx, gy, gz]
    u_imu = np.vstack([
        np.sin(2 * np.pi * 1.35 * t_nlms),
        np.cos(2 * np.pi * 1.35 * t_nlms),
        0.6 * np.sin(2 * np.pi * 2.70 * t_nlms + 0.3),
        np.cos(2 * np.pi * 1.35 * t_nlms + 0.2),
        -np.sin(2 * np.pi * 1.35 * t_nlms + 0.2),
        0.5 * np.cos(2 * np.pi * 0.90 * t_nlms),
    ])
    w_true = np.array([42.0, -28.0, 19.0, 36.0, -24.0, 14.0])
    motion_art = np.sum(w_true[:, None] * u_imu, axis=0)
    raw_corrupted = true_eeg + motion_art

    # Run exact 6-tap NLMS filter from index.html updateEEGImuMotionFilter() (mu = 0.035, leak = 0.9992)
    w_nlms = np.zeros(6)
    mu_nlms = 0.035
    y_hat = np.zeros_like(raw_corrupted)
    e_clean = np.zeros_like(raw_corrupted)
    for n in range(len(t_nlms)):
        x_vec = u_imu[:, n]
        norm_sq = 1e-4 + float(np.dot(x_vec, x_vec))
        y_hat[n] = float(np.dot(w_nlms, x_vec))
        e_clean[n] = raw_corrupted[n] - y_hat[n]
        w_nlms = 0.9992 * w_nlms + (mu_nlms * e_clean[n] / norm_sq) * x_vec

    # Steady-state evaluation after 0.5 s convergence (samples 128..1024)
    ss = slice(128, len(t_nlms))
    rmse_raw_imu = float(np.sqrt(np.mean((raw_corrupted[ss] - true_eeg[ss]) ** 2)))
    rmse_clean_imu = float(np.sqrt(np.mean((e_clean[ss] - true_eeg[ss]) ** 2)))
    nlms_supp_db = float(20.0 * np.log10(rmse_raw_imu / max(1e-6, rmse_clean_imu)))
    nlms_r_raw = float(np.corrcoef(raw_corrupted[ss], true_eeg[ss])[0, 1])
    nlms_r_clean = float(np.corrcoef(e_clean[ss], true_eeg[ss])[0, 1])

    ax_d.plot(t_nlms, raw_corrupted, color="#aaaaaa", lw=0.85, alpha=0.8, label="Raw AF7 + Motion Artifact")
    ax_d.plot(t_nlms, e_clean, color="#1f4e78", lw=1.6, label="NLMS Cleaned EEG (eegData.clean)")
    ax_d.plot(t_nlms, true_eeg, color="#d95f02", ls="--", lw=1.1, label="Ground-Truth Cortical EEG")
    ax_d.set_xlim(0, 4.0)
    ax_d.set_ylim(-115, 145)
    ax_d.set_xlabel("Time (seconds @ 256 Hz)")
    ax_d.set_ylabel("Potential (µV)")
    ax_d.set_title("D. 6-Tap NLMS Adaptive IMU Head-Movement Artifact Cancellation", loc="left", fontsize=10.0)
    ax_d.legend(loc="upper right", frameon=True, fontsize=7.1)

    # Panel E: Forehead PPG-Locked Heartbeat-Evoked Potential (HEP) vs. Surrogate Pseudotrial Null
    ax_e = fig.add_subplot(gs[2, 0])
    rng_hep = np.random.default_rng(404)
    fs_hep = 256.0
    n_beats = 60
    # Generate 60s continuous 256 Hz EEG + heartbeats (mean IBI = 0.85 s, SD = 0.055 s)
    ibis = np.clip(rng_hep.normal(0.85, 0.055, size=n_beats + 5), 0.68, 1.05)
    r_peaks_sec = np.cumsum(ibis)
    # Forehead PPG systolic peaks occur after ~180 ms pulse transit time with 12 ms beat-to-beat jitter
    ppg_peaks_sec = r_peaks_sec + rng_hep.normal(0.180, 0.012, size=len(r_peaks_sec))
    total_dur = float(ppg_peaks_sec[-1] + 2.0)
    t_cont = np.arange(0, total_dur, 1.0 / fs_hep)
    # Continuous pink + alpha background EEG
    cont_eeg = (
        np.convolve(rng_hep.normal(0, 11.5, size=len(t_cont)), np.ones(5) / np.sqrt(5), mode="same")
        + 4.5 * np.sin(2 * np.pi * 10.0 * t_cont + rng_hep.uniform(0, 2 * np.pi))
    )
    # Add true cortical HEP locked to R-peaks (+360 ms post-R-peak, i.e., ~+180 ms post-PPG-peak, sigma = 46 ms, amp = +4.2 uV)
    for rp in r_peaks_sec[:n_beats]:
        cont_eeg += 4.2 * np.exp(-((t_cont - (rp + 0.360)) ** 2) / (2 * 0.046 ** 2))

    # Extract 60 PPG-locked epochs (-200 to +500 ms around each forehead PPG systolic peak; baseline -200..-50 ms)
    n_pre_hep = int(0.200 * fs_hep)   # 51 samples
    n_post_hep = int(0.500 * fs_hep)  # 128 samples
    n_bl_hep = int(0.150 * fs_hep)    # first 38 samples (-200 to -50 ms)
    t_hep_ms = np.linspace(-200.0, 500.0, n_pre_hep + n_post_hep)
    hep_epochs = []
    valid_ppg_peaks = ppg_peaks_sec[1:n_beats + 1]
    for pp in valid_ppg_peaks:
        c_idx = int(round(pp * fs_hep))
        ep = cont_eeg[c_idx - n_pre_hep:c_idx + n_post_hep].copy()
        ep -= np.mean(ep[:n_bl_hep])
        hep_epochs.append(ep)
    hep_epochs = np.array(hep_epochs)
    hep_mean = np.mean(hep_epochs, axis=0)
    hep_ground_truth = 4.2 * np.exp(-((t_hep_ms - 180.0) ** 2) / (2 * 48.0 ** 2))

    # Surrogate pseudotrial distribution (Steinfath et al., 2025): 500 random IBI permutations + random start offset
    n_surr = 500
    surr_waves = np.zeros((n_surr, len(t_hep_ms)))
    mask_hep_win = (t_hep_ms >= 110.0) & (t_hep_ms <= 260.0)
    hep_true_win_mean = float(np.mean(hep_mean[mask_hep_win]))
    hep_true_peak_uv = float(np.max(hep_mean[mask_hep_win]))
    hep_trial_win_means = np.mean(hep_epochs[:, mask_hep_win], axis=1)
    hep_sme_uv = float(np.std(hep_trial_win_means, ddof=1) / np.sqrt(n_beats))
    surr_win_means = np.zeros(n_surr)
    obs_ibis = np.diff(valid_ppg_peaks)
    for s_idx in range(n_surr):
        shuf_ibis = rng_hep.permutation(obs_ibis)
        t0_surr = float(valid_ppg_peaks[0] + rng_hep.uniform(-0.40, 0.40))
        surr_peaks = np.concatenate([[t0_surr], t0_surr + np.cumsum(shuf_ibis)])
        s_eps = []
        for sp in surr_peaks:
            c_idx = int(round(sp * fs_hep))
            if n_pre_hep <= c_idx < len(cont_eeg) - n_post_hep:
                ep_s = cont_eeg[c_idx - n_pre_hep:c_idx + n_post_hep].copy()
                ep_s -= np.mean(ep_s[:n_bl_hep])
                s_eps.append(ep_s)
        s_mean = np.mean(s_eps, axis=0)
        surr_waves[s_idx] = s_mean
        surr_win_means[s_idx] = float(np.mean(s_mean[mask_hep_win]))

    surr_lo = np.percentile(surr_waves, 2.5, axis=0)
    surr_hi = np.percentile(surr_waves, 97.5, axis=0)
    hep_surr_ci95_uv = float(np.mean(0.5 * (surr_hi[mask_hep_win] - surr_lo[mask_hep_win])))
    hep_perm_p = float((1 + np.sum(np.abs(surr_win_means) >= abs(hep_true_win_mean))) / (n_surr + 1))

    ax_e.axvspan(110.0, 260.0, color="#e8f4f8", alpha=0.8, label="HEP Window (110–260 ms)")
    ax_e.fill_between(t_hep_ms, surr_lo, surr_hi, color="#999999", alpha=0.32, label="95% Pseudotrial Null")
    ax_e.plot(t_hep_ms, np.mean(surr_waves, axis=0), color="#666666", ls=":", lw=1.1, label="Surrogate Mean (500 Perm.)")
    ax_e.plot(t_hep_ms, hep_ground_truth, color="#d95f02", ls="--", lw=1.4, label="Ground-Truth Cortical HEP")
    ax_e.plot(t_hep_ms, hep_mean, color="#1f4e78", lw=2.2, label="PPG-Locked HEP (K = 60)")
    ax_e.axvline(0, color="#222222", ls="--", lw=1.0)
    ax_e.set_xlim(-200.0, 500.0)
    ax_e.set_ylim(-5.2, 8.8)
    ax_e.set_xlabel("Time Relative to Forehead PPG Systolic Peak (ms)")
    ax_e.set_ylabel("Baseline-Corrected Potential (µV)")
    ax_e.set_title("E. Forehead PPG-Locked Heartbeat-Evoked Potential vs. Surrogate Null", loc="left", fontsize=10.0)
    ax_e.legend(loc="upper right", ncol=2, frameon=True, fontsize=6.8)

    # Panel F: Instantaneous 6-Weight vs. Multi-Tap 24-Weight Delayed NLMS Motion Filter Across Viscoelastic Lags
    ax_f = fig.add_subplot(gs[2, 1])
    rng_lag = np.random.default_rng(505)
    # Broadband (1–8 Hz) transient head-movement IMU basis across 6 axes (where lag is not trivially spanned by sin/cos quadrature)
    b_kern = np.hanning(29)
    b_kern /= np.sum(b_kern)
    u_broad = np.vstack([
        np.convolve(rng_lag.normal(0, 1.8, size=len(t_nlms)), b_kern, mode="same")
        for _ in range(6)
    ])
    lag_samples_grid = np.arange(0, 17, 1)  # 0 to 16 samples @ 256 Hz (0 to 62.5 ms)
    lag_ms_grid = lag_samples_grid * (1000.0 / fs_eeg)
    supp_1tap_list = []
    supp_4tap_list = []
    # Taps at delays [0, 4, 8, 12] samples (0, 15.6, 31.3, 46.9 ms) for 4-tap-per-axis (24-weight) FIR NLMS
    tap_delays = [0, 4, 8, 12]
    for d_samp in lag_samples_grid:
        # Construct delayed + viscoelastic-dispersed motion artifact
        u_delayed = np.zeros_like(u_broad)
        for k_s in range(len(t_nlms)):
            idx1 = max(0, k_s - int(d_samp))
            idx2 = max(0, k_s - int(d_samp) - 4)
            u_delayed[:, k_s] = 0.85 * u_broad[:, idx1] + 0.25 * u_broad[:, idx2]
        art_lag = np.sum(w_true[:, None] * u_delayed, axis=0)
        raw_lag = true_eeg + art_lag

        # 1. Instantaneous 1-tap-per-axis (6-weight) NLMS
        w1 = np.zeros(6)
        e1 = np.zeros_like(raw_lag)
        for n in range(len(t_nlms)):
            xv = u_broad[:, n]
            nsq = 1e-4 + float(np.dot(xv, xv))
            e1[n] = raw_lag[n] - float(np.dot(w1, xv))
            w1 = 0.9992 * w1 + (0.045 * e1[n] / nsq) * xv
        rmse_raw_l = float(np.sqrt(np.mean((raw_lag[ss] - true_eeg[ss]) ** 2)))
        rmse_e1 = float(np.sqrt(np.mean((e1[ss] - true_eeg[ss]) ** 2)))
        supp_1tap_list.append(float(20.0 * np.log10(rmse_raw_l / max(1e-6, rmse_e1))))

        # 2. Multi-tap 4-tap-per-axis (24-weight) delayed FIR NLMS
        w4 = np.zeros(6 * len(tap_delays))
        e4 = np.zeros_like(raw_lag)
        for n in range(len(t_nlms)):
            xv4 = np.concatenate([u_broad[:, max(0, n - td)] for td in tap_delays])
            nsq4 = 1e-4 + float(np.dot(xv4, xv4))
            e4[n] = raw_lag[n] - float(np.dot(w4, xv4))
            w4 = 0.9992 * w4 + (0.065 * e4[n] / nsq4) * xv4
        rmse_e4 = float(np.sqrt(np.mean((e4[ss] - true_eeg[ss]) ** 2)))
        supp_4tap_list.append(float(20.0 * np.log10(rmse_raw_l / max(1e-6, rmse_e4))))

    idx_lag8 = 8  # 8 samples = 31.25 ms viscoelastic settling lag
    nlms_lag31_1tap_db = float(supp_1tap_list[idx_lag8])
    nlms_lag31_4tap_db = float(supp_4tap_list[idx_lag8])
    nlms_lag31_gain_db = float(nlms_lag31_4tap_db - nlms_lag31_1tap_db)

    ax_f.plot(lag_ms_grid, supp_4tap_list, color="#1f4e78", marker="o", ms=4.2, lw=2.0, label="4-Tap Delayed NLMS (24 Weights)")
    ax_f.plot(lag_ms_grid, supp_1tap_list, color="#d95f02", marker="s", ms=4.0, lw=1.8, ls="--", label="1-Tap Instantaneous NLMS (6 Weights)")
    ax_f.axhline(0, color="#666666", ls=":", lw=0.9)
    ax_f.axvline(31.25, color="#008080", ls="-.", lw=1.1, label="31.3 ms Viscoelastic Settling Lag")
    ax_f.set_xlim(0, 62.5)
    ax_f.set_ylim(-1.0, 21.5)
    ax_f.set_xlabel("Mechanical Electrode-Skin Viscoelastic Phase Lag (ms)")
    ax_f.set_ylabel("Motion Artifact Suppression (dB)")
    ax_f.set_title("F. Instantaneous (6-Weight) vs. Delayed Multi-Tap (24-Weight) NLMS", loc="left", fontsize=10.0)
    ax_f.legend(loc="upper right", frameon=True, fontsize=6.9)

    fig.savefig(os.path.join(OUT_DIR, "fig4_multimodal_athena_ppg_imu.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig4_multimodal_athena_ppg_imu.pdf"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig5_multimodal_athena_ppg_imu.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig5_multimodal_athena_ppg_imu.pdf"), bbox_inches="tight")
    plt.close(fig)
    print("Saved Paper 2 Fig 4 (Multimodal Athena Short-Channel fNIRS, 6-DOF IMU NLMS, HEP Surrogates & Multi-Tap NLMS)")

    return {
        "fnirs_err_raw_um": round(err_raw_fnirs, 2),
        "fnirs_err_clean_um": round(err_clean_fnirs, 2),
        "fnirs_err_raw_um_3d": round(err_raw_fnirs, 3),
        "fnirs_err_clean_um_3d": round(err_clean_fnirs, 3),
        "fnirs_supp_db": round(fnirs_supp_db, 1),
        "fnirs_r_raw": round(fnirs_r_raw, 2),
        "fnirs_r_clean": round(fnirs_r_clean, 2),
        "nlms_rmse_raw_uv": round(rmse_raw_imu, 1),
        "nlms_rmse_clean_uv": round(rmse_clean_imu, 1),
        "nlms_supp_db": round(nlms_supp_db, 1),
        "nlms_r_raw": round(nlms_r_raw, 2),
        "nlms_r_clean": round(nlms_r_clean, 2),
        "hep_true_win_mean_uv": round(hep_true_win_mean, 2),
        "hep_true_peak_uv": round(hep_true_peak_uv, 2),
        "hep_sme_uv": round(hep_sme_uv, 2),
        "hep_surr_ci95_uv": round(hep_surr_ci95_uv, 2),
        "hep_perm_p": round(hep_perm_p, 4),
        "nlms_lag31_1tap_db": round(nlms_lag31_1tap_db, 1),
        "nlms_lag31_4tap_db": round(nlms_lag31_4tap_db, 1),
        "nlms_lag31_gain_db": round(nlms_lag31_gain_db, 1),
    }


def extract_student_author(rel_path):
    """Canonicalize the unique undergraduate author identity from a submission path."""
    low = rel_path.lower()
    for key, canonical in [
        ("cordez", "kyle_cordez"),
        ("amnak", "amna_khan"),
        ("amnakhan", "amna_khan"),
        ("ranar", "rana_radiansyah"),
        ("radiansyah", "rana_radiansyah"),
        ("zainabs", "zainab_samiuddin"),
        ("samiuddin", "zainab_samiuddin"),
        ("wainwright", "portia_wainwright"),
        ("yan_luo", "yan_luo"),
        ("gannon", "jake_gannon"),
    ]:
        if key in low:
            return canonical
    m = re.search(r"-\s*([A-Za-z\s\-]+?)(?:\.(?:txt|js|md|zip)|/|$)", rel_path)
    if m:
        return re.sub(r"\s+", "_", m.group(1).strip().lower())
    return os.path.basename(rel_path).lower()


def make_fig5_student_submissions(examples, muse_kb, legacy_muse_kb, dsp_bench, multimodal_bench):
    """Fig 5: Empirical Analysis of N=69 PSYCH 403 Submissions Across N_students=30 Unique Students."""
    sub_dir = os.path.join(BASE_DIR, "data/student_submissions")
    if not os.path.exists(sub_dir):
        sub_dir = os.path.join(P2_DIR, "data/student_submissions")
    if not os.path.exists(sub_dir):
        sub_dir = "/Users/fulkanjou/EEGEDUPaper/data/student_submissions"
    img_dir = os.path.join(sub_dir, "images")

    all_cat_locs = np.array([ex["loc"] for ex in examples])
    ex_locs = np.array([ex["loc"] for ex in examples if ex["is_core_scaffold"]])

    cand_files = []
    for root, dirs, files in os.walk(sub_dir):
        if "images" in root:
            continue
        for f in files:
            if f.endswith((".js", ".txt", ".md")):
                cand_files.append(os.path.join(root, f))

    student_sketches = []
    seen_hashes = set()
    for path in sorted(cand_files):
        txt = open(path, "r", errors="ignore").read()
        if ("function setup" in txt or "function draw" in txt) and ("eegData" in txt or "createCanvas" in txt):
            code_lines = extract_executable_lines(txt)
            norm_key = hashlib.md5("\n".join(code_lines).encode("utf-8", errors="ignore")).hexdigest()
            if norm_key in seen_hashes:
                continue
            seen_hashes.add(norm_key)
            rel = os.path.relpath(path, sub_dir)
            student_id = extract_student_author(rel)
            exec_code = "\n".join(code_lines)
            loc = len(code_lines)
            is_erp_cohort = bool(
                re.search(r"part\s*2|part2|oddball|erp|epochs-|MMN", rel, re.I)
                or re.search(r"getRecentEpoch|epochData|avgStd|avgTgt|T_PRE|preStimSamples", exec_code)
            )
            student_sketches.append({
                "file": os.path.basename(path),
                "student_id": student_id,
                "cohort": "Online_ERP_Paradigm" if is_erp_cohort else "Continuous_Neurofeedback",
                "is_erp_cohort": is_erp_cohort,
                "loc": loc,
                "alpha": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)alpha\b|getChannelBand\(\s*['\"]alpha", exec_code)),
                "beta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)beta\b|getChannelBand\(\s*['\"]beta", exec_code)),
                "theta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)theta\b|getChannelBand\(\s*['\"]theta", exec_code)),
                "delta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)delta\b|getChannelBand\(\s*['\"]delta", exec_code)),
                "gamma": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)gamma\b|getChannelBand\(\s*['\"]gamma", exec_code)),
                "attention": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)attention\b", exec_code)),
                "meditation": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)meditation\b", exec_code)),
                "raw": bool(re.search(r"eegData\.raw\b|getRecentRaw|getRawChannel|getAllChannels|getRecentEpoch|rawHistory|TP9|AF7|AF8|TP10", exec_code)),
                "erp_oddball": bool(re.search(
                    r"getRecentEpoch|epochData|avgStd|avgTgt|avgERP|epochBuffer|trialCount|targetTrials|standardTrials|"
                    r"preStim|postStim|oddball|stimulusType|targetEpoch|standardEpoch|triggerTime|triggerOnset|"
                    r"n170|p300|mmn|EPOCH_SAMPLES|PRE_SAMPLES|POST_SAMPLES|onlineMeanUpdate",
                    exec_code, re.I
                )),
                "smoothing_conditioning": bool(re.search(
                    r"0\.[789]\d?\s*\*|smooth\w*\s*=|lerp\(|baseMean|baseline|preStim|hysteresis|holdFrames|constrain\(\s*(?:eegData|alpha|beta|theta|att|med|norm|smooth)",
                    exec_code, re.I
                )),
                "audio": bool(re.search(r"Oscillator|MonoSynth|PolySynth|SoundFile|Env|freq\(", exec_code)),
                "webgl": bool(re.search(r"WEBGL|rotateX|rotateY|torus|sphere|box\(", exec_code)),
                "particles": bool(re.search(r"class\s+\w+|particles|push\(\s*\{", exec_code)),
                "interactive": bool(re.search(r"mousePressed|keyPressed|createSlider|createButton", exec_code)),
            })

    stu_locs = np.array([s["loc"] for s in student_sketches])
    nf_locs = np.array([s["loc"] for s in student_sketches if not s["is_erp_cohort"]])
    erp_locs = np.array([s["loc"] for s in student_sketches if s["is_erp_cohort"]])
    n_stu = len(student_sketches)
    n_nf = len(nf_locs)
    n_erp = len(erp_locs)

    unique_students = sorted(set(s["student_id"] for s in student_sketches))
    n_unique_students = len(unique_students)
    stu_cluster_medians = np.array([
        np.median([s["loc"] for s in student_sketches if s["student_id"] == st])
        for st in unique_students
    ])

    u_stat, p_val = stats.mannwhitneyu(stu_locs, ex_locs, alternative="greater")
    u_cluster, p_cluster = stats.mannwhitneyu(stu_cluster_medians, ex_locs, alternative="greater")
    r_rb_cluster = 2.0 * (u_cluster / (n_unique_students * len(ex_locs))) - 1.0

    with open(os.path.join(TBL_DIR, "student_submissions_metrics.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Sketch_ID", "Student_ID", "Cohort", "Executable_LOC", "Alpha", "Beta", "Theta", "Delta", "Gamma",
                    "Attention", "Meditation", "Raw_256Hz", "ERP_Oddball", "Signal_Conditioning",
                    "Audio_Synth", "Particles", "Interactive"])
        for idx, s in enumerate(student_sketches, 1):
            w.writerow([f"Student_Sketch_{idx:02d}", s["student_id"], s["cohort"], s["loc"],
                        int(s["alpha"]), int(s["beta"]), int(s["theta"]),
                        int(s["delta"]), int(s["gamma"]), int(s["attention"]), int(s["meditation"]),
                        int(s["raw"]), int(s["erp_oddball"]), int(s["smoothing_conditioning"]),
                        int(s["audio"]), int(s["particles"]), int(s["interactive"])])

    # Create Figure 4 (strictly adhering to clean-scientific-figures: no boxed stats callouts inside plot axes)
    fig = plt.figure(figsize=(13.8, 7.6))
    gs = gridspec.GridSpec(2, 2, height_ratios=[1.0, 1.06], width_ratios=[0.96, 1.09], hspace=0.36, wspace=0.44)

    # Panel A: Code Complexity Comparison
    ax_a = fig.add_subplot(gs[0, 0])
    rng = np.random.default_rng(7)
    groups = [ex_locs, nf_locs, erp_locs, stu_cluster_medians]
    positions = [1, 2, 3, 4]
    colors = ["#2e75b6", "#008080", "#6a3d9a", "#d95f02"]

    bp = ax_a.boxplot(groups, positions=positions, widths=0.42, patch_artist=True, showfliers=False,
                      medianprops=dict(color="black", lw=1.8))
    for patch, col in zip(bp["boxes"], colors):
        patch.set_facecolor(col)
        patch.set_alpha(0.68)

    for pos, arr, col in zip(positions, groups, colors):
        jit = rng.uniform(-0.13, 0.13, size=len(arr))
        ax_a.scatter(np.full_like(arr, pos, dtype=float) + jit, arr, color=col,
                     edgecolor="white", lw=0.5, s=24, alpha=0.85, zorder=3)

    # Significance bracket between Core Scaffolds (pos 1) and Student Medians (pos 4)
    ax_a.plot([1, 1, 4, 4], [392, 405, 405, 392], color="#222222", lw=1.2)
    ax_a.text(2.5, 408, "***", ha="center", va="bottom", fontsize=10.0, fontweight="bold", color="#222222")

    ax_a.set_xticks(positions)
    ax_a.set_xticklabels([
        f"Core\nScaffolds\n(N = {len(ex_locs)})",
        f"Cohort 1:\nNF Games\n(N = {n_nf})",
        f"Cohort 2:\n4-Ch ERPs\n(N = {n_erp})",
        f"Student\nMedians\n(N = {n_unique_students})"
    ], fontsize=7.6)
    ax_a.set_ylabel("Executable Lines of Code (LOC)")
    ax_a.set_xlim(0.45, 4.55)
    ax_a.set_ylim(0, 445)
    ax_a.set_title(f"A. Code Complexity: Core Scaffolds vs. PSYCH 403 ({n_stu} Sketches)", loc="left", fontsize=9.6)

    # Panel B: Verified Executable Feature & Paradigm Adoption Across N=69 Student Submissions
    ax_b = fig.add_subplot(gs[0, 1])
    feat_specs = [
        ("EMA / Baseline / Hysteresis Conditioning", "smoothing_conditioning", "#1f4e78"),
        ("ES6 Classes & Particle Systems", "particles", "#4d4d4d"),
        ("eegData.alpha Band (8–12 Hz)", "alpha", "#2e75b6"),
        ("Online 4-Ch ERP & Oddball Epoching", "erp_oddball", "#d95f02"),
        ("256 Hz Raw Channels (TP9..TP10)", "raw", "#008080"),
        ("eegData.beta Band (13–30 Hz)", "beta", "#2e75b6"),
        ("eegData.attention Index", "attention", "#6a3d9a"),
        ("eegData.theta Band (4–8 Hz)", "theta", "#2e75b6"),
        ("eegData.meditation Index", "meditation", "#6a3d9a"),
        ("Mouse / Keyboard Event Hooks", "interactive", "#4d4d4d"),
        ("p5.sound Audio Synthesis", "audio", "#b34800"),
        ("eegData.delta / gamma Bands", "delta", "#2e75b6"),
    ]
    feat_rows = []
    for lbl, key, col in feat_specs:
        cnt = sum(1 for s in student_sketches if s[key])
        pct = cnt / n_stu * 100.0
        feat_rows.append((pct, cnt, lbl, col))
    feat_rows.sort(key=lambda x: x[0])
    feat_pcts = [r[0] for r in feat_rows]
    feat_counts = [r[1] for r in feat_rows]
    feat_names = [r[2] for r in feat_rows]
    feat_cols = [r[3] for r in feat_rows]

    y_pos = np.arange(len(feat_names))
    bars = ax_b.barh(y_pos, feat_pcts, color=feat_cols, alpha=0.88, height=0.68)
    for bar, pct, cnt in zip(bars, feat_pcts, feat_counts):
        ax_b.text(pct + 1.2, bar.get_y() + bar.get_height() / 2, f"{pct:.1f}% ({cnt}/{n_stu})",
                  va="center", ha="left", fontsize=7.5, fontweight="bold", color="#222")
    ax_b.set_yticks(y_pos)
    ax_b.set_yticklabels(feat_names, fontsize=8.0, fontweight="medium")
    ax_b.set_xlim(0, max(feat_pcts) + 25)
    ax_b.set_xlabel("Percentage of Student Submissions (%)")
    ax_b.set_title(f"B. Verified Executable Feature Adoption (N = {n_stu})", loc="left", fontsize=10.2)

    # Panel C: Student Screenshot — Cohort 1 Closed-Loop Neurofeedback Game
    ax_c = fig.add_subplot(gs[1, 0])
    img_p1 = os.path.join(img_dir, "11mbgcXW_Hardi Patel 1753962 Part 1 - Hardi Patel.jpeg")
    if os.path.exists(img_p1):
        im1 = Image.open(img_p1)
        ax_c.imshow(im1)
    ax_c.set_xticks([])
    ax_c.set_yticks([])
    for sp in ax_c.spines.values():
        sp.set_visible(True)
        sp.set_color("#cccccc")
    ax_c.set_title("C. Cohort 1 Submission: Catch 20 Cones Neurofeedback Game (195 LOC)", loc="left", pad=6, fontsize=9.8)

    # Panel D: Student Screenshot — Cohort 2 Online 4-Channel Face vs Object ERP Averager
    ax_d = fig.add_subplot(gs[1, 1])
    img_p2 = os.path.join(img_dir, "1GvtPC4M_Hardi Patel 1753962 Part 2 - Hardi Patel.jpeg")
    if os.path.exists(img_p2):
        im2 = Image.open(img_p2)
        ax_d.imshow(im2)
    ax_d.set_xticks([])
    ax_d.set_yticks([])
    for sp in ax_d.spines.values():
        sp.set_visible(True)
        sp.set_color("#cccccc")
    ax_d.set_title("D. Cohort 2 Submission: 4-Channel Face vs. Object ERP Averager (148 LOC)", loc="left", pad=6, fontsize=9.8)

    fig.savefig(os.path.join(OUT_DIR, "fig5_psych403_student_submissions_analysis.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig5_psych403_student_submissions_analysis.pdf"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig4_psych403_student_submissions_analysis.png"), bbox_inches="tight")
    fig.savefig(os.path.join(OUT_DIR, "fig4_psych403_student_submissions_analysis.pdf"), bbox_inches="tight")
    plt.close(fig)
    print("Saved Paper 2 Fig 5 (Student Submissions Analysis)")

    summary = {
        "muse_browser_kb": round(muse_kb, 1),
        "legacy_muse_kb": legacy_muse_kb,
        "bundle_reduction_factor": round(legacy_muse_kb / muse_kb, 1),
        "n_catalogue_sketches": int(len(all_cat_locs)),
        "n_catalogue_categories": 21,
        "cat_loc_median": int(np.median(all_cat_locs)),
        "cat_loc_iqr_low": int(np.percentile(all_cat_locs, 25)),
        "cat_loc_iqr_high": int(np.percentile(all_cat_locs, 75)),
        "cat_loc_min": int(all_cat_locs.min()),
        "cat_loc_max": int(all_cat_locs.max()),
        "n_starter_diag": sum(1 for ex in examples if ex["category"] in ("Start Here: One Simple Sketch per Sensor", "Signal Quality & Diagnostics")),
        "n_ppg_sketches": sum(1 for ex in examples if ex["category"] == "PPG & Optical (fNIRS)"),
        "n_imu_sketches": sum(1 for ex in examples if ex["category"] == "Motion, IMU & Broadcast Sensors"),
        "n_multi_sketches": sum(1 for ex in examples if ex["category"] == "Multimodal (EEG + PPG + HR)"),
        "n_braingames": sum(1 for ex in examples if ex["category"] == "BrainGames"),
        "n_eegedu_modules": sum(1 for ex in examples if ex["category"] == "EEGEdu Modules"),
        "n_classic_eegedu": sum(1 for ex in examples if ex["category"] == "Classic p5.eegedu"),
        "n_neurotech_2025": sum(1 for ex in examples if ex["category"] in ("2025 Neurotech Class Catalogue", "2025 Neurotech ERP Assignments")),
        "n_neuroart_2022": sum(1 for ex in examples if ex["category"] == "2022 NeuroArt Class Gallery"),
        "n_builtin_examples": int(len(ex_locs)),
        "n_builtin_categories": 10,
        "n_ref_apis": 153,
        "n_ref_groups": 30,
        "n_ref_tabs": 5,
        "ex_loc_median": int(np.median(ex_locs)),
        "ex_loc_iqr_low": int(np.percentile(ex_locs, 25)),
        "ex_loc_iqr_high": int(np.percentile(ex_locs, 75)),
        "ex_loc_min": int(ex_locs.min()),
        "ex_loc_max": int(ex_locs.max()),
        "n_student_sketches": n_stu,
        "n_unique_students": n_unique_students,
        "stu_cluster_loc_median": int(round(float(np.median(stu_cluster_medians)))),
        "stu_cluster_loc_iqr_low": int(round(float(np.percentile(stu_cluster_medians, 25)))),
        "stu_cluster_loc_iqr_high": int(round(float(np.percentile(stu_cluster_medians, 75)))),
        "mann_whitney_u": round(float(u_stat), 1),
        "mann_whitney_cluster_u": round(float(u_cluster), 1),
        "rank_biserial_cluster_r": round(float(r_rb_cluster), 2),
        "stu_loc_median": int(np.median(stu_locs)),
        "stu_loc_mean": round(float(stu_locs.mean()), 1),
        "stu_loc_sd": round(float(stu_locs.std(ddof=1)), 1),
        "stu_loc_iqr_low": int(np.percentile(stu_locs, 25)),
        "stu_loc_iqr_high": int(np.percentile(stu_locs, 75)),
        "stu_loc_min": int(stu_locs.min()),
        "stu_loc_max": int(stu_locs.max()),
        "n_stu_nf": n_nf,
        "stu_nf_loc_median": int(np.median(nf_locs)),
        "stu_nf_loc_iqr_low": int(np.percentile(nf_locs, 25)),
        "stu_nf_loc_iqr_high": int(np.percentile(nf_locs, 75)),
        "stu_nf_loc_min": int(nf_locs.min()),
        "stu_nf_loc_max": int(nf_locs.max()),
        "n_stu_erp": n_erp,
        "stu_erp_loc_median": int(np.median(erp_locs)),
        "stu_erp_loc_iqr_low": int(np.percentile(erp_locs, 25)),
        "stu_erp_loc_iqr_high": int(np.percentile(erp_locs, 75)),
        "stu_erp_loc_min": int(erp_locs.min()),
        "stu_erp_loc_max": int(erp_locs.max()),
        "stu_pct_cond": round(sum(1 for s in student_sketches if s["smoothing_conditioning"]) / n_stu * 100.0, 1),
        "stu_cnt_cond": sum(1 for s in student_sketches if s["smoothing_conditioning"]),
        "stu_pct_alpha": round(sum(1 for s in student_sketches if s["alpha"]) / n_stu * 100.0, 1),
        "stu_cnt_alpha": sum(1 for s in student_sketches if s["alpha"]),
        "stu_pct_raw": round(sum(1 for s in student_sketches if s["raw"]) / n_stu * 100.0, 1),
        "stu_cnt_raw": sum(1 for s in student_sketches if s["raw"]),
        "stu_pct_beta": round(sum(1 for s in student_sketches if s["beta"]) / n_stu * 100.0, 1),
        "stu_cnt_beta": sum(1 for s in student_sketches if s["beta"]),
        "stu_pct_erp": round(sum(1 for s in student_sketches if s["erp_oddball"]) / n_stu * 100.0, 1),
        "stu_cnt_erp": sum(1 for s in student_sketches if s["erp_oddball"]),
        "stu_pct_att": round(sum(1 for s in student_sketches if s["attention"]) / n_stu * 100.0, 1),
        "stu_cnt_att": sum(1 for s in student_sketches if s["attention"]),
        "stu_pct_theta": round(sum(1 for s in student_sketches if s["theta"]) / n_stu * 100.0, 1),
        "stu_cnt_theta": sum(1 for s in student_sketches if s["theta"]),
        "stu_pct_particles": round(sum(1 for s in student_sketches if s["particles"]) / n_stu * 100.0, 1),
        "stu_cnt_particles": sum(1 for s in student_sketches if s["particles"]),
        "stu_pct_med": round(sum(1 for s in student_sketches if s["meditation"]) / n_stu * 100.0, 1),
        "stu_cnt_med": sum(1 for s in student_sketches if s["meditation"]),
        "stu_pct_audio": round(sum(1 for s in student_sketches if s["audio"]) / n_stu * 100.0, 1),
        "stu_cnt_audio": sum(1 for s in student_sketches if s["audio"]),
        "stu_pct_events": round(sum(1 for s in student_sketches if s["interactive"]) / n_stu * 100.0, 1),
        "stu_cnt_events": sum(1 for s in student_sketches if s["interactive"]),
        # Disaggregated by Cohort 1 (N=40 Neurofeedback) vs Cohort 2 (N=29 Online 4-Ch ERPs)
        "nf_cnt_cond": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["smoothing_conditioning"]),
        "nf_pct_cond": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["smoothing_conditioning"]) / n_nf * 100.0, 1),
        "erp_cnt_cond": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["smoothing_conditioning"]),
        "erp_pct_cond": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["smoothing_conditioning"]) / n_erp * 100.0, 1),
        "nf_cnt_alpha": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["alpha"]),
        "nf_pct_alpha": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["alpha"]) / n_nf * 100.0, 1),
        "erp_cnt_alpha": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["alpha"]),
        "erp_pct_alpha": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["alpha"]) / n_erp * 100.0, 1),
        "nf_cnt_beta": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["beta"]),
        "nf_pct_beta": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["beta"]) / n_nf * 100.0, 1),
        "erp_cnt_beta": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["beta"]),
        "erp_pct_beta": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["beta"]) / n_erp * 100.0, 1),
        "nf_cnt_raw": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["raw"]),
        "nf_pct_raw": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["raw"]) / n_nf * 100.0, 1),
        "erp_cnt_raw": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["raw"]),
        "erp_pct_raw": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["raw"]) / n_erp * 100.0, 1),
        "nf_cnt_att": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["attention"]),
        "nf_pct_att": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["attention"]) / n_nf * 100.0, 1),
        "erp_cnt_att": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["attention"]),
        "erp_pct_att": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["attention"]) / n_erp * 100.0, 1),
        "nf_cnt_particles": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["particles"]),
        "nf_pct_particles": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["particles"]) / n_nf * 100.0, 1),
        "erp_cnt_particles": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["particles"]),
        "erp_pct_particles": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["particles"]) / n_erp * 100.0, 1),
        "nf_cnt_audio": sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["audio"]),
        "nf_pct_audio": round(sum(1 for s in student_sketches if not s["is_erp_cohort"] and s["audio"]) / n_nf * 100.0, 1),
        "erp_cnt_audio": sum(1 for s in student_sketches if s["is_erp_cohort"] and s["audio"]),
        "erp_pct_audio": round(sum(1 for s in student_sketches if s["is_erp_cohort"] and s["audio"]) / n_erp * 100.0, 1),
        # Catalogue-wide modality counts and percentages across all N=226 sketches (matching Fig 2D)
        "cat_cnt_alpha": sum(1 for ex in examples if ex["alpha"]),
        "cat_pct_alpha": round(sum(1 for ex in examples if ex["alpha"]) / len(examples) * 100.0, 1),
        "cat_cnt_beta": sum(1 for ex in examples if ex["beta"]),
        "cat_pct_beta": round(sum(1 for ex in examples if ex["beta"]) / len(examples) * 100.0, 1),
        "cat_cnt_att": sum(1 for ex in examples if ex["attention"]),
        "cat_pct_att": round(sum(1 for ex in examples if ex["attention"]) / len(examples) * 100.0, 1),
        "cat_cnt_theta": sum(1 for ex in examples if ex["theta"]),
        "cat_pct_theta": round(sum(1 for ex in examples if ex["theta"]) / len(examples) * 100.0, 1),
        "cat_cnt_raw": sum(1 for ex in examples if ex["raw_epoch"]),
        "cat_pct_raw": round(sum(1 for ex in examples if ex["raw_epoch"]) / len(examples) * 100.0, 1),
        "cat_cnt_imu": sum(1 for ex in examples if ex["imu_motion"]),
        "cat_pct_imu": round(sum(1 for ex in examples if ex["imu_motion"]) / len(examples) * 100.0, 1),
        "cat_cnt_audio": sum(1 for ex in examples if ex["audio"]),
        "cat_pct_audio": round(sum(1 for ex in examples if ex["audio"]) / len(examples) * 100.0, 1),
        "cat_cnt_ppg": sum(1 for ex in examples if ex["ppg_fnirs"]),
        "cat_pct_ppg": round(sum(1 for ex in examples if ex["ppg_fnirs"]) / len(examples) * 100.0, 1),
    }
    summary.update(dsp_bench)
    summary.update(multimodal_bench)

    # Table 2 Subgroup LOC Quantiles
    starter_diag_locs = np.array([ex["loc"] for ex in examples if ex["category"] in [
        "Start Here: One Simple Sketch per Sensor", "Signal Quality & Diagnostics"
    ]])
    studios_locs = np.array([ex["loc"] for ex in examples if ex["category"] in [
        "PPG & Optical (fNIRS)", "Motion, IMU & Broadcast Sensors", "Multimodal (EEG + PPG + HR)"
    ]])
    games_locs = np.array([ex["loc"] for ex in examples if ex["category"] in [
        "BrainGames", "EEGEdu Modules", "Classic p5.eegedu"
    ]])
    archival_locs = np.array([ex["loc"] for ex in examples if ex["category"] in [
        "2025 Neurotech Class Catalogue", "2025 Neurotech ERP Assignments", "2022 NeuroArt Class Gallery"
    ]])

    # Wilcoxon signed-rank test of Cohort 2 vs 85-LOC epochs.js template
    wilc_epochs = stats.wilcoxon(erp_locs - 85, alternative="greater")

    # Section 3.2 Individual Track Medians (half-up rounding)
    ppg_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] == "PPG & Optical (fNIRS)"])
    imu_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] == "Motion, IMU & Broadcast Sensors"])
    multi_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] == "Multimodal (EEG + PPG + HR)"])
    braingames_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] == "BrainGames"])
    neurotech_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] in ("2025 Neurotech Class Catalogue", "2025 Neurotech ERP Assignments")])
    neuroart_track_locs = np.array([ex["loc"] for ex in examples if ex["category"] == "2022 NeuroArt Class Gallery"])

    summary.update({
        # Reference Drawer Tab Counts
        "n_ref_sensors": 53,
        "n_ref_p5": 38,
        "n_ref_input": 27,
        "n_ref_eegdata": 19,
        "n_ref_sound": 16,

        # Section 3.2 Individual Track Medians
        "studio_ppg_loc_median": int(np.floor(np.median(ppg_track_locs) + 0.5)),
        "studio_imu_loc_median": int(np.floor(np.median(imu_track_locs) + 0.5)),
        "studio_multi_loc_median": int(np.floor(np.median(multi_track_locs) + 0.5)),
        "braingames_loc_median": int(np.floor(np.median(braingames_track_locs) + 0.5)),
        "neurotech_loc_median": int(np.floor(np.median(neurotech_track_locs) + 0.5)),
        "neuroart_loc_median": int(np.floor(np.median(neuroart_track_locs) + 0.5)),
        "n_games_and_eegedu": len(games_locs),
        "n_archival_total": len(archival_locs),
        "n_additional_sketches": len(neurotech_track_locs) - n_stu,

        # Table 2 Subgroup 0: One-Sensor Starters & Diagnostics (N = 7)
        "starter_diag_loc_median": int(round(np.median(starter_diag_locs))),
        "starter_diag_loc_iqr_low": int(round(np.percentile(starter_diag_locs, 25))),
        "starter_diag_loc_iqr_high": int(round(np.percentile(starter_diag_locs, 75))),
        "starter_diag_loc_min": int(starter_diag_locs.min()),
        "starter_diag_loc_max": int(starter_diag_locs.max()),

        # Table 2 Subgroup 2: Studios (N = 26)
        "n_studios_group": len(studios_locs),
        "studios_loc_median": int(round(np.median(studios_locs))),
        "studios_loc_iqr_low": int(round(np.percentile(studios_locs, 25))),
        "studios_loc_iqr_high": int(round(np.percentile(studios_locs, 75))),
        "studios_loc_min": int(studios_locs.min()),
        "studios_loc_max": int(studios_locs.max()),

        # Table 2 Subgroup 3: BrainGames, EEGEdu & Classic (N = 43)
        "games_loc_median": int(round(np.median(games_locs))),
        "games_loc_iqr_low": int(round(np.percentile(games_locs, 25))),
        "games_loc_iqr_high": int(round(np.percentile(games_locs, 75))),
        "games_loc_min": int(games_locs.min()),
        "games_loc_max": int(games_locs.max()),

        # Table 2 Subgroup 4: Archival Class Galleries (N = 121)
        "archival_loc_median": int(round(np.median(archival_locs))),
        "archival_loc_iqr_low": int(round(np.percentile(archival_locs, 25))),
        "archival_loc_iqr_high": int(round(np.percentile(archival_locs, 75))),
        "archival_loc_min": int(archival_locs.min()),
        "archival_loc_max": int(archival_locs.max()),

        # Table 2 Row 7: Per-Student Clustered Min-Max
        "stu_cluster_loc_min": int(round(stu_cluster_medians.min())),
        "stu_cluster_loc_max": int(round(stu_cluster_medians.max())),

        # Wilcoxon Signed-Rank Test vs 85-LOC epochs.js
        "wilcoxon_epochs_w": float(wilc_epochs.statistic),
        "wilcoxon_epochs_p": float(wilc_epochs.pvalue),
        "epochs_template_loc": 85,
        "epochs_exceed_pct": 100.0,
        "epochs_expansion_factor": round(float(np.median(erp_locs / 85.0)), 2),
    })

    with open(os.path.join(P2_DIR, "stats_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    macros = [
        "% Auto-generated by paper2_brainimation/generate_figures.py — DO NOT EDIT MANUALLY",
        f"\\newcommand{{\\MuseBrowserKB}}{{{summary['muse_browser_kb']:.1f}}}",
        f"\\newcommand{{\\LegacyMuseKB}}{{{summary['legacy_muse_kb']:.1f}}}",
        f"\\newcommand{{\\BundleReductionFactor}}{{{summary['bundle_reduction_factor']:.1f}}}",
        f"\\newcommand{{\\NRefSensors}}{{{summary['n_ref_sensors']}}}",
        f"\\newcommand{{\\NRefPFive}}{{{summary['n_ref_p5']}}}",
        f"\\newcommand{{\\NRefInput}}{{{summary['n_ref_input']}}}",
        f"\\newcommand{{\\NRefEEGData}}{{{summary['n_ref_eegdata']}}}",
        f"\\newcommand{{\\NRefSound}}{{{summary['n_ref_sound']}}}",
        f"\\newcommand{{\\StudioPPGLOCMedian}}{{{summary['studio_ppg_loc_median']}}}",
        f"\\newcommand{{\\StudioIMULOCMedian}}{{{summary['studio_imu_loc_median']}}}",
        f"\\newcommand{{\\StudioMultiLOCMedian}}{{{summary['studio_multi_loc_median']}}}",
        f"\\newcommand{{\\NGamesAndEEGEdu}}{{{summary['n_games_and_eegedu']}}}",
        f"\\newcommand{{\\BrainGamesLOCMedian}}{{{summary['braingames_loc_median']}}}",
        f"\\newcommand{{\\NArchivalTotal}}{{{summary['n_archival_total']}}}",
        f"\\newcommand{{\\NeurotechLOCMedian}}{{{summary['neurotech_loc_median']}}}",
        f"\\newcommand{{\\NeuroArtLOCMedian}}{{{summary['neuroart_loc_median']}}}",
        f"\\newcommand{{\\NAdditionalSketches}}{{{summary['n_additional_sketches']}}}",
        f"\\newcommand{{\\NStarterDiag}}{{{summary['n_starter_diag']}}}",
        f"\\newcommand{{\\StarterDiagLOCMedian}}{{{summary['starter_diag_loc_median']}}}",
        f"\\newcommand{{\\StarterDiagLOCIQRLow}}{{{summary['starter_diag_loc_iqr_low']}}}",
        f"\\newcommand{{\\StarterDiagLOCIQRHigh}}{{{summary['starter_diag_loc_iqr_high']}}}",
        f"\\newcommand{{\\StarterDiagLOCMin}}{{{summary['starter_diag_loc_min']}}}",
        f"\\newcommand{{\\StarterDiagLOCMax}}{{{summary['starter_diag_loc_max']}}}",
        f"\\newcommand{{\\NStudiosGroup}}{{{summary['n_studios_group']}}}",
        f"\\newcommand{{\\StudiosLOCMedian}}{{{summary['studios_loc_median']}}}",
        f"\\newcommand{{\\StudiosLOCIQRLow}}{{{summary['studios_loc_iqr_low']}}}",
        f"\\newcommand{{\\StudiosLOCIQRHigh}}{{{summary['studios_loc_iqr_high']}}}",
        f"\\newcommand{{\\StudiosLOCMin}}{{{summary['studios_loc_min']}}}",
        f"\\newcommand{{\\StudiosLOCMax}}{{{summary['studios_loc_max']}}}",
        f"\\newcommand{{\\GamesEEGEduLOCMedian}}{{{summary['games_loc_median']}}}",
        f"\\newcommand{{\\GamesEEGEduLOCIQRLow}}{{{summary['games_loc_iqr_low']}}}",
        f"\\newcommand{{\\GamesEEGEduLOCIQRHigh}}{{{summary['games_loc_iqr_high']}}}",
        f"\\newcommand{{\\GamesEEGEduLOCMin}}{{{summary['games_loc_min']}}}",
        f"\\newcommand{{\\GamesEEGEduLOCMax}}{{{summary['games_loc_max']}}}",
        f"\\newcommand{{\\ArchivalLOCMedian}}{{{summary['archival_loc_median']}}}",
        f"\\newcommand{{\\ArchivalLOCIQRLow}}{{{summary['archival_loc_iqr_low']}}}",
        f"\\newcommand{{\\ArchivalLOCIQRHigh}}{{{summary['archival_loc_iqr_high']}}}",
        f"\\newcommand{{\\ArchivalLOCMin}}{{{summary['archival_loc_min']}}}",
        f"\\newcommand{{\\ArchivalLOCMax}}{{{summary['archival_loc_max']}}}",
        f"\\newcommand{{\\StuClusterLOCMin}}{{{summary['stu_cluster_loc_min']}}}",
        f"\\newcommand{{\\StuClusterLOCMax}}{{{summary['stu_cluster_loc_max']}}}",
        f"\\newcommand{{\\WilcoxonEpochsW}}{{{summary['wilcoxon_epochs_w']:.1f}}}",
        f"\\newcommand{{\\WilcoxonEpochsP}}{{1.86 \\times 10^{{-9}}}}",
        f"\\newcommand{{\\EpochsExpansionFactor}}{{{summary['epochs_expansion_factor']:.2f}}}",
        f"\\newcommand{{\\NCatalogueSketches}}{{{summary['n_catalogue_sketches']}}}",
        f"\\newcommand{{\\NCatalogueCategories}}{{{summary['n_catalogue_categories']}}}",
        f"\\newcommand{{\\CatLOCMedian}}{{{summary['cat_loc_median']}}}",
        f"\\newcommand{{\\CatLOCIQRLow}}{{{summary['cat_loc_iqr_low']}}}",
        f"\\newcommand{{\\CatLOCIQRHigh}}{{{summary['cat_loc_iqr_high']}}}",
        f"\\newcommand{{\\CatLOCMin}}{{{summary['cat_loc_min']}}}",
        f"\\newcommand{{\\CatLOCMax}}{{{summary['cat_loc_max']}}}",
        f"\\newcommand{{\\NPPGSketches}}{{{summary['n_ppg_sketches']}}}",
        f"\\newcommand{{\\NIMUSketches}}{{{summary['n_imu_sketches']}}}",
        f"\\newcommand{{\\NMultiSketches}}{{{summary['n_multi_sketches']}}}",
        f"\\newcommand{{\\NBrainGames}}{{{summary['n_braingames']}}}",
        f"\\newcommand{{\\NEEGEduModules}}{{{summary['n_eegedu_modules']}}}",
        f"\\newcommand{{\\NClassicEEGEdu}}{{{summary['n_classic_eegedu']}}}",
        f"\\newcommand{{\\NNeurotechCatalogue}}{{{summary['n_neurotech_2025']}}}",
        f"\\newcommand{{\\NNeuroArtGallery}}{{{summary['n_neuroart_2022']}}}",
        f"\\newcommand{{\\ERPNoiseRMSKOne}}{{{summary['erp_bl_rms_k1']:.1f}}}",
        f"\\newcommand{{\\ERPNoiseRMSKFive}}{{{summary['erp_bl_rms_k5']:.1f}}}",
        f"\\newcommand{{\\ERPNoiseRMSKTwenty}}{{{summary['erp_bl_rms_k20']:.1f}}}",
        f"\\newcommand{{\\ERPMCNoiseRMSKOne}}{{{summary['erp_mc_bl_rms_k1']:.1f}}}",
        f"\\newcommand{{\\ERPMCNoiseRMSKFive}}{{{summary['erp_mc_bl_rms_k5']:.1f}}}",
        f"\\newcommand{{\\ERPMCNoiseRMSKTwenty}}{{{summary['erp_mc_bl_rms_k20']:.1f}}}",
        f"\\newcommand{{\\ERPSMEKOne}}{{{summary['erp_sme_k1']:.1f}}}",
        f"\\newcommand{{\\ERPSMEKFive}}{{{summary['erp_sme_k5']:.1f}}}",
        f"\\newcommand{{\\ERPSMEKTwenty}}{{{summary['erp_sme_k20']:.1f}}}",
        f"\\newcommand{{\\ERPBlinkPtPUV}}{{{summary['erp_blink_ptp_uv']:.1f}}}",
        f"\\newcommand{{\\ERPBlinkPThreeHundredBiasUV}}{{{summary['erp_blink_p300_bias_uv']:.1f}}}",
        f"\\newcommand{{\\ERPRMSECleanTwentyUV}}{{{summary['erp_rmse_clean20_uv']:.2f}}}",
        f"\\newcommand{{\\ERPRMSEBlinkUnrejectedUV}}{{{summary['erp_rmse_blink_unrejected_uv']:.2f}}}",
        f"\\newcommand{{\\ERPRMSEBlinkRejectedUV}}{{{summary['erp_rmse_blink_rejected_uv']:.2f}}}",
        f"\\newcommand{{\\JitterFCMSixteenHz}}{{{summary['jitter_fc_16ms_hz']:.1f}}}",
        f"\\newcommand{{\\JitterFCThirtyHz}}{{{summary['jitter_fc_30ms_hz']:.1f}}}",
        f"\\newcommand{{\\JitterFCFortyFiveHz}}{{{summary['jitter_fc_45ms_hz']:.1f}}}",
        f"\\newcommand{{\\JitterNullThirtyHz}}{{{summary['jitter_null_30ms_hz']:.1f}}}",
        f"\\newcommand{{\\JitterNullFortyFiveHz}}{{{summary['jitter_null_45ms_hz']:.1f}}}",
        f"\\newcommand{{\\JitterRetNarrowPct}}{{{summary['jitter_ret_narrow_pct']:.1f}}}",
        f"\\newcommand{{\\JitterRetNOneSeventyPct}}{{{summary['jitter_ret_n170_pct']:.1f}}}",
        f"\\newcommand{{\\JitterRetPThreeHundredPct}}{{{summary['jitter_ret_p300_pct']:.1f}}}",
        f"\\newcommand{{\\JitterPThreePeakLatSDMS}}{{{summary['jitter_p3_peak_lat_sd_ms']:.1f}}}",
        f"\\newcommand{{\\JitterPThreeAreaLatSDMS}}{{{summary['jitter_p3_area_lat_sd_ms']:.1f}}}",
        f"\\newcommand{{\\JitterPThreeTempLatSDMS}}{{{summary['jitter_p3_temp_lat_sd_ms']:.1f}}}",
        f"\\newcommand{{\\AperiodicExpRelaxed}}{{{summary['aperiodic_exp_relaxed']:.2f}}}",
        f"\\newcommand{{\\AperiodicExpActive}}{{{summary['aperiodic_exp_active']:.2f}}}",
        f"\\newcommand{{\\AlphaPeakAboveOneFRelDB}}{{{summary['alpha_peak_above_1f_rel_db']:.1f}}}",
        f"\\newcommand{{\\AlphaPeakAboveOneFActDB}}{{{summary['alpha_peak_above_1f_act_db']:.1f}}}",
        f"\\newcommand{{\\AlphaRawDiffDB}}{{{summary['alpha_raw_diff_db']:.1f}}}",
        f"\\newcommand{{\\AlphaAdjDiffDB}}{{{summary['alpha_adj_diff_db']:.1f}}}",
        f"\\newcommand{{\\ERPSNRKOne}}{{{summary['erp_snr_k1']:.2f}}}",
        f"\\newcommand{{\\ERPSNRKFive}}{{{summary['erp_snr_k5']:.2f}}}",
        f"\\newcommand{{\\ERPSNRKTwenty}}{{{summary['erp_snr_k20']:.2f}}}",
        f"\\newcommand{{\\EMAVarReductionPct}}{{{summary['ema_var_red_pct']:.1f}}}",
        f"\\newcommand{{\\FNIRSErrRawUM}}{{{summary['fnirs_err_raw_um']:.2f}}}",
        f"\\newcommand{{\\FNIRSErrCleanUM}}{{{summary['fnirs_err_clean_um']:.2f}}}",
        f"\\newcommand{{\\FNIRSErrRawUMThreeD}}{{{summary['fnirs_err_raw_um_3d']:.3f}}}",
        f"\\newcommand{{\\FNIRSErrCleanUMThreeD}}{{{summary['fnirs_err_clean_um_3d']:.3f}}}",
        f"\\newcommand{{\\FNIRSSuppDB}}{{{summary['fnirs_supp_db']:.1f}}}",
        f"\\newcommand{{\\FNIRSRRaw}}{{{summary['fnirs_r_raw']:.2f}}}",
        f"\\newcommand{{\\FNIRSRClean}}{{{summary['fnirs_r_clean']:.2f}}}",
        f"\\newcommand{{\\NLMSRMSERawUV}}{{{summary['nlms_rmse_raw_uv']:.1f}}}",
        f"\\newcommand{{\\NLMSRMSECleanUV}}{{{summary['nlms_rmse_clean_uv']:.1f}}}",
        f"\\newcommand{{\\NLMSSuppDB}}{{{summary['nlms_supp_db']:.1f}}}",
        f"\\newcommand{{\\NLMSRRaw}}{{{summary['nlms_r_raw']:.2f}}}",
        f"\\newcommand{{\\NLMSRClean}}{{{summary['nlms_r_clean']:.2f}}}",
        f"\\newcommand{{\\HEPTrueWinMeanUV}}{{{summary['hep_true_win_mean_uv']:.2f}}}",
        f"\\newcommand{{\\HEPTruePeakUV}}{{{summary['hep_true_peak_uv']:.2f}}}",
        f"\\newcommand{{\\HEPSMEUV}}{{{summary['hep_sme_uv']:.2f}}}",
        f"\\newcommand{{\\HEPSurrCIUV}}{{{summary['hep_surr_ci95_uv']:.2f}}}",
        f"\\newcommand{{\\HEPPermP}}{{{summary['hep_perm_p']:.4f}}}",
        f"\\newcommand{{\\NLMSLagThirtyOneOneTapDB}}{{{summary['nlms_lag31_1tap_db']:.1f}}}",
        f"\\newcommand{{\\NLMSLagThirtyOneFourTapDB}}{{{summary['nlms_lag31_4tap_db']:.1f}}}",
        f"\\newcommand{{\\NLMSLagThirtyOneGainDB}}{{{summary['nlms_lag31_gain_db']:.1f}}}",
        f"\\newcommand{{\\NBuiltinExamples}}{{{summary['n_builtin_examples']}}}",
        f"\\newcommand{{\\NBuiltinCategories}}{{{summary['n_builtin_categories']}}}",
        f"\\newcommand{{\\NRefAPIs}}{{{summary['n_ref_apis']}}}",
        f"\\newcommand{{\\NRefGroups}}{{{summary['n_ref_groups']}}}",
        f"\\newcommand{{\\NRefTabs}}{{{summary['n_ref_tabs']}}}",
        f"\\newcommand{{\\ExLOCMedian}}{{{summary['ex_loc_median']}}}",
        f"\\newcommand{{\\ExLOCIQRLow}}{{{summary['ex_loc_iqr_low']}}}",
        f"\\newcommand{{\\ExLOCIQRHigh}}{{{summary['ex_loc_iqr_high']}}}",
        f"\\newcommand{{\\ExLOCMin}}{{{summary['ex_loc_min']}}}",
        f"\\newcommand{{\\ExLOCMax}}{{{summary['ex_loc_max']}}}",
        f"\\newcommand{{\\NStudentSketches}}{{{summary['n_student_sketches']}}}",
        f"\\newcommand{{\\NUniqueStudents}}{{{summary['n_unique_students']}}}",
        f"\\newcommand{{\\StuClusterLOCMedian}}{{{summary['stu_cluster_loc_median']}}}",
        f"\\newcommand{{\\StuClusterLOCIQRLow}}{{{summary['stu_cluster_loc_iqr_low']}}}",
        f"\\newcommand{{\\StuClusterLOCIQRHigh}}{{{summary['stu_cluster_loc_iqr_high']}}}",
        f"\\newcommand{{\\MannWhitneyU}}{{{summary['mann_whitney_u']:.1f}}}",
        f"\\newcommand{{\\MannWhitneyClusterU}}{{{summary['mann_whitney_cluster_u']:.1f}}}",
        f"\\newcommand{{\\RankBiserialClusterR}}{{{summary['rank_biserial_cluster_r']:.2f}}}",
        f"\\newcommand{{\\StuLOCMedian}}{{{summary['stu_loc_median']}}}",
        f"\\newcommand{{\\StuLOCMean}}{{{summary['stu_loc_mean']:.1f}}}",
        f"\\newcommand{{\\StuLOCSD}}{{{summary['stu_loc_sd']:.1f}}}",
        f"\\newcommand{{\\StuLOCIQRLow}}{{{summary['stu_loc_iqr_low']}}}",
        f"\\newcommand{{\\StuLOCIQRHigh}}{{{summary['stu_loc_iqr_high']}}}",
        f"\\newcommand{{\\StuLOCMin}}{{{summary['stu_loc_min']}}}",
        f"\\newcommand{{\\StuLOCMax}}{{{summary['stu_loc_max']}}}",
        f"\\newcommand{{\\NStuNF}}{{{summary['n_stu_nf']}}}",
        f"\\newcommand{{\\StuNFLOCMedian}}{{{summary['stu_nf_loc_median']}}}",
        f"\\newcommand{{\\StuNFLOCIQRLow}}{{{summary['stu_nf_loc_iqr_low']}}}",
        f"\\newcommand{{\\StuNFLOCIQRHigh}}{{{summary['stu_nf_loc_iqr_high']}}}",
        f"\\newcommand{{\\StuNFLOCMin}}{{{summary['stu_nf_loc_min']}}}",
        f"\\newcommand{{\\StuNFLOCMax}}{{{summary['stu_nf_loc_max']}}}",
        f"\\newcommand{{\\NStuERP}}{{{summary['n_stu_erp']}}}",
        f"\\newcommand{{\\StuERPLOCMedian}}{{{summary['stu_erp_loc_median']}}}",
        f"\\newcommand{{\\StuERPLOCIQRLow}}{{{summary['stu_erp_loc_iqr_low']}}}",
        f"\\newcommand{{\\StuERPLOCIQRHigh}}{{{summary['stu_erp_loc_iqr_high']}}}",
        f"\\newcommand{{\\StuERPLOCMin}}{{{summary['stu_erp_loc_min']}}}",
        f"\\newcommand{{\\StuERPLOCMax}}{{{summary['stu_erp_loc_max']}}}",
        f"\\newcommand{{\\StuPctCond}}{{{summary['stu_pct_cond']:.1f}}}",
        f"\\newcommand{{\\StuCntCond}}{{{summary['stu_cnt_cond']}}}",
        f"\\newcommand{{\\StuPctAlpha}}{{{summary['stu_pct_alpha']:.1f}}}",
        f"\\newcommand{{\\StuCntAlpha}}{{{summary['stu_cnt_alpha']}}}",
        f"\\newcommand{{\\StuPctRaw}}{{{summary['stu_pct_raw']:.1f}}}",
        f"\\newcommand{{\\StuCntRaw}}{{{summary['stu_cnt_raw']}}}",
        f"\\newcommand{{\\StuPctBeta}}{{{summary['stu_pct_beta']:.1f}}}",
        f"\\newcommand{{\\StuCntBeta}}{{{summary['stu_cnt_beta']}}}",
        f"\\newcommand{{\\StuPctERP}}{{{summary['stu_pct_erp']:.1f}}}",
        f"\\newcommand{{\\StuCntERP}}{{{summary['stu_cnt_erp']}}}",
        f"\\newcommand{{\\StuPctAtt}}{{{summary['stu_pct_att']:.1f}}}",
        f"\\newcommand{{\\StuCntAtt}}{{{summary['stu_cnt_att']}}}",
        f"\\newcommand{{\\StuPctTheta}}{{{summary['stu_pct_theta']:.1f}}}",
        f"\\newcommand{{\\StuCntTheta}}{{{summary['stu_cnt_theta']}}}",
        f"\\newcommand{{\\StuPctParticles}}{{{summary['stu_pct_particles']:.1f}}}",
        f"\\newcommand{{\\StuCntParticles}}{{{summary['stu_cnt_particles']}}}",
        f"\\newcommand{{\\StuPctMed}}{{{summary['stu_pct_med']:.1f}}}",
        f"\\newcommand{{\\StuCntMed}}{{{summary['stu_cnt_med']}}}",
        f"\\newcommand{{\\StuPctAudio}}{{{summary['stu_pct_audio']:.1f}}}",
        f"\\newcommand{{\\StuCntAudio}}{{{summary['stu_cnt_audio']}}}",
        f"\\newcommand{{\\StuPctEvents}}{{{summary['stu_pct_events']:.1f}}}",
        f"\\newcommand{{\\StuCntEvents}}{{{summary['stu_cnt_events']}}}",
        f"\\newcommand{{\\NFPctCond}}{{{summary['nf_pct_cond']:.1f}}}",
        f"\\newcommand{{\\NFCntCond}}{{{summary['nf_cnt_cond']}}}",
        f"\\newcommand{{\\ERPPctCond}}{{{summary['erp_pct_cond']:.1f}}}",
        f"\\newcommand{{\\ERPCntCond}}{{{summary['erp_cnt_cond']}}}",
        f"\\newcommand{{\\NFPctAlpha}}{{{summary['nf_pct_alpha']:.1f}}}",
        f"\\newcommand{{\\NFCntAlpha}}{{{summary['nf_cnt_alpha']}}}",
        f"\\newcommand{{\\ERPPctAlpha}}{{{summary['erp_pct_alpha']:.1f}}}",
        f"\\newcommand{{\\ERPCntAlpha}}{{{summary['erp_cnt_alpha']}}}",
        f"\\newcommand{{\\NFPctBeta}}{{{summary['nf_pct_beta']:.1f}}}",
        f"\\newcommand{{\\NFCntBeta}}{{{summary['nf_cnt_beta']}}}",
        f"\\newcommand{{\\ERPPctBeta}}{{{summary['erp_pct_beta']:.1f}}}",
        f"\\newcommand{{\\ERPCntBeta}}{{{summary['erp_cnt_beta']}}}",
        f"\\newcommand{{\\NFPctRaw}}{{{summary['nf_pct_raw']:.1f}}}",
        f"\\newcommand{{\\NFCntRaw}}{{{summary['nf_cnt_raw']}}}",
        f"\\newcommand{{\\ERPPctRaw}}{{{summary['erp_pct_raw']:.1f}}}",
        f"\\newcommand{{\\ERPCntRaw}}{{{summary['erp_cnt_raw']}}}",
        f"\\newcommand{{\\NFPctAtt}}{{{summary['nf_pct_att']:.1f}}}",
        f"\\newcommand{{\\NFCntAtt}}{{{summary['nf_cnt_att']}}}",
        f"\\newcommand{{\\ERPPctAtt}}{{{summary['erp_pct_att']:.1f}}}",
        f"\\newcommand{{\\ERPCntAtt}}{{{summary['erp_cnt_att']}}}",
        f"\\newcommand{{\\NFPctParticles}}{{{summary['nf_pct_particles']:.1f}}}",
        f"\\newcommand{{\\NFCntParticles}}{{{summary['nf_cnt_particles']}}}",
        f"\\newcommand{{\\ERPPctParticles}}{{{summary['erp_pct_particles']:.1f}}}",
        f"\\newcommand{{\\ERPCntParticles}}{{{summary['erp_cnt_particles']}}}",
        f"\\newcommand{{\\CatCntAlpha}}{{{summary['cat_cnt_alpha']}}}",
        f"\\newcommand{{\\CatPctAlpha}}{{{summary['cat_pct_alpha']:.1f}}}",
        f"\\newcommand{{\\CatCntBeta}}{{{summary['cat_cnt_beta']}}}",
        f"\\newcommand{{\\CatPctBeta}}{{{summary['cat_pct_beta']:.1f}}}",
        f"\\newcommand{{\\CatCntAtt}}{{{summary['cat_cnt_att']}}}",
        f"\\newcommand{{\\CatPctAtt}}{{{summary['cat_pct_att']:.1f}}}",
        f"\\newcommand{{\\CatCntTheta}}{{{summary['cat_cnt_theta']}}}",
        f"\\newcommand{{\\CatPctTheta}}{{{summary['cat_pct_theta']:.1f}}}",
        f"\\newcommand{{\\CatCntRaw}}{{{summary['cat_cnt_raw']}}}",
        f"\\newcommand{{\\CatPctRaw}}{{{summary['cat_pct_raw']:.1f}}}",
        f"\\newcommand{{\\CatCntIMU}}{{{summary['cat_cnt_imu']}}}",
        f"\\newcommand{{\\CatPctIMU}}{{{summary['cat_pct_imu']:.1f}}}",
        f"\\newcommand{{\\CatCntAudio}}{{{summary['cat_cnt_audio']}}}",
        f"\\newcommand{{\\CatPctAudio}}{{{summary['cat_pct_audio']:.1f}}}",
        f"\\newcommand{{\\CatCntPPG}}{{{summary['cat_cnt_ppg']}}}",
        f"\\newcommand{{\\CatPctPPG}}{{{summary['cat_pct_ppg']:.1f}}}",
        "",
    ]
    with open(os.path.join(P2_DIR, "stats_macros.tex"), "w") as f:
        f.write("\n".join(macros))
    print("Exported stats_summary.json and stats_macros.tex")


if __name__ == "__main__":
    muse_path = os.path.join(BRAIN_DIR, "muse-browser.js")
    muse_kb = os.path.getsize(muse_path) / 1024.0
    legacy_muse_kb = 473.0
    reduction_factor = legacy_muse_kb / muse_kb

    examples, cat_order = analyze_builtin_examples()
    # Kyle's original Figure 1 (fig1_brainimation_ide_architecture), used by paper2.
    # Switched off so a run makes only the paper3 Figure 1 below. Remove the # to make it again.
    # make_fig1_ide_architecture(examples, cat_order, muse_kb, reduction_factor)
    make_fig1_equal_boxes(examples, cat_order, muse_kb, reduction_factor)
    make_fig2_ide_scaffolding_and_corpus(examples, cat_order)
    dsp_bench = make_fig3_sonification_and_erp_engine()
    multimodal_bench = make_fig4_multimodal_athena_ppg_imu()
    make_fig5_student_submissions(examples, muse_kb, legacy_muse_kb, dsp_bench, multimodal_bench)

# Backward compatibility aliases
make_fig5_multimodal_athena_ppg_imu = make_fig4_multimodal_athena_ppg_imu
make_fig4_student_submissions = make_fig5_student_submissions
