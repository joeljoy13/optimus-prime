import type { EncodingType, EncodedPassword } from './types';
import { bigIntToBuffer } from './crypto';

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE85_ALPHABET = Array.from({ length: 85 }, (_, index) => String.fromCharCode(index + 33)).join('');

const encodeWithAlphabet = (input: bigint, alphabet: string): string => {
  if (input === 0n) {
    return alphabet[0];
  }

  const radix = BigInt(alphabet.length);
  let value = input;
  let encoded = '';

  while (value > 0n) {
    const digit = Number(value % radix);
    encoded = alphabet[digit] + encoded;
    value /= radix;
  }

  return encoded;
};

const encodeAsciiPrintable = (input: bigint): string => {
  const bytes = bigIntToBuffer(input);
  return Array.from(bytes)
    .map((byte) => String.fromCharCode(33 + (byte % 94)))
    .join('');
};

export const encodePrime = (value: bigint, encoding: EncodingType): EncodedPassword => {
  const encodedValue =
    encoding === 'hex'
      ? value.toString(16)
      : encoding === 'base62'
        ? encodeWithAlphabet(value, BASE62_ALPHABET)
        : encoding === 'base85'
          ? encodeWithAlphabet(value, BASE85_ALPHABET)
          : encodeAsciiPrintable(value);

  const charsetSize =
    encoding === 'hex' ? 16 : encoding === 'base62' ? 62 : encoding === 'base85' ? 85 : 94;
  const entropyBits = Number((encodedValue.length * Math.log2(charsetSize)).toFixed(2));

  return {
    encoding,
    value: encodedValue,
    entropyBits
  };
};
