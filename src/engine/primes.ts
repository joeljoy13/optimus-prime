import { isProbablyPrime, nextPrime } from './millerRabin';

const regularPrimes: bigint[] = [2n];
const twinPrimes: bigint[] = [];
const sophiePrimes: bigint[] = [];
const safePrimes: bigint[] = [];
const primeGaps: bigint[] = [];

const extendRegularPrimesTo = (count: number): void => {
  if (count <= regularPrimes.length) {
    return;
  }

  let candidate = regularPrimes[regularPrimes.length - 1] + 1n;
  while (regularPrimes.length < count) {
    const prime = nextPrime(candidate);
    const previous = regularPrimes[regularPrimes.length - 1];
    regularPrimes.push(prime);
    primeGaps.push(prime - previous);
    candidate = prime + 1n;
  }
};

export const nthPrime = (n: number): bigint => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer');
  }
  extendRegularPrimesTo(n);
  return regularPrimes[n - 1];
};

export const nthPrimeGap = (n: number): bigint => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer');
  }
  extendRegularPrimesTo(n + 1);
  return primeGaps[n - 1];
};

export const nthTwinPrime = (n: number): bigint => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer');
  }

  let candidate = twinPrimes.length === 0 ? 3n : twinPrimes[twinPrimes.length - 1] + 2n;
  while (twinPrimes.length < n) {
    if (isProbablyPrime(candidate) && isProbablyPrime(candidate + 2n)) {
      twinPrimes.push(candidate);
    }
    candidate += 2n;
  }

  return twinPrimes[n - 1];
};

export const nthSophieGermainPrime = (n: number): bigint => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer');
  }

  let candidate =
    sophiePrimes.length === 0 ? 2n : sophiePrimes[sophiePrimes.length - 1] + (sophiePrimes[sophiePrimes.length - 1] === 2n ? 1n : 2n);

  while (sophiePrimes.length < n) {
    if (isProbablyPrime(candidate) && isProbablyPrime((2n * candidate) + 1n)) {
      sophiePrimes.push(candidate);
    }
    candidate += candidate === 2n ? 1n : 2n;
  }

  return sophiePrimes[n - 1];
};

export const nthSafePrime = (n: number): bigint => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer');
  }

  let candidate = safePrimes.length === 0 ? 5n : safePrimes[safePrimes.length - 1] + 2n;
  while (safePrimes.length < n) {
    if (isProbablyPrime(candidate) && isProbablyPrime((candidate - 1n) / 2n)) {
      safePrimes.push(candidate);
    }
    candidate += 2n;
  }
  return safePrimes[n - 1];
};
