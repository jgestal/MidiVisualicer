/**
 * Contexto para la gestión del archivo MIDI cargado
 * Maneja la carga, parsing y estado del MIDI actual
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Midi } from '@tonejs/midi';
import type { ParsedMidi, MidiTrack, MidiNote, MidiFile } from '@/shared/types/midi';
import { getGMInstrumentName } from '@/shared/constants/gmInstruments';


// Estado del contexto
interface MidiState {
  parsedMidi: ParsedMidi | null;
  selectedFile: MidiFile | null;
  isLoading: boolean;
  error: string | null;
}

// Acciones
type MidiAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { midi: ParsedMidi; file?: MidiFile } }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CLEAR' };

// Estado inicial
const initialState: MidiState = {
  parsedMidi: null,
  selectedFile: null,
  isLoading: false,
  error: null,
};

// Reducer
function midiReducer(state: MidiState, action: MidiAction): MidiState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        parsedMidi: action.payload.midi,
        selectedFile: action.payload.file || null,
        error: null,
      };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

// Tipo del contexto
interface MidiContextType {
  state: MidiState;
  loadMidiFile: (file: File) => Promise<ParsedMidi | null>;
  loadMidiFromUrl: (url: string, fileInfo?: MidiFile) => Promise<ParsedMidi | null>;
  clearMidi: () => void;
}

// Contexto
const MidiContext = createContext<MidiContextType | null>(null);

// Provider
export function MidiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(midiReducer, initialState);

  // Función para parsear el MIDI desde ArrayBuffer
  const parseMidiBuffer = useCallback(
    async (arrayBuffer: ArrayBuffer, fileName: string): Promise<ParsedMidi> => {
      const midi = new Midi(arrayBuffer);

      // Extraer información del tempo
      const tempos = midi.header.tempos.map((t) => ({
        bpm: t.bpm,
        time: t.time ?? 0,
      }));

      const mainBpm = tempos.length > 0 ? tempos[0].bpm : 120;

      // Extraer time signature
      const timeSignatures = midi.header.timeSignatures;
      const timeSignature =
        timeSignatures.length > 0
          ? {
            numerator: timeSignatures[0].timeSignature[0],
            denominator: timeSignatures[0].timeSignature[1],
          }
          : { numerator: 4, denominator: 4 };

      // Procesar pistas
      const tracks: MidiTrack[] = midi.tracks
        .map((track, index) => {
          const instrumentNum = track.instrument?.number ?? 0;
          const notes: MidiNote[] = track.notes.map((note) => ({
            midi: note.midi,
            name: note.name,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            ticks: note.ticks,
            durationTicks: note.durationTicks,
          }));

          return {
            index,
            name: track.name || `Track ${index + 1}`,
            instrument: getGMInstrumentName(instrumentNum),
            channel: track.channel,
            noteCount: notes.length,
            notes,
          };
        })
        .filter((track) => track.noteCount > 0);

      return {
        name: fileName.replace('.mid', '').replace('.midi', ''),
        duration: midi.duration,
        bpm: mainBpm,
        timeSignature,
        tracks,
        header: {
          ppq: midi.header.ppq,
          tempos,
        },
      };
    },
    []
  );

  // Cargar MIDI desde archivo
  const loadMidiFile = useCallback(
    async (file: File): Promise<ParsedMidi | null> => {
      dispatch({ type: 'LOAD_START' });

      try {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await parseMidiBuffer(arrayBuffer, file.name);
        // Add file size to parsed MIDI
        parsed.fileSize = file.size;
        dispatch({ type: 'LOAD_SUCCESS', payload: { midi: parsed } });
        return parsed;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido al cargar MIDI';
        dispatch({ type: 'LOAD_ERROR', payload: message });
        console.error('Error loading MIDI:', err);
        return null;
      }
    },
    [parseMidiBuffer]
  );

  // Cargar MIDI desde URL
  const loadMidiFromUrl = useCallback(
    async (url: string, fileInfo?: MidiFile): Promise<ParsedMidi | null> => {
      dispatch({ type: 'LOAD_START' });

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const fileName = fileInfo?.name || url.split('/').pop() || 'midi.mid';
        const parsed = await parseMidiBuffer(arrayBuffer, fileName);
        // Add file size from arrayBuffer
        parsed.fileSize = arrayBuffer.byteLength;

        dispatch({
          type: 'LOAD_SUCCESS',
          payload: { midi: parsed, file: fileInfo },
        });
        return parsed;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido al cargar MIDI';
        dispatch({ type: 'LOAD_ERROR', payload: message });
        console.error('Error loading MIDI from URL:', err);
        return null;
      }
    },
    [parseMidiBuffer]
  );

  // Limpiar MIDI
  const clearMidi = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value: MidiContextType = {
    state,
    loadMidiFile,
    loadMidiFromUrl,
    clearMidi,
  };

  return <MidiContext.Provider value={value}>{children}</MidiContext.Provider>;
}

// Hook para usar el contexto
export function useMidi() {
  const context = useContext(MidiContext);
  if (!context) {
    throw new Error('useMidi must be used within a MidiProvider');
  }
  return context;
}

// Exportar selectores individuales para comodidad
export function useParsedMidi() {
  const { state } = useMidi();
  return state.parsedMidi;
}

export function useMidiLoading() {
  const { state } = useMidi();
  return { isLoading: state.isLoading, error: state.error };
}
