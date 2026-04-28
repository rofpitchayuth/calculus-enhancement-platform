// src/App.tsx

import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { AuthProvider } from "./features/auth/hooks/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import { HomePage } from "./features/home/pages/HomePage";

import { DashboardOverviewPage, ChapterDashboardPage, CourseReportPage } from "./features/dashboard";
import { AdminQuestionPage } from "./features/admin";
import { Layout } from "./shared/components/layout/Layout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import QuizPage from "./features/exam/pages/QuizPage";
import AllCourse from "./features/exam/pages/AllCourse";
import { AllDashboard } from "./features/dashboard/pages/AllDashboard";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/home" replace /> },

  // ── Auth ──────────────────────────────────────────────────────────────────
  { path: "/auth/login",  element: <LoginPage /> },
  { path: "/auth/signup", element: <SignUpPage /> },

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    path: "/home",
    element: <Layout><HomePage /></Layout>,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    path: "/dashboard",
    element: <ProtectedRoute><Layout><DashboardOverviewPage /></Layout></ProtectedRoute>,
  },
  {
    path: "/dashboard/overview",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // ChapterDashboardPage: ภาพรวมของบท
    path: "/dashboard/chapter/:chapterId/all",
    element: <Layout><ChapterDashboardPage /></Layout>,
  },
  {
  path: "/dashboard/chapter/:chapterId/:sessionId",
  element: (
    <Layout>
      <CourseReportPage />
    </Layout>
  ),
},
  {
    path: "/alldashboard",
    element: <ProtectedRoute><Layout><AllDashboard /></Layout></ProtectedRoute>,
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  {
    path: "/allquiz",
    element: <ProtectedRoute><Layout><AllCourse /></Layout></ProtectedRoute>,
  },
  {
    // courseId = topic string: "derivatives", "integrals", ...
    path: "/quiz/:courseId",
    element: <ProtectedRoute><Layout><QuizPage /></Layout></ProtectedRoute>,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: "/admin/questions",
    element: <Layout><AdminQuestionPage /></Layout>,
  },

  { path: "*", element: <Navigate to="/auth/login" replace /> },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
