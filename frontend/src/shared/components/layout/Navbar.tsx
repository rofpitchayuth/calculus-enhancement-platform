import { Button } from "../ui/Button";
import { useAuth } from "../../../features/auth/hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";





interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


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
              className={({ isActive }: { isActive: boolean }) =>
                `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${isActive ? "text-gray-900 font-medium" : ""
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
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
              to="/allquiz"
              className={({ isActive }: { isActive: boolean }) =>
                `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${isActive ? "text-gray-900 font-medium" : ""
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
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
              to="/alldashboard"
              className={({ isActive }: { isActive: boolean }) =>
                `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${isActive ? "text-gray-900 font-medium" : ""
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  Dashboard
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </li>
          {user?.role === "admin" && (
            <li className="relative">
              <NavLink
                to="/admin/questions"
                className={({ isActive }: { isActive: boolean }) =>
                  `relative px-1 py-0.1 transition-colors hover:text-blue-600 ${isActive ? "text-gray-900 font-medium" : ""
                  }`
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    Question Bank
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </div>


      <div className="flex space-x-3">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-3 px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Avatar Circle */}
              <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0" />

              {/* Hello Text */}
              <div className="text-left leading-tight">
                <span className="block text-sm text-[#1e3a5f] font-normal">Hello ,</span>
                <span className="block text-sm text-[#1e3a5f] font-bold uppercase">
                  {user?.full_name}
                </span>
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-[#4a7fa5] transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => {
                    navigate("/dashboard/overview");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-[#1e3a5f] hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 text-[#4a7fa5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Overview
                </button>

                <div className="mx-3 border-t border-gray-100" />

                <button
                  onClick={() => {
                    logout();
                    navigate("/auth/login");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="rounded-full"
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
