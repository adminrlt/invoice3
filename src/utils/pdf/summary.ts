import { supabase } from '../../lib/supabase';
import { summarizeDocument } from '../../lib/api/azure/summarize';
import type { DocumentSummary } from '../../lib/api/azure/summarize';

export const getDocumentSummary = async (documentId: string, fileUrl: string): Promise<DocumentSummary> => {
  try {
    // Check if summary exists
    const { data: existingSummary, error: fetchError } = await supabase
      .from('document_info')
      .select('summary, key_points, confidence_score')
      .eq('document_id', documentId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingSummary?.summary) {
      return {
        summary: existingSummary.summary,
        keyPoints: existingSummary.key_points || [],
        confidence: existingSummary.confidence_score || 1
      };
    }

    // Get public URL for Azure
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('documents')
      .getPublicUrl(fileUrl);

    if (urlError) throw urlError;

    // Generate summary
    const summary = await summarizeDocument(documentId, publicUrl);

    // Store summary using upsert
    const { error: upsertError } = await supabase
      .from('document_info')
      .upsert({
        document_id: documentId,
        summary: summary.summary,
        key_points: summary.keyPoints,
        confidence_score: summary.confidence,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'document_id'
      });

    if (upsertError) throw upsertError;

    return summary;
  } catch (error: any) {
    console.error('Error getting document summary:', error);
    throw new Error(`Failed to get document summary: ${error.message}`);
  }
};