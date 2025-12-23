/**
 * Custom hook for managing App-level UI state
 * Separates UI concerns from business logic in App.tsx
 */
import { useState, useCallback } from 'react';
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

    // Transient state (reset on refresh usually, but could also be persisted if desired)
    const [state, setState] = useState<AppUIState>(initialState);

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
