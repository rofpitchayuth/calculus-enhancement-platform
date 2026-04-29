import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllCourse from '../features/exam/pages/AllCourse';
import QuizPage from '../features/exam/pages/QuizPage';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AllCourse />} />
                <Route path="/quiz/:courseId" element={<QuizPage />} />
            </Routes>
        </Router>
    );
}