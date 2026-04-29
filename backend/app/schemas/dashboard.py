# schemas/dashboard.py

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# ─────────────────────────────────────────────
# Existing schemas (ไม่เปลี่ยน)
# ─────────────────────────────────────────────

class DashboardOverviewStats(BaseModel):
    totalChapters: str
    averageScore: str
    totalAttempts: str
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
    strengths: List[str] = []   # ← เพิ่ม
    weaknesses: List[str] = []  # ← เพิ่ม

class DashboardRecentAttemptsResponse(BaseModel):
    data: List[RecentAttempt]


# ─────────────────────────────────────────────
# NEW: Chapter Stats  (GET /dashboard/chapter/{chapter_id}/stats)
# ─────────────────────────────────────────────

class BloomLevel(BaseModel):
    label: str
    percent: float

class ChapterStatsResponse(BaseModel):
    proficiencyLevel: str
    totalAttempts: int
    avgTimePerQuestion: float
    bloomLevels: List[BloomLevel]
    strengths: List[str]
    weaknesses: List[str]


# ─────────────────────────────────────────────
# NEW: Chapter Attempts  (GET /dashboard/chapter/{chapter_id}/attempts)
# ─────────────────────────────────────────────

class ChapterAttemptRecord(BaseModel):
    attempt: int
    date: str
    score: float
    avgTime: float

class ChapterAttemptsResponse(BaseModel):
    data: List[ChapterAttemptRecord]


# ─────────────────────────────────────────────
# NEW: Session Report  (GET /dashboard/session/{session_id}/report)
# ─────────────────────────────────────────────

class SkillBreakdown(BaseModel):
    skill: str
    accuracy: float          # 0–100

class ErrorAnalysisItem(BaseModel):
    id: int
    topic: str
    errorCount: int
    errorRate: str           # เช่น "20%"
    suggestion: str

class ScoreDistributionItem(BaseModel):
    name: str                # "ถูก" / "ผิด"
    value: int

class SessionReportResponse(BaseModel):
    chapterId: str
    correctAnswers: int
    totalQuestions: int
    avgTimePerQuestion: float
    strengths: List[str]
    weaknesses: List[str]
    skillBreakdown: List[SkillBreakdown]
    errorAnalysis: List[ErrorAnalysisItem]
    scoreDistribution: List[ScoreDistributionItem]

class ChapterSession(BaseModel):
    sessionId: int
    attempt: int
    date: str

class ChapterSessionsResponse(BaseModel):
    data: List[ChapterSession]
class TopicSummary(BaseModel):
    topicId: str          # frontend id: "derivatives"
    displayName: str      # "Derivatives"
    latestScore: float    # คะแนนครั้งล่าสุด (0-100)
    totalAttempts: int    # จำนวนครั้งที่ทำทั้งหมด
    proficiencyLevel: str
 
class TopicsSummaryResponse(BaseModel):
    data: List[TopicSummary]
 