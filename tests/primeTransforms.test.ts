import {
  nthPrime,
  nthPrimeGap,
  nthSafePrime,
  nthSophieGermainPrime,
  nthTwinPrime
} from '../src/engine/primes';

describe('Prime family generators', () => {
  test('generates regular primes', () => {
    expect(nthPrime(1)).toBe(2n);
    expect(nthPrime(6)).toBe(13n);
  });

  test('generates twin primes', () => {
    expect(nthTwinPrime(1)).toBe(3n);
    expect(nthTwinPrime(3)).toBe(11n);
  });

  test('generates Sophie Germain primes', () => {
    expect(nthSophieGermainPrime(1)).toBe(2n);
    expect(nthSophieGermainPrime(4)).toBe(11n);
  });

  test('generates safe primes', () => {
    expect(nthSafePrime(1)).toBe(5n);
    expect(nthSafePrime(5)).toBe(47n);
  });

  test('computes regular prime gaps', () => {
    expect(nthPrimeGap(1)).toBe(1n);
    expect(nthPrimeGap(2)).toBe(2n);
  });
});
