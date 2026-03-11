from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import (
    DashboardOverviewStats,
    DashboardChapterProgressResponse,
    DashboardSkillsRadarResponse,
    DashboardRecentAttemptsResponse
)

router = APIRouter()

@router.get("/overview", response_model=DashboardOverviewStats)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    service = DashboardService(db)
    return service.get_overview_stats(current_user_id)

@router.get("/chapter-progress", response_model=DashboardChapterProgressResponse)
def get_dashboard_chapter_progress(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    service = DashboardService(db)
    return service.get_chapter_progress(current_user_id)

@router.get("/skills-radar", response_model=DashboardSkillsRadarResponse)
def get_dashboard_skills_radar(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    service = DashboardService(db)
    return service.get_skills_radar(current_user_id)

@router.get("/recent-attempts", response_model=DashboardRecentAttemptsResponse)
def get_dashboard_recent_attempts(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    service = DashboardService(db)
    return service.get_recent_attempts(current_user_id)
