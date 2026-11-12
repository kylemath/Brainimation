/**
 * @id simplePPG
 * @title Simple PPG: Heartbeat Pulse
 * @category Start Here: One Simple Sketch per Sensor
 * @order 2
 */
// The infrared (850 nm) optical signal, cleaned (0.5-4 Hz band-pass + ambient-light cancellation),
// plus a ring that pulses with each beat. eegData.getCleanPPGChannel('infrared', n), eegData.ppgPulse, eegData.heartRate.
function setup() {
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  const data = eegData.getCleanPPGChannel('infrared', 256);
  if (data.length > 2) {
    let lo = Infinity, hi = -Infinity;
    for (const v of data) { lo = min(lo, v); hi = max(hi, v); }
    noFill(); stroke(244, 114, 182); strokeWeight(2);
    beginShape();
    for (let i = 0; i < data.length; i++) {
      vertex(map(i, 0, data.length - 1, 20, width - 20), map(data[i], lo, hi, height * 0.45, height * 0.1));
    }
    endShape();
  }
  const pulse = eegData.ppgPulse || 0;
  const r = 60 + pulse * 40;
  noStroke(); fill(244, 114, 182, 60 + pulse * 120);
  circle(width / 2, height * 0.72, r * 1.6);
  fill(244, 114, 182); circle(width / 2, height * 0.72, r);
  fill(230); textAlign(CENTER); textSize(16);
  text((eegData.heartRate > 0 ? eegData.heartRate + ' BPM' : '-- BPM'), width / 2, height * 0.93);
  textAlign(LEFT);
}
