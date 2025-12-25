/**
 * Simplify Notes Utility
 * 
 * Provides functionality to simplify MIDI tracks for easier playability:
 * - Keeps only the highest note when multiple notes play simultaneously
 * - Optimizes fret positions to minimize hand movement on the fretboard
 * - Transposes notes intelligently to stay within comfortable playing range
 */

import type { MidiNote } from '@/shared/types/midi';
import type { InstrumentConfig } from '@/config/instruments';

// Time tolerance for grouping simultaneous notes (in seconds)
const SIMULTANEOUS_TOLERANCE = 0.05; // 50ms

/**
 * Groups notes that occur at the same time (within tolerance)
 */
function groupSimultaneousNotes(notes: MidiNote[]): MidiNote[][] {
  if (notes.length === 0) return [];

  const sorted = [...notes].sort((a, b) => a.time - b.time);
  const groups: MidiNote[][] = [];
  let currentGroup: MidiNote[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const note = sorted[i];
    const lastNote = currentGroup[currentGroup.length - 1];

    if (Math.abs(note.time - lastNote.time) <= SIMULTANEOUS_TOLERANCE) {
      currentGroup.push(note);
    } else {
      groups.push(currentGroup);
      currentGroup = [note];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Keeps only the highest pitched note from a group of simultaneous notes
 */
function keepHighestNote(group: MidiNote[]): MidiNote {
  return group.reduce((highest, note) =>
    note.midi > highest.midi ? note : highest
  );
}

/**
 * Calculates the optimal fret position for a note on a given instrument
 * Returns the string and fret that minimizes distance from the current position
 */
function findOptimalPosition(
  midiNote: number,
  instrument: InstrumentConfig,
  currentFret: number = 5 // Start around middle of the neck
): { stringIndex: number; fret: number } | null {
  // Use the instrument's midiNotes array directly (already MIDI numbers)
  const stringMidis = instrument.midiNotes;

  let bestPosition: { stringIndex: number; fret: number } | null = null;
  let minDistance = Infinity;

  for (let stringIndex = 0; stringIndex < stringMidis.length; stringIndex++) {
    const openStringMidi = stringMidis[stringIndex];
    const fret = midiNote - openStringMidi;

    // Check if this fret is valid for the instrument
    if (fret >= 0 && fret <= instrument.frets) {
      const distance = Math.abs(fret - currentFret);

      // Prefer positions that are closer to current hand position
      // Also slightly prefer higher strings (lower index) for melody
      const adjustedDistance = distance + stringIndex * 0.1;

      if (adjustedDistance < minDistance) {
        minDistance = adjustedDistance;
        bestPosition = { stringIndex, fret };
      }
    }
  }

  return bestPosition;
}

/**
 * Simplifies a track by keeping only the highest note at each time point
 * and ensuring all notes are within the instrument's range
 */
export function simplifyNotes(
  notes: MidiNote[],
  instrument?: InstrumentConfig
): MidiNote[] {
  if (notes.length === 0) return [];

  // Group simultaneous notes
  const groups = groupSimultaneousNotes(notes);

  // Keep only the highest note from each group
  const simplifiedNotes = groups.map(group => keepHighestNote(group));

  // If no instrument provided, just return the simplified notes
  if (!instrument) {
    return simplifiedNotes;
  }

  // Calculate instrument range using midiNotes array
  const stringMidis = instrument.midiNotes;

  const lowestNote = Math.min(...stringMidis);
  const highestNote = Math.max(...stringMidis) + instrument.frets;

  // Optimize fret positions to minimize hand movement
  let currentFret = 5; // Start at middle position
  const optimizedNotes: MidiNote[] = [];

  for (const note of simplifiedNotes) {
    let adjustedMidi = note.midi;

    // Transpose if out of range
    while (adjustedMidi < lowestNote) {
      adjustedMidi += 12; // Transpose up an octave
    }
    while (adjustedMidi > highestNote) {
      adjustedMidi -= 12; // Transpose down an octave
    }

    // Find optimal position
    const position = findOptimalPosition(adjustedMidi, instrument, currentFret);
    if (position) {
      currentFret = position.fret; // Update current position for next note
    }

    // Create the adjusted note
    optimizedNotes.push({
      ...note,
      midi: adjustedMidi,
      name: midiToNoteName(adjustedMidi),
    });
  }

  return optimizedNotes;
}

/**
 * Converts a MIDI number to a note name (e.g., 60 -> "C4")
 */
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Checks if simplification would reduce the number of notes
 */
export function wouldSimplify(notes: MidiNote[]): boolean {
  if (notes.length === 0) return false;

  const groups = groupSimultaneousNotes(notes);
  const hasChords = groups.some(group => group.length > 1);

  return hasChords;
}

/**
 * Gets statistics about simplification
 */
export function getSimplificationStats(notes: MidiNote[]): {
  originalCount: number;
  simplifiedCount: number;
  chordsRemoved: number;
  percentReduction: number;
} {
  const groups = groupSimultaneousNotes(notes);
  const chordsRemoved = groups.filter(g => g.length > 1).length;
  const removedNotes = notes.length - groups.length;

  return {
    originalCount: notes.length,
    simplifiedCount: groups.length,
    chordsRemoved,
    percentReduction: notes.length > 0
      ? Math.round((removedNotes / notes.length) * 100)
      : 0,
  };
}
