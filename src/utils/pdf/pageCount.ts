import { supabase } from '../../lib/supabase';
import { logProcessing } from '../../lib/api/logging';

export const getDocumentPageCount = async (documentId: string, fileUrl: string): Promise<number> => {
  try {
    // First check if we have a cached count
    const { data: docInfo } = await supabase
      .from('document_info')
      .select('page_count')
      .eq('document_id', documentId)
      .maybeSingle();

    if (docInfo?.page_count) {
      return docInfo.page_count;
    }

    // Get public URL for the file
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('documents')
      .getPublicUrl(fileUrl);

    if (urlError) throw urlError;

    // Fetch PDF headers
    const response = await fetch(publicUrl, {
      method: 'HEAD',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document information');
    }

    // Calculate page count based on file size
    // Average PDF page is roughly 100KB
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    const estimatedPages = Math.max(1, Math.ceil(contentLength / (100 * 1024)));

    // Log the page count calculation
    await logProcessing({
      documentId,
      status: 'processing',
      step: 'Calculating page count',
      details: {
        fileSize: contentLength,
        estimatedPages,
        method: 'size-based'
      }
    });

    // Store the page count
    await supabase
      .from('document_info')
      .upsert({
        document_id: documentId,
        page_count: estimatedPages,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'document_id'
      });

    return estimatedPages;
  } catch (error: any) {
    console.error('Error calculating page count:', error);
    
    // Log the error
    await logProcessing({
      documentId,
      status: 'error',
      step: 'Page count calculation failed',
      details: { error: error.message },
      errorMessage: error.message
    });

    return 1; // Default to 1 page on error
  }
};

export const updateDocumentPageCount = async (documentId: string, pageCount: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('document_info')
      .upsert({
        document_id: documentId,
        page_count: pageCount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'document_id'
      });

    if (error) throw error;

    await logProcessing({
      documentId,
      status: 'completed',
      step: 'Updated page count',
      details: { pageCount }
    });
  } catch (error: any) {
    console.error('Error updating page count:', error);
    throw error;
  }
};