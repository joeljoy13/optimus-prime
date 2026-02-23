import { randomBytes } from 'crypto';
import { computeBoundedIndex, hashToBigInt, sha256Hex } from './crypto';
import { encodePrime } from './encoding';
import { nextPrime } from './millerRabin';
import { nthPrime, nthPrimeGap, nthSafePrime, nthSophieGermainPrime, nthTwinPrime } from './primes';
import type { EncodingType, EncodedPassword, TransformType } from './types';

const HASH_REPRIME_BITS = 126n;
const HASH_REPRIME_MAX = 1n << HASH_REPRIME_BITS;

export const randomSeedPrime = (): bigint => {
  const seed = randomBytes(32);
  const seedInt = BigInt(`0x${seed.toString('hex')}`);
  const seeded = (seedInt % HASH_REPRIME_MAX) + (1n << (HASH_REPRIME_BITS - 1n));
  return nextPrime(seeded);
};

export interface PrimeTransformResult {
  nextPrime: bigint;
  boundedIndex: number;
  hashHex: string;
}

export const applyTransform = (
  currentPrime: bigint,
  transform: TransformType,
  maxIndex: number
): PrimeTransformResult => {
  const { boundedIndex, hashHex } = computeBoundedIndex(currentPrime, transform, maxIndex);
  const ordinal = boundedIndex + 1;

  let next: bigint;
  switch (transform) {
    case 'regular':
      next = nthPrime(ordinal);
      break;
    case 'twin':
      next = nthTwinPrime(ordinal);
      break;
    case 'sophie-germain':
      next = nthSophieGermainPrime(ordinal);
      break;
    case 'safe':
      next = nthSafePrime(ordinal);
      break;
    case 'prime-gap': {
      const gap = nthPrimeGap(ordinal);
      next = nextPrime(currentPrime + gap);
      break;
    }
    case 'hash-reprime': {
      const mixedHash = sha256Hex(hashHex, ':', currentPrime.toString(16));
      const mixed = hashToBigInt(mixedHash);
      let candidate = (mixed % HASH_REPRIME_MAX) + (1n << (HASH_REPRIME_BITS - 1n));
      if (candidate % 2n === 0n) {
        candidate += 1n;
      }
      next = nextPrime(candidate);
      break;
    }
    default:
      throw new Error(`Unsupported transform: ${transform}`);
  }

  return { nextPrime: next, boundedIndex, hashHex };
};

export const encodeFromPrime = (prime: bigint, encoding: EncodingType): EncodedPassword =>
  encodePrime(prime, encoding);
