import { encodePrime } from '../src/engine/encoding';

describe('Prime encoding output', () => {
  test('encodes hex', () => {
    const encoded = encodePrime(255n, 'hex');
    expect(encoded.value).toBe('ff');
    expect(encoded.entropyBits).toBe(8);
  });

  test('encodes base62', () => {
    const encoded = encodePrime(3843n, 'base62');
    expect(encoded.value).toBe('zz');
  });

  test('encodes base85', () => {
    const encoded = encodePrime(84n, 'base85');
    expect(encoded.value).toBe('u');
  });

  test('encodes ASCII printable', () => {
    const encoded = encodePrime(255n, 'ascii-printable');
    expect(encoded.value.length).toBeGreaterThan(0);
    for (const char of encoded.value) {
      const code = char.charCodeAt(0);
      expect(code).toBeGreaterThanOrEqual(33);
      expect(code).toBeLessThanOrEqual(126);
    }
  });
});
