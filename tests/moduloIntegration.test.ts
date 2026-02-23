import { PrimeOrbitService } from '../src/engine/service';

describe('Custom modulo integration', () => {
  test('service transform respects configured M', () => {
    const service = new PrimeOrbitService(10_000);
    service.setMaxIndex(100);

    const result = service.transform('regular');
    expect(result.entry.boundedIndex).toBeDefined();
    expect((result.entry.boundedIndex ?? 0)).toBeGreaterThanOrEqual(0);
    expect((result.entry.boundedIndex ?? 0)).toBeLessThan(100);
  });

  test('service accepts upper M bound', () => {
    const service = new PrimeOrbitService(10_000);
    const snapshot = service.setMaxIndex(100_000);
    expect(snapshot.maxIndex).toBe(100_000);
  });
});
