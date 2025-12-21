/**
 * Componente selector de pistas MIDI
 */
import { Check, Volume2, VolumeX } from 'lucide-react';
import type { MidiTrack } from '../types/midi';

interface TrackSelectorProps {
  tracks: MidiTrack[];
  selectedTrack: number;
  mutedTracks: Set<number>;
  onSelectTrack: (index: number) => void;
  onToggleMute: (index: number) => void;
}

export function TrackSelector({
  tracks,
  selectedTrack,
  mutedTracks,
  onSelectTrack,
  onToggleMute
}: TrackSelectorProps) {
  return (
    <div className="track-selector">
      {tracks.map((track) => (
        <div
          key={track.index}
          className={`track-item ${selectedTrack === track.index ? 'selected' : ''}`}
        >
          <div
            className="track-checkbox"
            onClick={() => onSelectTrack(track.index)}
          >
            {selectedTrack === track.index && (
              <Check size={14} color="white" />
            )}
          </div>

          <div
            className="track-info"
            onClick={() => onSelectTrack(track.index)}
          >
            <div className="track-name">
              {track.name}
            </div>
            <div className="track-details">
              {track.instrument} • Canal {track.channel}
            </div>
          </div>

          <span className="track-notes">
            {track.noteCount} notas
          </span>

          <button
            className={`btn btn-ghost btn-icon ${mutedTracks.has(track.index) ? 'text-muted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute(track.index);
            }}
            title={mutedTracks.has(track.index) ? 'Activar audio' : 'Silenciar'}
          >
            {mutedTracks.has(track.index) ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

export default TrackSelector;
