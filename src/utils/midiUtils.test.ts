/**
 * Unit tests for midiUtils
 */
import { describe, it, expect } from 'vitest';
import {
  midiToOctave,
  midiNoteIndex,
  isBlackKey,
  NOTE_NAMES_SHARP,
  midiToNoteName,
  noteNameWithoutOctave,
} from './midiUtils';

describe('midiUtils', () => {
  describe('midiToOctave', () => {
    it('should return octave 4 for middle C (MIDI 60)', () => {
      expect(midiToOctave(60)).toBe(4);
    });

    it('should return octave -1 for MIDI 0', () => {
      expect(midiToOctave(0)).toBe(-1);
    });

    it('should return octave 5 for MIDI 72', () => {
      expect(midiToOctave(72)).toBe(5);
    });

    it('should handle high MIDI notes', () => {
      expect(midiToOctave(127)).toBe(9);
    });
  });

  describe('midiNoteIndex', () => {
    it('should return 0 for C notes', () => {
      expect(midiNoteIndex(60)).toBe(0); // C4
      expect(midiNoteIndex(72)).toBe(0); // C5
    });

    it('should return correct index for all notes in an octave', () => {
      expect(midiNoteIndex(60)).toBe(0);  // C
      expect(midiNoteIndex(61)).toBe(1);  // C#
      expect(midiNoteIndex(62)).toBe(2);  // D
      expect(midiNoteIndex(63)).toBe(3);  // D#
      expect(midiNoteIndex(64)).toBe(4);  // E
      expect(midiNoteIndex(65)).toBe(5);  // F
      expect(midiNoteIndex(66)).toBe(6);  // F#
      expect(midiNoteIndex(67)).toBe(7);  // G
      expect(midiNoteIndex(68)).toBe(8);  // G#
      expect(midiNoteIndex(69)).toBe(9);  // A
      expect(midiNoteIndex(70)).toBe(10); // A#
      expect(midiNoteIndex(71)).toBe(11); // B
    });
  });

  describe('isBlackKey', () => {
    it('should return true for black keys (sharps)', () => {
      expect(isBlackKey(61)).toBe(true);  // C#
      expect(isBlackKey(63)).toBe(true);  // D#
      expect(isBlackKey(66)).toBe(true);  // F#
      expect(isBlackKey(68)).toBe(true);  // G#
      expect(isBlackKey(70)).toBe(true);  // A#
    });

    it('should return false for white keys', () => {
      expect(isBlackKey(60)).toBe(false); // C
      expect(isBlackKey(62)).toBe(false); // D
      expect(isBlackKey(64)).toBe(false); // E
      expect(isBlackKey(65)).toBe(false); // F
      expect(isBlackKey(67)).toBe(false); // G
      expect(isBlackKey(69)).toBe(false); // A
      expect(isBlackKey(71)).toBe(false); // B
    });
  });

  describe('NOTE_NAMES_SHARP', () => {
    it('should have 12 note names', () => {
      expect(NOTE_NAMES_SHARP).toHaveLength(12);
    });

    it('should start with C and end with B', () => {
      expect(NOTE_NAMES_SHARP[0]).toBe('C');
      expect(NOTE_NAMES_SHARP[11]).toBe('B');
    });
  });

  describe('midiToNoteName', () => {
    it('should return C4 for MIDI 60', () => {
      expect(midiToNoteName(60)).toBe('C4');
    });

    it('should return A4 for MIDI 69 (concert pitch)', () => {
      expect(midiToNoteName(69)).toBe('A4');
    });

    it('should handle sharps correctly', () => {
      expect(midiToNoteName(61)).toBe('C#4');
      expect(midiToNoteName(66)).toBe('F#4');
    });
  });

  describe('noteNameWithoutOctave', () => {
    it('should return just the note name', () => {
      expect(noteNameWithoutOctave(60)).toBe('C');
      expect(noteNameWithoutOctave(61)).toBe('C#');
      expect(noteNameWithoutOctave(69)).toBe('A');
    });
  });
});
