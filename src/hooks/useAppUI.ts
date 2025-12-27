/**
 * Custom hook for managing App-level UI state
 * Separates UI concerns from business logic in App.tsx
 * 
 * Refactored with DRY pattern using createModalControls helper
 */
import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface AppUIState {
    showToolbar: boolean;
    showPianoRoll: boolean;
    activeView: 'tablature' | 'notation';
    showInstrumentModal: boolean;
    showInfoModal: boolean;
    showAboutModal: boolean;
    showHelpModal: boolean;
}

// Modal key type for type safety
type ModalKey = 'showInstrumentModal' | 'showInfoModal' | 'showAboutModal' | 'showHelpModal';

const initialState: AppUIState = {
    showToolbar: true,
    showPianoRoll: true,
    activeView: 'tablature',
    showInstrumentModal: false,
    showInfoModal: false,
    showAboutModal: false,
    showHelpModal: false,
};

export function useAppUI() {
    // Persisted state
    const [showToolbar, setShowToolbar] = useLocalStorage('ui_showToolbar', true);
    const [showPianoRoll, setShowPianoRoll] = useLocalStorage('ui_showPianoRoll', true);

    // Transient state
    const [state, setState] = useState<AppUIState>(initialState);

    // DRY helper for modal controls
    const createModalControls = useCallback((key: ModalKey) => ({
        open: () => setState(prev => ({ ...prev, [key]: true })),
        close: () => setState(prev => ({ ...prev, [key]: false })),
    }), []);

    // Panel toggles
    const toggleToolbar = useCallback(() => {
        setShowToolbar(prev => !prev);
    }, [setShowToolbar]);

    const togglePianoRoll = useCallback(() => {
        setShowPianoRoll(prev => !prev);
    }, [setShowPianoRoll]);

    const showPianoRollPanel = useCallback(() => {
        setShowPianoRoll(true);
    }, [setShowPianoRoll]);

    const hidePianoRollPanel = useCallback(() => {
        setShowPianoRoll(false);
    }, [setShowPianoRoll]);

    // View switching
    const setActiveView = useCallback((view: 'tablature' | 'notation') => {
        setState(prev => ({ ...prev, activeView: view }));
    }, []);

    // Modal controls using DRY helper
    const instrumentModal = useMemo(() => createModalControls('showInstrumentModal'), [createModalControls]);
    const infoModal = useMemo(() => createModalControls('showInfoModal'), [createModalControls]);
    const aboutModal = useMemo(() => createModalControls('showAboutModal'), [createModalControls]);
    const helpModal = useMemo(() => createModalControls('showHelpModal'), [createModalControls]);

    return {
        // Combined State
        ...state,
        showToolbar,
        showPianoRoll,

        // Panel actions
        toggleToolbar,
        togglePianoRoll,
        showPianoRollPanel,
        hidePianoRollPanel,
        setActiveView,

        // Modal actions (backward compatible API)
        openInstrumentModal: instrumentModal.open,
        closeInstrumentModal: instrumentModal.close,
        openInfoModal: infoModal.open,
        closeInfoModal: infoModal.close,
        openAboutModal: aboutModal.open,
        closeAboutModal: aboutModal.close,
        openHelpModal: helpModal.open,
        closeHelpModal: helpModal.close,
    };
}
