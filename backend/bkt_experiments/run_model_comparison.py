"""
Run Model Comparison Experiment

Compare Standard BKT vs BKT with Forgetting across multiple dimensions.

Usage:
    python run_model_comparison.py
    
Or with custom settings:
    python run_model_comparison.py --students 300 --output results/my_comparison
"""

import argparse
from datetime import datetime
from experiments.model_comparison import quick_model_comparison


def main():
    """Main function to run model comparison."""
    parser = argparse.ArgumentParser(
        description='Compare BKT models'
    )
    parser.add_argument(
        '--students',
        type=int,
        default=200,
        help='Number of students in synthetic dataset (default: 200)'
    )
    parser.add_argument(
        '--seed',
        type=int,
        default=42,
        help='Random seed for reproducibility (default: 42)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output directory (default: results/comparison_TIMESTAMP)'
    )
    
    args = parser.parse_args()
    
    # Generate output directory name if not specified
    if args.output is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = f"results/comparison_{timestamp}"
    else:
        output_dir = args.output
    
    print("\n" + "="*70)
    print(" BKT MODEL COMPARISON")
    print("="*70)
    print(f"\nConfiguration:")
    print(f"  Number of students: {args.students}")
    print(f"  Random seed: {args.seed}")
    print(f"  Output directory: {output_dir}")
    print()
    
    # Run comparison
    results = quick_model_comparison(
        num_students=args.students,
        seed=args.seed,
        output_dir=output_dir
    )
    
    print("\n" + "="*70)
    print(" NEXT STEPS")
    print("="*70)
    print("\n1. Review comparison results:")
    print(f"   - {output_dir}/comparison_results.csv")
    print(f"   - {output_dir}/data_efficiency.csv")
    print(f"   - {output_dir}/comparison_summary.json")
    print()
    print("2. Create visualizations:")
    print(f"   python create_comparison_plots.py --input {output_dir}")
    print()
    print("3. Analyze which model performs better for your research")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
