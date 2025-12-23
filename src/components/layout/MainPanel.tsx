/**
 * MainPanel Component - Panel central con tabs
 * Muestra Tablatura (por defecto) o Partitura
 */
import { Music2, FileText } from 'lucide-react';
import { useI18n } from '../../shared/context/I18nContext';

interface MainPanelProps {
    activeView: 'tablature' | 'notation';
    onViewChange: (view: 'tablature' | 'notation') => void;
    children: React.ReactNode;
}

export function MainPanel({
    activeView,
    onViewChange,
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
            </div>

            {/* Content Area */}
            <div className="main-panel-content">
                {children}
            </div>
        </div>
    );
}

export default MainPanel;

