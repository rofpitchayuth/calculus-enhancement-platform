from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
from typing import Optional

from app.models.question import Question
from app.models.result import QuizAttempt, StudentStats

class RecommendationService:
    @staticmethod
    async def get_next_adaptive_question(
        db: Session, 
        user_id: int, 
        sub_topic: str,
        difficulty_adjustment: str = "normal"
    ) -> Optional[Question]:
        """
        Calculates the ZPD (Zone of Proximal Development) for a student
        based on StudentStats.skill_mastery and returns the most suitable next question.
        """
        
        # 1. Fetch current mastery from StudentStats directly
        stats = db.query(StudentStats).filter(StudentStats.user_id == user_id).first()
        mastery = 0.5
        if stats and stats.skill_mastery:
            mastery = stats.skill_mastery.get(sub_topic, 0.5)
            
        # 2. Anti-repetition: Filter recently correct questions (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_correct_ids = db.query(QuizAttempt.question_id).filter(
            and_(
                QuizAttempt.user_id == user_id,
                QuizAttempt.is_correct == True,
                QuizAttempt.attempted_at >= seven_days_ago
            )
        ).all()
        
        excluded_ids = [r[0] for r in recent_correct_ids if r[0] is not None]
        
        # 3. ZPD Adjustment Logic
        if difficulty_adjustment == "harder":
            target_min = min(0.8, mastery + 0.2)
            target_max = min(1.0, mastery + 0.4)
        elif difficulty_adjustment == "easier":
            target_min = max(0.0, mastery - 0.2)
            target_max = mastery
        else: # normal
            target_min = mastery
            target_max = min(1.0, mastery + 0.2)
        
        # Handle string and Enum types for sub_topic query
        question = db.query(Question).filter(
            and_(
                Question.sub_topic == sub_topic,
                Question.difficulty >= target_min,
                Question.difficulty <= target_max,
                not_(Question.id.in_(excluded_ids)) if excluded_ids else True
            )
        ).order_by(Question.difficulty.asc()).first()
        
        # 4. Fallback: If no question in ZPD, find the closest available difficulty
        if not question:
            question = db.query(Question).filter(
                and_(
                    Question.sub_topic == sub_topic,
                    not_(Question.id.in_(excluded_ids)) if excluded_ids else True
                )
            ).order_by(Question.difficulty.asc()).first()
            
        return question
