import pandas as pd
import json
import numpy as np
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.question import Question

def seed_db():
    excel_path = "data.xlsx"
    sheet_name = "Question"
    
    print(f"Reading {excel_path} sheet {sheet_name}...")
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
    except Exception as e:
        print(f"Error reading excel: {e}")
        return

    df = df.replace({np.nan: None})
    
    db = SessionLocal()
    added_count = 0
    
    for _, row in df.iterrows():
        choices_list = []
        for letter in ['A', 'B', 'C', 'D', 'E']:
            choice_col = f'choice_{letter.lower()}'
            error_code_col = f'error_code_{letter}'
            
            # Check if there's a choice value and it's not nan
            if choice_col in row and pd.notna(row[choice_col]) and str(row[choice_col]).strip() != "":
                choice_text = str(row[choice_col]).strip()
                error_code = str(row.get(error_code_col, "")).strip() if error_code_col in row and pd.notna(row.get(error_code_col)) else None
                
                # Add to JSON list
                choices_list.append({
                    "id": letter,
                    "text": choice_text,
                    "error_code": error_code
                })
        
        # correct_answer from excel is usually 'A', 'B', 'C', 'D', 'E'
        raw_correct = str(row.get('correct_answer', '')).upper().strip()
        correct_answer_id = raw_correct
        
        skill_tags = []
        if pd.notna(row.get('skill_tags')) and row.get('skill_tags'):
            skill_tags = [tag.strip() for tag in str(row['skill_tags']).split(',')]
            
        try:
            diff_val = float(str(row.get('difficulty')).strip()) if str(row.get('difficulty')).strip() not in ['-', 'None', ''] else 0.5
        except ValueError:
            diff_val = 0.5
            
        try:
            disc_val = float(str(row.get('discrimination')).strip()) if str(row.get('discrimination')).strip() not in ['-', 'None', ''] else 1.0
        except ValueError:
            disc_val = 1.0
            
        q = Question(
            question_text=str(row['question_text']),
            correct_answer=correct_answer_id,
            choices=choices_list,
            main_topic=str(row['main topic']) if pd.notna(row.get('main topic')) else (str(row['main_topic']) if pd.notna(row.get('main_topic')) else None),
            sub_topic=str(row['sub_topic']) if pd.notna(row.get('sub_topic')) else None,
            skill_tags=skill_tags,
            bloom_level=str(row['bloom_level']) if row.get('bloom_level') else None,
            difficulty=diff_val,
            discrimination=disc_val,
        )
        db.add(q)
        added_count += 1
        
    db.commit()
    print(f"Successfully inserted {added_count} questions into the database.")
    db.close()

if __name__ == "__main__":
    seed_db()
