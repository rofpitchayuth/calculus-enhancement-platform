import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'home1' | 'home2';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-900 hover:bg-blue-950 text-white font-semibold focus:ring-blue-500',
    secondary: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    outline: 'border-2 border-current bg-transparent hover:bg-current hover:bg-opacity-10 focus:ring-current',
    ghost: 'bg-transparent hover:bg-current hover:bg-opacity-10 focus:ring-current',
    home1: 'bg-blue-900 text-white focus:ring-blue-500 rounded-lg hover:bg-blue-950',
    home2: 'bg-gray-200 text-blue-900 focus:ring-blue-500 rounded-lg hover:bg-gray-300'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}