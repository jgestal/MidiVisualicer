/**
 * Toolbar Component - Barra de herramientas con Transpose, Loop, Instrumento y Metrónomo
 * Aparece debajo del header cuando está activada
 */
import { Timer, Music2, ChevronDown } from 'lucide-react';
import TransposeControls from '../TransposeControls';
import LoopControls from '../LoopControls';
import { useI18n } from '../../shared/context/I18nContext';
import type { MidiNote } from '../../types/midi';
import './Toolbar.css';

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

    // Instrument
    selectedInstrumentName: string;
    onOpenInstrumentMenu: () => void;

    // Metronome
    isMetronomeEnabled?: boolean;
    onToggleMetronome?: () => void;
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
    selectedInstrumentName,
    onOpenInstrumentMenu,
    isMetronomeEnabled = false,
    onToggleMetronome,
}: ToolbarProps) {
    const { t } = useI18n();

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

            <div className="toolbar-divider" />

            {/* Instrument Selector */}
            <div className="toolbar-section">
                <button
                    className="toolbar-instrument-btn"
                    onClick={onOpenInstrumentMenu}
                    title={t.selectInstrument}
                >
                    <Music2 size={16} />
                    <span>{selectedInstrumentName}</span>
                    <ChevronDown size={14} />
                </button>
            </div>

            {onToggleMetronome && (
                <>
                    <div className="toolbar-divider" />

                    <div className="toolbar-section metronome-section">
                        <button
                            className={`metronome-btn ${isMetronomeEnabled ? 'active' : ''}`}
                            onClick={onToggleMetronome}
                            title={isMetronomeEnabled ? t.disableLoop : t.enableLoop}
                        >
                            <Timer size={16} />
                            <span>{t.metronome}</span>
                            {isMetronomeEnabled && <span className="metronome-active-dot" />}
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}

export default Toolbar;
