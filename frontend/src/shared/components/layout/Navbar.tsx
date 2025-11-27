import { Button } from "../ui/Button";
import { useAuth } from "../../../features/auth/hooks/useAuth";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleSignUp = () => {
    window.location.href = '/login?mode=signup';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className={`
      max-w-6xl mx-auto
      flex items-center justify-between 
      bg-white 
      text-gray-600 px-6 py-4 shadow-lg
      font-bold
      rounded-xl md:rounded-2xl
      sticky top-5 z-50
      border border-gray-100
      ${className}
    `}>
      
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">CP</span>
        </div>
        <span className="text-xl font-bold text-gray-800">Calculus Platform</span>
      </div>

      <ul className="flex items-center space-x-6">
        <li>
          <a href="/" className="hover:text-blue-600 transition-colors">
            Home
          </a>
        </li>
        <li>
          <a href="/calculus" className="hover:text-blue-600 transition-colors">
            Tools
          </a>
        </li>
        <li>
          <a href="/practice" className="hover:text-blue-600 transition-colors">
            Practice
          </a>
        </li>
        {isAuthenticated && (
          <li>
            <a href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </a>
          </li>
        )}
      </ul>

      <div className="flex space-x-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="md"
              onClick={handleSignIn}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Sign In
            </Button>
            
            <Button 
              variant="primary" 
              size="md"
              onClick={handleSignUp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}