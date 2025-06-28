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
