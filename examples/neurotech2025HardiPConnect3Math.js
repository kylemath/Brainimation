/**
 * @id neurotech2025HardiPConnect3Math
 * @title Connect-3 Match Game & Alpha/Beta Tracker (Hardi Patel)
 * @category 2025 Neurotech Class Catalogue
 * @order 36
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Interactive match-3 puzzle grid paired with mental math prompts and a live Alpha/Beta brainwave tracker.
 */
// --- Match-3 game with BrainImation EEG tracker (alpha/beta) & proper vertical  falling --- 
var rows = 8; 
var cols = 8; 
var size = 40; 
var grid = []; 
var selected = null; 
var cursor = { row: 0, col: 0 }; 
var score = 0; 
// Neurofeedback input (0-1), updated externally 
var alphaLevel = 0; 
var betaLevel = 0; 
// Smooth attention display (used for internal smoothing if needed) 
var displayedAttention = 0; 
// Flags to prevent continuous triggering 
var alphaTriggered = false; 
var betaTriggered = false; 
// Math question 
var mathQuestion = {}; 
var mathAnswerInput = ""; 
// Falling tiles tracker 
var falling = []; // {row, col, fromY, toY, color} 
// --- Random helpers --- 
function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; } 
function randomPiece() { return randInt(1,5); } 
// --- Initialize board --- 
for (var r=0;r<rows;r++){ 
grid[r]=[]; 
for(var c=0;c<cols;c++) grid[r][c]=randomPiece(); 
} 
// --- Draw loop --- 
function draw() { 
background(255); // white background

// Score display 
fill(0); 
textSize(24); 
textAlign(CENTER); 
text("Score: "+score,width/2,30); 
// EEG Tracker (exact stable version) 
drawEEGTracker(); 
// Grid offset 
var offsetX = (width - cols*size)/2 + 60; 
var offsetY = (height - rows*size)/2; 
// Draw grid 
for(var r=0;r<rows;r++){ 
for(var c=0;c<cols;c++){ 
// Check if tile is falling 
var fallTile = falling.find(f => f.row === r && f.col === c); 
if(fallTile){ 
drawPiece(fallTile.color, c*size+offsetX, fallTile.fromY); 
// Update fall position 
fallTile.fromY += (fallTile.toY - fallTile.fromY) * 0.2; // smooth speed 
if(abs(fallTile.toY - fallTile.fromY) < 1){ 
grid[r][c] = fallTile.color; 
falling = falling.filter(f => f !== fallTile); 
} 
} else { 
drawPiece(grid[r][c], c*size+offsetX, r*size+offsetY); 
} 
} 
} 
// Highlight selected 
if(selected!==null){ 
noFill(); 
stroke("black"); 
strokeWeight(3); 
rect(selected.col*size+offsetX, selected.row*size+offsetY, size, size); 
strokeWeight(1); 
noStroke(); 
}

// Highlight cursor 
noFill(); 
stroke("orange"); 
strokeWeight(3); 
rect(cursor.col*size+offsetX, cursor.row*size+offsetY, size, size); 
strokeWeight(1); 
noStroke(); 
// Draw math question at bottom 
fill(0); 
textSize(20); 
textAlign(CENTER); 
text("Solve: "+mathQuestion.text+" = "+mathAnswerInput, width/2, height-40); 
// --- Neurofeedback effects --- 
updateNeurofeedback(); 
} 
// --- Draw a tile --- 
function drawPiece(type,x,y){ 
if(type===1) fill("red"); 
else if(type===2) fill("yellow"); 
else if(type===3) fill("blue"); 
else if(type===4) fill("green"); 
else if(type===5) fill("purple"); 
else fill("white"); 
rect(x,y,size,size); 
} 
// --- Mouse click selection --- 
function mouseClicked(){ 
var offsetX = (width - cols*size)/2 + 60; 
var offsetY = (height - rows*size)/2; 
var c = Math.floor((mouseX - offsetX)/size); 
var r = Math.floor((mouseY - offsetY)/size); 
if(c<0||c>=cols||r<0||r>=rows) return; 
if(selected===null) selected={row:r,col:c}; 
else { trySwap(selected,{row:r,col:c}); selected=null; } 
} 
// --- Keyboard controls ---

function keyPressed(){ 
if(keyCode===LEFT_ARROW) cursor.col=max(0,cursor.col-1); 
if(keyCode===RIGHT_ARROW) cursor.col=min(cols-1,cursor.col+1); 
if(keyCode===UP_ARROW) cursor.row=max(0,cursor.row-1); 
if(keyCode===DOWN_ARROW) cursor.row=min(rows-1,cursor.row+1); 
if(keyCode===32||keyCode===ENTER){ 
if(selected===null) selected={row:cursor.row,col:cursor.col}; 
else { trySwap(selected,{row:cursor.row,col:cursor.col}); selected=null; } 
} 
} 
// Keyboard input for math answer 
function keyTyped(){ 
if("0123456789.".includes(key)) mathAnswerInput += key; 
if(keyCode===8 || key==='Backspace') mathAnswerInput = mathAnswerInput.slice(0,-1); 
if(keyCode===13 || key==='Enter'){ // submit 
checkMathAnswer(); 
mathAnswerInput=""; 
generateMathQuestion(); 
} 
} 
// --- Swap & match logic --- 
function trySwap(a,b){ 
if(!areAdjacent(a,b)) return; 
var temp=grid[a.row][a.col]; 
grid[a.row][a.col]=grid[b.row][b.col]; 
grid[b.row][b.col]=temp; 
var matches=findMatches(); 
if(matches.length>0){ 
while(matches.length > 0){ 
removeMatches(matches); 
applyGravitySmooth(); // vertical only 
fillTopRowHoles(); 
matches=findMatches(); 
} 
} else { 
// Swap back if no matches 
var t2=grid[a.row][a.col]; 
grid[a.row][a.col]=grid[b.row][b.col]; 
grid[b.row][b.col]=t2; 
}

} 
function areAdjacent(a,b){ return Math.abs(a.row-b.row)+Math.abs(a.col-b.col)===1; } 
function findMatches(){ 
var matches=[]; 
for(var r=0;r<rows;r++) for(var c=0;c<cols-2;c++) if(grid[r][c]!==0 && 
grid[r][c]===grid[r][c+1] && grid[r][c]===grid[r][c+2]){ matches.push({r:r,c:c}); 
matches.push({r:r,c:c+1}); matches.push({r:r,c:c+2}); } 
for(var c=0;c<cols;c++) for(var r=0;r<rows-2;r++) if(grid[r][c]!==0 && 
grid[r][c]===grid[r+1][c] && grid[r][c]===grid[r+2][c]){ matches.push({r:r,c:c}); 
matches.push({r:r+1,c:c}); matches.push({r:r+2,c:c}); } 
return matches; 
} 
function removeMatches(list){ 
for(var i=0;i<list.length;i++){ 
grid[list[i].r][list[i].c]=0; 
score += 10; 
} 
} 
// --- Smooth vertical gravity & top row fill --- 
function applyGravitySmooth(){ 
for(let c=0;c<cols;c++){ 
for(let r=rows-1;r>=0;r--){ 
if(grid[r][c]===0){ 
let rr=r-1; 
while(rr>=0 && grid[rr][c]===0) rr--; 
if(rr>=0){ 
// Vertical fall only 
falling.push({row:r, col:c, fromY: rr*size + (height - rows*size)/2, toY: 
r*size + (height - rows*size)/2, color: grid[rr][c]}); 
grid[r][c]=grid[rr][c]; 
grid[rr][c]=0; 
} 
} 
} 
} 
} 
// Fill only top-most empty rows 
function fillTopRowHoles(){ 
for(let c=0;c<cols;c++){ 
for(let r=0;r<rows;r++){

if(grid[r][c]===0){ 
let fy = (r-1>=0 ? (r-1)*size + (height - rows*size)/2 : (height - 
rows*size)/2 - size); 
falling.push({row:r, col:c, fromY: fy, toY:r*size + (height - rows*size)/2, 
color: randomPiece()}); 
grid[r][c] = falling[falling.length-1].color; 
} else break; // stop at first non-empty tile 
} 
} 
} 
// --- Math question / scoring --- 
function generateMathQuestion(){ 
var ops=["+","-","*","/"]; 
var op=ops[randInt(0,ops.length-1)]; 
var a=randInt(1,10); 
var b=randInt(1,10); 
if(op=="/") a=a*b; 
var ans; 
if(op=="+") ans=a+b; 
if(op=="-") ans=a-b; 
if(op=="*") ans=a*b; 
if(op=="/") ans=a/b; 
mathQuestion={text:a+" "+op+" "+b, answer:ans}; 
} 
function checkMathAnswer(){ 
if(parseFloat(mathAnswerInput)===mathQuestion.answer){ 
correctMathAnswer(); 
} else { 
score = Math.max(0, score-5); 
} 
} 
// --- Neurofeedback hooks --- 
function updateNeurofeedback(){ 
if(alphaLevel > 0.5 && !alphaTriggered){ 
autoClearRow(); 
score += 5; 
alphaTriggered = true; 
} 
if(alphaLevel <= 0.5){

alphaTriggered = false; 
} 
if(betaLevel > 0.5 && !betaTriggered){ 
accelerateFalling(); 
betaTriggered = true; 
} 
if(betaLevel <= 0.5){ 
betaTriggered = false; 
} 
} 
// --- Example tile effect functions --- 
function correctMathAnswer(){ 
var r = randInt(0, rows-1); 
var startCol = randInt(0, cols-3); 
var value = randInt(1,5); 
for(var i=0;i<3;i++){ 
grid[r][startCol+i] = value; 
} 
var matches = findMatches(); 
while(matches.length>0){ 
removeMatches(matches); 
applyGravitySmooth(); 
fillTopRowHoles(); 
matches=findMatches(); 
} 
} 
// Placeholder functions for neuro effects 
function autoClearRow(){ 
var r = randInt(0, rows-1); 
for(var c=0;c<cols;c++) grid[r][c]=randomPiece(); 
applyGravitySmooth(); 
fillTopRowHoles(); 
} 
function accelerateFalling(){ 
// Optional speed-up logic 
} 
// --- BrainImation-compatible EEG tracker with alpha/beta bars and outlines ---

function drawEEGTracker() { 
colorMode(HSB, 360, 100, 100); 
background(255, 255, 255, 0); // transparent layer over grid 
// --- Update from EEG (real or simulated) --- 
if (typeof eegData !== 'undefined') { 
alphaLevel = eegData.alpha || 0; 
betaLevel = eegData.beta || 0; 
} else { 
// Simulate for testing 
alphaLevel = (sin(frameCount * 0.02) + 1) / 2; 
betaLevel = (cos(frameCount * 0.03) + 1) / 2; 
} 
let barWidth = 30; 
let barHeight = height * 0.6; 
let yTop = (height - barHeight) / 2; 
// --- Draw alpha bar outline --- 
let xAlpha = 50; 
noFill(); 
stroke(200, 80, 90); 
strokeWeight(2); 
rect(xAlpha, yTop, barWidth, barHeight); 
// --- Draw alpha fill --- 
let alphaFill = barHeight * alphaLevel; 
if (alphaLevel > 0.5) fill(200, 100, 100); 
else fill(200, 80, 90); 
noStroke(); 
rect(xAlpha, yTop + (barHeight - alphaFill), barWidth, alphaFill); 
// --- Draw beta bar outline --- 
let xBeta = 120; 
noFill(); 
stroke(50, 80, 90); 
strokeWeight(2); 
rect(xBeta, yTop, barWidth, barHeight); 
// --- Draw beta fill --- 
let betaFill = barHeight * betaLevel; 
if (betaLevel > 0.5) fill(50, 100, 100);

else fill(50, 80, 90); 
noStroke(); 
rect(xBeta, yTop + (barHeight - betaFill), barWidth, betaFill); 
// --- Labels --- 
fill(0, 0, 100); 
textSize(14); 
textAlign(LEFT, CENTER); 
text("Alpha", xAlpha, yTop - 20); 
text("Beta", xBeta, yTop - 20); 
} 
// --- Initialize --- 
generateMathQuestion();

function setup() {
  createCanvas(width, height);
  grid = [];
  for (var r = 0; r < rows; r++) {
    grid[r] = [];
    for (var c = 0; c < cols; c++) grid[r][c] = randomPiece();
  }
  generateMathQuestion();
}
