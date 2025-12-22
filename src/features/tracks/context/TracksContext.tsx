/**
 * Contexto para la gestión de pistas del MIDI
 * Maneja selección, mute, solo y análisis de melodía
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { MidiTrack } from '@/shared/types/midi';

// Análisis de pista para detectar melodía
interface TrackAnalysis {
  trackIndex: number;
  melodyScore: number;
  isLikelyMelody: boolean;
  characteristics: {
    avgNoteDuration: number;
    noteVariety: number;
    hasChords: boolean;
    avgNoteCount: number;
    pitchRange: { min: number; max: number };
    avgPitch: number;
  };
}

// Estado del contexto
interface TracksState {
  selectedTrackIndex: number;
  mutedTracks: Set<number>;
  soloTrack: number | null;
  autoSelectMelody: boolean;
}

// Acciones
type TracksAction =
  | { type: 'SELECT_TRACK'; payload: number }
  | { type: 'TOGGLE_MUTE'; payload: number }
  | { type: 'SET_SOLO'; payload: number | null }
  | { type: 'RESET'; payload?: { selectedTrack?: number } }
  | { type: 'SET_AUTO_SELECT_MELODY'; payload: boolean };

// Estado inicial
const initialState: TracksState = {
  selectedTrackIndex: 0,
  mutedTracks: new Set(),
  soloTrack: null,
  autoSelectMelody: true,
};

// Reducer
function tracksReducer(state: TracksState, action: TracksAction): TracksState {
  switch (action.type) {
    case 'SELECT_TRACK':
      return { ...state, selectedTrackIndex: action.payload };

    case 'TOGGLE_MUTE': {
      const newMuted = new Set(state.mutedTracks);
      if (newMuted.has(action.payload)) {
        newMuted.delete(action.payload);
      } else {
        newMuted.add(action.payload);
      }
      return { ...state, mutedTracks: newMuted };
    }

    case 'SET_SOLO': {
      // Si ya está en solo, quitarlo
      if (state.soloTrack === action.payload) {
        return { ...state, soloTrack: null };
      }
      return { ...state, soloTrack: action.payload };
    }

    case 'RESET':
      return {
        ...initialState,
        selectedTrackIndex: action.payload?.selectedTrack ?? 0,
        autoSelectMelody: state.autoSelectMelody,
      };

    case 'SET_AUTO_SELECT_MELODY':
      return { ...state, autoSelectMelody: action.payload };

    default:
      return state;
  }
}

// Función para analizar una pista
function analyzeTrack(track: MidiTrack): TrackAnalysis {
  const notes = track.notes;
  if (notes.length === 0) {
    return {
      trackIndex: track.index,
      melodyScore: 0,
      isLikelyMelody: false,
      characteristics: {
        avgNoteDuration: 0,
        noteVariety: 0,
        hasChords: false,
        avgNoteCount: 0,
        pitchRange: { min: 0, max: 0 },
        avgPitch: 0,
      },
    };
  }

  // Calcular características
  const pitches = notes.map((n) => n.midi);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;

  const durations = notes.map((n) => n.duration);
  const avgNoteDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // Variedad de notas (notas únicas / total)
  const uniqueNotes = new Set(pitches);
  const noteVariety = uniqueNotes.size / notes.length;

  // Detectar acordes (notas simultáneas)
  const sortedByTime = [...notes].sort((a, b) => a.time - b.time);
  let chordCount = 0;
  const tolerance = 0.05; // 50ms

  for (let i = 0; i < sortedByTime.length - 1; i++) {
    if (Math.abs(sortedByTime[i + 1].time - sortedByTime[i].time) < tolerance) {
      chordCount++;
    }
  }
  const hasChords = chordCount > notes.length * 0.1; // Más del 10% son acordes

  // Notas por segundo
  const duration = notes[notes.length - 1].time - notes[0].time;
  const avgNoteCount = duration > 0 ? notes.length / duration : 0;

  // Calcular score de melodía
  // Mayor score = más probable que sea melodía
  let melodyScore = 0;

  // Pitch alto contribuye positivamente
  if (avgPitch > 60) melodyScore += 0.2;
  if (avgPitch > 72) melodyScore += 0.1;

  // Variedad de notas contribuye positivamente
  melodyScore += noteVariety * 0.3;

  // Menos acordes es mejor para melodía
  if (!hasChords) melodyScore += 0.2;

  // Nombre de pista puede indicar melodía
  const name = track.name.toLowerCase();
  if (
    name.includes('melody') ||
    name.includes('lead') ||
    name.includes('vocal') ||
    name.includes('solo')
  ) {
    melodyScore += 0.3;
  }

  // Penalizar bajos y drums
  if (name.includes('bass') || name.includes('drum') || name.includes('percussion')) {
    melodyScore -= 0.5;
  }
  if (avgPitch < 48) melodyScore -= 0.3; // Notas muy graves

  return {
    trackIndex: track.index,
    melodyScore: Math.max(0, Math.min(1, melodyScore)),
    isLikelyMelody: melodyScore > 0.4,
    characteristics: {
      avgNoteDuration,
      noteVariety,
      hasChords,
      avgNoteCount,
      pitchRange: { min: minPitch, max: maxPitch },
      avgPitch,
    },
  };
}

// Detectar la pista de melodía
export function detectMelodyTrack(tracks: MidiTrack[]): number {
  if (tracks.length === 0) return 0;
  if (tracks.length === 1) return 0;

  const analyses = tracks.map(analyzeTrack);
  const sorted = [...analyses].sort((a, b) => b.melodyScore - a.melodyScore);

  return sorted[0].trackIndex;
}

// Tipo del contexto
interface TracksContextType {
  state: TracksState;
  selectTrack: (index: number) => void;
  toggleMute: (index: number) => void;
  setSolo: (index: number | null) => void;
  resetTracks: (melodyTrackIndex?: number) => void;
  setAutoSelectMelody: (enabled: boolean) => void;
  getEffectiveMutedTracks: (trackCount: number) => Set<number>;
  analyzeTrack: (track: MidiTrack) => TrackAnalysis;
  detectMelodyTrack: (tracks: MidiTrack[]) => number;
}

// Contexto
const TracksContext = createContext<TracksContextType | null>(null);

// Provider
export function TracksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tracksReducer, initialState);

  const selectTrack = useCallback((index: number) => {
    dispatch({ type: 'SELECT_TRACK', payload: index });
  }, []);

  const toggleMute = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_MUTE', payload: index });
  }, []);

  const setSolo = useCallback((index: number | null) => {
    dispatch({ type: 'SET_SOLO', payload: index });
  }, []);

  const resetTracks = useCallback((melodyTrackIndex?: number) => {
    dispatch({ type: 'RESET', payload: { selectedTrack: melodyTrackIndex } });
  }, []);

  const setAutoSelectMelody = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_SELECT_MELODY', payload: enabled });
  }, []);

  // Calcular pistas efectivamente muteadas (considerando solo)
  const getEffectiveMutedTracks = useCallback(
    (trackCount: number): Set<number> => {
      if (state.soloTrack !== null) {
        // Si hay solo, mutear todas excepto la solista
        const muted = new Set<number>();
        for (let i = 0; i < trackCount; i++) {
          if (i !== state.soloTrack) {
            muted.add(i);
          }
        }
        return muted;
      }
      return state.mutedTracks;
    },
    [state.soloTrack, state.mutedTracks]
  );

  const value: TracksContextType = {
    state,
    selectTrack,
    toggleMute,
    setSolo,
    resetTracks,
    setAutoSelectMelody,
    getEffectiveMutedTracks,
    analyzeTrack,
    detectMelodyTrack,
  };

  return <TracksContext.Provider value={value}>{children}</TracksContext.Provider>;
}

// Hook para usar el contexto
export function useTracks() {
  const context = useContext(TracksContext);
  if (!context) {
    throw new Error('useTracks must be used within a TracksProvider');
  }
  return context;
}

// Hook para obtener la pista seleccionada
export function useSelectedTrack() {
  const { state } = useTracks();
  return state.selectedTrackIndex;
}

// Hook para verificar si una pista está muteada
export function useIsTrackMuted(trackIndex: number) {
  const { state } = useTracks();
  return state.mutedTracks.has(trackIndex);
}
