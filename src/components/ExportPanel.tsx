import type { EncodingType } from '../engine/types';

interface ExportPanelProps {
  encoding: EncodingType;
  encodedValue: string;
  onChange: (encoding: EncodingType) => void;
  onCopy: () => void;
}

const options: EncodingType[] = ['base62', 'base85', 'hex', 'ascii-printable'];

const ExportPanel = ({ encoding, encodedValue, onChange, onCopy }: ExportPanelProps): JSX.Element => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`chip ${encoding === option ? 'chip-active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
    <div className="rounded-2xl border border-sky-200/15 bg-black/30 p-3">
      <p className="break-all font-mono text-xs leading-relaxed text-sky-100">{encodedValue}</p>
    </div>
    <button type="button" className="secondary-button" onClick={onCopy}>
      Copy Exported Password
    </button>
  </div>
);

export default ExportPanel;
