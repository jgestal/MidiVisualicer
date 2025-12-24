/**
 * Utility for detecting musical chords from a set of MIDI notes
 */

// Note names for reference
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord patterns (intervals relative to root)
const CHORD_PATTERNS: Record<string, number[]> = {
  '': [0, 4, 7],           // Major
  'm': [0, 3, 7],          // Minor
  '7': [0, 4, 7, 10],      // Dominant 7th
  'maj7': [0, 4, 7, 11],   // Major 7th
  'm7': [0, 3, 7, 10],     // Minor 7th
  'dim': [0, 3, 6],        // Diminished
  'aug': [0, 4, 8],        // Augmented
  'sus4': [0, 5, 7],       // Suspended 4th
  'sus2': [0, 2, 7],       // Suspended 2th
  '6': [0, 4, 7, 9],       // Major 6th
  'm6': [0, 3, 7, 9],      // Minor 6th
  '9': [0, 4, 7, 10, 14],  // Dominant 9th
  'add9': [0, 4, 7, 14],   // Add 9
};

/**
 * Detects the chord name from a list of MIDI note values
 */
export function detectChord(midiNotes: number[]): string | null {
  if (midiNotes.length < 3) return null;

  // 1. Normalize notes: remove octaves and duplicates, sort
  const uniqueNotes = Array.from(new Set(midiNotes.map(n => n % 12))).sort((a, b) => a - b);

  if (uniqueNotes.length < 3) return null;

  // 2. Try each note as a potential root
  for (const root of uniqueNotes) {
    // Calculate intervals relative to this root
    const intervals = uniqueNotes.map(n => (n - root + 12) % 12).sort((a, b) => a - b);

    // Match against patterns
    for (const [suffix, pattern] of Object.entries(CHORD_PATTERNS)) {
      // Check if all pattern notes are in our intervals
      // (We allow extra notes like extensions, but the core must match)
      const isMatch = pattern.every(p => intervals.includes(p % 12));

      if (isMatch) {
        return `${NOTE_NAMES[root % 12]}${suffix}`;
      }
    }
  }

  return null;
}
