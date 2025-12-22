/**
 * Toolbar Component - Barra de herramientas con Transpose y Loop
 * Aparece debajo del header cuando está activada
 */
import TransposeControls from '../TransposeControls';
import LoopControls from '../LoopControls';
import type { MidiNote } from '../../types/midi';

interface ToolbarProps {
    // Transpose
    instrumentId: string;
    notes: MidiNote[];
    transpose: number;
    onTransposeChange: (semitones: number) => void;

    // Loop
    loopStart: number | null;
    loopEnd: number | null;
    isLoopEnabled: boolean;
    duration: number;
    currentTime: number;
    onSetLoopStart: (time: number | null) => void;
    onSetLoopEnd: (time: number | null) => void;
    onToggleLoop: () => void;
    onClearLoop: () => void;
}

export function Toolbar({
    instrumentId,
    notes,
    transpose,
    onTransposeChange,
    loopStart,
    loopEnd,
    isLoopEnabled,
    duration,
    currentTime,
    onSetLoopStart,
    onSetLoopEnd,
    onToggleLoop,
    onClearLoop,
}: ToolbarProps) {
    return (
        <div className="app-toolbar">
            <div className="toolbar-section">
                <TransposeControls
                    instrumentId={instrumentId}
                    notes={notes}
                    transpose={transpose}
                    onTransposeChange={onTransposeChange}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-section">
                <LoopControls
                    loopStart={loopStart}
                    loopEnd={loopEnd}
                    isLoopEnabled={isLoopEnabled}
                    duration={duration}
                    currentTime={currentTime}
                    onSetLoopStart={onSetLoopStart}
                    onSetLoopEnd={onSetLoopEnd}
                    onToggleLoop={onToggleLoop}
                    onClearLoop={onClearLoop}
                />
            </div>
        </div>
    );
}

export default Toolbar;
