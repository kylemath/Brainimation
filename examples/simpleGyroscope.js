/**
 * @id simpleGyroscope
 * @title Simple Gyroscope: Head Rotation Speed
 * @category Start Here: One Simple Sketch per Sensor
 * @order 4
 */
// 3-axis gyroscope (52 Hz, degrees per second). Nod, shake or tilt your head and watch the bars move.
// eegData.gyro.x / .y / .z / .magnitude, eegData.getGyroChannel('x', n)
let angle = 0;

function setup() {
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  const g = eegData.gyro;
  const cols = [[96, 165, 250], [251, 191, 36], [244, 114, 182]];
  const vals = [g.x, g.y, g.z], names = ['x', 'y', 'z'];
  for (let k = 0; k < 3; k++) {
    const y = 60 + k * 55, len = constrain(vals[k], -250, 250) / 250 * (width / 2 - 40);
    stroke(40, 50, 70); strokeWeight(1); line(width / 2, y - 18, width / 2, y + 18);
    noStroke(); fill(...cols[k]); rect(width / 2, y - 12, len, 24);
    fill(230); textSize(12); text(`${names[k]} ${vals[k].toFixed(0)} °/s`, 12, y + 4);
  }
  // a square that turns with the head's yaw rate so the motion is visible
  angle += radians(g.z) / 60;
  push(); translate(width / 2, height * 0.7); rotate(angle);
  noFill(); stroke(45, 212, 191); strokeWeight(3); rectMode(CENTER); rect(0, 0, 110, 110);
  pop();
  noStroke(); fill(230); textSize(13); text(`|ω| ${g.magnitude.toFixed(0)} °/s`, 12, height - 14);
}
