import { Button } from "../ui/Button";
import { useAuth } from "../../../features/auth/hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      className={`
      max-w-6xl mx-auto
      flex items-center justify-between 
      bg-white 
      text-gray-600 px-6 py-4 shadow-lg
      font-bold
      rounded-xl md:rounded-2xl
      sticky top-5 z-50
      border border-gray-100
      ${className}
    `}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">CP</span>
        </div>
        <span className="text-xl font-bold text-gray-800">
          Calculus Platform
        </span>
      </div>

      <ul className="flex items-center space-x-6">
        <li>
          <a href="/" className="hover:text-blue-600 transition-colors">
            Home
          </a>
        </li>
        <li>
          <a href="/" className="hover:text-blue-600 transition-colors">
            Course
          </a>
        </li>

        {isAuthenticated && (
          <li>
            <a
              href="/"
              className="hover:text-blue-600 transition-colors"
            >
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
                Hello, {user?.fullName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { logout(); navigate("/auth/login"); }}
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
              onClick={() => navigate("/auth/login")}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Sign In
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/auth/signup")}
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
