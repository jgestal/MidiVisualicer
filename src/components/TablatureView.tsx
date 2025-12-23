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
import './TablatureView.css';

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

  // Find the currently playing slot based on currentTime
  const currentSlotIndex = useMemo(() => {
    // Find the slot that corresponds to the current time
    // We need to find which slot is currently "active" (being played)
    for (let i = sortedSlots.length - 1; i >= 0; i--) {
      const slotTime = sortedSlots[i] * TIME_QUANTUM;
      if (currentTime >= slotTime) {
        return sortedSlots[i];
      }
    }
    return -1; // Before first note
  }, [sortedSlots, currentTime]);

  // Find which line contains the current slot
  const currentLineIndex = useMemo(() => {
    if (currentSlotIndex < 0) return 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check if this line contains the current slot or any slot after it
      for (const item of line) {
        if (item.type === 'note' && item.slot >= currentSlotIndex) {
          return i;
        }
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

  // Copy tablature line to clipboard with proper formatting
  const handleCopyLine = (lineIndex: number) => {
    const line = lines[lineIndex];
    if (!line || line.length === 0) return;

    // Build formatted tablature text
    const lineTexts: string[] = [];
    stringLabels.forEach((label, stringIdx) => {
      const stringNum = stringCount - stringIdx;
      const cleanLabel = label.replace(/\d/, '');
      let lineStr = cleanLabel.padEnd(2, ' ') + '|';

      line.forEach((item) => {
        if (item.type === 'pause') {
          lineStr += '|';
        } else {
          const slotNotes = timeSlots.get(item.slot) || [];
          const noteOnString = slotNotes.find((n) => n.string === stringNum);
          if (noteOnString) {
            lineStr += String(noteOnString.fret).padStart(2, '-') + '-';
          } else {
            lineStr += '---';
          }
        }
      });
      lineStr += '|';
      lineTexts.push(lineStr);
    });

    const text = lineTexts.join('\n');
    navigator.clipboard.writeText(text).catch(console.error);
  };

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
                <button
                  className="tab-copy-btn"
                  onClick={() => handleCopyLine(lineIndex)}
                  title="Copiar esta línea de tablatura"
                >
                  📋
                </button>
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
                          lineItems.map((item) => {
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

                            // Check if this slot is the current one
                            const isActive = slot === currentSlotIndex;

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
    </div>
  );
}

export default TablatureView;
