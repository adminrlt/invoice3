import React from 'react';
import { FileCheck, AlertCircle, Loader } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  status,
  errorMessage
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <FileCheck className="h-4 w-4 text-green-500" />,
          text: 'Processed',
          className: 'bg-green-100 text-green-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Error',
          className: 'bg-red-100 text-red-800'
        };
      case 'processing':
        return {
          icon: <Loader className="h-4 w-4 text-yellow-500 animate-spin" />,
          text: 'Processing',
          className: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          icon: <FileCheck className="h-4 w-4 text-gray-400" />,
          text: 'Pending',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const { icon, text, className } = getStatusDisplay();

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon}
        <span className="ml-1">{text}</span>
      </span>
      {errorMessage && status === 'error' && (
        <span className="text-xs text-red-600">{errorMessage}</span>
      )}
    </div>
  );
};