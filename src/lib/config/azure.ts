// Azure Form Recognizer configuration
export const AZURE_CONFIG = {
  endpoint: import.meta.env.VITE_AZURE_ENDPOINT || '',
  apiKey: import.meta.env.VITE_AZURE_API_KEY || '',
  apiVersion: '2023-07-31'
};

// Validation
if (!AZURE_CONFIG.endpoint || !AZURE_CONFIG.apiKey) {
  throw new Error('Missing Azure configuration. Please check your environment variables.');
}