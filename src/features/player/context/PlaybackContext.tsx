/**
 * MIDI playback context
 * Handles play, pause, stop, speed, loops, current time and track volumes
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
import { volumeToDb } from '@/utils/audioUtils';
import { useTracks } from '@/features/tracks/context/TracksContext';

// Context state
interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  loopStart: number | null;
  loopEnd: number | null;
  isLoopEnabled: boolean;
  isCountInEnabled: boolean;
  activeNotes: number[]; // MIDI note values currently playing
  trackVolumes: Map<number, number>; // Map of track index to volume (0-100)
}

// Actions
type PlaybackAction =
  | { type: 'PLAY'; payload: { duration: number } }
  | { type: 'PAUSE'; payload: { currentTime: number } }
  | { type: 'STOP' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_SPEED'; payload: PlaybackSpeed }
  | { type: 'SET_LOOP_START'; payload: number | null }
  | { type: 'SET_LOOP_END'; payload: number | null }
  | { type: 'TOGGLE_LOOP' }
  | { type: 'CLEAR_LOOP' }
  | { type: 'TOGGLE_COUNT_IN' }
  | { type: 'SET_ACTIVE_NOTES'; payload: number[] }
  | { type: 'SET_TRACK_VOLUME'; payload: { trackIndex: number; volume: number } };

// Initial state
const initialState: PlaybackState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  speed: 1.0,
  loopStart: null,
  loopEnd: null,
  isLoopEnabled: false,
  isCountInEnabled: false,
  activeNotes: [],
  trackVolumes: new Map(),
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
    case 'TOGGLE_COUNT_IN':
      return { ...state, isCountInEnabled: !state.isCountInEnabled };
    case 'SET_ACTIVE_NOTES':
      // Only update if notes have changed to avoid unnecessary re-renders
      if (JSON.stringify(state.activeNotes) === JSON.stringify(action.payload)) return state;
      return { ...state, activeNotes: action.payload };
    case 'SET_TRACK_VOLUME': {
      const newVolumes = new Map(state.trackVolumes);
      newVolumes.set(action.payload.trackIndex, action.payload.volume);
      return { ...state, trackVolumes: newVolumes };
    }
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
  toggleCountIn: () => void;
  setTrackVolume: (trackIndex: number, volume: number) => void;
  setTrackMuted: (trackIndex: number, muted: boolean) => void;
}

// Context
const PlaybackContext = createContext<PlaybackContextType | null>(null);

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
  const { state: tracksState, getEffectiveMutedTracks } = useTracks();
  const mutedTracksRef = useRef<Set<number>>(new Set());
  const loopStartRef = useRef<number | null>(null);
  const loopEndRef = useRef<number | null>(null);
  const isLoopEnabledRef = useRef(false);
  const countInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCountInEnabledRef = useRef(false);

  // Initialize Tone.js
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return;
    await Tone.start();
    isInitializedRef.current = true;
  }, []);

  // Sync refs with state (important for closures in callbacks)
  useEffect(() => {
    isCountInEnabledRef.current = state.isCountInEnabled;
  }, [state.isCountInEnabled]);

  useEffect(() => {
    isLoopEnabledRef.current = state.isLoopEnabled;
    loopStartRef.current = state.loopStart;
    loopEndRef.current = state.loopEnd;
  }, [state.isLoopEnabled, state.loopStart, state.loopEnd]);

  // Sync muted tracks from TracksContext
  useEffect(() => {
    if (!currentMidiRef.current) return;

    const effectiveMuted = getEffectiveMutedTracks(currentMidiRef.current.tracks.length);
    mutedTracksRef.current = effectiveMuted;

    // Update synths in real-time
    synthsRef.current.forEach((synth, index) => {
      if (synth) {
        if (effectiveMuted.has(index)) {
          synth.volume.value = -Infinity;
        } else {
          const volume = trackVolumesRef.current.get(index) ?? 100;
          synth.volume.value = volumeToDb(volume);
        }
      }
    });
  }, [tracksState.mutedTracks, tracksState.soloTrack, getEffectiveMutedTracks]);

  // Create synthesizers
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

  // Schedule a track
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

  // Play
  const play = useCallback(
    async (
      midi: ParsedMidi,
      _mutedTracks?: Set<number>, // Kept for API compatibility but unused
      trackVolumes: Map<number, number> = new Map()
    ) => {
      await initialize();

      // Store refs for later use
      trackVolumesRef.current = trackVolumes;

      const effectiveMuted = getEffectiveMutedTracks(midi.tracks.length);
      mutedTracksRef.current = effectiveMuted;

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
        scheduleTrack(track, index, speed, mutedTracksRef.current.has(index));
      });

      // Configurar transporte
      Tone.Transport.bpm.value = midi.bpm * speed;

      // If paused, resume from where it left off
      if (state.isPaused && pauseTimeRef.current > 0) {
        Tone.Transport.seconds = pauseTimeRef.current / speed;
      } else {
        Tone.Transport.seconds = 0;
      }

      // Function to start playback and animation
      const startPlayback = () => {
        Tone.Transport.start();
        dispatch({ type: 'PLAY', payload: { duration: adjustedDuration } });
        animationFrameRef.current = requestAnimationFrame(updateTime);

        // Schedule stop at end
        Tone.Transport.schedule(() => {
          stop();
        }, adjustedDuration);
      };

      // Update time function
      const updateTime = () => {
        if (Tone.Transport.state === 'started') {
          const currentTime = Tone.Transport.seconds * speed;
          dispatch({ type: 'SET_TIME', payload: currentTime });

          // Calculate active notes for chord detection
          const activeNotes: number[] = [];
          if (midi) {
            midi.tracks.forEach((track, trackIdx) => {
              if (!mutedTracksRef.current.has(trackIdx)) {
                // Find notes active at current time
                track.notes.forEach(note => {
                  if (currentTime >= note.time && currentTime <= note.time + note.duration) {
                    activeNotes.push(note.midi);
                  }
                });
              }
            });
          }
          dispatch({ type: 'SET_ACTIVE_NOTES', payload: activeNotes });

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

      // Count-in logic (applies to both fresh start and resume from pause)
      if (isCountInEnabledRef.current) {
        const now = Tone.now();
        // Create a simple click synth
        const clickSynth = new Tone.MembraneSynth({
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();
        clickSynth.volume.value = -10; // Slightly quieter

        // Schedule 3 clicks
        for (let i = 0; i < 3; i++) {
          // Higher pitch for count-in
          clickSynth.triggerAttackRelease("C4", "32n", now + i);
        }

        // Cleanup synth after clicks
        setTimeout(() => clickSynth.dispose(), 3500);

        // Start transport after 3 seconds using setTimeout
        countInTimerRef.current = setTimeout(() => {
          startPlayback();
          countInTimerRef.current = null;
        }, 3000);
      } else {
        startPlayback();
      }
    },
    [initialize, createSynths, scheduleTrack, state.speed, state.isPaused]
  );

  // Pause
  const pause = useCallback(() => {
    if (state.isPlaying) {
      pauseTimeRef.current = Tone.Transport.seconds * state.speed;
      Tone.Transport.pause();

      // Clear count-in timer if paused during count-in
      if (countInTimerRef.current) {
        clearTimeout(countInTimerRef.current);
        countInTimerRef.current = null;
      }

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

    // Clear count-in timer
    if (countInTimerRef.current) {
      clearTimeout(countInTimerRef.current);
      countInTimerRef.current = null;
    }

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

  // Seek to specific time
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
    // Auto-swap if Start > End
    if (time !== null && loopEndRef.current !== null && time > loopEndRef.current) {
      const newStart = loopEndRef.current;
      const newEnd = time;

      loopStartRef.current = newStart;
      loopEndRef.current = newEnd;

      dispatch({ type: 'SET_LOOP_START', payload: newStart });
      dispatch({ type: 'SET_LOOP_END', payload: newEnd });
      return;
    }

    loopStartRef.current = time;
    dispatch({ type: 'SET_LOOP_START', payload: time });
  }, []);

  const setLoopEnd = useCallback((time: number | null) => {
    // Auto-swap if End < Start
    if (time !== null && loopStartRef.current !== null && time < loopStartRef.current) {
      const newStart = time;
      const newEnd = loopStartRef.current;

      loopStartRef.current = newStart;
      loopEndRef.current = newEnd;

      dispatch({ type: 'SET_LOOP_START', payload: newStart });
      dispatch({ type: 'SET_LOOP_END', payload: newEnd });
      return;
    }

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

  const toggleCountIn = useCallback(() => {
    isCountInEnabledRef.current = !isCountInEnabledRef.current;
    dispatch({ type: 'TOGGLE_COUNT_IN' });
  }, []);

  // Set track volume in real-time
  const setTrackVolume = useCallback((trackIndex: number, volume: number) => {
    trackVolumesRef.current.set(trackIndex, volume);
    const synth = synthsRef.current[trackIndex];
    if (synth) {
      synth.volume.value = volumeToDb(volume);
    }
    dispatch({ type: 'SET_TRACK_VOLUME', payload: { trackIndex, volume } });
  }, []);

  // Set track muted in real-time
  const setTrackMuted = useCallback((_trackIndex: number, _muted: boolean) => {
    // This is now handled automatically by the effect syncing with TracksContext
    // We keep the function for backward compatibility
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
    toggleCountIn,
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
