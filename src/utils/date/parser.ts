/**
 * Parses various date formats and returns ISO date string (YYYY-MM-DD)
 * Handles common formats:
 * - DD.MM.YYYY (European)
 * - MM/DD/YYYY (US)
 * - YYYY-MM-DD (ISO)
 */
export const parseDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;

  try {
    // Clean the input
    const cleaned = dateStr.trim();
    
    // Handle European format (DD.MM.YYYY)
    if (cleaned.includes('.')) {
      const [day, month, year] = cleaned.split('.');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Handle US format (MM/DD/YYYY)
    if (cleaned.includes('/')) {
      const [month, day, year] = cleaned.split('/');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try parsing as ISO format
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

export const isValidDate = (dateStr: string): boolean => {
  const parsed = parseDate(dateStr);
  if (!parsed) return false;

  const [year, month, day] = parsed.split('-').map(Number);
  
  // Check year range
  if (year < 1900 || year > 2100) return false;
  
  // Check if it's a valid date
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};