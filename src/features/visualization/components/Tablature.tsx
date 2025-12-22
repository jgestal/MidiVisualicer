/**
 * Tablature View - Componente refactorizado
 * Visualización de tablatura responsiva (Page View Real)
 */
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { getAllInstruments, getOptimalPosition, midiToNoteName } from '@/config/instruments';
import type { MidiNote } from '@/shared/types/midi';
import './Tablature.css';

// Configuración
const CONFIG = {
  TIME_QUANTUM: 0.15, // Cuantización temporal
  CELL_WIDTH: 28,
  LOOKAHEAD_FACTOR: 0.3,
  LERP_FACTOR: 0.12,
  DEFAULT_PAGE_WIDTH: 800,
  LABEL_WIDTH: 40,
};

export interface TablatureProps {
  notes: MidiNote[];
  instrumentId: string;
  currentTime: number;
  isPlaying: boolean;
  transpose?: number;
  onSeek?: (time: number) => void;
  showHeader?: boolean;
  mode?: 'scroll' | 'page';
  containerWidth?: number; // Para cálculo responsive
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

/**
 * Hook para procesar notas en formato de tablatura
 */
function useTabNotes(
  notes: MidiNote[],
  instrumentId: string,
  transpose: number
): { tabNotes: TabNote[]; totalSlots: number; stringCount: number } {
  return useMemo(() => {
    const allInstruments = getAllInstruments();
    const instrument = allInstruments[instrumentId];

    if (!instrument || notes.length === 0) {
      return { tabNotes: [], totalSlots: 0, stringCount: 6 };
    }

    const stringCount = instrument.strings.length;

    // Agrupar notas por slots temporales
    const processed: TabNote[] = [];
    const maxTime = Math.max(...notes.map((n) => n.time));
    const totalSlots = Math.ceil(maxTime / CONFIG.TIME_QUANTUM) + 10;

    notes.forEach((note) => {
      const transposedMidi = note.midi + transpose;
      const slotIndex = Math.round(note.time / CONFIG.TIME_QUANTUM);
      // Pasar el objeto instrument, no el id
      const position = getOptimalPosition(transposedMidi, instrument);

      if (position) {
        processed.push({
          string: position.string,
          fret: position.fret,
          time: note.time,
          duration: note.duration,
          midiNote: transposedMidi,
          noteName: midiToNoteName(transposedMidi),
          slotIndex,
        });
      }
    });

    return { tabNotes: processed, totalSlots, stringCount };
  }, [notes, instrumentId, transpose]);
}

export function Tablature({
  notes,
  instrumentId,
  currentTime,
  isPlaying,
  transpose = 0,
  onSeek,
  showHeader = false,
  mode = 'scroll',
  containerWidth = CONFIG.DEFAULT_PAGE_WIDTH,
}: TablatureProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlotRef = useRef<HTMLDivElement>(null);
  const currentSystemRef = useRef<HTMLDivElement | null>(null);

  const allInstruments = getAllInstruments();
  const instrument = allInstruments[instrumentId];

  const { tabNotes, totalSlots, stringCount } = useTabNotes(notes, instrumentId, transpose);

  // Cálculo de slots por sistema (Responsive)
  const slotsPerSystem = useMemo(() => {
    if (mode !== 'page') return totalSlots;
    const availableWidth = containerWidth - CONFIG.LABEL_WIDTH - 40; // padding
    const slots = Math.floor(availableWidth / CONFIG.CELL_WIDTH);
    return Math.max(4, slots);
  }, [containerWidth, mode, totalSlots]);

  // Slot actual basado en el tiempo
  const currentSlot = Math.round(currentTime / CONFIG.TIME_QUANTUM);

  // Organizar notas por slot y cuerda
  const notesBySlot = useMemo(() => {
    const map = new Map<number, Map<number, TabNote>>();
    tabNotes.forEach((note) => {
      if (!map.has(note.slotIndex)) {
        map.set(note.slotIndex, new Map());
      }
      map.get(note.slotIndex)!.set(note.string, note);
    });
    return map;
  }, [tabNotes]);

  // Auto-scroll Horizontal (Modo Scroll)
  useEffect(() => {
    if (mode !== 'scroll' || !isPlaying || !scrollRef.current) return;

    const container = scrollRef.current;
    const currentX = currentSlot * CONFIG.CELL_WIDTH;
    const containerWidthVal = container.clientWidth;

    const targetScroll = currentX - containerWidthVal * CONFIG.LOOKAHEAD_FACTOR;
    const currentScroll = container.scrollLeft;
    const diff = targetScroll - currentScroll;

    if (Math.abs(diff) > 5) {
      container.scrollLeft = Math.max(0, currentScroll + diff * CONFIG.LERP_FACTOR);
    }
  });

  // Auto-scroll Vertical (Modo Página)
  const currentSystemIndex = Math.floor(currentSlot / slotsPerSystem);

  useEffect(() => {
    if (mode === 'page' && isPlaying && currentSystemRef.current) {
      // Hacer scroll suave hacia el sistema actual
      currentSystemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSystemIndex, isPlaying, mode, slotsPerSystem]);

  // Click handler para seek
  const handleCellClick = useCallback(
    (slotIndex: number) => {
      if (onSeek) {
        const time = slotIndex * CONFIG.TIME_QUANTUM;
        onSeek(time);
      }
    },
    [onSeek]
  );

  if (!instrument) {
    return (
      <div className="tablature tablature-empty">
        <span>Instrumento no encontrado</span>
      </div>
    );
  }

  const renderSlot = (slotIndex: number) => {
    const isCurrentSlot = slotIndex === currentSlot;
    const slotNotes = notesBySlot.get(slotIndex);

    return (
      <div
        key={slotIndex}
        ref={isCurrentSlot ? currentSlotRef : undefined}
        className={`tablature-column ${isCurrentSlot ? 'current' : ''}`}
      >
        {Array.from({ length: stringCount }, (_, stringIdx) => {
          const note = slotNotes?.get(stringIdx);
          const isActive =
            note && currentTime >= note.time && currentTime <= note.time + note.duration;

          return (
            <div
              key={stringIdx}
              className={`tablature-cell ${note ? 'has-note' : ''} ${isActive ? 'active' : ''} ${onSeek ? 'clickable' : ''}`}
              onClick={() => handleCellClick(slotIndex)}
              title={note ? note.noteName : undefined}
            >
              <div className="tablature-line" />
              {note && <span className="tablature-fret">{note.fret}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  // --- Render MODO SCROLL ---
  if (mode === 'scroll') {
    const slots = Array.from({ length: totalSlots }, (_, i) => i);
    return (
      <div className="tablature">
        {showHeader && (
          <div className="tablature-header">
            <span className="tablature-title">
              {instrument.icon} {instrument.nameEs}
            </span>
            <span className="tablature-hint">Modo Scroll</span>
          </div>
        )}
        <div ref={scrollRef} className="tablature-scroll">
          <div className="tablature-grid">
            <div className="tablature-labels">
              {instrument.strings.map((stringNote, idx) => (
                <div key={idx} className="tablature-label">
                  {stringNote}
                </div>
              ))}
            </div>
            <div className="tablature-content">{slots.map(renderSlot)}</div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render MODO PAGE ---
  const totalSystems = Math.ceil(totalSlots / slotsPerSystem);
  const systems = Array.from({ length: totalSystems }, (_, i) => i);

  return (
    <div className="tablature-page-wrapper" style={{ width: containerWidth }}>
      {systems.map((systemIndex) => {
        const isCurrentSystem = systemIndex === currentSystemIndex;
        const startSlot = systemIndex * slotsPerSystem;
        const endSlot = Math.min(startSlot + slotsPerSystem, totalSlots);
        const systemSlots = Array.from({ length: endSlot - startSlot }, (_, i) => startSlot + i);

        return (
          <div
            key={systemIndex}
            className={`tablature-system ${isCurrentSystem ? 'active' : ''}`}
            ref={isCurrentSystem ? currentSystemRef : undefined}
          >
            <div className="tablature-labels">
              {instrument.strings.map((stringNote, idx) => (
                <div key={idx} className="tablature-label">
                  {stringNote}
                </div>
              ))}
            </div>
            <div className="tablature-content" style={{ flexWrap: 'nowrap' }}>
              {systemSlots.map(renderSlot)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Tablature;
