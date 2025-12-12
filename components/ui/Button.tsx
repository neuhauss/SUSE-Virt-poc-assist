import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center";
  
  const variants = {
    primary: "bg-suse-base text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
    secondary: "bg-suse-dark text-white hover:bg-emerald-900 disabled:bg-gray-300",
    outline: "border-2 border-suse-base text-suse-base hover:bg-emerald-50 disabled:border-gray-300 disabled:text-gray-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};