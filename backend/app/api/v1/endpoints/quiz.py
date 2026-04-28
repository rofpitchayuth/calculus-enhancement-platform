from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.quiz_service import QuizService
from app.schemas.quiz import (
    QuizStartRequest,
    QuizStartResponse,
    QuizSubmitAnswerRequest,
    QuizSubmitResponse,
    QuizEndRequest,
    QuizEndResponse
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
            session_id=request.session_id,
            question_id=request.question_id,
            user_answer=request.user_answer,
            skill_id=request.skill_id,
            response_latency=request.response_latency
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
    
    # Return mock data for now
    p_mastery = 0.5
    
    return {
        "user_id": user_id,
        "skill_id": skill_id,
        "mastery_probability": p_mastery
    }

@router.post("/end", response_model=QuizEndResponse)
def end_quiz(
    request: QuizEndRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    End an active quiz session
    - Calculates the total score for the session based on all attempts
    - Marks session end time
    """
    if request.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Cannot end quiz for another user")
    
    service = QuizService(db)
    try:
        return service.end_quiz_session(
            user_id=request.user_id,
            session_id=request.session_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
