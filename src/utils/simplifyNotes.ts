/**
 * Simplify Notes Utility
 * 
 * Provides functionality to simplify MIDI tracks for easier playability:
 * - Keeps only specific notes based on a strategy (e.g., highest, lowest, both)
 * - Optimizes fret positions to minimize hand movement on the fretboard
 * - Transposes notes intelligently to stay within comfortable playing range
 */

import type { MidiNote } from '@/shared/types/midi';
import type { InstrumentConfig } from '@/config/instruments';

// Time tolerance for grouping simultaneous notes (in seconds)
const SIMULTANEOUS_TOLERANCE = 0.05; // 50ms

export type SimplificationStrategy = 'TOP_NOTE' | 'BASS_ONLY' | 'BASS_AND_MELODY' | 'ALL_NOTES';

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
 * Applies strategy to a group of simultaneous notes
 */
function applyStrategy(group: MidiNote[], strategy: SimplificationStrategy): MidiNote[] {
  if (group.length <= 1 || strategy === 'ALL_NOTES') return group;

  switch (strategy) {
    case 'TOP_NOTE':
      return [group.reduce((highest, note) => note.midi > highest.midi ? note : highest)];
    case 'BASS_ONLY':
      return [group.reduce((lowest, note) => note.midi < lowest.midi ? note : lowest)];
    case 'BASS_AND_MELODY': {
      const highest = group.reduce((h, n) => n.midi > h.midi ? n : h);
      const lowest = group.reduce((l, n) => n.midi < l.midi ? n : l);
      return highest.midi === lowest.midi ? [highest] : [lowest, highest];
    }
    default:
      return [group.reduce((highest, note) => note.midi > highest.midi ? note : highest)];
  }
}

/**
 * Calculates the optimal fret position for a note on a given instrument
 */
function findOptimalPosition(
  midiNote: number,
  instrument: InstrumentConfig,
  currentFret: number = 5
): { stringIndex: number; fret: number } | null {
  const stringMidis = instrument.midiNotes;
  let bestPosition: { stringIndex: number; fret: number } | null = null;
  let minDistance = Infinity;

  // Search from highest string to lowest string (standard for melody)
  for (let stringIndex = 0; stringIndex < stringMidis.length; stringIndex++) {
    const openStringMidi = stringMidis[stringIndex];
    const fret = midiNote - openStringMidi;

    if (fret >= 0 && fret <= instrument.frets) {
      const distance = Math.abs(fret - currentFret);
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
 * Simplifies a track based on the selected strategy
 */
export function simplifyNotes(
  notes: MidiNote[],
  instrument?: InstrumentConfig,
  strategy: SimplificationStrategy = 'TOP_NOTE'
): MidiNote[] {
  if (notes.length === 0) return [];

  // Group simultaneous notes
  const groups = groupSimultaneousNotes(notes);

  // Apply strategy to each group and flatten
  const simplifiedNotes = groups.flatMap(group => applyStrategy(group, strategy));

  if (!instrument) return simplifiedNotes;

  const stringMidis = instrument.midiNotes;
  const lowestPossible = Math.min(...stringMidis);
  const highestPossible = Math.max(...stringMidis) + instrument.frets;

  let currentFret = 5;
  const optimizedNotes: MidiNote[] = [];

  for (const note of simplifiedNotes) {
    let adjustedMidi = note.midi;

    // Intelligent transposition: keep it within instrument range
    while (adjustedMidi < lowestPossible) adjustedMidi += 12;
    while (adjustedMidi > highestPossible) adjustedMidi -= 12;

    const position = findOptimalPosition(adjustedMidi, instrument, currentFret);
    if (position) {
      currentFret = position.fret;
    }

    optimizedNotes.push({
      ...note,
      midi: adjustedMidi,
      name: midiToNoteName(adjustedMidi),
    });
  }

  return optimizedNotes;
}

function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

export function wouldSimplify(notes: MidiNote[]): boolean {
  if (notes.length === 0) return false;
  const groups = groupSimultaneousNotes(notes);
  return groups.some(group => group.length > 1);
}

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
