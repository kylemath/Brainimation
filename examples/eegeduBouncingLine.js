/**
 * @id eegeduBouncingLine
 * @title Bouncing Line Screensaver (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 10
 *
 * Original bouncingLine.p5 sketch by Kyle Mathewson.
 * Classic bouncing line screensaver with endpoint speeds controlled by Left & Right Alpha.
 */
let startX, startY, endX, endY;
let deltaStartX, deltaStartY, deltaEndX, deltaEndY;
let h, s, b;

function setup() {
  startX = random(width);
  startY = random(height);
  endX = random(width);
  endY = random(height);
  let range = 5;
  deltaStartX = random(-range, range);
  deltaStartY = random(-range, range);
  deltaEndX = random(-range, range);
  deltaEndY = random(-range, range);
  h = random(255);
  s = 255;
  b = 255;
  noFill();
  colorMode(HSB, 255);
  background(32);
}

function draw() {
  stroke(h, s, b, 100);
  strokeWeight(2);
  line(startX, startY, endX, endY);

  h += random(-5, 5);
  h = constrain(h, 0, 255);

  let leftAlpha  = 0.5 + eegData.getChannelBand('alpha', 1) * 3;
  let rightAlpha = 0.5 + eegData.getChannelBand('alpha', 2) * 3;

  startX += deltaStartX * leftAlpha;
  startY += deltaStartY * leftAlpha;
  endX   += deltaEndX * rightAlpha;
  endY   += deltaEndY * rightAlpha;

  if (startX < 0 || startX > width)  deltaStartX *= -1;
  if (startY < 0 || startY > height) deltaStartY *= -1;
  if (endX < 0 || endX > width)      deltaEndX *= -1;
  if (endY < 0 || endY > height)      deltaEndY *= -1;
}
