/**
 * Tipos compartidos para MIDI
 */

export interface MidiFile {
  path: string;
  name: string;
  folder: string;
}

export interface MidiFolder {
  name: string;
  path: string;
  files: MidiFile[];
  subfolders: MidiFolder[];
  moreFiles?: number; // Number of additional files not shown (for UI display)
}

export interface MidiTrack {
  index: number;
  name: string;
  instrument: string;
  channel: number;
  noteCount: number;
  notes: MidiNote[];
}

export interface MidiNote {
  midi: number; // MIDI number (0-127)
  name: string; // Nombre de la nota (ej: "C4")
  time: number; // Tiempo de inicio en segundos
  duration: number; // Duration in seconds
  velocity: number; // Velocidad (0-1)
  ticks: number; // Tiempo en ticks
  durationTicks: number; // Duration in ticks
}

export interface ParsedMidi {
  name: string;
  duration: number; // Total duration in seconds
  bpm: number; // Tempo principal
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  tracks: MidiTrack[];
  header: {
    ppq: number; // Pulses per quarter note
    tempos: Array<{ bpm: number; time: number }>;
  };
  fileSize?: number; // File size in bytes
}

export interface ChordInfo {
  name: string;
  notes: string[];
  time: number;
  duration: number;
}

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1.0;

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  isLoopEnabled: boolean;
  isCountInEnabled: boolean;
  activeNotes: number[];
}
