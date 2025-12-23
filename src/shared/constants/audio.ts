/**
 * Audio Constants
 * Centralized configuration for Tone.js audio engine
 */

/** Default synthesizer envelope */
export const DEFAULT_SYNTH_ENVELOPE = {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 0.8,
} as const;

/** Default synthesizer oscillator type */
export const DEFAULT_OSCILLATOR_TYPE = 'triangle' as const;

/** Default volume in dB */
export const DEFAULT_VOLUME_DB = -8;

/** Minimum note duration in seconds */
export const MIN_NOTE_DURATION = 0.05;

/** Default BPM when not specified */
export const DEFAULT_BPM = 120;

/**
 * Convert percentage (0-100) to dB for Tone.js (-Infinity to 0)
 * Maps 0-100 to -40dB to 0dB (with some headroom)
 */
export function volumePercentToDb(volume: number): number {
    if (volume <= 0) return -Infinity;
    return (volume / 100) * 40 - 40;
}

/** Available playback speeds */
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1.0] as const;
