import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProcessingStatus {
  totalDocuments: number;
  processed: number;
  failed: number;
  isLoading: boolean;
}

export const useProcessingStatus = (): ProcessingStatus => {
  const [status, setStatus] = useState<ProcessingStatus>({
    totalDocuments: 0,
    processed: 0,
    failed: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Get total documents count
        const { count: totalCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true });

        // Get processing status counts
        const { data: statusData } = await supabase
          .from('document_info')
          .select('processing_status')
          .not('processing_status', 'is', null);

        const processed = statusData?.filter(d => d.processing_status === 'completed').length || 0;
        const failed = statusData?.filter(d => d.processing_status === 'error').length || 0;

        setStatus({
          totalDocuments: totalCount || 0,
          processed,
          failed,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching processing status:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStatus();

    // Subscribe to changes
    const subscription = supabase
      .channel('document_info_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'document_info' },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return status;
};