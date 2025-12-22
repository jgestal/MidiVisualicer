/**
 * Notation View - Componente refactorizado
 * Visualización de partitura musical usando VexFlow
 */
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { MidiNote } from '@/shared/types/midi';
import { midiToNote } from '@/config/instruments';
import './Notation.css';

export interface NotationProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
  showHeader?: boolean;
  maxMeasures?: number;
}

// Configuración
const CONFIG = {
  STAVE_WIDTH: 220,
  STAVE_HEIGHT: 200,
  START_X: 20,
  START_Y: 40,
  MAX_NOTES_PER_MEASURE: 8,
};

/**
 * Convertir nota MIDI a formato VexFlow
 */
function midiToVexFlow(midi: number): { key: string; accidental?: string } {
  const note = midiToNote(midi);
  const match = note.match(/^([A-G])(#?)(\d+)$/);

  if (!match) return { key: 'c/4' };

  const [, noteLetter, sharp, octave] = match;
  const key = `${noteLetter.toLowerCase()}/${octave}`;

  return {
    key,
    accidental: sharp ? '#' : undefined,
  };
}

/**
 * Convertir duración en segundos a duración VexFlow
 */
function durationToVexFlow(duration: number): string {
  if (duration < 0.25) return '16';
  if (duration < 0.5) return '8';
  if (duration < 1) return 'q';
  if (duration < 2) return 'h';
  return 'w';
}

/**
 * Hook para agrupar notas en compases
 */
function useMeasures(
  notes: MidiNote[],
  bpm: number,
  timeSignature: { numerator: number; denominator: number }
) {
  return useMemo(() => {
    const beatsPerMeasure = timeSignature.numerator;
    const beatDuration = 60 / bpm;
    const measureDuration = beatsPerMeasure * beatDuration;

    const measures: MidiNote[][] = [];
    let currentMeasure: MidiNote[] = [];
    let measureStartTime = 0;

    notes.forEach((note) => {
      while (note.time >= measureStartTime + measureDuration) {
        if (currentMeasure.length > 0) {
          measures.push(currentMeasure);
        }
        currentMeasure = [];
        measureStartTime += measureDuration;
      }
      currentMeasure.push(note);
    });

    if (currentMeasure.length > 0) {
      measures.push(currentMeasure);
    }

    return { measures, measureDuration };
  }, [notes, bpm, timeSignature]);
}

export function Notation({
  notes,
  currentTime,
  isPlaying,
  bpm,
  timeSignature,
  showHeader = false,
  maxMeasures = 20,
}: NotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const { measures, measureDuration } = useMeasures(notes, bpm, timeSignature);
  const currentMeasureIndex = Math.floor(currentTime / measureDuration);

  // Renderizar partitura
  const renderNotation = useCallback(() => {
    if (!containerRef.current || notes.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const displayMeasures = measures.slice(0, maxMeasures);
    const width = Math.max(800, displayMeasures.length * CONFIG.STAVE_WIDTH + 50);

    // Crear renderer
    rendererRef.current = new Renderer(container, Renderer.Backends.SVG);
    const renderer = rendererRef.current;
    renderer.resize(width, CONFIG.STAVE_HEIGHT);

    const context = renderer.getContext();
    context.setFont('Arial', 10);

    let xOffset = CONFIG.START_X;

    displayMeasures.forEach((measureNotes, measureIdx) => {
      // Crear pentagrama
      const stave = new Stave(xOffset, CONFIG.START_Y, CONFIG.STAVE_WIDTH);

      if (measureIdx === 0) {
        stave.addClef('treble');
        stave.addTimeSignature(`${timeSignature.numerator}/${timeSignature.denominator}`);
      }

      stave.setContext(context).draw();

      // Crear notas del compás
      if (measureNotes.length > 0) {
        const staveNotes = measureNotes.slice(0, CONFIG.MAX_NOTES_PER_MEASURE).map((note) => {
          const vexNote = midiToVexFlow(note.midi);
          const duration = durationToVexFlow(note.duration);

          const staveNote = new StaveNote({
            keys: [vexNote.key],
            duration: duration,
            auto_stem: true,
          });

          if (vexNote.accidental) {
            staveNote.addModifier(new Accidental(vexNote.accidental));
          }

          // Resaltar nota actual
          const isCurrentNote =
            measureIdx === currentMeasureIndex &&
            note.time <= currentTime &&
            note.time + note.duration >= currentTime;

          if (isCurrentNote && isPlaying) {
            staveNote.setStyle({
              fillStyle: '#6366f1',
              strokeStyle: '#6366f1',
            });
          }

          return staveNote;
        });

        try {
          const voice = new Voice({
            num_beats: timeSignature.numerator,
            beat_value: timeSignature.denominator,
          }).setStrict(false);

          voice.addTickables(staveNotes);
          new Formatter().joinVoices([voice]).format([voice], CONFIG.STAVE_WIDTH - 50);
          voice.draw(context, stave);
        } catch {
          // Error al formatear, ignorar este compás
        }
      }

      xOffset += CONFIG.STAVE_WIDTH;
    });
  }, [
    measures,
    currentTime,
    isPlaying,
    currentMeasureIndex,
    timeSignature,
    notes.length,
    maxMeasures,
  ]);

  // Renderizar cuando cambien los datos
  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  // Auto-scroll al compás actual
  useEffect(() => {
    if (isPlaying && scrollRef.current) {
      const targetScroll =
        currentMeasureIndex * CONFIG.STAVE_WIDTH - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [currentMeasureIndex, isPlaying]);

  return (
    <div className="notation">
      {showHeader && (
        <div className="notation-header">
          <span className="notation-title">🎼 Partitura</span>
          <span className="notation-info">
            {bpm} BPM • {timeSignature.numerator}/{timeSignature.denominator}
          </span>
        </div>
      )}

      <div ref={scrollRef} className="notation-scroll">
        {notes.length === 0 ? (
          <div className="notation-empty">
            <span className="notation-empty-icon">🎵</span>
            <p>Selecciona una pista para ver la partitura</p>
          </div>
        ) : (
          <div ref={containerRef} className="notation-content" />
        )}
      </div>
    </div>
  );
}

export default Notation;
