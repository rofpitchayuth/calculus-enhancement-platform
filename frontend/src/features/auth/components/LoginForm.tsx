import { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { FormField } from '../../../shared/components/ui/FormField';
import { Button } from '../../../shared/components/ui/Button';
import { ErrorMessage } from '../../../shared/components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.type';

interface LoginFormProps {
  onToggleMode?: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onToggleMode, onSuccess }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
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
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto">
      <Card
        title="Welcome Back"
      >
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center pt-4">
            <p className="text-gray-600 mb-3">Don't have an account?</p>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
            >
              Create New Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}