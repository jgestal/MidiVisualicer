/**
 * UI Color Constants
 * Centralized color definitions for consistent theming
 * 
 * These are semantic colors that should match the CSS variables
 * Used primarily for Canvas rendering where CSS variables aren't available
 */

// Accent colors
export const ACCENT_PRIMARY = '#6366f1'; // Indigo - main accent
export const ACCENT_SUCCESS = '#22c55e'; // Green - success/active states
export const ACCENT_WARNING = '#f59e0b'; // Amber - warnings
export const ACCENT_ERROR = '#ef4444'; // Red - errors/danger

// Piano Roll colors
export const PIANO_ROLL = {
  BACKGROUND: '#0a0a0f',
  BLACK_KEY_BG: '#15151f',
  WHITE_KEY_BG: '#1a1a25',
  KEY_LABEL: '#b0b0c0',
  GRID_LINE: '#2a2a3a',
  NOTE_LABEL: '#a0a0b0',
  PLAYHEAD: ACCENT_PRIMARY,
  LOOP_REGION: 'rgba(99, 102, 241, 0.15)',
  LOOP_BOUNDARY: 'rgba(255, 255, 255, 0.5)',
} as const;

// Note colors by velocity/state
export const NOTE_COLORS = {
  ACTIVE: ACCENT_PRIMARY,
  INACTIVE: '#4f46e5',
  OUT_OF_RANGE: ACCENT_ERROR,
} as const;

// Range indicator colors (for transpose controls)
export const RANGE_COLORS = {
  GOOD: ACCENT_SUCCESS, // >= 90%
  WARNING: ACCENT_WARNING, // >= 70%
  BAD: ACCENT_ERROR, // < 70%
} as const;

/**
 * Get range color based on percentage
 */
export function getRangeColor(percent: number): string {
  if (percent >= 90) return RANGE_COLORS.GOOD;
  if (percent >= 70) return RANGE_COLORS.WARNING;
  return RANGE_COLORS.BAD;
}
