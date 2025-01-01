import { processDocumentWithAzure } from '../azure/documentProcessor';
import { splitPdfPages } from '../../../utils/pdf/pdfSplitter';
import { uploadPageToCases } from './storage';
import { savePageInfo } from './pageInfo';
import { logProcessing } from '../logging';
import { retryOperation } from '../../../utils/async/retry';
import type { PageProcessingResult } from '../../../types/document';

export const processDocumentPage = async (
  documentId: string,
  caseNumber: string,
  pdfData: ArrayBuffer
): Promise<PageProcessingResult[]> => {
  const results: PageProcessingResult[] = [];
  
  try {
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Splitting PDF into pages'
    });

    const pages = await splitPdfPages(pdfData);
    
    for (let i = 0; i < pages.length; i++) {
      const pageNumber = i + 1;
      
      try {
        await logProcessing({
          documentId,
          status: 'processing',
          step: `Processing page ${pageNumber}`,
          details: { pageNumber, totalPages: pages.length }
        });

        // Process with retry
        const extractedInfo = await retryOperation(
          () => processDocumentWithAzure(documentId, new Blob([pages[i]], { type: 'application/pdf' })),
          3,
          { initialDelay: 2000 }
        );

        const timestamp = Date.now();
        const invoiceNumber = extractedInfo.invoiceNumber || `UNKNOWN-${timestamp}`;
        const storagePath = `${caseNumber}/${invoiceNumber}-page${pageNumber}-${timestamp}.pdf`;
        
        await uploadPageToCases(storagePath, pages[i]);
        await savePageInfo(documentId, pageNumber, storagePath, extractedInfo);

        results.push({
          pageNumber,
          success: true,
          storagePath
        });

        await logProcessing({
          documentId,
          status: 'processing',
          step: `Completed page ${pageNumber}`,
          details: { pageNumber, storagePath }
        });
      } catch (error: any) {
        console.error(`Error processing page ${pageNumber}:`, error);
        
        await logProcessing({
          documentId,
          status: 'error',
          step: `Failed to process page ${pageNumber}`,
          details: { pageNumber, error: error.message },
          errorMessage: error.message
        });

        results.push({
          pageNumber,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error: any) {
    console.error('Failed to process document pages:', error);
    throw new Error(`Failed to process document pages: ${error.message}`);
  }
};