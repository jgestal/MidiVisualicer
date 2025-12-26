/**
 * BottomTracksPanel - Panel inferior de pistas colapsable
 * Muestra las pistas horizontalmente, se colapsa hacia abajo
 */
import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useDragScroll } from '../../hooks/useDragScroll';
import { useI18n } from '../../shared/context/I18nContext';
import { getInstrumentEmoji } from '../../utils/instrumentEmoji';
import { useTracks } from '@/features/tracks/context/TracksContext';
import { usePlayback } from '@/features/player/context/PlaybackContext';
import { useMidi } from '@/shared/context/MidiContext';
import type { MidiTrack } from '../../types/midi';
import './BottomTracksPanel.css';

export function BottomTracksPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();
  const { scrollRef, handlePointerDown, handlePointerMove, handlePointerUp, handleClick } = useDragScroll();

  const { state: midiState } = useMidi();
  const { state: tracksState, toggleMute, resetTracks } = useTracks();
  const { state: playbackState, setTrackVolume } = usePlayback();

  const tracks = midiState.parsedMidi?.tracks || [];
  const selectedTrack = tracksState.selectedTrackIndex;
  const mutedTracks = tracksState.mutedTracks;
  const trackVolumes = playbackState.trackVolumes;
  const currentTime = playbackState.currentTime;
  const isPlaying = playbackState.isPlaying;

  // Helper to check if track is active (has notes playing now or fully coming soon)
  const isTrackActive = (track: MidiTrack) => {
    if (!isPlaying || !track.notes) return false;
    const windowStart = currentTime - 0.1;
    const windowEnd = currentTime + 0.8;

    return track.notes.some(n =>
      (n.time >= windowStart && n.time <= windowEnd) ||
      (n.time <= currentTime && n.time + n.duration >= currentTime)
    );
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={`bottom-tracks-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        className="bottom-tracks-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? t.showToolbar : t.hideToolbar}
      >
        <Layers size={14} />
        <span>{t.tracks} ({tracks.length})</span>
        {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Tracks Content */}
      {!isCollapsed && (
        <div className="bottom-tracks-content">
          <div
            className="bottom-tracks-scroll"
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClickCapture={handleClick}
          >
            {tracks.map((track, index) => {
              const isMuted = mutedTracks.has(index);
              const isSelected = selectedTrack === index;
              const noteCount = track.notes?.length || 0;
              const volume = trackVolumes.get(index) ?? 100;
              const emoji = getInstrumentEmoji(track.instrument || track.name || '');

              const isActive = isTrackActive(track);

              return (
                <div
                  key={index}
                  className={`bottom-track-item ${isSelected ? 'selected' : ''} ${isMuted ? 'muted' : ''} ${isActive ? 'playing' : ''}`}
                >
                  {/* Instrument Emoji - top right */}
                  <span className="bottom-track-emoji" title={track.instrument || t.instrument}>
                    {emoji}
                  </span>

                  <button
                    className="bottom-track-select"
                    onClick={() => resetTracks(index)}
                  >
                    <span className="bottom-track-index">{index + 1}</span>
                    <div className="bottom-track-info">
                      <span className="bottom-track-name">
                        {track.name || `${t.track} ${index + 1}`}
                      </span>
                      <span className="bottom-track-notes">{noteCount} {t.notes}</span>
                    </div>
                  </button>

                  {/* Activity Indicator (Animated Pulse) */}
                  {isActive && <div className="bottom-track-pulse" />}

                  <div className="bottom-track-controls">
                    <button
                      className="bottom-track-mute"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(index);
                      }}
                      title={isMuted ? t.unmute : t.mute}
                    >
                      {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setTrackVolume(index, parseInt(e.target.value))}
                      className="bottom-track-volume"
                      title={`${t.volume}: ${volume}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BottomTracksPanel;
