import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div>
      <LoginForm 
        onToggleMode={() => navigate("/auth/signup")}
        onSuccess={() => navigate("/home")}
      />
    </div>
  );
}