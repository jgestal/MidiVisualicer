/**
 * Componente de visualización de partitura usando VexFlow - MULTI-LÍNEA
 * - Sin scroll horizontal, solo vertical
 * - Cada línea contiene compases que caben en el ancho
 * - Cursor/playhead que indica la posición actual
 * - Auto-scroll al compás actual durante reproducción
 */
import { useEffect, useRef, useMemo, useState } from 'react';
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

const STAVE_WIDTH = 180; // Reduced for better fit
const STAVE_HEIGHT = 130;
const MARGIN = 30;
const RIGHT_PADDING = 40; // Extra padding on right

// Convertir nota MIDI a formato VexFlow
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

  return measures;
}

export function NotationView({
  notes,
  currentTime,
  isPlaying,
  bpm,
  timeSignature,
}: NotationViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Measure container width
  useEffect(() => {
    if (!wrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(wrapperRef.current);
    setContainerWidth(wrapperRef.current.clientWidth);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate how many measures per line - with extra padding consideration
  const measuresPerLine = useMemo(() => {
    const availableWidth = containerWidth - MARGIN - RIGHT_PADDING;
    const count = Math.max(1, Math.floor(availableWidth / STAVE_WIDTH));
    // Reduce by 1 if it's too tight
    return count > 1 ? count : 1;
  }, [containerWidth]);

  // Group notes into measures
  const measures = useMemo(() => {
    return groupNotesIntoMeasures(notes, bpm, timeSignature);
  }, [notes, bpm, timeSignature]);

  // Split measures into lines
  const lines = useMemo(() => {
    const result: MidiNote[][][] = [];
    for (let i = 0; i < measures.length; i += measuresPerLine) {
      result.push(measures.slice(i, i + measuresPerLine));
    }
    if (result.length === 0) {
      result.push([]);
    }
    return result;
  }, [measures, measuresPerLine]);

  // Calculate current measure index and position within measure
  const beatsPerMeasure = timeSignature.numerator;
  const beatDuration = 60 / bpm;
  const measureDuration = beatsPerMeasure * beatDuration;
  const currentMeasureIndex = Math.floor(currentTime / measureDuration);
  const currentLineIndex = Math.floor(currentMeasureIndex / measuresPerLine);
  const positionInMeasure = (currentTime % measureDuration) / measureDuration;

  // Auto-scroll to current line
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const targetScrollTop = currentLineIndex * STAVE_HEIGHT - container.clientHeight * 0.3;

    const currentScroll = container.scrollTop;
    const diff = targetScrollTop - currentScroll;

    if (Math.abs(diff) > 20) {
      const newScroll = currentScroll + diff * 0.1;
      container.scrollTop = Math.max(0, newScroll);
    }
  });

  return (
    <div className="notation-wrapper-multiline" ref={wrapperRef}>
      <div className="notation-scroll-vertical" ref={scrollContainerRef}>
        {notes.length === 0 ? (
          <div className="notation-empty">
            <span className="notation-empty-icon">🎵</span>
            <p>Selecciona una pista para ver la partitura</p>
          </div>
        ) : (
          lines.map((lineMeasures, lineIndex) => (
            <NotationLine
              key={lineIndex}
              measures={lineMeasures}
              lineIndex={lineIndex}
              measuresPerLine={measuresPerLine}
              timeSignature={timeSignature}
              currentMeasureIndex={currentMeasureIndex}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isCurrentLine={lineIndex === currentLineIndex}
              lineStartMeasure={lineIndex * measuresPerLine}
              positionInMeasure={positionInMeasure}
              containerWidth={containerWidth}
            />
          ))
        )}
      </div>

      <style>{`
        .notation-wrapper-multiline {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .notation-scroll-vertical {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-2);
          background: #ffffff;
        }

        .notation-empty {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .notation-empty-icon {
          font-size: 32px;
          opacity: 0.3;
        }

        .notation-empty p {
          margin: 8px 0 0 0;
        }

        .notation-line {
          margin-bottom: 8px;
          padding: 8px;
          background: #fafafa;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          position: relative;
        }

        .notation-line.current {
          background: rgba(99, 102, 241, 0.08);
          box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.3);
        }

        .notation-line-header {
          font-size: 10px;
          color: #999;
          margin-bottom: 4px;
          padding-left: 4px;
        }

        .notation-line-content {
          background: #ffffff;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .notation-playhead {
          position: absolute;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
          z-index: 10;
          transition: left 0.05s linear;
        }
      `}</style>
    </div>
  );
}

// Separate component for each line of notation
interface NotationLineProps {
  measures: MidiNote[][];
  lineIndex: number;
  measuresPerLine: number;
  timeSignature: { numerator: number; denominator: number };
  currentMeasureIndex: number;
  currentTime: number;
  isPlaying: boolean;
  isCurrentLine: boolean;
  lineStartMeasure: number;
  positionInMeasure: number;
  containerWidth: number;
}

function NotationLine({
  measures,
  lineIndex,
  measuresPerLine,
  timeSignature,
  currentMeasureIndex,
  currentTime,
  isPlaying,
  isCurrentLine,
  lineStartMeasure,
  positionInMeasure,
}: NotationLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate playhead position within this line
  const playheadPosition = useMemo(() => {
    if (!isCurrentLine) return null;

    const measureInLine = currentMeasureIndex - lineStartMeasure;
    if (measureInLine < 0 || measureInLine >= measures.length) return null;

    // X position = margin + (measure index * stave width) + (position within measure * stave width)
    const xPos = MARGIN + (measureInLine * STAVE_WIDTH) + (positionInMeasure * STAVE_WIDTH);
    return xPos;
  }, [isCurrentLine, currentMeasureIndex, lineStartMeasure, measures.length, positionInMeasure]);

  useEffect(() => {
    if (!containerRef.current || measures.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Use actual number of measures in this line, not max per line
    const lineWidth = measures.length * STAVE_WIDTH + MARGIN + RIGHT_PADDING;
    const height = STAVE_HEIGHT;

    // Create renderer
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(lineWidth, height);

    const context = renderer.getContext();
    context.setFont('Arial', 10);

    // Draw each measure in this line
    let xOffset = MARGIN;

    measures.forEach((measureNotes, measureOffsetInLine) => {
      const globalMeasureIndex = lineStartMeasure + measureOffsetInLine;

      // Create stave - use slightly smaller width to avoid cutoff
      const staveDrawWidth = STAVE_WIDTH - 15;
      const stave = new Stave(xOffset, 20, staveDrawWidth);

      // Add clef only for first measure of first line
      if (lineIndex === 0 && measureOffsetInLine === 0) {
        stave.addClef('treble');
        stave.addTimeSignature(`${timeSignature.numerator}/${timeSignature.denominator}`);
      }

      stave.setContext(context).draw();

      // Create notes for this measure
      if (measureNotes.length > 0) {
        const staveNotes = measureNotes.slice(0, 8).map((note) => {
          const vexNote = midiToVexFlow(note.midi);
          const duration =
            note.duration < 0.25 ? '16' : note.duration < 0.5 ? '8' : note.duration < 1 ? 'q' : 'h';

          const staveNote = new StaveNote({
            keys: [vexNote.key],
            duration: duration,
            auto_stem: true,
          });

          if (vexNote.accidental) {
            staveNote.addModifier(new Accidental(vexNote.accidental));
          }

          // Highlight current note
          const isCurrentNote =
            globalMeasureIndex === currentMeasureIndex &&
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
            beat_value: timeSignature.denominator,
          }).setStrict(false);

          voice.addTickables(staveNotes);

          new Formatter().joinVoices([voice]).format([voice], staveDrawWidth - 50);

          voice.draw(context, stave);
        } catch {
          // If formatting fails, skip this measure
          console.warn(`Error rendering measure ${globalMeasureIndex}`);
        }
      }

      xOffset += STAVE_WIDTH;
    });
  }, [measures, lineIndex, measuresPerLine, timeSignature, currentMeasureIndex, currentTime, isPlaying, lineStartMeasure]);

  return (
    <div className={`notation-line ${isCurrentLine ? 'current' : ''}`}>
      <div className="notation-line-header">
        Compás {lineStartMeasure + 1} - {lineStartMeasure + measures.length}
      </div>
      <div className="notation-line-content">
        {/* Playhead cursor */}
        {playheadPosition !== null && isPlaying && (
          <div
            className="notation-playhead"
            style={{ left: `${playheadPosition}px` }}
          />
        )}
        <div
          ref={containerRef}
          style={{
            minHeight: STAVE_HEIGHT,
            background: '#ffffff',
          }}
        />
      </div>
    </div>
  );
}

export default NotationView;
