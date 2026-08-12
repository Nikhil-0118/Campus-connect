import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-150 shadow-xs transition-all overflow-hidden text-left
        ${onClick ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;
