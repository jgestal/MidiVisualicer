/**
 * Exportaciones del feature library
 */

// Context
export { MidiProvider, useMidi, useParsedMidi, useMidiLoading } from './context/MidiContext';

// Types (re-export from shared)
export type { MidiFile, ParsedMidi, MidiTrack, MidiNote } from '@/shared/types/midi';
