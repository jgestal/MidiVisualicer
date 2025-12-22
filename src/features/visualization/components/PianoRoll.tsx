/**
 * Piano Roll View - Componente refactorizado
 * Visualización interactiva de notas MIDI con scroll anticipado
 */
import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { MidiNote } from '@/shared/types/midi';
import './PianoRoll.css';

// Configuración
const CONFIG = {
  NOTE_HEIGHT: 6,
  PIXELS_PER_SECOND: 80,
  PLAYHEAD_COLOR: '#6366f1',
  LEFT_MARGIN: 30,
  LOOKAHEAD_FACTOR: 0.3,
  LERP_FACTOR: 0.1,
};

export interface PianoRollProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  loopStart?: number | null;
  loopEnd?: number | null;
  onSetLoopStart?: (time: number) => void;
  onSetLoopEnd?: (time: number) => void;
  onSeek?: (time: number) => void;
  showHeader?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * Hook para calcular el rango de notas MIDI
 */
function useNoteRange(notes: MidiNote[]) {
  return useMemo(() => {
    if (notes.length === 0) return { min: 48, max: 84 };
    const midiNotes = notes.map((n) => n.midi);
    return {
      min: Math.min(...midiNotes) - 2,
      max: Math.max(...midiNotes) + 2,
    };
  }, [notes]);
}

export function PianoRoll({
  notes,
  currentTime,
  isPlaying,
  duration,
  loopStart = null,
  loopEnd = null,
  onSetLoopStart,
  onSetLoopEnd,
  onSeek,
  showHeader = true,
  minHeight = 150,
  maxHeight = 250,
}: PianoRollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const noteRange = useNoteRange(notes);

  // Dimensiones calculadas
  const height = (noteRange.max - noteRange.min + 1) * CONFIG.NOTE_HEIGHT + 30;
  const width = Math.max(800, duration * CONFIG.PIXELS_PER_SECOND + 100);

  // Función de dibujo optimizada
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obtener colores del CSS para tema
    const rootStyle = getComputedStyle(document.documentElement);
    const bgPrimary = rootStyle.getPropertyValue('--color-bg-primary').trim() || '#0a0a0f';
    const bgSecondary = rootStyle.getPropertyValue('--color-bg-secondary').trim() || '#12121a';
    const bgTertiary = rootStyle.getPropertyValue('--color-bg-tertiary').trim() || '#1a1a25';
    const textMuted = rootStyle.getPropertyValue('--color-text-muted').trim() || '#64748b';

    // Limpiar con color del tema
    ctx.fillStyle = bgPrimary;
    ctx.fillRect(0, 0, width, height);

    // Grid de notas
    for (let midi = noteRange.min; midi <= noteRange.max; midi++) {
      const y = (noteRange.max - midi) * CONFIG.NOTE_HEIGHT + 15;
      const isBlackKey = [1, 3, 6, 8, 10].includes(midi % 12);

      ctx.fillStyle = isBlackKey ? bgSecondary : bgTertiary;
      ctx.fillRect(0, y, width, CONFIG.NOTE_HEIGHT);

      // Etiqueta de octava
      if (midi % 12 === 0) {
        ctx.fillStyle = textMuted;
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 2, y + CONFIG.NOTE_HEIGHT - 1);
      }
    }

    // Marcadores de tiempo
    for (let t = 0; t <= duration; t += 2) {
      const x = t * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = textMuted;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`${t}s`, x + 2, 10);
    }

    // Región de loop
    if (loopStart !== null && loopEnd !== null) {
      const loopX1 = loopStart * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;
      const loopX2 = loopEnd * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;

      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.fillRect(loopX1, 0, loopX2 - loopX1, height);

      ctx.strokeStyle = CONFIG.PLAYHEAD_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(loopX1, 0);
      ctx.lineTo(loopX1, height);
      ctx.moveTo(loopX2, 0);
      ctx.lineTo(loopX2, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dibujar notas
    notes.forEach((note) => {
      const x = note.time * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;
      const y = (noteRange.max - note.midi) * CONFIG.NOTE_HEIGHT + 15;
      const noteWidth = Math.max(3, note.duration * CONFIG.PIXELS_PER_SECOND);

      const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;
      const hue = (note.midi * 7) % 360;

      // Resplandor para nota activa
      if (isActive) {
        ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = isActive ? `hsl(${hue}, 80%, 65%)` : `hsl(${hue}, 50%, 40%)`;

      ctx.beginPath();
      ctx.roundRect(x, y + 1, noteWidth, CONFIG.NOTE_HEIGHT - 2, 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    // Playhead
    const playheadX = currentTime * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;
    ctx.strokeStyle = CONFIG.PLAYHEAD_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Triángulo indicador
    ctx.fillStyle = CONFIG.PLAYHEAD_COLOR;
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();
  }, [notes, currentTime, duration, noteRange, loopStart, loopEnd, width, height]);

  // Dibujar cuando cambien los datos
  useEffect(() => {
    draw();
  }, [draw]);

  // Scroll anticipado suave con lerp
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;

    const container = containerRef.current;
    const playheadX = currentTime * CONFIG.PIXELS_PER_SECOND + CONFIG.LEFT_MARGIN;
    const containerWidth = container.clientWidth;

    const targetScrollLeft = playheadX - containerWidth * CONFIG.LOOKAHEAD_FACTOR;
    const currentScroll = container.scrollLeft;
    const diff = targetScrollLeft - currentScroll;

    if (Math.abs(diff) > 5) {
      container.scrollLeft = Math.max(0, currentScroll + diff * CONFIG.LERP_FACTOR);
    }
  });

  // Click handler
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scrollLeft = containerRef.current?.scrollLeft || 0;
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, (x - CONFIG.LEFT_MARGIN) / CONFIG.PIXELS_PER_SECOND);

      if (e.shiftKey && onSetLoopEnd) {
        onSetLoopEnd(time);
      } else if ((e.altKey || e.ctrlKey) && onSetLoopStart) {
        onSetLoopStart(time);
      } else if (onSeek) {
        onSeek(time);
      }
    },
    [onSeek, onSetLoopStart, onSetLoopEnd]
  );

  const clampedHeight = Math.min(Math.max(height + 10, minHeight), maxHeight);

  return (
    <div className="piano-roll">
      {showHeader && (
        <div className="piano-roll-header">
          <span className="piano-roll-title">🎹 Piano Roll</span>
          <span className="piano-roll-hint">
            Click: Ir | Ctrl+Click: Loop A | Shift+Click: Loop B
          </span>
        </div>
      )}
      <div ref={containerRef} className="piano-roll-scroll" style={{ height: clampedHeight }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
          className="piano-roll-canvas"
        />
      </div>
    </div>
  );
}

export default PianoRoll;
