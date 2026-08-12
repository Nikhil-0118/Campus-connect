import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load data. Please check your connection.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-gray-150 font-sans">
      <div className="text-red-500 mb-4 bg-red-50 rounded-full p-4 border border-red-100">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">An error occurred</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
export default ErrorState;
