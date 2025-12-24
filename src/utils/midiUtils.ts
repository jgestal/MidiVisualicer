/**
 * Shared MIDI utility functions
 * Centralized helpers for MIDI note calculations
 */

/**
 * Get the octave number from a MIDI note number
 * MIDI note 60 = C4 (Middle C)
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Octave number (-1 to 9)
 */
export function midiToOctave(midiNote: number): number {
  return Math.floor(midiNote / 12) - 1;
}

/**
 * Get the note name within an octave from a MIDI note number
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Note index within octave (0-11, where 0=C, 1=C#, etc.)
 */
export function midiNoteIndex(midiNote: number): number {
  return midiNote % 12;
}

/**
 * Check if a MIDI note is a black key (sharp/flat)
 */
export function isBlackKey(midiNote: number): boolean {
  const noteIndex = midiNote % 12;
  // Black keys: C#, D#, F#, G#, A# (indices 1, 3, 6, 8, 10)
  return [1, 3, 6, 8, 10].includes(noteIndex);
}

/**
 * Note names in order (using sharps)
 */
export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/**
 * Get the full note name with octave from a MIDI note number
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name with octave (e.g., "C4", "F#5")
 */
export function midiToNoteName(midiNote: number): string {
  const octave = midiToOctave(midiNote);
  const noteIndex = midiNoteIndex(midiNote);
  return `${NOTE_NAMES_SHARP[noteIndex]}${octave}`;
}
