/**
 * @id neurotech2025GraceSOceanSky
 * @title Alpha Ocean Waves & Shifting Sky (Grace Shin)
 * @category 2025 Neurotech Class Catalogue
 * @order 27
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Serene ocean wave animation where Alpha power calms the waves and shifts the sky hue.
 */
// inspired by alpha wave visualization 
// creates different wave speed and smoothness based on the user's brain  state 
// by: Grace Shin 
let t = 0 ; 
function setup () { 
colorMode (HSB , 360 , 100 , 100 , 1 ) ; // set to hsb to easily control 
noStroke () ; 
} 
function draw () { 
// sky (gradient) - changes from teal to pink depending on theta  activity, where low theta makes sky cooler (bluish) and high theta makes  it look warmer (pinkish) to represent meditative state 
let skyHue = map (eegData . theta , 0 , 1 , 200 , 320 ) ; // teal to pink tones 
let skyBright = map (eegData . meditation , 0 , 1 , 25 , 85 ) ; // brightness  also increases with meditation level 
for ( let y = 0 ; y < height * 0.7 ; y ++ ) { 
let inter = map (y , 0 , height * 0.7 , 0 , 1 ) ; 
let hue = lerp (skyHue , skyHue + 40 , inter) ; 
let bright = lerp (skyBright , 25 , inter) ; 
stroke (hue , 40 , bright) ; 
line ( 0 , y , width , y) ; 
} 
// ocean waves 
fill (skyHue - 20 , 60 , 70 , 1 ) ; // base colour 
beginShape () ; 
for ( let x = 0 ; x <= width ; x += 10 ) { 
let nx = x * 0.01 ; 
let waveBase = height * 0.65 ; 
// shape of the waves differ based on brain waves 
let calmFactor = map (eegData . alpha , 0 , 1 , 1.2 , 0.5 ) ; // changes how  smooth or wavy the waves look, higher alpha = smoother waves

let turbulence = map (eegData . beta , 0 , 1 , 0.4 , 1.4 ) ; // adds random  motion based on beta activity (stress/alertness) 
let y = waveBase + 
sin (nx * 3 + t) * 40 * calmFactor * turbulence + // combine  sine waves to create natural wave pattern 
sin (nx * 1.3 + t * 0.6 ) * 25 * calmFactor ; 
vertex (x , y) ; 
} 
vertex (width , height) ; 
vertex ( 0 , height) ; 
endShape (CLOSE) ; 
// speed gets slower with calmness 
// waves slow down with calmness (higher alpha) 
let calmness = (eegData . alpha + eegData . meditation ) / 2 ; 
let baseSpeed = 0.02 ; 
let calmSpeed = map (calmness , 0 , 1 , 1.2 , 0.3 ) ; // 1.2x when stressed to  0.3x when calm 
t += baseSpeed * calmSpeed ; 
// for simulation / realtime data 
if ( ! eegData . connected ) { 
fill ( 0 , 0 , 100 , 0.9 ) ; 
textAlign (CENTER , CENTER) ; 
textSize ( 20 ) ; 
text ( " Connect your Muse headset or use 'Simulate Data' ", width / 2 , 
height / 2 - 10 ) ; 
textSize ( 16 ) ; 
fill ( 0 , 0 , 70 , 0.7 ) ; 
text ( " and observe how the waves slow when you relax ", width / 2 , 
height / 2 + 20 ) ; 
} 
}
