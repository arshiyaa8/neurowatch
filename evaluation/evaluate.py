#!/usr/bin/env python3
"""
evaluation/evaluate.py
NeuroWatch AI Screening Prototype Evaluation Script

Calculates performance metrics from data/evaluation/test_results.csv.
Disclaimer: Evaluated on controlled, simulated screening test cases.
Not a clinical trial or medical diagnosis validation.
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

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            true_label = row['true_label'].strip().lower()
            pred_label = row['predicted_label'].strip().lower()

            if true_label == 'simulated_risk_condition' and pred_label == 'simulated_risk_condition':
                tp += 1
            elif true_label == 'normal' and pred_label == 'normal':
                tn += 1
            elif true_label == 'normal' and pred_label == 'simulated_risk_condition':
                fp += 1
            elif true_label == 'simulated_risk_condition' and pred_label == 'normal':
                fn += 1

    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print("=" * 65)
    print("      NEUROWATCH AI — EVALUATION BENCHMARK METRICS SUMMARY")
    print("=" * 65)
    print(f"Dataset File : data/evaluation/test_results.csv")
    print(f"Sample Size  : {total} test case samples")
    print("-" * 65)
    print(f"True Positives (TP) : {tp}")
    print(f"True Negatives (TN) : {tn}")
    print(f"False Positives (FP): {fp}")
    print(f"False Negatives (FN): {fn}")
    print("-" * 65)
    print(f"Accuracy  : {accuracy:.4f} ({accuracy * 100:.2f}%)")
    print(f"Precision : {precision:.4f} ({precision * 100:.2f}%)")
    print(f"Recall    : {recall:.4f} ({recall * 100:.2f}%)")
    print(f"F1-Score  : {f1:.4f}")
    print(f"False Positive Rate (FPR): {fpr:.4f} ({fpr * 100:.2f}%)")
    print("=" * 65)
    print("Disclaimer: Evaluated on controlled, simulated screening test cases.")
    print("NeuroWatch AI is a screening awareness prototype, not clinically validated.")
    print("=" * 65)

if __name__ == '__main__':
    evaluate()
