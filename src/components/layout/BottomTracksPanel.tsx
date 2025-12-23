/**
 * BottomTracksPanel - Panel inferior de pistas colapsable
 * Muestra las pistas horizontalmente, se colapsa hacia abajo
 */
import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useDragScroll } from '../../hooks/useDragScroll';
import { useI18n } from '../../shared/context/I18nContext';
import { getInstrumentEmoji } from '../../utils/instrumentEmoji';
import type { MidiTrack } from '../../types/midi';
import './BottomTracksPanel.css';

interface BottomTracksPanelProps {
  tracks: MidiTrack[];
  selectedTrack: number;
  mutedTracks: Set<number>;
  trackVolumes: Map<number, number>;
  onSelectTrack: (index: number) => void;
  onToggleMute: (index: number) => void;
  onVolumeChange: (index: number, volume: number) => void;
  currentTime?: number;
  isPlaying?: boolean;
}


export function BottomTracksPanel({
  tracks,
  selectedTrack,
  mutedTracks,
  trackVolumes,
  onSelectTrack,
  onToggleMute,
  onVolumeChange,
  currentTime = 0,
  isPlaying = false,
}: BottomTracksPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();
  const { scrollRef, isDragging, handlePointerDown, handlePointerMove, handlePointerUp, handleClick } = useDragScroll();

  // Helper to check if track is active (has notes playing now or fully coming soon)
  // Lookahead: 1.0s, Lookbehind: 0.1s
  const isTrackActive = (track: MidiTrack) => {
    if (!isPlaying || !track.notes) return false;
    // Simple verification: is there any note overlapping the window [now - 0.1, now + 1.0]
    const windowStart = currentTime - 0.1;
    const windowEnd = currentTime + 0.8;

    // Optimization: find if ANY note matches condition. 
    // Since notes are usually sorted by time, we could optimize further, but .some() is likely fast enough for <10k notes total
    return track.notes.some(n =>
      // Note starts within window OR Note matches current playback
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
                  <span className="bottom-track-emoji" title={track.instrument || 'Instrumento'}>
                    {emoji}
                  </span>

                  <button
                    className="bottom-track-select"
                    onClick={() => onSelectTrack(index)}
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
                        onToggleMute(index);
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
                      onChange={(e) => onVolumeChange(index, parseInt(e.target.value))}
                      className="bottom-track-volume"
                      title={`Volumen: ${volume}%`}
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
