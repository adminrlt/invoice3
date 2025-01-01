import React from 'react';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

interface InvoiceDetailsProps {
  vendorName?: string;
  bankName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  summary?: string;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  vendorName,
  bankName,
  invoiceNumber,
  invoiceDate,
  totalAmount,
  taxAmount,
  subtotal,
  summary
}) => {
  return (
    <div className="bg-gray-50 px-4 py-3 rounded-lg">
      {summary && (
        <div className="mb-4 text-sm text-gray-600 italic border-b pb-2">
          {summary}
        </div>
      )}
      
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {vendorName && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
            <dd className="mt-1 text-sm text-gray-900">{vendorName}</dd>
          </div>
        )}
        {bankName && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank</dt>
            <dd className="mt-1 text-sm text-gray-900">{bankName}</dd>
          </div>
        )}
        {invoiceNumber && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoiceNumber}</dd>
          </div>
        )}
        {invoiceDate && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(invoiceDate)}</dd>
          </div>
        )}
        {subtotal && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatCurrency(subtotal)}</dd>
          </div>
        )}
        {taxAmount && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatCurrency(taxAmount)}</dd>
          </div>
        )}
        {totalAmount && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(totalAmount)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};