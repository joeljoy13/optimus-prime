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
import { validateModuloInput, validatePrimeInput } from './utils/validation';

const transforms: TransformType[] = [
  'regular',
  'twin',
  'sophie-germain',
  'safe',
  'prime-gap',
  'hash-reprime'
];

const encodingOptions: EncodingType[] = ['base62', 'base85', 'hex', 'ascii-printable'];
const PERFORMANCE_WARNING_THRESHOLD = 75_000;

const App = (): JSX.Element => {
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  const [encoding, setEncoding] = useState<EncodingType>('base62');
  const [encodedPassword, setEncodedPassword] = useState<EncodedPassword | null>(null);
  const [pendingTransform, setPendingTransform] = useState<TransformType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Secure orbit initialized.');
  const [maxIndexInput, setMaxIndexInput] = useState<string>('10000');
  const [manualPrimeInput, setManualPrimeInput] = useState<string>('');
  const [manualPrimeError, setManualPrimeError] = useState<string>('');
  const [moduloError, setModuloError] = useState<string>('');
  const [moduloWarning, setModuloWarning] = useState<string>('');
  const [statePulse, setStatePulse] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const currentPrimeValue = snapshot?.currentPrime ?? '';

  const refreshEncoding = async (nextEncoding: EncodingType): Promise<void> => {
    const encoded = await window.primeOrbit.encodeCurrent(nextEncoding);
    setEncodedPassword(encoded);
  };

  const boot = async (): Promise<void> => {
    setBusy(true);
    try {
      const initial = await window.primeOrbit.getState();
      setSnapshot(initial);
      setManualPrimeInput(initial.currentPrime);
      setMaxIndexInput(String(initial.maxIndex));
      setModuloWarning(
        initial.maxIndex >= PERFORMANCE_WARNING_THRESHOLD
          ? 'Performance warning: large M can noticeably increase transform time.'
          : ''
      );
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

  useEffect(() => {
    if (!currentPrimeValue) {
      return;
    }
    setStatePulse(true);
    const timer = window.setTimeout(() => setStatePulse(false), 340);
    return () => window.clearTimeout(timer);
  }, [currentPrimeValue]);

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
    if (!snapshot) {
      return;
    }

    const validation = validateModuloInput(maxIndexInput);
    if (!validation.valid || validation.value === undefined) {
      setModuloError(validation.error ?? 'Index Bound (M) is invalid.');
      setMaxIndexInput(String(snapshot.maxIndex));
      return;
    }

    try {
      const updated = await window.primeOrbit.setMaxIndex(validation.value);
      setSnapshot(updated);
      setMaxIndexInput(String(updated.maxIndex));
      setModuloError('');
      setModuloWarning(
        updated.maxIndex >= PERFORMANCE_WARNING_THRESHOLD
          ? 'Performance warning: large M can noticeably increase transform time.'
          : ''
      );
      setStatusMessage(`Index cap M set to ${updated.maxIndex.toLocaleString()}.`);
    } catch (error) {
      setModuloError(error instanceof Error ? error.message : 'Unable to set M.');
      setMaxIndexInput(String(snapshot.maxIndex));
    }
  };

  const setManualPrimeState = async (): Promise<void> => {
    const validation = validatePrimeInput(manualPrimeInput);
    if (!validation.valid) {
      setManualPrimeError(validation.error ?? 'Prime input is invalid.');
      return;
    }

    setBusy(true);
    try {
      const updated = await window.primeOrbit.setPrimeState(manualPrimeInput.trim());
      setSnapshot(updated);
      setManualPrimeInput(updated.currentPrime);
      setManualPrimeError('');
      await refreshEncoding(encoding);
      setStatusMessage('Manual Prime Set');
    } catch (error) {
      setManualPrimeError(error instanceof Error ? error.message : 'Failed to set manual prime.');
    } finally {
      setBusy(false);
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
      setManualPrimeInput(reset.currentPrime);
      setMaxIndexInput(String(reset.maxIndex));
      setManualPrimeError('');
      setModuloError('');
      setModuloWarning('');
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-['Orbitron'] text-xl uppercase tracking-[0.18em] text-cyan-200">Prime Orbit</h1>
            <button type="button" className="secondary-button" onClick={() => void copyPrime()}>
              Copy Prime
            </button>
          </div>

          <div className="rounded-2xl border border-cyan-100/15 bg-black/25 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.15em] text-sky-100/70">Current Prime</p>
            <p className={`state-value ${statePulse ? 'state-value-animate' : ''}`}>
              {snapshot.currentPrime}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Set Prime State</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={manualPrimeInput}
                  onChange={(event) => {
                    setManualPrimeInput(event.target.value);
                    setManualPrimeError('');
                  }}
                  className={`input-field ${manualPrimeError ? 'input-field-error' : ''}`}
                  inputMode="numeric"
                  aria-label="Set Prime State"
                  placeholder="Enter prime integer"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void setManualPrimeState()}
                  disabled={busy}
                >
                  Set Prime
                </button>
              </div>
              {manualPrimeError && <p className="input-error">{manualPrimeError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Index Bound (M)</label>
              <input
                value={maxIndexInput}
                onChange={(event) => {
                  setMaxIndexInput(event.target.value);
                  setModuloError('');
                }}
                onBlur={() => void applyMaxIndex()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void applyMaxIndex();
                  }
                }}
                className={`input-field w-full ${moduloError ? 'input-field-error' : ''}`}
                inputMode="numeric"
                aria-label="Index Bound (M)"
              />
              {moduloError && <p className="input-error">{moduloError}</p>}
              {moduloWarning && <p className="warning-text">{moduloWarning}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Encoding Selector</label>
              <select
                value={encoding}
                onChange={(event) => void updateEncoding(event.target.value as EncodingType)}
                className="select-field"
                aria-label="Encoding Selector"
              >
                {encodingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <EntropyMeter entropyBits={encodedPassword?.entropyBits ?? 0} />
          </div>
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
          <ExportPanel encodedValue={encodedPassword?.value ?? ''} onCopy={() => void copyEncoded()} />
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
