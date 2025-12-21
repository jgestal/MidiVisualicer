/**
 * Componente de visualización de partitura usando VexFlow
 */
import { useEffect, useRef, useMemo } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { MidiNote } from '../types/midi';
import { midiToNote } from '../config/instruments';

interface NotationViewProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
}

// Convertir nota MIDI a formato VexFlow
function midiToVexFlow(midi: number): { key: string; accidental?: string } {
  const note = midiToNote(midi);
  const match = note.match(/^([A-G])(#?)(\d+)$/);

  if (!match) return { key: 'c/4' };

  const [, noteLetter, sharp, octave] = match;
  const key = `${noteLetter.toLowerCase()}/${octave}`;

  return {
    key,
    accidental: sharp ? '#' : undefined
  };
}

// Agrupar notas en compases
function groupNotesIntoMeasures(
  notes: MidiNote[],
  bpm: number,
  timeSignature: { numerator: number; denominator: number }
): MidiNote[][] {
  const beatsPerMeasure = timeSignature.numerator;
  const beatDuration = 60 / bpm;
  const measureDuration = beatsPerMeasure * beatDuration;

  const measures: MidiNote[][] = [];
  let currentMeasure: MidiNote[] = [];
  let measureStartTime = 0;

  notes.forEach(note => {
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

  return measures;
}

export function NotationView({
  notes,
  currentTime,
  isPlaying,
  bpm,
  timeSignature
}: NotationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Agrupar notas en compases
  const measures = useMemo(() => {
    return groupNotesIntoMeasures(notes, bpm, timeSignature);
  }, [notes, bpm, timeSignature]);

  // Calcular compás actual
  const beatsPerMeasure = timeSignature.numerator;
  const beatDuration = 60 / bpm;
  const measureDuration = beatsPerMeasure * beatDuration;
  const currentMeasureIndex = Math.floor(currentTime / measureDuration);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const width = Math.max(800, measures.length * 250);
    const height = 200;

    // Crear renderer
    rendererRef.current = new Renderer(container, Renderer.Backends.SVG);
    const renderer = rendererRef.current;
    renderer.resize(width, height);

    const context = renderer.getContext();
    context.setFont('Arial', 10);

    // Dibujar cada compás
    let xOffset = 20;
    const staveWidth = 220;

    measures.slice(0, 20).forEach((measureNotes, measureIdx) => {
      // Crear pentagrama
      const stave = new Stave(xOffset, 40, staveWidth);

      if (measureIdx === 0) {
        stave.addClef('treble');
        stave.addTimeSignature(`${timeSignature.numerator}/${timeSignature.denominator}`);
      }

      stave.setContext(context).draw();

      // Crear notas del compás
      if (measureNotes.length > 0) {
        const staveNotes = measureNotes.slice(0, 8).map(note => {
          const vexNote = midiToVexFlow(note.midi);
          const duration = note.duration < 0.25 ? '16' :
            note.duration < 0.5 ? '8' :
              note.duration < 1 ? 'q' : 'h';

          const staveNote = new StaveNote({
            keys: [vexNote.key],
            duration: duration,
            auto_stem: true
          });

          if (vexNote.accidental) {
            staveNote.addModifier(new Accidental(vexNote.accidental));
          }

          // Resaltar nota actual
          const isCurrentNote = measureIdx === currentMeasureIndex &&
            note.time <= currentTime &&
            note.time + note.duration >= currentTime;

          if (isCurrentNote && isPlaying) {
            staveNote.setStyle({ fillStyle: '#6366f1', strokeStyle: '#6366f1' });
          }

          return staveNote;
        });

        try {
          const voice = new Voice({
            num_beats: timeSignature.numerator,
            beat_value: timeSignature.denominator
          }).setStrict(false);

          voice.addTickables(staveNotes);

          new Formatter()
            .joinVoices([voice])
            .format([voice], staveWidth - 50);

          voice.draw(context, stave);
        } catch {
          // Si hay error al formatear, ignorar este compás
          console.warn(`Error rendering measure ${measureIdx}`);
        }
      }

      xOffset += staveWidth;
    });

  }, [measures, currentTime, isPlaying, currentMeasureIndex, timeSignature, notes.length]);

  // Auto-scroll al compás actual
  useEffect(() => {
    if (isPlaying && containerRef.current) {
      const container = containerRef.current.parentElement;
      if (container) {
        const staveWidth = 220;
        const targetScroll = currentMeasureIndex * staveWidth - container.clientWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
    }
  }, [currentMeasureIndex, isPlaying]);

  return (
    <div className="notation-wrapper">
      <div className="notation-header">
        <h4 className="notation-title">🎼 Partitura</h4>
        <span className="text-sm text-muted">
          {bpm} BPM • {timeSignature.numerator}/{timeSignature.denominator}
        </span>
      </div>

      <div
        className="notation-scroll"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          background: '#ffffff',
          borderRadius: '8px'
        }}
      >
        {notes.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            background: '#ffffff'
          }}>
            <span style={{ fontSize: '32px', opacity: 0.3 }}>🎵</span>
            <p style={{ margin: '8px 0 0 0' }}>Selecciona una pista para ver la partitura</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{
              minHeight: 220,
              background: '#ffffff',
              padding: '8px'
            }}
          />
        )}
      </div>
    </div>
  );
}

export default NotationView;
