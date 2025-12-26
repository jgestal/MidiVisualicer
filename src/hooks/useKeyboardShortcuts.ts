/**
 * useKeyboardShortcuts - Global keyboard shortcuts hook
 * Handles playback, navigation, transpose, and speed controls
 */
import { useEffect, useCallback } from 'react';
import { usePlayback } from '@/features/player/context/PlaybackContext';
import { useTracks } from '@/features/tracks/context/TracksContext';
import { useInstrument } from '@/features/instruments/context/InstrumentContext';
import { useMidi } from '@/shared/context/MidiContext';

export function useKeyboardShortcuts(): void {
  const { state: midiState } = useMidi();
  const {
    state: playbackState,
    play,
    pause,
    seekTo,
    setSpeed,
  } = usePlayback();
  const { state: tracksState, toggleMute } = useTracks();
  const { state: instrumentState, setTranspose, toggleAutoTranspose } = useInstrument();

  const { isPlaying, currentTime, trackVolumes } = playbackState;
  const { parsedMidi } = midiState;
  const { selectedTrackIndex: selectedTrack, mutedTracks } = tracksState;
  const { transpose } = instrumentState;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else if (parsedMidi) {
          play(parsedMidi, mutedTracks, trackVolumes);
        }
        break;

      case 'KeyR':
        seekTo(0);
        break;

      case 'KeyM':
        if (selectedTrack >= 0) {
          toggleMute(selectedTrack);
          // setTrackMuted is now handled automatically by PlaybackContext effect syncing with TracksContext
        }
        break;

      case 'ArrowLeft':
        // Seek backward 5 seconds (or 1 with Shift)
        seekTo(Math.max(0, currentTime - (e.shiftKey ? 1 : 5)));
        break;

      case 'ArrowRight':
        // Seek forward 5 seconds (or 1 with Shift)
        seekTo(currentTime + (e.shiftKey ? 1 : 5));
        break;

      case 'ArrowUp':
        // Transpose up (semitone, or octave with Shift)
        e.preventDefault();
        setTranspose(transpose + (e.shiftKey ? 12 : 1));
        break;

      case 'ArrowDown':
        // Transpose down (semitone, or octave with Shift)
        e.preventDefault();
        setTranspose(transpose - (e.shiftKey ? 12 : 1));
        break;

      case 'Home':
        seekTo(0);
        break;

      case 'End':
        if (parsedMidi) {
          seekTo(parsedMidi.duration);
        }
        break;

      case 'Digit1':
        setSpeed(0.25);
        break;

      case 'Digit2':
        setSpeed(0.5);
        break;

      case 'Digit3':
        setSpeed(0.75);
        break;

      case 'Digit4':
        setSpeed(1.0);
        break;

      case 'KeyA':
        if (toggleAutoTranspose) toggleAutoTranspose();
        break;
    }
  }, [
    isPlaying,
    currentTime,
    parsedMidi,
    selectedTrack,
    mutedTracks,
    trackVolumes,
    transpose,
    play,
    pause,
    seekTo,
    setSpeed,
    setTranspose,
    toggleMute,
    toggleAutoTranspose,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
