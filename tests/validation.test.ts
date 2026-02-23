import { validateModuloInput, validatePrimeInput } from '../src/utils/validation';

describe('Prime input validation', () => {
  test('accepts valid prime input', () => {
    const result = validatePrimeInput('101');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(101n);
  });

  test('rejects composite numbers', () => {
    const result = validatePrimeInput('221');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Input is not prime.');
  });

  test('rejects non-integer input', () => {
    const result = validatePrimeInput('13.7');
    expect(result.valid).toBe(false);
  });
});

describe('Modulo bound validation', () => {
  test('accepts edge bounds', () => {
    expect(validateModuloInput('100')).toEqual({ valid: true, value: 100 });
    expect(validateModuloInput('100000')).toEqual({ valid: true, value: 100000 });
  });

  test('rejects out-of-range values', () => {
    expect(validateModuloInput('99').valid).toBe(false);
    expect(validateModuloInput('100001').valid).toBe(false);
  });

  test('rejects non-integer values', () => {
    expect(validateModuloInput('1000.5').valid).toBe(false);
    expect(validateModuloInput('abc').valid).toBe(false);
  });
});
