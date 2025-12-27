/**
 * Unit tests for color constants and utility functions
 */
import { describe, it, expect } from 'vitest';
import {
  ACCENT_PRIMARY,
  ACCENT_SUCCESS,
  ACCENT_WARNING,
  ACCENT_ERROR,
  PIANO_ROLL,
  getRangeColor,
  RANGE_COLORS,
} from './colors';

describe('Color Constants', () => {
  describe('Accent Colors', () => {
    it('should have valid hex color format for ACCENT_PRIMARY', () => {
      expect(ACCENT_PRIMARY).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid hex color format for ACCENT_SUCCESS', () => {
      expect(ACCENT_SUCCESS).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid hex color format for ACCENT_WARNING', () => {
      expect(ACCENT_WARNING).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid hex color format for ACCENT_ERROR', () => {
      expect(ACCENT_ERROR).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('Piano Roll Colors', () => {
    it('should have all required color keys', () => {
      expect(PIANO_ROLL).toHaveProperty('BACKGROUND');
      expect(PIANO_ROLL).toHaveProperty('BLACK_KEY_BG');
      expect(PIANO_ROLL).toHaveProperty('WHITE_KEY_BG');
      expect(PIANO_ROLL).toHaveProperty('KEY_LABEL');
      expect(PIANO_ROLL).toHaveProperty('GRID_LINE');
      expect(PIANO_ROLL).toHaveProperty('PLAYHEAD');
    });

    it('should have valid color formats', () => {
      expect(PIANO_ROLL.BACKGROUND).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(PIANO_ROLL.PLAYHEAD).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('getRangeColor', () => {
    it('should return GOOD color for percentages >= 90', () => {
      expect(getRangeColor(90)).toBe(RANGE_COLORS.GOOD);
      expect(getRangeColor(95)).toBe(RANGE_COLORS.GOOD);
      expect(getRangeColor(100)).toBe(RANGE_COLORS.GOOD);
    });

    it('should return WARNING color for percentages >= 70 and < 90', () => {
      expect(getRangeColor(70)).toBe(RANGE_COLORS.WARNING);
      expect(getRangeColor(80)).toBe(RANGE_COLORS.WARNING);
      expect(getRangeColor(89)).toBe(RANGE_COLORS.WARNING);
    });

    it('should return BAD color for percentages < 70', () => {
      expect(getRangeColor(0)).toBe(RANGE_COLORS.BAD);
      expect(getRangeColor(50)).toBe(RANGE_COLORS.BAD);
      expect(getRangeColor(69)).toBe(RANGE_COLORS.BAD);
    });
  });
});
