// src/features/dashboard/data/mockData.ts

import type { ChapterSummary } from "../types/dashboard.type";

/**
 * Chapter Names Mapping
 */
export const CHAPTER_NAMES: Record<string, string> = {
  differential: "Differential",
  limit: "Limits",
  integral: "Integral",
};

/**
 * Mock data for DashboardOverviewPage
 */
export const MOCK_CHAPTERS: ChapterSummary[] = [
  {
    id: "limit",
    title: "Limits",
    latestScore: 82,
    attempts: 4,
    trend: "up",
  },
  {
    id: "differential",
    title: "Differential",
    latestScore: 78,
    attempts: 3,
    trend: "steady",
  },
  {
    id: "integral",
    title: "Integral",
    latestScore: 65,
    attempts: 2,
    trend: "down",
  },
];

/**
 * Mock data for ChapterDashboardPage
 */
export const CHAPTER_STATS = {
  latestScore: 78,
  latestDiff: +8,
  difficulty: "ปานกลาง",
  avgTimePerQuestion: 18,
  avgTimeDiff: -2,
  totalRounds: 3,
};

/**
 * Mock Bloom's Level data for ChapterDashboardPage
 */
export const BLOOM_LEVELS = [
  { label: "Remember", percent: 90 },
  { label: "Understand", percent: 80 },
  { label: "Apply", percent: 60 },
  { label: "Analyze", percent: 40 },
  { label: "Evaluate", percent: 10 },
];

/**
 * Mock data for Strengths & Weaknesses in ChapterDashboardPage
 */
export const CHAPTER_STRENGTHS = ["Derivative Concept", "Basic Function Rule"];

export const CHAPTER_WEAKNESSES = ["Chain Rule", "Evaluate & Check"];

/**
 * Mock data for Course Report Page - Summary
 */
export const COURSE_REPORT_SUMMARY = {
  totalScore: "78%",
  avgTimePerQuestion: "18 วินาที",
  proficiencyLevel: "ปานกลาง",
};

/**
 * Mock data for Course Report Page - Strengths
 */
export const COURSE_REPORT_STRENGTHS = [
  "เข้าใจแนวคิดพื้นฐานของ Limit / Differential ได้ดี",
  "แก้โจทย์คำนวณตรงสูตรได้แม่นยำ",
];

/**
 * Mock data for Course Report Page - Weaknesses
 */
export const COURSE_REPORT_WEAKNESSES = [
  "การวิเคราะห์โจทย์ประยุกต์หลายขั้นตอน",
  "การแปลโจทย์ภาษาไทยเป็นสัญลักษณ์คณิตศาสตร์",
];

/**
 * Mock data for Course Report Table
 */
export const COURSE_REPORT_ATTEMPTS = [
  {
    round: 1,
    date: "01/11/2025",
    score: "70%",
    avgTime: "22 วินาที",
    note: "เริ่มต้นทำครั้งแรก",
  },
  {
    round: 2,
    date: "05/11/2025",
    score: "75%",
    avgTime: "20 วินาที",
    note: "เข้าใจสูตรดีขึ้น",
  },
  {
    round: 3,
    date: "10/11/2025",
    score: "78%",
    avgTime: "18 วินาที",
    note: "เริ่มทำโจทย์ประยุกต์ได้",
  },
];

/**
 * Mock data for Chapter Dashboard Table
 */
export const CHAPTER_ATTEMPTS = [
  {
    round: 1,
    date: "01/11/2025",
    score: "70%",
    avgTime: "22 วินาที",
    strength: "จำสูตรพื้นฐานได้ดี",
    weakness: "อ่านโจทย์ประยุกต์ให้ละเอียด",
  },
];

/**
 * Mock data for Dashboard Overview Summary Stats
 */
export const DASHBOARD_OVERVIEW_STATS = {
  totalChapters: "3 บท",
  averageScore: "75%",
  totalAttempts: "9 รอบ",
};

/**
 * Mock data for Chapter Dashboard - Score Progress Line Chart
 * แสดงพัฒนาการคะแนนย้อนหลัง
 */
export const CHAPTER_SCORE_HISTORY = [
  { attempt: 1, score: 70, date: "01/11" },
  { attempt: 2, score: 75, date: "05/11" },
  { attempt: 3, score: 78, date: "10/11" },
];

/**
 * Mock data for Chapter Dashboard - Time Progress Line Chart
 * แสดงพัฒนาการเวลาเฉลี่ยต่อข้อย้อนหลัง
 */
export const CHAPTER_TIME_HISTORY = [
  { attempt: 1, avgTime: 22, date: "01/11" },
  { attempt: 2, avgTime: 20, date: "05/11" },
  { attempt: 3, avgTime: 18, date: "10/11" },
];

/**
 * Mock data for Chapter Dashboard - Radar Chart (Skills Analysis)
 * แสดงการวิเคราะห์ทักษะต่างๆ ในบทเรียน
 */
export const CHAPTER_SKILLS_RADAR = [
  { skill: "Concept", value: 85 },
  { skill: "Calculation", value: 90 },
  { skill: "Application", value: 65 },
  { skill: "Analysis", value: 70 },
  { skill: "Evaluation", value: 60 },
];

/**
 * Mock data for Course Report Page - Donut Chart
 * แสดงคะแนนรวมในรูปแบบ donut (87% pass, 13% fail)
 */
export const COURSE_REPORT_SCORE_DISTRIBUTION = [
  { name: "Pass", value: 87, color: "#4ade80" },
  { name: "Fail", value: 13, color: "#ef4444" },
];

/**
 * Mock data for Course Report Page - Error Analysis Table
 */
export const COURSE_REPORT_ERROR_ANALYSIS = [
  {
    id: 1,
    topic: "Chain Rule",
    errors: 3,
    errorRate: "15%",
    suggestion: "ทบทวนการใช้ chain rule ให้แม่นยำ",
  },
  {
    id: 2,
    topic: "Product Rule",
    errors: 2,
    errorRate: "10%",
    suggestion: "ฝึกโจทย์ product rule เพิ่มเติม",
  },
  {
    id: 3,
    topic: "L'Hôpital's Rule",
    errors: 4,
    errorRate: "20%",
    suggestion: "เรียนเพิ่มเติมเกี่ยวกับการใช้ L'Hôpital's Rule",
  },
];

/**
 * Mock data for Dashboard Overview Page - Chapter Skills Progress
 */
export const DASHBOARD_CHAPTER_PROGRESS = {
  limit: { completed: 75, total: 100 },
  differential: { completed: 78, total: 100 },
  integral: { completed: 65, total: 100 },
};

/**
 * Mock data for Dashboard Overview Page - Overall Skills Radar
 */
export const DASHBOARD_OVERALL_SKILLS_RADAR = [
  { skill: "Concept", limit: 82, differential: 78, integral: 65 },
  { skill: "Calculation", limit: 85, differential: 80, integral: 70 },
  { skill: "Application", limit: 75, differential: 65, integral: 55 },
  { skill: "Analysis", limit: 80, differential: 70, integral: 60 },
  { skill: "Evaluation", limit: 70, differential: 60, integral: 50 },
];
