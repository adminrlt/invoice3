import { supabase } from '../../lib/supabase';

export const getPublicUrl = async (path: string): Promise<string> => {
  try {
    // Try to get a public URL
    const { data: { publicUrl }, error } = await supabase.storage
      .from('documents')
      .getPublicUrl(path);

    if (error) throw error;
    if (!publicUrl) throw new Error('Failed to get public URL');

    // Ensure URL is properly formatted
    const url = new URL(publicUrl);
    if (!url.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol');
    }

    return publicUrl;
  } catch (error: any) {
    console.error('Error getting public URL:', error);
    throw new Error(`Failed to get public URL: ${error.message}`);
  }
};