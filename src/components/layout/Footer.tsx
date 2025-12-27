/**
 * Footer Component - Player Controls Bar
 * 
 * @description Fixed bar at the bottom with playback transport controls,
 * progress bar, speed selector, and volume controls.
 * 
 * @architecture
 * - Uses i18n for all user-facing text
 * - Sub-components extracted for SRP (TransportButton, ProgressBar, etc.)
 * - All sizing constants centralized
 * - Full accessibility support with aria-labels
 */
import { memo, useCallback, useMemo } from 'react';
import {
    Play,
    Pause,
    Square,
    SkipBack,
    SkipForward,
    RotateCcw,
    Volume2,
    VolumeX,
    type LucideIcon,
} from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';
import { formatDuration } from '../../utils/timeUtils';
import type { PlaybackSpeed } from '../../types/midi';

// ============================================
// Constants
// ============================================

/** Available speed options for playback */
const SPEED_OPTIONS: readonly PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0] as const;

/** Seek amount in seconds for forward/backward buttons */
const SEEK_AMOUNT_SECONDS = 5;

/** Icon sizes for consistency */
const ICON_SIZES = {
    small: 16,
    medium: 18,
    large: 22,
} as const;

/** Volume slider range */
const VOLUME_RANGE = {
    min: 0,
    max: 100,
} as const;

// ============================================
// Types
// ============================================

interface FooterProps {
    /** Whether audio is currently playing */
    isPlaying: boolean;
    /** Current playback position in seconds */
    currentTime: number;
    /** Total track duration in seconds */
    duration: number;
    /** Current playback speed multiplier */
    speed: PlaybackSpeed;
    /** Whether controls are disabled (no MIDI loaded) */
    disabled?: boolean;
    /** Play button callback */
    onPlay: () => void;
    /** Pause button callback */
    onPause: () => void;
    /** Stop button callback */
    onStop: () => void;
    /** Seek to time callback */
    onSeek: (time: number) => void;
    /** Speed change callback */
    onSpeedChange: (speed: PlaybackSpeed) => void;
    /** Current volume (0-100) */
    volume: number;
    /** Whether audio is muted */
    isMuted: boolean;
    /** Volume change callback */
    onVolumeChange: (volume: number) => void;
    /** Mute toggle callback */
    onToggleMute: () => void;
}

interface TransportButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    title: string;
    size?: number;
    isMain?: boolean;
    style?: React.CSSProperties;
}

// ============================================
// Sub-Components (SRP)
// ============================================

/**
 * Transport button with icon - reusable for all playback controls
 */
const TransportButton = memo(function TransportButton({
    icon: Icon,
    onClick,
    disabled = false,
    title,
    size = ICON_SIZES.medium,
    isMain = false,
    style,
}: TransportButtonProps) {
    const className = isMain ? 'footer-btn footer-btn-main' : 'footer-btn';

    return (
        <button
            className={className}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
        >
            <Icon size={size} style={style} aria-hidden="true" />
        </button>
    );
});

/**
 * Progress bar with time display and click-to-seek
 */
const ProgressBar = memo(function ProgressBar({
    currentTime,
    duration,
    onSeek,
}: {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const newTime = percentage * duration;
            onSeek(newTime);
        },
        [duration, onSeek]
    );

    return (
        <div className="footer-progress">
            <span className="footer-time" aria-label="Current time">
                {formatDuration(currentTime)}
            </span>
            <div
                className="footer-progress-bar"
                onClick={handleClick}
                role="slider"
                aria-label="Playback progress"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
                tabIndex={0}
            >
                <div
                    className="footer-progress-fill"
                    style={{ width: `${progress}%` }}
                />
                <div
                    className="footer-progress-handle"
                    style={{ left: `${progress}%` }}
                />
            </div>
            <span className="footer-time" aria-label="Total duration">
                {formatDuration(duration)}
            </span>
        </div>
    );
});

/**
 * Speed selector buttons
 */
const SpeedSelector = memo(function SpeedSelector({
    speed,
    label,
    onSpeedChange,
}: {
    speed: PlaybackSpeed;
    label: string;
    onSpeedChange: (speed: PlaybackSpeed) => void;
}) {
    const formatSpeed = useCallback((s: PlaybackSpeed) => {
        return s === 1 ? '1x' : `${s}x`;
    }, []);

    return (
        <div className="footer-speed">
            <span className="footer-speed-label">{label}:</span>
            <div className="footer-speed-options" role="radiogroup" aria-label={label}>
                {SPEED_OPTIONS.map((s) => (
                    <button
                        key={s}
                        className={`footer-speed-btn ${speed === s ? 'active' : ''}`}
                        onClick={() => onSpeedChange(s)}
                        role="radio"
                        aria-checked={speed === s}
                    >
                        {formatSpeed(s)}
                    </button>
                ))}
            </div>
        </div>
    );
});

/**
 * Volume control with mute button and slider
 */
const VolumeControl = memo(function VolumeControl({
    volume,
    isMuted,
    muteLabel,
    unmuteLabel,
    onVolumeChange,
    onToggleMute,
}: {
    volume: number;
    isMuted: boolean;
    muteLabel: string;
    unmuteLabel: string;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onVolumeChange(Number(e.target.value));
        },
        [onVolumeChange]
    );

    const Icon = isMuted ? VolumeX : Volume2;
    const title = isMuted ? unmuteLabel : muteLabel;
    const displayVolume = isMuted ? 0 : volume;

    return (
        <div className="footer-volume">
            <button
                className={`footer-btn volume-btn ${isMuted ? 'muted' : ''}`}
                onClick={onToggleMute}
                title={title}
                aria-label={title}
            >
                <Icon size={ICON_SIZES.medium} aria-hidden="true" />
            </button>
            <input
                type="range"
                min={VOLUME_RANGE.min}
                max={VOLUME_RANGE.max}
                value={displayVolume}
                onChange={handleChange}
                className="footer-volume-slider"
                title={`${Math.round(volume)}%`}
                aria-label="Volume"
                aria-valuemin={VOLUME_RANGE.min}
                aria-valuemax={VOLUME_RANGE.max}
                aria-valuenow={displayVolume}
            />
        </div>
    );
});

// ============================================
// Main Component
// ============================================

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
    volume,
    isMuted,
    onVolumeChange,
    onToggleMute,
}: FooterProps) {
    const { t } = useI18n();

    // ========== Memoized Callbacks ==========

    const handleRestart = useCallback(() => onSeek(0), [onSeek]);

    const handleSeekBackward = useCallback(
        () => onSeek(Math.max(0, currentTime - SEEK_AMOUNT_SECONDS)),
        [onSeek, currentTime]
    );

    const handleSeekForward = useCallback(
        () => onSeek(Math.min(duration, currentTime + SEEK_AMOUNT_SECONDS)),
        [onSeek, currentTime, duration]
    );

    // Play/Pause button style (slight offset for play icon)
    const playIconStyle = useMemo(() => ({ marginLeft: 2 }), []);

    // ========== Render ==========

    return (
        <footer className="app-footer" role="toolbar" aria-label="Playback controls">
            {/* Transport Controls */}
            <div className="footer-transport">
                <TransportButton
                    icon={RotateCcw}
                    onClick={handleRestart}
                    disabled={disabled}
                    title={t.restart}
                    size={ICON_SIZES.small}
                />

                <TransportButton
                    icon={SkipBack}
                    onClick={handleSeekBackward}
                    disabled={disabled}
                    title={t.rewind5s}
                    size={ICON_SIZES.medium}
                />

                {isPlaying ? (
                    <TransportButton
                        icon={Pause}
                        onClick={onPause}
                        disabled={disabled}
                        title={t.pause}
                        size={ICON_SIZES.large}
                        isMain
                    />
                ) : (
                    <TransportButton
                        icon={Play}
                        onClick={onPlay}
                        disabled={disabled}
                        title={t.play}
                        size={ICON_SIZES.large}
                        isMain
                        style={playIconStyle}
                    />
                )}

                <TransportButton
                    icon={Square}
                    onClick={onStop}
                    disabled={disabled}
                    title={t.stop}
                    size={ICON_SIZES.small}
                />

                <TransportButton
                    icon={SkipForward}
                    onClick={handleSeekForward}
                    disabled={disabled}
                    title={t.forward5s}
                    size={ICON_SIZES.medium}
                />
            </div>

            {/* Progress Bar */}
            <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
            />

            <div className="footer-divider" role="separator" />

            {/* Speed Controls */}
            <SpeedSelector
                speed={speed}
                label={t.speed}
                onSpeedChange={onSpeedChange}
            />

            <div className="footer-divider" role="separator" />

            {/* Volume Control */}
            <VolumeControl
                volume={volume}
                isMuted={isMuted}
                muteLabel={t.mute}
                unmuteLabel={t.unmute}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
            />
        </footer>
    );
}

export default Footer;
