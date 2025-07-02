
export enum ErrorCategory {
  NETWORK = 'network',
  CONTRACT = 'contract',
  USER = 'user',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

export interface EnhancedError {
  category: ErrorCategory;
  message: string;
  originalError?: unknown;
  retryable: boolean;
  userFriendly: string;
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public retryable: boolean = false,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export function categorizeError(error: unknown): EnhancedError {
  if (error instanceof SecurityError) {
    return {
      category: error.category,
      message: error.message,
      originalError: error.originalError,
      retryable: error.retryable,
      userFriendly: error.message
    };
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout')) {
    return {
      category: ErrorCategory.NETWORK,
      message: errorMessage,
      originalError: error,
      retryable: true,
      userFriendly: 'Network connection issue. Please check your internet connection and try again.'
    };
  }
  
  // Contract errors
  if (lowerMessage.includes('revert') || lowerMessage.includes('execution reverted')) {
    return {
      category: ErrorCategory.CONTRACT,
      message: errorMessage,
      originalError: error,
      retryable: false,
      userFriendly: 'Transaction failed due to contract conditions. Please check your inputs and try again.'
    };
  }
  
  // User errors
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
    return {
      category: ErrorCategory.USER,
      message: errorMessage,
      originalError: error,
      retryable: true,
      userFriendly: 'Transaction was cancelled by user.'
    };
  }
  
  // Rate limit errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      message: errorMessage,
      originalError: error,
      retryable: true,
      userFriendly: 'Too many requests. Please wait a moment and try again.'
    };
  }
  
  // Default to unknown
  return {
    category: ErrorCategory.UNKNOWN,
    message: errorMessage,
    originalError: error,
    retryable: false,
    userFriendly: 'An unexpected error occurred. Please try again or contact support.'
  };
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const enhancedError = categorizeError(error);
      
      // Don't retry if it's not retryable or if this is the last attempt
      if (!enhancedError.retryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
