/**
 * TrackManager - Panel avanzado de gestión de pistas
 * Con colores por pista, solo/mute visual, y estadísticas
 */
import { useMemo } from 'react';
import { Check, Volume2, VolumeX, Radio, Music2, Lightbulb, BarChart3 } from 'lucide-react';
import type { MidiTrack } from '@/shared/types/midi';
import './TrackManager.css';

// Colores predefinidos para pistas
const TRACK_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export interface TrackManagerProps {
  tracks: MidiTrack[];
  selectedTrack: number;
  mutedTracks: Set<number>;
  soloTrack: number | null;
  melodyTrack?: number | null;
  onSelectTrack: (index: number) => void;
  onToggleMute: (index: number) => void;
  onToggleSolo?: (index: number) => void;
  compact?: boolean;
}

interface TrackItemProps {
  track: MidiTrack;
  isSelected: boolean;
  isMuted: boolean;
  isSolo: boolean;
  isMelody: boolean;
  color: string;
  onSelect: () => void;
  onMute: () => void;
  onSolo?: () => void;
  compact?: boolean;
}

/**
 * Obtener color para una pista basado en su índice
 */
function getTrackColor(index: number): string {
  return TRACK_COLORS[index % TRACK_COLORS.length];
}

/**
 * Calcular estadísticas básicas de la pista
 */
function getTrackStats(track: MidiTrack): {
  percentage: number;
  avgVelocity: number;
} {
  // Porcentaje relativo de notas (simplificado)
  const percentage = Math.min(100, (track.noteCount / 500) * 100);

  // Velocidad promedio simulada
  const avgVelocity = 70 + (track.noteCount % 30);

  return { percentage, avgVelocity };
}

/**
 * Componente de item de pista individual
 */
function TrackItem({
  track,
  isSelected,
  isMuted,
  isSolo,
  isMelody,
  color,
  onSelect,
  onMute,
  onSolo,
  compact = false,
}: TrackItemProps) {
  const stats = useMemo(() => getTrackStats(track), [track]);

  return (
    <div
      className={`track-manager-item ${isSelected ? 'selected' : ''} ${isMuted ? 'muted' : ''} ${isSolo ? 'solo' : ''}`}
      style={{ '--track-color': color } as React.CSSProperties}
    >
      {/* Indicador de color */}
      <div className="track-color-bar" />

      {/* Checkbox de selección */}
      <button
        className={`track-select-btn ${isSelected ? 'active' : ''}`}
        onClick={onSelect}
        aria-label={`Seleccionar pista ${track.name}`}
      >
        {isSelected ? <Check size={14} /> : <Radio size={14} />}
      </button>

      {/* Información de la pista */}
      <div className="track-content" onClick={onSelect}>
        <div className="track-header">
          <span className="track-name">
            {isMelody && <Lightbulb size={12} className="melody-icon" />}
            {track.name}
          </span>
          {!compact && <span className="track-badge">{track.noteCount} notas</span>}
        </div>

        {!compact && (
          <div className="track-meta">
            <span className="track-instrument">
              <Music2 size={10} />
              {track.instrument}
            </span>
            <span className="track-channel">CH {track.channel}</span>
          </div>
        )}

        {/* Barra de actividad */}
        {!compact && (
          <div className="track-activity">
            <div className="track-activity-bar" style={{ width: `${stats.percentage}%` }} />
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="track-controls">
        {/* Botón Solo */}
        {onSolo && (
          <button
            className={`track-btn solo-btn ${isSolo ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSolo();
            }}
            title={isSolo ? 'Quitar Solo' : 'Solo'}
            aria-label={isSolo ? 'Quitar Solo' : 'Solo'}
          >
            <span className="track-btn-label">S</span>
          </button>
        )}

        {/* Botón Mute */}
        <button
          className={`track-btn mute-btn ${isMuted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onMute();
          }}
          title={isMuted ? 'Activar audio' : 'Silenciar'}
          aria-label={isMuted ? 'Activar audio' : 'Silenciar'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Componente principal de gestión de pistas
 */
export function TrackManager({
  tracks,
  selectedTrack,
  mutedTracks,
  soloTrack,
  melodyTrack,
  onSelectTrack,
  onToggleMute,
  onToggleSolo,
  compact = false,
}: TrackManagerProps) {
  // Ordenar pistas: melodía primero, luego por cantidad de notas
  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => {
      // Melodía siempre primero
      if (melodyTrack === a.index) return -1;
      if (melodyTrack === b.index) return 1;
      // Luego por cantidad de notas
      return b.noteCount - a.noteCount;
    });
  }, [tracks, melodyTrack]);

  // Contar pistas activas
  const activeTracks = tracks.filter((t) => !mutedTracks.has(t.index)).length;

  return (
    <div className={`track-manager ${compact ? 'compact' : ''}`}>
      {/* Header con estadísticas */}
      {!compact && (
        <div className="track-manager-header">
          <div className="track-manager-stats">
            <BarChart3 size={14} />
            <span>
              {activeTracks}/{tracks.length} pistas activas
            </span>
          </div>
          {soloTrack !== null && (
            <span className="solo-indicator">Solo: {tracks[soloTrack]?.name}</span>
          )}
        </div>
      )}

      {/* Lista de pistas */}
      <div className="track-manager-list">
        {sortedTracks.map((track) => (
          <TrackItem
            key={track.index}
            track={track}
            isSelected={selectedTrack === track.index}
            isMuted={mutedTracks.has(track.index)}
            isSolo={soloTrack === track.index}
            isMelody={melodyTrack === track.index}
            color={getTrackColor(track.index)}
            onSelect={() => onSelectTrack(track.index)}
            onMute={() => onToggleMute(track.index)}
            onSolo={onToggleSolo ? () => onToggleSolo(track.index) : undefined}
            compact={compact}
          />
        ))}
      </div>

      {/* Acciones rápidas */}
      {!compact && tracks.length > 3 && (
        <div className="track-manager-actions">
          <button
            className="track-action-btn"
            onClick={() => {
              tracks.forEach((t) => {
                if (mutedTracks.has(t.index)) {
                  onToggleMute(t.index);
                }
              });
            }}
          >
            Activar todas
          </button>
          <button
            className="track-action-btn"
            onClick={() => {
              tracks.forEach((t) => {
                if (t.index !== selectedTrack && !mutedTracks.has(t.index)) {
                  onToggleMute(t.index);
                }
              });
            }}
          >
            Solo seleccionada
          </button>
        </div>
      )}
    </div>
  );
}

export default TrackManager;
