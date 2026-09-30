#!/usr/bin/env python3
"""
evaluation/evaluate.py
NeuroWatch AI Screening Prototype Evaluation Script

Calculates performance metrics & UI threshold range breakdown from data/evaluation/test_results.csv.
Disclaimer: Evaluated on controlled, simulated screening test cases.
Prototype UI decision thresholds, not a clinical trial or medical diagnosis validation.
"""

import os
import csv

def evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'data', 'evaluation', 'test_results.csv')

    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    tp = 0
    tn = 0
    fp = 0
    fn = 0
    total = 0

    normal_scores = []
    normal_range_counts = {
        'LOW (0-29%)': 0,
        'MODERATE (30-59%)': 0,
        'HIGH (60-89%)': 0,
        'VERY HIGH (90-100%)': 0
    }

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            true_label = row['true_label'].strip().lower()
            pred_label = row['predicted_label'].strip().lower()
            score = float(row.get('observable_score', 0))

            if true_label == 'simulated_risk_condition' and pred_label == 'simulated_risk_condition':
                tp += 1
            elif true_label == 'normal' and pred_label == 'normal':
                tn += 1
            elif true_label == 'normal' and pred_label == 'simulated_risk_condition':
                fp += 1
            elif true_label == 'simulated_risk_condition' and pred_label == 'normal':
                fn += 1

            if true_label == 'normal':
                normal_scores.append(score)
                if score < 30:
                    normal_range_counts['LOW (0-29%)'] += 1
                elif score < 60:
                    normal_range_counts['MODERATE (30-59%)'] += 1
                elif score < 90:
                    normal_range_counts['HIGH (60-89%)'] += 1
                else:
                    normal_range_counts['VERY HIGH (90-100%)'] += 1

    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    avg_normal_score = sum(normal_scores) / len(normal_scores) if normal_scores else 0.0
    max_normal_score = max(normal_scores) if normal_scores else 0.0
    total_normal = len(normal_scores)

    print("=" * 70)
    print("   NEUROWATCH WARNING INDICATOR SCORE — EVALUATION BENCHMARK SUMMARY")
    print("=" * 70)
    print(f"Dataset File        : data/evaluation/test_results.csv")
    print(f"Total Sample Size   : {total} test case samples")
    print("-" * 70)
    print(f"True Positives (TP) : {tp}")
    print(f"True Negatives (TN) : {tn}")
    print(f"False Positives (FP): {fp}")
    print(f"False Negatives (FN): {fn}")
    print("-" * 70)
    print(f"Accuracy                 : {accuracy:.4f} ({accuracy * 100:.2f}%)")
    print(f"Precision                : {precision:.4f} ({precision * 100:.2f}%)")
    print(f"Recall                   : {recall:.4f} ({recall * 100:.2f}%)")
    print(f"F1-Score                 : {f1:.4f}")
    print(f"False Positive Rate (FPR): {fpr:.4f} ({fpr * 100:.2f}%)")
    print("-" * 70)
    print("NORMAL CONTROLLED SAMPLE DISTRIBUTION BREAKDOWN:")
    print(f"Total Normal Samples     : {total_normal}")
    print(f"Average Normal Score     : {avg_normal_score:.2f}%")
    print(f"Maximum Normal Score     : {max_normal_score:.2f}%")
    print("Distribution into UI Prototype Ranges:")
    for category, count in normal_range_counts.items():
        pct = (count / total_normal * 100) if total_normal > 0 else 0
        print(f"  - {category:<20}: {count:>2} samples ({pct:.1f}%)")
    print("=" * 70)
    print("Disclaimer: Evaluated on controlled, simulated screening test cases.")
    print("Prototype UI decision thresholds, not clinically validated medical diagnostic rules.")
    print("=" * 70)

if __name__ == '__main__':
    evaluate()
