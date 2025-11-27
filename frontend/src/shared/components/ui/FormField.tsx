import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  value: string;
  error?: string;
  helperText?: string;
  onValueChange: (name: string, value: string) => void;
}

export function FormField({ 
  name, 
  label, 
  value, 
  error, 
  helperText, 
  onValueChange, 
  ...props 
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(name, e.target.value);
  };

  return (
    <Input
      id={name}
      name={name}
      label={label}
      value={value}
      error={error}
      helperText={helperText}
      onChange={handleChange}
      {...props}
    />
  );
}