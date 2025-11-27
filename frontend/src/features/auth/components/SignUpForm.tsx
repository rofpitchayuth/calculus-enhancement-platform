import { useState } from 'react';
import { Button, FormField, Card, ErrorMessage } from '../../../shared/components/ui';
import { useAuth } from '../hooks/useAuth';
import type { SignUpData } from '../types/auth.type';

interface SignUpFormProps {
  onToggleMode?: () => void;
  onSuccess?: () => void;
}

export function SignUpForm({ onToggleMode, onSuccess }: SignUpFormProps) {
  const { signUp, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await signUp(formData);
      onSuccess?.();
    } catch (error) {
      // Error handled by useAuth hook
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card 
        title="Create Account"
        subtitle="Join thousands of calculus learners"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            name="name"
            type="text"
            label="Full Name"
            value={formData.name}
            error={validationErrors.name}
            onValueChange={handleFieldChange}
            placeholder="Enter your full name"
            required
          />

          <FormField
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            error={validationErrors.email}
            onValueChange={handleFieldChange}
            placeholder="Enter your email"
            required
          />

          <FormField
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            error={validationErrors.password}
            onValueChange={handleFieldChange}
            placeholder="Create a password"
            helperText="Must be at least 8 characters"
            required
          />

          <FormField
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            error={validationErrors.confirmPassword}
            onValueChange={handleFieldChange}
            placeholder="Confirm your password"
            required
          />

          <ErrorMessage message={error} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <div className="text-center pt-4">
            <p className="text-gray-600 mb-3">Already have an account?</p>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
            >
              Sign In Instead
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}