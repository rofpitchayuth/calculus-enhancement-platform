import pandas as pd
import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.result import QuizSession, QuizAttempt
from app.models.question import Question

def import_mock_data():
    print("Reading mock_exam_data.csv...")
    try:
        df = pd.read_csv("mock_exam_data.csv")
    except FileNotFoundError:
        print("Error: mock_exam_data.csv not found. Please run generate_mock_data.py first.")
        return

    db = SessionLocal()
    
    # 1. Get all existing question IDs from the database to map them to attempts
    print("Fetching existing questions from database...")
    all_questions = db.query(Question).all()
    if not all_questions:
        print("Error: No questions found in database. Please seed questions first.")
        return
    
    question_ids = [q.id for q in all_questions]
    # Create a simple mapping by topic if possible, else random
    topic_map = {}
    for q in all_questions:
        topic = str(q.main_topic.value).upper() if q.main_topic else "OTHER"
        if topic not in topic_map:
            topic_map[topic] = []
        topic_map[topic].append(q.id)

    print(f"Starting import for {len(df['student_id'].unique())} students...")
    
    try:
        for student_id in df['student_id'].unique():
            student_rows = df[df['student_id'] == student_id]
            archetype = student_rows.iloc[0]['archetype']
            
            # 2. Create a Mock Quiz Session for this student
            new_session = QuizSession(
                user_id=int(student_id),
                title=f"Demo Session - {archetype}",
                session_type="practice",
                start_time=datetime.fromisoformat(student_rows.iloc[0]['timestamp']),
                total_questions=len(student_rows),
                total_score=float(student_rows['is_correct'].mean() * 100)
            )
            db.add(new_session)
            db.flush() # Get the new session ID
            
            attempts_to_add = []
            for _, row in student_rows.iterrows():
                # Try to pick a question that matches the topic, otherwise pick random
                topic = str(row['topic']).upper()
                possible_ids = topic_map.get(topic, question_ids)
                q_id = random.choice(possible_ids)
                
                attempt = QuizAttempt(
                    user_id=int(row['student_id']),
                    session_id=new_session.id,
                    question_id=q_id,
                    is_correct=bool(row['is_correct']),
                    error_code=row['error_code'] if pd.notna(row['error_code']) else None,
                    attempted_at=datetime.fromisoformat(row['timestamp']),
                    skill_tag=row['topic'],
                    response_time=random.uniform(30.0, 120.0) # Random time between 30s - 2min
                )
                attempts_to_add.append(attempt)
            
            db.bulk_save_objects(attempts_to_add)
            print(f"  [OK] Imported {len(attempts_to_add)} attempts for User ID: {student_id} ({archetype})")
        
        db.commit()
        print("\nSUCCESS: All mock data has been imported into the database.")
        print("You can now refresh your dashboard to see the updated profiles.")
        
    except Exception as e:
        db.rollback()
        print(f"\nERROR during import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_mock_data()
