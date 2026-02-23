import { generateRandomPrime } from '../src/engine/randomPrime';
import { isProbablyPrime } from '../src/engine/millerRabin';

describe('Random prime generation', () => {
  test('generates valid 64-bit prime', async () => {
    const prime = await generateRandomPrime(64);
    expect(isProbablyPrime(prime)).toBe(true);
    expect(prime.toString(2).length).toBe(64);
  });

  test('generates valid 128-bit prime', async () => {
    const prime = await generateRandomPrime(128);
    expect(isProbablyPrime(prime)).toBe(true);
    expect(prime.toString(2).length).toBe(128);
  });
});
