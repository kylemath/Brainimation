/**
 * @id brainSynth
 * @title Brain Synthesizer
 * @category Sound & Music
 * @order 35
 *
 * Auto-split from index.html.
 */
// Brain Synthesizer - Full control over sound parameters
let carrier;
let modulator;
let analyzer;
let isPlaying = false;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  console.log('🎹 === Brain Synthesizer (FM Synthesis) ===');
  console.log('Creating carrier oscillator...');
  
  // Create FM synthesis
  carrier = new p5.Oscillator('sine');
  modulator = new p5.Oscillator('sine');
  console.log('✅ Oscillators created');
  
  // Modulate carrier frequency with modulator
  modulator.disconnect();
  carrier.amp(0);
  modulator.amp(0);
  
  carrier.start();
  modulator.start();
  modulator.disconnect();
  carrier.freq(modulator);
  console.log('✅ FM synthesis configured');
  
  // Analyzer for visualization
  analyzer = new p5.FFT();
  analyzer.setInput(carrier);
  console.log('✅ Audio analyzer ready');
  
  console.log('');
  console.log('👆 CLICK THE CANVAS to start the synthesizer');
  console.log('📊 Brain wave control mapping:');
  console.log('   - Alpha: carrier frequency (pitch)');
  console.log('   - Beta: modulation frequency (timbre)');
  console.log('   - Theta: modulation depth (intensity)');
  console.log('   - Attention: overall volume');
  console.log('');
  console.log('💡 This is FM (Frequency Modulation) synthesis');
  console.log('   The modulator oscillator modulates the carrier frequency');
  console.log('   creating complex harmonic timbres');
}

function draw() {
  background(0, 0, 5);
  
  if (isPlaying) {
    // Map brain waves to synthesis parameters
    
    // Alpha controls carrier frequency (200-800 Hz)
    let carrierFreq = map(eegData.alpha, 0, 1, 200, 800);
    
    // Beta controls modulation frequency (0-100 Hz)
    let modFreq = map(eegData.beta, 0, 1, 0, 100);
    
    // Theta controls modulation depth
    let modDepth = map(eegData.theta, 0, 1, 0, 500);
    
    // Attention controls overall volume
    let volume = map(eegData.attention, 0, 1, 0, 0.2);
    
    // Update synthesis parameters
    carrier.freq(carrierFreq);
    modulator.freq(modFreq);
    modulator.amp(modDepth);
    carrier.amp(volume, 0.1);
    
    // Visualize waveform
    let waveform = analyzer.waveform();
    
    noFill();
    stroke(180 + eegData.theta * 180, 80, 90);
    strokeWeight(2);
    
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height * 0.3, height * 0.7);
      vertex(x, y);
    }
    endShape();
    
    // Draw spectrum
    let spectrum = analyzer.analyze();
    noStroke();
    for (let i = 0; i < spectrum.length; i++) {
      let x = map(i, 0, spectrum.length, 0, width);
      let h = map(spectrum[i], 0, 255, 0, height * 0.3);
      let hue = map(i, 0, spectrum.length, 180, 300);
      fill(hue, 70, 90, 0.8);
      rect(x, height, width / spectrum.length, -h);
    }
  }
  
  // Add pulsing border when not playing
  if (!isPlaying) {
    noFill();
    stroke(180, 100, 100, sin(frameCount * 0.1) * 0.3 + 0.5);
    strokeWeight(4);
    rect(5, 5, width - 10, height - 10);
  }
  
  // Display parameters
  fill(0, 0, 100);
  textAlign(CENTER, TOP);
  textSize(16);
  text(isPlaying ? "🎹 Synthesizer ON" : "🎹 CLICK HERE to start", width/2, 10);
  
  if (isPlaying) {
    textAlign(LEFT, TOP);
    textSize(11);
    fill(180, 70, 90);
    text("Carrier: " + carrier.getFreq().toFixed(1) + " Hz (Alpha)", 10, 35);
    text("Mod Freq: " + modulator.getFreq().toFixed(1) + " Hz (Beta)", 10, 50);
    text("Mod Depth: " + modulator.getAmp().toFixed(1) + " (Theta)", 10, 65);
    text("Volume: " + (carrier.getAmp() * 100).toFixed(0) + "% (Attention)", 10, 80);
  } else {
    textAlign(CENTER, TOP);
    textSize(12);
    fill(0, 0, 70);
    text("Alpha = Pitch | Beta = Timbre | Theta = Intensity | Attention = Volume", width/2, 35);
  }
  
  if (!eegData.connected) {
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(0, 0, 70);
    text("⚠️ Use 'Simulate Data' to control the synthesizer", width/2, height - 20);
  }
}

function mousePressed() {
  console.log('👆 Canvas clicked!');
  console.log('Starting audio context...');
  userStartAudio();
  
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    console.log('🎹 Synthesizer started!');
    console.log('Listen to the complex timbres created by FM synthesis');
    console.log('Adjust the simulation sliders to hear different sounds');
  } else {
    carrier.amp(0, 0.1);
    console.log('🎹 Synthesizer stopped');
  }
}
