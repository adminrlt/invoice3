import { supabase } from '../../supabase';
import { retryOperation } from '../../../utils/async/retry';
import { parseDate } from '../../../utils/date/parser';
import type { DocumentInfo } from '../../../types/document';

export const savePageInfo = async (
  documentId: string,
  pageNumber: number,
  storagePath: string,
  extractedInfo: DocumentInfo
) => {
  return retryOperation(async () => {
    try {
      // Parse and validate the date
      const parsedDate = extractedInfo.invoiceDate ? 
        parseDate(extractedInfo.invoiceDate) : null;

      // Use upsert with the composite key
      const { error } = await supabase
        .from('document_info')
        .upsert({
          document_id: documentId,
          page_number: pageNumber || 0, // Ensure page_number is never null
          file_url: storagePath,
          vendor_name: extractedInfo.vendorName || null,
          invoice_number: extractedInfo.invoiceNumber || null,
          invoice_date: parsedDate,
          total_amount: extractedInfo.totalAmount || null,
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'document_id,page_number'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving page info:', error);
      throw new Error(`Failed to save page information: ${error.message}`);
    }
  }, 3, { initialDelay: 1000 });
};