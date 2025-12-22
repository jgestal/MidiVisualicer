/**
 * RightSidebar Component - Panel lateral derecho
 * Muestra las pistas del MIDI con controles de volumen
 */
import { Layers, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import type { MidiTrack } from '../../types/midi';

interface RightSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    tracks: MidiTrack[];
    selectedTrack: number;
    mutedTracks: Set<number>;
    trackVolumes: Map<number, number>;
    onSelectTrack: (index: number) => void;
    onToggleMute: (index: number) => void;
    onVolumeChange: (index: number, volume: number) => void;
}

export function RightSidebar({
    isOpen,
    onToggle,
    tracks,
    selectedTrack,
    mutedTracks,
    trackVolumes,
    onSelectTrack,
    onToggleMute,
    onVolumeChange,
}: RightSidebarProps) {
    return (
        <>
            {/* Toggle Button (always visible) */}
            <button
                className="right-sidebar-toggle"
                onClick={onToggle}
                title={isOpen ? 'Ocultar pistas' : 'Mostrar pistas'}
            >
                {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                <Layers size={14} />
            </button>

            {/* Sidebar Panel */}
            <aside className={`right-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="right-sidebar-header">
                    <Layers size={14} />
                    <span>Pistas</span>
                    <span className="track-count">{tracks.length}</span>
                </div>

                <div className="right-sidebar-content">
                    {tracks.length === 0 ? (
                        <div className="no-tracks">No hay pistas</div>
                    ) : (
                        <ul className="track-list">
                            {tracks.map((track, index) => {
                                const isMuted = mutedTracks.has(index);
                                const isSelected = selectedTrack === index;
                                const noteCount = track.notes?.length || 0;
                                const volume = trackVolumes.get(index) ?? 100;

                                return (
                                    <li
                                        key={index}
                                        className={`track-item ${isSelected ? 'selected' : ''} ${isMuted ? 'muted' : ''}`}
                                    >
                                        {/* Track Info - clickable */}
                                        <button
                                            className="track-select"
                                            onClick={() => onSelectTrack(index)}
                                        >
                                            <span className="track-index">{index + 1}</span>
                                            <div className="track-info">
                                                <span className="track-name">
                                                    {track.name || `Pista ${index + 1}`}
                                                </span>
                                                <span className="track-notes">{noteCount} notas</span>
                                            </div>
                                        </button>

                                        {/* Volume Controls */}
                                        <div className="track-volume-controls">
                                            <button
                                                className="track-mute-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleMute(index);
                                                }}
                                                title={isMuted ? 'Activar pista' : 'Silenciar pista'}
                                            >
                                                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={isMuted ? 0 : volume}
                                                onChange={(e) => {
                                                    const newVolume = parseInt(e.target.value);
                                                    onVolumeChange(index, newVolume);
                                                }}
                                                className="track-volume-slider"
                                                title={`Volumen: ${volume}%`}
                                            />
                                            <span className="track-volume-value">{isMuted ? 0 : volume}%</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </aside>

            <style>{`
                .track-item {
                    display: flex;
                    flex-direction: column;
                    padding: 10px 12px;
                    background: var(--color-bg-tertiary);
                    border-radius: var(--radius-md);
                    margin-bottom: 6px;
                    transition: all var(--transition-fast);
                }

                .track-item:hover {
                    background: var(--color-bg-hover);
                }

                .track-item.selected {
                    background: var(--color-accent-primary);
                }

                .track-item.muted {
                    opacity: 0.6;
                }

                .track-select {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    text-align: left;
                    padding: 0;
                    margin-bottom: 8px;
                    width: 100%;
                }

                .track-index {
                    width: 22px;
                    height: 22px;
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

                .track-item.selected .track-index {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .track-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                    flex: 1;
                }

                .track-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .track-item.selected .track-name {
                    color: white;
                }

                .track-notes {
                    font-size: 10px;
                    color: var(--color-text-muted);
                }

                .track-item.selected .track-notes {
                    color: rgba(255, 255, 255, 0.7);
                }

                .track-volume-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-left: 32px;
                }

                .track-mute-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--color-text-muted);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    flex-shrink: 0;
                }

                .track-mute-btn:hover {
                    background: var(--color-bg-hover);
                    color: var(--color-text-primary);
                }

                .track-item.muted .track-mute-btn {
                    color: var(--color-error);
                }

                .track-item.selected .track-mute-btn {
                    color: rgba(255, 255, 255, 0.8);
                }

                .track-volume-slider {
                    flex: 1;
                    height: 4px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-full);
                    cursor: pointer;
                }

                .track-volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: var(--color-accent-primary);
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform var(--transition-fast);
                }

                .track-volume-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }

                .track-item.selected .track-volume-slider {
                    background: rgba(255, 255, 255, 0.3);
                }

                .track-item.selected .track-volume-slider::-webkit-slider-thumb {
                    background: white;
                }

                .track-volume-value {
                    font-size: 10px;
                    color: var(--color-text-muted);
                    min-width: 32px;
                    text-align: right;
                }

                .track-item.selected .track-volume-value {
                    color: rgba(255, 255, 255, 0.7);
                }
            `}</style>
        </>
    );
}

export default RightSidebar;
