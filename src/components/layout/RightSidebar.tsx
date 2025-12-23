/**
 * RightSidebar Component - Panel lateral derecho
 * Muestra las pistas del MIDI con controles de volumen
 */
import { Layers, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import type { MidiTrack } from '../../types/midi';
import './RightSidebar.css';

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

        </>
    );
}

export default RightSidebar;
