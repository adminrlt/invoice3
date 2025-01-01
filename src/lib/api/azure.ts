import { analyzeDocument, pollAnalysisResult } from './azure/client';
import { logProcessing } from './logging';

interface ExtractedInfo {
  vendorName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalAmount?: number;
}

export const extractDocumentInfo = async (fileUrl: string): Promise<ExtractedInfo> => {
  const startTime = Date.now();
  const documentId = fileUrl.split('/').pop()?.split('.')[0] || 'unknown';

  try {
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Starting Azure AI analysis',
      details: { fileUrl }
    });

    const response = await analyzeDocument(fileUrl);
    const operationLocation = response.headers.get('operation-location');
    
    if (!operationLocation) {
      throw new Error('No operation location returned');
    }

    const result = await pollForResults(documentId, operationLocation);
    const extractedInfo = parseResults(result);

    await logProcessing({
      documentId,
      status: 'completed',
      step: 'Document analysis completed',
      details: {
        processingTime: Date.now() - startTime,
        documentInfo: extractedInfo
      }
    });

    return extractedInfo;
  } catch (error: any) {
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Azure AI analysis failed',
      details: {
        error: error.message,
        processingTime: Date.now() - startTime
      },
      errorMessage: error.message
    });

    throw new Error(`Failed to analyze document: ${error.message}`);
  }
};

const pollForResults = async (documentId: string, operationLocation: string): Promise<any> => {
  const maxAttempts = 30;
  const interval = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await pollAnalysisResult(operationLocation);
      
      await logProcessing({
        documentId,
        status: 'processing',
        step: 'Polling Azure results',
        details: { attempt, status: result.status }
      });

      if (result.status === 'succeeded') {
        return result;
      }
      
      if (result.status === 'failed') {
        throw new Error(result.error?.message || 'Azure analysis failed');
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error: any) {
      if (attempt === maxAttempts - 1) {
        throw new Error(`Polling timeout after ${maxAttempts} attempts: ${error.message}`);
      }
    }
  }

  throw new Error('Azure operation timed out');
};

const parseResults = (result: any): ExtractedInfo => {
  try {
    const document = result.analyzeResult?.documents?.[0];
    if (!document) {
      throw new Error('No document content found');
    }

    const fields = document.fields;
    return {
      vendorName: fields.VendorName?.content,
      invoiceNumber: fields.InvoiceId?.content,
      invoiceDate: fields.InvoiceDate?.content,
      totalAmount: fields.InvoiceTotal?.content?.amount
    };
  } catch (error: any) {
    console.error('Parsing error:', error);
    throw new Error(`Failed to parse document info: ${error.message}`);
  }
};