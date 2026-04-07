import React from 'react';

export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} relative`}>
      <div className={`${sizes[size]} rounded-full border-4 border-gray-100 dark:border-gray-700`} />
      <div className={`${sizes[size]} rounded-full border-4 border-transparent border-t-green-500 animate-spin absolute inset-0`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-100 dark:border-gray-800" />
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-green-500 animate-spin absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🥦</div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading GroceryAI...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-lg w-2/3" />
        <div className="flex justify-between mt-4">
          <div className="h-6 skeleton rounded-lg w-16" />
          <div className="h-8 skeleton rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}
