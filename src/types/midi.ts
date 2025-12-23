/**
 * Re-export de tipos MIDI desde shared/types
 * Este archivo existe para mantener compatibilidad con imports existentes
 * La fuente de verdad está en @/shared/types/midi.ts
 */
export type {
  MidiFile,
  MidiFolder,
  MidiTrack,
  MidiNote,
  ParsedMidi,
  ChordInfo,
  PlaybackSpeed,
  PlaybackState,
} from '@/shared/types/midi';
