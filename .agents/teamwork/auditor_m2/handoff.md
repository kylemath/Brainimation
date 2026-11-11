## Forensic Audit Report

**Work Product**: Milestone 2 Remediation (Requirement R2: Feature Regexes, Student Deduplication & Stats Macros)  
**Profile**: General Project (Development Mode Integrity)  
**Verdict**: CLEAN  

### Phase Results
- **Expanded Feature Regexes**: PASS — `generate_figures.py` genuinely parses student code using `r"(?:eegData\??\.|\b(?:e|src)\.)" + prop + r"\b|getChannelBand\(\s*['\"]" + prop`. Captured 26 instances across 7 student submissions with optional chaining and variable aliasing without mocking or shortcuts.
- **Explicit `erp_oddball` Regex**: PASS — Replaced tautological cohort metadata flag with an explicit regular expression search over `exec_code`. Matches 29/29 (100%) Cohort 2 ERP projects and 0/40 (0.0%) Cohort 1 neurofeedback games.
- **Dynamically Derived Macros**: PASS — All 32 macro values in `stats_macros.tex` and `stats_summary.json` are dynamically computed from raw data and code parsing in `generate_figures.py`. Recompiling regenerates identical macro definitions.
- **Genuine Verification Assertions**: PASS — `verify_manuscript_analyses.py` contains authentic, non-tautological assertions testing all 9 Table 2 rows (n, med, q1, q3, min, max), feature adoptions, Wilcoxon statistics, and disk-level byte size of `muse-browser.js`.
- **Independent Execution**: PASS — `verify_manuscript_analyses.py` executes cleanly with exit code 0 (`>>> ALL VERIFICATION CHECKS PASSED (100% SUCCESS) <<<`).
- **LaTeX Compilation**: PASS — `paper2_brainimation.tex` compiles cleanly with `pdflatex` and `bibtex` with exit code 0 and zero missing citations or undefined references.
- **Repository Isolation**: PASS — `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation` is an untouched symlink pointing to `/Users/fulkanjou/Brainimation`, gitignored and uncommitted in `EEGEDUPaper`.

---

# 5-Component Handoff Report

## 1. Observation

1. **Feature Regexes in `generate_figures.py`**:
   - In `analyze_builtin_examples()` (lines 102–108) and `make_fig4_student_submissions()` (lines 910–923):
     ```python
     "alpha": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)alpha\b|getChannelBand\(\s*['\"]alpha", exec_code)),
     "beta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)beta\b|getChannelBand\(\s*['\"]beta", exec_code)),
     "theta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)theta\b|getChannelBand\(\s*['\"]theta", exec_code)),
     "delta": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)delta\b|getChannelBand\(\s*['\"]delta", exec_code)),
     "gamma": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)gamma\b|getChannelBand\(\s*['\"]gamma", exec_code)),
     "attention": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)attention\b", exec_code)),
     "meditation": bool(re.search(r"(?:eegData\??\.|\b(?:e|src)\.)meditation\b", exec_code)),
     ```
   - Direct inspection of `/Users/fulkanjou/EEGEDUPaper/data/student_submissions/` verified that real student code relies on these constructs:
     - `13BLams4_Shariff_midterm_part1 - Raissa Shariff.txt` lines 39–41:
       ```javascript
       const e = (typeof eegData!=='undefined') ? eegData : {};
       const aIn = norm(e.attention);
       const mIn = norm(e.meditation);
       ```
     - `1N-hD32b_Badran_midterm_part1 - Sarah Badran.txt` lines 71–72 & 142:
       ```javascript
       const alphaRaw = (eegData?.meditation ?? eegData?.alpha ?? 0);
       const betaRaw  = (eegData?.attention  ?? eegData?.beta  ?? 0);
       ellipse(p.x, p.y, 5 + (eegData?.gamma ?? 0) * 10);
       ```
     - `1f5FnUjn_Jaber_midterm_part1 - Samir Jaber.txt` lines 153–156:
       ```javascript
       alpha: constrain(src.alpha ?? 0, 0, 1),
       beta: constrain(src.beta ?? 0, 0, 1),
       theta: constrain(src.theta ?? 0, 0, 1),
       delta: constrain(src.delta ?? 0, 0, 1),
       ```
   - Across the 69 student submissions, the expanded regexes correctly identify 26 band/state usages across 7 student submissions that were previously omitted by rigid regexes.

2. **Explicit `erp_oddball` Regex in `generate_figures.py`**:
   - `generate_figures.py` line 918 uses an explicit regular expression over `exec_code`:
     ```python
     "erp_oddball": bool(re.search(
         r"getRecentEpoch|epochData|avgStd|avgTgt|avgERP|epochBuffer|trialCount|targetTrials|standardTrials|"
         r"preStim|postStim|oddball|stimulusType|targetEpoch|standardEpoch|triggerTime|triggerOnset|"
         r"n170|p300|mmn|EPOCH_SAMPLES|PRE_SAMPLES|POST_SAMPLES|onlineMeanUpdate",
         exec_code, re.I
     ))
     ```
   - Empirical test execution across all 69 student sketches showed:
     - Cohort 1 Continuous Neurofeedback ($N = 40$): 0/40 hits ($0.0\%$ false positives).
     - Cohort 2 Online 4-Channel ERPs ($N = 29$): 29/29 hits ($100.0\%$ true positives).
   - The implementation does NOT set `"erp_oddball": is_erp_cohort`. It evaluates source code contents directly.

3. **32 Macros in `stats_macros.tex` and `stats_summary.json`**:
   - The 32 identified numbers across Section 3.1, Section 3.2, Table 1, and Table 2 are computed directly from raw arrays in `generate_figures.py` (lines 1222–1272):
     - Section 3.1 Reference Drawer Tab counts: `\NRefSensors` (41), `\NRefPFive` (38), `\NRefInput` (27), `\NRefEEGData` (26), `\NRefSound` (16).
     - Section 3.2 Individual Track Medians: `\StudioPPGLOCMedian` (198), `\StudioIMULOCMedian` (215), `\StudioMultiLOCMedian` (120), `\NGamesAndEEGEdu` (43), `\BrainGamesLOCMedian` (514), `\NArchivalTotal` (121), `\NeurotechLOCMedian` (149), `\NeuroArtLOCMedian` (43).
     - Table 1 bundle metrics: `\LegacyMuseKB` (473.0), `\MuseBrowserKB` (38.0), `\BundleReductionFactor` (12.5).
     - Table 2 Note: `\NAdditionalSketches` (26).
     - Table 2 Subgroup 2 Studios: `\NStudiosGroup` (26), `\StudiosLOCMedian` (200), `\StudiosLOCIQRLow` (130), `\StudiosLOCIQRHigh` (245), `\StudiosLOCMin` (69), `\StudiosLOCMax` (510).
     - Table 2 Subgroup 3 Games & EEGEdu: `\GamesEEGEduLOCMedian` (131), `\GamesEEGEduLOCIQRLow` (38), `\GamesEEGEduLOCIQRHigh` (438), `\GamesEEGEduLOCMin` (17), `\GamesEEGEduLOCMax` (758).
     - Table 2 Subgroup 4 Archival: `\ArchivalLOCMedian` (126), `\ArchivalLOCIQRLow` (50), `\ArchivalLOCIQRHigh` (174), `\ArchivalLOCMin` (12), `\ArchivalLOCMax` (414).
     - Table 2 Row 7 Clustered: `\StuClusterLOCMin` (87), `\StuClusterLOCMax` (302).
     - Wilcoxon Signed-Rank: `\WilcoxonEpochsW` (435.0), `\WilcoxonEpochsP` ($1.86 \times 10^{-9}$), `\EpochsExpansionFactor` (2.07).
   - In `paper2_brainimation.tex` and `manuscript.md`, all 32 values are wired to these macro commands.
   - Half-up rounding `int(np.floor(v + 0.5))` is standardized across `generate_figures.py`, guaranteeing that Category 18 (median 42.5 LOC) consistently resolves to 43 across Figure 1C, Figure 2C, Table 2, and prose.

4. **Verification Assertions in `verify_manuscript_analyses.py`**:
   - Inspected lines 59–166 and lines 248–255:
     - `assert results["catalogue_sum_check"]["exact_match"]` (verifies $36 + 26 + 43 + 121 = 226$).
     - `assert results["student_cohort_sum_check"]["exact_match"]` (verifies $40 + 29 = 69$).
     - `assert results["table2_loc_quantiles_check"]["all_subgroups_passed"]` (verifies $(N, \text{Med}, Q_1, Q_3, \text{Min}, \text{Max})$ for all 9 rows against published Table 2 expected quantiles).
     - `assert results["feature_adoption_disaggregated_check"]["all_checks_passed"]` (verifies 11 feature adoption counts and percentages).
     - `assert results["wilcoxon_epochs_test_check"]["exact_match"]` (verifies $W = 435.0, p < 10^{-8}$, template 85 LOC, 100% exceedance, 2.07x expansion).
     - `assert results["muse_browser_size_check"]["exact_match"]` (measures `os.path.getsize(muse_file) == 38899`, reported KB 38.0, reduction factor 12.5).
     - `assert results["nonparametric_effect_size_check"]["exact_match"]` (verifies $r_{rb} = 0.99$).
   - None of the assertions are tautological (`assert True` or self-comparisons); all evaluate real data against ground-truth specifications.

5. **Untouched Symlink `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation`**:
   - `ls -la /Users/fulkanjou/EEGEDUPaper/repos/Brainimation`:
     `lrwxr-xr-x@ 1 fulkanjou staff 29 Nov 7 11:16 /Users/fulkanjou/EEGEDUPaper/repos/Brainimation -> /Users/fulkanjou/Brainimation`
   - Git status for `repos/Brainimation` in `EEGEDUPaper`: clean working tree, untracked/ignored by `.gitignore`.

---

## 2. Logic Chain

1. The user required expanding feature regexes to capture optional chaining (`eegData?.alpha`) and aliasing (`e.alpha`, `src.alpha`), and an explicit code regex for `erp_oddball`.
2. Direct inspection of student submission files confirms that learners indeed wrote `e.attention`, `src.alpha`, and `eegData?.meditation`. The updated regexes in `generate_figures.py` capture these patterns without matching unrelated text.
3. For `erp_oddball`, the prior implementation used `is_erp_cohort` (a cohort metadata flag). The updated implementation inspects code tokens (`avgStd`, `epochData`, `preStim`, `oddball`, `p300`, etc.) directly on `exec_code`, achieving 100% sensitivity on Cohort 2 and 0% false positive rate on Cohort 1.
4. The user required parameterizing 32 numbers into `stats_macros.tex` and adding verification checks to `verify_manuscript_analyses.py`.
5. Running `generate_figures.py` computes all 32 numbers dynamically from raw data and outputs `stats_summary.json` and `stats_macros.tex`.
6. `verify_manuscript_analyses.py` checks each of these numbers, including all 9 rows of Table 2 LOC quantiles and the exact byte count of `muse-browser.js`, raising `AssertionError` if any value deviates.
7. Executing `verify_manuscript_analyses.py` independently produced exit code 0 and confirmed all checks pass.
8. Executing `pdflatex` + `bibtex` + `pdflatex` compiles `paper2_brainimation.tex` cleanly with exit code 0 and zero unresolved citations or references.
9. No modifications occurred in `/Users/fulkanjou/EEGEDUPaper/repos/Brainimation`.
10. Therefore, the implementation is authentic, rigorous, and completely free of integrity violations or Goodharting shortcuts.

---

## 3. Caveats

- **Scope boundary**: This audit examined Milestone 2 deliverables (Requirement R2: `generate_figures.py`, `stats_macros.tex`, `stats_summary.json`, `verify_manuscript_analyses.py`, Table 2 placement in `paper2_brainimation.tex` and `manuscript.md`, and repository non-touch constraints). Milestone 1 (JavaScript live code synchronization) and Milestone 3 (neurophysiological text additions) were reviewed in their respective milestone contexts.

---

## 4. Conclusion

The Milestone 2 work product satisfies all requirements with 100% compliance.
- No hardcoded test results, facade implementations, or compliance theater were detected.
- Regexes perform genuine source-code analysis.
- Macros are mathematically derived from raw data.
- Verification script assertions are strict and non-tautological.
- PDF compiles cleanly with exit code 0.
- Repository non-touch constraints are preserved.

**Verdict: CLEAN**.

---

## 5. Verification Method

To independently re-verify this audit, run the following commands:

```bash
# 1. Regenerate figures, statistical summary, and macros from source data
python3 /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/generate_figures.py

# 2. Run independent quantitative replication and table verification
python3 /Users/fulkanjou/EEGEDUPaper/paper2_brainimation/verify_manuscript_analyses.py

# 3. Verify LaTeX PDF compilation
cd /Users/fulkanjou/EEGEDUPaper/paper2_brainimation
pdflatex -interaction=batchmode paper2_brainimation.tex && bibtex paper2_brainimation && pdflatex -interaction=batchmode paper2_brainimation.tex

# 4. Check untouched status of repos/Brainimation
git -C /Users/fulkanjou/EEGEDUPaper status repos/Brainimation
```
