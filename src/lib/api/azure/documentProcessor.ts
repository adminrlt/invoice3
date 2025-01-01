import { AZURE_CONFIG } from './config';
import { logProcessing } from '../logging';
import { retryOperation } from '../../../utils/async/retry';
import { blobToBase64 } from '../../../utils/file/conversion';
import type { DocumentInfo } from '../../../types/document';

export const processDocumentWithAzure = async (
  documentId: string, 
  fileData: Blob
): Promise<DocumentInfo> => {
  try {
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Starting Azure processing',
      details: { fileSize: fileData.size }
    });

    // Validate input
    if (!fileData || fileData.size === 0) {
      throw new Error('Invalid file data received');
    }

    if (fileData.size > 4 * 1024 * 1024) { // 4MB limit
      throw new Error('File size exceeds Azure Form Recognizer limit');
    }

    const base64Data = await blobToBase64(fileData);
    if (!base64Data) {
      throw new Error('Failed to convert file to base64');
    }

    const operationLocation = await initiateAnalysis(documentId, base64Data);
    const result = await pollForResults(documentId, operationLocation);
    const parsedResults = parseResults(result);

    await logProcessing({
      documentId,
      status: 'completed',
      step: 'Azure processing completed',
      details: { results: parsedResults }
    });

    return parsedResults;
  } catch (error: any) {
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Azure processing failed',
      details: { error: error.message },
      errorMessage: error.message
    });

    throw new Error(`Azure processing failed: ${error.message}`);
  }
};

const initiateAnalysis = async (documentId: string, base64Data: string): Promise<string> => {
  return retryOperation(async () => {
    const response = await fetch(
      `${AZURE_CONFIG.endpoint}/formrecognizer/documentModels/prebuilt-invoice:analyze?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
        },
        body: JSON.stringify({ base64Source: base64Data })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure API error (${response.status}): ${errorText}`);
    }

    const location = response.headers.get('operation-location');
    if (!location) {
      throw new Error('No operation location returned from Azure');
    }

    return location;
  }, 3, { initialDelay: 2000 });
};

const pollForResults = async (documentId: string, operationLocation: string): Promise<any> => {
  const maxAttempts = 30;
  const interval = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Polling failed (${response.status}): ${await response.text()}`);
      }

      const result = await response.json();
      
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

const parseResults = (result: any): DocumentInfo => {
  try {
    const document = result.analyzeResult?.documents?.[0];
    if (!document) {
      throw new Error('No document content found in Azure results');
    }

    const fields = document.fields || {};
    const confidence = document.confidence || 0;

    // Extract with null fallbacks for missing fields
    return {
      vendorName: fields.VendorName?.content || null,
      invoiceNumber: fields.InvoiceId?.content || null,
      invoiceDate: fields.InvoiceDate?.content || null,
      totalAmount: fields.InvoiceTotal?.content?.amount || null,
      confidence
    };
  } catch (error: any) {
    throw new Error(`Failed to parse Azure results: ${error.message}`);
  }
};