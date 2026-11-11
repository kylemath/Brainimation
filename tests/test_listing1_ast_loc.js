/**
 * Empirical Verification Harness: Listing 1 & examples/basic.js Parity
 * Challenger: Challenger 1 (Milestone 1 / Requirement R1)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');
const acorn = require('acorn');

console.log('================================================================');
console.log('CHALLENGER 1: Empirical Verification of basic.js & Listing 1');
console.log('================================================================\n');

// 1. Load files
const basicJsPath = '/Users/fulkanjou/Brainimation/examples/basic.js';
const texPath = '/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/paper2_brainimation.tex';
const mdPath = '/Users/fulkanjou/EEGEDUPaper/paper2_brainimation/manuscript.md';

assert(fs.existsSync(basicJsPath), `basic.js not found at ${basicJsPath}`);
assert(fs.existsSync(texPath), `paper2_brainimation.tex not found at ${texPath}`);
assert(fs.existsSync(mdPath), `manuscript.md not found at ${mdPath}`);

const basicJsContent = fs.readFileSync(basicJsPath, 'utf8');
const texContent = fs.readFileSync(texPath, 'utf8');
const mdContent = fs.readFileSync(mdPath, 'utf8');

// 2. Extract Listing 1 from LaTeX and Markdown
// In TeX: \begin{lstlisting}\nfunction setup() { ... }\n\end{lstlisting}
const texListingMatch = texContent.match(/\\begin\{lstlisting\}([\s\S]*?function setup[\s\S]*?)\\end\{lstlisting\}/);
assert(texListingMatch, 'Failed to extract Listing 1 from paper2_brainimation.tex');
const texListingCode = texListingMatch[1].trim();

// In MD: ```javascript\nfunction setup() { ... }\n```
const mdListingMatch = mdContent.match(/```javascript\s*(function setup[\s\S]*?)\s*```/);
assert(mdListingMatch, 'Failed to extract Listing 1 from manuscript.md');
const mdListingCode = mdListingMatch[1].trim();

console.log('[STEP 1] Code listings extracted successfully.');
console.log('--- Listing 1 from paper2_brainimation.tex ---');
console.log(texListingCode);
console.log('-----------------------------------------------\n');

// 3. Executable LOC Definition and Counting
function extractExecutableLines(code) {
  const lines = code.split(/\r?\n/).map(l => l.trim());
  return lines.filter(l => {
    return l.length > 0 &&
      !l.startsWith('//') &&
      !l.startsWith('/*') &&
      !l.startsWith('*') &&
      !l.startsWith('*/');
  });
}

const basicExecLines = extractExecutableLines(basicJsContent);
const texExecLines = extractExecutableLines(texListingCode);
const mdExecLines = extractExecutableLines(mdListingCode);

console.log(`[STEP 2] Executable LOC Counts:`);
console.log(`  - examples/basic.js:            ${basicExecLines.length} LOC`);
console.log(`  - Listing 1 (LaTeX .tex):       ${texExecLines.length} LOC`);
console.log(`  - Listing 1 (Markdown .md):     ${mdExecLines.length} LOC`);

assert.strictEqual(basicExecLines.length, 11, `examples/basic.js must be exactly 11 executable LOC, got ${basicExecLines.length}`);
assert.strictEqual(texExecLines.length, 11, `Listing 1 in tex must be exactly 11 executable LOC, got ${texExecLines.length}`);
assert.strictEqual(mdExecLines.length, 11, `Listing 1 in md must be exactly 11 executable LOC, got ${mdExecLines.length}`);

// Check verbatim line equivalence
for (let i = 0; i < 11; i++) {
  assert.strictEqual(basicExecLines[i], texExecLines[i], `Line mismatch at index ${i}: "${basicExecLines[i]}" vs "${texExecLines[i]}"`);
  assert.strictEqual(basicExecLines[i], mdExecLines[i], `Line mismatch at index ${i}: "${basicExecLines[i]}" vs "${mdExecLines[i]}"`);
}
console.log('✓ All 11 executable lines are verbatim identical across all three sources!\n');

// 4. AST Parsing and Structural Comparison
function cleanAst(node) {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(cleanAst);
  const out = {};
  for (const k of Object.keys(node)) {
    if (k === 'start' || k === 'end' || k === 'loc' || k === 'range' || k === 'raw') continue;
    out[k] = cleanAst(node[k]);
  }
  return out;
}

const astBasic = cleanAst(acorn.parse(basicExecLines.join('\n'), { ecmaVersion: 2020 }));
const astTex = cleanAst(acorn.parse(texListingCode, { ecmaVersion: 2020 }));
const astMd = cleanAst(acorn.parse(mdListingCode, { ecmaVersion: 2020 }));

assert.deepStrictEqual(astBasic, astTex, 'AST of basic.js does not match AST of Listing 1 (tex)!');
assert.deepStrictEqual(astBasic, astMd, 'AST of basic.js does not match AST of Listing 1 (md)!');
console.log('✓ Acorn AST trees are 100% isomorphic and structurally identical!\n');

// 5. AST Semantic Validation: Property Mappings & Call Structure
console.log('[STEP 3] AST Semantic Walk: Validating Property Mappings');
const setupFn = astBasic.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'setup');
const drawFn = astBasic.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'draw');

assert(setupFn, 'Missing function setup() in AST');
assert(drawFn, 'Missing function draw() in AST');

// setup: colorMode(HSB, 360, 100, 100)
assert.strictEqual(setupFn.body.body.length, 1);
const setupCall = setupFn.body.body[0].expression;
assert.strictEqual(setupCall.callee.name, 'colorMode');
assert.strictEqual(setupCall.arguments[0].name, 'HSB');
assert.strictEqual(setupCall.arguments[1].value, 360);
assert.strictEqual(setupCall.arguments[2].value, 100);
assert.strictEqual(setupCall.arguments[3].value, 100);
console.log('  ✓ setup() calls colorMode(HSB, 360, 100, 100)');

// draw statements
const drawStatements = drawFn.body.body;
assert.strictEqual(drawStatements.length, 6, `draw() should have 6 statements, found ${drawStatements.length}`);

// 1. background(0, 0, 10)
assert.strictEqual(drawStatements[0].expression.callee.name, 'background');

// 2. let size = map(eegData.alpha, 0, 1, 50, 300)
const sizeDecl = drawStatements[1].declarations[0];
assert.strictEqual(sizeDecl.id.name, 'size');
assert.strictEqual(sizeDecl.init.callee.name, 'map');
assert.strictEqual(sizeDecl.init.arguments[0].object.name, 'eegData');
assert.strictEqual(sizeDecl.init.arguments[0].property.name, 'alpha');
assert.strictEqual(sizeDecl.init.arguments[1].value, 0);
assert.strictEqual(sizeDecl.init.arguments[2].value, 1);
assert.strictEqual(sizeDecl.init.arguments[3].value, 50);
assert.strictEqual(sizeDecl.init.arguments[4].value, 300);
console.log('  ✓ let size = map(eegData.alpha, 0, 1, 50, 300) verified (alpha -> size)');

// 3. let hue = map(eegData.attention, 0, 1, 180, 360)
const hueDecl = drawStatements[2].declarations[0];
assert.strictEqual(hueDecl.id.name, 'hue');
assert.strictEqual(hueDecl.init.callee.name, 'map');
assert.strictEqual(hueDecl.init.arguments[0].object.name, 'eegData');
assert.strictEqual(hueDecl.init.arguments[0].property.name, 'attention');
assert.strictEqual(hueDecl.init.arguments[1].value, 0);
assert.strictEqual(hueDecl.init.arguments[2].value, 1);
assert.strictEqual(hueDecl.init.arguments[3].value, 180);
assert.strictEqual(hueDecl.init.arguments[4].value, 360);
console.log('  ✓ let hue = map(eegData.attention, 0, 1, 180, 360) verified (attention -> hue)');

// 4. fill(hue, 80, 90)
assert.strictEqual(drawStatements[3].expression.callee.name, 'fill');
assert.strictEqual(drawStatements[3].expression.arguments[0].name, 'hue');

// 5. noStroke()
assert.strictEqual(drawStatements[4].expression.callee.name, 'noStroke');
console.log('  ✓ noStroke() call confirmed');

// 6. ellipse(width/2, height/2, size, size)
assert.strictEqual(drawStatements[5].expression.callee.name, 'ellipse');
assert.strictEqual(drawStatements[5].expression.arguments[2].name, 'size');
assert.strictEqual(drawStatements[5].expression.arguments[3].name, 'size');
console.log('  ✓ ellipse(width/2, height/2, size, size) confirmed');

// 6. Empirical Behavioral Execution via Node.js VM
console.log('\n[STEP 4] Empirical VM Simulation: Verifying Runtime Behavior');
const recordedCalls = [];
const mockSandbox = {
  HSB: 'HSB',
  width: 800,
  height: 600,
  colorMode: (...args) => recordedCalls.push({ fn: 'colorMode', args }),
  background: (...args) => recordedCalls.push({ fn: 'background', args }),
  fill: (...args) => recordedCalls.push({ fn: 'fill', args }),
  noStroke: () => recordedCalls.push({ fn: 'noStroke' }),
  ellipse: (...args) => recordedCalls.push({ fn: 'ellipse', args }),
  map: (val, inMin, inMax, outMin, outMax) => outMin + (outMax - outMin) * ((val - inMin) / (inMax - inMin)),
  eegData: { alpha: 0, attention: 0 }
};

const context = vm.createContext(mockSandbox);
vm.runInContext(basicExecLines.join('\n'), context);

// Test setup
context.setup();
assert.strictEqual(recordedCalls[0].fn, 'colorMode');
assert.deepStrictEqual(recordedCalls[0].args, ['HSB', 360, 100, 100]);

// Test draw sweep
const testPoints = [
  { alpha: 0.0, attention: 0.0, expectedSize: 50,  expectedHue: 180 },
  { alpha: 0.5, attention: 0.5, expectedSize: 175, expectedHue: 270 },
  { alpha: 1.0, attention: 1.0, expectedSize: 300, expectedHue: 360 },
  { alpha: 0.2, attention: 0.8, expectedSize: 100, expectedHue: 324 },
];

for (const pt of testPoints) {
  recordedCalls.length = 0;
  context.eegData.alpha = pt.alpha;
  context.eegData.attention = pt.attention;
  context.draw();

  const bgCall = recordedCalls.find(c => c.fn === 'background');
  const fillCall = recordedCalls.find(c => c.fn === 'fill');
  const noStrokeCall = recordedCalls.find(c => c.fn === 'noStroke');
  const ellipseCall = recordedCalls.find(c => c.fn === 'ellipse');

  assert(bgCall, 'Missing background call');
  assert(noStrokeCall, 'Missing noStroke call');
  assert.strictEqual(fillCall.args[0], pt.expectedHue, `Expected hue ${pt.expectedHue}, got ${fillCall.args[0]}`);
  assert.strictEqual(ellipseCall.args[2], pt.expectedSize, `Expected size ${pt.expectedSize}, got ${ellipseCall.args[2]}`);
  assert.strictEqual(ellipseCall.args[3], pt.expectedSize, `Expected size ${pt.expectedSize}, got ${ellipseCall.args[3]}`);
  console.log(`  ✓ Point (alpha=${pt.alpha}, attention=${pt.attention}) -> size=${pt.expectedSize}, hue=${pt.expectedHue}`);
}

console.log('\n================================================================');
console.log('VERDICT: basic.js & Listing 1 PASS ALL EMPIRICAL AND AST AUDITS');
console.log('================================================================');
