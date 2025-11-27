import { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { SignUpForm } from '../components/SignUpForm';

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleToggleMode = () => {
    setIsSignUp(prev => !prev);
  };

  const handleAuthSuccess = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isSignUp ? (
          <SignUpForm 
            onToggleMode={handleToggleMode}
            onSuccess={handleAuthSuccess}
          />
        ) : (
          <LoginForm 
            onToggleMode={handleToggleMode}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
}