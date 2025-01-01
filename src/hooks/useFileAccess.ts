import { useState, useCallback } from 'react';
import { getFileAccess } from '../utils/storage/access';
import toast from 'react-hot-toast';

export const useFileAccess = () => {
  const [isLoading, setIsLoading] = useState(false);

  const openFile = useCallback(async (path: string, newTab = false): Promise<boolean> => {
    if (!path) {
      toast.error('Invalid file path');
      return false;
    }

    setIsLoading(true);

    try {
      const { url } = await getFileAccess(path);
      
      if (newTab && url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      
      return true;
    } catch (error: any) {
      console.error('File access error:', error);
      toast.error('Unable to access file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    openFile
  };
};