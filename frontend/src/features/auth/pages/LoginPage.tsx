import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <LoginForm 
        onToggleMode={() => navigate("/auth/signup")}
        onSuccess={() => navigate("/home")}
      />
    </div>
  );
}