import React from 'react';
import { InvoiceListItem } from './InvoiceListItem';
import type { Invoice } from '../../../types';

interface InvoiceListProps {
  invoices: Invoice[];
  caseNumber: string;
  documentId: string;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  caseNumber,
  documentId 
}) => {
  if (!invoices.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No invoices found
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {invoices.map((invoice, index) => (
        <InvoiceListItem
          key={`${invoice.fileUrl}-${index}`}
          invoice={invoice}
          caseNumber={caseNumber}
          documentId={documentId}
        />
      ))}
    </ul>
  );
};