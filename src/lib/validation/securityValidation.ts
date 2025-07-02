
import { isAddress } from 'viem';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Rate limiter class for client-side request limiting
export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out requests outside the time window
    const validRequests = requests.filter(
      time => now - time < this.config.windowMs
    );
    
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeRemaining = this.config.windowMs - (Date.now() - oldestRequest);
    
    return Math.max(0, timeRemaining);
  }
}

// Global rate limiter instance
export const blockchainQueryLimiter = new ClientRateLimiter({
  maxRequests: 30, // 30 requests per minute
  windowMs: 60 * 1000, // 1 minute
});

// Ethereum address validation
export function validateEthereumAddress(address: string): ValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!address.startsWith('0x')) {
    return { isValid: false, error: 'Address must start with 0x' };
  }
  
  if (address.length !== 42) {
    return { isValid: false, error: 'Address must be 42 characters long' };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }
  
  // Check for zero address
  if (address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
    return { isValid: false, error: 'Zero address is not allowed' };
  }
  
  return { isValid: true };
}

// Numeric input validation
export function validateNumericInput(
  value: number | string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
  decimals: number = 18
): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Must be a valid number' };
  }
  
  if (numValue < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }
  
  // Check decimal places
  const decimalPlaces = value.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > decimals) {
    return { isValid: false, error: `Maximum ${decimals} decimal places allowed` };
  }
  
  return { isValid: true };
}

// Network validation
export function validateNetwork(chainId: number | undefined, expectedChainId: number): ValidationResult {
  if (!chainId) {
    return { isValid: false, error: 'No network detected. Please connect your wallet.' };
  }
  
  if (chainId !== expectedChainId) {
    return { 
      isValid: false, 
      error: `Wrong network. Please switch to the correct network (Chain ID: ${expectedChainId})` 
    };
  }
  
  return { isValid: true };
}

// High-value transaction detection
export function isHighValueTransaction(amount: number | string, threshold: number = 0.1): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount >= threshold;
}
