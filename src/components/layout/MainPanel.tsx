/**
 * MainPanel Component - Panel central con tabs
 * Muestra Tablatura (por defecto) o Partitura
 */
import { Music2, FileText, Sparkles } from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';

interface MainPanelProps {
    activeView: 'tablature' | 'notation';
    onViewChange: (view: 'tablature' | 'notation') => void;
    isSimplified: boolean;
    onToggleSimplify: () => void;
    hasNotes: boolean; // To disable simplify when no notes
    children: React.ReactNode;
}

export function MainPanel({
    activeView,
    onViewChange,
    isSimplified,
    onToggleSimplify,
    hasNotes,
    children,
}: MainPanelProps) {
    const { t } = useI18n();

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

                {/* Spacer */}
                <div style={{ flex: 1 }} />

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

