/**
 * Header Component - Barra de título superior
 * 
 * Estados:
 * - Sin MIDI: Solo icono de música + nombre del programa
 * - Con MIDI: Controles completos (instrumentos, exportar, tema, etc.)
 */
import { useState, useMemo } from 'react';
import {
    Music,
    ArrowLeft,
    Info,
    HelpCircle,
    Palette,
    Keyboard,
    Settings2,
    FileDown,
    ListMusic,
    Download,
    FileText,
    FileCode,
    FileImage,
    Printer
} from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import { useTheme } from '../../shared/context/ThemeContext';
import { useI18n, LANGUAGES, type Language } from '../../shared/context/I18nContext';
import { THEMES, CATEGORIES } from '../../config/themes';
import './Header.css';

interface HeaderProps {
    hasMidi: boolean;
    fileName?: string;
    tempo?: number;
    timeSignature?: string;

    // Volver a la pantalla inicial
    onClose: () => void;

    // Toggles de barras
    showToolbar: boolean;
    onToggleToolbar: () => void;

    // Exportar
    onExportTxt: () => void;
    onExportTab: () => void;
    onExportPdf: () => void;
    onExportMusicXML?: () => void;
    onExportWord?: () => void;
    onExportSheetSVG?: () => void;

    // Info
    onShowInfo: () => void;

    // About & Help
    onShowAbout: () => void;
    onShowHelp: () => void;
}

export function Header({
    hasMidi,
    fileName,
    tempo,
    timeSignature,
    onClose,
    showToolbar,
    onToggleToolbar,
    onExportTxt,
    onExportTab,
    onExportPdf,
    onExportMusicXML,
    onExportWord,
    onExportSheetSVG,
    onShowInfo,
    onShowAbout,
    onShowHelp,
}: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useI18n();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showConfirmBack, setShowConfirmBack] = useState(false);

    // Group themes by category for the menu
    const themesByCategory = useMemo(() => {
        return CATEGORIES.map(category => ({
            name: category,
            themes: THEMES.filter(t => t.category === category)
        }));
    }, []);

    // Handler for back button with confirmation
    const handleBackClick = () => {
        if (hasMidi) {
            setShowConfirmBack(true);
        } else {
            onClose();
        }
    };

    // Shared Theme Menu Component
    const ThemeMenu = () => (
        <div className="header-theme-menu">
            {themesByCategory.map(section => (
                <div key={section.name} className="theme-menu-section">
                    <div className="theme-section-title">{section.name}</div>
                    {section.themes.map(tCfg => {
                        const Icon = tCfg.icon;
                        return (
                            <button
                                key={tCfg.id}
                                className={`theme-option ${theme === tCfg.id ? 'active' : ''}`}
                                onClick={() => { setTheme(tCfg.id); setShowThemeMenu(false); }}
                            >
                                <Icon size={14} className="theme-option-icon" />
                                <span>{t[tCfg.name as keyof typeof t] || tCfg.id}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <header className="app-header">
                {/* Left Section */}
                <div className="header-left">
                    {hasMidi && (
                        <button
                            className="header-btn header-back-btn"
                            onClick={handleBackClick}
                            title={t.back || 'Atrás'}
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    <div className="header-brand">
                        <Music size={20} className="header-logo" />
                        <span className="header-title">Midi Tab <span className="title-pro">Pro</span></span>
                    </div>

                    {hasMidi && fileName && (
                        <div className="header-file-info">
                            <span className="header-filename" title={fileName}>{fileName}</span>
                            {tempo && <span className="header-tempo">{Math.round(tempo)} BPM</span>}
                            {timeSignature && <span className="header-time-sig">{timeSignature}</span>}
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className="header-right">
                    {hasMidi && (
                        <>
                            {/* Info button */}
                            <button
                                className="header-btn"
                                onClick={onShowInfo}
                                title={t.midiInfo || 'Información MIDI'}
                            >
                                <Info size={18} />
                            </button>

                            {/* Export Dropdown */}
                            <div className="header-menu-container">
                                <button
                                    className="header-btn"
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    title={t.export || 'Exportar'}
                                >
                                    <FileDown size={18} />
                                </button>
                                {showExportMenu && (
                                    <div className="header-dropdown export-dropdown">
                                        <div className="dropdown-title">{t.exportAs || 'Exportar como'}</div>
                                        <button onClick={() => { onExportTxt(); setShowExportMenu(false); }}>
                                            <ListMusic size={14} /> {t.cifrado || 'Cifrado'}
                                        </button>
                                        <button onClick={() => { onExportTab(); setShowExportMenu(false); }}>
                                            <Download size={14} /> {t.exportTablature || 'Tablatura'}
                                        </button>
                                        {onExportWord && (
                                            <button onClick={() => { onExportWord(); setShowExportMenu(false); }}>
                                                <FileText size={14} /> {t.word || 'Word'}
                                            </button>
                                        )}
                                        {onExportMusicXML && (
                                            <button onClick={() => { onExportMusicXML(); setShowExportMenu(false); }}>
                                                <FileCode size={14} /> {t.musicxml || 'MusicXML'}
                                            </button>
                                        )}
                                        {onExportSheetSVG && (
                                            <button onClick={() => { onExportSheetSVG(); setShowExportMenu(false); }}>
                                                <FileImage size={14} /> {t.sheetSvg || 'Partitura (SVG)'}
                                            </button>
                                        )}
                                        <div className="dropdown-divider" />
                                        <button onClick={() => { onExportPdf(); setShowExportMenu(false); }}>
                                            <Printer size={14} /> {t.printPdf || 'Imprimir PDF'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="header-divider" />

                            {/* Toggle Toolbar */}
                            <button
                                className={`header-btn header-toggle-btn ${showToolbar ? 'active' : ''}`}
                                onClick={onToggleToolbar}
                                title={showToolbar ? t.hideToolbar : t.showToolbar}
                            >
                                <Settings2 size={18} />
                            </button>

                            <div className="header-divider" />
                        </>
                    )}

                    {/* Language Menu */}
                    <div className="header-menu-container">
                        <button
                            className="header-btn header-lang-btn"
                            onClick={() => { setShowLangMenu(!showLangMenu); setShowThemeMenu(false); }}
                            title={t.language || 'Idioma'}
                        >
                            <span className="lang-flag-current">{LANGUAGES[language].flag}</span>
                        </button>
                        {showLangMenu && (
                            <div className="header-dropdown lang-dropdown">
                                {Object.entries(LANGUAGES).map(([code, config]) => (
                                    <button
                                        key={code}
                                        className={`dropdown-item ${language === code ? 'active' : ''}`}
                                        onClick={() => { setLanguage(code as Language); setShowLangMenu(false); }}
                                    >
                                        <span className="lang-flag">{config.flag}</span>
                                        <span className="lang-name">{config.nativeName}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Menu */}
                    <div className="header-menu-container">
                        <button
                            className="header-btn"
                            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowLangMenu(false); }}
                            title={t.darkMode || 'Tema'}
                        >
                            <Palette size={18} />
                        </button>
                        {showThemeMenu && <ThemeMenu />}
                    </div>

                    <div className="header-divider" />

                    {/* Help Button */}
                    <button className="header-btn" onClick={onShowHelp} title={t.help || 'Ayuda'}>
                        <HelpCircle size={18} />
                    </button>

                    {/* Shortcuts Button */}
                    <button className="header-btn" onClick={() => setShowShortcuts(true)} title={t.keyboardShortcuts || 'Atajos'}>
                        <Keyboard size={18} />
                    </button>

                    {/* About Button */}
                    <button className="header-btn" onClick={onShowAbout} title={t.about || 'Acerca de'}>
                        <Info size={18} />
                    </button>
                </div>

                {/* Keyboard Shortcuts Modal */}
                {showShortcuts && (
                    <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
                )}
            </header>

            {/* Custom Confirm Modal for Back action */}
            <ConfirmModal
                isOpen={showConfirmBack}
                onClose={() => setShowConfirmBack(false)}
                onConfirm={onClose}
                title={t.confirm || 'Confirmar'}
                message={t.confirmClose || '¿Estás seguro de que deseas cerrar el archivo MIDI actual?'}
                confirmText={t.close || 'Cerrar'}
                cancelText={t.cancel || 'Cancelar'}
                preventClose={true} // Add this prop
            />
        </>
    );
}

export default Header;
