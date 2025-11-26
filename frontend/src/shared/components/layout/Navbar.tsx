import { Button } from "../ui/Button";
import Logo from '../../../assets/logo.png';


interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
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
        <img 
          src={Logo}
          className="h-10 w-15 mr-3 rounded-md"
        />
      </div>

      <ul className="flex items-center space-x-6 mr-100">
        <li><a href="/" className="hover:text-blue-200 transition-colors">Home</a></li>
        <li><a href="/course" className="hover:text-blue-200 transition-colors">Course</a></li>
        <li><a href="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a></li>
      </ul>

      <div className="flex space-x-3">
        <Button 
          variant="secondary" 
          size="md"
          className="border-white/30 text-gray-600 hover:bg-white/10"
        >
          Sign In
        </Button>
        
        <Button 
          variant="primary" 
          size="md"
          className="bg-blue-900 text-white hover:bg-blue/30 border-white/20"
        >
          Sign Up
        </Button>
      </div>
    </nav>
  );
}