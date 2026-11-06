/**
 * @id museTelemetryDashboard
 * @title Telemetry Broadcast: Battery, Fuel Gauge Voltage & Die Temp
 * @category Motion, IMU & Broadcast Sensors
 * @order 4
 */

// 🔋 Muse Broadcast Telemetry Dashboard (eegData.telemetry)
// Visualizes hardware health broadcast packets from Classic Muse & Muse S Athena:
//   - eegData.telemetry.batteryLevel (0 - 100%)
//   - eegData.telemetry.fuelGaugeVoltage (mV, typically 3600 - 4200 mV LiPo)
//   - eegData.telemetry.adcVoltage (raw ADC rail readout)
//   - eegData.telemetry.temperature (internal die temperature in °C)
//   - eegData.telemetryHistory { batteryLevel, fuelGaugeVoltage, temperature }

let simT = 0;

function setup() {
  colorMode(RGB, 255);
  textFont('monospace');
}

function draw() {
  background(10, 14, 24);
  simT += 0.02;

  let bat = 88, volt = 3985, adc = 890, temp = 33.4, seq = frameCount;
  if (eegData && eegData.connected && eegData.telemetry && eegData.telemetry.batteryLevel > 0) {
    bat = eegData.telemetry.batteryLevel;
    volt = eegData.telemetry.fuelGaugeVoltage;
    adc = eegData.telemetry.adcVoltage;
    temp = eegData.telemetry.temperature;
    seq = eegData.telemetry.sequenceId;
  } else {
    bat = 87.5 + 1.5 * sin(simT * 0.15);
    volt = 3980 + 18 * sin(simT * 0.35);
    adc = 888 + 6 * cos(simT * 0.5);
    temp = 33.2 + 0.65 * sin(simT * 0.25);
  }

  drawHeader(bat, volt, temp, seq);

  let cardY = 58;
  let cardH = height * 0.46;
  let cardW = (width - 48) / 3;

  drawBatteryCard(16, cardY, cardW, cardH, bat);
  drawVoltageCard(24 + cardW, cardY, cardW, cardH, volt, adc);
  drawTempCard(32 + cardW * 2, cardY, cardW, cardH, temp);

  let botY = cardY + cardH + 14;
  let botH = height - botY - 14;
  drawTelemetryHistoryStrip(16, botY, width - 32, botH, bat, volt, temp);
}

function drawHeader(bat, volt, temp, seq) {
  noStroke();
  fill(18, 25, 42);
  rect(0, 0, width, 46);
  stroke(45, 65, 100);
  line(0, 46, width, 46);

  noStroke();
  fill(250, 204, 21);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('🔋 SENSOR 4/5 — HARDWARE TELEMETRY BROADCAST (eegData.telemetry)', 16, 16);

  textStyle(NORMAL);
  fill(165, 185, 215);
  textSize(11);
  text(`SOC: ${bat.toFixed(1)}%   |   LiPo Rail: ${volt.toFixed(0)} mV   |   Die Temp: ${temp.toFixed(1)} °C   |   Packet Seq #${seq}`, 16, 34);
}

function drawBatteryCard(x, y, w, h, bat) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('BATTERY CHARGE (SOC)', x + 12, y + 10);

  // Battery icon
  let bx = x + w * 0.18;
  let by = y + h * 0.34;
  let bw = w * 0.60;
  let bh = h * 0.32;

  noFill();
  stroke(120, 150, 190);
  strokeWeight(2);
  rect(bx, by, bw, bh, 6);
  fill(120, 150, 190);
  rect(bx + bw, by + bh * 0.28, 6, bh * 0.44, 2);

  let fillFrac = constrain(bat / 100, 0, 1);
  let col = bat > 40 ? [52, 211, 153] : bat > 20 ? [250, 204, 21] : [248, 113, 113];
  noStroke();
  fill(col[0], col[1], col[2], 210);
  rect(bx + 4, by + 4, (bw - 8) * fillFrac, bh - 8, 4);

  fill(245, 250, 255);
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`${bat.toFixed(1)}%`, bx + bw * 0.5, by + bh * 0.5);

  fill(145, 170, 205);
  textSize(10);
  textStyle(NORMAL);
  text('eegData.batteryLevel', x + w * 0.5, y + h - 18);
}

function drawVoltageCard(x, y, w, h, volt, adc) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('FUEL GAUGE & ADC RAIL', x + 12, y + 10);

  let cx = x + w * 0.5;
  let cy = y + h * 0.56;
  let r = min(w, h) * 0.30;

  noFill();
  stroke(35, 52, 82);
  strokeWeight(7);
  arc(cx, cy, r * 2, r * 2, PI * 0.85, TWO_PI + PI * 0.15);

  let vNorm = constrain((volt - 3300) / (4250 - 3300), 0, 1);
  stroke(56, 189, 248);
  arc(cx, cy, r * 2, r * 2, PI * 0.85, PI * 0.85 + vNorm * PI * 1.3);

  noStroke();
  fill(240, 248, 255);
  textSize(15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`${volt.toFixed(0)} mV`, cx, cy - 4);

  fill(145, 170, 205);
  textSize(9.5);
  textStyle(NORMAL);
  text(`ADC: ${adc.toFixed(0)}`, cx, cy + 14);
  text('telemetry.fuelGaugeVoltage', cx, y + h - 18);
}

function drawTempCard(x, y, w, h, temp) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('HEADSET DIE TEMPERATURE', x + 12, y + 10);

  let tx = x + w * 0.34;
  let ty = y + h * 0.26;
  let th = h * 0.48;

  // Thermometer stem & bulb
  stroke(120, 150, 190);
  strokeWeight(2);
  fill(22, 32, 52);
  rect(tx - 7, ty, 14, th, 7);
  ellipse(tx, ty + th + 4, 24, 24);

  let tNorm = constrain((temp - 20) / 25, 0, 1);
  noStroke();
  fill(251, 146, 60);
  ellipse(tx, ty + th + 4, 18, 18);
  rect(tx - 4, ty + th * (1 - tNorm), 8, th * tNorm + 4, 4);

  fill(245, 248, 255);
  textSize(17);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text(`${temp.toFixed(1)} °C`, tx + 22, ty + th * 0.45);
  fill(155, 175, 205);
  textSize(11);
  textStyle(NORMAL);
  text(`${(temp * 9 / 5 + 32).toFixed(1)} °F`, tx + 22, ty + th * 0.45 + 18);

  textAlign(CENTER, CENTER);
  textSize(10);
  text('eegData.temperature', x + w * 0.5, y + h - 18);
}

function drawTelemetryHistoryStrip(x, y, w, h, bat, volt, temp) {
  fill(15, 22, 36);
  stroke(40, 58, 92);
  rect(x, y, w, h, 8);

  noStroke();
  fill(210, 225, 245);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('TELEMETRY TREND LOG (eegData.telemetryHistory)', x + 12, y + 8);

  let plotX = x + 48;
  let plotY = y + 28;
  let plotW = w - 64;
  let plotH = h - 38;

  let vHist = (eegData && eegData.telemetryHistory && eegData.telemetryHistory.fuelGaugeVoltage) ? eegData.telemetryHistory.fuelGaugeVoltage : [];
  let tHist = (eegData && eegData.telemetryHistory && eegData.telemetryHistory.temperature) ? eegData.telemetryHistory.temperature : [];

  // Voltage trace (cyan)
  noFill();
  stroke(56, 189, 248);
  strokeWeight(1.8);
  beginShape();
  let N = vHist.length > 2 ? vHist.length : 120;
  for (let i = 0; i < N; i++) {
    let v = vHist.length > 2 ? vHist[i] : (3980 + 18 * sin(simT * 0.35 - (N - i) * 0.05));
    let px = plotX + (i / max(1, N - 1)) * plotW;
    let py = constrain(map(v, 3600, 4200, plotY + plotH, plotY), plotY, plotY + plotH);
    vertex(px, py);
  }
  endShape();

  // Temp trace (orange)
  stroke(251, 146, 60);
  strokeWeight(1.8);
  beginShape();
  let Nt = tHist.length > 2 ? tHist.length : 120;
  for (let i = 0; i < Nt; i++) {
    let tv = tHist.length > 2 ? tHist[i] : (33.2 + 0.65 * sin(simT * 0.25 - (Nt - i) * 0.05));
    let px = plotX + (i / max(1, Nt - 1)) * plotW;
    let py = constrain(map(tv, 25, 42, plotY + plotH, plotY), plotY, plotY + plotH);
    vertex(px, py);
  }
  endShape();
}
