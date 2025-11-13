
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-yellow-200 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-50
                   focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400
                   transition-colors duration-200"
      />
    </div>
  );
};

export default Input;