    /**
 * Custom hook for Piano Roll scroll and interaction
 * Handles auto-scroll during playback, drag-to-pan, and click-to-seek
 */
import { useRef, useEffect, useCallback } from 'react';

interface UsePianoRollScrollOptions {
    currentTime: number;
    isPlaying: boolean;
    duration: number;
    pixelsPerSecond: number;
    leftMargin: number;
    onSeek?: (time: number) => void;
    onSetLoopStart: (time: number) => void;
    onSetLoopEnd: (time: number) => void;
}

interface PianoRollScrollResult {
    containerRef: React.RefObject<HTMLDivElement>;
    handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    handlePointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    handlePointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    handlePointerLeave: () => void;
    hoverInfoRef: React.MutableRefObject<{ time: number; isCtrl: boolean; active: boolean }>;
}

export function usePianoRollScroll({
    currentTime,
    isPlaying,
    duration,
    pixelsPerSecond,
    leftMargin,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
}: UsePianoRollScrollOptions): PianoRollScrollResult {
    const containerRef = useRef<HTMLDivElement>(null);

    // Drag state
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const scrollStartRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const lastSeekTimeRef = useRef(currentTime);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Auto-scroll during playback (lerp interpolation)
    useEffect(() => {
        if (!isPlaying || !containerRef.current) return;

        const container = containerRef.current;
        const playheadX = currentTime * pixelsPerSecond + leftMargin;
        const containerWidth = container.clientWidth;

        // Target: playhead at 50% from left (center)
        const targetScrollLeft = playheadX - containerWidth * 0.5;
        const currentScroll = container.scrollLeft;
        const diff = targetScrollLeft - currentScroll;

        if (Math.abs(diff) > 5) {
            // Smoothing factor: 0.1 = smooth, continuous movement
            const newScroll = currentScroll + diff * 0.1;
            container.scrollLeft = Math.max(0, newScroll);
        }
    });

    // Scroll animation on seek (when not playing)
    useEffect(() => {
        const timeDiff = Math.abs(currentTime - lastSeekTimeRef.current);
        lastSeekTimeRef.current = currentTime;

        // Only activate on seek (>0.5s jump) when not playing
        if (isPlaying || timeDiff < 0.5) return;
        if (!containerRef.current) return;

        const container = containerRef.current;
        const playheadX = currentTime * pixelsPerSecond + leftMargin;
        const containerWidth = container.clientWidth;

        // Check if playhead is outside current view
        const viewStart = container.scrollLeft;
        const viewEnd = container.scrollLeft + containerWidth;
        const isVisible = playheadX >= viewStart + 50 && playheadX <= viewEnd - 50;

        if (!isVisible) {
            // Smooth animated scroll to center
            const targetScrollLeft = playheadX - containerWidth * 0.5;
            container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth',
            });
        }
    }, [currentTime, isPlaying, pixelsPerSecond, leftMargin]);

    // Pointer down - start potential drag or seek
    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const canvas = e.currentTarget;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // Store canvas reference for pointer up
            canvasRef.current = canvas;

            // Capture pointer for tracking
            canvas.setPointerCapture(e.pointerId);

            // Store drag state
            isDraggingRef.current = true;
            hasDraggedRef.current = false;
            dragStartXRef.current = e.clientX;
            scrollStartRef.current = container.scrollLeft;

            // Change cursor
            canvas.style.cursor = 'grabbing';
        },
        []
    );

    // Hover state for custom drawing (Cursor feedback)
    const hoverInfoRef = useRef({ time: 0, isCtrl: false, active: false });

    // Pointer move - drag to scroll OR track hover
    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const container = containerRef.current;
            const canvas = canvasRef.current || e.currentTarget;
            if (!container || !canvas) return;

            // Track hover state for visual feedback (Ctrl+Hover loop marker)
            const rect = canvas.getBoundingClientRect();
            const scrollLeft = container.scrollLeft;
            const x = e.clientX - rect.left + scrollLeft;
            const time = Math.max(0, Math.min(duration, (x - leftMargin) / pixelsPerSecond));

            hoverInfoRef.current = {
                time,
                isCtrl: e.ctrlKey || e.altKey,
                active: true
            };

            if (!isDraggingRef.current) return;

            const deltaX = dragStartXRef.current - e.clientX;

            // Only consider drag if moved >5px (avoid accidental drags)
            if (Math.abs(deltaX) > 5) {
                hasDraggedRef.current = true;
            }

            if (hasDraggedRef.current) {
                container.scrollLeft = scrollStartRef.current + deltaX;
            }
        },
        [duration, leftMargin, pixelsPerSecond]
    );

    const handlePointerLeave = useCallback(() => {
        hoverInfoRef.current.active = false;
        isDraggingRef.current = false;
    }, []);

    // Pointer up - end drag or perform seek/loop action
    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current || e.currentTarget;
            if (!canvas) return;

            // ... (existing pointer release code) ...
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch {
                // Ignore if pointer capture wasn't set
            }
            canvas.style.cursor = 'grab';
            isDraggingRef.current = false;

            // Reset hover ctrl state on click to prevent stuck visual
            // hoverInfoRef.current.isCtrl = false; // Optional, move handles it

            // If we didn't drag, it's a click - perform action
            if (!hasDraggedRef.current) {
                const rect = canvas.getBoundingClientRect();
                const scrollLeft = containerRef.current?.scrollLeft || 0;
                const x = e.clientX - rect.left + scrollLeft;
                const time = Math.max(
                    0,
                    Math.min(duration, (x - leftMargin) / pixelsPerSecond)
                );

                if (e.shiftKey) {
                    onSetLoopEnd(time);
                } else if (e.altKey || e.ctrlKey) {
                    onSetLoopStart(time);
                } else if (onSeek) {
                    onSeek(time);
                }
            }
        },
        [duration, pixelsPerSecond, leftMargin, onSeek, onSetLoopStart, onSetLoopEnd]
    );

    return {
        containerRef,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerLeave,
        hoverInfoRef,
    };
}
