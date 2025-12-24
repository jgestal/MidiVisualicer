/**
 * useMasterVolume - Hook for managing master volume
 * Handles volume state, mute toggle, and Tone.js destination sync
 */
import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { volumeToDb } from '../utils/audioUtils';

const STORAGE_KEY = 'midi-visualizer-volume';
const DEFAULT_VOLUME = 80;

interface UseMasterVolumeResult {
  volume: number;
  isMuted: boolean;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

export function useMasterVolume(): UseMasterVolumeResult {
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_VOLUME;
  });
  const [isMuted, setIsMuted] = useState(false);

  // Sync volume with Tone.js destination
  useEffect(() => {
    if (isMuted) {
      Tone.getDestination().volume.value = -Infinity;
    } else {
      Tone.getDestination().volume.value = volumeToDb(volume);
    }
    localStorage.setItem(STORAGE_KEY, String(volume));
  }, [volume, isMuted]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    // Auto-unmute when adjusting volume
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    volume,
    isMuted,
    setVolume,
    toggleMute,
  };
}

export default useMasterVolume;
