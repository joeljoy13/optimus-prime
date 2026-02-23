import { isProbablyPrime, nextPrime } from '../src/engine/millerRabin';

describe('Miller-Rabin primality', () => {
  test('accepts known primes', () => {
    expect(isProbablyPrime(2n)).toBe(true);
    expect(isProbablyPrime(3n)).toBe(true);
    expect(isProbablyPrime(7919n)).toBe(true);
  });

  test('rejects known composites', () => {
    expect(isProbablyPrime(1n)).toBe(false);
    expect(isProbablyPrime(9n)).toBe(false);
    expect(isProbablyPrime(221n)).toBe(false);
  });

  test('finds next prime', () => {
    expect(nextPrime(24n)).toBe(29n);
    expect(nextPrime(97n)).toBe(97n);
  });
});
