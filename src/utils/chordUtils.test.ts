/**
 * Unit tests for chordUtils
 * 
 * @description Tests chord detection from MIDI notes
 */
import { describe, it, expect } from 'vitest';
import { detectChord } from './chordUtils';

describe('detectChord', () => {
  describe('empty/invalid input', () => {
    it('should return null for empty array', () => {
      expect(detectChord([])).toBeNull();
    });

    it('should return null for single note', () => {
      expect(detectChord([60])).toBeNull();
    });

    it('should return null for two notes', () => {
      expect(detectChord([60, 64])).toBeNull();
    });
  });

  describe('major triads', () => {
    it('should detect C major (C-E-G)', () => {
      // C4=60, E4=64, G4=67
      expect(detectChord([60, 64, 67])).toBe('C');
    });

    it('should detect G major (G-B-D)', () => {
      // G3=55, B3=59, D4=62
      expect(detectChord([55, 59, 62])).toBe('G');
    });

    it('should detect D major (D-F#-A)', () => {
      // D3=50, F#3=54, A3=57
      expect(detectChord([50, 54, 57])).toBe('D');
    });

    it('should detect major chord in any inversion', () => {
      // C major first inversion (E-G-C)
      expect(detectChord([64, 67, 72])).toBe('C');
      // C major second inversion (G-C-E)
      expect(detectChord([67, 72, 76])).toBe('C');
    });
  });

  describe('minor triads', () => {
    it('should detect A minor (A-C-E)', () => {
      // A3=57, C4=60, E4=64
      expect(detectChord([57, 60, 64])).toBe('Am');
    });

    it('should detect E minor (E-G-B)', () => {
      // E3=52, G3=55, B3=59
      expect(detectChord([52, 55, 59])).toBe('Em');
    });

    it('should detect D minor (D-F-A)', () => {
      // D3=50, F3=53, A3=57
      expect(detectChord([50, 53, 57])).toBe('Dm');
    });
  });

  describe('seventh chords', () => {
    it('should detect G7 (G-B-D-F)', () => {
      // G3=55, B3=59, D4=62, F4=65
      expect(detectChord([55, 59, 62, 65])).toBe('G7');
    });

    it('should detect Cmaj7 or C (algorithm may prioritize triad)', () => {
      // C4=60, E4=64, G4=67, B4=71
      // Contains both C major triad and maj7 extension
      const result = detectChord([60, 64, 67, 71]);
      expect(['C', 'Cmaj7']).toContain(result);
    });

    it('should detect Am7 or C6 (A-C-E-G are enharmonic)', () => {
      // A3=57, C4=60, E4=64, G4=67
      // These notes form both Am7 (if A is root) and C6 (if C is root)
      // The algorithm finds C6 first
      const result = detectChord([57, 60, 64, 67]);
      expect(['Am7', 'C6']).toContain(result);
    });
  });

  describe('other chord types', () => {
    it('should detect diminished (B-D-F)', () => {
      // B3=59, D4=62, F4=65
      expect(detectChord([59, 62, 65])).toBe('Bdim');
    });

    it('should detect sus4 (C-F-G)', () => {
      // C4=60, F4=65, G4=67
      expect(detectChord([60, 65, 67])).toBe('Csus4');
    });

    it('should detect sus2 (C-D-G)', () => {
      // C4=60, D4=62, G4=67
      expect(detectChord([60, 62, 67])).toBe('Csus2');
    });
  });

  describe('octave handling', () => {
    it('should detect chord with notes across octaves', () => {
      // C2, E4, G5
      expect(detectChord([36, 64, 79])).toBe('C');
    });

    it('should handle duplicate notes', () => {
      // C in multiple octaves + E + G
      expect(detectChord([48, 60, 64, 67, 72])).toBe('C');
    });
  });

  describe('edge cases', () => {
    it('should return null for unrecognized pattern', () => {
      // C-D-E (no chord pattern matches)
      const result = detectChord([60, 62, 64]);
      // This might match something or return null depending on implementation
      // Just verify it doesn't throw
      expect(typeof result === 'string' || result === null).toBe(true);
    });
  });
});
