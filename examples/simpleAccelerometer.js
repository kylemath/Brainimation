/**
 * @id simpleAccelerometer
 * @title Simple Accelerometer: Head Tilt
 * @category Start Here: One Simple Sketch per Sensor
 * @order 3
 */
// 3-axis accelerometer (52 Hz, in g). At rest the vector points down with magnitude ~1 g, so x and y show tilt.
// eegData.accel.x / .y / .z / .magnitude, eegData.getAccelChannel('x', n)
function setup() {
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  const a = eegData.accel;
  const cx = width / 2, cy = height * 0.4;
  stroke(40, 50, 70); strokeWeight(1);
  line(cx - 120, cy, cx + 120, cy); line(cx, cy - 120, cx, cy + 120);
  noFill(); circle(cx, cy, 240);
  noStroke(); fill(45, 212, 191);
  circle(cx + constrain(a.y, -1, 1) * 120, cy + constrain(a.x, -1, 1) * 120, 26);

  const axes = [['x', [96, 165, 250]], ['y', [251, 191, 36]], ['z', [244, 114, 182]]];
  for (let k = 0; k < 3; k++) {
    const d = eegData.getAccelChannel(axes[k][0], 128);
    noFill(); stroke(...axes[k][1]); strokeWeight(1.5);
    beginShape();
    for (let i = 0; i < d.length; i++) vertex(map(i, 0, max(1, d.length - 1), 20, width - 20), height * 0.82 - constrain(d[i], -1.5, 1.5) * 35);
    endShape();
  }
  noStroke(); fill(230); textSize(13);
  text(`x ${a.x.toFixed(2)}  y ${a.y.toFixed(2)}  z ${a.z.toFixed(2)}  |a| ${a.magnitude.toFixed(2)} g`, 20, height - 14);
}
