from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.admin import QuestionDraftRequest, QuestionAnalysisResponse, QuestionSaveRequest
from app.models.question import Question
from app.services.grader_client import call_grader_pipeline
from app.schemas.grader import GraderRequest

router = APIRouter()

from app.services.llm_client import auto_tag_question

@router.post("/draft-question", response_model=QuestionAnalysisResponse)
async def draft_question(request: QuestionDraftRequest):
    """
    Accepts a question and choices, invokes the auto tagging service,
    and returns the analysis for expert review.
    """
    result = await auto_tag_question(request.question_text)
    
    if isinstance(result, str):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result
        )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze question."
        )
        
    return QuestionAnalysisResponse(
        step_by_step_analysis="Analysis provided by Unified ML Service.",
        main_topic=result.main_topic,
        sub_topic="N/A",
        skill_tags=result.skill_tags,
        bloom_level=result.bloom_level,
        difficulty=result.difficulty,
        discrimination=0.5,
        error_code_A="unclassified_error",
        error_code_B="unclassified_error",
        error_code_C="unclassified_error",
        error_code_D="unclassified_error",
        error_code_E="unclassified_error"
    )

@router.post("/save-question", status_code=status.HTTP_201_CREATED)
async def save_question(request: QuestionSaveRequest, db: Session = Depends(get_db)):
    """
    Inserts a human-reviewed question into the database.
    """
    try:
        new_question = Question(
            question_text=request.question_text,
            choices=request.choices,
            correct_answer=request.correct_answer,
            main_topic=request.main_topic,
            sub_topic=request.sub_topic,
            bloom_level=request.bloom_level,
            difficulty=request.difficulty,
            discrimination=request.discrimination,
            skill_tags=request.skill_tags,
            content_json=request.content_json
        )
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        return {"id": new_question.id, "message": "Question saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save question: {str(e)}"
        )
