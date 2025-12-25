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
    Download,
    SlidersHorizontal,
    ChevronUp,
    ChevronDown,
    Info,
    FileDown,
    ListMusic,
    Printer,
    HelpCircle,
    FileCode,
    FileText,
    FileImage,
    Palette,
    Keyboard,
} from 'lucide-react';
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

    // Group themes by category for the menu
    const themesByCategory = useMemo(() => {
        return CATEGORIES.map(category => ({
            name: category,
            themes: THEMES.filter(t => t.category === category)
        }));
    }, []);

    // Handler for back button with confirmation
    const handleBackClick = () => {
        if (window.confirm(t.confirmClose || '¿Salir y cerrar el archivo MIDI actual?')) {
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
        <header className="app-header">
            {/* Left Section */}
            <div className="header-left">
                {/* Back button - only visible when MIDI is loaded */}
                {hasMidi && (
                    <button
                        className="header-btn header-back-btn"
                        onClick={handleBackClick}
                        title={t.back}
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}

                <div className="header-brand">
                    <Music size={20} className="header-logo" />
                    <span className="header-title">Midi Tab Pro</span>
                </div>

                {hasMidi && fileName && (
                    <div className="header-file-info">
                        <span className="header-filename">{fileName}</span>
                        {tempo && <span className="header-tempo">{tempo.toFixed(1)} BPM</span>}
                        {timeSignature && <span className="header-time-sig">{timeSignature}</span>}

                        {/* Info button */}
                        <button
                            className="header-btn header-info-btn"
                            onClick={onShowInfo}
                            title={t.midiInfo}
                        >
                            <Info size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Section */}
            <div className="header-right">
                {hasMidi && (
                    <>
                        {/* Toggle Toolbar (Transpose + Loop) */}
                        <button
                            className={`header-btn header-toggle-btn ${showToolbar ? 'active' : ''}`}
                            onClick={onToggleToolbar}
                            title={t.toggleToolbar}
                        >
                            <SlidersHorizontal size={16} />
                            {showToolbar ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <div className="header-divider" />

                        {/* Export Dropdown */}
                        <div className="header-export-dropdown">
                            <button
                                className="header-btn header-export-btn"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                title={t.export}
                            >
                                <FileDown size={16} />
                                <span>{t.export}</span>
                                <ChevronDown size={14} />
                            </button>

                            {showExportMenu && (
                                <div className="header-export-menu">
                                    <div className="export-menu-title">{t.exportAs}</div>
                                    <button onClick={() => { onExportTxt(); setShowExportMenu(false); }}>
                                        <ListMusic size={14} /> {t.cifrado}
                                    </button>
                                    <button onClick={() => { onExportTab(); setShowExportMenu(false); }}>
                                        <Download size={14} /> {t.exportTablature}
                                    </button>
                                    {onExportWord && (
                                        <button onClick={() => { onExportWord(); setShowExportMenu(false); }}>
                                            <FileText size={14} /> {t.word}
                                        </button>
                                    )}
                                    {onExportMusicXML && (
                                        <button onClick={() => { onExportMusicXML(); setShowExportMenu(false); }}>
                                            <FileCode size={14} /> {t.musicxml}
                                        </button>
                                    )}
                                    {onExportSheetSVG && (
                                        <button onClick={() => { onExportSheetSVG(); setShowExportMenu(false); }}>
                                            <FileImage size={14} /> {t.sheetSvg || 'Partitura (SVG)'}
                                        </button>
                                    )}
                                    <div className="export-menu-divider" />
                                    <button onClick={() => { onExportPdf(); setShowExportMenu(false); }}>
                                        <Printer size={14} /> {t.printPdf}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="header-divider" />
                    </>
                )}

                {/* Language Selector */}
                <div className="header-lang-dropdown">
                    <button
                        className="header-btn header-lang-btn"
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        title={t.language}
                    >
                        <span className="lang-flag-only">{LANGUAGES[language].flag}</span>
                    </button>

                    {showLangMenu && (
                        <div className="header-lang-menu">
                            {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, lang]) => (
                                <button
                                    key={code}
                                    className={`lang-option ${language === code ? 'active' : ''}`}
                                    onClick={() => { setLanguage(code); setShowLangMenu(false); }}
                                >
                                    <span className="lang-flag">{lang.flag}</span>
                                    <span>{lang.nativeName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Button */}
                <button
                    className="header-btn header-shortcuts-btn"
                    onClick={() => setShowShortcuts(true)}
                    title={t.keyboardShortcuts || 'Keyboard Shortcuts'}
                >
                    <Keyboard size={18} />
                </button>

                {/* Help Button */}
                <button
                    className="header-btn header-help-btn"
                    onClick={onShowHelp}
                    title={t.help}
                >
                    <HelpCircle size={18} />
                </button>

                {/* About Button */}
                <button
                    className="header-btn header-about-btn"
                    onClick={onShowAbout}
                    title={t.about}
                >
                    <Info size={18} />
                </button>

                {/* Theme Selector Dropdown */}
                <div className="header-theme-dropdown">
                    <button
                        className="header-btn header-theme-btn"
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        title={t.darkMode?.replace(' mode', '') || 'Theme'}
                    >
                        <Palette size={18} />
                    </button>

                    {showThemeMenu && <ThemeMenu />}
                </div>
            </div>

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
            )}
        </header>
    );
}

export default Header;

