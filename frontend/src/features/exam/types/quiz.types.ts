export interface Choice {
    id: string;
    text: string;
    error_code?: string | null;
}

export interface Question {
    id: number;
    question_text: string;
    correct_answer: string;
    choices: Choice[];
    difficulty: number;
    bloom_level: string | null;
    skill_id: string;
}

export interface QuizSession {
    session_id: number;
    questions: Question[];
    total_questions: number;
}

export interface SubmitResponse {
    is_correct: boolean;
    correct_answer: string;
    error_code: string;
    feedback_text: string;
    p_mastery_before: number;
    p_mastery_after: number;
    p_correct_next: number;
}

export interface QuizSubmitRequest {
    user_id: number;
    session_id: number;
    question_id: number;
    user_answer: string;
    skill_id: string;
    response_latency: number;
}

export interface QuizSummaryItem {
    question_number: number;
    question_text: string;
    is_correct: boolean;
    user_answer: string;
    correct_answer: string;
    main_topic: string | null;
    sub_topic: string | null;
    error_code: string | null;
    feedback_text?: string | null;
}

export interface QuizEndResponse {
    session_id: number;
    total_score: number;
    total_questions: number;
    start_time: string;
    end_time: string;
    session_summary: QuizSummaryItem[];
    student_profile?: string | null;
    skill_mastery?: number | null;
}
