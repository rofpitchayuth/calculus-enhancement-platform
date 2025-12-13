from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.models.question import Question
from app.models.result import QuizAttempt, StudentKnowledge, IBKTResult
from app.schemas.quiz import QuestionResponse, QuizStartResponse, QuizSubmitResponse
from ibkt.model import IBKTModel
from ibkt.storage import load_model, save_model

class QuizService:
    def __init__(self, db: Session):
        self.db = db
        self.ibkt_model: IBKTModel = load_model()
    
    def generate_quiz(self, user_id: int, topic: Optional[str] = None, num_questions: int = 5) -> QuizStartResponse:
        query = self.db.query(Question)
        
        if topic:
            query = query.filter(Question.main_topic == topic)
        
        questions = query.order_by(func.random()).limit(num_questions).all()
        
        if not questions:
            raise ValueError("No questions available for the specified criteria")
        
        session = QuizAttempt(
            user_id=user_id,
            question_id=0,
            is_correct=False,
            attempted_at=datetime.utcnow()
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
        question_id: int,
        user_answer: str,
        skill_id: str
    ) -> QuizSubmitResponse:
        question = self.db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise ValueError(f"Question {question_id} not found")
        
        is_correct = (user_answer.strip().lower() == question.correct_answer.strip().lower())
        
        p_mastery_before = self.ibkt_model.get_posterior(
            user_id=str(user_id),
            skill_id=skill_id
        )
        
        p_mastery_after = self.ibkt_model.update_with_result(
            user_id=str(user_id),
            item_id=str(question_id),
            skill_id=skill_id,
            correct=1 if is_correct else 0
        )
        
        p_correct_next = self.ibkt_model.predict_correct_prob(
            user_id=str(user_id),
            item_id=str(question_id),
            skill_id=skill_id
        )
        
        save_model(self.ibkt_model)
        
        attempt = QuizAttempt(
            user_id=user_id,
            question_id=question_id,
            is_correct=is_correct,
            user_answer=user_answer,
            skill_tag=skill_id,
            attempted_at=datetime.utcnow()
        )
        self.db.add(attempt)
        
        ibkt_result = IBKTResult(
            user_id=user_id,
            quiz_attempt_id=attempt.id if attempt.id else 0, 
            skill_tag=skill_id,
            p_prior=p_mastery_before,
            p_posterior=p_mastery_after,
            created_at=datetime.utcnow()
        )
        
        self.db.commit()
        self.db.refresh(attempt)
        
        ibkt_result.quiz_attempt_id = attempt.id
        self.db.add(ibkt_result)
        self.db.commit()
        
        self._update_student_knowledge(user_id, skill_id, p_mastery_after)
        
        return QuizSubmitResponse(
            is_correct=is_correct,
            correct_answer=question.correct_answer,
            p_mastery_before=p_mastery_before,
            p_mastery_after=p_mastery_after,
            p_correct_next=p_correct_next
        )
    
    def _update_student_knowledge(self, user_id: int, skill_id: str, mastery: float):
        knowledge = self.db.query(StudentKnowledge).filter(
            StudentKnowledge.user_id == user_id
        ).first()
        
        if not knowledge:
            knowledge = StudentKnowledge(
                user_id=user_id,
                skill_mastery={}
            )
            self.db.add(knowledge)
        
        if knowledge.skill_mastery is None:
            knowledge.skill_mastery = {}
        
        knowledge.skill_mastery[skill_id] = mastery
        knowledge.last_updated = datetime.utcnow()
        
        self.db.commit()
