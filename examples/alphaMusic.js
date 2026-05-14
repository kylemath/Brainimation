/**
 * @id alphaMusic
 * @title Alpha Wave Music
 * @category Sound & Music
 * @order 34
 *
 * Auto-split from index.html.
 */
// Alpha Wave Music - Generative music from brain waves
let notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major scale (C4-C5)
let noteNames = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
let synth;
let reverb;
let lastNoteTime = 0;
let isPlaying = false;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  console.log('🎵 === Alpha Wave Music ===');
  console.log('Creating polyphonic synthesizer...');
  
  // Create synthesizer
  synth = new p5.PolySynth();
  console.log('✅ Synthesizer created');
  
  // Add reverb effect
  reverb = new p5.Reverb();
  reverb.process(synth, 3, 2);
  console.log('✅ Reverb effect added');
  
  console.log('');
  console.log('👆 CLICK THE CANVAS to start generative music');
  console.log('📊 Your brain waves control the music:');
  console.log('   - Alpha: selects which note to play');
  console.log('   - Attention: controls tempo (speed)');
  console.log('   - Beta: note duration');
  console.log('   - Meditation: note velocity (loudness)');
  console.log('');
  console.log('💡 Use "Simulate Data" to control the music without a Muse');
}

function draw() {
  background(0, 0, 5, 0.1);
  
  // Generate music based on brain waves
  if (isPlaying && millis() - lastNoteTime > map(eegData.attention, 0, 1, 800, 200)) {
    playBrainNote();
    lastNoteTime = millis();
  }
  
  // Visualize music
  translate(width/2, height/2);
  
  // Draw concentric circles for each frequency band
  let bands = [
    {value: eegData.delta, color: 0, radius: 50, name: 'Delta'},
    {value: eegData.theta, color: 60, radius: 100, name: 'Theta'},
    {value: eegData.alpha, color: 180, radius: 150, name: 'Alpha'},
    {value: eegData.beta, color: 270, radius: 200, name: 'Beta'},
    {value: eegData.gamma, color: 300, radius: 250, name: 'Gamma'}
  ];
  
  for (let band of bands) {
    let size = band.radius + band.value * 50;
    stroke(band.color, 70, 90, 0.6);
    strokeWeight(2 + band.value * 5);
    noFill();
    ellipse(0, 0, size * 2);
  }
  
  // Info
  resetMatrix();
  
  // Add pulsing border when not playing
  if (!isPlaying) {
    noFill();
    stroke(180, 100, 100, sin(frameCount * 0.1) * 0.3 + 0.5);
    strokeWeight(4);
    rect(5, 5, width - 10, height - 10);
  }
  
  fill(0, 0, 100);
  textAlign(CENTER, TOP);
  textSize(18);
  text(isPlaying ? "🎵 Music Playing" : "🎵 CLICK HERE to start music", width/2, 20);
  
  textSize(12);
  text("Alpha: note selection | Attention: tempo | Beta: duration | Meditation: volume", width/2, 45);
  
  // Show current parameters
  if (isPlaying) {
    textSize(11);
    fill(180, 70, 90);
    let currentNote = floor(map(eegData.alpha, 0, 1, 0, notes.length));
    currentNote = constrain(currentNote, 0, notes.length - 1);
    let tempo = map(eegData.attention, 0, 1, 800, 200).toFixed(0);
    text(`Current: ${noteNames[currentNote]} | Tempo: ${tempo}ms | Duration: ${eegData.beta.toFixed(2)}`, width/2, 65);
  }
  
  if (!eegData.connected) {
    textSize(14);
    fill(0, 0, 70);
    text("⚠️ Use 'Simulate Data' button to control the music", width/2, height - 30);
  }
}

function playBrainNote() {
  // Select note based on alpha
  let noteIndex = floor(map(eegData.alpha, 0, 1, 0, notes.length));
  noteIndex = constrain(noteIndex, 0, notes.length - 1);
  
  // Duration based on beta
  let duration = map(eegData.beta, 0, 1, 0.1, 0.5);
  
  // Velocity based on meditation
  let velocity = map(eegData.meditation, 0, 1, 0.3, 1.0);
  
  // Play the note
  synth.play(notes[noteIndex], velocity, 0, duration);
  
  // Log occasionally (every 10th note)
  if (frameCount % 10 === 0) {
    console.log(`🎵 Playing: ${noteNames[noteIndex]} at ${(velocity * 100).toFixed(0)}% volume`);
  }
}

function mousePressed() {
  console.log('👆 Canvas clicked!');
  console.log('Starting audio context...');
  userStartAudio();
  
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    console.log('🎵 Music started! Listen as your brain waves create melodies...');
  } else {
    console.log('🎵 Music stopped');
  }
}
