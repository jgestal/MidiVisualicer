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

const CHORD_THRESHOLD = 0.05; // 50ms window to group simultaneous notes
const PAUSE_THRESHOLD_SECONDS = 0.5; // Gap to show pause
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

  // Convert MIDI notes to tablature positions and group by time slots
  const { tabNotes, timeSlots } = useMemo(() => {
    if (!instrument) {
      return { tabNotes: [] as TabNote[], timeSlots: new Map<number, TabNote[]>() };
    }


    const validNotes: TabNote[] = [];

    // 1. Calculate optimized positions for all notes
    const rawNotes = notes
      .map(note => {
        const transposedMidi = note.midi + transpose;
        const position = getOptimalPosition(transposedMidi, instrument);
        return { note, position, transposedMidi };
      })
      .filter(item => item.position && item.position.fret >= 0 && item.position.fret <= instrument.frets);

    // 2. Sort by time
    rawNotes.sort((a, b) => a.note.time - b.note.time);

    // 3. Group into slots (columns)
    const slots: Map<number, TabNote[]> = new Map();
    let currentSlotIndex = -1;
    let currentSlotTime = -9999;

    rawNotes.forEach(({ note, position, transposedMidi }) => {
      // If note is far enough from current slot, start new slot
      if (Math.abs(note.time - currentSlotTime) > CHORD_THRESHOLD) {
        currentSlotIndex++;
        currentSlotTime = note.time;
        slots.set(currentSlotIndex, []);
      }

      const tabNote: TabNote = {
        string: position!.string,
        fret: position!.fret,
        time: note.time,
        duration: note.duration,
        midiNote: transposedMidi,
        noteName: midiToNoteName(transposedMidi),
        slotIndex: currentSlotIndex,
      };

      validNotes.push(tabNote);
      slots.get(currentSlotIndex)?.push(tabNote);
    });

    return { tabNotes: validNotes, timeSlots: slots };
  }, [notes, instrument, transpose]);



  // No need to sort if we inserted in order, but safe to map keys
  const sortedSlots = useMemo(
    () => Array.from(timeSlots.keys()).sort((a, b) => a - b),
    [timeSlots]
  );

  type SlotItem = { type: 'note'; slot: number } | { type: 'pause'; afterSlot: number };

  // Build display items with pause markers
  const displayItems = useMemo(() => {
    const items: SlotItem[] = [];
    for (let i = 0; i < sortedSlots.length; i++) {
      const currentSlotIdx = sortedSlots[i];
      items.push({ type: 'note', slot: currentSlotIdx });

      // Check for gap before next slot
      if (i < sortedSlots.length - 1) {
        const nextSlotIdx = sortedSlots[i + 1];

        // Get times
        const timeA = timeSlots.get(currentSlotIdx)?.[0]?.time || 0;
        const timeB = timeSlots.get(nextSlotIdx)?.[0]?.time || 0;

        if (timeB - timeA > PAUSE_THRESHOLD_SECONDS) {
          items.push({ type: 'pause', afterSlot: currentSlotIdx });
        }
      }
    }
    return items;
  }, [sortedSlots, timeSlots]);

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
    // Find last slot that started before or at currentTime
    // Since slots are sorted by time, we can look for the last one <= currentTime
    let active = -1;
    for (const slotIdx of sortedSlots) {
      const notesInSlot = timeSlots.get(slotIdx);
      if (!notesInSlot || notesInSlot.length === 0) continue;

      const slotTime = notesInSlot[0].time;
      // If this slot is in the future, stop
      if (slotTime > currentTime + 0.05) { // Small buffer
        break;
      }
      active = slotIdx;
    }
    return active;
  }, [sortedSlots, timeSlots, currentTime]);

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

  // Teleprompter mode: show only current line + a few before/after
  const LINES_BEFORE = 1;  // Show 1 line before current for context
  const LINES_AFTER = 3;   // Show 3 lines after current

  const visibleLineRange = useMemo(() => {
    const startLine = Math.max(0, currentLineIndex - LINES_BEFORE);
    const endLine = Math.min(lines.length - 1, currentLineIndex + LINES_AFTER);
    return { start: startLine, end: endLine };
  }, [currentLineIndex, lines.length]);

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
          // Only render lines in visible range
          if (lineIndex < visibleLineRange.start || lineIndex > visibleLineRange.end) {
            return null;
          }

          const firstNoteItem = lineItems.find(item => item.type === 'note');
          const lineStartSlot = firstNoteItem ? firstNoteItem.slot : -1;
          const startNote = lineStartSlot !== -1 ? timeSlots.get(lineStartSlot)?.[0] : null;
          const lineStartTime = startNote ? startNote.time.toFixed(1) : '0.0';

          // Determine line state for styling
          const isPastLine = lineIndex < currentLineIndex;
          const isCurrentLine = lineIndex === currentLineIndex;
          const isUpcomingLine = lineIndex > currentLineIndex;

          const lineClasses = [
            'tab-line',
            isCurrentLine && 'current',
            isPastLine && 'past',
            isUpcomingLine && 'upcoming',
          ].filter(Boolean).join(' ');

          return (
            <div key={lineIndex} className={lineClasses}>
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
                                onClick={() => {
                                  const t = timeSlots.get(slot)?.[0]?.time || 0;
                                  handleNoteClick(t);
                                }}
                                title={
                                  noteOnString
                                    ? `${noteOnString.noteName} (${(slotNotes[0]?.time || 0).toFixed(2)}s)`
                                    : `${(slotNotes[0]?.time || 0).toFixed(2)}s`
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
