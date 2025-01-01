import { AZURE_CONFIG } from './config';
import { logProcessing } from '../logging';

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
  confidence: number;
}

export const summarizeDocument = async (documentId: string, url: string): Promise<DocumentSummary> => {
  try {
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Starting document summarization',
      details: { url }
    });

    const response = await fetch(
      `${AZURE_CONFIG.endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
        },
        body: JSON.stringify({ urlSource: url })
      }
    );

    if (!response.ok) {
      throw new Error(`Analysis request failed: ${await response.text()}`);
    }

    const operationLocation = response.headers.get('operation-location');
    if (!operationLocation) {
      throw new Error('No operation location returned');
    }

    const result = await pollForResults(documentId, operationLocation);
    const summary = extractSummary(result);

    await logProcessing({
      documentId,
      status: 'completed',
      step: 'Document summarization completed',
      details: { summary }
    });

    return summary;
  } catch (error: any) {
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Document summarization failed',
      details: { error: error.message },
      errorMessage: error.message
    });
    throw error;
  }
};

const pollForResults = async (documentId: string, operationLocation: string): Promise<any> => {
  const maxRetries = 60;
  const retryDelay = 1000;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Polling failed: ${await response.text()}`);
      }

      const result = await response.json();
      
      await logProcessing({
        documentId,
        status: 'processing',
        step: 'Polling for results',
        details: { status: result.status, attempt: retries + 1 }
      });
      
      if (result.status === 'succeeded') {
        return result;
      }
      
      if (result.status === 'failed') {
        throw new Error(result.error?.message || 'Analysis failed');
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
    } catch (error) {
      throw error;
    }
  }

  throw new Error('Operation timed out');
};

const extractSummary = (result: any): DocumentSummary => {
  try {
    const content = result.analyzeResult?.content || '';
    const paragraphs = content.split('\n').filter(Boolean);
    
    // Extract key points (first sentence of each significant paragraph)
    const keyPoints = paragraphs
      .filter(p => p.length > 30) // Filter out short lines
      .map(p => p.split(/[.!?]/).find(s => s.length > 20) || p) // Get first significant sentence
      .slice(0, 5) // Limit to 5 key points
      .map(p => p.trim());

    // Generate summary (first 500 chars of meaningful content)
    const summary = paragraphs
      .join(' ')
      .slice(0, 500)
      .trim() + '...';

    return {
      summary,
      keyPoints,
      confidence: result.analyzeResult?.confidence || 0
    };
  } catch (error) {
    console.error('Error extracting summary:', error);
    throw new Error('Failed to extract document summary');
  }
};