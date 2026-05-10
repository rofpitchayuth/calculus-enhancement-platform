import pandas as pd
import json
import numpy as np
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.question import Question, ErrorCode

ERROR_CODES_DATA = [
    {"code": "correct_answer", "name": "Correct Answer", "category": "Success"},
    {"code": "sign_error", "name": "Sign Error", "category": "Calculation"},
    {"code": "arithmetic_error", "name": "Arithmetic Error", "category": "Calculation"},
    {"code": "fraction_operation_error", "name": "Fraction Operation Error", "category": "Algebra"},
    {"code": "algebra_simplification_error", "name": "Algebra Simplification Error", "category": "Algebra"},
    {"code": "forgot_chain_rule_inner", "name": "Forgot Chain Rule Inner", "category": "Calculus"},
    {"code": "product_quotient_mixup", "name": "Product/Quotient Rule Mixup", "category": "Calculus"},
    {"code": "derivative_instead_of_integral", "name": "Derivative Instead of Integral", "category": "Calculus"},
    {"code": "forgot_plus_c", "name": "Forgot +C", "category": "Calculus"},
    {"code": "wrong_u_sub_bounds", "name": "Wrong u-substitution Bounds", "category": "Calculus"},
    {"code": "trig_sign_error", "name": "Trigonometric Sign Error", "category": "Calculus"},
    {"code": "composite_evaluation_error", "name": "Composite Evaluation Error", "category": "Algebra"},
    {"code": "trig_evaluation_error", "name": "Trig Evaluation Error", "category": "Calculus"},
    {"code": "exponent_rule_error", "name": "Exponent Rule Error", "category": "Algebra"},
    {"code": "logarithm_rule_error", "name": "Logarithm Rule Error", "category": "Algebra"},
    {"code": "unclassified_error", "name": "Unclassified Error", "category": "Other"},
    {"code": "conceptual_misunderstanding", "name": "Conceptual Misunderstanding", "category": "Concept"},
    {"code": "indeterminate_form_misconception", "name": "Indeterminate Form Misconception", "category": "Concept"},
    {"code": "lhopital_applied_incorrectly", "name": "L'Hopital Applied Incorrectly", "category": "Calculus"},
    {"code": "wrong_trig_derivative_sign", "name": "Wrong Trig Derivative Sign", "category": "Calculus"},
    {"code": "constant_derivative_error", "name": "Constant Derivative Error", "category": "Calculus"},
    {"code": "u_sub_forgot_du", "name": "u-sub Forgot du", "category": "Calculus"},
    {"code": "wrong_integration_formula", "name": "Wrong Integration Formula", "category": "Calculus"},
    {"code": "radius_squared_error", "name": "Radius Squared Error", "category": "Calculus"},
    {"code": "wrong_curve_order_area", "name": "Wrong Curve Order for Area", "category": "Calculus"},
    {"code": "endpoint_extrema_forgotten", "name": "Endpoint Extrema Forgotten", "category": "Calculus"},
]

def seed_error_codes(db: Session):
    print("Seeding error codes...")
    for ec_data in ERROR_CODES_DATA:
        existing = db.query(ErrorCode).filter(ErrorCode.code == ec_data["code"]).first()
        if not existing:
            new_ec = ErrorCode(
                code=ec_data["code"],
                name=ec_data["name"],
                category=ec_data["category"]
            )
            db.add(new_ec)
    db.commit()
    print("Successfully seeded error codes.")

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
    
    # 1. Seed Error Codes First (to satisfy foreign key constraints)
    seed_error_codes(db)
    
    added_count = 0
    training_data = []
    
    for _, row in df.iterrows():
        choices_list = []
        for letter in ['a', 'b', 'c', 'd', 'e']:
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
        
        # Collect question data for training dataset
        question_record = {
            "question_text": str(row['question_text']),
            "correct_answer": correct_answer_id,
            "choices": choices_list,
            "main_topic": q.main_topic,
            "sub_topic": q.sub_topic,
            "skill_tags": skill_tags,
            "bloom_level": q.bloom_level,
            "difficulty": diff_val,
            "discrimination": disc_val
        }
        training_data.append(question_record)
        
        added_count += 1
        
    db.commit()
    print(f"Successfully inserted {added_count} questions into the database.")
    db.close()

    # Export collected data to JSON for ML training
    json_output_path = "training_data.json"
    try:
        with open(json_output_path, "w", encoding="utf-8") as f:
            json.dump(training_data, f, indent=4, ensure_ascii=False)
        print(f"Successfully exported {len(training_data)} records to {json_output_path}.")
    except Exception as e:
        print(f"Error exporting JSON: {e}")

if __name__ == "__main__":
    seed_db()
