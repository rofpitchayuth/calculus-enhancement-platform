import { Button } from "../ui/Button";
import { useAuth } from "../../../features/auth/hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";


interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  

  return (
    <nav
      className={`
      w-250 mx-auto
      flex items-center justify-between 
      bg-white 
      text-gray-600 px-4 py-3 shadow-lg
      font-normal
      rounded-xl md:rounded-full
      sticky top-5 z-50
      border border-gray-100
      ${className}
    `}
    >
      <div className="flex items-center">
        <div className="w-18 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm ">CP</span>
        </div>


        
        <ul className="flex items-center space-x-6">
          <li className="relative">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${
                isActive ? "text-gray-900 font-medium" : ""
              }`
            }
          >
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </li>

          <li className="relative">
            <NavLink
              to="/course"
              className={({ isActive }) =>
                `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${
                  isActive ? "text-gray-900 font-medium" : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Course
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </li>

          <li className="relative">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${
                  isActive ? "text-gray-900 font-medium" : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Dashboard
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </div>

  
      <div className="flex space-x-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Hello, {user?.full_name}
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
              variant="primary"
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="rounded-full "
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/auth/signup")}
              className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white mr-1"
            >
              Sign Up
            </Button>



          </>
        )}
      </div>
    </nav>
  );
}
