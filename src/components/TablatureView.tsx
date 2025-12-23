/**
 * Componente de visualización de tablatura MULTI-LÍNEA
 * - Sin scroll horizontal, solo vertical
 * - Cada línea se adapta al ancho de la pantalla
 * - Cursor que acompaña las notas
 * - Scroll suave automático al cambiar de línea
 */
import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { getAllInstruments, getOptimalPosition, midiToNoteName } from '../config/instruments';
import { useI18n } from '../shared/context/I18nContext';
import type { MidiNote } from '../types/midi';

interface TablatureViewProps {
  notes: MidiNote[];
  instrumentId: string;
  currentTime: number;
  isPlaying: boolean;
  transpose?: number;
  onSeek?: (time: number) => void;
}

interface TabNote {
  string: number;
  fret: number;
  time: number;
  duration: number;
  midiNote: number;
  noteName: string;
  slotIndex: number;
}

const TIME_QUANTUM = 0.15;
const CELL_WIDTH = 28;
const MARGIN_LEFT = 30; // space for string labels

export function TablatureView({
  notes,
  instrumentId,
  currentTime,
  isPlaying,
  transpose = 0,
  onSeek,
}: TablatureViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const instrument = useMemo(() => getAllInstruments()[instrumentId], [instrumentId]);
  const { t } = useI18n();

  // Measure container width on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate how many cells fit per line
  const cellsPerLine = useMemo(() => {
    const availableWidth = containerWidth - MARGIN_LEFT - 20; // padding
    return Math.max(10, Math.floor(availableWidth / CELL_WIDTH));
  }, [containerWidth]);

  // Convert MIDI notes to tablature positions
  const { tabNotes, timeSlots } = useMemo(() => {
    if (!instrument) {
      return { tabNotes: [] as TabNote[], timeSlots: new Map<number, TabNote[]>() };
    }

    const processed: TabNote[] = [];
    const slots: Map<number, TabNote[]> = new Map();

    notes.forEach((note) => {
      const transposedMidi = note.midi + transpose;
      const position = getOptimalPosition(transposedMidi, instrument);

      if (position && position.fret >= 0 && position.fret <= instrument.frets) {
        const slotIndex = Math.floor(note.time / TIME_QUANTUM);
        const tabNote: TabNote = {
          string: position.string,
          fret: position.fret,
          time: note.time,
          duration: note.duration,
          midiNote: transposedMidi,
          noteName: midiToNoteName(transposedMidi),
          slotIndex,
        };
        processed.push(tabNote);

        if (!slots.has(slotIndex)) {
          slots.set(slotIndex, []);
        }
        const slotNotes = slots.get(slotIndex);
        if (slotNotes) {
          slotNotes.push(tabNote);
        }
      }
    });

    return { tabNotes: processed, timeSlots: slots };
  }, [notes, instrument, transpose]);

  const sortedSlots = useMemo(
    () => Array.from(timeSlots.keys()).sort((a, b) => a - b),
    [timeSlots]
  );

  // Detect gaps between consecutive slots (gaps > 3 slots = 0.45s indicate significant pause)
  const PAUSE_THRESHOLD = 3; // gaps larger than this many slots get a pause marker

  type SlotItem = { type: 'note'; slot: number } | { type: 'pause'; afterSlot: number };

  // Build display items with pause markers
  const displayItems = useMemo(() => {
    const items: SlotItem[] = [];
    for (let i = 0; i < sortedSlots.length; i++) {
      items.push({ type: 'note', slot: sortedSlots[i] });
      // Check for gap before next slot
      if (i < sortedSlots.length - 1) {
        const currentSlot = sortedSlots[i];
        const nextSlot = sortedSlots[i + 1];
        if (nextSlot - currentSlot > PAUSE_THRESHOLD) {
          items.push({ type: 'pause', afterSlot: currentSlot });
        }
      }
    }
    return items;
  }, [sortedSlots]);

  // Split items into lines/rows based on cellsPerLine
  const lines = useMemo(() => {
    const result: SlotItem[][] = [];
    for (let i = 0; i < displayItems.length; i += cellsPerLine) {
      result.push(displayItems.slice(i, i + cellsPerLine));
    }
    // Ensure at least one empty line for empty state
    if (result.length === 0) {
      result.push([]);
    }
    return result;
  }, [displayItems, cellsPerLine]);

  const currentSlotIndex = Math.floor(currentTime / TIME_QUANTUM);

  // Find which line contains the current slot
  const currentLineIndex = useMemo(() => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.some((item) => item.type === 'note' && item.slot >= currentSlotIndex)) {
        return i;
      }
    }
    return lines.length - 1;
  }, [lines, currentSlotIndex]);

  // Auto-scroll to current line - faster scroll to keep current in view
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const lineHeight = instrument ? (instrument.strings.length * 22 + 40) : 150;
    // Position current line near the top (20% from top)
    const targetScrollTop = currentLineIndex * lineHeight - container.clientHeight * 0.2;

    // Fast scroll - 0.5 lerp factor
    const currentScroll = container.scrollTop;
    const diff = targetScrollTop - currentScroll;

    if (Math.abs(diff) > 10) {
      const newScroll = currentScroll + diff * 0.5;
      container.scrollTop = Math.max(0, newScroll);
    }
  });

  const handleNoteClick = useCallback(
    (time: number) => {
      if (onSeek) {
        onSeek(time);
      }
    },
    [onSeek]
  );

  // Early return AFTER all hooks
  if (!instrument) {
    return <div className="tab-error">Instrumento no encontrado</div>;
  }

  const stringCount = instrument.strings.length;
  const stringLabels = [...instrument.strings].reverse();

  const notesInRange = tabNotes.length;
  const notesOutOfRange = notes.length - notesInRange;

  return (
    <div className="tab-container-multiline" ref={containerRef}>
      <div className="tab-scroll-vertical" ref={scrollContainerRef}>
        {lines.map((lineItems, lineIndex) => {
          const firstNoteItem = lineItems.find(item => item.type === 'note');
          const lineStartSlot = firstNoteItem ? firstNoteItem.slot : lineIndex * cellsPerLine;
          const lineStartTime = (lineStartSlot * TIME_QUANTUM).toFixed(1);

          return (
            <div key={lineIndex} className={`tab-line ${currentLineIndex === lineIndex ? 'current' : ''}`}>
              <div className="tab-line-header">
                <span className="tab-line-time">{lineStartTime}s</span>
              </div>
              <div className="tab-grid-line">
                {/* String labels */}
                <div className="tab-labels">
                  {stringLabels.map((note, idx) => (
                    <div key={idx} className="tab-label">
                      {note.replace(/\d/, '')}
                    </div>
                  ))}
                </div>

                {/* Notes for this line */}
                <div className="tab-notes-line">
                  {Array.from({ length: stringCount }, (_, stringIdx) => {
                    const stringNum = stringCount - stringIdx;

                    return (
                      <div key={stringIdx} className="tab-string-row">
                        {lineItems.length === 0 ? (
                          <span className="tab-empty">{'─'.repeat(Math.min(40, cellsPerLine))}</span>
                        ) : (
                          lineItems.map((item, itemIdx) => {
                            if (item.type === 'pause') {
                              // Render pause marker (vertical bar)
                              return (
                                <span
                                  key={`pause-${item.afterSlot}`}
                                  className="tab-cell tab-pause"
                                  title="Pausa"
                                >
                                  │
                                </span>
                              );
                            }

                            // It's a note slot
                            const slot = item.slot;
                            const slotNotes = timeSlots.get(slot) || [];
                            const noteOnString = slotNotes.find((n) => n.string === stringNum);
                            const nextNoteItem = lineItems.slice(itemIdx + 1).find(i => i.type === 'note');
                            const nextSlot = nextNoteItem ? nextNoteItem.slot : Infinity;
                            const isActive = slot <= currentSlotIndex && nextSlot > currentSlotIndex;

                            return (
                              <span
                                key={slot}
                                className={`tab-cell ${isActive ? 'active' : ''} ${noteOnString ? 'has-note' : ''} ${onSeek ? 'clickable' : ''}`}
                                onClick={() => handleNoteClick(slot * TIME_QUANTUM)}
                                title={
                                  noteOnString
                                    ? `${noteOnString.noteName} (${(slot * TIME_QUANTUM).toFixed(2)}s)`
                                    : `${(slot * TIME_QUANTUM).toFixed(2)}s`
                                }
                              >
                                {noteOnString ? String(noteOnString.fret).padStart(2, ' ') : '──'}
                              </span>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notesOutOfRange > 0 && (
        <div className="tab-footer">⚠️ {notesOutOfRange} {t.notesOutOfRange}</div>
      )}

      <style>{`
        .tab-container-multiline {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tab-scroll-vertical {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-2);
        }

        .tab-line {
          margin-bottom: 16px;
          padding: 8px;
          border-radius: var(--radius-md);
          background: var(--color-bg-tertiary);
          transition: all var(--transition-fast);
        }

        .tab-line.current {
          background: rgba(99, 102, 241, 0.1);
          box-shadow: inset 0 0 0 1px var(--color-accent-primary);
        }

        .tab-line-header {
          margin-bottom: 4px;
          padding-left: 4px;
        }

        .tab-line-time {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--color-text-secondary);
          background: var(--color-bg-secondary);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .tab-grid-line {
          display: flex;
          gap: 0;
        }

        .tab-labels {
          display: flex;
          flex-direction: column;
          min-width: ${MARGIN_LEFT}px;
          background: var(--color-bg-tertiary);
        }

        .tab-label {
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-accent-primary);
          border-right: 2px solid var(--color-accent-primary);
          padding-right: 4px;
        }

        .tab-notes-line {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .tab-string-row {
          display: flex;
          height: 22px;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 12px;
          color: var(--color-text-muted);
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .tab-string-row:last-child { 
          border-bottom: none; 
        }

        .tab-cell {
          width: ${CELL_WIDTH}px;
          min-width: ${CELL_WIDTH}px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tab-cell.clickable {
          cursor: pointer;
        }

        .tab-cell.clickable:hover {
          background: rgba(99, 102, 241, 0.15);
        }

        .tab-cell.has-note {
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .tab-cell.active {
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .tab-empty {
          color: var(--color-text-muted);
          opacity: 0.15;
        }

        .tab-footer {
          padding: 4px 8px;
          font-size: 10px;
          color: var(--color-warning);
          border-top: 1px solid var(--color-border);
          text-align: center;
        }

        .tab-error {
          padding: var(--space-4);
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}

export default TablatureView;
