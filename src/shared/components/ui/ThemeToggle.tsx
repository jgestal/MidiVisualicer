/**
 * Toggle de tema con animación suave
 * Permite cambiar entre Dark, Light y Auto
 */
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '@/shared/context/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ showLabel = false, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { id: 'light', icon: <Sun size={size === 'sm' ? 14 : 18} />, label: 'Claro' },
    { id: 'dark', icon: <Moon size={size === 'sm' ? 14 : 18} />, label: 'Oscuro' },
    { id: 'auto', icon: <Monitor size={size === 'sm' ? 14 : 18} />, label: 'Sistema' },
  ];

  return (
    <div className={`theme-toggle theme-toggle-${size}`}>
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-toggle-btn ${theme === t.id ? 'active' : ''}`}
          onClick={() => setTheme(t.id)}
          title={t.label}
          aria-label={`Tema ${t.label}`}
        >
          <span className="theme-toggle-icon">{t.icon}</span>
          {showLabel && <span className="theme-toggle-label">{t.label}</span>}
        </button>
      ))}

      {/* Indicador de tema actual */}
      <div
        className="theme-toggle-indicator"
        style={{
          transform: `translateX(${themes.findIndex((t) => t.id === theme) * 100}%)`,
        }}
      />
    </div>
  );
}

/**
 * Botón simple para alternar entre dark/light
 */
export function ThemeQuickToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-quick-toggle"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <span className="theme-quick-toggle-icon">
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}

export default ThemeToggle;
