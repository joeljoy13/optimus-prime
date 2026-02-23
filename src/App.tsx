import { useEffect, useMemo, useState } from 'react';
import EntropyMeter from './components/EntropyMeter';
import ExportPanel from './components/ExportPanel';
import GlassPanel from './components/GlassPanel';
import HistoryTimeline from './components/HistoryTimeline';
import TransformButton from './components/TransformButton';
import type {
  EncodedPassword,
  EncodingType,
  EngineSnapshot,
  SaveSessionPayload,
  TransformType
} from './engine/types';

const transforms: TransformType[] = [
  'regular',
  'twin',
  'sophie-germain',
  'safe',
  'prime-gap',
  'hash-reprime'
];

const App = (): JSX.Element => {
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  const [encoding, setEncoding] = useState<EncodingType>('base62');
  const [encodedPassword, setEncodedPassword] = useState<EncodedPassword | null>(null);
  const [pendingTransform, setPendingTransform] = useState<TransformType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Secure orbit initialized.');
  const [maxIndexInput, setMaxIndexInput] = useState<string>('10000');
  const [busy, setBusy] = useState<boolean>(false);

  const refreshEncoding = async (nextEncoding: EncodingType): Promise<void> => {
    const encoded = await window.primeOrbit.encodeCurrent(nextEncoding);
    setEncodedPassword(encoded);
  };

  const boot = async (): Promise<void> => {
    setBusy(true);
    try {
      const initial = await window.primeOrbit.getState();
      setSnapshot(initial);
      setMaxIndexInput(String(initial.maxIndex));
      const encoded = await window.primeOrbit.encodeCurrent(encoding);
      setEncodedPassword(encoded);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to initialize Prime Orbit.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void boot();
  }, []);

  const updateEncoding = async (nextEncoding: EncodingType): Promise<void> => {
    setEncoding(nextEncoding);
    try {
      await refreshEncoding(nextEncoding);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Encoding update failed.');
    }
  };

  const applyTransform = async (transform: TransformType): Promise<void> => {
    setBusy(true);
    setPendingTransform(transform);
    setStatusMessage('Computing deterministic prime orbit...');
    try {
      const response = await window.primeOrbit.transform(transform);
      setSnapshot(response.snapshot);
      await refreshEncoding(encoding);
      setStatusMessage(`${transform.replace('-', ' ')} transformation complete.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Transformation failed.');
    } finally {
      setBusy(false);
      setPendingTransform(null);
    }
  };

  const applyMaxIndex = async (): Promise<void> => {
    const value = Number.parseInt(maxIndexInput, 10);
    if (Number.isNaN(value)) {
      setStatusMessage('M must be a valid integer.');
      return;
    }
    try {
      const updated = await window.primeOrbit.setMaxIndex(value);
      setSnapshot(updated);
      setStatusMessage(`Index cap M set to ${updated.maxIndex.toLocaleString()}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to set M.');
    }
  };

  const copyPrime = async (): Promise<void> => {
    if (!snapshot) {
      return;
    }
    await window.primeOrbit.copy(snapshot.currentPrime);
    setStatusMessage('Current prime copied.');
  };

  const copyEncoded = async (): Promise<void> => {
    if (!encodedPassword) {
      return;
    }
    await window.primeOrbit.copy(encodedPassword.value);
    setStatusMessage(`${encodedPassword.encoding} password copied.`);
  };

  const resetState = async (): Promise<void> => {
    setBusy(true);
    try {
      const reset = await window.primeOrbit.reset();
      setSnapshot(reset);
      setMaxIndexInput(String(reset.maxIndex));
      await refreshEncoding(encoding);
      setStatusMessage('State reset with fresh cryptographic entropy.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Reset failed.');
    } finally {
      setBusy(false);
    }
  };

  const saveSession = async (): Promise<void> => {
    if (!snapshot) {
      return;
    }
    const payload: SaveSessionPayload = {
      currentPrime: snapshot.currentPrime,
      maxIndex: snapshot.maxIndex,
      history: snapshot.history
    };
    const result = await window.primeOrbit.saveSession(payload);
    setStatusMessage(result.saved ? `Session saved to ${result.path}.` : 'Save cancelled.');
  };

  const feedback = useMemo(() => {
    if (!pendingTransform) {
      return statusMessage;
    }
    return `Applying ${pendingTransform} transform...`;
  }, [pendingTransform, statusMessage]);

  if (!snapshot) {
    return (
      <main className="app-shell">
        <div className="loader-card">
          <div className="loader-ring" />
          <p className="mt-4 text-sm text-sky-100/90">{statusMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-5 md:p-8">
        <GlassPanel className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="font-['Orbitron'] text-xl uppercase tracking-[0.18em] text-cyan-200">Prime Orbit</h1>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={maxIndexInput}
                onChange={(event) => setMaxIndexInput(event.target.value)}
                className="input-field w-32"
                inputMode="numeric"
                aria-label="Index cap M"
              />
              <button type="button" className="secondary-button" onClick={applyMaxIndex}>
                Apply M
              </button>
              <button type="button" className="secondary-button" onClick={copyPrime}>
                Copy Prime
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-100/15 bg-black/25 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.15em] text-sky-100/70">Current Prime</p>
            <p className="max-h-20 overflow-auto whitespace-nowrap font-mono text-sm text-sky-50">
              {snapshot.currentPrime}
            </p>
          </div>
          <EntropyMeter entropyBits={encodedPassword?.entropyBits ?? 0} />
        </GlassPanel>

        <GlassPanel className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {transforms.map((transform) => (
              <TransformButton
                key={transform}
                transform={transform}
                disabled={busy}
                onClick={(selected) => void applyTransform(selected)}
              />
            ))}
          </div>
          <div className="feedback-bar">
            {busy && <span className="loader-dot" />}
            <span>{feedback}</span>
          </div>
          <ExportPanel
            encoding={encoding}
            encodedValue={encodedPassword?.value ?? ''}
            onChange={(value) => void updateEncoding(value)}
            onCopy={() => void copyEncoded()}
          />
        </GlassPanel>

        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-['Orbitron'] text-sm uppercase tracking-[0.18em] text-cyan-200">
              Transformation Timeline
            </h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="secondary-button" onClick={() => void saveSession()}>
                Save Session
              </button>
              <button type="button" className="danger-button" onClick={() => void resetState()}>
                Clear / Reset
              </button>
            </div>
          </div>
          <HistoryTimeline history={snapshot.history} />
        </GlassPanel>
      </div>
    </main>
  );
};

export default App;
