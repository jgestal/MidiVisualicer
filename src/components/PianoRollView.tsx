/**
 * Componente Piano Roll View - VERSIÓN OPTIMIZADA
 * Click interactivo para seek + loop markers
 * Toggle arrow para ocultar/mostrar
 */
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import type { MidiNote } from '../types/midi';

interface PianoRollViewProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  loopStart: number | null;
  loopEnd: number | null;
  onSetLoopStart: (time: number) => void;
  onSetLoopEnd: (time: number) => void;
  onSeek?: (time: number) => void;
  // Toggle visibility
  onToggle?: () => void;
}

const NOTE_HEIGHT = 6;
const PIXELS_PER_SECOND = 80;
const PLAYHEAD_COLOR = '#6366f1';
const LEFT_MARGIN = 30;

export function PianoRollView({
  notes,
  currentTime,
  isPlaying,
  duration,
  loopStart,
  loopEnd,
  onSetLoopStart,
  onSetLoopEnd,
  onSeek,
  onToggle,
}: PianoRollViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calcular rango de notas
  const noteRange = useMemo(() => {
    if (notes.length === 0) return { min: 48, max: 84 };
    const midiNotes = notes.map((n) => n.midi);
    return {
      min: Math.min(...midiNotes) - 2,
      max: Math.max(...midiNotes) + 2,
    };
  }, [notes]);

  const height = (noteRange.max - noteRange.min + 1) * NOTE_HEIGHT + 30;
  const width = Math.max(800, duration * PIXELS_PER_SECOND + 100);

  // Función de dibujo
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Grid de notas
    for (let midi = noteRange.min; midi <= noteRange.max; midi++) {
      const y = (noteRange.max - midi) * NOTE_HEIGHT + 15;
      const isBlackKey = [1, 3, 6, 8, 10].includes(midi % 12);

      ctx.fillStyle = isBlackKey ? '#15151f' : '#1a1a25';
      ctx.fillRect(0, y, width, NOTE_HEIGHT);

      if (midi % 12 === 0) {
        ctx.fillStyle = '#b0b0c0';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 2, y + NOTE_HEIGHT - 1);
      }
    }

    // Marcadores de tiempo
    for (let t = 0; t <= duration; t += 2) {
      const x = t * PIXELS_PER_SECOND + LEFT_MARGIN;
      ctx.strokeStyle = '#2a2a3a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Etiqueta de tiempo
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`${t}s`, x + 2, 10);
    }

    // Región de loop
    if (loopStart !== null && loopEnd !== null) {
      const loopX1 = loopStart * PIXELS_PER_SECOND + LEFT_MARGIN;
      const loopX2 = loopEnd * PIXELS_PER_SECOND + LEFT_MARGIN;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.fillRect(loopX1, 0, loopX2 - loopX1, height);

      // Líneas de loop
      ctx.strokeStyle = '#6366f1';
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
      const x = note.time * PIXELS_PER_SECOND + LEFT_MARGIN;
      const y = (noteRange.max - note.midi) * NOTE_HEIGHT + 15;
      const noteWidth = Math.max(3, note.duration * PIXELS_PER_SECOND);

      const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;
      const hue = (note.midi * 7) % 360;

      // Resplandor para nota activa
      if (isActive) {
        ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = isActive ? `hsl(${hue}, 80%, 65%)` : `hsl(${hue}, 50%, 40%)`;

      ctx.beginPath();
      ctx.roundRect(x, y + 1, noteWidth, NOTE_HEIGHT - 2, 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    // Playhead
    const playheadX = currentTime * PIXELS_PER_SECOND + LEFT_MARGIN;
    ctx.strokeStyle = PLAYHEAD_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Triángulo indicador
    ctx.fillStyle = PLAYHEAD_COLOR;
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

  // Scroll anticipado suave con interpolación (lerp) durante reproducción
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;

    const container = containerRef.current;
    const playheadX = currentTime * PIXELS_PER_SECOND + LEFT_MARGIN;
    const containerWidth = container.clientWidth;

    // Queremos el playhead al 30% desde la izquierda
    const targetScrollLeft = playheadX - containerWidth * 0.3;

    // Interpolar suavemente (lerp) - movimiento continuo sin saltos
    const currentScroll = container.scrollLeft;
    const diff = targetScrollLeft - currentScroll;

    if (Math.abs(diff) > 5) {
      // Factor de suavizado: 0.08 = muy suave, 0.2 = más rápido
      const newScroll = currentScroll + diff * 0.1;
      container.scrollLeft = Math.max(0, newScroll);
    }
  });

  // Scroll animado al hacer seek (cuando NO está reproduciendo)
  const lastSeekTimeRef = useRef(currentTime);
  useEffect(() => {
    // Detectar si hubo un salto grande en el tiempo (seek manual)
    const timeDiff = Math.abs(currentTime - lastSeekTimeRef.current);
    lastSeekTimeRef.current = currentTime;

    // Si está reproduciendo, el otro efecto se encarga
    // Solo activar si hay un salto > 0.5s (seek) y no estamos reproduciendo
    if (isPlaying || timeDiff < 0.5) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const playheadX = currentTime * PIXELS_PER_SECOND + LEFT_MARGIN;
    const containerWidth = container.clientWidth;

    // Verificar si el playhead está fuera de la vista actual
    const viewStart = container.scrollLeft;
    const viewEnd = container.scrollLeft + containerWidth;
    const isVisible = playheadX >= viewStart + 50 && playheadX <= viewEnd - 50;

    if (!isVisible) {
      // Scroll suave animado al centro de la vista
      const targetScrollLeft = playheadX - containerWidth * 0.5;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
    }
  }, [currentTime, isPlaying]);

  // Drag state for panning
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Pointer down - start potential drag or seek
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Capture pointer for tracking
    canvas.setPointerCapture(e.pointerId);

    // Store drag state
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    scrollStartRef.current = container.scrollLeft;

    // Change cursor to grabbing
    canvas.style.cursor = 'grabbing';
  }, []);

  // Pointer move - drag to scroll
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const deltaX = dragStartXRef.current - e.clientX;

    // Only consider it a drag if moved more than 5px (avoid accidental drags on click)
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }

    if (hasDraggedRef.current) {
      // Pan the scroll position
      container.scrollLeft = scrollStartRef.current + deltaX;
    }
  }, []);

  // Pointer up - end drag or perform seek/loop action
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Release pointer capture
    canvas.releasePointerCapture(e.pointerId);
    canvas.style.cursor = 'grab';
    isDraggingRef.current = false;

    // If we didn't drag, it's a click - perform seek or loop action
    if (!hasDraggedRef.current) {
      const rect = canvas.getBoundingClientRect();
      const scrollLeft = containerRef.current?.scrollLeft || 0;
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, Math.min(duration, (x - LEFT_MARGIN) / PIXELS_PER_SECOND));

      if (e.shiftKey) {
        onSetLoopEnd(time);
      } else if (e.altKey || e.ctrlKey) {
        onSetLoopStart(time);
      } else if (onSeek) {
        onSeek(time);
      }
    }
  }, [duration, onSeek, onSetLoopStart, onSetLoopEnd]);

  return (
    <div className="piano-roll-container">
      {/* Toggle Header - Full width like BottomTracksPanel */}
      <button
        className="piano-roll-toggle-header"
        onClick={onToggle}
        title="Ocultar Piano Roll"
      >
        <span className="piano-roll-title">🎹 Piano Roll</span>
        <span className="piano-roll-hint">
          Arrastrar: Desplazar | Click: Ir a posición | Ctrl+Click: Loop A | Shift+Click: Loop B
        </span>
        {onToggle && <ChevronUp size={14} />}
      </button>

      {/* Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="piano-roll-scroll"
        style={{ height: Math.min(height + 10, 250) }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: 'grab', touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

// Estilos
const styles = `
.piano-roll-container {
  background: var(--color-bg-secondary);
  border-radius: 0;
  overflow: hidden;
}

.piano-roll-toggle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  background: var(--color-bg-tertiary);
  border: none;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
}

.piano-roll-toggle-header:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.piano-roll-title {
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  font-size: 12px;
}

.piano-roll-hint {
  font-size: 10px;
  color: var(--color-text-muted);
  flex: 1;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
}

.piano-roll-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px;
}

.piano-roll-scroll canvas {
  display: block;
}
`;

if (typeof document !== 'undefined') {
  const id = 'piano-roll-styles-v2';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = styles;
    document.head.appendChild(s);
  }
}

export default PianoRollView;
