/**
 * @id neurotech2025CaitlynAMindGarden
 * @title Five-Band EEG Mind Garden (Caitlyn Archibald)
 * @category 2025 Neurotech Class Catalogue
 * @order 18
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Botanical visualizer featuring five distinct flower species (tulip, daisy, lotus, sunflower, rose) that grow and sway with Delta, Theta, Alpha, Beta, and Gamma.
 */
// Mind Garden Visualization 🌿 
// Elegant Natural Flower Brainwave Display 
// Flowers grow and animate based on EEG (simulated if no headset connected) 
// ----------------------------- GLOBALS ----------------------------- // 
let flowers = []; 
let time = 0 ; 
// EEG data structure 
let fallbackEegData = { 
delta: 0.2 , 
theta: 0.3 , 
alpha: 0.4 , 
beta: 0.5 , 
gamma: 0.6 , 
attention: 0.5 , 
meditation: 0.4 , 
connected: false 
}; 
// ----------------------------- SETUP ----------------------------- // 
function setup() { 
colorMode( HSB , 360 , 100 , 100 , 1 ); 
textFont( 'Georgia' ); // Elegant serif font 
textAlign( CENTER , CENTER ); 
textSize( 16 ); 
// Meaningful brainwave order 
let waveOrder = [ 'delta' , 'theta' , 'alpha' , 'beta' , 'gamma' ]; 
let spacing = width / (waveOrder.length + 1 ); 
for ( let i = 0 ; i < waveOrder.length; i++) { 
flowers.push({ 
x: spacing * (i + 1 ), 
y: height * 0.55 , 
baseSize: random( 35 , 50 ), 
currentSize: 0 , 
type: waveOrder[i] 
}); 
} 
} 
// ----------------------------- DRAW MAIN ----------------------------- //

function draw() { 
simulateEEG(); 
time += 0.01 ; 
// Background soft light pink 
background( 200 , 10 , 10 ); // pale rose 
// Draw each flower 
flowers.forEach(drawFlower); 
// Draw labels 
drawLabels(); 
// Connection prompt 
if (!eegData.connected) { 
fill( 0 , 0 , 30 , 0.7 ); 
textSize( 18 ); 
text( "Connect your Muse headset or use simulated data" , width / 2 , height * 0.1 ); 
} 
} 
// ----------------------------- FLOWERS ----------------------------- // 
function drawFlower(flower) { 
let brainValue = eegData[flower.type]; 
flower.currentSize = lerp(flower.currentSize, flower.baseSize + brainValue * 80 , 
0.02 ); 
// Stem 
stroke( 110 , 60 , 40 ); 
strokeWeight( 5 ); 
line(flower.x, height, flower.x, flower.y + 30 ); 
push(); 
translate(flower.x, flower.y); 
noStroke(); 
switch (flower.type) { 
case 'beta' : drawSunflower(flower); break ; 
case 'alpha' : drawDaisy(flower); break ; 
case 'theta' : drawOrchid(flower); break ; 
case 'delta' : drawCherryBlossom(flower); break ; 
case 'gamma' : drawChrysanthemum(flower); break ; 
} 
pop(); 
} 
// ----------------------------- FLOWER TYPES ----------------------------- //

function drawSunflower(f) { fill( 45 , 90 , 90 ); for ( let i = 0 ; i < 20 ; i++) { rotate( TWO_PI / 20 ); ellipse(f.currentSize * 0.8 , 0 , f.currentSize * 0.85 , f.currentSize * 0.3 ); } fill( 30 , 60 , 40 ); ellipse( 0 , 0 , f.currentSize * 1.1 ); } function drawDaisy(f) { fill( 0 , 0 , 100 ); for ( let i = 0 ; i < 12 ; i++) { rotate( TWO_PI / 12 ); ellipse(f.currentSize * 0.8 , 0 , f.currentSize * 0.8 , f.currentSize * 0.35 ); } fill( 55 , 80 , 90 ); ellipse( 0 , 0 , f.currentSize * 0.8 ); } function drawOrchid(f) { push(); translate( 0 , 50 ); /* sits directly on stem */ noStroke(); let petHeight = f.currentSize * 1.2 ; let petWidth = f.currentSize * 0.6 ; /* Central petal */ fill( 290 , 60 , 80 ); beginShape(); vertex( 0 , 0 ); bezierVertex(-petWidth * 0.3 , -petHeight * 0.5 , 
petWidth * 0.2 , -petHeight,
0 , -petHeight); bezierVertex(petWidth * 0.2 , -petHeight, petWidth * 0.3 , -petHeight * 0.5 , 0 , 0 ); endShape( CLOSE ); /* Left petal */ fill( 295 , 55 , 85 ); beginShape(); vertex( 0 , 0 ); bezierVertex(-petWidth * 0.6 , -petHeight * 0.4 , 
petWidth * 0.4 , -petHeight * 0.8 ,
0 , -petHeight * 0.8 );

bezierVertex( 0 , -petHeight * 0.8 , 
petWidth * 0.2 , -petHeight * 0.8 ,
0 , 0 ); endShape( CLOSE ); /* Right petal */ fill( 285 , 55 , 85 ); beginShape(); vertex( 0 , 0 ); bezierVertex(petWidth * 0.6 , -petHeight * 0.4 , petWidth * 0.4 , -petHeight * 0.8 , 0 , -petHeight * 0.8 ); bezierVertex( 0 , -petHeight * 0.8 , petWidth * 0.2 , -petHeight * 0.4 , 0 , 0 ); endShape( CLOSE ); /* Center lip detail */ fill( 300 , 80 , 90 ); ellipse( 0 , -petHeight * 0.9 , petWidth * 0.15 , petHeight * 0.15 ); pop(); } function drawCherryBlossom(f) { fill( 350 , 40 , 100 ); for ( let i = 0 ; i < 5 ; i++) { rotate( TWO_PI / 5 ); ellipse(f.currentSize * 0.8 , 0.2 , f.currentSize * 1.5 , f.currentSize * 0.5 ); } fill( 45 , 80 , 90 ); ellipse( 0 , 0 , f.currentSize * 0.7 ); } function drawChrysanthemum(f) { for ( let layer = 0 ; layer < 3 ; layer++) { fill( 200 , 100 , 90 , 1 - layer * 0.3 ); for ( let i = 0 ; i < 22 ; i++) { rotate( TWO_PI / 22 ); ellipse(f.currentSize * ( 0.4 + layer * 0.3 ), 0 , f.currentSize * 0.4 , f.currentSize * 0.2 ); } } } 
// ----------------------------- LABELS ----------------------------- //
function drawLabels() {

fill( 100 , 10 , 100 ); // White 
textSize( 16 ); 
flowers.forEach(f => { 
let labelY = f.y + f.currentSize + 50 ; 
let word = "" ; 
let description = "" ; 
if (f.type === "delta" ) { word = "delta" ; description = " sleep + restoration" ; } 
if (f.type === "theta" ) { word = "theta" ; description = "meditate + creativity" ; } 
if (f.type === "alpha" ) { word = "alpha" ; description = "calm flow state" ; } 
if (f.type === "beta" ) { word = "beta" ; description = "focus + concentration" ; } 
if (f.type === "gamma" ) { word = "gamma" ; description = "cognition + info-process" ; } 
text(word, f.x, labelY); 
text(description, f.x, labelY + 20 ); 
}); 
} 
// ----------------------------- EEG SIMULATION ----------------------------- // 
function simulateEEG() {
  // Uses BrainImation live or simulated eegData directly
}
