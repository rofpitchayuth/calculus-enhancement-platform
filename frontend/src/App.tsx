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
import { AllDashboard } from "./features/dashboard/pages/AllDashboard";

import {
  DashboardOverviewPage,
  ChapterDashboardPage,
  CourseReportPage,
} from "./features/dashboard";

import { Layout } from "./shared/components/layout/Layout";
//import { ProtectedRoute } from "./shared/components/ProtectedRoute";

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
      //<ProtectedRoute>
        <Layout>
          <AllDashboard />
        </Layout>
     // </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/chapter/:chapterId",
    element: (
     // <ProtectedRoute>
        <Layout>
          <ChapterDashboardPage />
        </Layout>
      //</ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/course-report",
    element: (
     // <ProtectedRoute>
        <Layout>
          <CourseReportPage />
        </Layout>
      //</ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/overview",
    element: (
     // <ProtectedRoute>
        <Layout>
          <DashboardOverviewPage />
        </Layout>
      //</ProtectedRoute>
    ),
  },
  

  // ===== FALLBACK =====
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
