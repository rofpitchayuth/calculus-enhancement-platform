"""
Run Parameter Sensitivity Experiment

This script runs a comprehensive parameter sensitivity analysis for BKT models.
Results will be saved to the specified output directory.

Usage:
    python run_experiment.py
    
Or with custom settings:
    python run_experiment.py --students 500 --output results/my_experiment
"""

import argparse
from datetime import datetime
from experiments.parameter_sensitivity import quick_sensitivity_analysis


def main():
    """Main function to run parameter sensitivity analysis."""
    parser = argparse.ArgumentParser(
        description='Run BKT parameter sensitivity analysis'
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
        help='Output directory (default: results/experiment_TIMESTAMP)'
    )
    
    args = parser.parse_args()
    
    # Generate output directory name with timestamp if not specified
    if args.output is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = f"results/experiment_{timestamp}"
    else:
        output_dir = args.output
    
    print("\n" + "="*70)
    print(" BKT PARAMETER SENSITIVITY ANALYSIS")
    print("="*70)
    print(f"\nConfiguration:")
    print(f"  Number of students: {args.students}")
    print(f"  Random seed: {args.seed}")
    print(f"  Output directory: {output_dir}")
    print("\nThis will take approximately 10-15 minutes...")
    print("="*70 + "\n")
    
    # Run the experiment
    results = quick_sensitivity_analysis(
        num_students=args.students,
        seed=args.seed,
        output_dir=output_dir
    )
    
    print("\n" + "="*70)
    print(" EXPERIMENT COMPLETE!")
    print("="*70)
    print(f"\nResults saved to: {output_dir}/")
    print("\nGenerated files:")
    print(f"  📊 sweep_p_init.csv")
    print(f"  📊 sweep_p_learn.csv")
    print(f"  📊 sweep_p_guess.csv")
    print(f"  📊 sweep_p_slip.csv")
    print(f"  🔥 interaction_p_init_vs_p_learn.csv")
    print(f"  🔥 interaction_p_guess_vs_p_slip.csv")
    print(f"  ⚠️  extreme_values_analysis.json")
    print(f"  ✅ parameter_recommendations.json")
    
    print("\n" + "="*70)
    print(" PARAMETER RECOMMENDATIONS")
    print("="*70)
    
    if 'recommendations' in results:
        for param_name, rec in results['recommendations'].items():
            print(f"\n{param_name.upper()}:")
            print(f"  Optimal value: {rec['optimal_value']:.4f}")
            print(f"  Recommended range: [{rec['recommended_range'][0]:.4f}, "
                  f"{rec['recommended_range'][1]:.4f}]")
            print(f"  Sensitivity: {rec['sensitivity']}")
    
    print("\n" + "="*70)
    print("\nNext steps:")
    print("  1. View results in the output directory")
    print("  2. Create visualizations:")
    print("     python create_visualizations.py --input", output_dir)
    print("  3. Review recommendations for your research")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
