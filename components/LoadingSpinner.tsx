import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-12 h-12 border-4 border-indigo-900/50 border-t-indigo-400 rounded-full animate-spin shadow-[0_0_15px_rgba(129,140,248,0.3)]"></div>
    <p className="text-indigo-300 font-medium animate-pulse tracking-wide">Analyzing visual content...</p>
  </div>
);