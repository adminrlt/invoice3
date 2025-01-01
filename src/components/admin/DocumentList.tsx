import React, { useState } from 'react';
import { FileText, Eye, RefreshCw, ExternalLink, Book, BookOpen } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { getFileNameFromUrl } from '../../utils/file';
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing';
import { PdfViewer } from '../pdf/PdfViewer';
import { DocumentSummaryView } from '../pdf/DocumentSummary';
import { PageCount } from '../pdf/PageCount';
import { usePageCount } from '../../hooks/usePageCount';
import type { Document } from '../../types';
import type { DocumentSummary } from '../../lib/api/azure/summarize';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<DocumentSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { isProcessing, processDocument } = useDocumentProcessing();

  const handlePreview = async (path: string) => {
    try {
      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('documents')
        .getPublicUrl(path);
      
      if (urlError) throw urlError;
      setPreviewUrl(publicUrl);
      setSummaryData(null);
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error('Failed to preview file: ' + error.message);
    }
  };

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li key={doc.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </p>
                        {doc.case_number && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {doc.case_number}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">{formatDate(doc.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span className="truncate">{doc.file_urls.length} file(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {doc.file_urls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {getFileNameFromUrl(url)}
                      </span>
                      <PageCount {...usePageCount(doc.id, url)} />
                      <button
                        onClick={() => handlePreview(url)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Preview PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => processDocument(doc.id, url)}
                        disabled={isProcessing(url)}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Process document"
                      >
                        <RefreshCw 
                          className={`h-4 w-4 ${isProcessing(url) ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {previewUrl && (
        <PdfViewer
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}

      {summaryData && (
        <DocumentSummaryView summary={summaryData} />
      )}
    </div>
  );
};