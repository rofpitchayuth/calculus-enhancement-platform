from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.recommendation_service import RecommendationService
from app.schemas.question import Question as QuestionSchema # Assuming standard question schema exists

router = APIRouter()

@router.get("/next-question")
async def get_next_adaptive_question(
    sub_topic: str = Query(..., description="The calculus sub-topic for practice"),
    difficulty_adjustment: str = Query("normal", regex="^(harder|easier|normal)$"),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Returns the next optimal question for the student based on their mastery level.
    Used for 'Adaptive Practice Mode'.
    """
    question = await RecommendationService.get_next_adaptive_question(
        db=db,
        user_id=current_user_id,
        sub_topic=sub_topic,
        difficulty_adjustment=difficulty_adjustment
    )
    
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"No suitable questions found for topic '{sub_topic}'. Try a different topic or check back later."
        )
        
    return {
        "id": question.id,
        "question_text": question.question_text,
        "choices": question.choices,
        "difficulty": question.difficulty,
        "bloom_level": question.bloom_level,
        "main_topic": question.main_topic,
        "sub_topic": question.sub_topic,
    }
