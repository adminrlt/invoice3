import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useInvoiceNavigation } from '../../../hooks/useInvoiceNavigation';
import { InvoiceList } from './InvoiceList';
import { LoadingSpinner } from '../../common/LoadingSpinner';

export const InvoiceNavigation = () => {
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const { invoices, isLoading, error } = useInvoiceNavigation();

  const toggleCase = useCallback((caseNumber: string) => {
    setExpandedCases(prev => {
      const next = new Set(prev);
      if (next.has(caseNumber)) {
        next.delete(caseNumber);
      } else {
        next.add(caseNumber);
      }
      return next;
    });
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  // Group invoices by case number
  const groupedInvoices = invoices.reduce((acc, invoice) => {
    const { caseNumber } = invoice;
    if (!acc[caseNumber]) {
      acc[caseNumber] = [];
    }
    acc[caseNumber].push(invoice);
    return acc;
  }, {} as Record<string, typeof invoices>);

  return (
    <div className="bg-white shadow rounded-lg">
      <ul className="divide-y divide-gray-200">
        {Object.entries(groupedInvoices).map(([caseNumber, caseInvoices]) => {
          const isExpanded = expandedCases.has(caseNumber);
          return (
            <li key={caseNumber}>
              <div
                onClick={() => toggleCase(caseNumber)}
                className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <FileText className="h-5 w-5 text-gray-400 ml-2" />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {caseNumber}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({caseInvoices.length} {caseInvoices.length === 1 ? 'invoice' : 'invoices'})
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4">
                  <InvoiceList invoices={caseInvoices} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};