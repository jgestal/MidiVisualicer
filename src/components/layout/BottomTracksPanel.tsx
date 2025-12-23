/**
 * BottomTracksPanel - Panel inferior de pistas colapsable
 * Muestra las pistas horizontalmente, se colapsa hacia abajo
 */
import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';
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
}

// Helper para obtener emoji basado en el nombre del instrumento
function getInstrumentEmoji(instrumentName: string): string {
  const name = instrumentName.toLowerCase();

  // Pianos y teclados
  if (name.includes('piano') || name.includes('keyboard')) return '🎹';
  if (name.includes('organ')) return '🎹';
  if (name.includes('harpsichord') || name.includes('clavinet')) return '🎹';

  // Guitarras
  if (name.includes('guitar') && (name.includes('electric') || name.includes('dist') || name.includes('overdrive'))) return '🎸';
  if (name.includes('guitar')) return '🎸';
  if (name.includes('banjo')) return '🪕';

  // Bajos
  if (name.includes('bass')) return '🎸';

  // Cuerdas orquestrales
  if (name.includes('violin') || name.includes('fiddle')) return '🎻';
  if (name.includes('viola') || name.includes('cello') || name.includes('contrabass')) return '🎻';
  if (name.includes('string') || name.includes('orchestra')) return '🎻';
  if (name.includes('harp')) return '🎻';

  // Vientos
  if (name.includes('trumpet') || name.includes('horn') || name.includes('brass')) return '🎺';
  if (name.includes('sax')) return '🎷';
  if (name.includes('flute') || name.includes('piccolo') || name.includes('recorder')) return '🪈';
  if (name.includes('clarinet') || name.includes('oboe') || name.includes('bassoon')) return '🪈';

  // Percusión
  if (name.includes('drum') || name.includes('percussion') || name.includes('kit')) return '🥁';
  if (name.includes('timpani') || name.includes('tom')) return '🥁';
  if (name.includes('cymbal') || name.includes('hi-hat')) return '🥁';
  if (name.includes('bell') || name.includes('chime') || name.includes('glocken') || name.includes('vibraphone') || name.includes('xylophone') || name.includes('marimba')) return '🔔';

  // Voz
  if (name.includes('choir') || name.includes('voice') || name.includes('vocal')) return '🎤';

  // Sintetizadores
  if (name.includes('synth') || name.includes('pad') || name.includes('lead')) return '🎛️';

  // Otros
  if (name.includes('whistle')) return '🎵';
  if (name.includes('harmonica') || name.includes('accordion')) return '🪗';

  // Por defecto
  return '🎵';
}

export function BottomTracksPanel({
  tracks,
  selectedTrack,
  mutedTracks,
  trackVolumes,
  onSelectTrack,
  onToggleMute,
  onVolumeChange,
}: BottomTracksPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();

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
          <div className="bottom-tracks-scroll">
            {tracks.map((track, index) => {
              const isMuted = mutedTracks.has(index);
              const isSelected = selectedTrack === index;
              const noteCount = track.notes?.length || 0;
              const volume = trackVolumes.get(index) ?? 100;
              const emoji = getInstrumentEmoji(track.instrument || track.name || '');

              return (
                <div
                  key={index}
                  className={`bottom-track-item ${isSelected ? 'selected' : ''} ${isMuted ? 'muted' : ''}`}
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
