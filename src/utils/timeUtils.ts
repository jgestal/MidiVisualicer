/**
 * Shared utility functions for time-based operations
 * Used across TablatureView, OSMDNotationView, and other components
 */

/**
 * Binary search to find the last index where timestamps[index] <= targetTime
 * Returns -1 if no such index exists
 * 
 * @param timestamps - Sorted array of timestamps
 * @param targetTime - The time to search for
 * @param tolerance - Optional tolerance for comparison (default: 0.05)
 */
export function findLastIndexBeforeTime(
  timestamps: number[],
  targetTime: number,
  tolerance: number = 0.05
): number {
  if (timestamps.length === 0) return -1;

  let left = 0;
  let right = timestamps.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (timestamps[mid] <= targetTime + tolerance) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

/**
 * Build a time map from notes, grouping notes that are close together (chords)
 * 
 * @param notes - Array of notes with time property
 * @param chordTolerance - Time tolerance for grouping notes into chords (default: 0.05)
 */
export function buildNoteTimestamps<T extends { time: number }>(
  notes: T[],
  chordTolerance: number = 0.05
): number[] {
  const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
  const timestamps: number[] = [];

  sortedNotes.forEach(note => {
    // Only add unique timestamps (group chords)
    if (timestamps.length === 0 ||
      Math.abs(timestamps[timestamps.length - 1] - note.time) > chordTolerance) {
      timestamps.push(note.time);
    }
  });

  return timestamps;
}

/**
 * Format duration as MM:SS string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
