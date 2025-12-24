/**
 * Exports del feature tracks
 */

// Context
export {
  TracksProvider,
  useTracks,
  useSelectedTrack,
  useIsTrackMuted,
  detectMelodyTrack,
} from './context/TracksContext';

// Components
export { TrackManager } from './components';
export type { TrackManagerProps } from './components';
