/**
 * Controles de Transposición - VERSIÓN COMPACTA
 */
import { useMemo } from 'react';
import { ArrowUp, ArrowDown, RotateCcw, Wand2 } from 'lucide-react';
import { INSTRUMENTS } from '../config/instruments';
import type { MidiNote } from '../types/midi';

interface TransposeControlsProps {
  instrumentId: string;
  notes: MidiNote[];
  transpose: number;
  onTransposeChange: (semitones: number) => void;
}

export function TransposeControls({
  instrumentId,
  notes,
  transpose,
  onTransposeChange,
}: TransposeControlsProps) {
  const instrument = INSTRUMENTS[instrumentId];

  const { inRangePercent, suggestedTranspose } = useMemo(() => {
    if (!instrument || notes.length === 0) {
      return { inRangePercent: 100, suggestedTranspose: 0 };
    }

    const instMin = Math.min(...instrument.midiNotes);
    const instMax = Math.max(...instrument.midiNotes) + instrument.frets;

    let inRange = 0;
    let minNote = 127,
      maxNote = 0;

    notes.forEach((note) => {
      const midi = note.midi + transpose;
      minNote = Math.min(minNote, midi);
      maxNote = Math.max(maxNote, midi);
      if (midi >= instMin && midi <= instMax) inRange++;
    });

    const noteCenter = (minNote + maxNote) / 2;
    const instCenter = (instMin + instMax) / 2;
    const suggested = Math.round((instCenter - noteCenter) / 12) * 12 + transpose;

    return {
      inRangePercent: Math.round((inRange / notes.length) * 100),
      suggestedTranspose: suggested,
    };
  }, [instrument, notes, transpose]);

  if (!instrument) return null;

  const rangeColor =
    inRangePercent >= 90 ? '#22c55e' : inRangePercent >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="transpose-compact">
      <div className="transpose-label">
        <Wand2 size={14} />
        <span>Transponer</span>
      </div>

      <div className="transpose-controls">
        <button onClick={() => onTransposeChange(transpose - 12)} title="-8va">
          <ArrowDown size={12} />
          -8va
        </button>
        <button onClick={() => onTransposeChange(transpose - 1)} title="-1">
          -1
        </button>
        <span className="transpose-value" style={{ color: rangeColor }}>
          {transpose > 0 ? '+' : ''}
          {transpose}
        </span>
        <button onClick={() => onTransposeChange(transpose + 1)} title="+1">
          +1
        </button>
        <button onClick={() => onTransposeChange(transpose + 12)} title="+8va">
          +8va
          <ArrowUp size={12} />
        </button>
      </div>

      <div className="transpose-actions">
        <button
          className="btn-auto"
          onClick={() => onTransposeChange(suggestedTranspose)}
          title="Auto-adaptar al instrumento"
        >
          Auto
        </button>
        <button onClick={() => onTransposeChange(0)} disabled={transpose === 0} title="Reset">
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="transpose-bar">
        <div
          className="transpose-fill"
          style={{ width: `${inRangePercent}%`, background: rangeColor }}
        />
      </div>
      <span className="transpose-percent" style={{ color: rangeColor }}>
        {inRangePercent}%
      </span>
    </div>
  );
}

const styles = `
.transpose-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.transpose-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-weight: 500;
  min-width: 80px;
}

.transpose-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.transpose-controls button {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 10px;
  cursor: pointer;
}

.transpose-controls button:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.transpose-value {
  min-width: 30px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
}

.transpose-actions {
  display: flex;
  gap: 4px;
}

.transpose-actions button {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 10px;
  cursor: pointer;
}

.transpose-actions button:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.transpose-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-auto {
  background: var(--color-accent-primary) !important;
  color: white !important;
  border-color: transparent !important;
}

.transpose-bar {
  width: 40px;
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.transpose-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.2s;
}

.transpose-percent {
  font-size: 10px;
  font-weight: 600;
  min-width: 28px;
}
`;

if (typeof document !== 'undefined') {
  const id = 'transpose-styles';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = styles;
    document.head.appendChild(s);
  }
}

export default TransposeControls;
