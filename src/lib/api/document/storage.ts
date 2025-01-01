import { supabase } from '../../supabase';

export const uploadPageToCases = async (path: string, data: Uint8Array): Promise<void> => {
  try {
    // Validate inputs
    if (!path || !data) {
      throw new Error('Invalid upload parameters');
    }

    const folderPath = path.split('/').slice(0, -1).join('/');
    const fileName = path.split('/').pop();

    if (!fileName) {
      throw new Error('Invalid file path');
    }

    // Ensure folder exists
    await supabase.storage
      .from('cases')
      .list(folderPath)
      .catch(() => null); // Ignore error if folder doesn't exist

    // Upload with retry logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('cases')
          .upload(path, data, {
            cacheControl: '3600',
            upsert: true // Always use upsert to avoid conflicts
          });

        if (!uploadError) {
          return; // Success
        }

        throw uploadError;
      } catch (error: any) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  } catch (error: any) {
    console.error(`Storage error for ${path}:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};