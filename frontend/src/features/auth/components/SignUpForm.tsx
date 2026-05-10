import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components/ui/Card.tsx";
import { FormField } from "../../../shared/components/ui/FormField.tsx";
import { Button } from "../../../shared/components/ui/Button.tsx";
import { ErrorMessage } from "../../../shared/components/ui/ErrorMessage.tsx";
import { useAuth } from "../hooks/useAuth.tsx";
import type { SignUpData } from "../types/auth.type";

export function SignUpForm() {
  const { signUp, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    full_name: "",
    role: "student",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signUp(formData);
      navigate("/home");
    } catch (error) {
      
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md">
      <Card title="Create Account">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            name="full_name"
            type="text"
            label="Full Name"
            value={formData.full_name||""}
            onValueChange={handleFieldChange}
            placeholder="Enter your full name"
            required
          />

          <FormField
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onValueChange={handleFieldChange}
            placeholder="Enter your email"
            required
          />

          <FormField
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onValueChange={handleFieldChange}
            placeholder="Enter your password (min 6 characters)"
            required
          />

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => handleFieldChange("role", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
            </select>
          </div>

          <ErrorMessage message={error} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 shadow-md hover:shadow-lg transition-all font-bold"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>

          <div className="text-center pt-6 border-t border-gray-100 mt-6">
            <p className="text-gray-600 mb-4 text-sm">Already have an account?</p>
            <Button
              type="button"
              size="md"
              onClick={() => navigate("/auth/login")}
              className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-8 py-2 rounded-full font-bold transition-all shadow-sm hover:shadow-md"
            >
              Sign In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}