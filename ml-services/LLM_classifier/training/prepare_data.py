"""
Data Preprocessing for LoRA Training
Converts CSV dataset to training format for each classification task
"""
import pandas as pd
import json
from pathlib import Path
from sklearn.model_selection import train_test_split

def create_topic_classification_data(df):
    """Task 1: Topic Classification"""
    data = []
    for _, row in df.iterrows():
        data.append({
            "instruction": "Classify this calculus question into exactly ONE category: derivatives, integrals, limits, or applications. Answer with only the category name.",
            "input": row['question_text'],
            "output": row['main_topic']
        })
    return data

def create_skill_extraction_data(df):
    """Task 2: Skill Extraction"""
    data = []
    for _, row in df.iterrows():
        data.append({
            "instruction": "Extract the calculus techniques or skills needed for this question. Answer with comma-separated skill names.",
            "input": row['question_text'],
            "output": row['skill_tags']
        })
    return data

def create_bloom_detection_data(df):
    """Task 3: Bloom Level Detection"""
    data = []
    for _, row in df.iterrows():
        data.append({
            "instruction": "Classify this question according to Bloom's Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, or Create). Answer with only the level name.",
            "input": row['question_text'],
            "output": row['bloom_level']
        })
    return data

def create_difficulty_scoring_data(df):
    """Task 4: Difficulty Scoring"""
    data = []
    for _, row in df.iterrows():
        data.append({
            "instruction": "Rate the difficulty of this calculus question on a scale from 0.0 (very easy) to 1.0 (very hard). Answer with only a number.",
            "input": row['question_text'],
            "output": str(row['difficulty'])
        })
    return data

def prepare_training_data(csv_path, output_dir):
    """Main function to prepare all training data"""
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Validate data
    print(f"Total questions: {len(df)}")
    print(f"Topics distribution: {df['main_topic'].value_counts().to_dict()}")
    print(f"Bloom levels: {df['bloom_level'].value_counts().to_dict()}")
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Combine all tasks
    all_data = []
    all_data.extend(create_topic_classification_data(df))
    all_data.extend(create_skill_extraction_data(df))
    all_data.extend(create_bloom_detection_data(df))
    all_data.extend(create_difficulty_scoring_data(df))
    
    print(f"\nTotal training examples (4 tasks): {len(all_data)}")
    
    # Train/val/test split (80/10/10)
    train_data, temp_data = train_test_split(all_data, test_size=0.2, random_state=42)
    val_data, test_data = train_test_split(temp_data, test_size=0.5, random_state=42)
    
    print(f"Train: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
    
    # Save as JSONL
    def save_jsonl(data, filename):
        with open(output_path / filename, 'w', encoding='utf-8') as f:
            for item in data:
                f.write(json.dumps(item, ensure_ascii=False) + '\n')
    
    save_jsonl(train_data, 'train.jsonl')
    save_jsonl(val_data, 'val.jsonl')
    save_jsonl(test_data, 'test.jsonl')
    
    print(f"\n✅ Data saved to {output_dir}/")
    print("Files: train.jsonl, val.jsonl, test.jsonl")
    
    return len(train_data), len(val_data), len(test_data)

if __name__ == "__main__":
    CSV_PATH = "../data/training_dataset.csv"
    OUTPUT_DIR = "../data/processed"
    
    prepare_training_data(CSV_PATH, OUTPUT_DIR)
