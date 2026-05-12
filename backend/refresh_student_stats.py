import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.core.database import SessionLocal
from app.models.result import QuizAttempt, StudentStats
from app.services.kt_service import KTService

async def refresh_stats():
    db = SessionLocal()
    user_ids = [46, 45, 44, 43, 42] # Demo User IDs
    
    print(f"--- Refreshing StudentStats via KT Service ---")
    print(f"Target IDs: {user_ids}")
    
    for uid in user_ids:
        # 1. Fetch full attempt history for this user ordered by time
        attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == uid).order_by(QuizAttempt.attempted_at.asc()).all()
        
        if not attempts:
            print(f"  [Skip] User {uid}: No attempts found.")
            continue
            
        # 2. Format history for KT Service
        # Note: We use % 72 for skill_id because the current DKT model is trained on 72 unique skill indices (0-71)
        history = [
            {"skill_id": str(a.question_id % 72), "correct": 1 if a.is_correct else 0}
            for a in attempts
        ]
        
        # 3. Request new profile from KT Microservice
        profile = await KTService.profile_student(str(uid), history)
        
        if profile:
            # 4. Update or Create StudentStats record
            stats = db.query(StudentStats).filter(StudentStats.user_id == uid).first()
            if not stats:
                stats = StudentStats(user_id=uid)
                db.add(stats)
            
            stats.current_profile = profile['profile_label']
            stats.avg_mastery = profile['avg_mastery']
            
            print(f"  [OK] User {uid}: Profile -> {stats.current_profile} | Mastery -> {stats.avg_mastery:.4f}")
        else:
            print(f"  [!] User {uid}: Failed to reach KT Service or process profile.")
            
    try:
        db.commit()
        print(f"\nSUCCESS: All student stats have been synchronized with AI predictions.")
        print("You can now refresh the dashboard to see the updated characters and levels.")
    except Exception as e:
        db.rollback()
        print(f"\nERROR committing to DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Run the async refresh function
    asyncio.run(refresh_stats())
