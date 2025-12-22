/**
 * Componente de visualización de tablatura
 * Scroll anticipado al 30%, click interactivo
 */
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { getAllInstruments, getOptimalPosition, midiToNoteName } from '../config/instruments';
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

export function TablatureView({
  notes,
  instrumentId,
  currentTime,
  isPlaying,
  transpose = 0,
  onSeek,
}: TablatureViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const instrument = useMemo(() => getAllInstruments()[instrumentId], [instrumentId]);

  // Convertir notas MIDI a posiciones de tablatura
  // Manejar caso de instrumento no encontrado devolviendo arrays vacíos
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

  const currentSlotIndex = Math.floor(currentTime / TIME_QUANTUM);

  // Encontrar el índice del slot actual en el array ordenado
  const currentSlotArrayIndex = useMemo(() => {
    return sortedSlots.findIndex((slot) => slot >= currentSlotIndex);
  }, [sortedSlots, currentSlotIndex]);

  // Scroll anticipado suave - usar requestAnimationFrame para suavidad
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current || currentSlotArrayIndex < 0) return;

    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;

    // Calcular posición X de la nota actual
    // +26 por el ancho de los labels de cuerdas
    const currentNoteX = currentSlotArrayIndex * CELL_WIDTH + 26;

    // Queremos la nota actual al 30% desde la izquierda
    const targetScrollLeft = currentNoteX - containerWidth * 0.3;

    // Animar suavemente
    const currentScroll = container.scrollLeft;
    const diff = targetScrollLeft - currentScroll;

    // Solo animar si hay diferencia significativa
    if (Math.abs(diff) > 10) {
      // Interpolar suavemente (lerp)
      const newScroll = currentScroll + diff * 0.1;
      container.scrollLeft = Math.max(0, newScroll);
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

  // Early return DESPUÉS de todos los hooks
  if (!instrument) {
    return <div className="tab-error">Instrumento no encontrado</div>;
  }

  const stringCount = instrument.strings.length;
  const stringLabels = [...instrument.strings].reverse();

  const notesInRange = tabNotes.length;
  const notesOutOfRange = notes.length - notesInRange;

  return (
    <div className="tab-container">
      <div className="tab-scroll" ref={scrollContainerRef}>
        <div className="tab-grid">
          <div className="tab-labels">
            {stringLabels.map((note, idx) => (
              <div key={idx} className="tab-label">
                {note.replace(/\d/, '')}
              </div>
            ))}
          </div>

          <div className="tab-notes">
            {Array.from({ length: stringCount }, (_, stringIdx) => {
              const stringNum = stringCount - stringIdx;

              return (
                <div key={stringIdx} className="tab-string-row">
                  {sortedSlots.length === 0 ? (
                    <span className="tab-empty">{'─'.repeat(40)}</span>
                  ) : (
                    sortedSlots.map((slot, slotArrayIdx) => {
                      const slotNotes = timeSlots.get(slot) || [];
                      const noteOnString = slotNotes.find((n) => n.string === stringNum);
                      const isActive =
                        slot === currentSlotIndex ||
                        (slot < currentSlotIndex &&
                          sortedSlots[slotArrayIdx + 1] > currentSlotIndex);

                      return (
                        <span
                          key={slot}
                          className={`tab-cell ${isActive ? 'active' : ''} ${noteOnString ? 'has-note' : ''} ${onSeek ? 'clickable' : ''}`}
                          onClick={() => noteOnString && handleNoteClick(noteOnString.time)}
                          title={
                            noteOnString
                              ? `${noteOnString.noteName} (${(slot * TIME_QUANTUM).toFixed(2)}s)`
                              : undefined
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

      {notesOutOfRange > 0 && (
        <div className="tab-footer">⚠️ {notesOutOfRange} notas fuera del rango del instrumento</div>
      )}
    </div>
  );
}

const styles = `
.tab-container {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tab-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-2);
  scroll-behavior: auto;
}

.tab-grid {
  display: flex;
  gap: 0;
}

.tab-labels {
  display: flex;
  flex-direction: column;
  min-width: 26px;
  position: sticky;
  left: 0;
  background: var(--color-bg-secondary);
  z-index: 2;
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

.tab-notes {
  display: flex;
  flex-direction: column;
}

.tab-string-row {
  display: flex;
  height: 22px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: var(--color-text-muted);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.tab-string-row:last-child { border-bottom: none; }

.tab-cell {
  width: ${CELL_WIDTH}px;
  min-width: ${CELL_WIDTH}px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

if (typeof document !== 'undefined') {
  const id = 'tablature-styles-v3';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = styles;
    document.head.appendChild(s);
  }
}

export default TablatureView;
