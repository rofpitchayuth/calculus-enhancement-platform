from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin_user_id
from app.schemas.admin import QuestionDraftRequest, QuestionAnalysisResponse, QuestionSaveRequest, ImageOCRRequest
from app.services.admin_service import AdminService

router = APIRouter()

@router.post("/extract-math-image", dependencies=[Depends(get_current_admin_user_id)])
async def extract_math_image(request: ImageOCRRequest, db: Session = Depends(get_db)):
    """Accepts a base64 image, invokes OCR, and returns extracted LaTeX (admin only)."""
    admin_service = AdminService(db)
    return await admin_service.extract_math_image(request.base64_image)

@router.post("/draft-question", response_model=QuestionAnalysisResponse, dependencies=[Depends(get_current_admin_user_id)])
async def draft_question(request: QuestionDraftRequest, db: Session = Depends(get_db)):
    """Accepts a question and choices, invokes auto-tagging, returns analysis (admin only)."""
    admin_service = AdminService(db)
    return await admin_service.draft_question(request)

@router.post("/save-question", status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user_id)])
async def save_question(request: QuestionSaveRequest, db: Session = Depends(get_db)):
    """Inserts a human-reviewed question into the database (admin only)."""
    admin_service = AdminService(db)
    return await admin_service.save_question(request)
