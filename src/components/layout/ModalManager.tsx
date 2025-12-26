import { X } from 'lucide-react';
import { InstrumentSelector } from '../InstrumentSelector';
import { MidiInfoModal } from '../MidiInfoModal';
import { AboutModal } from '../AboutModal';
import { HelpModal } from '../HelpModal';
import type { ParsedMidi } from '@/shared/types/midi';

interface ModalManagerProps {
    ui: {
        showInstrumentModal: boolean;
        closeInstrumentModal: () => void;
        showInfoModal: boolean;
        closeInfoModal: () => void;
        showAboutModal: boolean;
        closeAboutModal: () => void;
        showHelpModal: boolean;
        closeHelpModal: () => void;
    };
    parsedMidi: ParsedMidi | null;
    selectedInstrumentId: string;
    selectInstrument: (id: string) => void;
}

export function ModalManager({
    ui,
    parsedMidi,
    selectedInstrumentId,
    selectInstrument,
}: ModalManagerProps) {
    return (
        <>
            {/* INSTRUMENT MODAL */}
            {ui.showInstrumentModal && (
                <div
                    className="instrument-modal-overlay"
                    onClick={ui.closeInstrumentModal}
                >
                    <div
                        className="instrument-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="instrument-modal-header">
                            <h2 className="instrument-modal-title">Seleccionar Instrumento</h2>
                            <button
                                className="instrument-modal-close"
                                onClick={ui.closeInstrumentModal}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="instrument-modal-content">
                            <InstrumentSelector
                                selectedInstrument={selectedInstrumentId}
                                onSelectInstrument={(id: string) => {
                                    selectInstrument(id);
                                    ui.closeInstrumentModal();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MIDI INFO MODAL */}
            {ui.showInfoModal && parsedMidi && (
                <MidiInfoModal
                    midi={parsedMidi}
                    onClose={ui.closeInfoModal}
                />
            )}

            {/* ABOUT MODAL */}
            {ui.showAboutModal && (
                <AboutModal onClose={ui.closeAboutModal} />
            )}

            {/* HELP MODAL */}
            {ui.showHelpModal && (
                <HelpModal onClose={ui.closeHelpModal} />
            )}
        </>
    );
}
