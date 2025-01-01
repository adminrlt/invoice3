import React from 'react';
import { Book } from 'lucide-react';

interface PageCountProps {
  count: number;
  isLoading?: boolean;
}

export const PageCount: React.FC<PageCountProps> = ({ count, isLoading }) => {
  return (
    <div className="flex items-center text-sm text-gray-500">
      <Book className="h-4 w-4 mr-1" />
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 rounded h-4 w-12"></div>
      ) : (
        <span>{count} page{count !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};