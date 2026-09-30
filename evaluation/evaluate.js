/**
 * evaluation/evaluate.js
 * Node.js evaluation helper for NeuroWatch Warning Indicator Score Benchmark
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
  const normalScores = [];
  const normalRangeCounts = {
    LOW_0_29: 0,
    MODERATE_30_59: 0,
    HIGH_60_89: 0,
    VERY_HIGH_90_100: 0
  };

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = lines[i].split(',').map(p => p.trim());
    const trueLabel = parts[1].toLowerCase();
    const predLabel = parts[2].toLowerCase();
    const score = parseFloat(parts[3] || '0');
    total++;

    if (trueLabel === 'simulated_risk_condition' && predLabel === 'simulated_risk_condition') tp++;
    else if (trueLabel === 'normal' && predLabel === 'normal') tn++;
    else if (trueLabel === 'normal' && predLabel === 'simulated_risk_condition') fp++;
    else if (trueLabel === 'simulated_risk_condition' && predLabel === 'normal') fn++;

    if (trueLabel === 'normal') {
      normalScores.push(score);
      if (score < 30) normalRangeCounts.LOW_0_29++;
      else if (score < 60) normalRangeCounts.MODERATE_30_59++;
      else if (score < 90) normalRangeCounts.HIGH_60_89++;
      else normalRangeCounts.VERY_HIGH_90_100++;
    }
  }

  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  const fpr = (fp + tn) > 0 ? fp / (fp + tn) : 0;

  const avgNormalScore = normalScores.length > 0 ? normalScores.reduce((a, b) => a + b, 0) / normalScores.length : 0;
  const maxNormalScore = normalScores.length > 0 ? Math.max(...normalScores) : 0;

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
    falsePositiveRate: Number(fpr.toFixed(4)),
    normalSamplesSummary: {
      totalNormal: normalScores.length,
      averageNormalScore: Number(avgNormalScore.toFixed(2)),
      maximumNormalScore: Number(maxNormalScore.toFixed(2)),
      rangeDistribution: normalRangeCounts
    },
    disclaimer: 'Evaluated on controlled simulated screening test cases. Prototype decision thresholds, not clinically validated.'
  };
}

if (require.main === module) {
  const metrics = runEvaluation();
  console.log('=' .repeat(65));
  console.log('  NEUROWATCH WARNING INDICATOR SCORE — EVALUATION SUMMARY');
  console.log('=' .repeat(65));
  console.log(JSON.stringify(metrics, null, 2));
}

module.exports = runEvaluation;
