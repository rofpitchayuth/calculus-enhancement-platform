from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.models.question import Question
from app.models.result import QuizSession, QuizAttempt
from app.schemas.dashboard import (
    DashboardOverviewStats,
    DashboardChapterProgressResponse,
    DashboardSkillsRadarResponse,
    DashboardRecentAttemptsResponse,
    ChapterProgress,
    RadarSkill,
    RecentAttempt
)

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_overview_stats(self, user_id: int) -> DashboardOverviewStats:
        # Get all completed sessions for this user
        sessions = self.db.query(QuizSession).filter(
            QuizSession.user_id == user_id,
            QuizSession.end_time.isnot(None)
        ).all()

        total_attempts = len(sessions)
        
        if total_attempts == 0:
            return DashboardOverviewStats(
                totalChapters="3 บท",
                averageScore="0%",
                totalAttempts="0 รอบ"
            )

        # Calculate average score across all sessions
        average_score = sum(session.total_score or 0 for session in sessions) / total_attempts

        return DashboardOverviewStats(
            totalChapters="3 บท",
            averageScore=f"{round(average_score)}%",
            totalAttempts=f"{total_attempts} รอบ"
        )
        
    def get_chapter_progress(self, user_id: int) -> DashboardChapterProgressResponse:
        # In a real app with BKT, this would query mastery percentages.
        # For now, we will query the attempts and calculate a simple % correct per topic.
        progress_data = {
            "limit": ChapterProgress(completed=0, total=100),
            "differential": ChapterProgress(completed=0, total=100),
            "integral": ChapterProgress(completed=0, total=100)
        }
        
        # Calculate for each main topic
        for topic in ["limit", "differential", "integral"]:
            attempts = self.db.query(QuizAttempt).join(Question).filter(
                QuizAttempt.user_id == user_id,
                Question.main_topic == topic
            ).all()
            
            if attempts:
                correct = sum(1 for a in attempts if a.is_correct)
                percentage = int((correct / len(attempts)) * 100)
                progress_data[topic] = ChapterProgress(completed=percentage, total=100)
                
        return DashboardChapterProgressResponse(data=progress_data)

    def get_skills_radar(self, user_id: int) -> DashboardSkillsRadarResponse:
        # BKT tracking for specific sub-skills (Concept, Calculation, Application, Analysis) 
        # is not fully modeled yet to map to these 4 categories.
        # Returning mock data mixed with random slight variations for demonstration
        import random
        base_radar = [
            {"skill": "Concept", "limit": 82, "differential": 78, "integral": 65},
            {"skill": "Calculation", "limit": 85, "differential": 80, "integral": 70},
            {"skill": "Application", "limit": 75, "differential": 65, "integral": 55},
            {"skill": "Analysis", "limit": 80, "differential": 70, "integral": 60},
            {"skill": "Evaluation", "limit": 70, "differential": 60, "integral": 50},
        ]
        
        radar_skills = []
        for item in base_radar:
            radar_skills.append(RadarSkill(
                skill=item["skill"],
                limit=min(100, max(0, item["limit"] + random.randint(-5, 5))),
                differential=min(100, max(0, item["differential"] + random.randint(-5, 5))),
                integral=min(100, max(0, item["integral"] + random.randint(-5, 5)))
            ))
            
        return DashboardSkillsRadarResponse(data=radar_skills)
        
    def get_recent_attempts(self, user_id: int, num_attempts: int = 5) -> DashboardRecentAttemptsResponse:
        sessions = self.db.query(QuizSession).filter(
            QuizSession.user_id == user_id,
            QuizSession.end_time.isnot(None)
        ).order_by(QuizSession.end_time.desc()).limit(num_attempts).all()
        
        # Reverse to show chronological order
        sessions.reverse()
        
        recent_data = []
        for idx, session in enumerate(sessions):
            duration_seconds = (session.end_time - session.start_time).total_seconds()
            avg_time = int(duration_seconds / session.total_questions) if session.total_questions and session.total_questions > 0 else 0
            
            recent_data.append(RecentAttempt(
                attempt=idx + 1,
                score=int(session.total_score) if session.total_score else 0,
                date=session.end_time.strftime("%d/%m"),
                avgTime=avg_time
            ))
            
        return DashboardRecentAttemptsResponse(data=recent_data)
