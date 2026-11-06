/**
 * @id neurotech2025EllaTSolarSystem
 * @title EEG Frequency Band Solar System (Ella Thorsen-Bell)
 * @category 2025 Neurotech Class Catalogue
 * @order 23
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Planetary orbit visualizer where five planets representing Delta, Theta, Alpha, Beta, and Gamma orbit a glowing sun.
 */
// Solar System Orbits - frequency bands 
let angle = 0 ; 
let stars = []; 
function setup() { 
colorMode( HSB , 360 , 100 , 100 ); 
// Create random stars 
for ( let i = 0 ; i < 300 ; i++) { 
stars.push({ 
x: random(-width, width), 
y: random(-height, height), 
size: random( 1 , 3 ), 
brightness: random( 60 , 100 ) 
}); 
} 
} 
function draw() { 
background( 240 , 50 , 5 , 0.2 ); 
// Draw star field 
noStroke(); 
for ( let s of stars) { 
fill( 60 , 10 , s.brightness, 0.6 ); 
ellipse(s.x, s.y, s.size); 
} 
translate(width/ 2 , height/ 2 ); 
//Focus threshold 
let isFocused = eegData.attention > 0.7 ; 
let bands = [ 
{ name: 'Delta' , value: eegData.delta, hue: 10 , sat: 40 , bright: 60 , radius: 50 }, 
{ name: 'Theta' , value: eegData.theta, hue: 30 , sat: 60 , bright: 70 , radius: 90 }, 
{ name: 'Alpha' , value: eegData.alpha, hue: 140 , sat: 50 , bright: 60 , radius: 130 }, 
{ name: 'Beta' , value: eegData.beta, hue: 200 , sat: 70 , bright: 20 , radius: 170 }, 
{ name: 'Gamma' , value: eegData.gamma, hue: 300 , sat: 50 , bright: 80 , radius: 210 } 
]; 
for ( let i = 0 ; i < bands.length; i++) { 
let band = bands[i]; 
let a = angle + (i * TWO_PI / bands.length); 
let r = band.radius; 
let size = 10 + band.value * 40 ;

let x = cos(a) * r; 
let y = sin(a) * r; 
//Add rings to Beta 
fill(band.hue, 70 , 90 , 0.8 ); 
noStroke(); 
ellipse(x, y, size); 
if (band.name === 'Beta' ) { 
noFill(); 
stroke(band.hue, 50 , 100 , 0.5 ); 
ellipse(x, y, size * 1.5 , size * 0.7 ); // Ring 
} 
// Draw orbit path 
noFill(); 
stroke(band.hue, 20 , 60 , 0.1 ); 
ellipse( 0 , 0 , r * 2 ); 
} 
// Draw sun in center 
fill( 50 , 80 , 100 , 1 ); 
ellipse( 0 , 0 , 45 ); 
for ( let i = 5 ; i > 0 ; i--) { 
let glowSize = 15 + i * 10 ; 
fill( 50 , 80 , 100 , 0.05 * i); 
noStroke(); 
ellipse( 0 , 0 , glowSize); 
} 
//Neurofeedback signals 
if (isFocused) { 
fill( 120 , 60 , 100 , 0.2 ); 
ellipse( 0 , 0 , 75 + sin(frameCount * 0.1 ) * 10 ); 
} else { 
if (!isFocused) { 
fill( 0 , 80 , 100 , 0.15 ); 
stroke( 0 , 80 , 100 , 0.1 + 0.1 * sin(frameCount * 0.3 )); 
ellipse( 0 , 0 , 80 + sin(frameCount * 0.3 ) * 6 ); 
} 
} 
angle += 0.02 * eegData.attention; 
}
