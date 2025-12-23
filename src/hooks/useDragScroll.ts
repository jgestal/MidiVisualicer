import { useRef, useCallback, useState } from 'react';

export function useDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs to track drag state without re-renders
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDown.current = true;
    hasMoved.current = false;
    // Calc start position relative to container
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDown.current || !scrollRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;

    // Only start dragging if moved more than 5px
    if (!hasMoved.current && Math.abs(walk) > 5) {
      hasMoved.current = true;
      setIsDragging(true);
      scrollRef.current.setPointerCapture(e.pointerId);
      scrollRef.current.style.cursor = 'grabbing';
    }

    if (hasMoved.current) {
      scrollRef.current.scrollLeft = scrollLeft.current - walk * 1.5;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDown.current = false;
    if (hasMoved.current) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.releasePointerCapture(e.pointerId);
        scrollRef.current.style.cursor = 'grab';
      }
    }
  }, []);

  // Capture click to prevent selection if we just dragged
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return {
    scrollRef,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleClick
  };
}
