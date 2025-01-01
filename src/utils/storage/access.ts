import { supabase } from '../../lib/supabase';
import { retryOperation } from '../async/retry';

interface StorageResult {
  url: string;
  bucket: 'cases' | 'documents';
}

export const getFileAccess = async (path: string): Promise<StorageResult> => {
  // Try cases bucket first
  try {
    const { data: signedData, error: signedError } = await retryOperation(
      () => supabase.storage
        .from('cases')
        .createSignedUrl(path, 3600),
      3,
      { initialDelay: 1000 }
    );

    if (!signedError && signedData?.signedUrl) {
      return { url: signedData.signedUrl, bucket: 'cases' };
    }
  } catch (error) {
    console.debug('Cases bucket access failed:', error);
  }

  // Try documents bucket with public URL as fallback
  try {
    const { data: { publicUrl }, error: publicError } = await supabase.storage
      .from('documents')
      .getPublicUrl(path);

    if (!publicError && publicUrl) {
      return { url: publicUrl, bucket: 'documents' };
    }
  } catch (error) {
    console.debug('Documents bucket access failed:', error);
  }

  throw new Error('File not accessible');
};