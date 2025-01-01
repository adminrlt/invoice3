import { supabase } from '../../supabase';

export const validateDocument = async (documentId: string) => {
  try {
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('case_number, file_urls')
      .eq('id', documentId)
      .single();

    if (docError) throw new Error('Failed to get document details');
    if (!document) throw new Error('Document not found');
    if (!document.case_number) throw new Error('Document has no case number');
    if (!document.file_urls?.length) throw new Error('Document has no files');

    return document;
  } catch (error: any) {
    console.error('Document validation error:', error);
    throw error;
  }
};

export const downloadDocument = async (fileUrl: string): Promise<ArrayBuffer> => {
  try {
    // First try to get a signed URL
    const { data: { signedUrl }, error: signedError } = await supabase.storage
      .from('documents')
      .createSignedUrl(fileUrl, 60);

    if (signedError) throw signedError;

    // Download using signed URL
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error: any) {
    console.error('Document download error:', error);
    throw new Error(`Failed to download document: ${error.message}`);
  }
};