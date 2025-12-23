/**
 * Tablature View Constants
 * Centralized configuration for tablature rendering
 */

/** Time quantization for note grouping (in seconds) */
export const TIME_QUANTUM = 0.15;

/** Width of each cell in pixels */
export const CELL_WIDTH = 28;

/** Left margin for string labels in pixels */
export const MARGIN_LEFT = 30;

/** Number of slots considered a pause (gaps > this get a pause marker) */
export const PAUSE_THRESHOLD = 3;

/** Notes per bar (for export formatting) */
export const NOTES_PER_BAR = 4;

/** Notes per line in text export */
export const NOTES_PER_LINE = 20;

/** Time tolerance for chord detection (in seconds) */
export const CHORD_TIME_TOLERANCE = 0.05;
