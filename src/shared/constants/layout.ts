/**
 * Layout Constants
 * Centralized layout and sizing values
 */

// Piano Roll layout
export const PIANO_ROLL_LAYOUT = {
  NOTE_HEIGHT: 6,
  PIXELS_PER_SECOND: 80,
  LEFT_MARGIN: 30,
  PADDING_TOP: 15,
  FONT_SIZE: 9,
  FONT_FAMILY: 'Inter, sans-serif',
} as const;

// Tablature layout  
export const TABLATURE_LAYOUT = {
  CELL_WIDTH: 32,
  MARGIN_LEFT: 40,
  LINE_HEIGHT: 18,
  FRET_FONT_SIZE: 14,
  STRING_LABEL_WIDTH: 24,
} as const;

// Animation timings (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  SCROLL_THROTTLE: 100,
} as const;

// Playback defaults
export const PLAYBACK_DEFAULTS = {
  // Count-in
  COUNT_IN_MIN: 1,
  COUNT_IN_MAX: 10,
  COUNT_IN_DEFAULT: 3,

  // Speed Trainer
  SPEED_TRAINER_START: 0.5,
  SPEED_TRAINER_END: 1.5,
  SPEED_TRAINER_INCREMENT: 0.05,

  // Pause detection
  PAUSE_THRESHOLD_SECONDS: 0.5,

  // Chord detection
  CHORD_TIME_TOLERANCE: 0.05,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 100,
  MODAL_OVERLAY: 1000,
  MODAL: 1001,
  TOOLTIP: 2000,
} as const;
