import { ChevronDown } from 'lucide-react';
import { PianoRollView } from '../PianoRollView';
import type { MidiNote } from '@/shared/types/midi';

interface PianoRollCollapsibleProps {
    showPianoRoll: boolean;
    notes: MidiNote[];
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    loopStart: number | null;
    loopEnd: number | null;
    transpose: number;
    trackId: number;
    onSetLoopStart: (time: number) => void;
    onSetLoopEnd: (time: number) => void;
    onSeek: (time: number) => void;
    onShow: () => void;
    onHide: () => void;
}

export function PianoRollCollapsible({
    showPianoRoll,
    notes,
    currentTime,
    duration,
    isPlaying,
    loopStart,
    loopEnd,
    transpose,
    trackId,
    onSetLoopStart,
    onSetLoopEnd,
    onSeek,
    onShow,
    onHide,
}: PianoRollCollapsibleProps) {
    return (
        <div
            className={`piano-roll-section ${!showPianoRoll ? 'collapsed' : ''}`}
            style={{ height: showPianoRoll ? '180px' : 'auto' }}
        >
            {showPianoRoll ? (
                <PianoRollView
                    notes={notes}
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                    loopStart={loopStart}
                    loopEnd={loopEnd}
                    transpose={transpose}
                    trackId={trackId}
                    onSetLoopStart={onSetLoopStart}
                    onSetLoopEnd={onSetLoopEnd}
                    onSeek={onSeek}
                    onToggle={onHide}
                />
            ) : (
                <button
                    className="piano-roll-collapsed-toggle"
                    onClick={onShow}
                    title="Mostrar Piano Roll"
                >
                    <span>
                        🎹 Piano Roll
                        <ChevronDown size={14} />
                    </span>
                </button>
            )}
        </div>
    );
}
