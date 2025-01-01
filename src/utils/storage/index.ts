import { supabase } from '../../lib/supabase';
import { retryOperation } from '../async/retry';

export const getSignedUrl = async (path: string): Promise<string> => {
  try {
    // First try to get a signed URL from the cases bucket
    const { data: signedData, error: signedError } = await retryOperation(
      () => supabase.storage
        .from('cases')
        .createSignedUrl(path, 3600),
      3,
      { initialDelay: 1000 }
    );

    if (!signedError && signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    // If that fails, try the documents bucket
    const { data: docSignedData, error: docSignedError } = await retryOperation(
      () => supabase.storage
        .from('documents')
        .createSignedUrl(path, 3600),
      3,
      { initialDelay: 1000 }
    );

    if (!docSignedError && docSignedData?.signedUrl) {
      return docSignedData.signedUrl;
    }

    throw new Error('Failed to get signed URL');
  } catch (error: any) {
    console.error('Storage error:', error);
    throw new Error('Failed to access file');
  }
};

export const validateStorageAccess = async (path: string): Promise<boolean> => {
  try {
    // Try cases bucket first
    const { data: casesData, error: casesError } = await supabase.storage
      .from('cases')
      .download(path);

    if (!casesError && casesData) {
      return true;
    }

    // Try documents bucket
    const { data: docsData, error: docsError } = await supabase.storage
      .from('documents')
      .download(path);

    return !docsError && !!docsData;
  } catch (error) {
    console.error('Storage validation error:', error);
    return false;
  }
};