/**
 * evaluation/evaluate.js
 * Node.js evaluation helper for NeuroWatch AI Screening Prototype Benchmark
 */

const fs = require('fs');
const path = require('path');

function runEvaluation() {
  const csvPath = path.join(__dirname, '..', 'data', 'evaluation', 'test_results.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('Error: CSV file not found at:', csvPath);
    return null;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');

  let tp = 0, tn = 0, fp = 0, fn = 0, total = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = lines[i].split(',').map(p => p.trim().toLowerCase());
    const trueLabel = parts[1];
    const predLabel = parts[2];
    total++;

    if (trueLabel === 'simulated_risk_condition' && predLabel === 'simulated_risk_condition') tp++;
    else if (trueLabel === 'normal' && predLabel === 'normal') tn++;
    else if (trueLabel === 'normal' && predLabel === 'simulated_risk_condition') fp++;
    else if (trueLabel === 'simulated_risk_condition' && predLabel === 'normal') fn++;
  }

  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  return {
    totalSamples: total,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    accuracy: Number(accuracy.toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1Score: Number(f1.toFixed(4)),
    disclaimer: 'Evaluated on controlled simulated screening test cases. Not clinically validated.'
  };
}

if (require.main === module) {
  const metrics = runEvaluation();
  console.log('=' .repeat(60));
  console.log('  NEUROWATCH AI — EVALUATION BENCHMARK METRICS SUMMARY');
  console.log('=' .repeat(60));
  console.log(JSON.stringify(metrics, null, 2));
}

module.exports = runEvaluation;
