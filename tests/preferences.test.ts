import {
  getHumEnabled,
  getSoundEnabled,
  isTutorialCompleted,
  setHumEnabled,
  setSoundEnabled,
  setTutorialCompleted,
  shouldAutoOpenTutorial,
  type StorageLike
} from '../src/utils/preferences';

class MemoryStorage implements StorageLike {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key) ?? null : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('Tutorial preference state', () => {
  test('auto opens tutorial when not completed', () => {
    const storage = new MemoryStorage();
    expect(shouldAutoOpenTutorial(storage)).toBe(true);
    expect(isTutorialCompleted(storage)).toBe(false);
  });

  test('marks tutorial completed', () => {
    const storage = new MemoryStorage();
    setTutorialCompleted(true, storage);
    expect(isTutorialCompleted(storage)).toBe(true);
    expect(shouldAutoOpenTutorial(storage)).toBe(false);
  });
});

describe('Sound preference state', () => {
  test('defaults sound on and hum off', () => {
    const storage = new MemoryStorage();
    expect(getSoundEnabled(storage)).toBe(true);
    expect(getHumEnabled(storage)).toBe(false);
  });

  test('persists sound and hum toggles', () => {
    const storage = new MemoryStorage();
    setSoundEnabled(false, storage);
    setHumEnabled(true, storage);
    expect(getSoundEnabled(storage)).toBe(false);
    expect(getHumEnabled(storage)).toBe(true);
  });
});
