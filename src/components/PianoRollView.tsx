/**
 * Piano Roll View Component
 * Canvas drawing with RAF debouncing to prevent double-draw issues
 */
import { useRef, useEffect, useMemo } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePianoRollScroll } from '../hooks/usePianoRollScroll';
import type { MidiNote } from '../types/midi';
import './PianoRollView.css';

// Constants
const NOTE_HEIGHT = 6;
const PIXELS_PER_SECOND = 80;
const PLAYHEAD_COLOR = '#6366f1';
const LEFT_MARGIN = 30;

interface PianoRollViewProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  loopStart: number | null;
  loopEnd: number | null;
  transpose?: number;
  trackId?: number | string;
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
  transpose = 0,
  trackId = 'default',
  onSetLoopStart,
  onSetLoopEnd,
  onSeek,
  onToggle,
}: PianoRollViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Calculate note range with transpose
  const noteRange = useMemo(() => {
    if (notes.length === 0) return { min: 48, max: 84 };
    const transposedMidiNotes = notes.map((n) => n.midi + transpose);
    return {
      min: Math.min(...transposedMidiNotes) - 2,
      max: Math.max(...transposedMidiNotes) + 2,
    };
  }, [notes, transpose]);

  // Calculate dimensions
  const height = (noteRange.max - noteRange.min + 1) * NOTE_HEIGHT + 30;
  const width = Math.max(800, duration * PIXELS_PER_SECOND + 100);

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
    pixelsPerSecond: PIXELS_PER_SECOND,
    leftMargin: LEFT_MARGIN,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
  });

  // Draw canvas using RAF to coalesce multiple updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel any pending draw to avoid double-draws
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Capture current values to avoid stale closures in RAF callback
    const notesToDraw = notes;
    const currentTranspose = transpose;
    const currentNoteRange = noteRange;
    const currentHeight = height;
    const currentWidth = width;
    const playTime = currentTime;

    // Flag to ignore this render if a new one starts
    let isCurrent = true;

    // Schedule draw on next animation frame
    rafIdRef.current = requestAnimationFrame(() => {
      if (!isCurrent) return;
      console.log(`[PianoRoll] Drawing track ${trackId}:`, notesToDraw.length, 'notes');

      // Clear canvas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, currentWidth, currentHeight);

      // Draw note grid
      for (let midi = currentNoteRange.min; midi <= currentNoteRange.max; midi++) {
        const y = (currentNoteRange.max - midi) * NOTE_HEIGHT + 15;
        const isBlackKey = [1, 3, 6, 8, 10].includes(midi % 12);

        ctx.fillStyle = isBlackKey ? '#15151f' : '#1a1a25';
        ctx.fillRect(0, y, currentWidth, NOTE_HEIGHT);

        // C note labels
        if (midi % 12 === 0) {
          ctx.fillStyle = '#b0b0c0';
          ctx.font = '9px Inter, sans-serif';
          ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 2, y + NOTE_HEIGHT - 1);
        }
      }

      // Draw time markers
      for (let t = 0; t <= duration; t += 2) {
        const x = t * PIXELS_PER_SECOND + LEFT_MARGIN;
        ctx.strokeStyle = '#2a2a3a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, currentHeight);
        ctx.stroke();

        ctx.fillStyle = '#a0a0b0';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(`${t}s`, x + 2, 10);
      }

      // Draw loop region
      if (loopStart !== null && loopEnd !== null) {
        const loopX1 = loopStart * PIXELS_PER_SECOND + LEFT_MARGIN;
        const loopX2 = loopEnd * PIXELS_PER_SECOND + LEFT_MARGIN;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(loopX1, 0, loopX2 - loopX1, currentHeight);

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(loopX1, 0);
        ctx.lineTo(loopX1, currentHeight);
        ctx.moveTo(loopX2, 0);
        ctx.lineTo(loopX2, currentHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw notes
      notesToDraw.forEach((note) => {
        const transposedMidi = note.midi + currentTranspose;
        const x = note.time * PIXELS_PER_SECOND + LEFT_MARGIN;
        const y = (currentNoteRange.max - transposedMidi) * NOTE_HEIGHT + 15;
        const noteWidth = Math.max(6, note.duration * PIXELS_PER_SECOND);

        const isActive = playTime >= note.time && playTime <= note.time + note.duration;
        const hue = (transposedMidi * 7) % 360;

        ctx.shadowBlur = 0;
        if (isActive) {
          ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = isActive
          ? `hsl(${hue}, 90%, 65%)`
          : `hsl(${hue}, 75%, 55%)`;

        ctx.fillRect(x, y + 1, noteWidth, NOTE_HEIGHT - 2);
        ctx.shadowBlur = 0;
      });

      // Draw playhead
      const playheadX = playTime * PIXELS_PER_SECOND + LEFT_MARGIN;
      ctx.strokeStyle = PLAYHEAD_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, currentHeight);
      ctx.stroke();

      // Playhead triangle
      ctx.fillStyle = PLAYHEAD_COLOR;
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 10);
      ctx.closePath();
      ctx.fill();
    });

    // Cleanup: cancel RAF on unmount or dependency change
    return () => {
      isCurrent = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [notes, currentTime, duration, noteRange, loopStart, loopEnd, width, height, transpose, trackId]);

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
