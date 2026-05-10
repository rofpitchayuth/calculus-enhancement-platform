# api/v1/endpoints/dashboard.py
# เพิ่ม 3 route ใหม่ต่อท้าย router เดิม

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import (
    DashboardOverviewStats,
    DashboardChapterProgressResponse,
    DashboardSkillsRadarResponse,
    DashboardRecentAttemptsResponse,
    # NEW
    ChapterStatsResponse,
    ChapterAttemptsResponse,
    SessionReportResponse,
    ChapterSessionsResponse, 
    TopicsSummaryResponse,
    SkillTagMasteryResponse,
)

router = APIRouter()

# ─── Existing routes (ไม่เปลี่ยน) ────────────────────────────────────────

@router.get("/overview", response_model=DashboardOverviewStats)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    return DashboardService(db).get_overview_stats(current_user_id)


@router.get("/chapter-progress", response_model=DashboardChapterProgressResponse)
def get_dashboard_chapter_progress(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    return DashboardService(db).get_chapter_progress(current_user_id)


@router.get("/skills-radar", response_model=DashboardSkillsRadarResponse)
def get_dashboard_skills_radar(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    return DashboardService(db).get_skills_radar(current_user_id)


@router.get("/recent-attempts", response_model=DashboardRecentAttemptsResponse)
def get_dashboard_recent_attempts(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    return DashboardService(db).get_recent_attempts(current_user_id)


# ─── NEW routes ───────────────────────────────────────────────────────────

@router.get("/chapter/{chapter_id}/stats", response_model=ChapterStatsResponse)
def get_chapter_stats(
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """สถิติรวมของบทนั้นๆ: Bloom levels, strengths/weaknesses, proficiency"""
    return DashboardService(db).get_chapter_stats(chapter_id, current_user_id)


@router.get("/chapter/{chapter_id}/attempts", response_model=ChapterAttemptsResponse)
def get_chapter_attempts(
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """ประวัติการทำแบบทดสอบในบทนั้นๆ แยกเป็นรายครั้ง"""
    return DashboardService(db).get_chapter_attempts(chapter_id, current_user_id)


@router.get("/session/{session_id}/report", response_model=SessionReportResponse)
def get_session_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """รายงานผลของ session เดียว: donut chart, skill breakdown, error analysis"""
    return DashboardService(db).get_session_report(session_id, current_user_id)

@router.get("/chapter/{chapter_id}/sessions", response_model=ChapterSessionsResponse)
def get_chapter_sessions(
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    return DashboardService(db).get_chapter_sessions(chapter_id, current_user_id)

@router.get("/topics/summary", response_model=TopicsSummaryResponse)
def get_topics_summary(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """คะแนนล่าสุดของแต่ละ topic — ใช้ใน AllDashboard"""
    return DashboardService(db).get_topics_summary(current_user_id)


@router.get("/skill-tags/mastery", response_model=SkillTagMasteryResponse)
def get_skill_tags_mastery(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Top-5 strengths + bottom-5 weaknesses ตาม sub_topic accuracy %.
    ใช้แสดง Strengths/Weaknesses panel บน Overview Dashboard
    """
    return DashboardService(db).get_skill_mastery(current_user_id)