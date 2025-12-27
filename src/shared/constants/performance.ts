/**
 * Performance Constants
 * 
 * @description Centralized constants for performance-related settings.
 * All magic numbers for throttling, virtualization, and timing should be here.
 */

// ============================================
// Throttling & Debouncing
// ============================================

/** How often to update time display during playback (ms) - 30fps is smooth enough */
export const TIME_UPDATE_THROTTLE_MS = 33;

/** How often to check for active notes during playback (ms) */
export const ACTIVE_NOTES_THROTTLE_MS = 50;

/** Scroll event throttle (ms) */
export const SCROLL_THROTTLE_MS = 100;

/** Resize observer debounce (ms) */
export const RESIZE_DEBOUNCE_MS = 100;

// ============================================
// Virtualization
// ============================================

/** Number of lines to render above visible area */
export const VIRTUALIZATION_LINES_BEFORE = 1;

/** Number of lines to render below visible area */
export const VIRTUALIZATION_LINES_AFTER = 3;

/** Default overscan count for list virtualization */
export const VIRTUALIZATION_OVERSCAN = 3;

/** Minimum items to virtualize (below this, render all) */
export const VIRTUALIZATION_MIN_ITEMS = 20;

// ============================================
// Audio Scheduling
// ============================================

/** Tone.js lookahead for scheduling (seconds) */
export const AUDIO_LOOKAHEAD_SECONDS = 0.2;

/** Maximum polyphony for PolySynth voices */
export const AUDIO_MAX_POLYPHONY = 128;

/** Envelope release time (seconds) - shorter frees voices faster */
export const AUDIO_ENVELOPE_RELEASE = 0.4;

/** Latency hint for Web Audio context */
export const AUDIO_LATENCY_HINT = 'playback' as const;

// ============================================
// Note Timing
// ============================================

/** Time tolerance for grouping simultaneous notes (seconds) */
export const SIMULTANEOUS_NOTE_TOLERANCE = 0.05;

/** Chord detection time threshold (seconds) */
export const CHORD_TIME_THRESHOLD = 0.1;

/** Minimum notes to form a chord */
export const CHORD_MIN_NOTES = 2;

/** Time window for binary search tolerance (ms) */
export const BINARY_SEARCH_TOLERANCE_MS = 10;

// ============================================
// Animation
// ============================================

/** Default animation duration (ms) */
export const ANIMATION_DURATION_MS = 200;

/** Smooth scroll behavior duration (ms) */
export const SMOOTH_SCROLL_DURATION_MS = 300;

/** Frame rate target for RAF loops */
export const TARGET_FPS = 60;

/** Calculated frame time from target FPS */
export const FRAME_TIME_MS = Math.round(1000 / TARGET_FPS);

// ============================================
// Tablature
// ============================================

/** Pause threshold to show separator (seconds) */
export const PAUSE_THRESHOLD_SECONDS = 0.5;

/** Default cells per line in tablature */
export const DEFAULT_CELLS_PER_LINE = 40;

/** Minimum cells per line */
export const MIN_CELLS_PER_LINE = 10;

// ============================================
// UI Limits
// ============================================

/** Maximum bookmarks per song */
export const MAX_BOOKMARKS_PER_SONG = 20;

/** Maximum recent files to remember */
export const MAX_RECENT_FILES = 10;

/** Maximum custom instruments */
export const MAX_CUSTOM_INSTRUMENTS = 20;

// ============================================
// Derived / Helper Constants
// ============================================

/** Milliseconds in one second */
export const MS_PER_SECOND = 1000;

/** Seconds in one minute */
export const SECONDS_PER_MINUTE = 60;

/** Standard MIDI ticks per quarter note */
export const MIDI_PPQ = 480;

export default {
  TIME_UPDATE_THROTTLE_MS,
  ACTIVE_NOTES_THROTTLE_MS,
  SCROLL_THROTTLE_MS,
  RESIZE_DEBOUNCE_MS,
  VIRTUALIZATION_LINES_BEFORE,
  VIRTUALIZATION_LINES_AFTER,
  VIRTUALIZATION_OVERSCAN,
  VIRTUALIZATION_MIN_ITEMS,
  AUDIO_LOOKAHEAD_SECONDS,
  AUDIO_MAX_POLYPHONY,
  AUDIO_ENVELOPE_RELEASE,
  AUDIO_LATENCY_HINT,
  SIMULTANEOUS_NOTE_TOLERANCE,
  CHORD_TIME_THRESHOLD,
  CHORD_MIN_NOTES,
  BINARY_SEARCH_TOLERANCE_MS,
  ANIMATION_DURATION_MS,
  SMOOTH_SCROLL_DURATION_MS,
  TARGET_FPS,
  FRAME_TIME_MS,
  PAUSE_THRESHOLD_SECONDS,
  DEFAULT_CELLS_PER_LINE,
  MIN_CELLS_PER_LINE,
  MAX_BOOKMARKS_PER_SONG,
  MAX_RECENT_FILES,
  MAX_CUSTOM_INSTRUMENTS,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
  MIDI_PPQ,
};
