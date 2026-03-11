import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.question import Question, ErrorCode

def seed_error_codes():
    db = SessionLocal()
    try:
        # Get all questions
        questions = db.query(Question).all()
        
        unique_error_codes = set()
        
        for q in questions:
            if q.choices:
                for choice in q.choices:
                    error_code = choice.get("error_code")
                    if error_code and str(error_code).strip() and str(error_code) != 'nan':
                        unique_error_codes.add(str(error_code).strip())
        
        # Get existing error codes
        existing_codes = {ec.code for ec in db.query(ErrorCode).all()}
        
        added_count = 0
        for code in unique_error_codes:
            if code not in existing_codes:
                new_ec = ErrorCode(
                    code=code,
                    name=code,  # Set name same as code for now
                    category="Auto-generated",
                    explanation=f"Auto-generated error code {code}"
                )
                db.add(new_ec)
                added_count += 1
                
        db.commit()
        print(f"Successfully inserted {added_count} error codes into the database.")
    except Exception as e:
        print(f"Error seeding error codes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_error_codes()
