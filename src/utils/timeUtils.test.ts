/**
 * Unit tests for timeUtils
 */
import { describe, it, expect } from 'vitest';
import { formatDuration } from './timeUtils';

describe('timeUtils', () => {
  describe('formatDuration', () => {
    it('should format 0 seconds as 0:00', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('should format seconds under a minute correctly', () => {
      expect(formatDuration(5)).toBe('0:05');
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(59)).toBe('0:59');
    });

    it('should format exactly 1 minute', () => {
      expect(formatDuration(60)).toBe('1:00');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(125)).toBe('2:05');
    });

    it('should format longer durations', () => {
      expect(formatDuration(300)).toBe('5:00');
      expect(formatDuration(3600)).toBe('60:00');
    });

    it('should handle decimal seconds by flooring', () => {
      expect(formatDuration(5.7)).toBe('0:05');
      expect(formatDuration(65.9)).toBe('1:05');
    });
  });
});
