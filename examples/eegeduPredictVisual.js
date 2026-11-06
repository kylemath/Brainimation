/**
 * @id eegeduPredictVisual
 * @title Brain State Classifier A vs B (EEGEdu)
 * @category EEGEdu Modules
 * @order 12
 *
 * Original EEGEdu Predict module sketch (sketchPredict.js).
 * Classifies live EEG into State A (Alpha/Meditation dominant) vs State B (Beta/Attention dominant)
 * and visualizes classification confidence across a split decision boundary.
 */
function setup() {
  createCanvas(width, height);
}

function draw() {
  let scoreA = (eegData.alpha + eegData.meditation) * 0.5;
  let scoreB = (eegData.beta + eegData.attention) * 0.5;
  let diff = Math.abs(scoreA - scoreB);
  let confidence = constrain(0.5 + diff * 1.4, 0, 1);
  let label = scoreA >= scoreB ? 'A' : 'B';

  background(250, 250, 150);
  fill(0);
  stroke(0);
  strokeWeight(5);
  line(width / 2, 0, width / 2, height);

  noStroke();
  textAlign(CENTER, TOP);
  textSize(30);
  text('A (Calm / Alpha)', width / 4, 24);
  text('B (Focus / Beta)', width - width / 4, 24);

  if (label === 'A') {
    fill(120, 120, 250);
    if (confidence > 0.72) {
      ellipse(width / 6, height / 2, 80, 80);
    } else {
      ellipse(width / 3, height / 2, 34, 34);
    }
  } else {
    fill(120, 250, 120);
    if (confidence > 0.72) {
      ellipse(width - width / 6, height / 2, 80, 80);
    } else {
      ellipse(width - width / 3, height / 2, 34, 34);
    }
  }

  fill(40);
  textSize(15);
  text(`Predicted State: ${label}  |  Confidence: ${(confidence * 100).toFixed(0)}%`, width / 2, height - 36);
}
