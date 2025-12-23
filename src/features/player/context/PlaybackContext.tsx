/**
 * Contexto para la gestión de la reproducción de MIDI
 * Maneja play, pause, stop, velocidad, loops, tiempo actual y volúmenes por pista
 */
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import * as Tone from 'tone';
import type { ParsedMidi, MidiTrack, PlaybackSpeed } from '@/shared/types/midi';

// Estado del contexto
interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  loopStart: number | null;
  loopEnd: number | null;
  isLoopEnabled: boolean;
}

// Acciones
type PlaybackAction =
  | { type: 'PLAY'; payload: { duration: number } }
  | { type: 'PAUSE'; payload: { currentTime: number } }
  | { type: 'STOP' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_SPEED'; payload: PlaybackSpeed }
  | { type: 'SET_LOOP_START'; payload: number | null }
  | { type: 'SET_LOOP_END'; payload: number | null }
  | { type: 'TOGGLE_LOOP' }
  | { type: 'CLEAR_LOOP' };

// Estado inicial
const initialState: PlaybackState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  speed: 1.0,
  loopStart: null,
  loopEnd: null,
  isLoopEnabled: false,
};

// Reducer
function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        duration: action.payload.duration,
      };
    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
        isPaused: true,
        currentTime: action.payload.currentTime,
      };
    case 'STOP':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'SET_LOOP_START':
      return { ...state, loopStart: action.payload };
    case 'SET_LOOP_END':
      return { ...state, loopEnd: action.payload };
    case 'TOGGLE_LOOP':
      return { ...state, isLoopEnabled: !state.isLoopEnabled };
    case 'CLEAR_LOOP':
      return { ...state, loopStart: null, loopEnd: null, isLoopEnabled: false };
    default:
      return state;
  }
}

// Tipo del contexto
interface PlaybackContextType {
  state: PlaybackState;
  play: (midi: ParsedMidi, mutedTracks?: Set<number>, trackVolumes?: Map<number, number>) => Promise<void>;
  pause: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setLoopStart: (time: number | null) => void;
  setLoopEnd: (time: number | null) => void;
  toggleLoop: () => void;
  clearLoop: () => void;
  setTrackVolume: (trackIndex: number, volume: number) => void;
  setTrackMuted: (trackIndex: number, muted: boolean) => void;
}

// Contexto
const PlaybackContext = createContext<PlaybackContextType | null>(null);

// Convert percentage (0-100) to dB for Tone.js (-Infinity to 0)
function volumeToDb(volume: number): number {
  if (volume <= 0) return -Infinity;
  // Map 0-100 to -40dB to 0dB (with some headroom)
  return (volume / 100) * 40 - 40;
}

// Provider
export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playbackReducer, initialState);

  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const scheduledEventsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();
  const pauseTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const currentMidiRef = useRef<ParsedMidi | null>(null);
  const trackVolumesRef = useRef<Map<number, number>>(new Map());
  const mutedTracksRef = useRef<Set<number>>(new Set());
  const loopStartRef = useRef<number | null>(null);
  const loopEndRef = useRef<number | null>(null);
  const isLoopEnabledRef = useRef(false);

  // Inicializar Tone.js
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return;
    await Tone.start();
    isInitializedRef.current = true;
  }, []);

  // Crear sintetizadores
  const createSynths = useCallback((trackCount: number) => {
    synthsRef.current.forEach((synth) => synth.dispose());
    synthsRef.current = Array.from({ length: trackCount }, (_, index) => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.8,
        },
      }).toDestination();

      // Apply initial volume from trackVolumes or default
      const volume = trackVolumesRef.current.get(index) ?? 100;
      synth.volume.value = volumeToDb(volume);

      return synth;
    });
  }, []);

  // Programar una pista
  const scheduleTrack = useCallback(
    (track: MidiTrack, synthIndex: number, speed: number, isMuted: boolean) => {
      if (isMuted) return;
      const synth = synthsRef.current[synthIndex];
      if (!synth) return;

      track.notes.forEach((note) => {
        const adjustedTime = note.time / speed;
        const adjustedDuration = Math.max(note.duration / speed, 0.05);

        const eventId = Tone.Transport.schedule((time) => {
          synth.triggerAttackRelease(note.name, adjustedDuration, time, note.velocity);
        }, adjustedTime);

        scheduledEventsRef.current.push(eventId);
      });
    },
    []
  );

  // Reproducir
  const play = useCallback(
    async (
      midi: ParsedMidi,
      mutedTracks: Set<number> = new Set(),
      trackVolumes: Map<number, number> = new Map()
    ) => {
      await initialize();

      // Store refs for later use
      trackVolumesRef.current = trackVolumes;
      mutedTracksRef.current = mutedTracks;

      // Limpiar eventos anteriores
      scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
      scheduledEventsRef.current = [];

      createSynths(midi.tracks.length);
      currentMidiRef.current = midi;

      const speed = state.speed;
      const adjustedDuration = midi.duration / speed;

      // Apply volumes to synths
      midi.tracks.forEach((_, index) => {
        const synth = synthsRef.current[index];
        if (synth) {
          const volume = trackVolumes.get(index) ?? 100;
          synth.volume.value = volumeToDb(volume);
        }
      });

      // Programar todas las pistas
      midi.tracks.forEach((track, index) => {
        scheduleTrack(track, index, speed, mutedTracks.has(index));
      });

      // Configurar transporte
      Tone.Transport.bpm.value = midi.bpm * speed;

      // Si estaba pausado, continuar desde donde se quedó
      if (state.isPaused && pauseTimeRef.current > 0) {
        Tone.Transport.seconds = pauseTimeRef.current / speed;
      } else {
        Tone.Transport.seconds = 0;
      }

      Tone.Transport.start();

      dispatch({ type: 'PLAY', payload: { duration: adjustedDuration } });

      // Actualizar tiempo actual
      const updateTime = () => {
        if (Tone.Transport.state === 'started') {
          const currentTime = Tone.Transport.seconds * speed;
          dispatch({ type: 'SET_TIME', payload: currentTime });

          // Check for loop end
          if (isLoopEnabledRef.current && loopEndRef.current !== null && loopStartRef.current !== null) {
            if (currentTime >= loopEndRef.current) {
              // Seek back to loop start
              const loopStartTime = loopStartRef.current;
              Tone.Transport.seconds = loopStartTime / speed;
              pauseTimeRef.current = loopStartTime;
              dispatch({ type: 'SET_TIME', payload: loopStartTime });
              animationFrameRef.current = requestAnimationFrame(updateTime);
              return;
            }
          }

          if (currentTime >= midi.duration) {
            stop();
            return;
          }

          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateTime);

      // Programar parada al final
      Tone.Transport.schedule(() => {
        stop();
      }, adjustedDuration);
    },
    [initialize, createSynths, scheduleTrack, state.speed, state.isPaused]
  );

  // Pausar
  const pause = useCallback(() => {
    if (state.isPlaying) {
      pauseTimeRef.current = Tone.Transport.seconds * state.speed;
      Tone.Transport.pause();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      dispatch({ type: 'PAUSE', payload: { currentTime: pauseTimeRef.current } });
    }
  }, [state.isPlaying, state.speed]);

  // Detener
  const stop = useCallback(() => {
    // 1. Stop Transport
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clears transport schedule

    // 2. Clear our own tracked events
    scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];

    // 3. Immediately silence all synths to prevent hanging notes
    synthsRef.current.forEach((synth) => {
      // releaseAll() is available on PolySynth to stop all currently sounding voices
      if (synth) {
        synth.releaseAll();
      }
    });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    pauseTimeRef.current = 0;
    dispatch({ type: 'STOP' });
  }, []);

  // Ir a tiempo específico
  const seekTo = useCallback(
    (time: number) => {
      const adjustedTime = time / state.speed;
      Tone.Transport.seconds = adjustedTime;
      pauseTimeRef.current = time;
      dispatch({ type: 'SET_TIME', payload: time });
    },
    [state.speed]
  );

  // Cambiar velocidad
  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      dispatch({ type: 'SET_SPEED', payload: speed });
      if (state.isPlaying) {
        Tone.Transport.bpm.value = (Tone.Transport.bpm.value / state.speed) * speed;
      }
    },
    [state.isPlaying, state.speed]
  );

  // Loop controls
  const setLoopStart = useCallback((time: number | null) => {
    loopStartRef.current = time;
    dispatch({ type: 'SET_LOOP_START', payload: time });
  }, []);

  const setLoopEnd = useCallback((time: number | null) => {
    loopEndRef.current = time;
    dispatch({ type: 'SET_LOOP_END', payload: time });
  }, []);

  const toggleLoop = useCallback(() => {
    isLoopEnabledRef.current = !isLoopEnabledRef.current;
    dispatch({ type: 'TOGGLE_LOOP' });
  }, []);

  const clearLoop = useCallback(() => {
    loopStartRef.current = null;
    loopEndRef.current = null;
    isLoopEnabledRef.current = false;
    dispatch({ type: 'CLEAR_LOOP' });
  }, []);

  // Set track volume in real-time
  const setTrackVolume = useCallback((trackIndex: number, volume: number) => {
    trackVolumesRef.current.set(trackIndex, volume);
    const synth = synthsRef.current[trackIndex];
    if (synth) {
      synth.volume.value = volumeToDb(volume);
    }
  }, []);

  // Set track muted in real-time
  const setTrackMuted = useCallback((trackIndex: number, muted: boolean) => {
    if (muted) {
      mutedTracksRef.current.add(trackIndex);
    } else {
      mutedTracksRef.current.delete(trackIndex);
    }
    const synth = synthsRef.current[trackIndex];
    if (synth) {
      // When muted, set volume to -Infinity (silent)
      // When unmuted, restore the actual volume
      if (muted) {
        synth.volume.value = -Infinity;
      } else {
        const volume = trackVolumesRef.current.get(trackIndex) ?? 100;
        synth.volume.value = volumeToDb(volume);
      }
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stop();
      synthsRef.current.forEach((synth) => synth.dispose());
    };
  }, [stop]);

  const value: PlaybackContextType = {
    state,
    play,
    pause,
    stop,
    seekTo,
    setSpeed,
    setLoopStart,
    setLoopEnd,
    toggleLoop,
    clearLoop,
    setTrackVolume,
    setTrackMuted,
  };

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

// Hook para usar el contexto
export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}

// Selectores convenientes
export function usePlaybackState() {
  const { state } = usePlayback();
  return state;
}

export function useIsPlaying() {
  const { state } = usePlayback();
  return state.isPlaying;
}

export function useCurrentTime() {
  const { state } = usePlayback();
  return state.currentTime;
}
