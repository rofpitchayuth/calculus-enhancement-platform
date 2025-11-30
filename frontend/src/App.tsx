import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/hooks/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import { HomePage } from "./features/home/pages/HomePage";
import { Layout } from "./shared/components/layout/Layout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/signup",
    element: <SignUpPage />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout>
          <HomePage />
        </Layout>
      </ProtectedRoute>
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