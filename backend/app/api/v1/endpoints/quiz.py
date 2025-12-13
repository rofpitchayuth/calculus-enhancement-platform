from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.quiz_service import QuizService
from app.schemas.quiz import (
    QuizStartRequest,
    QuizStartResponse,
    QuizSubmitAnswerRequest,
    QuizSubmitResponse
)

router = APIRouter()

@router.post("/start", response_model=QuizStartResponse)
def start_quiz(
    request: QuizStartRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Start a new quiz session
    - Generates questions based on topic/criteria
    - Returns session_id for tracking
    """
    if request.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Cannot start quiz for another user")
    
    service = QuizService(db)
    try:
        return service.generate_quiz(
            user_id=request.user_id,
            topic=request.topic,
            num_questions=request.num_questions
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_answer(
    request: QuizSubmitAnswerRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Submit an answer to a question
    - Checks correctness
    - Updates IBKT mastery model
    - Returns updated mastery probability
    """
    if request.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Cannot submit answer for another user")
    
    service = QuizService(db)
    try:
        return service.submit_answer(
            user_id=request.user_id,
            question_id=request.question_id,
            user_answer=request.user_answer,
            skill_id=request.skill_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/mastery/{user_id}/{skill_id}")
def get_mastery(
    user_id: int,
    skill_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Get current mastery level for a specific skill
    (Utility endpoint for dashboard)
    """
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Cannot view other user's mastery")
    
    service = QuizService(db)
    p_mastery = service.ibkt_model.get_posterior(str(user_id), skill_id)
    
    return {
        "user_id": user_id,
        "skill_id": skill_id,
        "mastery_probability": p_mastery
    }
