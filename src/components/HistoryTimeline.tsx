import type { HistoryEntry } from '../engine/types';
import { formatPrimeLabel, formatTimestamp, transformTitles } from '../utils/format';

interface HistoryTimelineProps {
  history: HistoryEntry[];
}

const HistoryTimeline = ({ history }: HistoryTimelineProps): JSX.Element => {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-sky-100/70">
        No transformations yet.
      </div>
    );
  }

  return (
    <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
      {history.map((entry) => (
        <li key={entry.id} className="timeline-item">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-sky-100">{transformTitles[entry.transform]}</p>
            <p className="text-xs text-sky-200/70">{formatTimestamp(entry.timestamp)}</p>
          </div>
          <p className="mt-2 text-xs text-sky-100/80">
            {formatPrimeLabel(entry.previousPrime)} {'->'} {formatPrimeLabel(entry.resultPrime)}
          </p>
          <p className="mt-1 text-[11px] text-cyan-200/70">
            index {entry.boundedIndex} | hash {entry.hashHex.slice(0, 16)}...
          </p>
        </li>
      ))}
    </ul>
  );
};

export default HistoryTimeline;
