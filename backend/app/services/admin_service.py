from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.question import Question
from app.schemas.admin import QuestionDraftRequest, QuestionSaveRequest, QuestionAnalysisResponse
from app.services.llm_client import auto_tag_question, extract_latex_from_image

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    async def extract_math_image(self, base64_image: str) -> dict:
        result = await extract_latex_from_image(base64_image)
        if result.startswith("ERROR:"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result
            )
        return {"latex": result}

    async def draft_question(self, request: QuestionDraftRequest) -> QuestionAnalysisResponse:
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

    async def save_question(self, request: QuestionSaveRequest) -> dict:
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
            self.db.add(new_question)
            self.db.commit()
            self.db.refresh(new_question)
            return {"id": new_question.id, "message": "Question saved successfully"}
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save question: {str(e)}"
            )
