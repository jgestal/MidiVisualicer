/**
 * RightSidebar Component - Panel lateral derecho
 * Muestra las pistas del MIDI y permite activarlas/desactivarlas
 */
import { Layers, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import type { MidiTrack } from '../../types/midi';

interface RightSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    tracks: MidiTrack[];
    selectedTrack: number;
    mutedTracks: Set<number>;
    onSelectTrack: (index: number) => void;
    onToggleMute: (index: number) => void;
}

export function RightSidebar({
    isOpen,
    onToggle,
    tracks,
    selectedTrack,
    mutedTracks,
    onSelectTrack,
    onToggleMute,
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

                                return (
                                    <li
                                        key={index}
                                        className={`track-item ${isSelected ? 'selected' : ''} ${isMuted ? 'muted' : ''}`}
                                    >
                                        <button
                                            className="track-select"
                                            onClick={() => onSelectTrack(index)}
                                        >
                                            <span className="track-index">{index + 1}</span>
                                            <span className="track-name">
                                                {track.name || `Pista ${index + 1}`}
                                            </span>
                                            <span className="track-notes">{noteCount} notas</span>
                                        </button>

                                        <button
                                            className="track-mute"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleMute(index);
                                            }}
                                            title={isMuted ? 'Activar pista' : 'Silenciar pista'}
                                        >
                                            {isMuted ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
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
