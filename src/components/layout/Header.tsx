/**
 * Header Component - Barra de título superior
 * 
 * Estados:
 * - Sin MIDI: Solo icono de música + nombre del programa
 * - Con MIDI: Controles completos (instrumentos, exportar, tema, etc.)
 */
import { useState } from 'react';
import {
    Music,
    ArrowLeft,
    Sun,
    Moon,
    Download,
    Wand2,
    Repeat,
    ChevronDown,
    Info,
    FileDown,
    ListMusic,
    Printer,
    HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../shared/context/ThemeContext';
import { useI18n, LANGUAGES, type Language } from '../../shared/context/I18nContext';

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
    onShowInfo,
    onShowAbout,
    onShowHelp,
}: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useI18n();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Handler for back button with confirmation
    const handleBackClick = () => {
        if (window.confirm(t.confirmClose || '¿Salir y cerrar el archivo MIDI actual?')) {
            onClose();
        }
    };

    return (
        <header className="app-header">
            {/* Left Section */}
            <div className="header-left">
                {/* Back button - only visible when MIDI is loaded */}
                {hasMidi && (
                    <button
                        className="header-btn header-back-btn"
                        onClick={handleBackClick}
                        title="Back / Volver"
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
                            title="Información del MIDI"
                        >
                            <Info size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Section (solo si hay MIDI cargado) */}
            {hasMidi && (
                <div className="header-right">
                    {/* Toggle Toolbar (Transpose + Loop) */}
                    <button
                        className={`header-btn header-toggle-btn ${showToolbar ? 'active' : ''}`}
                        onClick={onToggleToolbar}
                        title="Mostrar/Ocultar Barra de Herramientas"
                    >
                        <Wand2 size={16} />
                        <Repeat size={14} />
                    </button>

                    {/* Divider */}
                    <div className="header-divider" />

                    {/* Export Dropdown */}
                    <div className="header-export-dropdown">
                        <button
                            className="header-btn header-export-btn"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            title="Exportar"
                        >
                            <FileDown size={16} />
                            <span>Exportar</span>
                            <ChevronDown size={14} />
                        </button>

                        {showExportMenu && (
                            <div className="header-export-menu">
                                <div className="export-menu-title">Exportar como...</div>
                                <button onClick={() => { onExportTxt(); setShowExportMenu(false); }}>
                                    <ListMusic size={14} /> Cifrado (Notas)
                                </button>
                                <button onClick={() => { onExportTab(); setShowExportMenu(false); }}>
                                    <Download size={14} /> Tablatura (.tab)
                                </button>
                                <div className="export-menu-divider" />
                                <button onClick={() => { onExportPdf(); setShowExportMenu(false); }}>
                                    <Printer size={14} /> Imprimir / PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="header-divider" />

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

                    {/* Theme Toggle */}
                    <button
                        className="header-btn header-theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? t.lightMode : t.darkMode}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            )}

            {/* Solo tema si no hay MIDI */}
            {!hasMidi && (
                <div className="header-right">
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

                    {/* Theme Toggle */}
                    <button
                        className="header-btn header-theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? t.lightMode : t.darkMode}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            )}

            <style>{`
                .header-info-btn {
                    padding: 4px;
                    margin-left: 8px;
                }
                
                .header-export-dropdown {
                    position: relative;
                }
                
                .header-export-btn {
                    padding: 6px 12px;
                }
                
                .header-export-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 4px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    z-index: 100;
                    min-width: 150px;
                    overflow: hidden;
                }
                
                .header-export-menu button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-primary);
                    font-size: 13px;
                    cursor: pointer;
                    text-align: left;
                }
                
                .header-export-menu button:hover {
                    background: var(--color-bg-hover);
                }

                .export-menu-title {
                    padding: 8px 14px 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-text-muted);
                    font-weight: 600;
                }

                .export-menu-divider {
                    height: 1px;
                    background: var(--color-border);
                    margin: 4px 0;
                }

                .header-metronome-btn {
                    position: relative;
                    padding: 6px 10px !important;
                }

                .header-metronome-btn.active {
                    background: var(--color-accent-primary) !important;
                    color: white !important;
                }

                .metronome-pulse {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 0.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.3); }
                }

                .header-lang-dropdown {
                    position: relative;
                }

                .header-lang-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .lang-flag {
                    font-size: 16px;
                }

                .lang-flag-only {
                    font-size: 20px;
                    line-height: 1;
                }

                .header-lang-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 4px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    box-shadow: var(--shadow-lg);
                    z-index: 100;
                    min-width: 160px;
                    overflow: hidden;
                }

                .lang-option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-primary);
                    font-size: 13px;
                    cursor: pointer;
                    text-align: left;
                }

                .lang-option:hover {
                    background: var(--color-bg-hover);
                }

                .lang-option.active {
                    background: rgba(99, 102, 241, 0.15);
                    color: var(--color-accent-primary);
                }
            `}</style>
        </header>
    );
}

export default Header;

