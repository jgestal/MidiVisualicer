/**
 * MainPanel Component - Panel central con tabs
 * Muestra Tablatura (por defecto) o Partitura
 */
import { Music2, FileText, Sparkles, ZoomIn, ZoomOut, Music, ChevronDown } from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';
import { useChordDetection } from '../../hooks/useChordDetection';
import { useState, useRef, useEffect } from 'react';
import type { MidiNote } from '../../types/midi';

interface MainPanelProps {
    activeView: 'tablature' | 'notation';
    onViewChange: (view: 'tablature' | 'notation') => void;
    isSimplified: boolean;
    onToggleSimplify: () => void;
    simplificationStrategy?: import('../../utils/simplifyNotes').SimplificationStrategy;
    onStrategyChange?: (strategy: import('../../utils/simplifyNotes').SimplificationStrategy) => void;
    hasNotes: boolean; // To disable simplify when no notes
    children: React.ReactNode;
    // Zoom controls
    zoom?: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onResetZoom?: () => void;
    canZoomIn?: boolean;
    canZoomOut?: boolean;
    // Chord detection
    notes?: MidiNote[];
    currentTime?: number;
}

export function MainPanel({
    activeView,
    onViewChange,
    isSimplified,
    onToggleSimplify,
    simplificationStrategy = 'TOP_NOTE',
    onStrategyChange,
    hasNotes,
    children,
    zoom = 1,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    canZoomIn = true,
    canZoomOut = true,
    notes = [],
    currentTime = 0,
}: MainPanelProps) {
    const { t } = useI18n();
    const { getCurrentChord } = useChordDetection({ notes });
    const currentChord = getCurrentChord(currentTime);
    const [showStrategies, setShowStrategies] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowStrategies(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleSimplify = () => {
        if (!isSimplified) {
            onToggleSimplify();
            setShowStrategies(true);
        } else {
            // If already simplified, maybe just toggle the menu? 
            // Or toggle off if clicked on the main part.
            // Let's make it so clicking the sparkle toggles, and clicking the chevron opens menu.
            onToggleSimplify();
            setShowStrategies(false);
        }
    };

    return (
        <div className="main-panel">
            {/* Tab Bar */}
            <div className="main-panel-tabs">
                <button
                    className={`main-panel-tab ${activeView === 'tablature' ? 'active' : ''}`}
                    onClick={() => onViewChange('tablature')}
                >
                    <Music2 size={14} />
                    <span>{t.tablature}</span>
                </button>
                <button
                    className={`main-panel-tab ${activeView === 'notation' ? 'active' : ''}`}
                    onClick={() => onViewChange('notation')}
                >
                    <FileText size={14} />
                    <span>{t.notation}</span>
                </button>

                {/* Current Chord Badge */}
                {currentChord && (
                    <div className="main-panel-chord-badge" title={t.detectedChords}>
                        <Music size={12} />
                        <span className="chord-name">{currentChord.name}</span>
                    </div>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Zoom Controls - Only show for tablature view */}
                {activeView === 'tablature' && onZoomIn && onZoomOut && (
                    <div className="main-panel-zoom">
                        <button
                            className="main-panel-tab zoom-btn"
                            onClick={onZoomOut}
                            disabled={!canZoomOut}
                            title={t.zoomOut}
                        >
                            <ZoomOut size={14} />
                        </button>
                        <button
                            className="main-panel-tab zoom-level"
                            onClick={onResetZoom}
                            title={t.resetZoom}
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            className="main-panel-tab zoom-btn"
                            onClick={onZoomIn}
                            disabled={!canZoomIn}
                            title={t.zoomIn}
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>
                )}

                <div className="main-panel-simplify-container" ref={menuRef}>
                    <div className={`simplify-button-group ${isSimplified ? 'active' : ''}`}>
                        <button
                            className={`main-panel-tab simplify-btn ${isSimplified ? 'active' : ''}`}
                            onClick={handleToggleSimplify}
                            disabled={!hasNotes}
                            title={t.simplifyTooltip}
                        >
                            <Sparkles size={14} />
                            <span>{isSimplified && simplificationStrategy !== 'ALL_NOTES' ? t.simplified : t.simplify}</span>
                        </button>

                        {isSimplified && (
                            <button
                                className="simplify-chevron-btn"
                                onClick={() => setShowStrategies(!showStrategies)}
                                title={t.strategy}
                            >
                                <ChevronDown size={14} />
                            </button>
                        )}
                    </div>

                    {showStrategies && isSimplified && onStrategyChange && (
                        <div className="strategy-popup">
                            <div className="strategy-popup-header">
                                <span>{t.strategy}</span>
                            </div>
                            <div className="strategy-options">
                                {[
                                    { id: 'TOP_NOTE', label: t.strategyMelody },
                                    { id: 'BASS_ONLY', label: t.strategyBass },
                                    { id: 'BASS_AND_MELODY', label: t.strategyBassMelody },
                                    { id: 'ALL_NOTES', label: t.strategyAll }
                                ].map((strat) => (
                                    <button
                                        key={strat.id}
                                        className={simplificationStrategy === strat.id ? 'active' : ''}
                                        onClick={() => {
                                            onStrategyChange(strat.id as any);
                                            setShowStrategies(false);
                                        }}
                                    >
                                        {strat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="main-panel-content">
                {children}

            </div>
        </div>
    );
}

export default MainPanel;
