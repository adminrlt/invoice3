import React from 'react';
import { FileCheck, FileWarning, Loader } from 'lucide-react';
import { useProcessingStatus } from '../../hooks/useProcessingStatus';

export const DocumentProcessingStatus = () => {
  const { totalDocuments, processed, failed, isLoading } = useProcessingStatus();

  if (isLoading) {
    return (
      <div className="flex items-center text-gray-400 text-sm">
        <Loader className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center text-green-600">
        <FileCheck className="h-4 w-4 mr-1" />
        <span>{processed} processed</span>
      </div>
      {failed > 0 && (
        <div className="flex items-center text-red-600">
          <FileWarning className="h-4 w-4 mr-1" />
          <span>{failed} failed</span>
        </div>
      )}
      <div className="text-gray-500">
        {totalDocuments} total
      </div>
    </div>
  );
};