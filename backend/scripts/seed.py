import pandas as pd
import json
import numpy as np
import sys
import os

# Add backend directory (parent of scripts/) to sys.path to allow imports from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.question import Question, ErrorCode, MainTopic, SubTopic

# Mapping for main_topic from Excel values to Enum values
MAIN_TOPIC_MAP = {
    "limits_and_continuity": MainTopic.LIMIT,
    "derivatives": MainTopic.DIFFERENTIAL,
    "integrals": MainTopic.INTEGRAL,
    "applications": MainTopic.APPLICATIONS,
    "limit": MainTopic.LIMIT,
    "differential": MainTopic.DIFFERENTIAL,
    "integral": MainTopic.INTEGRAL,
    "application": MainTopic.APPLICATIONS,
    "Limit": MainTopic.LIMIT,
    "Derivative": MainTopic.DIFFERENTIAL,
    "Integral": MainTopic.INTEGRAL,
    "Application": MainTopic.APPLICATIONS,
}

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

def seed_error_codes(db: Session) -> set:
    print("Seeding predefined error codes...")
    inserted_codes = set()
    for ec_data in ERROR_CODES_DATA:
        existing = db.query(ErrorCode).filter(ErrorCode.code == ec_data["code"]).first()
        if not existing:
            new_ec = ErrorCode(
                code=ec_data["code"],
                name=ec_data["name"],
                category=ec_data["category"]
            )
            db.add(new_ec)
        inserted_codes.add(ec_data["code"])
    db.commit()
    print(f"Successfully seeded {len(inserted_codes)} predefined error codes.")
    
    # Query all currently known error codes from DB to return complete set
    all_codes = {ec.code for ec in db.query(ErrorCode).all()}
    return all_codes

def seed_db():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(script_dir, "data.xlsx")
    sheet_name = "Question"
    
    print(f"Reading questions from: {excel_path} (sheet: '{sheet_name}')")
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
    except Exception as e:
        print(f"Error reading excel file: {e}")
        return

    df = df.replace({np.nan: None})
    
    db = SessionLocal()
    
    try:
        # 1. Seed Error Codes First (to satisfy foreign key constraints)
        known_error_codes = seed_error_codes(db)
        
        added_count = 0
        training_data = []
        
        print("Processing and inserting questions...")
        for _, row in df.iterrows():
            choices_list = []
            for letter in ['a', 'b', 'c', 'd', 'e']:
                choice_col = f'choice_{letter.lower()}'
                error_code_col = f'error_code_{letter}'
                
                # Check if there's a choice value and it's not nan
                if choice_col in row and pd.notna(row[choice_col]) and str(row[choice_col]).strip() != "":
                    choice_text = str(row[choice_col]).strip()
                    error_code = str(row.get(error_code_col, "")).strip() if error_code_col in row and pd.notna(row.get(error_code_col)) else None
                    
                    # If error code is provided but not yet in database, dynamically create it to prevent FK errors
                    if error_code and error_code not in known_error_codes and error_code.lower() != 'nan':
                        print(f"  [Info] Found unregistered error code in choices: '{error_code}'. Registering automatically...")
                        new_ec = ErrorCode(
                            code=error_code,
                            name=error_code,
                            category="Auto-generated",
                            explanation=f"Auto-generated error code {error_code} from seed file."
                        )
                        db.add(new_ec)
                        db.flush()
                        known_error_codes.add(error_code)
                    
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
                
            # Handle Main Topic Mapping
            raw_main_topic = row.get('main topic') if pd.notna(row.get('main topic')) else row.get('main_topic')
            main_topic_enum = None
            if pd.notna(raw_main_topic):
                raw_main_str = str(raw_main_topic).strip().lower().replace(" ", "_")
                # Try direct map or check if it matches enum value/name
                main_topic_enum = MAIN_TOPIC_MAP.get(raw_main_str)
                if not main_topic_enum:
                    # Extra fallbacks for common variations
                    if "limit" in raw_main_str: main_topic_enum = MainTopic.LIMIT
                    elif "deriv" in raw_main_str or "diff" in raw_main_str: main_topic_enum = MainTopic.DIFFERENTIAL
                    elif "integ" in raw_main_str: main_topic_enum = MainTopic.INTEGRAL
                    elif "app" in raw_main_str: main_topic_enum = MainTopic.APPLICATIONS
                    
                    if not main_topic_enum:
                        # Fallback: check if raw string matches any enum value or name directly
                        for m in MainTopic:
                            if raw_main_str.upper() == m.name or raw_main_str == m.value.lower():
                                main_topic_enum = m
                                break

            # Handle Sub Topic Mapping
            raw_sub_topic = str(row.get('sub_topic')).strip() if pd.notna(row.get('sub_topic')) else None
            sub_topic_enum = None
            if raw_sub_topic:
                # Try to match by Enum Name (e.g., 'ADV_DERIVATIVE_RULES')
                try:
                    sub_topic_enum = SubTopic[raw_sub_topic]
                except KeyError:
                    # Try to match by Enum Value (e.g., 'advanced_derivative_rules')
                    for m in SubTopic:
                        if raw_sub_topic == m.value or raw_sub_topic.lower() == m.value.lower():
                            sub_topic_enum = m
                            break

            # Check if question already exists in DB to prevent duplicates on multiple runs
            existing_q = db.query(Question).filter(Question.question_text == str(row['question_text'])).first()
            if existing_q:
                # Update properties if it already exists
                existing_q.correct_answer = correct_answer_id
                existing_q.choices = choices_list
                existing_q.main_topic = main_topic_enum.value if main_topic_enum else None
                existing_q.sub_topic = sub_topic_enum.value if sub_topic_enum else None
                existing_q.skill_tags = skill_tags
                existing_q.bloom_level = str(row['bloom_level']) if row.get('bloom_level') else None
                existing_q.difficulty = diff_val
                existing_q.discrimination = disc_val
            else:
                # Create a new question
                q = Question(
                    question_text=str(row['question_text']),
                    correct_answer=correct_answer_id,
                    choices=choices_list,
                    main_topic=main_topic_enum.value if main_topic_enum else None,
                    sub_topic=sub_topic_enum.value if sub_topic_enum else None,
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
                "main_topic": main_topic_enum.value if main_topic_enum else None,
                "sub_topic": sub_topic_enum.value if sub_topic_enum else None,
                "skill_tags": skill_tags,
                "bloom_level": str(row['bloom_level']) if row.get('bloom_level') else None,
                "difficulty": diff_val,
                "discrimination": disc_val
            }
            training_data.append(question_record)
            
            added_count += 1
            
        db.commit()
        print(f"Successfully processed {added_count} questions.")
        
        # Export collected data to JSON for ML training
        json_output_path = os.path.join(script_dir, "training_data.json")
        try:
            with open(json_output_path, "w", encoding="utf-8") as f:
                json.dump(training_data, f, indent=4, ensure_ascii=False)
            print(f"Successfully exported {len(training_data)} question records to: {json_output_path}")
        except Exception as e:
            print(f"Error exporting JSON file: {e}")
            
    except Exception as e:
        db.rollback()
        print(f"Error occurred during seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
