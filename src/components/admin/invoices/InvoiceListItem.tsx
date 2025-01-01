import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, FileSearch } from 'lucide-react';
import { formatDate } from '../../../utils/date';
import { useFileAccess } from '../../../hooks/useFileAccess';
import { useInvoiceData } from '../../../hooks/useInvoiceData';
import { InvoiceDetails } from './InvoiceDetails';
import { ProcessingStatus } from './ProcessingStatus';
import type { Invoice } from '../../../types';

interface InvoiceListItemProps {
  invoice: Invoice;
  caseNumber: string;
  documentId: string;
}

export const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ 
  invoice, 
  caseNumber,
  documentId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openFile, isLoading: isFileLoading } = useFileAccess();
  const { processInvoice, isLoading: isProcessing } = useInvoiceData(documentId, caseNumber);

  const handleOpenFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await openFile(invoice.fileUrl, true);
  };

  const handleExtractData = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await processInvoice(invoice.fileUrl, invoice.pageNumber);
  };

  return (
    <li className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
        <div 
          className="flex items-center flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div className="ml-3 text-left">
            <p className="text-sm font-medium text-gray-900">
              {invoice.invoiceNumber || `Page ${invoice.pageNumber}`}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ProcessingStatus 
            status={invoice.status || 'pending'} 
            errorMessage={invoice.error_message}
          />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExtractData}
              disabled={isProcessing}
              className={`p-1 text-gray-400 hover:text-indigo-600 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Extract invoice data"
            >
              <FileSearch className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenFile}
              disabled={isFileLoading}
              className={`p-1 text-gray-400 hover:text-gray-600 ${
                isFileLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <InvoiceDetails {...invoice} />
        </div>
      )}
    </li>
  );
};