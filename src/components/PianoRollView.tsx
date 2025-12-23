/**
 * Piano Roll View Component - Refactored Version
 * Uses custom hooks for canvas rendering and scroll/interaction
 */
import { useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePianoRollCanvas } from '../hooks/usePianoRollCanvas';
import { usePianoRollScroll } from '../hooks/usePianoRollScroll';
import type { MidiNote } from '../types/midi';
import './PianoRollView.css';

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
  onToggle?: () => void;
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas rendering logic
  const { height, width, draw, pixelsPerSecond, leftMargin } = usePianoRollCanvas({
    notes,
    currentTime,
    duration,
    loopStart,
    loopEnd,
  });

  // Scroll and interaction logic
  const {
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = usePianoRollScroll({
    currentTime,
    isPlaying,
    duration,
    pixelsPerSecond,
    leftMargin,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
  });

  // Draw when data changes
  useEffect(() => {
    draw(canvasRef.current);
  }, [draw]);

  return (
    <div className="piano-roll-container">
      {/* Toggle Header */}
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

export default PianoRollView;
