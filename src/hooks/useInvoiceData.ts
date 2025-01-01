import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { processInvoiceWithAzure } from '../lib/api/azure/invoiceProcessor';
import { validateDocumentId } from '../utils/validation/document';
import toast from 'react-hot-toast';

export const useInvoiceData = (documentId: string | undefined, caseNumber: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoiceData = useCallback(async () => {
    if (!documentId) {
      console.error('Invalid document ID');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('invoice_data')
        .select('*')
        .eq('document_id', documentId)
        .order('page_number');

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching invoice data:', err);
      throw new Error(`Failed to fetch invoice data: ${err.message}`);
    }
  }, [documentId]);

  const processInvoice = async (fileUrl: string, pageNumber: number) => {
    if (!documentId) {
      toast.error('Invalid document ID');
      return;
    }

    if (!validateDocumentId(documentId)) {
      toast.error('Invalid document format');
      return;
    }

    const toastId = toast.loading('Processing invoice...');
    setIsLoading(true);

    try {
      await processInvoiceWithAzure(documentId, caseNumber, fileUrl, pageNumber);
      toast.success('Invoice processed successfully', { id: toastId });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process invoice';
      console.error('Error processing invoice:', { error: err, details: errorMessage });
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processInvoice,
    fetchInvoiceData
  };
};