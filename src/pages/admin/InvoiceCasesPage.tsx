import React from 'react';
import { InvoiceNavigation } from '../../components/admin/invoices/InvoiceNavigation';

export const InvoiceCasesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Invoice Cases</h1>
      <InvoiceNavigation />
    </div>
  );
};