from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardOverviewStats(BaseModel):
    totalChapters: str
    averageScore: str
    totalAttempts: str
    # AI-generated student profile from the KT microservice.
    # These fields are read from the users table and reflect the most recent
    # profile computed after the student's last completed quiz session.
    studentProfile: str = "Developing (Average)"
    avgMastery: float = 0.0


class ChapterProgress(BaseModel):
    completed: int
    total: int

class DashboardChapterProgressResponse(BaseModel):
    data: Dict[str, ChapterProgress]

class RadarSkill(BaseModel):
    skill: str
    limit: int
    differential: int
    integral: int

class DashboardSkillsRadarResponse(BaseModel):
    data: List[RadarSkill]

class RecentAttempt(BaseModel):
    attempt: int
    score: int
    date: str
    avgTime: Optional[int]

class DashboardRecentAttemptsResponse(BaseModel):
    data: List[RecentAttempt]
