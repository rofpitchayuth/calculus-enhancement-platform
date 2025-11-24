interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  return (
    <nav className={`
      flex items-center justify-between 
      bg-white 
      text-gray-600 px-6 py-4 shadow-lg
      font-bold
      sticky top-0 z-50 
      ${className}
    `}>
      
      <div className="flex items-center">
        <h2 className="text-xl font-bold">Calculus Platform</h2>
      </div>

      <ul className="flex items-center space-x-6">
        <li><a href="/" className="hover:text-blue-200 transition-colors">Home</a></li>
        <li><a href="/course" className="hover:text-blue-200 transition-colors">Course</a></li>
        <li><a href="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a></li>
      </ul>

      <div className="flex space-x-3">
        <button className="border border-white/30 px-4 py-2 rounded hover:bg-blue/10 transition-colors">
          Sign In
        </button>
        <button className="bg-blue-200 px-4 py-2 rounded hover:bg-blue-300 transition-colors">
          Sign Up
        </button>
      </div>
    </nav>
  );
}