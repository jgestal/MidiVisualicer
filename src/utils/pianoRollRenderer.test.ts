/**
 * Unit tests for pianoRollRenderer utilities
 */
import { describe, it, expect, vi } from 'vitest';
import {
  PIANO_ROLL_CONFIG,
  clearCanvas,
  drawNoteGrid,
  drawTimeMarkers,
  drawLoopRegion,
  drawPlayhead,
  drawHoverMarker,
  getNoteColor,
} from './pianoRollRenderer';

describe('pianoRollRenderer', () => {
  describe('PIANO_ROLL_CONFIG', () => {
    it('should have valid NOTE_HEIGHT', () => {
      expect(PIANO_ROLL_CONFIG.NOTE_HEIGHT).toBeGreaterThan(0);
      expect(PIANO_ROLL_CONFIG.NOTE_HEIGHT).toBeLessThanOrEqual(20);
    });

    it('should have valid PIXELS_PER_SECOND', () => {
      expect(PIANO_ROLL_CONFIG.PIXELS_PER_SECOND).toBeGreaterThan(0);
    });

    it('should have valid LEFT_MARGIN', () => {
      expect(PIANO_ROLL_CONFIG.LEFT_MARGIN).toBeGreaterThanOrEqual(0);
    });

    it('should have valid TIME_MARKER_INTERVAL', () => {
      expect(PIANO_ROLL_CONFIG.TIME_MARKER_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('clearCanvas', () => {
    it('should call fillRect with correct dimensions', () => {
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      clearCanvas(mockCtx, 800, 600);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should set fill style to background color', () => {
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      clearCanvas(mockCtx, 100, 100);

      expect(mockCtx.fillStyle).toBe('#0a0a0f');
    });
  });

  describe('getNoteColor', () => {
    it('should return accent color when not active', () => {
      const color = getNoteColor(false);
      expect(color).toBe('#6366f1');
    });

    it('should return green when active', () => {
      const color = getNoteColor(true);
      expect(color).toBe('#22c55e');
    });
  });

  describe('drawNoteGrid', () => {
    it('should draw rows for each note in range', () => {
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
        font: '',
      } as unknown as CanvasRenderingContext2D;

      const noteRange = { min: 60, max: 72 }; // One octave
      drawNoteGrid(mockCtx, noteRange, 800);

      // Should draw 13 rows (60-72 inclusive)
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(13);
    });

    it('should label C notes', () => {
      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
        font: '',
      } as unknown as CanvasRenderingContext2D;

      const noteRange = { min: 60, max: 72 }; // C4 to C5
      drawNoteGrid(mockCtx, noteRange, 800);

      // Should label C4 (60) and C5 (72)
      expect(mockCtx.fillText).toHaveBeenCalledWith('C4', 2, expect.any(Number));
      expect(mockCtx.fillText).toHaveBeenCalledWith('C5', 2, expect.any(Number));
    });
  });

  describe('drawTimeMarkers', () => {
    it('should draw markers at regular intervals', () => {
      const mockCtx = {
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        font: '',
      } as unknown as CanvasRenderingContext2D;

      drawTimeMarkers(mockCtx, 10, 200); // 10 seconds duration

      // With 2-second interval, should draw 6 markers (0, 2, 4, 6, 8, 10)
      expect(mockCtx.stroke).toHaveBeenCalledTimes(6);
    });
  });

  describe('drawPlayhead', () => {
    it('should draw vertical line at current time', () => {
      const mockCtx = {
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      drawPlayhead(mockCtx, 5, 200);

      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled(); // Triangle marker
    });
  });

  describe('drawLoopRegion', () => {
    it('should draw filled region between loop points', () => {
      const mockCtx = {
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 0,
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      drawLoopRegion(mockCtx, 2, 5, 200);

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.setLineDash).toHaveBeenCalledWith([4, 4]);
    });
  });

  describe('drawHoverMarker', () => {
    it('should draw dashed line at hover position', () => {
      const mockCtx = {
        strokeStyle: '',
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      drawHoverMarker(mockCtx, 3, 200);

      expect(mockCtx.setLineDash).toHaveBeenCalledWith([4, 4]);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });
});
