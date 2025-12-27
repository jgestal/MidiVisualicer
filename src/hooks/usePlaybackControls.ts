/**
 * usePlaybackControls - Simplified interface for playback operations
 * 
 * Single Responsibility: Provides a clean, unified API for playback controls
 * Wraps usePlayback context with additional convenience methods
 */
import { useCallback } from 'react';
import { usePlayback } from '../features/player/context/PlaybackContext';
import type { ParsedMidi, PlaybackSpeed } from '../shared/types/midi';

interface UsePlaybackControlsOptions {
  parsedMidi: ParsedMidi | null;
  mutedTracks: Set<number>;
  trackVolumes: Map<number, number>;
}

export function usePlaybackControls({
  parsedMidi,
  mutedTracks,
  trackVolumes,
}: UsePlaybackControlsOptions) {
  const {
    state,
    play: playInternal,
    pause,
    stop,
    seekTo,
    setSpeed,
    setLoopStart,
    setLoopEnd,
    toggleLoop,
    clearLoop,
    toggleCountIn,
    setCountInDuration,
    toggleSpeedTrainer,
    setSpeedTrainer,
  } = usePlayback();

  // Wrapped play function with default parameters
  const handlePlay = useCallback(() => {
    if (!parsedMidi) return;
    playInternal(parsedMidi, mutedTracks, trackVolumes);
  }, [parsedMidi, mutedTracks, trackVolumes, playInternal]);

  // Quick seek operations
  const seekBackward = useCallback((seconds = 5) => {
    seekTo(Math.max(0, state.currentTime - seconds));
  }, [seekTo, state.currentTime]);

  const seekForward = useCallback((seconds = 5) => {
    seekTo(Math.min(state.duration, state.currentTime + seconds));
  }, [seekTo, state.currentTime, state.duration]);

  const restart = useCallback(() => {
    seekTo(0);
  }, [seekTo]);

  // Speed control helpers
  const speedUp = useCallback(() => {
    const speeds: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(state.speed);
    if (currentIndex < speeds.length - 1) {
      setSpeed(speeds[currentIndex + 1]);
    }
  }, [state.speed, setSpeed]);

  const slowDown = useCallback(() => {
    const speeds: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(state.speed);
    if (currentIndex > 0) {
      setSpeed(speeds[currentIndex - 1]);
    }
  }, [state.speed, setSpeed]);

  return {
    // State (read-only)
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    currentTime: state.currentTime,
    duration: state.duration,
    speed: state.speed,
    loopStart: state.loopStart,
    loopEnd: state.loopEnd,
    isLoopEnabled: state.isLoopEnabled,
    isCountInEnabled: state.isCountInEnabled,
    countInDuration: state.countInDuration,
    speedTrainer: state.speedTrainer,
    trackVolumes: state.trackVolumes,

    // Basic controls
    play: handlePlay,
    pause,
    stop,
    seekTo,
    restart,

    // Quick seek
    seekBackward,
    seekForward,

    // Speed controls
    setSpeed,
    speedUp,
    slowDown,

    // Loop controls
    setLoopStart,
    setLoopEnd,
    toggleLoop,
    clearLoop,

    // Count-in controls
    toggleCountIn,
    setCountInDuration,

    // Speed trainer
    toggleSpeedTrainer,
    setSpeedTrainer,
  };
}
