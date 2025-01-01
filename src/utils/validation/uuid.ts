import { validate as isValidUUID } from 'uuid';

export const validateUUID = (id: string | undefined): boolean => {
  if (!id) return false;
  try {
    return isValidUUID(id);
  } catch {
    return false;
  }
};