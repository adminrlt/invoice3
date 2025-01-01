import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { InvoiceList } from './InvoiceList';
import type { Document } from '../../../types';

interface CaseListProps {
  cases: Record<string, Document[]>;
}

export const CaseList: React.FC<CaseListProps> = ({ cases }) => {
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());

  const toggleCase = (caseNumber: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseNumber)) {
      newExpanded.delete(caseNumber);
    } else {
      newExpanded.add(caseNumber);
    }
    setExpandedCases(newExpanded);
  };

  return (
    <div className="border-t border-gray-200">
      <ul className="divide-y divide-gray-200">
        {Object.entries(cases).map(([caseNumber, documents]) => {
          const isExpanded = expandedCases.has(caseNumber);
          return (
            <li key={caseNumber}>
              <button
                onClick={() => toggleCase(caseNumber)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {caseNumber}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({documents.length} {documents.length === 1 ? 'document' : 'documents'})
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4">
                  <InvoiceList documents={documents} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};