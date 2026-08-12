import React from 'react';

interface LoadingStateProps {
  type?: 'card' | 'list' | 'profile' | 'page';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  count = 3,
}) => {
  const CardSkeleton = () => (
    <div className="bg-white border border-gray-150 rounded-lg p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="w-1/2 h-3.5 bg-gray-200 rounded" />
          <div className="w-1/3 h-2.5 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-full h-12 bg-gray-200 rounded" />
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-gray-200 rounded-full" />
        <div className="w-16 h-5 bg-gray-200 rounded-full" />
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white border border-gray-150 rounded-lg p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="w-1/4 h-3 bg-gray-200 rounded" />
          <div className="w-1/3 h-2 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-12 h-6 bg-gray-200 rounded" />
    </div>
  );

  if (type === 'page') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/50 backdrop-blur-xs">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border border-gray-150 rounded-lg p-8 flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="flex-1 flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <div className="w-48 h-6 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-64 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-1/4 h-4 bg-gray-200 rounded" />
          <div className="w-full h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${type === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {type === 'card' ? <CardSkeleton /> : <ListSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
};
export default LoadingState;
