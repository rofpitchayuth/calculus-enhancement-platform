from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.models.question import Question
from app.models.result import QuizSession, QuizAttempt, StudentKnowledge, BKTResult
from app.schemas.quiz import QuestionResponse, QuizStartResponse, QuizSubmitResponse

class QuizService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_quiz(self, user_id: int, topic: Optional[str] = None, num_questions: int = 5) -> QuizStartResponse:
        query = self.db.query(Question)
        
        if topic:
            query = query.filter(Question.main_topic == topic)
        
        questions = query.order_by(func.random()).limit(num_questions).all()
        
        if not questions:
            raise ValueError("No questions available for the specified criteria")
        
        # Create a QuizSession instead of a dummy QuizAttempt
        session = QuizSession(
            user_id=user_id,
            title=f"{topic or 'General'} Quiz",
            session_type="practice",
            total_questions=len(questions),
            start_time=datetime.utcnow()
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        question_responses = [
            QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                choices=q.choices,
                difficulty=q.difficulty,
                bloom_level=q.bloom_level,
                skill_id=q.main_topic or "general"
            )
            for q in questions
        ]
        
        return QuizStartResponse(
            session_id=session.id,
            questions=question_responses,
            total_questions=len(questions)
        )
    
    def submit_answer(
        self,
        user_id: int,
        session_id: int,
        question_id: int,
        user_answer: str,
        skill_id: str
    ) -> QuizSubmitResponse:
        question = self.db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise ValueError(f"Question {question_id} not found")
            
        quiz_session = self.db.query(QuizSession).filter(QuizSession.id == session_id, QuizSession.user_id == user_id).first()
        if not quiz_session:
            raise ValueError(f"QuizSession {session_id} not found or unauthorized")
        
        is_correct = (user_answer.strip().lower() == question.correct_answer.strip().lower())
        
        # Mock BKT logic for now
        p_mastery_before = 0.5
        p_mastery_after = 0.6 if is_correct else 0.4
        p_correct_next = 0.7
        
        attempt = QuizAttempt(
            user_id=user_id,
            session_id=session_id,
            question_id=question_id,
            is_correct=is_correct,
            user_answer=user_answer,
            skill_tag=skill_id,
            difficulty=str(question.difficulty),
            attempted_at=datetime.utcnow()
        )
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        
        return QuizSubmitResponse(
            is_correct=is_correct,
            correct_answer=question.correct_answer,
            p_mastery_before=p_mastery_before,
            p_mastery_after=p_mastery_after,
            p_correct_next=p_correct_next
        )
    
    

    def end_quiz_session(self, user_id: int, session_id: int) -> dict:
        session = self.db.query(QuizSession).filter(
            QuizSession.id == session_id,
            QuizSession.user_id == user_id
        ).first()
        
        if not session:
            raise ValueError(f"QuizSession {session_id} not found or unauthorized")
        
        if session.end_time:
            raise ValueError(f"QuizSession {session_id} is already ended")
            
        # Calculate score
        attempts = self.db.query(QuizAttempt).filter(QuizAttempt.session_id == session_id).all()
        correct_count = sum(1 for a in attempts if a.is_correct)
        total_attempts = len(attempts)
        
        score = (correct_count / session.total_questions) * 100 if session.total_questions and session.total_questions > 0 else 0
        
        session.end_time = datetime.utcnow()
        session.total_score = score
        
        self.db.commit()
        
        return {
            "session_id": session.id,
            "total_score": score,
            "total_questions": session.total_questions or total_attempts,
            "start_time": session.start_time,
            "end_time": session.end_time
        }
