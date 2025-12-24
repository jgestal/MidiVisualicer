/**
 * Audio utility functions
 * Centralized helpers for audio calculations
 */

/**
 * Convert a volume percentage (0-100) to decibels
 * Uses a logarithmic scale for more natural volume perception
 * 
 * @param volume - Volume as percentage (0-100)
 * @returns Volume in decibels (-Infinity to 0)
 */
export function volumeToDb(volume: number): number {
  if (volume <= 0) return -Infinity;
  // Logarithmic scale: 0-100% maps to about -40dB to 0dB
  return 20 * Math.log10(volume / 100);
}

/**
 * Convert decibels to volume percentage (0-100)
 * 
 * @param db - Volume in decibels
 * @returns Volume as percentage (0-100)
 */
export function dbToVolume(db: number): number {
  if (db <= -Infinity) return 0;
  return Math.round(Math.pow(10, db / 20) * 100);
}

/**
 * Clamp volume to valid range
 * 
 * @param volume - Volume value
 * @returns Clamped volume (0-100)
 */
export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(100, volume));
}
