import { lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { ParsedMidi } from '@/shared/types/midi';

// Lazy load modal components
const InstrumentSelector = lazy(() => import('../InstrumentSelector').then(m => ({ default: m.InstrumentSelector })));
const MidiInfoModal = lazy(() => import('../MidiInfoModal').then(m => ({ default: m.MidiInfoModal })));
const AboutModal = lazy(() => import('../AboutModal').then(m => ({ default: m.AboutModal })));
const HelpModal = lazy(() => import('../HelpModal').then(m => ({ default: m.HelpModal })));

// Loading fallback for modals
const ModalLoading = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: 'var(--color-text-muted)'
    }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
        <span>Loading...</span>
    </div>
);

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
            {ui.showInstrumentModal && createPortal(
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
                            <Suspense fallback={<ModalLoading />}>
                                <InstrumentSelector
                                    selectedInstrument={selectedInstrumentId}
                                    onSelectInstrument={(id: string) => {
                                        selectInstrument(id);
                                        ui.closeInstrumentModal();
                                    }}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MIDI INFO MODAL */}
            {ui.showInfoModal && parsedMidi && (
                <Suspense fallback={null}>
                    <MidiInfoModal
                        midi={parsedMidi}
                        onClose={ui.closeInfoModal}
                    />
                </Suspense>
            )}

            {/* ABOUT MODAL */}
            {ui.showAboutModal && (
                <Suspense fallback={null}>
                    <AboutModal onClose={ui.closeAboutModal} />
                </Suspense>
            )}

            {/* HELP MODAL */}
            {ui.showHelpModal && (
                <Suspense fallback={null}>
                    <HelpModal onClose={ui.closeHelpModal} />
                </Suspense>
            )}
        </>
    );
}
