#!/usr/bin/env python3
"""
Standalone End-to-End Automated Pipeline for Paper 2 (BrainImation & BrainGames).

Executes in one reproducible loop inside /Users/fulkanjou/Brainimation/paper2_brainimation:
  Stage 1: Empirical data analysis, DSP/ML benchmarks, student corpus AST/regex analysis,
           CSV table export, JSON stats summary export, dynamic LaTeX macro generation
           (stats_macros.tex), and vector PDF + 300 DPI PNG figure generation (generate_figures.py).
  Stage 2: Quantitative verification of all reported metrics and tables (verify_manuscript_analyses.py).
  Stage 3: Full LaTeX + BibTeX compilation (pdflatex -> bibtex -> pdflatex -> pdflatex)
           producing paper2_brainimation.pdf, jnm_submission/paper2_brainimation.pdf, and title_page.pdf.
"""
import os
import sys
import json
import shutil
import subprocess
import time

P2_DIR = os.path.dirname(os.path.abspath(__file__))
PDFLATEX = shutil.which("pdflatex") or "/Library/TeX/texbin/pdflatex"
BIBTEX = shutil.which("bibtex") or "/Library/TeX/texbin/bibtex"


def run_step(cmd, cwd=P2_DIR, desc=""):
    print(f"  -> {desc}: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, errors="replace")
    if res.returncode != 0:
        print(f"[ERROR] Command failed (exit {res.returncode}):\n{res.stdout[-2000:]}")
        sys.exit(res.returncode)
    return res.stdout


def compile_latex(work_dir, tex_stem, use_bibtex=True):
    """Run full pdflatex -> bibtex -> pdflatex -> pdflatex cycle and check logs."""
    run_step([PDFLATEX, "-interaction=nonstopmode", "-halt-on-error", f"{tex_stem}.tex"],
             cwd=work_dir, desc=f"pdflatex pass 1 ({tex_stem})")
    if use_bibtex:
        run_step([BIBTEX, tex_stem],
                 cwd=work_dir, desc=f"bibtex ({tex_stem})")
        run_step([PDFLATEX, "-interaction=nonstopmode", "-halt-on-error", f"{tex_stem}.tex"],
                 cwd=work_dir, desc=f"pdflatex pass 2 ({tex_stem})")
    run_step([PDFLATEX, "-interaction=nonstopmode", "-halt-on-error", f"{tex_stem}.tex"],
             cwd=work_dir, desc=f"pdflatex final pass ({tex_stem})")

    log_path = os.path.join(work_dir, f"{tex_stem}.log")
    log_txt = open(log_path, "r", errors="ignore").read()
    undef_refs = [ln for ln in log_txt.splitlines() if "Undefined" in ln or "undefined" in ln]
    if undef_refs:
        print(f"  [WARN] Undefined references/citations in {tex_stem}.log:\n    " + "\n    ".join(undef_refs))
    else:
        print(f"  [OK] Zero undefined references or citations in {os.path.join(work_dir, tex_stem + '.pdf')}")


def main():
    t0 = time.time()
    print("=" * 78)
    print("STARTING BRAINIMATION (PAPER 2) STANDALONE BUILD & VERIFICATION PIPELINE")
    print("=" * 78)

    print("\n[Stage 1] Running BrainImation Analysis, Figures 1-5, Tables, and LaTeX Macros...")
    run_step([sys.executable, os.path.join(P2_DIR, "generate_figures.py")],
             cwd=P2_DIR, desc="generate_figures.py")

    print("\n[Stage 2] Verifying All Manuscript Analyses and Table Metrics...")
    run_step([sys.executable, os.path.join(P2_DIR, "verify_manuscript_analyses.py")],
             cwd=P2_DIR, desc="verify_manuscript_analyses.py")

    print("\n[Stage 3] Compiling LaTeX Manuscripts (Main, JNM Submission, and Title Page)...")
    compile_latex(P2_DIR, "paper2_brainimation", use_bibtex=True)
    compile_latex(P2_DIR, "title_page", use_bibtex=False)
    jnm_dir = os.path.join(P2_DIR, "jnm_submission")
    if os.path.exists(os.path.join(jnm_dir, "paper2_brainimation.tex")):
        shutil.copy2(os.path.join(P2_DIR, "stats_macros.tex"), os.path.join(jnm_dir, "stats_macros.tex"))
        compile_latex(jnm_dir, "paper2_brainimation", use_bibtex=True)

    p2_stats = json.load(open(os.path.join(P2_DIR, "stats_summary.json")))
    elapsed = time.time() - t0
    print("\n" + "=" * 78)
    print(f"BRAINIMATION PIPELINE COMPLETED SUCCESSFULLY IN {elapsed:.1f} SECONDS")
    print(f"  • Manuscript PDF: {os.path.join(P2_DIR, 'paper2_brainimation.pdf')}")
    print(f"  • Total Catalogue: N = {p2_stats['n_catalogue_sketches']} sketches across {p2_stats['n_catalogue_categories']} categories "
          f"(N = {p2_stats['n_builtin_examples']} core scaffolds, median = {p2_stats['ex_loc_median']} LOC)")
    print(f"  • Student Corpus:  N = {p2_stats['n_student_sketches']} PSYCH 403 submissions across N = {p2_stats['n_unique_students']} students "
          f"(median = {p2_stats['stu_loc_median']} LOC)")
    print("=" * 78)


if __name__ == "__main__":
    main()
