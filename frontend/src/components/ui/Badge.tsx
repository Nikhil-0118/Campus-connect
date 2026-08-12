import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
}) => {
  const variants = {
    primary: 'bg-primary-light text-primary border-teal-200/50',
    secondary: 'bg-amber-50 text-amber-700 border-amber-200/50',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
    error: 'bg-rose-50 text-rose-700 border-rose-200/50',
    gray: 'bg-gray-100 text-gray-700 border-gray-200/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};
export default Badge;
