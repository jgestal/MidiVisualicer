/**
 * useMetronome - Hook para el metrónomo con audio
 * Usa setInterval para timing independiente del Transport de Tone.js
 */
import { useCallback, useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';

interface UseMetronomeOptions {
  bpm: number;
  isPlaying: boolean;
  speed?: number; // Playback speed multiplier
}

const METRONOME_KEY = 'midi-visualizer-metronome';

function loadMetronomeState(): boolean {
  try {
    return localStorage.getItem(METRONOME_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMetronomeState(enabled: boolean): void {
  try {
    localStorage.setItem(METRONOME_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving metronome state:', e);
  }
}

export function useMetronome({ bpm, isPlaying, speed = 1 }: UseMetronomeOptions) {
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(loadMetronomeState);
  const synthRef = useRef<Tone.MembraneSynth | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize synth once
  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 4,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.05,
      },
    }).toDestination();

    synthRef.current.volume.value = -5;

    return () => {
      synthRef.current?.dispose();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle metronome clicks - respects playback speed
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isMetronomeEnabled && isPlaying && synthRef.current) {
      // Adjust BPM based on playback speed
      const effectiveBpm = bpm * speed;
      const intervalMs = (60 / effectiveBpm) * 1000;

      // Start Tone.js context if needed
      if (Tone.context.state !== 'running') {
        Tone.start();
      }

      // Play first click immediately
      synthRef.current.triggerAttackRelease('C2', '32n');

      // Set interval for subsequent clicks
      intervalRef.current = window.setInterval(() => {
        if (synthRef.current && isPlaying) {
          synthRef.current.triggerAttackRelease('C2', '32n');
        }
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bpm, isPlaying, isMetronomeEnabled, speed]);

  const toggleMetronome = useCallback(async () => {
    // Ensure Tone.js is started (needs user interaction)
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setIsMetronomeEnabled(prev => {
      const newValue = !prev;
      saveMetronomeState(newValue);
      return newValue;
    });
  }, []);

  return {
    isMetronomeEnabled,
    toggleMetronome,
  };
}

export default useMetronome;

