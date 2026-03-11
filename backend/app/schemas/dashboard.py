from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardOverviewStats(BaseModel):
    totalChapters: str
    averageScore: str
    totalAttempts: str

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
