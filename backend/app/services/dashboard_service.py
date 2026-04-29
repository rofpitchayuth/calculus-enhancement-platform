# services/dashboard_service.py
# เพิ่ม 3 method ใหม่ต่อท้าย class เดิม

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.models.question import Question
from app.models.result import QuizSession, QuizAttempt
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverviewStats,
    DashboardChapterProgressResponse,
    DashboardSkillsRadarResponse,
    DashboardRecentAttemptsResponse,
    ChapterProgress, RadarSkill, RecentAttempt,
    # NEW
    ChapterStatsResponse, BloomLevel,
    ChapterAttemptsResponse, ChapterAttemptRecord,
    SessionReportResponse, SkillBreakdown, ErrorAnalysisItem, ScoreDistributionItem,
    ChapterSession, ChapterSessionsResponse,  TopicSummary, TopicsSummaryResponse,
)

# Map: frontend chapterId → DB main_topic
CHAPTER_TOPIC_MAP: dict[str, str] = {
    "limits_and_continuity": "limit",
    "derivatives":           "differential",
    "integrals":             "integral",
    "applications":          "differential",  # หรือ topic ที่ตรงใน DB
}

PROFICIENCY_THRESHOLDS = [
    (85, "Expert"),
    (70, "Advanced"),
    (55, "Intermediate"),
    (0,  "Beginner"),
]

TOPIC_CONFIG = [
    {"topicId": "limits_and_continuity", "displayName": "Limits & Continuity", "dbTopic": "limit"},
    {"topicId": "derivatives",           "displayName": "Derivatives",          "dbTopic": "differential"},
    {"topicId": "integrals",             "displayName": "Integrals",            "dbTopic": "integral"},
    {"topicId": "applications",          "displayName": "Applications",         "dbTopic": "applications"},
]

def _proficiency(score: float) -> str:
    for threshold, label in PROFICIENCY_THRESHOLDS:
        if score >= threshold:
            return label
    return "Beginner"


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    # ─── Existing methods (ไม่เปลี่ยน) ────────────────────────────────────

    def get_overview_stats(self, user_id: int) -> DashboardOverviewStats:
        sessions = self.db.query(QuizSession).filter(
            QuizSession.user_id == user_id,
            QuizSession.end_time.isnot(None)
        ).all()

        total_attempts = len(sessions)
        if total_attempts == 0:
            return DashboardOverviewStats(
                totalChapters="3 บท", averageScore="0%", totalAttempts="0 รอบ"
            )

        average_score = sum(s.total_score or 0 for s in sessions) / total_attempts
        user = self.db.query(User).filter(User.id == user_id).first()
        student_profile = getattr(user, "current_profile", "Developing (Average)") or "Developing (Average)"
        avg_mastery = float(getattr(user, "avg_mastery", 0.0) or 0.0)

        return DashboardOverviewStats(
            totalChapters="3 บท",
            averageScore=f"{round(average_score)}%",
            totalAttempts=f"{total_attempts} รอบ",
            studentProfile=student_profile,
            avgMastery=round(avg_mastery, 4),
        )

    def get_chapter_progress(self, user_id: int) -> DashboardChapterProgressResponse:
        progress_data = {
            "limit":       ChapterProgress(completed=0, total=100),
            "differential":ChapterProgress(completed=0, total=100),
            "integral":    ChapterProgress(completed=0, total=100),
        }
        for topic in ["limit", "differential", "integral"]:
            attempts = (
                self.db.query(QuizAttempt)
                .join(Question)
                .filter(QuizAttempt.user_id == user_id, Question.main_topic == topic)
                .all()
            )
            if attempts:
                correct = sum(1 for a in attempts if a.is_correct)
                progress_data[topic] = ChapterProgress(
                    completed=int((correct / len(attempts)) * 100), total=100
                )
        return DashboardChapterProgressResponse(data=progress_data)

    def get_skills_radar(self, user_id: int) -> DashboardSkillsRadarResponse:
        import random
        base_radar = [
            {"skill": "Concept",     "limit": 82, "differential": 78, "integral": 65},
            {"skill": "Calculation", "limit": 85, "differential": 80, "integral": 70},
            {"skill": "Application", "limit": 75, "differential": 65, "integral": 55},
            {"skill": "Analysis",    "limit": 80, "differential": 70, "integral": 60},
            {"skill": "Evaluation",  "limit": 70, "differential": 60, "integral": 50},
        ]
        return DashboardSkillsRadarResponse(data=[
            RadarSkill(
                skill=item["skill"],
                limit=min(100, max(0, item["limit"] + random.randint(-5, 5))),
                differential=min(100, max(0, item["differential"] + random.randint(-5, 5))),
                integral=min(100, max(0, item["integral"] + random.randint(-5, 5))),
            )
            for item in base_radar
        ])

    def get_recent_attempts(self, user_id: int, num_attempts: int = 5):
        sessions = (
            self.db.query(QuizSession)
            .filter(QuizSession.user_id == user_id, QuizSession.end_time.isnot(None))
            .order_by(QuizSession.end_time.desc())
            .limit(num_attempts)
            .all()
        )
        sessions.reverse()

        data = []
        for idx, s in enumerate(sessions):
            duration = (s.end_time - s.start_time).total_seconds()
            avg_time = int(duration / s.total_questions) if s.total_questions else 0

            # ดึง skill_tag จาก attempts ของ session นี้
            attempts = (
                self.db.query(QuizAttempt)
                .filter(QuizAttempt.session_id == s.id)
                .all()
            )

            correct_tags   = [a.skill_tag for a in attempts if a.is_correct and a.skill_tag]
            incorrect_tags = [a.skill_tag for a in attempts if not a.is_correct and a.skill_tag]

            # นับความถี่แล้วเอา top 2
            from collections import Counter
            strengths  = [tag for tag, _ in Counter(correct_tags).most_common(2)]
            weaknesses = [tag for tag, _ in Counter(incorrect_tags).most_common(2)]

            data.append(RecentAttempt(
                attempt=idx + 1,
                score=int(s.total_score) if s.total_score else 0,
                date=s.end_time.strftime("%d/%m"),
                avgTime=avg_time,
                strengths=strengths,
                weaknesses=weaknesses,
            ))

        return DashboardRecentAttemptsResponse(data=data)

    # ─── NEW methods ────────────────────────────────────────────────────────

    def get_chapter_stats(self, chapter_id: str, user_id: int) -> ChapterStatsResponse:
        """GET /dashboard/chapter/{chapter_id}/stats"""
        topic = CHAPTER_TOPIC_MAP.get(chapter_id, chapter_id)

        attempts = (
            self.db.query(QuizAttempt)
            .join(Question)
            .filter(QuizAttempt.user_id == user_id, Question.main_topic == topic)
            .all()
        )

        if not attempts:
            return ChapterStatsResponse(
                proficiencyLevel="Beginner",
                totalAttempts=0,
                avgTimePerQuestion=0.0,
                bloomLevels=[],
                strengths=[],
                weaknesses=[],
            )

        # Average score (% correct)
        correct = sum(1 for a in attempts if a.is_correct)
        avg_score = (correct / len(attempts)) * 100

        # Average time per question
        times = [a.response_time for a in attempts if a.response_time is not None]
        avg_time = sum(times) / len(times) if times else 0.0

        # Bloom levels breakdown
        bloom_counts: dict[str, int] = {}
        for a in attempts:
            if a.question and a.question.bloom_level:
                bloom_counts[a.question.bloom_level] = bloom_counts.get(a.question.bloom_level, 0) + 1
        total = len(attempts)
        bloom_levels = [
            BloomLevel(label=label, percent=round((count / total) * 100, 1))
            for label, count in bloom_counts.items()
        ]

        # Strengths / weaknesses from skill_tag
        skill_stats: dict[str, dict] = {}
        for a in attempts:
            tag = a.skill_tag or "Other"
            if tag not in skill_stats:
                skill_stats[tag] = {"correct": 0, "total": 0}
            skill_stats[tag]["total"] += 1
            if a.is_correct:
                skill_stats[tag]["correct"] += 1

        skill_scores = {
            tag: (v["correct"] / v["total"]) * 100
            for tag, v in skill_stats.items()
            if v["total"] > 0
        }
        sorted_skills = sorted(skill_scores.items(), key=lambda x: x[1], reverse=True)
        strengths  = [s[0] for s in sorted_skills[:3]]
        weaknesses = [s[0] for s in sorted_skills[-2:] if s[1] < 70]

        # Total distinct sessions for this topic
        session_ids = {a.session_id for a in attempts if a.session_id}
        total_attempts = len(session_ids) if session_ids else 1

        return ChapterStatsResponse(
            proficiencyLevel=_proficiency(avg_score),
            totalAttempts=total_attempts,
            avgTimePerQuestion=round(avg_time, 1),
            bloomLevels=bloom_levels,
            strengths=strengths or ["—"],
            weaknesses=weaknesses or ["—"],
        )

    def get_chapter_attempts(self, chapter_id: str, user_id: int) -> ChapterAttemptsResponse:
        """GET /dashboard/chapter/{chapter_id}/attempts"""
        topic = CHAPTER_TOPIC_MAP.get(chapter_id, chapter_id)

        # ดึง sessions ที่มี attempts สำหรับ topic นี้
        session_ids = (
            self.db.query(QuizAttempt.session_id)
            .join(Question)
            .filter(
                QuizAttempt.user_id == user_id,
                QuizAttempt.session_id.isnot(None),
                Question.main_topic == topic,
            )
            .distinct()
            .all()
        )
        sid_list = [r[0] for r in session_ids]

        sessions = (
            self.db.query(QuizSession)
            .filter(QuizSession.id.in_(sid_list), QuizSession.end_time.isnot(None))
            .order_by(QuizSession.start_time.asc())
            .all()
        )

        records: list[ChapterAttemptRecord] = []
        for idx, session in enumerate(sessions):
            # คำนวณ % ถูก เฉพาะ attempts ของ topic นี้ใน session นี้
            topic_attempts = (
                self.db.query(QuizAttempt)
                .join(Question)
                .filter(
                    QuizAttempt.session_id == session.id,
                    QuizAttempt.user_id == user_id,
                    Question.main_topic == topic,
                )
                .all()
            )
            if not topic_attempts:
                continue

            correct = sum(1 for a in topic_attempts if a.is_correct)
            score = (correct / len(topic_attempts)) * 100
            times = [a.response_time for a in topic_attempts if a.response_time is not None]
            avg_time = sum(times) / len(times) if times else 0.0

            records.append(ChapterAttemptRecord(
                attempt=idx + 1,
                date=session.end_time.strftime("%d/%m/%y"),
                score=round(score, 1),
                avgTime=round(avg_time, 1),
            ))

        return ChapterAttemptsResponse(data=records)

    def get_session_report(self, session_id: int, user_id: int) -> SessionReportResponse:
        """GET /dashboard/session/{session_id}/report"""
        session = self.db.query(QuizSession).filter(
            QuizSession.id == session_id,
            QuizSession.user_id == user_id,
        ).first()

        if not session:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Session not found")

        attempts = (
            self.db.query(QuizAttempt)
            .filter(QuizAttempt.session_id == session_id, QuizAttempt.user_id == user_id)
            .all()
        )

        total_q = len(attempts)
        correct  = sum(1 for a in attempts if a.is_correct)
        times    = [a.response_time for a in attempts if a.response_time is not None]
        avg_time = sum(times) / len(times) if times else 0.0

        # Score distribution (Donut chart)
        score_distribution = [
            ScoreDistributionItem(name="ถูก",  value=correct),
            ScoreDistributionItem(name="ผิด",  value=total_q - correct),
        ]

        # Skill breakdown (group by skill_tag)
        skill_stats: dict[str, dict] = {}
        for a in attempts:
            tag = a.skill_tag or "Other"
            if tag not in skill_stats:
                skill_stats[tag] = {"correct": 0, "total": 0}
            skill_stats[tag]["total"] += 1
            if a.is_correct:
                skill_stats[tag]["correct"] += 1

        skill_breakdown = [
            SkillBreakdown(skill=tag, accuracy=round((v["correct"] / v["total"]) * 100, 1))
            for tag, v in skill_stats.items()
            if v["total"] > 0
        ]
        skill_breakdown.sort(key=lambda x: x.accuracy, reverse=True)

        strengths  = [s.skill for s in skill_breakdown if s.accuracy >= 70][:3]
        weaknesses = [s.skill for s in skill_breakdown if s.accuracy < 70][:3]

        # Error analysis (group wrong answers by error_category / topic)
        from collections import defaultdict
        error_groups: dict[str, list] = defaultdict(list)
        for a in attempts:
            if not a.is_correct:
                key = a.error_category or (a.question.main_topic if a.question else "Other")
                error_groups[key].append(a)

        error_analysis: list[ErrorAnalysisItem] = []
        for idx, (category, err_attempts) in enumerate(error_groups.items()):
            rate = round((len(err_attempts) / total_q) * 100) if total_q else 0
            # ดึง suggestion จาก ErrorCode ตัวแรกที่มีข้อมูล
            suggestion = "ทบทวนเนื้อหาและฝึกทำโจทย์เพิ่มเติม"
            for a in err_attempts:
                if a.error_detail and a.error_detail.default_feedback:
                    suggestion = a.error_detail.default_feedback
                    break
            error_analysis.append(ErrorAnalysisItem(
                id=idx + 1,
                topic=category,
                errorCount=len(err_attempts),
                errorRate=f"{rate}%",
                suggestion=suggestion,
            ))

        # chapterId: หา main_topic ส่วนใหญ่ใน session แล้ว reverse-map
        topic_counts: dict[str, int] = {}
        for a in attempts:
            if a.question and a.question.main_topic:
                t = a.question.main_topic
                topic_counts[t] = topic_counts.get(t, 0) + 1
        dominant_topic = max(topic_counts, key=topic_counts.get) if topic_counts else "limits"
        # Reverse map: DB topic → frontend chapterId
        REVERSE_MAP = {"limit": "limits", "differential": "derivatives", "integral": "integrals"}
        chapter_id = REVERSE_MAP.get(dominant_topic, dominant_topic)
        
        quiz_questions = []
        for idx, attempt in enumerate(attempts):
            if attempt.question:
                quiz_questions.append({
                    "question_number": idx + 1,
                    "question_text":   attempt.question.question_text,
                    "choices":         attempt.question.choices or [],
                    "user_answer":     attempt.user_answer or "-",
                    "correct_answer":  attempt.question.correct_answer,
                    "is_correct":      attempt.is_correct,
                })


        return SessionReportResponse(
            chapterId=chapter_id,
            correctAnswers=correct,
            totalQuestions=total_q,
            avgTimePerQuestion=round(avg_time, 1),
            strengths=strengths or ["—"],
            weaknesses=weaknesses or ["—"],
            skillBreakdown=skill_breakdown,
            errorAnalysis=error_analysis,
            scoreDistribution=score_distribution,
            quizQuestions=quiz_questions,
        )
    
    def get_chapter_sessions(self, chapter_id: str, user_id: int) -> ChapterSessionsResponse:
        topic = CHAPTER_TOPIC_MAP.get(chapter_id, chapter_id)

        session_ids = (
            self.db.query(QuizAttempt.session_id)
            .join(Question)
            .filter(
                QuizAttempt.user_id == user_id,
                QuizAttempt.session_id.isnot(None),
                Question.main_topic == topic,
            )
            .distinct().all()
        )
        sid_list = [r[0] for r in session_ids]

        sessions = (
            self.db.query(QuizSession)
            .filter(QuizSession.id.in_(sid_list), QuizSession.end_time.isnot(None))
            .order_by(QuizSession.start_time.asc())
            .all()
        )

        return ChapterSessionsResponse(data=[
            ChapterSession(
                sessionId=s.id,
                attempt=idx + 1,
                date=s.end_time.strftime("%d/%m/%y"),
            )
            for idx, s in enumerate(sessions)
        ])

    def get_topics_summary(self, user_id: int) -> TopicsSummaryResponse:
     
        result = []
    
        for config in TOPIC_CONFIG:
            db_topic = config["dbTopic"]
    
            # หา session ids ที่มี attempt ของ topic นี้
            session_ids = (
                self.db.query(QuizAttempt.session_id)
                .join(Question)
                .filter(
                    QuizAttempt.user_id == user_id,
                    QuizAttempt.session_id.isnot(None),
                    Question.main_topic == db_topic,
                )
                .distinct().all()
            )
            sid_list = [r[0] for r in session_ids]
    
            if not sid_list:
                result.append(TopicSummary(
                    topicId=config["topicId"],
                    displayName=config["displayName"],
                    latestScore=0.0,
                    totalAttempts=0,
                    proficiencyLevel="Beginner",
                ))
                continue
    
            # Session ล่าสุดของ topic นี้
            latest_session = (
                self.db.query(QuizSession)
                .filter(
                    QuizSession.id.in_(sid_list),
                    QuizSession.end_time.isnot(None),
                )
                .order_by(QuizSession.end_time.desc())
                .first()
            )
    
            # คะแนนของ session ล่าสุด (% ถูกเฉพาะ topic นี้ใน session นั้น)
            latest_score = 0.0
            if latest_session:
                topic_attempts = (
                    self.db.query(QuizAttempt)
                    .join(Question)
                    .filter(
                        QuizAttempt.session_id == latest_session.id,
                        QuizAttempt.user_id == user_id,
                        Question.main_topic == db_topic,
                    )
                    .all()
                )
                if topic_attempts:
                    correct = sum(1 for a in topic_attempts if a.is_correct)
                    latest_score = round((correct / len(topic_attempts)) * 100, 1)
    
            result.append(TopicSummary(
                topicId=config["topicId"],
                displayName=config["displayName"],
                latestScore=latest_score,
                totalAttempts=len(sid_list),
                proficiencyLevel=_proficiency(latest_score),
            ))
    
        return TopicsSummaryResponse(data=result)