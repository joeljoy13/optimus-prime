import type {
  EncodedPassword,
  EncodingType,
  EngineSnapshot,
  HistoryEntry,
  TransformResponse,
  TransformType
} from './types';
import { applyTransform, encodeFromPrime, randomSeedPrime } from './transform';

const MIN_INDEX_CAP = 10;
const MAX_INDEX_CAP = 1_000_000;

export class PrimeOrbitService {
  private currentPrime: bigint;
  private maxIndex: number;
  private history: HistoryEntry[];

  constructor(maxIndex = 10_000) {
    this.maxIndex = maxIndex;
    this.currentPrime = randomSeedPrime();
    this.history = [];
  }

  public getSnapshot(): EngineSnapshot {
    return {
      currentPrime: this.currentPrime.toString(),
      maxIndex: this.maxIndex,
      history: [...this.history]
    };
  }

  public setMaxIndex(maxIndex: number): EngineSnapshot {
    if (!Number.isInteger(maxIndex) || maxIndex < MIN_INDEX_CAP || maxIndex > MAX_INDEX_CAP) {
      throw new Error(`M must be an integer between ${MIN_INDEX_CAP.toLocaleString()} and ${MAX_INDEX_CAP.toLocaleString()}.`);
    }
    this.maxIndex = maxIndex;
    return this.getSnapshot();
  }

  public reset(): EngineSnapshot {
    this.currentPrime = randomSeedPrime();
    this.history = [];
    return this.getSnapshot();
  }

  public transform(transform: TransformType): TransformResponse {
    const before = this.currentPrime;
    const transformed = applyTransform(before, transform, this.maxIndex);
    this.currentPrime = transformed.nextPrime;

    const entry: HistoryEntry = {
      id: `${Date.now()}-${this.history.length + 1}`,
      transform,
      previousPrime: before.toString(),
      resultPrime: this.currentPrime.toString(),
      boundedIndex: transformed.boundedIndex,
      hashHex: transformed.hashHex,
      timestamp: new Date().toISOString()
    };
    this.history = [entry, ...this.history].slice(0, 200);

    return {
      entry,
      snapshot: this.getSnapshot()
    };
  }

  public encodeCurrent(encoding: EncodingType): EncodedPassword {
    return encodeFromPrime(this.currentPrime, encoding);
  }
}
