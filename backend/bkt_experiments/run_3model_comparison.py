"""
Run 3-Model BKT Comparison

Compare Standard BKT vs BKT with Forgetting vs Individualized BKT.

This answers: Which BKT variant works best for Thai calculus students?

Usage:
    python run_3model_comparison.py
    
Or with custom settings:
    python run_3model_comparison.py --students 300 --output results/bkt_variants
"""

import argparse
from datetime import datetime
import sys
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

from experiments.model_comparison import ModelComparison
from models.bkt.standard_bkt import StandardBKT
from models.bkt.bkt_forgetting import BKTWithForgetting
from models.bkt.individualized_bkt import IndividualizedBKT
from data.mock_generator import MockDataGenerator


def main():
    """Main function to run 3-model comparison."""
    parser = argparse.ArgumentParser(
        description='Compare 3 BKT variants'
    )
    parser.add_argument(
        '--students',
        type=int,
        default=200,
        help='Number of students (default: 200)'
    )
    parser.add_argument(
        '--seed',
        type=int,
        default=42,
        help='Random seed (default: 42)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output directory (default: results/3models_TIMESTAMP)'
    )
    
    args = parser.parse_args()
    
    # Generate output directory
    if args.output is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = f"results/3models_{timestamp}"
    else:
        output_dir = args.output
    
    print("\n" + "="*70)
    print(" 3-MODEL BKT COMPARISON")
    print("="*70)
    print(f"\nModels:")
    print(f"  1. Standard BKT (4 parameters)")
    print(f"  2. BKT with Forgetting (5 parameters)")
    print(f"  3. Individualized BKT (per-student parameters)")
    print()
    print(f"Configuration:")
    print(f"  Number of students: {args.students}")
    print(f"  Random seed: {args.seed}")
    print(f"  Output directory: {output_dir}")
    print()
    
    # Generate dataset
    print("Generating synthetic dataset...")
    generator = MockDataGenerator(seed=args.seed)
    dataset = generator.generate_dataset(
        num_students=args.students,
        num_skills=3,
        min_attempts_per_student=30,
        max_attempts_per_student=50,
        forgetting_rate=0.05  # Include some forgetting
    )
    
    print(f"Dataset: {dataset.num_students} students, {dataset.num_interactions} interactions")
    print()
    
    # Create comparison framework
    comparison = ModelComparison(output_dir=output_dir)
    
    # Add all 3 models
    print("Adding models...")
    comparison.add_model("Standard BKT", StandardBKT())
    comparison.add_model("BKT with Forgetting", BKTWithForgetting())
    comparison.add_model("Individualized BKT", IndividualizedBKT())
    print()
    
    # Run comparison
    print("="*70)
    print(" RUNNING COMPARISON")
    print("="*70)
    results_df = comparison.compare_on_dataset(dataset, verbose=True)
    
    # Data efficiency
    print("\n" + "="*70)
    print(" DATA EFFICIENCY ANALYSIS")
    print("="*70)
    efficiency_df = comparison.compare_data_efficiency(
        dataset,
        sample_sizes=[50, 100, 200],
        num_trials=2,
        verbose=True
    )
    
    # Save summary
    comparison.save_summary_report()
    
    print("\n" + "="*70)
    print(" EXPERIMENT COMPLETE!")
    print("="*70)
    print(f"\nResults saved to: {output_dir}/")
    print()
    print("Key Findings (check comparison_results.csv for details):")
    
    # Show winner
    best_by_auc = results_df.loc[results_df['test_auc'].idxmax()]
    best_by_speed = results_df.loc[results_df['training_time_seconds'].idxmin()]
    print(f"\n🏆 Best by AUC: {best_by_auc['model']} ({best_by_auc['test_auc']:.4f})")
    print(f"⚡ Fastest: {best_by_speed['model']} ({best_by_speed['training_time_seconds']:.2f}s)")
    
    print("\n" + "="*70)
    print(" NEXT STEPS")
    print("="*70)
    print(f"\n1. View results:")
    print(f"   - {output_dir}/comparison_results.csv")
    print(f"   - {output_dir}/data_efficiency.csv")
    print()
    print(f"2. Create visualizations:")
    print(f"   python create_comparison_plots.py --input {output_dir}")
    print()
    print("3. Analyze which BKT variant is best for your research")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
