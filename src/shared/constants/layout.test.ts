/**
 * Unit tests for layout constants
 */
import { describe, it, expect } from 'vitest';
import {
  PIANO_ROLL_LAYOUT,
  TABLATURE_LAYOUT,
  ANIMATION,
  PLAYBACK_DEFAULTS,
  Z_INDEX,
} from './layout';

describe('Layout Constants', () => {
  describe('Piano Roll Layout', () => {
    it('should have positive NOTE_HEIGHT', () => {
      expect(PIANO_ROLL_LAYOUT.NOTE_HEIGHT).toBeGreaterThan(0);
    });

    it('should have positive PIXELS_PER_SECOND', () => {
      expect(PIANO_ROLL_LAYOUT.PIXELS_PER_SECOND).toBeGreaterThan(0);
    });

    it('should have non-negative LEFT_MARGIN', () => {
      expect(PIANO_ROLL_LAYOUT.LEFT_MARGIN).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tablature Layout', () => {
    it('should have positive CELL_WIDTH', () => {
      expect(TABLATURE_LAYOUT.CELL_WIDTH).toBeGreaterThan(0);
    });

    it('should have positive LINE_HEIGHT', () => {
      expect(TABLATURE_LAYOUT.LINE_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('Animation Timings', () => {
    it('should have FAST < NORMAL < SLOW', () => {
      expect(ANIMATION.FAST).toBeLessThan(ANIMATION.NORMAL);
      expect(ANIMATION.NORMAL).toBeLessThan(ANIMATION.SLOW);
    });

    it('should have positive values', () => {
      expect(ANIMATION.FAST).toBeGreaterThan(0);
      expect(ANIMATION.NORMAL).toBeGreaterThan(0);
      expect(ANIMATION.SLOW).toBeGreaterThan(0);
    });
  });

  describe('Playback Defaults', () => {
    it('should have valid count-in range', () => {
      expect(PLAYBACK_DEFAULTS.COUNT_IN_MIN).toBeLessThan(PLAYBACK_DEFAULTS.COUNT_IN_MAX);
      expect(PLAYBACK_DEFAULTS.COUNT_IN_DEFAULT).toBeGreaterThanOrEqual(PLAYBACK_DEFAULTS.COUNT_IN_MIN);
      expect(PLAYBACK_DEFAULTS.COUNT_IN_DEFAULT).toBeLessThanOrEqual(PLAYBACK_DEFAULTS.COUNT_IN_MAX);
    });

    it('should have valid speed trainer range', () => {
      expect(PLAYBACK_DEFAULTS.SPEED_TRAINER_START).toBeLessThan(PLAYBACK_DEFAULTS.SPEED_TRAINER_END);
      expect(PLAYBACK_DEFAULTS.SPEED_TRAINER_INCREMENT).toBeGreaterThan(0);
    });

    it('should have positive pause threshold', () => {
      expect(PLAYBACK_DEFAULTS.PAUSE_THRESHOLD_SECONDS).toBeGreaterThan(0);
    });
  });

  describe('Z-Index', () => {
    it('should have MODAL_OVERLAY < MODAL', () => {
      expect(Z_INDEX.MODAL_OVERLAY).toBeLessThan(Z_INDEX.MODAL);
    });

    it('should have TOOLTIP as highest', () => {
      expect(Z_INDEX.TOOLTIP).toBeGreaterThan(Z_INDEX.MODAL);
    });
  });
});
