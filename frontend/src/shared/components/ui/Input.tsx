import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    variant = 'default',
    className = '', 
    ...props 
  }, ref) => {
    const hasError = error || variant === 'error';
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 border rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-colors
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
            }
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="text-red-600 text-sm mt-1">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';