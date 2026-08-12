import React, { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1 text-left font-sans">
        {label && (
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-md border text-sm transition-all focus:outline-none focus:ring-1
              ${leftIcon ? 'pl-9' : 'pl-3'} pr-3 py-2
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/10'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
