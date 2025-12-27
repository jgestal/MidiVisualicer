/**
 * Controles de Transposición - VERSIÓN COMPACTA CON HISTORIAL
 */
import { useMemo, useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, RotateCcw, Wand2, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { getAllInstruments } from '../config/instruments';
import { useI18n } from '../shared/context/I18nContext';
import { getRangeColor } from '../shared/constants/colors';
import type { MidiNote } from '../types/midi';
import './TransposeControls.css';

interface TransposeControlsProps {
  instrumentId: string;
  notes: MidiNote[];
  transpose: number;
  onTransposeChange: (semitones: number) => void;
  isAutoEnabled?: boolean;
  onToggleAuto?: () => void;
}

export function TransposeControls({
  instrumentId,
  notes,
  transpose,
  onTransposeChange,
  isAutoEnabled = true,
  onToggleAuto,
}: TransposeControlsProps) {
  const instrument = getAllInstruments()[instrumentId];
  const { t } = useI18n();

  // Historial de transposiciones
  const [history, setHistory] = useState<number[]>([0]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Agregar al historial cuando cambia la transposición
  const handleTransposeChange = useCallback((newTranspose: number) => {
    setHistory(prev => {
      // Truncar el historial si estamos en el medio
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newTranspose);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
    onTransposeChange(newTranspose);
  }, [historyIndex, onTransposeChange]);

  // Undo
  const canUndo = historyIndex > 0;
  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onTransposeChange(history[newIndex]);
    }
  }, [canUndo, historyIndex, history, onTransposeChange]);

  // Redo
  const canRedo = historyIndex < history.length - 1;
  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onTransposeChange(history[newIndex]);
    }
  }, [canRedo, historyIndex, history, onTransposeChange]);

  const { inRangePercent } = useMemo(() => {
    if (!instrument || notes.length === 0) {
      return { inRangePercent: 100 };
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

    return {
      inRangePercent: Math.round((inRange / notes.length) * 100),
    };
  }, [instrument, notes, transpose]);

  if (!instrument) return null;

  const rangeColor = getRangeColor(inRangePercent);

  return (
    <div className="transpose-compact">
      <div className="transpose-label">
        <Wand2 size={14} />
        <span>{t.transpose}</span>
      </div>

      {/* Historial Undo/Redo */}
      <div className="transpose-history">
        <button onClick={handleUndo} disabled={!canUndo} title={t.undoTranspose}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={handleRedo} disabled={!canRedo} title={t.redoTranspose}>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="transpose-controls">
        <button onClick={() => handleTransposeChange(transpose - 12)} title={t.minus8va}>
          <ArrowDown size={12} />
          -8va
        </button>
        <button onClick={() => handleTransposeChange(transpose - 1)} title={t.minus1}>
          -1
        </button>
        <span className="transpose-value" style={{ color: rangeColor }}>
          {transpose > 0 ? '+' : ''}
          {transpose}
        </span>
        <button onClick={() => handleTransposeChange(transpose + 1)} title={t.plus1}>
          +1
        </button>
        <button onClick={() => handleTransposeChange(transpose + 12)} title={t.plus8va}>
          +8va
          <ArrowUp size={12} />
        </button>
      </div>

      <div className="transpose-actions">
        <button
          className={`btn-auto ${isAutoEnabled ? 'active' : ''}`}
          onClick={onToggleAuto}
          title={isAutoEnabled ? 'Desactivar auto-transposición' : 'Activar auto-transposición'}
        >
          {isAutoEnabled && <Wand2 size={10} style={{ marginRight: 4 }} />}
          Auto
        </button>
        <button onClick={() => handleTransposeChange(0)} disabled={transpose === 0} title={t.resetTranspose}>
          <RotateCcw size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Music size={12} style={{ color: rangeColor, opacity: 0.8 }} />
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
    </div>
  );
}

export default TransposeControls;

