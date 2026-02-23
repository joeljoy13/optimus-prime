interface ExportPanelProps {
  encodedValue: string;
  onCopy: () => void;
}

const ExportPanel = ({ encodedValue, onCopy }: ExportPanelProps): JSX.Element => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-[0.12em] text-sky-100/80">Exported Password</p>
    <div className="rounded-2xl border border-sky-200/15 bg-black/30 p-3">
      <p className="break-all font-mono text-xs leading-relaxed text-sky-100">{encodedValue}</p>
    </div>
    <button type="button" className="secondary-button" onClick={onCopy}>
      Copy Exported Password
    </button>
  </div>
);

export default ExportPanel;
