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
 * Utility function to retry an async operation with exponential backoff
 * @param operation - The async function to retry
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @param baseDelay - Base delay in milliseconds (default: 2000)
 * @param shouldRetry - Optional function to determine if error should trigger retry
 * @returns Promise that resolves with the operation result or rejects after max attempts
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 10,
  baseDelay: number = 2000,
  shouldRetry?: (error: unknown) => boolean
): Promise<T> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempts++;

      // If we've reached max attempts or shouldRetry returns false, throw the error
      if (attempts >= maxAttempts || (shouldRetry && !shouldRetry(error))) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Operation failed after maximum attempts');
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
  return retryWithBackoff(
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
