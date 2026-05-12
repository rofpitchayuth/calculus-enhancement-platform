import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Constants for Mock Data
TOPICS = ["LIMIT", "DIFFERENTIAL", "INTEGRAL", "APPLICATIONS"]
BLOOM_LEVELS = ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"]

CARELESS_ERRORS = ["sign_error", "arithmetic_error", "fraction_operation_error"]
FUNDAMENTAL_ERRORS = ["conceptual_misunderstanding", "wrong_integration_formula", "derivative_instead_of_integral", "forgot_chain_rule_inner"]
ALL_ERRORS = CARELESS_ERRORS + FUNDAMENTAL_ERRORS + ["forgot_plus_c", "trig_sign_error", "exponent_rule_error"]

def generate_question_pool(num_questions=50):
    """Generates a diverse pool of calculus questions."""
    questions = []
    for i in range(num_questions):
        q = {
            "question_id": f"Q{i+1:03d}",
            "topic": random.choice(TOPICS),
            "difficulty": round(random.uniform(0.1, 1.0), 2),
            "bloom_level": random.choice(BLOOM_LEVELS)
        }
        questions.append(q)
    return questions

def simulate_student(student_id, archetype, questions, num_attempts=30):
    """Simulates a sequence of exam attempts for a specific student archetype."""
    attempts = []
    start_time = datetime(2026, 5, 1, 10, 0, 0)
    
    # Shuffle and select questions for this student
    selected_questions = random.sample(questions, num_attempts)
    
    for i, q in enumerate(selected_questions):
        attempt_time = start_time + timedelta(days=i//5, hours=i%5) # Simulate doing ~5 questions a day
        diff = q["difficulty"]
        
        is_correct = False
        error_code = None
        
        if archetype == "Lucky Guesser":
            # Low mastery, but gets hard questions correct randomly (guessing)
            if diff > 0.7:
                is_correct = random.random() < 0.35 # 35% luck on hard
            else:
                is_correct = random.random() < 0.20 # 20% on others
            
            if not is_correct:
                error_code = random.choice(ALL_ERRORS)
                
        elif archetype == "Careless (High Slip)":
            # High ability, but HIGH SLIP on easy questions
            if diff < 0.4:
                is_correct = random.random() < 0.40 # High slip rate on easy
            elif diff < 0.7:
                is_correct = random.random() < 0.70 # Medium slip
            else:
                is_correct = random.random() < 0.95 # Focused on hard ones
                
            if not is_correct:
                error_code = random.choice(CARELESS_ERRORS)
                
        elif archetype == "High Achiever":
            # Very high mastery. 98% correct across all.
            is_correct = random.random() < 0.98
                
            if not is_correct:
                error_code = random.choice(ALL_ERRORS)
                
        elif archetype == "Developing (Average)":
            # Clear learning curve: 30% -> 90%
            progress_factor = i / num_attempts
            base_prob = 0.3 + (progress_factor * 0.6) 
            prob = base_prob - (diff * 0.2)
            is_correct = random.random() < max(0.2, prob)
            
            if not is_correct:
                if progress_factor < 0.5:
                    error_code = random.choice(FUNDAMENTAL_ERRORS)
                else:
                    error_code = random.choice(CARELESS_ERRORS)
                    
        elif archetype == "Struggling":
            # Consistently low. 15-20% correct.
            is_correct = random.random() < 0.20
                
            if not is_correct:
                error_code = random.choice(FUNDAMENTAL_ERRORS)
        
        attempts.append({
            "student_id": student_id,
            "archetype": archetype,
            "timestamp": attempt_time.isoformat(),
            "question_id": q["question_id"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "bloom_level": q["bloom_level"],
            "is_correct": bool(is_correct),
            "error_code": error_code
        })
        
    return attempts

def main():
    print("Generating question pool...")
    questions = generate_question_pool(100)
    
    profiles = [
        {"id": 46, "archetype": "Lucky Guesser"},
        {"id": 45, "archetype": "Careless (High Slip)"},
        {"id": 44, "archetype": "High Achiever"},
        {"id": 43, "archetype": "Developing (Average)"},
        {"id": 42, "archetype": "Struggling"}
    ]
    
    all_data = []
    
    print("Simulating student attempts...")
    for p in profiles:
        student_data = simulate_student(p["id"], p["archetype"], questions, num_attempts=30)
        all_data.extend(student_data)
        
    df = pd.DataFrame(all_data)
    
    # Calculate some quick stats to verify logic
    stats = df.groupby('archetype').agg(
        total_attempts=('is_correct', 'count'),
        accuracy=('is_correct', 'mean')
    ).reset_index()
    
    print("\nSummary Statistics by Archetype:")
    print(stats.to_string(index=False))
    
    output_file = "mock_exam_data.csv"
    df.to_csv(output_file, index=False)
    print(f"\nSuccessfully generated {len(df)} records.")
    print(f"Data saved to {output_file}")

if __name__ == "__main__":
    main()
