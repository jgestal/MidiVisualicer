/**
 * Hook para la reproducción de MIDI usando Tone.js
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import type { ParsedMidi, MidiTrack, PlaybackState, PlaybackSpeed } from '../types/midi';

export function useMidiPlayer() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    speed: 1.0,
  });

  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);

  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const scheduledEventsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize Tone.js
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    await Tone.start();
    setIsInitialized(true);
  }, [isInitialized]);

  // Create synthesizers para las pistas
  const createSynths = useCallback((trackCount: number) => {
    // Limpiar sintetizadores anteriores
    synthsRef.current.forEach((synth) => synth.dispose());

    // Crear nuevos sintetizadores
    synthsRef.current = Array.from({ length: trackCount }, () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.8,
        },
      }).toDestination();

      synth.volume.value = -8; // Reducir volumen
      return synth;
    });
  }, []);

  // Programar eventos MIDI
  const scheduleTrack = useCallback(
    (track: MidiTrack, synthIndex: number, speed: number, isMuted: boolean = false) => {
      if (isMuted) return;

      const synth = synthsRef.current[synthIndex];
      if (!synth) return;

      track.notes.forEach((note, noteIndex) => {
        const adjustedTime = note.time / speed;
        const adjustedDuration = Math.max(note.duration / speed, 0.05);

        const eventId = Tone.Transport.schedule((time) => {
          synth.triggerAttackRelease(note.name, adjustedDuration, time, note.velocity);
          setCurrentNoteIndex(noteIndex);
        }, adjustedTime);

        scheduledEventsRef.current.push(eventId);
      });
    },
    []
  );

  // Play MIDI
  const play = useCallback(
    async (
      midi: ParsedMidi,
      _selectedTrackIndex: number = 0,
      mutedTracks: Set<number> = new Set()
    ) => {
      await initialize();

      // Limpiar eventos anteriores
      scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
      scheduledEventsRef.current = [];

      createSynths(midi.tracks.length);

      const speed = playbackState.speed;
      const adjustedDuration = midi.duration / speed;

      // Programar todas las pistas
      midi.tracks.forEach((track, index) => {
        scheduleTrack(track, index, speed, mutedTracks.has(index));
      });

      // Configurar transporte
      Tone.Transport.bpm.value = midi.bpm * speed;

      // If paused, resume from where it left off
      if (playbackState.isPaused && pauseTimeRef.current > 0) {
        Tone.Transport.seconds = pauseTimeRef.current / speed;
      } else {
        Tone.Transport.seconds = 0;
      }

      Tone.Transport.start();
      startTimeRef.current = Tone.now();

      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        duration: adjustedDuration,
      }));

      // Actualizar tiempo actual
      const updateTime = () => {
        if (Tone.Transport.state === 'started') {
          const currentTime = Tone.Transport.seconds * playbackState.speed;
          setPlaybackState((prev) => ({ ...prev, currentTime }));

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
    [initialize, createSynths, scheduleTrack, playbackState.speed, playbackState.isPaused]
  );

  // Pause reproducción
  const pause = useCallback(() => {
    if (playbackState.isPlaying) {
      pauseTimeRef.current = Tone.Transport.seconds * playbackState.speed;
      Tone.Transport.pause();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: true,
        currentTime: pauseTimeRef.current,
      }));
    }
  }, [playbackState.isPlaying, playbackState.speed]);

  // Stop playback
  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();

    scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    pauseTimeRef.current = 0;
    setCurrentNoteIndex(-1);

    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    }));
  }, []);

  // Cambiar velocidad
  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setPlaybackState((prev) => ({ ...prev, speed }));

      if (playbackState.isPlaying) {
        Tone.Transport.bpm.value = (Tone.Transport.bpm.value / playbackState.speed) * speed;
      }
    },
    [playbackState.isPlaying, playbackState.speed]
  );

  // Seek to specific time
  const seekTo = useCallback(
    (time: number) => {
      const adjustedTime = time / playbackState.speed;
      Tone.Transport.seconds = adjustedTime;
      pauseTimeRef.current = time;

      setPlaybackState((prev) => ({ ...prev, currentTime: time }));
    },
    [playbackState.speed]
  );

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stop();
      synthsRef.current.forEach((synth) => synth.dispose());
    };
  }, [stop]);

  return {
    playbackState,
    currentNoteIndex,
    isInitialized,
    play,
    pause,
    stop,
    setSpeed,
    seekTo,
    initialize,
  };
}

export default useMidiPlayer;
