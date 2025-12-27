/**
 * useThrottledPlaybackUpdates - Throttled playback UI updates
 * 
 * @description Reduces UI update frequency during playback to prevent stuttering:
 * - Throttles time updates to configurable interval
 * - Uses requestAnimationFrame efficiently
 * - Separates critical vs non-critical updates
 * 
 * @performance
 * - Default: UI updates every 33ms (30fps) instead of every frame (60fps)
 * - Reduces React re-renders by 50%
 * - Audio remains at full sample rate
 */
import { useRef, useCallback, useEffect } from 'react';

// ============================================
// Types
// ============================================

interface ThrottledUpdateOptions {
  /** How often to update time display (ms) - lower = smoother but more CPU */
  timeUpdateIntervalMs?: number;
  /** How often to check active notes (ms) */
  activeNotesIntervalMs?: number;
  /** Whether updates are currently enabled */
  enabled: boolean;
}

interface TimeUpdateCallback {
  (currentTime: number): void;
}

interface ActiveNotesCallback {
  (notes: number[]): void;
}

// ============================================
// Constants
// ============================================

/** Default time update interval - 30fps is smooth enough for time display */
const DEFAULT_TIME_UPDATE_INTERVAL_MS = 33; // ~30fps

/** Default active notes check interval - less frequent is fine for UI */
const DEFAULT_ACTIVE_NOTES_INTERVAL_MS = 50; // 20fps

// ============================================
// Hook
// ============================================

export function useThrottledPlaybackUpdates({
  timeUpdateIntervalMs = DEFAULT_TIME_UPDATE_INTERVAL_MS,
  activeNotesIntervalMs = DEFAULT_ACTIVE_NOTES_INTERVAL_MS,
  enabled,
}: ThrottledUpdateOptions) {
  const rafIdRef = useRef<number | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);
  const lastActiveNotesUpdateRef = useRef<number>(0);
  const timeCallbackRef = useRef<TimeUpdateCallback | null>(null);
  const activeNotesCallbackRef = useRef<ActiveNotesCallback | null>(null);
  const getTimeRef = useRef<(() => number) | null>(null);
  const getActiveNotesRef = useRef<(() => number[]) | null>(null);

  /**
   * Start the throttled update loop
   */
  const start = useCallback((
    getTime: () => number,
    onTimeUpdate: TimeUpdateCallback,
    getActiveNotes?: () => number[],
    onActiveNotesUpdate?: ActiveNotesCallback
  ) => {
    // Store callbacks in refs
    getTimeRef.current = getTime;
    timeCallbackRef.current = onTimeUpdate;
    getActiveNotesRef.current = getActiveNotes || null;
    activeNotesCallbackRef.current = onActiveNotesUpdate || null;

    // Reset timestamps
    lastTimeUpdateRef.current = 0;
    lastActiveNotesUpdateRef.current = 0;

    const loop = (timestamp: number) => {
      rafIdRef.current = requestAnimationFrame(loop);

      // Throttled time update
      if (timestamp - lastTimeUpdateRef.current >= timeUpdateIntervalMs) {
        lastTimeUpdateRef.current = timestamp;

        if (getTimeRef.current && timeCallbackRef.current) {
          const time = getTimeRef.current();
          timeCallbackRef.current(time);
        }
      }

      // Even more throttled active notes update
      if (timestamp - lastActiveNotesUpdateRef.current >= activeNotesIntervalMs) {
        lastActiveNotesUpdateRef.current = timestamp;

        if (getActiveNotesRef.current && activeNotesCallbackRef.current) {
          const notes = getActiveNotesRef.current();
          activeNotesCallbackRef.current(notes);
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [timeUpdateIntervalMs, activeNotesIntervalMs]);

  /**
   * Stop the update loop
   */
  const stop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Clear refs
    getTimeRef.current = null;
    timeCallbackRef.current = null;
    getActiveNotesRef.current = null;
    activeNotesCallbackRef.current = null;
  }, []);

  /**
   * Trigger immediate update (bypass throttle)
   * Useful for seek operations where user expects instant feedback
   */
  const forceUpdate = useCallback(() => {
    if (getTimeRef.current && timeCallbackRef.current) {
      timeCallbackRef.current(getTimeRef.current());
    }
    if (getActiveNotesRef.current && activeNotesCallbackRef.current) {
      activeNotesCallbackRef.current(getActiveNotesRef.current());
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Auto-stop when disabled
  useEffect(() => {
    if (!enabled) {
      stop();
    }
  }, [enabled, stop]);

  return {
    start,
    stop,
    forceUpdate,
    isRunning: rafIdRef.current !== null,
  };
}

export default useThrottledPlaybackUpdates;
