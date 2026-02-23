export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export const TUTORIAL_COMPLETED_KEY = 'prime-orbit:tutorial-completed';
export const SOUND_ENABLED_KEY = 'prime-orbit:sound-enabled';
export const HUM_ENABLED_KEY = 'prime-orbit:hum-enabled';

const resolveStorage = (provided?: StorageLike): StorageLike | null => {
  if (provided) {
    return provided;
  }
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
};

const readBoolean = (key: string, fallback: boolean, storage?: StorageLike): boolean => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return fallback;
  }
  const raw = targetStorage.getItem(key);
  if (raw === null) {
    return fallback;
  }
  return raw === 'true';
};

const writeBoolean = (key: string, value: boolean, storage?: StorageLike): void => {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return;
  }
  targetStorage.setItem(key, value ? 'true' : 'false');
};

export const isTutorialCompleted = (storage?: StorageLike): boolean =>
  readBoolean(TUTORIAL_COMPLETED_KEY, false, storage);

export const shouldAutoOpenTutorial = (storage?: StorageLike): boolean =>
  !isTutorialCompleted(storage);

export const setTutorialCompleted = (value: boolean, storage?: StorageLike): void =>
  writeBoolean(TUTORIAL_COMPLETED_KEY, value, storage);

export const getSoundEnabled = (storage?: StorageLike): boolean =>
  readBoolean(SOUND_ENABLED_KEY, true, storage);

export const setSoundEnabled = (value: boolean, storage?: StorageLike): void =>
  writeBoolean(SOUND_ENABLED_KEY, value, storage);

export const getHumEnabled = (storage?: StorageLike): boolean =>
  readBoolean(HUM_ENABLED_KEY, false, storage);

export const setHumEnabled = (value: boolean, storage?: StorageLike): void =>
  writeBoolean(HUM_ENABLED_KEY, value, storage);
