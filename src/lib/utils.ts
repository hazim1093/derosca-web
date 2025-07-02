import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string): string {
  return typeof address === 'string' && address.length === 42
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
}

/**
 * Utility function to wait for a contract state to be ready
 * @param checkState - Function that checks if the contract state is ready
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @param baseDelay - Base delay in milliseconds (default: 2000)
 * @returns Promise that resolves when state is ready or rejects after max attempts
 */
export async function waitForContractState(
  checkState: () => Promise<boolean>,
  maxAttempts: number = 10,
  baseDelay: number = 2000
): Promise<boolean> {
  return retryOperation(
    async () => {
      const isReady = await checkState();
      if (!isReady) {
        throw new Error('Contract state not ready');
      }
      return isReady;
    },
    maxAttempts,
    baseDelay
  );
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  const { categorizeError } = await import('./errors/errorHandling');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const enhancedError = categorizeError(error);
      if (!enhancedError.retryable || attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
