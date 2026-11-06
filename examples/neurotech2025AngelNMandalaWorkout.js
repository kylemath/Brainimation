/**
 * @id neurotech2025AngelNMandalaWorkout
 * @title StairMaster Neural Mandala (Angel Nwaka)
 * @category 2025 Neurotech Class Catalogue
 * @order 7
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * EEG-responsive geometric mandala designed to compare resting vs. post-StairMaster workout brainwave states.
 */
// Neural mandala 
let angle = 0 ; 
function setup() { 
colorMode( HSB , 589 , 10 , 100 , 1 ); 
noStroke(); 
} 
function draw() { 
background( 0 , 0 , 0 , 0.1 ); 
translate(width/ 2 , height/ 2 ); 
let layers = 75 ; 
let connectionThreshold = 0.5 + eegData.meditation * 0.5 ; 
// control density of connections 
for ( let layer = 0 ; layer < layers; layer++) { 
let radius = 0 + layer * 40 ; 
let points = 15 + layer * 3 ; 
for ( let i = 0 ; i < points; i++) { 
let a = angle + ( TWO_PI / points) * i; 
let x = cos(a) * radius; 
let y = sin(a) * radius; 
let hue = (angle * 60 + layer * 30 ) % 360 ; 
let brightness = 50 + eegData.attention * 40 ; 
let size = 3.75 + eegData.alpha * layer * 1.5 ; 
fill(hue, 80 , brightness, 0.7 ); 
noStroke(); 
ellipse(x, y, size); 
} 
} 
angle += eegData.meditation * 0.02 + 0.005 ; 
}
