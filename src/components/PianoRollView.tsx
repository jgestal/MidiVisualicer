/**
 * Piano Roll View Component
 * 
 * @description Visualizes MIDI notes on a piano roll grid with playhead,
 * loop regions, and interactive controls.
 * 
 * @responsibilities
 * - Renders notes on a canvas using RAF for smooth animation
 * - Handles scroll, seek, and loop interactions via usePianoRollScroll hook
 * - Supports transpose visualization
 * 
 * @architecture
 * - Rendering logic extracted to utils/pianoRollRenderer.ts (SRP)
 * - Colors from shared/constants/colors.ts (DRY)
 * - Layout constants centralized (no magic numbers)
 */
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

// Hooks
import { usePianoRollScroll } from '../hooks/usePianoRollScroll';

// Utils
import {
  PIANO_ROLL_CONFIG,
  clearCanvas,
  drawNoteGrid,
  drawTimeMarkers,
  drawLoopRegion,
  drawPlayhead,
  drawHoverMarker,
} from '../utils/pianoRollRenderer';

// Types
import type { MidiNote } from '../types/midi';

// Styles
import './PianoRollView.css';

// ============================================
// Types & Interfaces
// ============================================

interface PianoRollViewProps {
  /** Array of MIDI notes to display */
  notes: MidiNote[];
  /** Current playback time in seconds */
  currentTime: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Total duration of the track in seconds */
  duration: number;
  /** Loop start time (null if no loop) */
  loopStart: number | null;
  /** Loop end time (null if no loop) */
  loopEnd: number | null;
  /** Semitones to transpose notes for display */
  transpose?: number;
  /** Track identifier for caching purposes */
  trackId?: number | string;
  /** Callback when loop start is set */
  onSetLoopStart: (time: number) => void;
  /** Callback when loop end is set */
  onSetLoopEnd: (time: number) => void;
  /** Callback when user seeks to a time position */
  onSeek?: (time: number) => void;
  /** Callback when user toggles piano roll visibility */
  onToggle?: () => void;
}

interface NoteRange {
  min: number;
  max: number;
}

// ============================================
// Constants
// ============================================

/** Default note range when no notes are present */
const DEFAULT_NOTE_RANGE: NoteRange = { min: 48, max: 84 };

/** Minimum canvas width in pixels */
const MIN_CANVAS_WIDTH = 800;

/** Extra padding for canvas width calculation */
const CANVAS_WIDTH_PADDING = 100;

/** Maximum scroll container height */
const MAX_SCROLL_HEIGHT = 250;

/** Padding added to scroll container height */
const SCROLL_HEIGHT_PADDING = 10;

/** Extra note rows above/below actual notes */
const NOTE_RANGE_PADDING = 2;

// UI Text (could be moved to i18n)
const UI_TEXT = {
  title: '🎹 Piano Roll',
  toggleTitle: 'Ocultar Piano Roll',
  hint: 'Arrastrar: Desplazar | Click: Ir a posición | Ctrl+Click: Loop A | Shift+Click: Loop B',
} as const;

// ============================================
// Component
// ============================================

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
  // ========== Refs ==========
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // ========== Derived State ==========

  /**
   * Calculate the note range to display based on transposed notes
   * Adds padding above and below for visual context
   */
  const noteRange = useMemo((): NoteRange => {
    if (notes.length === 0) return DEFAULT_NOTE_RANGE;

    const transposedMidiNotes = notes.map((n) => n.midi + transpose);
    return {
      min: Math.min(...transposedMidiNotes) - NOTE_RANGE_PADDING,
      max: Math.max(...transposedMidiNotes) + NOTE_RANGE_PADDING,
    };
  }, [notes, transpose]);

  /**
   * Canvas dimensions based on note range and duration
   */
  const canvasDimensions = useMemo(() => {
    const { NOTE_HEIGHT, PIXELS_PER_SECOND, PADDING_TOP } = PIANO_ROLL_CONFIG;
    const noteCount = noteRange.max - noteRange.min + 1;

    return {
      height: noteCount * NOTE_HEIGHT + PADDING_TOP * 2,
      width: Math.max(MIN_CANVAS_WIDTH, duration * PIXELS_PER_SECOND + CANVAS_WIDTH_PADDING),
    };
  }, [noteRange, duration]);

  // ========== Scroll & Interaction Hook ==========
  const {
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    hoverInfoRef,
  } = usePianoRollScroll({
    currentTime,
    isPlaying,
    duration,
    pixelsPerSecond: PIANO_ROLL_CONFIG.PIXELS_PER_SECOND,
    leftMargin: PIANO_ROLL_CONFIG.LEFT_MARGIN,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
  });

  // ========== Drawing Logic ==========

  /**
   * Draw a single note with color based on activity state
   */
  const drawNote = useCallback((
    ctx: CanvasRenderingContext2D,
    note: MidiNote,
    transposeAmount: number,
    range: NoteRange,
    playTime: number
  ) => {
    const { NOTE_HEIGHT, PIXELS_PER_SECOND, LEFT_MARGIN, PADDING_TOP } = PIANO_ROLL_CONFIG;

    const transposedMidi = note.midi + transposeAmount;
    const x = note.time * PIXELS_PER_SECOND + LEFT_MARGIN;
    const y = (range.max - transposedMidi) * NOTE_HEIGHT + PADDING_TOP;
    const noteWidth = Math.max(6, note.duration * PIXELS_PER_SECOND);

    // Check if note is currently playing
    const isActive = playTime >= note.time && playTime <= note.time + note.duration;

    // Color based on note pitch (creates rainbow effect)
    const hue = (transposedMidi * 7) % 360;

    // Apply glow effect for active notes
    ctx.shadowBlur = isActive ? 12 : 0;
    ctx.shadowColor = isActive ? `hsl(${hue}, 100%, 70%)` : 'transparent';

    // Fill note rectangle
    ctx.fillStyle = isActive
      ? `hsl(${hue}, 90%, 65%)`
      : `hsl(${hue}, 75%, 55%)`;
    ctx.fillRect(x, y + 1, noteWidth, NOTE_HEIGHT - 2);

    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  /**
   * Main canvas drawing effect
   * Uses requestAnimationFrame for smooth rendering and debouncing
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel any pending draw to prevent double-rendering
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Capture values for RAF callback (avoid stale closures)
    const notesToDraw = notes;
    const currentTranspose = transpose;
    const currentNoteRange = noteRange;
    const { height, width } = canvasDimensions;
    const playTime = currentTime;

    // Flag to ignore obsolete renders
    let isCurrent = true;

    // Schedule draw on next animation frame
    rafIdRef.current = requestAnimationFrame(() => {
      if (!isCurrent) return;

      // 1. Clear canvas
      clearCanvas(ctx, width, height);

      // 2. Draw background grid (note rows)
      drawNoteGrid(ctx, currentNoteRange, width);

      // 3. Draw time markers
      drawTimeMarkers(ctx, duration, height);

      // 4. Draw loop region if active
      if (loopStart !== null && loopEnd !== null) {
        drawLoopRegion(ctx, loopStart, loopEnd, height);
      }

      // 5. Draw all notes
      notesToDraw.forEach((note) => {
        drawNote(ctx, note, currentTranspose, currentNoteRange, playTime);
      });

      // 6. Draw hover marker if Ctrl is pressed
      const hoverInfo = hoverInfoRef.current;
      if (hoverInfo.active && hoverInfo.isCtrl) {
        drawHoverMarker(ctx, hoverInfo.time, height);
      }

      // 7. Draw playhead (always on top)
      drawPlayhead(ctx, playTime, height);
    });

    // Cleanup: cancel RAF on unmount or dependency change
    return () => {
      isCurrent = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    notes,
    currentTime,
    duration,
    noteRange,
    loopStart,
    loopEnd,
    canvasDimensions,
    transpose,
    trackId,
    drawNote,
    hoverInfoRef,
  ]);

  // ========== Render ==========

  const scrollContainerHeight = Math.min(
    canvasDimensions.height + SCROLL_HEIGHT_PADDING,
    MAX_SCROLL_HEIGHT
  );

  return (
    <div className="piano-roll-container">
      {/* Toggle Header */}
      <button
        className="piano-roll-toggle-header"
        onClick={onToggle}
        title={UI_TEXT.toggleTitle}
        aria-label={UI_TEXT.toggleTitle}
      >
        <span className="piano-roll-title">
          {UI_TEXT.title}
          {onToggle && <ChevronUp size={14} aria-hidden="true" />}
        </span>
        <span className="piano-roll-hint">
          {UI_TEXT.hint}
        </span>
      </button>

      {/* Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="piano-roll-scroll"
        style={{ height: scrollContainerHeight }}
        role="img"
        aria-label="Piano roll visualization"
      >
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{ cursor: 'grab', touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

export default PianoRollView;
