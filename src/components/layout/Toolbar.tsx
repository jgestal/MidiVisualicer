/**
 * Toolbar Component - Barra de herramientas con Transpose, Loop, Instrumento y Metrónomo
 * Aparece debajo del header cuando está activada
 */
import { useState } from 'react';
import { Timer, ChevronDown, Guitar, Hourglass, Keyboard } from 'lucide-react';
import TransposeControls from '../TransposeControls';
import LoopControls from '../LoopControls';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import { useI18n } from '../../shared/context/I18nContext';
import { getAllInstruments } from '../../config/instruments';
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
    onToggleCountIn?: () => void;

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
    isCountInEnabled = false,
    onToggleCountIn,
}: ToolbarProps) {
    const { t } = useI18n();
    const [showShortcuts, setShowShortcuts] = useState(false);
    const instrument = getAllInstruments()[instrumentId];

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
                    <div className="toolbar-section">
                        <button
                            className={`metronome-btn ${isCountInEnabled ? 'active' : ''}`}
                            onClick={onToggleCountIn}
                            title={t.countInDelay}
                        >
                            <Hourglass size={16} />
                            <span>{t.countInDelay}</span>
                            {isCountInEnabled && <span className="metronome-active-dot" />}
                        </button>
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

            {/* Keyboard Shortcuts Button */}
            <div className="toolbar-divider" />
            <div className="toolbar-section">
                <button
                    className="shortcuts-btn"
                    onClick={() => setShowShortcuts(true)}
                    title={t.keyboardShortcuts || 'Keyboard Shortcuts'}
                >
                    <Keyboard size={16} />
                </button>
            </div>

            {/* Shortcuts Modal */}
            {showShortcuts && (
                <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
            )}

        </div>
    );
}

export default Toolbar;
