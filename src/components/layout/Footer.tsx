/**
 * Footer Component - Controles del reproductor
 * Barra fija en la parte inferior con play/pause, progreso y velocidad
 */
import { Play, Pause, Square, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import type { PlaybackSpeed } from '../../types/midi';

interface FooterProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    speed: PlaybackSpeed;
    disabled?: boolean;

    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onSeek: (time: number) => void;
    onSpeedChange: (speed: PlaybackSpeed) => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0];

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Footer({
    isPlaying,
    currentTime,
    duration,
    speed,
    disabled = false,
    onPlay,
    onPause,
    onStop,
    onSeek,
    onSpeedChange,
}: FooterProps) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        onSeek(newTime);
    };

    return (
        <footer className="app-footer">
            {/* Transport Controls */}
            <div className="footer-transport">
                {/* Restart Button */}
                <button
                    className="footer-btn"
                    onClick={() => onSeek(0)}
                    disabled={disabled}
                    title="Reiniciar"
                >
                    <RotateCcw size={16} />
                </button>

                <button
                    className="footer-btn"
                    onClick={() => onSeek(Math.max(0, currentTime - 5))}
                    disabled={disabled}
                    title="Retroceder 5s"
                >
                    <SkipBack size={18} />
                </button>

                {isPlaying ? (
                    <button
                        className="footer-btn footer-btn-main"
                        onClick={onPause}
                        disabled={disabled}
                        title="Pausar"
                    >
                        <Pause size={22} />
                    </button>
                ) : (
                    <button
                        className="footer-btn footer-btn-main"
                        onClick={onPlay}
                        disabled={disabled}
                        title="Reproducir"
                    >
                        <Play size={22} style={{ marginLeft: 2 }} />
                    </button>
                )}

                <button
                    className="footer-btn"
                    onClick={onStop}
                    disabled={disabled}
                    title="Detener"
                >
                    <Square size={16} />
                </button>

                <button
                    className="footer-btn"
                    onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                    disabled={disabled}
                    title="Avanzar 5s"
                >
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Progress Section */}
            <div className="footer-progress">
                <span className="footer-time">{formatTime(currentTime)}</span>
                <div className="footer-progress-bar" onClick={handleProgressClick}>
                    <div
                        className="footer-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="footer-progress-handle"
                        style={{ left: `${progress}%` }}
                    />
                </div>
                <span className="footer-time">{formatTime(duration)}</span>
            </div>

            {/* Speed Controls */}
            <div className="footer-speed">
                <span className="footer-speed-label">Velocidad:</span>
                <div className="footer-speed-options">
                    {SPEED_OPTIONS.map((s) => (
                        <button
                            key={s}
                            className={`footer-speed-btn ${speed === s ? 'active' : ''}`}
                            onClick={() => onSpeedChange(s)}
                        >
                            {s === 1 ? '1x' : `${s}x`}
                        </button>
                    ))}
                </div>
            </div>
        </footer>
    );
}

export default Footer;
