/**
 * @id brainBeats
 * @title Brain Beats (Sound Test)
 * @category Sound & Music
 * @order 33
 *
 * Auto-split from index.html.
 */
// Brain Beats - Simple sound test with EEG
let osc;
let isPlaying = false;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Create oscillator for brain-controlled tones
  osc = new p5.Oscillator('sine');
  osc.amp(0); // Start silent
  osc.start();
  
  console.log('🔊 === Brain Beats Sound Test ===');
  console.log('✅ Oscillator created successfully');
  console.log('👆 CLICK ANYWHERE ON THE CANVAS to enable sound');
  console.log('📊 Alpha waves control the tone frequency (200-800 Hz)');
  console.log('📊 Beta waves control the volume');
  console.log('');
  console.log('💡 TIP: If you don\'t hear anything after clicking:');
  console.log('   1. Check your computer volume');
  console.log('   2. Click the "Test Sound" button in the header');
  console.log('   3. Make sure you clicked inside the black canvas area');
}

function draw() {
  background(0, 0, 10);
  
  // Visual feedback
  let visualAlpha = eegData.alpha;
  let visualBeta = eegData.beta;
  
  // Draw sound wave visualization
  translate(width/2, height/2);
  
  // Outer circle - attention level (pulsing)
  let outerSize = 100 + eegData.attention * 200;
  noFill();
  stroke(180, 70, 90, 0.8);
  strokeWeight(3);
  ellipse(0, 0, outerSize);
  
  // Inner circle - frequency indicator
  let freq = map(visualAlpha, 0, 1, 200, 800);
  let innerSize = 50 + visualAlpha * 150;
  let hue = map(visualAlpha, 0, 1, 200, 320);
  
  fill(hue, 80, 90, 0.5);
  noStroke();
  ellipse(0, 0, innerSize);
  
  // Volume indicator (small circle)
  let volumeSize = 10 + visualBeta * 30;
  fill(60, 80, 90, 0.8);
  ellipse(0, 0, volumeSize);
  
  // Update sound if playing
  if (isPlaying) {
    osc.freq(freq);
    let volume = map(visualBeta, 0, 1, 0, 0.3);
    osc.amp(volume, 0.1);
  }
  
  // Instructions
  resetMatrix();
  fill(0, 0, 100);
  textAlign(CENTER, TOP);
  textSize(18);
  text(isPlaying ? "🔊 Sound is ON" : "🔇 CLICK HERE to start sound", width/2, 20);
  
  textSize(14);
  text("Alpha controls frequency: " + freq.toFixed(0) + " Hz", width/2, 50);
  text("Beta controls volume: " + (visualBeta * 100).toFixed(0) + "%", width/2, 70);
  
  // Add a pulsing border when not playing to indicate clickability
  if (!isPlaying) {
    noFill();
    stroke(255, 100, 100, sin(frameCount * 0.1) * 0.3 + 0.5);
    strokeWeight(4);
    rect(5, 5, width - 10, height - 10);
  }
  
  if (!eegData.connected) {
    textSize(14);
    fill(0, 0, 70);
    text("⚠️ Connect Muse or use Simulate Data for brain control", width/2, height - 30);
  }
}

function mousePressed() {
  console.log('👆 Canvas clicked!');
  
  // User interaction required to start audio
  console.log('Attempting to start audio context...');
  userStartAudio();
  
  // Toggle sound
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    console.log('🔊 Sound enabled!');
    console.log('You should hear a tone that changes with your brain waves');
  } else {
    osc.amp(0, 0.1);
    console.log('🔇 Sound disabled');
  }
}
