import { computeBoundedIndex } from '../src/engine/crypto';

describe('Hash-based bounded indexing', () => {
  test('is deterministic for same input', () => {
    const first = computeBoundedIndex(1299709n, 'safe', 10_000);
    const second = computeBoundedIndex(1299709n, 'safe', 10_000);

    expect(first.hashHex).toBe(second.hashHex);
    expect(first.boundedIndex).toBe(second.boundedIndex);
  });

  test('stays within cap M', () => {
    const result = computeBoundedIndex(32452843n, 'hash-reprime', 37);
    expect(result.boundedIndex).toBeGreaterThanOrEqual(0);
    expect(result.boundedIndex).toBeLessThan(37);
  });
});
