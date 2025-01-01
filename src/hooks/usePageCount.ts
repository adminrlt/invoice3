import { useState, useEffect } from 'react';
import { getDocumentPageCount } from '../utils/pdf/pageCount';

export const usePageCount = (documentId: string, fileUrl: string) => {
  const [pageCount, setPageCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageCount = async () => {
      try {
        setIsLoading(true);
        const count = await getDocumentPageCount(documentId, fileUrl);
        setPageCount(count);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching page count:', err);
        setError(err.message);
        setPageCount(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageCount();
  }, [documentId, fileUrl]);

  return { pageCount, isLoading, error };
};