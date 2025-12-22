/**
 * Notation View - Componente refactorizado
 * Visualización de partitura musical responsiva con VexFlow
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
  mode?: 'scroll' | 'page';
  containerWidth?: number;
}

// Configuración
const CONFIG = {
  STAVE_WIDTH: 220, // Ancho base del compás
  STAVE_HEIGHT: 150,
  START_X: 10,
  START_Y: 20,
  MAX_NOTES_PER_MEASURE: 8,
  DEFAULT_WIDTH: 800,
};

/**
 * Convertir nota MIDI a formato VexFlow
 */
function midiToVexFlow(midi: number): { key: string; accidental?: string } {
  const note = midiToNote(midi);
  const match = note.match(/^([A-G])(#?)(\d+)$/);
  if (!match) return { key: 'c/4' };
  const [, noteLetter, sharp, octave] = match;
  return { key: `${noteLetter.toLowerCase()}/${octave}`, accidental: sharp ? '#' : undefined };
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
        if (currentMeasure.length > 0) measures.push(currentMeasure);
        currentMeasure = [];
        measureStartTime += measureDuration;
      }
      currentMeasure.push(note);
    });

    if (currentMeasure.length > 0) measures.push(currentMeasure);

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
  maxMeasures = 500,
  mode = 'scroll',
  containerWidth = CONFIG.DEFAULT_WIDTH,
}: NotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const measurePositions = useRef<{ x: number; y: number }[]>([]);

  const { measures, measureDuration } = useMeasures(notes, bpm, timeSignature);
  const currentMeasureIndex = Math.floor(currentTime / measureDuration);

  // Renderizar partitura
  const renderNotation = useCallback(() => {
    if (!containerRef.current || notes.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const displayMeasures = mode === 'page' ? measures : measures.slice(0, maxMeasures);

    // Ancho real disponible (asegurar mínimo)
    const availableWidth = Math.max(containerWidth, 400);

    // Si estamos en modo página, ajustamos el ancho del compás para llenar la línea
    // Calculamos cuantos compases caben por defecto
    const itemsPerRow = Math.floor((availableWidth - 20) / CONFIG.STAVE_WIDTH);
    const dynamicStaveWidth =
      mode === 'page'
        ? Math.floor((availableWidth - 40) / Math.max(1, itemsPerRow))
        : CONFIG.STAVE_WIDTH;

    // Calcular ancho total de canvas
    const canvasWidth =
      mode === 'page'
        ? availableWidth
        : Math.max(800, displayMeasures.length * CONFIG.STAVE_WIDTH + 50);

    // Iniciar Renderer
    rendererRef.current = new Renderer(container, Renderer.Backends.SVG);
    const renderer = rendererRef.current;

    const context = renderer.getContext();
    context.setFont('Arial', 10);

    let x = CONFIG.START_X;
    let y = CONFIG.START_Y;

    measurePositions.current = [];

    displayMeasures.forEach((measureNotes, measureIdx) => {
      // Wrapping para Page Mode
      if (mode === 'page') {
        if (x + dynamicStaveWidth > canvasWidth) {
          x = CONFIG.START_X;
          y += CONFIG.STAVE_HEIGHT;
        }
      }

      measurePositions.current[measureIdx] = { x, y };

      const stave = new Stave(x, y, dynamicStaveWidth);

      // Clef & TimeSignature
      const isStartOfSystem = mode === 'page' && x === CONFIG.START_X;
      if (measureIdx === 0 || isStartOfSystem) {
        stave.addClef('treble');
        if (measureIdx === 0) {
          stave.addTimeSignature(`${timeSignature.numerator}/${timeSignature.denominator}`);
        }
      }

      stave.setContext(context).draw();

      // Dibujar notas
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

          // Estilo para nota sonando
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
          new Formatter().joinVoices([voice]).format([voice], dynamicStaveWidth - 50);
          voice.draw(context, stave);
        } catch (e) {
          // console.warn('Error formatting measure', measureIdx, e);
        }
      }

      x += dynamicStaveWidth;
    });

    // Dimensionar SVG
    renderer.resize(canvasWidth, y + CONFIG.STAVE_HEIGHT + 20);
  }, [
    measures,
    currentTime,
    isPlaying,
    currentMeasureIndex,
    timeSignature,
    notes.length,
    maxMeasures,
    mode,
    containerWidth,
  ]);

  // Render trigger
  useEffect(() => {
    // Pequeño delay para estabilizar resize
    const timer = setTimeout(renderNotation, 10);
    return () => clearTimeout(timer);
  }, [renderNotation]);

  // Auto-scroll
  useEffect(() => {
    if (
      isPlaying &&
      (containerRef.current || scrollRef.current) &&
      measurePositions.current[currentMeasureIndex]
    ) {
      const pos = measurePositions.current[currentMeasureIndex];

      if (mode === 'page') {
        // Scroll vertical del elemento padre (que es el que tiene overflow-y)
        // El padre debería ser pasado como ref o accedido via DOM traversing.
        // En App.tsx, el contenedor con scroll es main-scroll-area o el elemento superior.
        // Pero aquí intentamos mover el elemento dentro de la vista si es posible.

        const element = containerRef.current;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          // Esto podría ser brusco si el elemento es todo el SVG.
          // Mejor approach: scrollIntoView del sistema actual no es fácil en SVG único.
          // Usaremos window scroll o parent scroll si podemos acceder.
          // Workaround simple: Scroll al padre directo del componente si tiene scroll.
          element.parentElement?.scrollTo({ top: pos.y - 100, behavior: 'smooth' });
        }
      } else {
        if (scrollRef.current) {
          const targetLeft = pos.x - scrollRef.current.clientWidth / 2;
          scrollRef.current.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
        }
      }
    }
  }, [currentMeasureIndex, isPlaying, mode]);

  return (
    <div className={`notation ${mode === 'page' ? 'notation-page' : ''}`} style={{ width: '100%' }}>
      {showHeader && (
        <div className="notation-header">
          <span className="notation-title">🎼 Partitura</span>
          <span className="notation-info">
            {bpm} BPM • {timeSignature.numerator}/{timeSignature.denominator}
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`notation-scroll ${mode === 'page' ? 'overflow-visible' : ''}`}
      >
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
