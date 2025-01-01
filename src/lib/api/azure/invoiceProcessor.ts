import { AZURE_CONFIG } from '../../config/azure';
import { supabase } from '../../supabase';
import { logProcessing } from '../logging';
import { validateDocumentId, validatePageNumber, validateFileUrl } from '../../../utils/validation/document';
import { ProcessingError } from '../errors/ProcessingError';

export const processInvoiceWithAzure = async (
  documentId: string,
  caseNumber: string,
  fileUrl: string,
  pageNumber: number
): Promise<ExtractedInvoiceData> => {
  // Validate inputs
  if (!validateDocumentId(documentId)) {
    throw new ProcessingError('Invalid document ID');
  }

  if (!validatePageNumber(pageNumber)) {
    throw new ProcessingError('Invalid page number');
  }

  if (!validateFileUrl(fileUrl)) {
    throw new ProcessingError('Invalid file URL');
  }

  try {
    // Rest of the implementation remains the same...
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown processing error';
    console.error('Invoice processing error:', {
      error,
      documentId,
      caseNumber,
      pageNumber,
      details: errorMessage
    });
    
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Azure invoice processing',
      details: { error: errorMessage }
    });

    throw new ProcessingError(errorMessage);
  }
};