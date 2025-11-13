
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, ...props }) => {
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      {...props}
      className={`px-6 py-3 font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg
                  transition-all duration-300 ease-in-out
                  hover:shadow-lg hover:shadow-yellow-500/40 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-400
                  disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
                  ${widthClass} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;