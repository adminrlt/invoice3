import { validateUUID } from './uuid';

export const validateDocumentId = (id: string | undefined): boolean => {
  return validateUUID(id);
};

export const validatePageNumber = (pageNumber: number): boolean => {
  return Number.isInteger(pageNumber) && pageNumber > 0;
};

export const validateFileUrl = (url: string): boolean => {
  if (!url) return false;
  
  // For internal storage paths
  if (url.startsWith('documents/') || url.startsWith('cases/')) {
    return true;
  }
  
  // For external URLs
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};