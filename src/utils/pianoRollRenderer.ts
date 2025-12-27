/**
 * Piano Roll Canvas Rendering Utilities
 * 
 * Separated rendering logic following SRP (Single Responsibility Principle)
 * Each function handles one specific drawing task
 */
import { PIANO_ROLL, ACCENT_PRIMARY } from '../shared/constants/colors';
import { midiToOctave, isBlackKey as checkBlackKey } from './midiUtils';

// Layout constants (could be moved to shared/constants/layout.ts)
export const PIANO_ROLL_CONFIG = {
  NOTE_HEIGHT: 6,
  PIXELS_PER_SECOND: 80,
  LEFT_MARGIN: 30,
  PADDING_TOP: 15,
  FONT: '9px Inter, sans-serif',
  TIME_MARKER_INTERVAL: 2, // seconds
} as const;

/**
 * Clear the canvas with background color
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = PIANO_ROLL.BACKGROUND;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw the note grid (alternating black/white key rows)
 */
export function drawNoteGrid(
  ctx: CanvasRenderingContext2D,
  noteRange: { min: number; max: number },
  width: number
): void {
  const { NOTE_HEIGHT, PADDING_TOP, FONT } = PIANO_ROLL_CONFIG;

  for (let midi = noteRange.min; midi <= noteRange.max; midi++) {
    const y = (noteRange.max - midi) * NOTE_HEIGHT + PADDING_TOP;
    const isBlack = checkBlackKey(midi);

    ctx.fillStyle = isBlack ? PIANO_ROLL.BLACK_KEY_BG : PIANO_ROLL.WHITE_KEY_BG;
    ctx.fillRect(0, y, width, NOTE_HEIGHT);

    // C note labels
    if (midi % 12 === 0) {
      ctx.fillStyle = PIANO_ROLL.KEY_LABEL;
      ctx.font = FONT;
      ctx.fillText(`C${midiToOctave(midi)}`, 2, y + NOTE_HEIGHT - 1);
    }
  }
}

/**
 * Draw time markers (vertical lines every N seconds)
 */
export function drawTimeMarkers(
  ctx: CanvasRenderingContext2D,
  duration: number,
  height: number
): void {
  const { PIXELS_PER_SECOND, LEFT_MARGIN, TIME_MARKER_INTERVAL, FONT } = PIANO_ROLL_CONFIG;

  for (let t = 0; t <= duration; t += TIME_MARKER_INTERVAL) {
    const x = t * PIXELS_PER_SECOND + LEFT_MARGIN;

    ctx.strokeStyle = PIANO_ROLL.GRID_LINE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.fillStyle = PIANO_ROLL.NOTE_LABEL;
    ctx.font = FONT;
    ctx.fillText(`${t}s`, x + 2, 10);
  }
}

/**
 * Draw the loop region overlay and boundaries
 */
export function drawLoopRegion(
  ctx: CanvasRenderingContext2D,
  loopStart: number,
  loopEnd: number,
  height: number
): void {
  const { PIXELS_PER_SECOND, LEFT_MARGIN } = PIANO_ROLL_CONFIG;

  const loopX1 = loopStart * PIXELS_PER_SECOND + LEFT_MARGIN;
  const loopX2 = loopEnd * PIXELS_PER_SECOND + LEFT_MARGIN;

  // Fill region
  ctx.fillStyle = PIANO_ROLL.LOOP_REGION;
  ctx.fillRect(loopX1, 0, loopX2 - loopX1, height);

  // Dashed boundaries
  ctx.strokeStyle = ACCENT_PRIMARY;
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

/**
 * Draw a single note rectangle
 */
export function drawNote(
  ctx: CanvasRenderingContext2D,
  midi: number,
  time: number,
  noteDuration: number,
  noteRange: { min: number; max: number },
  color: string
): void {
  const { NOTE_HEIGHT, PIXELS_PER_SECOND, LEFT_MARGIN, PADDING_TOP } = PIANO_ROLL_CONFIG;

  const x = time * PIXELS_PER_SECOND + LEFT_MARGIN;
  const y = (noteRange.max - midi) * NOTE_HEIGHT + PADDING_TOP;
  const width = Math.max(2, noteDuration * PIXELS_PER_SECOND);

  ctx.fillStyle = color;
  ctx.fillRect(x, y + 1, width, NOTE_HEIGHT - 2);

  // Add subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y + 1, width, NOTE_HEIGHT - 2);
}

/**
 * Draw the playhead (current time indicator)
 */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  currentTime: number,
  height: number
): void {
  const { PIXELS_PER_SECOND, LEFT_MARGIN } = PIANO_ROLL_CONFIG;

  const playheadX = currentTime * PIXELS_PER_SECOND + LEFT_MARGIN;

  // Vertical line
  ctx.strokeStyle = PIANO_ROLL.PLAYHEAD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();

  // Triangle marker at top
  ctx.fillStyle = PIANO_ROLL.PLAYHEAD;
  ctx.beginPath();
  ctx.moveTo(playheadX - 6, 0);
  ctx.lineTo(playheadX + 6, 0);
  ctx.lineTo(playheadX, 10);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw hover feedback for loop/seek marker
 */
export function drawHoverMarker(
  ctx: CanvasRenderingContext2D,
  time: number,
  height: number
): void {
  const { PIXELS_PER_SECOND, LEFT_MARGIN } = PIANO_ROLL_CONFIG;

  const hoverX = time * PIXELS_PER_SECOND + LEFT_MARGIN;

  ctx.strokeStyle = PIANO_ROLL.LOOP_BOUNDARY;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(hoverX, 0);
  ctx.lineTo(hoverX, height);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Get note color based on whether it's currently playing
 */
export function getNoteColor(isActive: boolean): string {
  return isActive ? '#22c55e' : ACCENT_PRIMARY;
}
