import { createHash } from 'crypto';
import type { TransformType } from './types';

export const bigIntToBuffer = (value: bigint): Buffer => {
  if (value === 0n) {
    return Buffer.from([0]);
  }

  let hex = value.toString(16);
  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }
  return Buffer.from(hex, 'hex');
};

export const sha256Hex = (...parts: (string | Buffer)[]): string => {
  const hash = createHash('sha256');
  for (const part of parts) {
    hash.update(part);
  }
  return hash.digest('hex');
};

export const hashToBigInt = (hashHex: string): bigint => BigInt(`0x${hashHex}`);

export const computeBoundedIndex = (
  currentPrime: bigint,
  transform: TransformType,
  maxIndex: number
): { hashHex: string; hashBigInt: bigint; boundedIndex: number } => {
  if (!Number.isInteger(maxIndex) || maxIndex <= 0) {
    throw new Error('maxIndex must be a positive integer');
  }

  const hashHex = sha256Hex(bigIntToBuffer(currentPrime), Buffer.from(transform, 'utf8'));
  const hashBigInt = hashToBigInt(hashHex);
  const boundedIndex = Number(hashBigInt % BigInt(maxIndex));

  return { hashHex, hashBigInt, boundedIndex };
};
