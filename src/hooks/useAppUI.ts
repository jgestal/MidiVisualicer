/**
 * Custom hook for managing App-level UI state
 * Separates UI concerns from business logic in App.tsx
 */
import { useState, useCallback } from 'react';

export interface AppUIState {
    showToolbar: boolean;
    showPianoRoll: boolean;
    activeView: 'tablature' | 'notation';
    showInstrumentModal: boolean;
    showInfoModal: boolean;
    showAboutModal: boolean;
    showHelpModal: boolean;
}

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
    const [state, setState] = useState<AppUIState>(initialState);

    // Panel toggles
    const toggleToolbar = useCallback(() => {
        setState(prev => ({ ...prev, showToolbar: !prev.showToolbar }));
    }, []);

    const togglePianoRoll = useCallback(() => {
        setState(prev => ({ ...prev, showPianoRoll: !prev.showPianoRoll }));
    }, []);

    const showPianoRollPanel = useCallback(() => {
        setState(prev => ({ ...prev, showPianoRoll: true }));
    }, []);

    const hidePianoRollPanel = useCallback(() => {
        setState(prev => ({ ...prev, showPianoRoll: false }));
    }, []);

    // View switching
    const setActiveView = useCallback((view: 'tablature' | 'notation') => {
        setState(prev => ({ ...prev, activeView: view }));
    }, []);

    // Modal controls
    const openInstrumentModal = useCallback(() => {
        setState(prev => ({ ...prev, showInstrumentModal: true }));
    }, []);

    const closeInstrumentModal = useCallback(() => {
        setState(prev => ({ ...prev, showInstrumentModal: false }));
    }, []);

    const openInfoModal = useCallback(() => {
        setState(prev => ({ ...prev, showInfoModal: true }));
    }, []);

    const closeInfoModal = useCallback(() => {
        setState(prev => ({ ...prev, showInfoModal: false }));
    }, []);

    const openAboutModal = useCallback(() => {
        setState(prev => ({ ...prev, showAboutModal: true }));
    }, []);

    const closeAboutModal = useCallback(() => {
        setState(prev => ({ ...prev, showAboutModal: false }));
    }, []);

    const openHelpModal = useCallback(() => {
        setState(prev => ({ ...prev, showHelpModal: true }));
    }, []);

    const closeHelpModal = useCallback(() => {
        setState(prev => ({ ...prev, showHelpModal: false }));
    }, []);

    return {
        // State
        ...state,

        // Panel actions
        toggleToolbar,
        togglePianoRoll,
        showPianoRollPanel,
        hidePianoRollPanel,
        setActiveView,

        // Modal actions
        openInstrumentModal,
        closeInstrumentModal,
        openInfoModal,
        closeInfoModal,
        openAboutModal,
        closeAboutModal,
        openHelpModal,
        closeHelpModal,
    };
}
