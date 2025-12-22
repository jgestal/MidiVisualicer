/**
 * BottomTracksPanel - Panel inferior de pistas colapsable
 * Muestra las pistas horizontalmente, se colapsa hacia abajo
 */
import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import type { MidiTrack } from '../../types/midi';

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

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={`bottom-tracks-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        className="bottom-tracks-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Mostrar pistas' : 'Ocultar pistas'}
      >
        <Layers size={14} />
        <span>Pistas ({tracks.length})</span>
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
                        {track.name || `Pista ${index + 1}`}
                      </span>
                      <span className="bottom-track-notes">{noteCount} notas</span>
                    </div>
                  </button>

                  <div className="bottom-track-controls">
                    <button
                      className="bottom-track-mute"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute(index);
                      }}
                      title={isMuted ? 'Activar' : 'Silenciar'}
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

      <style>{`
        .bottom-tracks-panel {
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .bottom-tracks-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 16px;
          background: var(--color-bg-tertiary);
          border: none;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bottom-tracks-toggle:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .bottom-tracks-content {
          padding: 8px 12px;
          max-height: 140px;
          overflow: hidden;
        }

        .bottom-tracks-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .bottom-tracks-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .bottom-tracks-scroll::-webkit-scrollbar-track {
          background: var(--color-bg-tertiary);
          border-radius: 3px;
        }

        .bottom-tracks-scroll::-webkit-scrollbar-thumb {
          background: var(--color-text-muted);
          border-radius: 3px;
        }

        .bottom-track-item {
          display: flex;
          flex-direction: column;
          min-width: 140px;
          max-width: 160px;
          padding: 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          flex-shrink: 0;
          position: relative;
        }

        .bottom-track-emoji {
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 16px;
          line-height: 1;
          opacity: 0.8;
        }

        .bottom-track-item.selected .bottom-track-emoji {
          opacity: 1;
        }

        .bottom-track-item:hover {
          background: var(--color-bg-hover);
        }

        .bottom-track-item.selected {
          background: var(--color-accent-primary);
        }

        .bottom-track-item.muted {
          opacity: 0.6;
        }

        .bottom-track-select {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          text-align: left;
          padding: 0;
          margin-bottom: 8px;
        }

        .bottom-track-index {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 10px;
          font-weight: 600;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .bottom-track-item.selected .bottom-track-index {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .bottom-track-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .bottom-track-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bottom-track-item.selected .bottom-track-name {
          color: white;
        }

        .bottom-track-notes {
          font-size: 9px;
          color: var(--color-text-muted);
        }

        .bottom-track-item.selected .bottom-track-notes {
          color: rgba(255, 255, 255, 0.7);
        }

        .bottom-track-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bottom-track-mute {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .bottom-track-mute:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .bottom-track-item.muted .bottom-track-mute {
          color: var(--color-error);
        }

        .bottom-track-item.selected .bottom-track-mute {
          color: rgba(255, 255, 255, 0.8);
        }

        .bottom-track-volume {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          cursor: pointer;
        }

        .bottom-track-volume::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          background: var(--color-accent-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .bottom-track-item.selected .bottom-track-volume {
          background: rgba(255, 255, 255, 0.3);
        }

        .bottom-track-item.selected .bottom-track-volume::-webkit-slider-thumb {
          background: white;
        }

        .bottom-tracks-panel.collapsed .bottom-tracks-content {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default BottomTracksPanel;
