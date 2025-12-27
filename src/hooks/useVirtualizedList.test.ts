/**
 * Unit tests for useVirtualizedList hook
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualizedList, useLineVirtualization } from './useVirtualizedList';

describe('useVirtualizedList', () => {
  const createItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i}` }));

  describe('empty list', () => {
    it('should return empty virtualItems for empty list', () => {
      const { result } = renderHook(() =>
        useVirtualizedList({
          items: [],
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 0,
        })
      );

      expect(result.current.virtualItems).toHaveLength(0);
      expect(result.current.totalHeight).toBe(0);
    });
  });

  describe('basic virtualization', () => {
    it('should calculate total height correctly', () => {
      const items = createItems(100);
      const { result } = renderHook(() =>
        useVirtualizedList({
          items,
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 0,
        })
      );

      expect(result.current.totalHeight).toBe(5000); // 100 * 50
    });

    it('should only return visible items plus overscan', () => {
      const items = createItems(100);
      const { result } = renderHook(() =>
        useVirtualizedList({
          items,
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 0,
          overscan: 3,
        })
      );

      // At scrollTop 0, visible = 0-5 (300/50=6 items)
      // With overscan 3: 0 to 9 = 10 items
      expect(result.current.virtualItems.length).toBeLessThanOrEqual(12);
      expect(result.current.startIndex).toBe(0);
    });

    it('should update visible items when scrolling', () => {
      const items = createItems(100);
      const { result, rerender } = renderHook(
        ({ scrollTop }) =>
          useVirtualizedList({
            items,
            itemHeight: 50,
            containerHeight: 300,
            scrollTop,
            overscan: 3,
          }),
        { initialProps: { scrollTop: 0 } }
      );

      const initialStart = result.current.startIndex;

      // Scroll down
      rerender({ scrollTop: 500 });

      expect(result.current.startIndex).toBeGreaterThan(initialStart);
    });

    it('should calculate correct spacer heights', () => {
      const items = createItems(100);
      const { result } = renderHook(() =>
        useVirtualizedList({
          items,
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 250, // 5 items down
          overscan: 2,
        })
      );

      // Top spacer should account for items above visible
      expect(result.current.topSpacerHeight).toBeGreaterThan(0);
      // Bottom spacer should account for items below visible
      expect(result.current.bottomSpacerHeight).toBeGreaterThan(0);
      // Total should equal totalHeight minus rendered items height
      const renderedHeight = result.current.virtualItems.length * 50;
      expect(result.current.topSpacerHeight + renderedHeight + result.current.bottomSpacerHeight)
        .toBe(result.current.totalHeight);
    });
  });

  describe('item positioning', () => {
    it('should assign correct positions to virtual items', () => {
      const items = createItems(20);
      const { result } = renderHook(() =>
        useVirtualizedList({
          items,
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 0,
        })
      );

      result.current.virtualItems.forEach((vItem) => {
        expect(vItem.style.top).toBe(vItem.index * 50);
        expect(vItem.style.height).toBe(50);
        expect(vItem.style.position).toBe('absolute');
      });
    });
  });

  describe('small lists', () => {
    it('should render all items for small lists', () => {
      const items = createItems(5);
      const { result } = renderHook(() =>
        useVirtualizedList({
          items,
          itemHeight: 50,
          containerHeight: 300,
          scrollTop: 0,
        })
      );

      // All 5 items should be rendered
      expect(result.current.virtualItems).toHaveLength(5);
    });
  });
});

describe('useLineVirtualization', () => {
  describe('visible range calculation', () => {
    it('should calculate correct range for middle of list', () => {
      const { result } = renderHook(() =>
        useLineVirtualization({
          totalLines: 100,
          currentLineIndex: 50,
          linesBefore: 2,
          linesAfter: 3,
        })
      );

      expect(result.current.visibleRange.start).toBe(48);
      expect(result.current.visibleRange.end).toBe(53);
    });

    it('should clamp range to valid indices at start', () => {
      const { result } = renderHook(() =>
        useLineVirtualization({
          totalLines: 100,
          currentLineIndex: 0,
          linesBefore: 2,
          linesAfter: 3,
        })
      );

      expect(result.current.visibleRange.start).toBe(0);
      expect(result.current.visibleRange.end).toBe(3);
    });

    it('should clamp range to valid indices at end', () => {
      const { result } = renderHook(() =>
        useLineVirtualization({
          totalLines: 100,
          currentLineIndex: 99,
          linesBefore: 2,
          linesAfter: 3,
        })
      );

      expect(result.current.visibleRange.start).toBe(97);
      expect(result.current.visibleRange.end).toBe(99);
    });
  });

  describe('isLineVisible', () => {
    it('should return true for visible lines', () => {
      const { result } = renderHook(() =>
        useLineVirtualization({
          totalLines: 100,
          currentLineIndex: 50,
          linesBefore: 2,
          linesAfter: 3,
        })
      );

      expect(result.current.isLineVisible(48)).toBe(true);
      expect(result.current.isLineVisible(50)).toBe(true);
      expect(result.current.isLineVisible(53)).toBe(true);
    });

    it('should return false for non-visible lines', () => {
      const { result } = renderHook(() =>
        useLineVirtualization({
          totalLines: 100,
          currentLineIndex: 50,
          linesBefore: 2,
          linesAfter: 3,
        })
      );

      expect(result.current.isLineVisible(0)).toBe(false);
      expect(result.current.isLineVisible(47)).toBe(false);
      expect(result.current.isLineVisible(54)).toBe(false);
      expect(result.current.isLineVisible(99)).toBe(false);
    });
  });
});
