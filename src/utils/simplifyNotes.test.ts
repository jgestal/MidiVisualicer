/**
 * Unit tests for simplifyNotes utility
 * 
 * @description Tests the note simplification logic for:
 * - Grouping simultaneous notes
 * - Strategy application (TOP_NOTE, BASS_ONLY, etc.)
 * - Simplification stats calculation
 */
import { describe, it, expect } from 'vitest';
import {
  simplifyNotes,
  wouldSimplify,
  getSimplificationStats,
} from './simplifyNotes';
import type { MidiNote } from '@/shared/types/midi';

// ============================================
// Test Helpers
// ============================================

function createNote(midi: number, time: number, duration = 0.5): MidiNote {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return {
    midi,
    time,
    duration,
    velocity: 0.8,
    name: `${noteNames[noteIndex]}${octave}`,
    ticks: Math.round(time * 480), // Approximate ticks at 480 ppq
    durationTicks: Math.round(duration * 480),
  };
}

// Helper to create a chord (simultaneous notes)
function createChord(midis: number[], time: number): MidiNote[] {
  return midis.map(midi => createNote(midi, time));
}

// ============================================
// Tests
// ============================================

describe('simplifyNotes', () => {
  describe('empty input', () => {
    it('should return empty array for empty input', () => {
      expect(simplifyNotes([])).toEqual([]);
    });
  });

  describe('single notes (no simplification needed)', () => {
    it('should return single notes unchanged', () => {
      const notes = [createNote(60, 0), createNote(62, 1), createNote(64, 2)];
      const result = simplifyNotes(notes);

      expect(result).toHaveLength(3);
      expect(result.map(n => n.midi)).toEqual([60, 62, 64]);
    });
  });

  describe('TOP_NOTE strategy', () => {
    it('should keep only highest note from chord', () => {
      const notes = createChord([48, 52, 55], 0); // C major chord
      const result = simplifyNotes(notes, undefined, 'TOP_NOTE');

      expect(result).toHaveLength(1);
      expect(result[0].midi).toBe(55); // G is highest
    });

    it('should handle multiple chords', () => {
      const notes = [
        ...createChord([48, 52, 55], 0),  // C major at t=0
        ...createChord([50, 53, 57], 1),  // D minor at t=1
      ];
      const result = simplifyNotes(notes, undefined, 'TOP_NOTE');

      expect(result).toHaveLength(2);
      expect(result[0].midi).toBe(55); // G from C major
      expect(result[1].midi).toBe(57); // A from D minor
    });
  });

  describe('BASS_ONLY strategy', () => {
    it('should keep only lowest note from chord', () => {
      const notes = createChord([48, 52, 55], 0); // C major chord
      const result = simplifyNotes(notes, undefined, 'BASS_ONLY');

      expect(result).toHaveLength(1);
      expect(result[0].midi).toBe(48); // C is lowest
    });
  });

  describe('BASS_AND_MELODY strategy', () => {
    it('should keep lowest and highest notes from chord', () => {
      const notes = createChord([48, 52, 55], 0); // C major chord
      const result = simplifyNotes(notes, undefined, 'BASS_AND_MELODY');

      expect(result).toHaveLength(2);
      expect(result[0].midi).toBe(48); // C (bass)
      expect(result[1].midi).toBe(55); // G (melody)
    });

    it('should return single note if bass equals melody', () => {
      const notes = [createNote(60, 0)];
      const result = simplifyNotes(notes, undefined, 'BASS_AND_MELODY');

      expect(result).toHaveLength(1);
      expect(result[0].midi).toBe(60);
    });
  });

  describe('ALL_NOTES strategy', () => {
    it('should keep all notes unchanged', () => {
      const notes = createChord([48, 52, 55], 0);
      const result = simplifyNotes(notes, undefined, 'ALL_NOTES');

      expect(result).toHaveLength(3);
      expect(result.map(n => n.midi).sort()).toEqual([48, 52, 55]);
    });
  });

  describe('simultaneous note grouping', () => {
    it('should group notes within 50ms tolerance', () => {
      const notes = [
        createNote(48, 0),
        createNote(52, 0.01),  // 10ms later
        createNote(55, 0.04),  // 40ms later (still within 50ms of previous)
      ];
      const result = simplifyNotes(notes, undefined, 'TOP_NOTE');

      expect(result).toHaveLength(1);
      expect(result[0].midi).toBe(55);
    });

    it('should separate notes beyond 50ms tolerance', () => {
      const notes = [
        createNote(48, 0),
        createNote(52, 0.1),  // 100ms later - new group
      ];
      const result = simplifyNotes(notes, undefined, 'TOP_NOTE');

      expect(result).toHaveLength(2);
    });
  });
});

describe('wouldSimplify', () => {
  it('should return false for empty input', () => {
    expect(wouldSimplify([])).toBe(false);
  });

  it('should return false for single notes only', () => {
    const notes = [createNote(60, 0), createNote(62, 1)];
    expect(wouldSimplify(notes)).toBe(false);
  });

  it('should return true for chords', () => {
    const notes = createChord([48, 52, 55], 0);
    expect(wouldSimplify(notes)).toBe(true);
  });

  it('should return true if any chord exists', () => {
    const notes = [
      createNote(60, 0),
      ...createChord([48, 52, 55], 1),
      createNote(62, 2),
    ];
    expect(wouldSimplify(notes)).toBe(true);
  });
});

describe('getSimplificationStats', () => {
  it('should return correct stats for empty input', () => {
    const stats = getSimplificationStats([]);
    expect(stats).toEqual({
      originalCount: 0,
      simplifiedCount: 0,
      chordsRemoved: 0,
      percentReduction: 0,
    });
  });

  it('should return zero reduction for single notes', () => {
    const notes = [createNote(60, 0), createNote(62, 1)];
    const stats = getSimplificationStats(notes);

    expect(stats.originalCount).toBe(2);
    expect(stats.simplifiedCount).toBe(2);
    expect(stats.chordsRemoved).toBe(0);
    expect(stats.percentReduction).toBe(0);
  });

  it('should calculate correct reduction for chords', () => {
    const notes = [
      ...createChord([48, 52, 55], 0), // 3 notes -> 1
      createNote(60, 1),               // 1 note -> 1
    ];
    const stats = getSimplificationStats(notes);

    expect(stats.originalCount).toBe(4);
    expect(stats.simplifiedCount).toBe(2);  // 1 chord + 1 single
    expect(stats.chordsRemoved).toBe(1);
    expect(stats.percentReduction).toBe(50); // 4 -> 2 = 50%
  });

  it('should count multiple chords correctly', () => {
    const notes = [
      ...createChord([48, 52, 55], 0),    // 3 notes
      ...createChord([50, 53, 57, 60], 1), // 4 notes
    ];
    const stats = getSimplificationStats(notes);

    expect(stats.originalCount).toBe(7);
    expect(stats.simplifiedCount).toBe(2);
    expect(stats.chordsRemoved).toBe(2);
    expect(stats.percentReduction).toBe(71); // 7 -> 2 = ~71%
  });
});
