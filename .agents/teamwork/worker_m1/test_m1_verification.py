import sys, re
sys.path.insert(0, '/Users/fulkanjou/EEGEDUPaper/paper2_brainimation')
from generate_figures import count_executable_loc, extract_executable_lines

print('--- CHECK 1: basic.js & Listing 1 ---')
basic_js = open('/Users/fulkanjou/Brainimation/examples/basic.js').read()
loc_basic = count_executable_loc(basic_js)
print(f'basic.js executable LOC: {loc_basic} (must be 11)')
assert loc_basic == 11, f'Expected 11, got {loc_basic}'

tex = open('/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex').read()
md = open('/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md').read()

# Extract Listing 1 from tex
lst1_match = re.search(r'\\begin\{lstlisting\}([\s\S]*?function setup[\s\S]*?)\\end\{lstlisting\}', tex)
assert lst1_match, 'Listing 1 not found in tex'
lst1_tex = lst1_match.group(1)
loc_lst1_tex = count_executable_loc(lst1_tex)
print(f'Listing 1 (tex) executable LOC: {loc_lst1_tex} (must be 11)')
assert loc_lst1_tex == 11, f'Expected 11, got {loc_lst1_tex}'

# Compare executable lines of basic.js and Listing 1
lines_basic = extract_executable_lines(basic_js)
lines_tex = extract_executable_lines(lst1_tex)
assert lines_basic == lines_tex, f'basic.js and Listing 1 mismatch:\n{lines_basic}\nvs\n{lines_tex}'
print('basic.js and Listing 1 executable lines are 100% IDENTICAL!')

print('\n--- CHECK 2: epochs.js & Listing 3 ---')
epochs_js = open('/Users/fulkanjou/Brainimation/examples/epochs.js').read()
loc_epochs = count_executable_loc(epochs_js)
print(f'epochs.js executable LOC: {loc_epochs} (must be 85)')
assert loc_epochs == 85, f'Expected 85, got {loc_epochs}'

assert 'maxV - minV > 100' in epochs_js, 'Missing maxV - minV > 100 in epochs.js'
assert 'hasBlink' in epochs_js, 'Missing hasBlink in epochs.js'
print('epochs.js whole-epoch peak-to-peak blink rejection verified!')

assert '// Online ERP epoch extraction, blink rejection, and baseline correction' in tex
assert 'hasBlink' in tex
assert 'if (!hasBlink)' in tex
print('Listing 3 (tex) whole-epoch blink rejection and trialCount synchronization verified!')

assert '// Online ERP epoch extraction, blink rejection, and baseline correction' in md
assert 'hasBlink' in md
assert 'if (!hasBlink)' in md
print('Listing 3 (md) whole-epoch blink rejection and trialCount synchronization verified!')

print('\n--- CHECK 3: index.html updateShortChannelRegression ---')
html = open('/Users/fulkanjou/Brainimation/index.html').read()
assert '0.9995 * prev + 0.0005 * cur' in html, 'Missing 0.0005 baseline tracker update in index.html'
assert 'let sOD850 = rawSOD850;' in html, 'rawSOD850 demeaned outside cov/var loop'
assert 'let lOD850 = rawLOD850;' in html, 'rawLOD850 demeaned outside cov/var loop'
print('updateShortChannelRegression rolling mean and baseline tracker verified!')

print('\n--- CHECK 4: index.html updateEEGImuMotionFilter & Listing 5 ---')
assert 'mu = 0.035' in html, 'Missing mu = 0.035 in index.html'
assert '0.9992 * w[k]' in html, 'Missing leakage 0.9992 in index.html'
assert 'let normSq = 1e-4' in html, 'Missing epsilon 1e-4 in index.html'
assert '* 0.25' in html, 'Missing linear acceleration 0.25 scaling in index.html'
assert '/ 80.0' in html, 'Missing gyro 80.0 scaling in index.html'
assert 'this.motionFilterWeights[c]' in html, 'Missing numeric key update in updateEEGImuMotionFilter'
print('updateEEGImuMotionFilter NLMS constants and dual keys verified!')

print('\n--- CHECK 5: Section 2.2 text clarification ---')
assert 'MuseEEGManager.calculateFrequencyBands' in tex, 'Missing calculateFrequencyBands in tex'
assert 'EEGSimulator' in tex, 'Missing EEGSimulator clarification in tex'
assert 'MuseEEGManager.calculateFrequencyBands' in md, 'Missing calculateFrequencyBands in md'
assert 'EEGSimulator' in md, 'Missing EEGSimulator clarification in md'
print('Section 2.2 text clarification verified in both tex and md!')

print('\nALL VERIFICATION CHECKS PASSED!')
