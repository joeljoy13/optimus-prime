import { randomBytes } from 'crypto';
import { isProbablyPrime } from './millerRabin';
import type { BitLengthOption } from './types';

const allowedBitLengths: BitLengthOption[] = [64, 128, 256, 512];

const buildRandomOddCandidate = (bitLength: BitLengthOption): bigint => {
  const byteLength = Math.ceil(bitLength / 8);
  const candidateBytes = randomBytes(byteLength);

  const excessBits = (byteLength * 8) - bitLength;
  if (excessBits > 0) {
    candidateBytes[0] &= (0xff >>> excessBits);
  }

  const highestBitIndex = 7 - excessBits;
  candidateBytes[0] |= 1 << highestBitIndex;
  candidateBytes[byteLength - 1] |= 1;

  return BigInt(`0x${candidateBytes.toString('hex')}`);
};

export const generateRandomPrime = async (bitLength: number): Promise<bigint> => {
  if (!Number.isInteger(bitLength) || !allowedBitLengths.includes(bitLength as BitLengthOption)) {
    throw new Error('Bit length must be one of: 64, 128, 256, 512.');
  }

  const normalizedBitLength = bitLength as BitLengthOption;
  for (;;) {
    const candidate = buildRandomOddCandidate(normalizedBitLength);
    if (candidate >= 3n && isProbablyPrime(candidate)) {
      return candidate;
    }
  }
};
