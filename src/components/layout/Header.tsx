/**
 * Header Component - Barra de título superior
 * 
 * Estados:
 * - Sin MIDI: Solo icono de música + nombre del programa
 * - Con MIDI: Controles completos (instrumentos, exportar, tema, etc.)
 */
import {
    Music,
    Menu,
    Sun,
    Moon,
    Download,
    FileText,
    Music2,
    Wand2,
    Repeat,
    ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../shared/context/ThemeContext';

interface HeaderProps {
    hasMidi: boolean;
    fileName?: string;
    tempo?: number;
    timeSignature?: string;

    // Sidebar izquierdo
    onToggleLeftSidebar: () => void;

    // Instrumento
    selectedInstrumentName: string;
    onOpenInstrumentMenu: () => void;

    // Toggles de barras
    showToolbar: boolean;
    onToggleToolbar: () => void;
    showPianoRoll: boolean;
    onTogglePianoRoll: () => void;

    // Exportar
    onExportCifrado: () => void;
    onExportTablature: () => void;
}

export function Header({
    hasMidi,
    fileName,
    tempo,
    timeSignature,
    onToggleLeftSidebar,
    selectedInstrumentName,
    onOpenInstrumentMenu,
    showToolbar,
    onToggleToolbar,
    showPianoRoll,
    onTogglePianoRoll,
    onExportCifrado,
    onExportTablature,
}: HeaderProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="app-header">
            {/* Left Section */}
            <div className="header-left">
                <button
                    className="header-btn header-menu-btn"
                    onClick={onToggleLeftSidebar}
                    title="Menú Lateral"
                >
                    <Menu size={18} />
                </button>

                <div className="header-brand">
                    <Music size={20} className="header-logo" />
                    <span className="header-title">Midi Tab Pro</span>
                </div>

                {/* Info del archivo (solo si hay MIDI) */}
                {hasMidi && fileName && (
                    <div className="header-file-info">
                        <span className="header-filename">{fileName}</span>
                        {tempo && <span className="header-tempo">{tempo.toFixed(1)} BPM</span>}
                        {timeSignature && <span className="header-time-sig">{timeSignature}</span>}
                    </div>
                )}
            </div>

            {/* Right Section (solo si hay MIDI cargado) */}
            {hasMidi && (
                <div className="header-right">
                    {/* Selector de Instrumento */}
                    <button
                        className="header-btn header-instrument-btn"
                        onClick={onOpenInstrumentMenu}
                        title="Seleccionar Instrumento"
                    >
                        <Music2 size={16} />
                        <span>{selectedInstrumentName}</span>
                        <ChevronDown size={14} />
                    </button>

                    {/* Toggle Toolbar (Transpose + Loop) */}
                    <button
                        className={`header-btn header-toggle-btn ${showToolbar ? 'active' : ''}`}
                        onClick={onToggleToolbar}
                        title="Mostrar/Ocultar Barra de Herramientas"
                    >
                        <Wand2 size={16} />
                        <Repeat size={14} />
                    </button>

                    {/* Toggle Piano Roll */}
                    <button
                        className={`header-btn header-toggle-btn ${showPianoRoll ? 'active' : ''}`}
                        onClick={onTogglePianoRoll}
                        title="Mostrar/Ocultar Piano Roll"
                    >
                        <Music size={16} />
                    </button>

                    {/* Divider */}
                    <div className="header-divider" />

                    {/* Export Buttons */}
                    <button
                        className="header-btn"
                        onClick={onExportCifrado}
                        title="Exportar Cifrado"
                    >
                        <FileText size={16} />
                    </button>
                    <button
                        className="header-btn"
                        onClick={onExportTablature}
                        title="Exportar Tablatura"
                    >
                        <Download size={16} />
                    </button>

                    {/* Divider */}
                    <div className="header-divider" />

                    {/* Theme Toggle */}
                    <button
                        className="header-btn header-theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            )}

            {/* Solo tema si no hay MIDI */}
            {!hasMidi && (
                <div className="header-right">
                    <button
                        className="header-btn header-theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
