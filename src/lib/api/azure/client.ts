import { AZURE_CONFIG } from '../../config/azure';
import { retryOperation } from '../../../utils/async/retry';

export const analyzeDocument = async (fileUrl: string) => {
  return retryOperation(async () => {
    try {
      const response = await fetch(
        `${AZURE_CONFIG.endpoint}/formrecognizer/documentModels/prebuilt-invoice:analyze?api-version=${AZURE_CONFIG.apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
          },
          body: JSON.stringify({ urlSource: fileUrl })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis request failed (${response.status}): ${errorText}`);
      }

      return response;
    } catch (error: any) {
      console.error('Azure API error:', error);
      throw new Error(`Azure API error: ${error.message}`);
    }
  }, 3, { initialDelay: 1000 });
};

export const pollAnalysisResult = async (operationLocation: string) => {
  return retryOperation(async () => {
    try {
      const response = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_CONFIG.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polling failed (${response.status}): ${errorText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('Azure polling error:', error);
      throw new Error(`Azure polling error: ${error.message}`);
    }
  }, 3, { initialDelay: 1000 });
};