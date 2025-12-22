/**
 * Exportaciones del feature library
 */

// Contexts
export { MidiProvider, useMidi, useParsedMidi, useMidiLoading } from './context/MidiContext';
export { LibraryProvider, useLibrary, useFilteredLibrary } from './context/LibraryContext';

// Components
export { LibraryExplorer } from './components/LibraryExplorer';

// Services
export { LibraryService } from './services/LibraryService';

// Types
export type { StoredMidiFile } from './services/LibraryService';
export type { LibraryItem } from './context/LibraryContext';

// Re-export from shared
export type { MidiFile, ParsedMidi, MidiTrack, MidiNote } from '@/shared/types/midi';
