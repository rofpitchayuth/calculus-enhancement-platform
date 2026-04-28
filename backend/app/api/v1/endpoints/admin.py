from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.admin import (
    QuestionDraftRequest, 
    QuestionAnalysisResponse, 
    QuestionSaveRequest,
    ImageOCRRequest
)
from app.models.question import Question
from app.services.grader_client import call_grader_pipeline
from app.schemas.grader import GraderRequest

router = APIRouter()

from app.services.llm_client import auto_tag_question, extract_latex_from_image

@router.post("/extract-math-image")
async def extract_math_image(request: ImageOCRRequest):
    """
    Accepts a base64 image, invokes the OCR vision service,
    and returns the extracted LaTeX.
    """
    result = await extract_latex_from_image(request.base64_image)
    
    if result.startswith("ERROR:"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result
        )
    
    return {"latex": result}

@router.post("/draft-question", response_model=QuestionAnalysisResponse)
async def draft_question(request: QuestionDraftRequest):
    """
    Accepts a question and choices, invokes the auto tagging service,
    and returns the analysis for expert review.
    """
    result = await auto_tag_question(
        request.question_text,
        request.choice_a,
        request.choice_b,
        request.choice_c,
        request.choice_d,
        request.choice_e
    )
    
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
        step_by_step_analysis=result.step_by_step_analysis,
        main_topic=result.main_topic,
        sub_topic=result.sub_topic,
        skill_tags=result.skill_tags,
        bloom_level=result.bloom_level,
        difficulty=result.difficulty,
        discrimination=result.discrimination,
        error_code_A=result.error_code_A,
        error_code_B=result.error_code_B,
        error_code_C=result.error_code_C,
        error_code_D=result.error_code_D,
        error_code_E=result.error_code_E
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
