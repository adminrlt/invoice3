import { supabase } from '../../supabase';
import { logProcessing } from '../logging';
import { processDocumentPage } from './processPage';
import { downloadDocument, validateDocument } from './documentUtils';
import type { ProcessingResult } from '../../../types/document';

export const processDocument = async (documentId: string, fileUrl: string): Promise<ProcessingResult> => {
  const startTime = Date.now();
  
  try {
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Starting document processing',
      details: { fileUrl }
    });

    // Validate document and get details
    const document = await validateDocument(documentId);

    // Download and prepare PDF
    const pdfData = await downloadDocument(fileUrl);
    
    // Process each page
    const results = await processDocumentPage(documentId, document.case_number, pdfData);

    // Log final status
    await logProcessing({
      documentId,
      status: results.every(r => r.success) ? 'completed' : 'error',
      step: 'Document processing completed',
      details: {
        processingTime: Date.now() - startTime,
        results
      }
    });
    
    return { 
      success: results.some(r => r.success), // Consider partial success
      results 
    };
  } catch (error: any) {
    console.error('Document processing error:', error);
    
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Document processing failed',
      details: {
        error: error.message,
        processingTime: Date.now() - startTime
      },
      errorMessage: error.message
    });

    // Update document status
    await supabase
      .from('document_info')
      .upsert({
        document_id: documentId,
        processing_status: 'error',
        error_message: error.message,
        updated_at: new Date().toISOString()
      });
    
    return {
      success: false,
      error: error.message || 'Failed to process document'
    };
  }
};