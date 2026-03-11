import { useState } from 'react';
import { quizService } from '../services/quiz.service';
import type { QuizSession, SubmitResponse } from '../types/quiz.types';

export const useQuiz = () => {
    const [quiz, setQuiz] = useState<QuizSession | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startQuiz = async (userId: number, numQuestions: number = 5) => {
        try {
            setLoading(true);
            setError(null);
            const data = await quizService.startQuiz(userId, numQuestions);
            setQuiz(data);
            setCurrentIndex(0);
        } catch (err: any) {
            setError('Failed to load quiz. Please try again.');
            console.error('Failed to start quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (
        userId: number,
        questionId: number,
        userAnswer: string,
        skillId: string
    ): Promise<SubmitResponse | null> => {
        if (!quiz) return null;
        try {
            setLoading(true);
            const result = await quizService.submitAnswer({
                user_id: userId,
                session_id: quiz.session_id,
                question_id: questionId,
                user_answer: userAnswer,
                skill_id: skillId
            });
            return result;
        } catch (err: any) {
            setError('Failed to submit answer. Please try again.');
            console.error('Failed to submit answer:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        if (quiz && currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return true;
        }
        return false;
    };

    const endQuizSession = async (userId: number) => {
        if (!quiz) return null;
        try {
            setLoading(true);
            const result = await quizService.endQuiz(userId, quiz.session_id);
            return result;
        } catch (err: any) {
            console.error('Failed to end quiz:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setQuiz(null);
        setCurrentIndex(0);
        setError(null);
    };

    return {
        quiz,
        currentIndex,
        loading,
        error,
        startQuiz,
        submitAnswer,
        nextQuestion,
        endQuizSession,
        resetQuiz
    };
};
