# services/dashboard_service.py
# เพิ่ม 3 method ใหม่ต่อท้าย class เดิม

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.models.question import Question, MainTopic
from app.models.result import QuizSession, QuizAttempt
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverviewStats,
    DashboardChapterProgressResponse,
    DashboardSkillsRadarResponse,
    DashboardRecentAttemptsResponse,
    ChapterProgress, RadarSkill, RecentAttempt,
    ChapterStatsResponse, BloomLevel,
    ChapterAttemptsResponse, ChapterAttemptRecord,
    SessionReportResponse, SkillBreakdown, ErrorAnalysisItem, ScoreDistributionItem,
    QuizQuestionItem,
    ChapterSession, ChapterSessionsResponse, TopicSummary, TopicsSummaryResponse,
    SkillTagMastery, SkillTagMasteryResponse, SkillMasteryGroup,
    PROFICIENCY_THRESHOLDS
)

# Map: frontend chapterId → DB main_topic
CHAPTER_TOPIC_MAP: dict[str, str] = {
    "LIMIT":        MainTopic.LIMIT.value,
    "DIFFERENTIAL": MainTopic.DIFFERENTIAL.value,
    "INTEGRAL":     MainTopic.INTEGRAL.value,
    "APPLICATIONS": MainTopic.APPLICATIONS.value,
}

# Standardized TOPIC_CONFIG
TOPIC_CONFIG = [
    {"topicId": "LIMIT",        "displayName": "LIMIT",        "dbTopic": MainTopic.LIMIT.value},
    {"topicId": "DIFFERENTIAL", "displayName": "DIFFERENTIAL", "dbTopic": MainTopic.DIFFERENTIAL.value},
    {"topicId": "INTEGRAL",     "displayName": "INTEGRAL",     "dbTopic": MainTopic.INTEGRAL.value},
    {"topicId": "APPLICATIONS", "displayName": "APPLICATIONS", "dbTopic": MainTopic.APPLICATIONS.value},
]

def _proficiency(score: float) -> str:
    for threshold, label in PROFICIENCY_THRESHOLDS:
        if score >= threshold:
            return label
    return "Beginner"


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_overview_stats(self, user_id: int) -> DashboardOverviewStats:
        sessions = self.db.query(QuizSession).filter(
            QuizSession.user_id == user_id,
            QuizSession.end_time.isnot(None)
        ).all()

        total_attempts = len(sessions)
        if total_attempts == 0:
            return DashboardOverviewStats(
                totalChapters="4 บท", averageScore="0%", totalAttempts="0 รอบ"
            )

        average_score = sum(s.total_score or 0 for s in sessions) / total_attempts
        user = self.db.query(User).filter(User.id == user_id).first()
        student_profile = "Developing (Average)"
        avg_mastery = 0.0
        if user and user.student_stats:
            student_profile = user.student_stats.current_profile or "Developing (Average)"
            avg_mastery = float(user.student_stats.avg_mastery or 0.0)

        return DashboardOverviewStats(
            totalChapters="4 บท",
            averageScore=f"{round(average_score)}%",
            totalAttempts=f"{total_attempts} รอบ",
            studentProfile=student_profile,
            avgMastery=round(avg_mastery, 4),
        )

    def get_chapter_progress(self, user_id: int) -> DashboardChapterProgressResponse:
        """Build chapter-progress dict keyed by UPPERCASE topic ID.

        Uses the standardized TOPIC_CONFIG and compares against
        MainTopic enum members so the query matches the Enum column
        in PostgreSQL (values are UPPERCASE).
        """
        progress_data: dict[str, ChapterProgress] = {}

        for config in TOPIC_CONFIG:
            topic_id: str = config["topicId"]        # e.g. "LIMIT"
            db_topic: str = config["dbTopic"]         # e.g. "LIMIT" (MainTopic.LIMIT.value)

            # Default: 0% completed
            progress_data[topic_id] = ChapterProgress(completed=0, total=100)

            attempts = (
                self.db.query(QuizAttempt)
                .join(Question)
                .filter(
                    QuizAttempt.user_id == user_id,
                    Question.main_topic == db_topic,
                )
                .all()
            )
            if attempts:
                correct = sum(1 for a in attempts if a.is_correct)
                progress_data[topic_id] = ChapterProgress(
                    completed=int((correct / len(attempts)) * 100), total=100
                )

        return DashboardChapterProgressResponse(data=progress_data)

    def get_skills_radar(self, user_id: int) -> DashboardSkillsRadarResponse:
        """Compute radar chart data using authentic 6-level Bloom's Taxonomy.
        
        Returns accuracy % for each cognitive level:
        Remembering, Understanding, Applying, Analyzing, Evaluating, Creating.
        """
        BLOOM_LEVELS = [
            "Remembering",
            "Understanding",
            "Applying",
            "Analyzing",
            "Evaluating",
            "Creating"
        ]
        
        # Map raw DB strings to standardized Bloom's levels
        DB_TO_BLOOM: dict[str, str] = {
            "Remember":    "Remembering",
            "Remembering": "Remembering",
            "Understand":  "Understanding",
            "Understanding": "Understanding",
            "Apply":       "Applying",
            "Applying":    "Applying",
            "Analyze":     "Analyzing",
            "Analyzing":   "Analyzing",
            "Evaluate":    "Evaluating",
            "Evaluating":  "Evaluating",
            "Create":      "Creating",
            "Creating":    "Creating",
        }
        
        TOPIC_KEYS = ["limit", "differential", "integral", "applications"]

        # Fetch all attempts for this user with their Question loaded
        attempts = (
            self.db.query(QuizAttempt)
            .join(Question)
            .filter(QuizAttempt.user_id == user_id)
            .all()
        )

        # Accumulate correct/total counts keyed by (radar_skill, topic_key)
        counts: dict[tuple[str, str], dict[str, int]] = {}
        for a in attempts:
            if not a.question:
                continue
            
            raw_bloom = a.question.bloom_level or ""
            radar_skill = DB_TO_BLOOM.get(raw_bloom, raw_bloom)
            
            if radar_skill not in BLOOM_LEVELS:
                continue

            # Normalize main_topic enum value to lowercase axis key
            raw_topic = (a.question.main_topic or "").strip().upper()
            topic_key = raw_topic.lower() if raw_topic else "limit"

            key = (radar_skill, topic_key)
            if key not in counts:
                counts[key] = {"correct": 0, "total": 0}
            counts[key]["total"] += 1
            if a.is_correct:
                counts[key]["correct"] += 1

        # Build RadarSkill objects for all 6 levels
        radar_data: list[RadarSkill] = []
        for skill in BLOOM_LEVELS:
            values: dict[str, int] = {}
            for tk in TOPIC_KEYS:
                bucket = counts.get((skill, tk))
                if bucket and bucket["total"] > 0:
                    values[tk] = round((bucket["correct"] / bucket["total"]) * 100)
                else:
                    values[tk] = 0
            radar_data.append(RadarSkill(
                skill=skill,
                limit=values["limit"],
                differential=values["differential"],
                integral=values["integral"],
                applications=values["applications"],
            ))

        return DashboardSkillsRadarResponse(data=radar_data)

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

            # ดึง attempts พร้อม question เพื่อเอา sub_topic (แทนที่จะเป็น main_topic จาก skill_tag)
            attempts = (
                self.db.query(QuizAttempt)
                .join(Question)
                .filter(QuizAttempt.session_id == s.id)
                .all()
            )

            correct_tags   = [a.question.sub_topic for a in attempts if a.is_correct and a.question and a.question.sub_topic]
            incorrect_tags = [a.question.sub_topic for a in attempts if not a.is_correct and a.question and a.question.sub_topic]

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
        bloom_stats: dict[str, dict] = {}
        BLOOM_LEVELS_LIST = [
            "Remembering",
            "Understanding",
            "Applying",
            "Analyzing",
            "Evaluating",
            "Creating"
        ]
        
        DB_TO_BLOOM_MAP: dict[str, str] = {
            "Remember":    "Remembering",
            "Remembering": "Remembering",
            "Understand":  "Understanding",
            "Understanding": "Understanding",
            "Apply":       "Applying",
            "Applying":    "Applying",
            "Analyze":     "Analyzing",
            "Analyzing":   "Analyzing",
            "Evaluate":    "Evaluating",
            "Evaluating":  "Evaluating",
            "Create":      "Creating",
            "Creating":    "Creating",
        }

        for level in BLOOM_LEVELS_LIST:
            bloom_stats[level] = {"total": 0, "correct": 0}

        for a in attempts:
            if a.question and a.question.bloom_level:
                raw_bloom = a.question.bloom_level
                radar_skill = DB_TO_BLOOM_MAP.get(raw_bloom, raw_bloom)
                if radar_skill in bloom_stats:
                    bloom_stats[radar_skill]["total"] += 1
                    if a.is_correct:
                        bloom_stats[radar_skill]["correct"] += 1

        total = len(attempts)
        bloom_levels = []
        for label in BLOOM_LEVELS_LIST:
            stats = bloom_stats[label]
            count = stats["total"]
            correct = stats["correct"]
            percent = round((count / total) * 100, 1) if total > 0 else 0.0
            accuracy = round((correct / count) * 100, 1) if count > 0 else 0.0
            bloom_levels.append(
                BloomLevel(
                    label=label,
                    percent=percent,
                    total_attempts=count,
                    correct_attempts=correct,
                    accuracy=accuracy
                )
            )

        # Strengths / weaknesses from sub_topic granularity
        skill_stats: dict[str, dict] = {}
        for a in attempts:
            if not a.question or not a.question.sub_topic:
                continue
            tag = a.question.sub_topic
            if tag not in skill_stats:
                skill_stats[tag] = {"correct": 0, "total": 0}
            skill_stats[tag]["total"] += 1
            if a.is_correct:
                skill_stats[tag]["correct"] += 1

        skill_mastery_list = [
            SkillTagMastery(
                skill_tag=tag,
                accuracy=round((v["correct"] / v["total"]) * 100, 1),
                attempt_count=v["total"]
            )
            for tag, v in skill_stats.items()
        ]

        # Sort for strengths (descending accuracy) and weaknesses (ascending accuracy)
        strengths = sorted(skill_mastery_list, key=lambda x: x.accuracy, reverse=True)[:5]
        weaknesses = sorted(
            [s for s in skill_mastery_list if s.accuracy < 70],
            key=lambda x: x.accuracy
        )[:5]

        # Total distinct sessions for this topic
        session_ids = {a.session_id for a in attempts if a.session_id}
        total_attempts = len(session_ids) if session_ids else 1

        return ChapterStatsResponse(
            proficiencyLevel=_proficiency(avg_score),
            totalAttempts=total_attempts,
            avgTimePerQuestion=round(avg_time, 1),
            bloomLevels=bloom_levels,
            strengths=strengths,
            weaknesses=weaknesses,
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
                key = (a.error_detail.category if a.error_detail else None) or (a.question.main_topic if a.question else "Other")
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
        dominant_topic = max(topic_counts, key=topic_counts.get) if topic_counts else "limit"
        # Reverse map: DB topic → frontend chapterId
        REVERSE_MAP = {
            MainTopic.LIMIT.value:        "LIMIT", 
            MainTopic.DIFFERENTIAL.value: "DIFFERENTIAL", 
            MainTopic.INTEGRAL.value:     "INTEGRAL",
            MainTopic.APPLICATIONS.value:  "APPLICATIONS"
        }
        chapter_id = REVERSE_MAP.get(dominant_topic, "LIMIT")
        
        # Build validated QuizQuestionItem list for the response
        quiz_questions: list[QuizQuestionItem] = []
        for idx, attempt in enumerate(attempts):
            if attempt.question:
                quiz_questions.append(QuizQuestionItem(
                    question_number=idx + 1,
                    question_text=attempt.question.question_text,
                    choices=attempt.question.choices or [],
                    user_answer=attempt.user_answer or "-",
                    correct_answer=attempt.question.correct_answer,
                    is_correct=attempt.is_correct,
                ))

        # Compute average question difficulty for this session (0.0–1.0 scale)
        difficulties = [a.question.difficulty for a in attempts if a.question and a.question.difficulty is not None]
        avg_difficulty = sum(difficulties) / len(difficulties) if difficulties else 0.5

        return SessionReportResponse(
            chapterId=chapter_id,
            correctAnswers=correct,
            totalQuestions=total_q,
            avgTimePerQuestion=round(avg_time, 1),
            avgDifficulty=round(avg_difficulty, 2),
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

    def get_skill_mastery(self, user_id: int) -> SkillTagMasteryResponse:
        """
        GET /dashboard/skill-tags/mastery

        Compute accuracy % for BOTH sub_topic (Enums) and skill_tags (JSONB list).
        Returns top-5 strengths and bottom-5 weaknesses for each category.
        """
        attempts = (
            self.db.query(QuizAttempt)
            .join(Question, QuizAttempt.question_id == Question.id)
            .filter(QuizAttempt.user_id == user_id)
            .all()
        )

        print(f"\n{'='*60}")
        print(f"[DEBUG MASTER] User ID: {user_id}")
        print(f"[DEBUG MASTER] Total attempts found with Question join: {len(attempts)}")

        sub_topic_stats: dict[str, dict] = {}
        skill_tag_stats: dict[str, dict] = {}

        # Log first 5 for sample
        for i, a in enumerate(attempts[:5]):
            q = a.question
            print(f"  Attempt {i+1}: ID={a.id}, Q_ID={a.question_id}, Correct={a.is_correct}, SubTopic={q.sub_topic}, Tags={q.skill_tags}")

        for a in attempts:
            if not a.question:
                # Fallback: If no question link, use the broad skill_tag column from QuizAttempt
                if a.skill_tag:
                    st = str(a.skill_tag)
                    if st not in sub_topic_stats:
                        sub_topic_stats[st] = {"correct": 0, "total": 0}
                    sub_topic_stats[st]["total"] += 1
                    if a.is_correct:
                        sub_topic_stats[st]["correct"] += 1
                continue
            
            # 1. Process sub_topic (Priority: granular metadata from Question table)
            target_st = a.question.sub_topic
            if target_st:
                st = getattr(target_st, 'value', str(target_st))
            else:
                # Fallback to broad skill_tag if sub_topic is missing
                st = str(a.skill_tag) if a.skill_tag else "General"

            if st not in sub_topic_stats:
                sub_topic_stats[st] = {"correct": 0, "total": 0}
            sub_topic_stats[st]["total"] += 1
            if a.is_correct:
                sub_topic_stats[st]["correct"] += 1
            
            # 2. Process skill_tags (JSONB List of strings)
            tags = a.question.skill_tags or []
            if isinstance(tags, list) and len(tags) > 0:
                for t in tags:
                    if not t: continue
                    if t not in skill_tag_stats:
                        skill_tag_stats[t] = {"correct": 0, "total": 0}
                    skill_tag_stats[t]["total"] += 1
                    if a.is_correct:
                        skill_tag_stats[t]["correct"] += 1
            else:
                # Fallback: if no granular tags, we don't add to skill_tag_stats to keep it clean
                pass

        def _build_list(stats_dict: dict) -> list[SkillTagMastery]:
            return [
                SkillTagMastery(
                    skill_tag=tag,
                    accuracy=round((v["correct"] / v["total"]) * 100, 1),
                    attempt_count=v["total"],
                )
                for tag, v in stats_dict.items()
                if v["total"] >= 1
            ]

        def _extract_sw(items: list[SkillTagMastery]):
            # Sort descending for strengths, ascending for weaknesses
            desc = sorted(items, key=lambda s: s.accuracy, reverse=True)
            asc  = sorted(items, key=lambda s: s.accuracy)
            return desc[:5], [s for s in asc if s.accuracy < 70.0][:5]

        st_list = _build_list(sub_topic_stats)
        sg_list = _build_list(skill_tag_stats)

        print(f"[DEBUG MASTER] Aggregated SubTopics Count: {len(st_list)}, SkillTags Count: {len(sg_list)}")

        st_strengths, st_weaknesses = _extract_sw(st_list)
        sg_strengths, sg_weaknesses = _extract_sw(sg_list)

        resp = SkillTagMasteryResponse(
            strengths=SkillMasteryGroup(subTopics=st_strengths, skillTags=sg_strengths),
            weaknesses=SkillMasteryGroup(subTopics=st_weaknesses, skillTags=sg_weaknesses)
        )
        print(f"[DEBUG MASTER] Final Strengths SubTopics: {[s.skill_tag for s in resp.strengths.subTopics]}")
        print(f"{'='*60}\n")
        return resp


