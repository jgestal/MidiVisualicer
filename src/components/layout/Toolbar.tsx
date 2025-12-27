/**
 * Toolbar Component - Barra de herramientas con Transpose, Loop, Instrumento y Metrónomo
 * Aparece debajo del header cuando está activada
 */
import { Timer, ChevronDown, Guitar, Hourglass } from 'lucide-react';
import TransposeControls from '../TransposeControls';
import LoopControls from '../LoopControls';
import { useI18n } from '../../shared/context/I18nContext';
import { getAllInstruments } from '../../config/instruments';
import { ACCENT_SUCCESS } from '../../shared/constants/colors';
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

    // Delay / Count In
    isCountInEnabled?: boolean;
    countInDuration?: number;
    onToggleCountIn?: () => void;
    onSetCountInDuration?: (seconds: number) => void;

    isMetronomeEnabled?: boolean;
    onToggleMetronome?: () => void;

    // Auto Transpose
    isAutoTransposeEnabled?: boolean;
    onToggleAutoTranspose?: () => void;

    // Speed Trainer
    speedTrainer: {
        isEnabled: boolean;
        startSpeed: number;
        endSpeed: number;
        increment: number;
    };
    onToggleSpeedTrainer: () => void;
    onSetSpeedTrainerIncrement?: (increment: number) => void;
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
    isCountInEnabled = false,
    countInDuration = 3,
    onToggleCountIn,
    onSetCountInDuration,
    isAutoTransposeEnabled = true,
    onToggleAutoTranspose,
    speedTrainer,
    onToggleSpeedTrainer,
    onSetSpeedTrainerIncrement,
}: ToolbarProps) {
    const { t } = useI18n();
    const instrument = getAllInstruments()[instrumentId];

    return (
        <div className="app-toolbar">
            <div className="toolbar-section">
                <TransposeControls
                    instrumentId={instrumentId}
                    notes={notes}
                    transpose={transpose}
                    onTransposeChange={onTransposeChange}
                    isAutoEnabled={isAutoTransposeEnabled}
                    onToggleAuto={onToggleAutoTranspose}
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
                    speedTrainer={speedTrainer}
                    onToggleSpeedTrainer={onToggleSpeedTrainer}
                    onSetSpeedTrainerIncrement={onSetSpeedTrainerIncrement}
                />
            </div>

            <div className="toolbar-divider" />

            {/* Instrument Selector */}
            <div className="toolbar-section">
                <div className="toolbar-label" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                    marginRight: '8px',
                    minWidth: '70px', /* Consistent width with Loop/Transpose */
                    fontSize: '12px'
                }}>
                    <Guitar size={16} />
                    <span>{t.instrument}</span>
                </div>
                <button
                    className="toolbar-instrument-btn"
                    onClick={onOpenInstrumentMenu}
                    title={t.selectInstrument}
                >
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{instrument?.icon || '🎵'}</span>
                    <span className="toolbar-instrument-name">{selectedInstrumentName}</span>
                    <ChevronDown size={14} />
                </button>
            </div>

            {onToggleCountIn && (
                <>
                    <div className="toolbar-divider" />
                    <div className="toolbar-section metronome-section">
                        <button
                            className={`metronome-btn ${isCountInEnabled ? 'active' : ''}`}
                            onClick={onToggleCountIn}
                            title={isCountInEnabled ? 'Desactivar delay' : 'Activar delay'}
                        >
                            <Hourglass size={16} />
                            <span>Delay</span>
                            {isCountInEnabled && <span className="metronome-active-dot" />}
                        </button>
                        <div className="transpose-controls" style={{ marginLeft: '8px' }}>
                            <button
                                onClick={() => onSetCountInDuration?.(Math.max(1, countInDuration - 1))}
                                disabled={countInDuration <= 1}
                                title="Reducir segundos"
                            >
                                −
                            </button>
                            <span className="transpose-value" style={{ color: ACCENT_SUCCESS }}>
                                {countInDuration}s
                            </span>
                            <button
                                onClick={() => onSetCountInDuration?.(Math.min(10, countInDuration + 1))}
                                disabled={countInDuration >= 10}
                                title="Aumentar segundos"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </>
            )}

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
