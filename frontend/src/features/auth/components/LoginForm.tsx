import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components/ui/Card.tsx";
import { FormField } from "../../../shared/components/ui/FormField.tsx";
import { Button } from "../../../shared/components/ui/Button.tsx";
import { ErrorMessage } from "../../../shared/components/ui/ErrorMessage.tsx";
import { useAuth } from "../hooks/useAuth.tsx";
import type { LoginCredentials } from "../types/auth.type";

interface LoginFormProps {
  onToggleMode?: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      // Error handled by useAuth hook
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md ">
      <Card title="Welcome Back">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            name="email"
            type="email"
            label="Email Address"
            value={credentials.email}
            onValueChange={handleFieldChange}
            placeholder="Enter your email"
            required
          />

          <FormField
            name="password"
            type="password"
            label="Password"
            value={credentials.password}
            onValueChange={handleFieldChange}
            placeholder="Enter your password"
            required
          />

          <ErrorMessage message={error} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl hover:bg-blue-800 shadow-md hover:shadow-lg transition-all font-bold"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center pt-6 border-t border-gray-100 mt-6">
            <p className="text-gray-600 mb-4 text-sm">Don't have an account?</p>
            <Button
              type="button"
              size="md"
              onClick={() => navigate("/auth/signup")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 rounded-full font-bold transition-all shadow-sm hover:shadow-md"
            >
              Create New Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}