# schemas/dashboard.py
# Pydantic schemas for all dashboard API responses.
# These are the single source of truth for the JSON contract
# between the FastAPI backend and the React frontend.

from pydantic import BaseModel
from typing import List, Dict, Optional


# ─── Overview ──────────────────────────────────────────────────────────────

class DashboardOverviewStats(BaseModel):
    totalChapters: str
    averageScore: str
    totalAttempts: str
    studentProfile: str = "Developing (Average)"
    avgMastery: float = 0.0


# ─── Chapter Progress ─────────────────────────────────────────────────────

class ChapterProgress(BaseModel):
    completed: int
    total: int

class DashboardChapterProgressResponse(BaseModel):
    data: Dict[str, ChapterProgress]


# ─── Skills Radar ─────────────────────────────────────────────────────────

class RadarSkill(BaseModel):
    skill: str
    limit: int
    differential: int
    integral: int
    applications: int

class DashboardSkillsRadarResponse(BaseModel):
    data: List[RadarSkill]


# ─── Recent Attempts ──────────────────────────────────────────────────────

class RecentAttempt(BaseModel):
    attempt: int
    score: int
    date: str
    avgTime: Optional[int] = None
    strengths: List[str] = []
    weaknesses: List[str] = []

class DashboardRecentAttemptsResponse(BaseModel):
    data: List[RecentAttempt]


# ─── Chapter Stats ────────────────────────────────────────────────────────

class BloomLevel(BaseModel):
    label: str
    percent: float

class SkillTagMastery(BaseModel):
    skill_tag: str        # sub_topic label e.g. "chain_rule"
    accuracy: float       # 0.0 – 100.0 % correct
    attempt_count: int    # total questions attempted for this skill

class ChapterStatsResponse(BaseModel):
    proficiencyLevel: str
    totalAttempts: int
    avgTimePerQuestion: float
    bloomLevels: List[BloomLevel]
    strengths: List[SkillTagMastery]
    weaknesses: List[SkillTagMastery]


# ─── Chapter Attempts ─────────────────────────────────────────────────────

class ChapterAttemptRecord(BaseModel):
    attempt: int
    date: str
    score: float
    avgTime: float

class ChapterAttemptsResponse(BaseModel):
    data: List[ChapterAttemptRecord]


# ─── Chapter Sessions ─────────────────────────────────────────────────────

class ChapterSession(BaseModel):
    sessionId: int
    attempt: int
    date: str

class ChapterSessionsResponse(BaseModel):
    data: List[ChapterSession]


# ─── Session Report ───────────────────────────────────────────────────────

class SkillBreakdown(BaseModel):
    skill: str
    accuracy: float

class ErrorAnalysisItem(BaseModel):
    id: int
    topic: str
    errorCount: int
    errorRate: str
    suggestion: str

class ScoreDistributionItem(BaseModel):
    name: str
    value: int

class QuizQuestionItem(BaseModel):
    """Individual question result within a session report."""
    question_number: int
    question_text: str
    choices: list = []
    user_answer: str
    correct_answer: str
    is_correct: bool

class SessionReportResponse(BaseModel):
    chapterId: str
    correctAnswers: int
    totalQuestions: int
    avgTimePerQuestion: float
    avgDifficulty: float = 0.5
    strengths: List[str]
    weaknesses: List[str]
    skillBreakdown: List[SkillBreakdown]
    errorAnalysis: List[ErrorAnalysisItem]
    scoreDistribution: List[ScoreDistributionItem]
    quizQuestions: List[QuizQuestionItem] = []


# ─── Topics Summary ──────────────────────────────────────────────────────

class TopicSummary(BaseModel):
    topicId: str
    displayName: str
    latestScore: float
    totalAttempts: int
    proficiencyLevel: str

class TopicsSummaryResponse(BaseModel):
    data: List[TopicSummary]


# ─── Shared Utility ──────────────────────────────────────────────────────

PROFICIENCY_THRESHOLDS = [
    (80, "Excellent"),
    (60, "Good"),
    (40, "Developing"),
    (0,  "Beginner"),
]


class SkillTagMasteryResponse(BaseModel):
    strengths:  List[SkillTagMastery]   # top 5 by accuracy (min 3 attempts)
    weaknesses: List[SkillTagMastery]   # bottom 5 by accuracy (min 3 attempts)