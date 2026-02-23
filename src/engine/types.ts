export type TransformType =
  | 'regular'
  | 'twin'
  | 'sophie-germain'
  | 'safe'
  | 'prime-gap'
  | 'hash-reprime';

export type BitLengthOption = 64 | 128 | 256 | 512;

export type HistoryEventType = TransformType | 'manual-set' | 'random-generated';

export type EncodingType = 'base62' | 'base85' | 'hex' | 'ascii-printable';

export interface HistoryEntry {
  id: string;
  transform: HistoryEventType;
  previousPrime: string;
  resultPrime: string;
  boundedIndex?: number;
  hashHex?: string;
  note?: string;
  timestamp: string;
}

export interface EngineSnapshot {
  currentPrime: string;
  maxIndex: number;
  history: HistoryEntry[];
}

export interface TransformResponse {
  entry: HistoryEntry;
  snapshot: EngineSnapshot;
}

export interface EncodedPassword {
  encoding: EncodingType;
  value: string;
  entropyBits: number;
}

export interface SaveSessionPayload {
  currentPrime: string;
  maxIndex: number;
  history: HistoryEntry[];
}
