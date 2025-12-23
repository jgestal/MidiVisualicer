/**
 * Toolbar Component - Barra de herramientas con Transpose, Loop, Instrumento y Metrónomo
 * Aparece debajo del header cuando está activada
 */
import { Timer, Music2, ChevronDown } from 'lucide-react';
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
                    title="Seleccionar Instrumento"
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
                            title={isMetronomeEnabled ? 'Desactivar metrónomo' : 'Activar metrónomo'}
                        >
                            <Timer size={16} />
                            <span>Metrónomo</span>
                            {isMetronomeEnabled && <span className="metronome-active-dot" />}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                .toolbar-instrument-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--color-bg-tertiary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    color: var(--color-text-primary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .toolbar-instrument-btn:hover {
                    background: var(--color-bg-hover);
                    border-color: var(--color-accent-primary);
                }

                .metronome-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .metronome-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--color-bg-tertiary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    color: var(--color-text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    position: relative;
                }

                .metronome-btn:hover {
                    background: var(--color-bg-hover);
                    color: var(--color-text-primary);
                }

                .metronome-btn.active {
                    background: var(--color-accent-primary);
                    color: white;
                    border-color: var(--color-accent-primary);
                }
                
                .metronome-active-dot {
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: metronomePulse 0.5s ease-in-out infinite;
                }
                
                @keyframes metronomePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}

export default Toolbar;
