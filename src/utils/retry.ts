interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt),
        maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
};