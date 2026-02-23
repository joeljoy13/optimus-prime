interface EntropyMeterProps {
  entropyBits: number;
}

const EntropyMeter = ({ entropyBits }: EntropyMeterProps): JSX.Element => {
  const normalized = Math.max(0, Math.min(100, (entropyBits / 256) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-sky-100/80">
        <span>Entropy</span>
        <span>{entropyBits.toFixed(2)} bits</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/70">
        <div className="entropy-fill" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
};

export default EntropyMeter;
