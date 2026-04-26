// src/features/dashboard/services/dashboardService.ts

import {
  mockQuizResults,
  mockQuizSessions,
  mockQuestions,
 // mockStudentKnowledge,
} from "../data/mockData";
import type {
  ChapterStats,
  CourseReportData,
  OverviewStats,
  ChapterProgress,
  BloomLevelStats,
  SkillBreakdown,
  ErrorAnalysisItem,
  AttemptRecord,
  RadarChartData,
  LineChartData,
  DonutChartData,
} from "../types/dashboard.type";

// ===== Constants =====
const CHAPTERS = [
  { id: 'limits', name: 'Limits', topic: 'Limits' },
  { id: 'continuity', name: 'Continuity', topic: 'Continuity' },
  { id: 'derivatives', name: 'Derivatives', topic: 'Derivatives' },
  { id: 'applications-derivatives', name: 'Applications of Derivatives', topic: 'Applications of Derivatives' },
  { id: 'integrals', name: 'Integrals', topic: 'Integrals' },
  { id: 'applications-integrals', name: 'Applications of Integrals', topic: 'Applications of Integrals' },
];

const PROFICIENCY_LEVELS = {
  excellent: { min: 85, label: 'ดีมาก' },
  good: { min: 70, label: 'ดี' },
  fair: { min: 50, label: 'ปานกลาง' },
  poor: { min: 0, label: 'ต้องปรับปรุง' },
};

// ===== Helper Functions =====

/**
 * คำนวณระดับความเชี่ยวชาญ
 */
export function getProficiencyLevel(score: number): string {
  if (score >= PROFICIENCY_LEVELS.excellent.min) return PROFICIENCY_LEVELS.excellent.label;
  if (score >= PROFICIENCY_LEVELS.good.min) return PROFICIENCY_LEVELS.good.label;
  if (score >= PROFICIENCY_LEVELS.fair.min) return PROFICIENCY_LEVELS.fair.label;
  return PROFICIENCY_LEVELS.poor.label;
}

/**
 * ดึงข้อมูลการสอบของบทเดียว
 */
function getChapterResults(chapterId: string, userId: number): typeof mockQuizResults {
  return mockQuizResults.filter((result) => {
    const question = mockQuestions.find((q) => q.id === result.question_id);
    return result.user_id === userId && question?.main_topic === chapterId;
  });
}

/**
 * คำนวณสถิติของบท
 */
export function calculateChapterStats(chapterId: string, userId: number): ChapterStats {
  const results = getChapterResults(chapterId, userId);
  const questions = mockQuestions.filter((q) => q.main_topic === chapterId);
  const sessions = mockQuizSessions.filter((s) => s.user_id === userId);

  if (results.length === 0) {
    return {
      chapterId,
      chapterName: chapterId,
      averageScore: 0,
      totalAttempts: 0,
      totalQuestions: questions.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      avgTimePerQuestion: 0,
      proficiencyLevel: getProficiencyLevel(0),
      strengths: [],
      weaknesses: [],
      bloomLevels: [],
      skillBreakdown: [],
    };
  }

  const correctAnswers = results.filter((r) => r.is_correct).length;
  const incorrectAnswers = results.filter((r) => !r.is_correct).length;
  const averageScore = (correctAnswers / results.length) * 100;
  const avgTimePerQuestion = results.reduce((sum, r) => sum + r.response_time, 0) / results.length;

  // Calculate Bloom Levels
  const bloomLevelStats = calculateBloomLevelStats(results);

  // Calculate Skill Breakdown
  const skillBreakdown = calculateSkillBreakdown(results);

  // Identify Strengths & Weaknesses
  const strengths = identifyTopSkills(skillBreakdown, 3);
  const weaknesses = identifyBottomSkills(skillBreakdown, 3);

  return {
    chapterId,
    chapterName: chapterId,
    averageScore,
    totalAttempts: sessions.length,
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers,
    avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
    proficiencyLevel: getProficiencyLevel(averageScore),
    strengths,
    weaknesses,
    bloomLevels: bloomLevelStats,
    skillBreakdown,
  };
}

/**
 * คำนวณสถิติ Bloom's Level
 */
function calculateBloomLevelStats(results: typeof mockQuizResults): BloomLevelStats[] {
  const bloomMap = new Map<string, { count: number; correct: number }>();

  results.forEach((result) => {
    const question = mockQuestions.find((q) => q.id === result.question_id);
    if (question) {
      const level = question.bloom_level;
      if (!bloomMap.has(level)) {
        bloomMap.set(level, { count: 0, correct: 0 });
      }
      const stats = bloomMap.get(level)!;
      stats.count++;
      if (result.is_correct) stats.correct++;
    }
  });

  return Array.from(bloomMap.entries()).map(([label, stats]) => ({
    label: capitalizeBloomLevel(label),
    percent: Math.round((stats.correct / stats.count) * 100),
    count: stats.count,
  }));
}

/**
 * Capitalize Bloom Level
 */
function capitalizeBloomLevel(level: string): string {
  const bloomMap: Record<string, string> = {
    remember: 'Remember',
    understand: 'Understand',
    apply: 'Apply',
    analyze: 'Analyze',
    evaluate: 'Evaluate',
    create: 'Create',
  };
  return bloomMap[level] || level;
}

/**
 * คำนวณ Skill Breakdown
 */
function calculateSkillBreakdown(results: typeof mockQuizResults): SkillBreakdown[] {
  const skillMap = new Map<string, { correct: number; incorrect: number }>();

  results.forEach((result) => {
    const skill = result.skill_tag;
    if (!skillMap.has(skill)) {
      skillMap.set(skill, { correct: 0, incorrect: 0 });
    }
    const stats = skillMap.get(skill)!;
    if (result.is_correct) {
      stats.correct++;
    } else {
      stats.incorrect++;
    }
  });

  return Array.from(skillMap.entries()).map(([skill, stats]) => {
    const total = stats.correct + stats.incorrect;
    return {
      skill,
      correct: stats.correct,
      incorrect: stats.incorrect,
      accuracy: Math.round((stats.correct / total) * 100),
    };
  });
}

/**
 * หา Top Skills (ตอบถูกเยอะ)
 */
function identifyTopSkills(skillBreakdown: SkillBreakdown[], limit: number): string[] {
  return skillBreakdown
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, limit)
    .map((s) => s.skill);
}

/**
 * หา Weak Skills (ตอบผิดเยอะ)
 */
function identifyBottomSkills(skillBreakdown: SkillBreakdown[], limit: number): string[] {
  return skillBreakdown
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map((s) => s.skill);
}

/**
 * ดึงข้อมูลทั่วไปของ User
 */
export function calculateOverviewStats(userId: number): OverviewStats {
  const userResults = mockQuizResults.filter((r) => r.user_id === userId);
  const userSessions = mockQuizSessions.filter((s) => s.user_id === userId);

  if (userResults.length === 0) {
    return {
      totalChapters: CHAPTERS.length,
      averageScore: 0,
      totalAttempts: 0,
      proficiencyLevel: getProficiencyLevel(0),
      avgTimePerQuestion: 0,
    };
  }

  const correctAnswers = userResults.filter((r) => r.is_correct).length;
  const averageScore = (correctAnswers / userResults.length) * 100;
  const avgTimePerQuestion = userResults.reduce((sum, r) => sum + r.response_time, 0) / userResults.length;

  return {
    totalChapters: CHAPTERS.length,
    averageScore: Math.round(averageScore * 10) / 10,
    totalAttempts: userSessions.length,
    proficiencyLevel: getProficiencyLevel(averageScore),
    avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
  };
}

/**
 * ดึงความก้าวหน้าของแต่ละบท
 */
export function getChapterProgressList(userId: number): ChapterProgress[] {
  return CHAPTERS.map((chapter) => {
    const results = getChapterResults(chapter.topic, userId);
   // const questions = mockQuestions.filter((q) => q.main_topic === chapter.topic);
    const sessions = mockQuizSessions.filter((s) => s.user_id === userId);

    if (results.length === 0) {
      return {
        chapter: chapter.name,
        score: 0,
        attempts: 0,
        lastAttemptDate: '-',
        avgTime: 0,
        correctCount: 0,
        incorrectCount: 0,
      };
    }

    const correctCount = results.filter((r) => r.is_correct).length;
    const incorrectCount = results.length - correctCount;
    const score = (correctCount / results.length) * 100;
    const avgTime = results.reduce((sum, r) => sum + r.response_time, 0) / results.length;

    const lastAttempt = results.reduce((latest, current) => {
      const latestSession = mockQuizSessions.find((s) => s.id === latest.session_id);
      const currentSession = mockQuizSessions.find((s) => s.id === current.session_id);
      const latestDate = new Date(latestSession?.start_time || '');
      const currentDate = new Date(currentSession?.start_time || '');
      return currentDate > latestDate ? current : latest;
    });

    const lastAttemptSession = mockQuizSessions.find((s) => s.id === lastAttempt.session_id);
    return {
      chapter: chapter.name,
      score: Math.round(score * 10) / 10,
      attempts: sessions.length,
      lastAttemptDate: new Date(lastAttemptSession?.start_time || '').toLocaleDateString('th-TH'),
      avgTime: Math.round(avgTime * 10) / 10,
      correctCount,
      incorrectCount,
    };
  });
}

/**
 * ดึงข้อมูลรายการผลสอบแต่ละครั้ง
 */
export function getChapterAttempts(chapterId: string, userId: number): AttemptRecord[] {
  const sessions = mockQuizSessions.filter((s) => s.user_id === userId);
  const results = getChapterResults(chapterId, userId);

  if (results.length === 0) return [];

  return sessions.map((session, idx) => ({
    attempt: idx + 1,
    date: new Date(session.start_time).toLocaleDateString('th-TH'),
    score: Math.round(session.total_score * 10) / 10,
    avgTime: Math.round(session.total_score / session.total_questions),
    correctCount: results.filter((r) => r.session_id === session.id && r.is_correct).length,
    totalQuestions: session.total_questions,
  }));
}

/**
 * ดึงข้อมูล Course Report
 */
export function generateCourseReport(sessionId: number, userId: number): CourseReportData {
  const session = mockQuizSessions.find((s) => s.id === sessionId && s.user_id === userId);
  if (!session) throw new Error('Session not found');

  const results = mockQuizResults.filter((r) => r.session_id === sessionId && r.user_id === userId);
  const correctAnswers = results.filter((r) => r.is_correct).length;
  const incorrectAnswers = results.filter((r) => !r.is_correct).length;

  const avgTimePerQuestion = results.reduce((sum, r) => sum + r.response_time, 0) / results.length;

  const skillBreakdown = calculateSkillBreakdown(results);
  const strengths = identifyTopSkills(skillBreakdown, 3);
  const weaknesses = identifyBottomSkills(skillBreakdown, 3);

  const errorAnalysis = generateErrorAnalysis(results);

  // Determine chapter from results
  const firstQuestion = results.length > 0 ? mockQuestions.find((q) => q.id === results[0].question_id) : null;
  const chapterId = firstQuestion?.main_topic || 'unknown';

  return {
    sessionId,
    chapterId,
    chapterName: chapterId,
    totalScore: session.total_score,
    totalQuestions: session.total_questions,
    correctAnswers,
    incorrectAnswers,
    avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
    strengths,
    weaknesses,
    errorAnalysis,
    skillBreakdown,
  };
}

/**
 * สร้าง Error Analysis
 */
function generateErrorAnalysis(results: typeof mockQuizResults): ErrorAnalysisItem[] {
  const errorMap = new Map<string, { count: number; questions: number[] }>();

  results.forEach((result) => {
    if (!result.is_correct) {
      const skill = result.skill_tag;
      if (!errorMap.has(skill)) {
        errorMap.set(skill, { count: 0, questions: [] });
      }
      const data = errorMap.get(skill)!;
      data.count++;
      data.questions.push(result.question_id);
    }
  });

  let id = 1;
  return Array.from(errorMap.entries()).map(([topic, data]) => {
    const totalAttempts = results.filter((r) => r.skill_tag === topic).length;
    const errorRate = Math.round((data.count / totalAttempts) * 100);

    return {
      id: id++,
      topic,
      errorCount: data.count,
      errorRate: `${errorRate}%`,
      suggestion: `ทบทวนเรื่อง ${topic} และฝึกทำข้อสอบเพิ่มเติม`,
      questions: data.questions,
    };
  });
}

/**
 * สร้าง Radar Chart Data
 */
export function generateRadarChartData(userId: number): RadarChartData[] {
  const radarData: RadarChartData[] = [];

  CHAPTERS.forEach((chapter) => {
    const stats = calculateChapterStats(chapter.topic, userId);
    radarData.push({
      skill: chapter.name,
      [userId]: stats.averageScore,
    });
  });

  return radarData;
}

/**
 * สร้าง Line Chart Data (Progress)
 */
export function generateProgressChartData(chapterId: string, userId: number): LineChartData[] {
  const attempts = getChapterAttempts(chapterId, userId);
  return attempts.map((attempt) => ({
    attempt: attempt.attempt,
    date: attempt.date,
    score: attempt.score,
    avgTime: attempt.avgTime,
  }));
}

/**
 * สร้าง Donut Chart Data (Score Distribution)
 */
export function generateScoreDistributionData(sessionId: number, userId: number): DonutChartData[] {
  const report = generateCourseReport(sessionId, userId);
  const correctPercent = Math.round((report.correctAnswers / report.totalQuestions) * 100);
  const incorrectPercent = 100 - correctPercent;

  return [
    {
      name: 'ตอบถูก',
      value: correctPercent,
      color: '#10b981',
    },
    {
      name: 'ตอบผิด',
      value: incorrectPercent,
      color: '#ef4444',
    },
  ];
}

/**
 * Export เป็น service object
 */
export const dashboardService = {
  calculateOverviewStats,
  calculateChapterStats,
  getChapterProgressList,
  getChapterAttempts,
  generateCourseReport,
  generateRadarChartData,
  generateProgressChartData,
  generateScoreDistributionData,
  getProficiencyLevel,
};

export default dashboardService;
