import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { DocumentSummary } from '../../lib/api/azure/summarize';

interface DocumentSummaryProps {
  summary: DocumentSummary;
  isLoading?: boolean;
  error?: string;
}

export const DocumentSummaryView: React.FC<DocumentSummaryProps> = ({
  summary,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-4">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-600">{summary.summary}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Key Points</h3>
        <ul className="list-disc list-inside space-y-1">
          {summary.keyPoints.map((point, index) => (
            <li key={index} className="text-gray-600">{point}</li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-500">
        Confidence score: {Math.round(summary.confidence * 100)}%
      </div>
    </div>
  );
};