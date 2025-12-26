/**
 * MainPanel Component - Panel central con tabs
 * Muestra Tablatura (por defecto) o Partitura
 */
import { Music2, FileText, Sparkles, ZoomIn, ZoomOut, Music } from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';
import { useChordDetection } from '../../hooks/useChordDetection';
import type { MidiNote } from '../../types/midi';

interface MainPanelProps {
    activeView: 'tablature' | 'notation';
    onViewChange: (view: 'tablature' | 'notation') => void;
    isSimplified: boolean;
    onToggleSimplify: () => void;
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

                {/* Simplify Button */}
                <button
                    className={`main-panel-tab simplify-btn ${isSimplified ? 'active' : ''}`}
                    onClick={onToggleSimplify}
                    disabled={!hasNotes}
                    title={t.simplifyTooltip}
                >
                    <Sparkles size={14} />
                    <span>{isSimplified ? t.simplified : t.simplify}</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="main-panel-content">
                {children}

            </div>
        </div>
    );
}

export default MainPanel;
