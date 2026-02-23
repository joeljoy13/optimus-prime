import { useEffect, useMemo, useRef, useState } from 'react';
import EntropyMeter from './components/EntropyMeter';
import ExportPanel from './components/ExportPanel';
import GlassPanel from './components/GlassPanel';
import HistoryTimeline from './components/HistoryTimeline';
import TransformButton from './components/TransformButton';
import TutorialOverlay, { type TutorialStep } from './components/TutorialOverlay';
import type {
  BitLengthOption,
  EncodedPassword,
  EncodingType,
  EngineSnapshot,
  SaveSessionPayload,
  TransformType
} from './engine/types';
import { getHumEnabled, getSoundEnabled, setHumEnabled, setSoundEnabled, setTutorialCompleted, shouldAutoOpenTutorial } from './utils/preferences';
import { PrimeOrbitSound } from './utils/sound';
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
const bitLengthOptions: BitLengthOption[] = [64, 128, 256, 512];
const PERFORMANCE_WARNING_THRESHOLD = 75_000;

type TutorialTarget = 'currentPrime' | 'primeFamilies' | 'transformDemo' | 'moduloBound' | 'encoding' | 'entropy';

interface TutorialStepDefinition extends TutorialStep {
  target: TutorialTarget;
}

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const tutorialSteps: TutorialStepDefinition[] = [
  {
    target: 'currentPrime',
    title: 'Current Prime State',
    description:
      'This panel holds the active BigInt prime state. Every transformation starts from this value and deterministically evolves from it.'
  },
  {
    target: 'primeFamilies',
    title: 'Prime Families',
    description:
      'These buttons choose the mathematical family for transformation: regular, twin, Sophie Germain, safe, prime-gap, and hash re-prime.'
  },
  {
    target: 'transformDemo',
    title: 'Transformation Feedback',
    description:
      'When you apply a transform, the engine hashes the current prime and selected family, computes a bounded index, and resolves the next prime.'
  },
  {
    target: 'moduloBound',
    title: 'Modulo Bound (M)',
    description:
      'M controls index capping via hash mod M. Higher values broaden index range but may increase computational effort.'
  },
  {
    target: 'encoding',
    title: 'Export Encoding',
    description:
      'Select the output representation for the current prime-derived password string, then copy it for downstream use.'
  },
  {
    target: 'entropy',
    title: 'Entropy Indicator',
    description:
      'This estimate reflects output space size from current encoding and length. It helps compare relative password strength profiles.'
  }
];

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
  const [generatingRandomPrime, setGeneratingRandomPrime] = useState<boolean>(false);
  const [bitLength, setBitLength] = useState<BitLengthOption>(128);
  const [bitLengthWarning, setBitLengthWarning] = useState<string>('');
  const [tutorialOpen, setTutorialOpen] = useState<boolean>(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);
  const [tutorialHighlight, setTutorialHighlight] = useState<HighlightBox | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getSoundEnabled());
  const [humEnabled, setHumEnabledState] = useState<boolean>(getHumEnabled());
  const [matrixFlash, setMatrixFlash] = useState<boolean>(false);

  const currentPrimeRef = useRef<HTMLDivElement | null>(null);
  const primeFamiliesRef = useRef<HTMLDivElement | null>(null);
  const transformFeedbackRef = useRef<HTMLDivElement | null>(null);
  const moduloBoundRef = useRef<HTMLDivElement | null>(null);
  const encodingRef = useRef<HTMLDivElement | null>(null);
  const entropyRef = useRef<HTMLDivElement | null>(null);
  const previousPrimeRef = useRef<string>('');
  const soundRef = useRef<PrimeOrbitSound | null>(null);

  const currentPrimeValue = snapshot?.currentPrime ?? '';

  const refreshEncoding = async (nextEncoding: EncodingType): Promise<void> => {
    const encoded = await window.primeOrbit.encodeCurrent(nextEncoding);
    setEncodedPassword(encoded);
  };

  useEffect(() => {
    soundRef.current = new PrimeOrbitSound();
    soundRef.current.setEnabled(soundEnabled);
    soundRef.current.setHumEnabled(humEnabled);
    return () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
    soundRef.current?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setHumEnabled(humEnabled);
    soundRef.current?.setHumEnabled(humEnabled);
  }, [humEnabled]);

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
      if (shouldAutoOpenTutorial()) {
        setTutorialOpen(true);
      }
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

    if (previousPrimeRef.current && previousPrimeRef.current !== currentPrimeValue) {
      soundRef.current?.playPrimeWhoosh();
    }
    previousPrimeRef.current = currentPrimeValue;

    setStatePulse(true);
    const timer = window.setTimeout(() => setStatePulse(false), 340);
    return () => window.clearTimeout(timer);
  }, [currentPrimeValue]);

  useEffect(() => {
    if (!tutorialOpen) {
      return;
    }

    const activeStep = tutorialSteps[tutorialStepIndex];
    const targetMap: Record<TutorialTarget, HTMLElement | null> = {
      currentPrime: currentPrimeRef.current,
      primeFamilies: primeFamiliesRef.current,
      transformDemo: transformFeedbackRef.current,
      moduloBound: moduloBoundRef.current,
      encoding: encodingRef.current,
      entropy: entropyRef.current
    };

    const updateHighlight = (): void => {
      const targetElement = targetMap[activeStep.target];
      if (!targetElement) {
        setTutorialHighlight(null);
        return;
      }
      const rect = targetElement.getBoundingClientRect();
      const padding = 8;
      setTutorialHighlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2)
      });
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [tutorialOpen, tutorialStepIndex, snapshot]);

  const updateEncoding = async (nextEncoding: EncodingType): Promise<void> => {
    setEncoding(nextEncoding);
    try {
      await refreshEncoding(nextEncoding);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Encoding update failed.');
    }
  };

  const triggerTransformEffects = (): void => {
    soundRef.current?.playTransformGlitch();
    setMatrixFlash(true);
    window.setTimeout(() => setMatrixFlash(false), 200);
  };

  const applyTransform = async (transform: TransformType): Promise<void> => {
    setBusy(true);
    setPendingTransform(transform);
    setStatusMessage('Computing deterministic prime orbit...');
    try {
      const response = await window.primeOrbit.transform(transform);
      setSnapshot(response.snapshot);
      await refreshEncoding(encoding);
      triggerTransformEffects();
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

  const generateRandomPrimeState = async (): Promise<void> => {
    setBitLengthWarning(bitLength === 512 ? '512-bit generation may take longer on low-power hardware.' : '');
    setGeneratingRandomPrime(true);
    setBusy(true);
    try {
      const updated = await window.primeOrbit.setRandomPrimeState(bitLength);
      setSnapshot(updated);
      setManualPrimeInput(updated.currentPrime);
      await refreshEncoding(encoding);
      setStatusMessage('Random Prime Generated');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Random prime generation failed.');
    } finally {
      setGeneratingRandomPrime(false);
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
      setBitLengthWarning('');
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

  const handleTutorialExit = (): void => {
    setTutorialCompleted(true);
    setTutorialOpen(false);
  };

  const handleTutorialNext = (): void => {
    if (tutorialStepIndex >= tutorialSteps.length - 1) {
      setTutorialCompleted(true);
      setTutorialOpen(false);
      return;
    }
    setTutorialStepIndex((current) => current + 1);
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
      {matrixFlash ? <div className="matrix-flash" /> : null}
      <TutorialOverlay
        open={tutorialOpen}
        step={tutorialSteps[tutorialStepIndex]}
        stepIndex={tutorialStepIndex}
        totalSteps={tutorialSteps.length}
        highlight={tutorialHighlight}
        onBack={() => setTutorialStepIndex((current) => Math.max(0, current - 1))}
        onNext={handleTutorialNext}
        onExit={handleTutorialExit}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-5 md:p-8">
        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-['Orbitron'] text-xl uppercase tracking-[0.18em] text-cyan-200">Prime Orbit</h1>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="secondary-button" onClick={() => setTutorialOpen(true)}>
                Tutorial Mode
              </button>
              <button type="button" className="secondary-button" onClick={() => void copyPrime()}>
                Copy Prime
              </button>
            </div>
          </div>

          <div ref={currentPrimeRef} className="rounded-2xl border border-cyan-100/15 bg-black/25 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.15em] text-sky-100/70">Current Prime</p>
            <p className={`state-value ${statePulse ? 'state-value-animate' : ''}`}>{snapshot.currentPrime}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="space-y-2 xl:col-span-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Set Prime State</label>
              <div className="flex flex-col gap-2 lg:flex-row">
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
                <button
                  type="button"
                  className="green-button"
                  onClick={() => void generateRandomPrimeState()}
                  disabled={busy}
                >
                  {generatingRandomPrime ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="button-spinner" />
                      Generating...
                    </span>
                  ) : (
                    'Generate Random Prime'
                  )}
                </button>
              </div>
              {manualPrimeError ? <p className="input-error">{manualPrimeError}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Bit Length</label>
              <select
                value={String(bitLength)}
                onChange={(event) => {
                  const next = Number(event.target.value) as BitLengthOption;
                  setBitLength(next);
                  setBitLengthWarning(next === 512 ? '512-bit generation may take longer on low-power hardware.' : '');
                }}
                className="select-field w-full"
                aria-label="Random Prime Bit Length"
              >
                {bitLengthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}-bit{option === 128 ? ' (default)' : ''}
                  </option>
                ))}
              </select>
              {bitLengthWarning ? <p className="warning-text">{bitLengthWarning}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div ref={moduloBoundRef} className="space-y-2">
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
              {moduloError ? <p className="input-error">{moduloError}</p> : null}
              {moduloWarning ? <p className="warning-text">{moduloWarning}</p> : null}
            </div>

            <div ref={encodingRef} className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-sky-100/80">Audio</label>
              <div className="audio-toggle-wrap">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(event) => setSoundEnabledState(event.target.checked)}
                  />
                  <span>Enable Sound</span>
                </label>
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={humEnabled}
                    onChange={(event) => setHumEnabledState(event.target.checked)}
                    disabled={!soundEnabled}
                  />
                  <span>Ambient Hum</span>
                </label>
              </div>
            </div>
          </div>

          <div ref={entropyRef}>
            <EntropyMeter entropyBits={encodedPassword?.entropyBits ?? 0} />
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-5">
          <div ref={primeFamiliesRef} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {transforms.map((transform) => (
              <TransformButton
                key={transform}
                transform={transform}
                disabled={busy}
                onClick={(selected) => void applyTransform(selected)}
              />
            ))}
          </div>
          <div ref={transformFeedbackRef} className="feedback-bar">
            {busy ? <span className="loader-dot" /> : null}
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
