import { isProbablyPrime } from '../engine/millerRabin';

export interface PrimeValidationResult {
  valid: boolean;
  value?: bigint;
  error?: string;
}

export interface ModuloValidationResult {
  valid: boolean;
  value?: number;
  error?: string;
}

const DIGITS_ONLY = /^\d+$/;

export const validatePrimeInput = (input: string): PrimeValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Prime input is required.' };
  }

  if (!DIGITS_ONLY.test(trimmed)) {
    return { valid: false, error: 'Prime input must be a positive integer.' };
  }

  try {
    const value = BigInt(trimmed);
    if (value <= 0n) {
      return { valid: false, error: 'Prime input must be positive.' };
    }
    if (value < 2n) {
      return { valid: false, error: 'Prime input must be at least 2.' };
    }
    if (!isProbablyPrime(value)) {
      return { valid: false, error: 'Input is not prime.' };
    }
    return { valid: true, value };
  } catch {
    return { valid: false, error: 'Prime input is too large or invalid.' };
  }
};

export const validateModuloInput = (input: string): ModuloValidationResult => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Index Bound (M) is required.' };
  }

  if (!DIGITS_ONLY.test(trimmed)) {
    return { valid: false, error: 'Index Bound (M) must be an integer.' };
  }

  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) {
    return { valid: false, error: 'Index Bound (M) is out of safe integer range.' };
  }
  if (value < 100 || value > 100_000) {
    return { valid: false, error: 'Index Bound (M) must be between 100 and 100000.' };
  }

  return { valid: true, value };
};
