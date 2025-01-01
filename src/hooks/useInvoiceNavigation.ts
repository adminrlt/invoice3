import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface InvoiceInfo {
  caseNumber: string;
  invoiceNumber: string;
  fileUrl: string;
  documentId: string;
  pageNumber: number;
  createdAt: string;
  vendorName?: string;
  bankName?: string;
  invoiceDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  subtotal?: number;
}

export const useInvoiceNavigation = () => {
  const [invoices, setInvoices] = useState<InvoiceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('document_info')
        .select(`
          file_url,
          invoice_number,
          page_number,
          document_id,
          created_at,
          vendor_name,
          bank_name,
          invoice_date,
          total_amount,
          tax_amount,
          subtotal,
          documents:documents(case_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validInvoices = (data || [])
        .filter(item => item.documents?.case_number && item.file_url)
        .map(item => ({
          caseNumber: item.documents.case_number,
          invoiceNumber: item.invoice_number || `Invoice-${item.page_number}`,
          fileUrl: item.file_url,
          documentId: item.document_id,
          pageNumber: item.page_number,
          createdAt: item.created_at,
          vendorName: item.vendor_name,
          bankName: item.bank_name,
          invoiceDate: item.invoice_date,
          totalAmount: item.total_amount,
          taxAmount: item.tax_amount,
          subtotal: item.subtotal
        }));

      setInvoices(validInvoices);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, isLoading, error };
};