/**
 * useAudioScheduler - Optimized audio scheduling with Web Audio API
 * 
 * @description Separates audio scheduling from UI updates to prevent stuttering:
 * - Uses lookahead scheduling for glitch-free playback
 * - Batches note lookups for active note detection
 * - Minimizes main thread work during playback
 * 
 * @performance
 * - Pre-computed note lookup tables
 * - Binary search for active notes instead of linear scan
 * - Throttled active note updates (every 50ms instead of every frame)
 */
import { useCallback, useRef } from 'react';
import type { MidiNote } from '../types/midi';

// ============================================
// Types
// ============================================

interface NoteEvent {
  startTime: number;
  endTime: number;
  midi: number;
  trackIndex: number;
}

interface NoteLookupTable {
  events: NoteEvent[];
  sortedByStart: NoteEvent[];
  sortedByEnd: NoteEvent[];
}

// ============================================
// Constants  
// ============================================

/** How far ahead to look for notes (ms) - for lookahead scheduling */
const SCHEDULE_LOOKAHEAD_MS = 100;

/** How often to check for active notes (ms) - throttle for performance */
const ACTIVE_NOTES_CHECK_INTERVAL_MS = 50;

/** Time window for binary search tolerance */
const TIME_TOLERANCE_MS = 10;

// ============================================
// Helpers
// ============================================

/**
 * Binary search to find first note starting at or after given time
 */
function findFirstNoteAtOrAfter(events: NoteEvent[], time: number): number {
  let left = 0;
  let right = events.length;

  while (left < right) {
    const mid = (left + right) >> 1;
    if (events[mid].startTime < time) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

/**
 * Find all notes active at a given time using binary search
 * Much faster than linear scan for large note arrays
 */
function findActiveNotes(
  table: NoteLookupTable,
  currentTime: number
): number[] {
  const active: number[] = [];
  const timeMs = currentTime * 1000;

  // Find starting index using binary search
  const startIdx = findFirstNoteAtOrAfter(table.sortedByStart, timeMs - SCHEDULE_LOOKAHEAD_MS);

  // Only scan relevant portion of array
  for (let i = Math.max(0, startIdx - 100); i < table.events.length; i++) {
    const event = table.events[i];

    // Stop if we've passed all possible active notes
    if (event.startTime > timeMs + TIME_TOLERANCE_MS) break;

    // Check if note is active
    if (timeMs >= event.startTime - TIME_TOLERANCE_MS &&
      timeMs <= event.endTime + TIME_TOLERANCE_MS) {
      active.push(event.midi);
    }
  }

  return active;
}

// ============================================
// Hook
// ============================================

export function useAudioScheduler() {
  const lookupTableRef = useRef<NoteLookupTable | null>(null);
  const lastActiveCheckRef = useRef<number>(0);
  const cachedActiveNotesRef = useRef<number[]>([]);

  /**
   * Build optimized lookup table from tracks
   * Call this once when MIDI is loaded/changed
   */
  const buildLookupTable = useCallback((
    tracks: { notes: MidiNote[] }[],
    mutedTracks: Set<number>
  ): NoteLookupTable => {
    const events: NoteEvent[] = [];

    tracks.forEach((track, trackIndex) => {
      if (mutedTracks.has(trackIndex)) return;

      track.notes.forEach(note => {
        events.push({
          startTime: note.time * 1000, // Convert to ms for precision
          endTime: (note.time + note.duration) * 1000,
          midi: note.midi,
          trackIndex,
        });
      });
    });

    // Sort by start time for efficient lookup
    const sortedByStart = [...events].sort((a, b) => a.startTime - b.startTime);
    const sortedByEnd = [...events].sort((a, b) => a.endTime - b.endTime);

    const table: NoteLookupTable = {
      events: sortedByStart,
      sortedByStart,
      sortedByEnd,
    };

    lookupTableRef.current = table;
    return table;
  }, []);

  /**
   * Get active notes at current time with throttling
   * Returns cached result if called too frequently
   */
  const getActiveNotes = useCallback((currentTime: number): number[] => {
    const now = performance.now();

    // Return cached if within throttle interval
    if (now - lastActiveCheckRef.current < ACTIVE_NOTES_CHECK_INTERVAL_MS) {
      return cachedActiveNotesRef.current;
    }

    lastActiveCheckRef.current = now;

    if (!lookupTableRef.current) {
      return [];
    }

    const activeNotes = findActiveNotes(lookupTableRef.current, currentTime);
    cachedActiveNotesRef.current = activeNotes;

    return activeNotes;
  }, []);

  /**
   * Clear cached data
   */
  const clearCache = useCallback(() => {
    lookupTableRef.current = null;
    cachedActiveNotesRef.current = [];
    lastActiveCheckRef.current = 0;
  }, []);

  /**
   * Get notes that need to be scheduled in the lookahead window
   * For use with Tone.js lookahead scheduling
   */
  const getNotesInWindow = useCallback((
    startTime: number,
    endTime: number,
    mutedTracks: Set<number>
  ): NoteEvent[] => {
    if (!lookupTableRef.current) return [];

    const startMs = startTime * 1000;
    const endMs = endTime * 1000;
    const notes: NoteEvent[] = [];

    const startIdx = findFirstNoteAtOrAfter(lookupTableRef.current.sortedByStart, startMs);

    for (let i = startIdx; i < lookupTableRef.current.events.length; i++) {
      const event = lookupTableRef.current.events[i];
      if (event.startTime > endMs) break;
      if (mutedTracks.has(event.trackIndex)) continue;
      notes.push(event);
    }

    return notes;
  }, []);

  return {
    buildLookupTable,
    getActiveNotes,
    getNotesInWindow,
    clearCache,
    SCHEDULE_LOOKAHEAD_MS,
    ACTIVE_NOTES_CHECK_INTERVAL_MS,
  };
}

export default useAudioScheduler;
