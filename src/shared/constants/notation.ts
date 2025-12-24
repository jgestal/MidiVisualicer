/**
 * Notation View Constants
 * Centralized configuration for OSMD sheet music rendering
 */

/** Default tempo when not specified in MIDI */
export const DEFAULT_TEMPO = 120;

/** Maximum notes to process for MusicXML (performance limit) */
export const MAX_NOTES_FOR_MUSICXML = 500;

/** Scroll throttle interval in milliseconds */
export const SCROLL_THROTTLE_MS = 200;

/** Cursor color for OSMD */
export const CURSOR_COLOR = '#ef4444';

/** MIDI note ranges for clef selection */
export const CLEF_THRESHOLDS = {
  /** Notes below this average use bass clef */
  BASS_CLEF: 55,
  /** Notes below this use bass clef with 8vb */
  BASS_8VB: 48,
  /** Notes above this use treble clef with 8va */
  TREBLE_8VA: 84,
} as const;

/** Default time signature */
export const DEFAULT_TIME_SIGNATURE = {
  beats: 4,
  beatType: 4,
} as const;

/** MusicXML divisions per quarter note */
export const DIVISIONS_PER_QUARTER = 4;
