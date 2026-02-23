import type {
  EncodedPassword,
  EngineSnapshot,
  SaveSessionPayload,
  TransformResponse,
  TransformType,
  EncodingType
} from '../engine/types';

interface PrimeOrbitApi {
  getState: () => Promise<EngineSnapshot>;
  setMaxIndex: (value: number) => Promise<EngineSnapshot>;
  setPrimeState: (primeInput: string) => Promise<EngineSnapshot>;
  transform: (transform: TransformType) => Promise<TransformResponse>;
  encodeCurrent: (encoding: EncodingType) => Promise<EncodedPassword>;
  copy: (text: string) => Promise<boolean>;
  reset: () => Promise<EngineSnapshot>;
  saveSession: (payload: SaveSessionPayload) => Promise<{ saved: boolean; path?: string }>;
}

declare global {
  interface Window {
    primeOrbit: PrimeOrbitApi;
  }
}

export {};
