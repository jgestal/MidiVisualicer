/**
 * Componente de controles del reproductor MIDI
 */
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import type { PlaybackState, PlaybackSpeed } from '../types/midi';

interface PlayerControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  disabled?: boolean;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0];

export function PlayerControls({
  playbackState,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onSpeedChange,
  disabled = false,
}: PlayerControlsProps) {
  const { isPlaying, currentTime, duration, speed } = playbackState;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div className="player-controls animate-slide-up">
      {/* Main Buttons */}
      <div className="player-buttons">
        <button
          className="player-btn-secondary"
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          disabled={disabled}
          title="Retroceder 5s"
        >
          <SkipBack size={20} />
        </button>

        {isPlaying ? (
          <button className="player-btn-main" onClick={onPause} disabled={disabled} title="Pausar">
            <Pause size={28} />
          </button>
        ) : (
          <button
            className="player-btn-main"
            onClick={onPlay}
            disabled={disabled}
            title="Reproducir"
          >
            <Play size={28} style={{ marginLeft: 4 }} />
          </button>
        )}

        <button
          className="player-btn-secondary"
          onClick={onStop}
          disabled={disabled}
          title="Detener"
        >
          <Square size={18} />
        </button>

        <button
          className="player-btn-secondary"
          onClick={() => onSeek(Math.min(duration, currentTime + 5))}
          disabled={disabled}
          title="Avanzar 5s"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <span className="progress-time">{formatDuration(currentTime)}</span>
        <div className="progress-bar" onClick={handleProgressClick}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-time">{formatDuration(duration)}</span>
      </div>

      {/* Speed Controls */}
      <div className="speed-controls">
        <span className="text-sm text-muted" style={{ marginRight: 8 }}>
          Velocidad:
        </span>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            className={`speed-btn ${speed === s ? 'active' : ''}`}
            onClick={() => onSpeedChange(s)}
          >
            {s === 1 ? '1x' : `${s}x`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlayerControls;
