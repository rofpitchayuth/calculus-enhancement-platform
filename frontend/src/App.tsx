import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./features/auth/hooks/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import { HomePage } from "./features/home/pages/HomePage";

import {
  DashboardOverviewPage,
  ChapterDashboardPage,
  CourseReportPage,
} from "./features/dashboard";
import { AdminQuestionPage } from "./features/admin";

import { Layout } from "./shared/components/layout/Layout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import QuizPage from "./features/exam/pages/QuizPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },

  // ===== AUTH =====
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/signup",
    element: <SignUpPage />,
  },

  // ===== HOME =====
  {
    path: "/home",
    element: (
      // <ProtectedRoute>
      <Layout>
        <HomePage />
      </Layout>
      // </ProtectedRoute>
    ),
  },

  // ===== DASHBOARD =====
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout>
          <DashboardOverviewPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/overview",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard/chapter/:chapterId/all",
    element: (
      // <ProtectedRoute>
      <Layout>
        <ChapterDashboardPage />
      </Layout>
      //</ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/chapter/:chapterId",
    element: (
      <ProtectedRoute>
        <Layout>
          <CourseReportPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz",
    element: (
      <ProtectedRoute>
        <Layout>
          <QuizPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // ===== HITL ADMIN =====
  {
    path: "/admin/questions",
    element: (
      <Layout>
        <AdminQuestionPage />
      </Layout>
    ),
  },


  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
