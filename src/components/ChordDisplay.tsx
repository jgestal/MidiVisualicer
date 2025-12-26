/**
 * ChordDisplay - Muestra el acorde actual detectado
 * Panel lateral o badge que muestra acordes en tiempo real
 */
import { useMemo } from 'react';
import { Music } from 'lucide-react';
import { useChordDetection } from '../hooks/useChordDetection';
import { useI18n } from '../shared/context/I18nContext';
import type { MidiNote } from '../types/midi';
import './ChordDisplay.css';

interface ChordDisplayProps {
    notes: MidiNote[];
    currentTime: number;
    compact?: boolean;
}

export function ChordDisplay({ notes, currentTime, compact = false }: ChordDisplayProps) {
    const { t } = useI18n();
    const { detectedChords, getCurrentChord } = useChordDetection({ notes });

    const currentChord = useMemo(() => {
        return getCurrentChord(currentTime);
    }, [getCurrentChord, currentTime]);

    // Upcoming chords (next 3)
    const upcomingChords = useMemo(() => {
        return detectedChords
            .filter(c => c.time > currentTime)
            .slice(0, 3);
    }, [detectedChords, currentTime]);

    if (compact) {
        return (
            <div className="chord-display-compact">
                {currentChord ? (
                    <div className="chord-current-badge">
                        <span className="chord-name">{currentChord.name}</span>
                    </div>
                ) : (
                    <div className="chord-none-badge">
                        <Music size={14} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="chord-display">
            <div className="chord-header">
                <Music size={14} />
                <span>{t.detectedChords}</span>
            </div>

            {/* Current Chord */}
            <div className="chord-current-section">
                {currentChord ? (
                    <div className="chord-current">
                        <span className="chord-label">Now</span>
                        <span className="chord-big-name">{currentChord.name}</span>
                    </div>
                ) : (
                    <div className="chord-current empty">
                        <span className="chord-label">—</span>
                    </div>
                )}
            </div>

            {/* Upcoming Chords */}
            {upcomingChords.length > 0 && (
                <div className="chord-upcoming-section">
                    <span className="chord-section-label">Next</span>
                    <div className="chord-upcoming-list">
                        {upcomingChords.map((chord, idx) => (
                            <span key={`${chord.time}-${idx}`} className="chord-upcoming-item">
                                {chord.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Chord Progression */}
            {detectedChords.length > 0 && (
                <div className="chord-progression-section">
                    <span className="chord-section-label">Progression ({detectedChords.length})</span>
                    <div className="chord-progression-list">
                        {detectedChords.slice(0, 12).map((chord, idx) => {
                            const isActive = currentChord?.time === chord.time;
                            const isPast = chord.time + chord.duration < currentTime;
                            return (
                                <span
                                    key={`${chord.time}-${idx}`}
                                    className={`chord-prog-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                                >
                                    {chord.name}
                                </span>
                            );
                        })}
                        {detectedChords.length > 12 && (
                            <span className="chord-more">+{detectedChords.length - 12}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChordDisplay;
