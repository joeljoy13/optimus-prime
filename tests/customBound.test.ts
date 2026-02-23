import { transformPrime } from '../src/engine/transform';

describe('Custom modulo bound in transformPrime', () => {
  test('uses minimum allowed bound (M = 100)', () => {
    const result = transformPrime(32452843n, 'hash-reprime', 100);
    expect(result.boundedIndex).toBeGreaterThanOrEqual(0);
    expect(result.boundedIndex).toBeLessThan(100);
  });

  test('uses maximum allowed bound (M = 100000)', () => {
    const result = transformPrime(32452843n, 'hash-reprime', 100000);
    expect(result.boundedIndex).toBeGreaterThanOrEqual(0);
    expect(result.boundedIndex).toBeLessThan(100000);
  });

  test('is deterministic for same prime, transform, and bound', () => {
    const first = transformPrime(1299709n, 'hash-reprime', 10000);
    const second = transformPrime(1299709n, 'hash-reprime', 10000);
    expect(first.boundedIndex).toBe(second.boundedIndex);
    expect(first.hashHex).toBe(second.hashHex);
    expect(first.nextPrime).toBe(second.nextPrime);
  });
});
