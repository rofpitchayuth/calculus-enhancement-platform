interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`
      bg-blue-100 text-gray-600 
      border-t border-gray-800
      ${className}
    `}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Calculus Platform</span>
          </div>

          <div className="flex space-x-6 text-sm">
            <a href="/help" className="text-gray-600 hover:text-white transition-colors">Help</a>
            <a href="/privacy" className="text-gray-600 hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-600 hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="text-gray-600 hover:text-white transition-colors">Contact</a>
          </div>

          <div className="text-gray-600 text-sm">
            © 2025 All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}