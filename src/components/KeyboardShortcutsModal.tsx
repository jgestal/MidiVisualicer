/**
 * KeyboardShortcutsModal - Modal showing all keyboard shortcuts
 */
import { X, Keyboard } from 'lucide-react';
import { useI18n } from '../shared/context/I18nContext';
import './KeyboardShortcutsModal.css';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

// Keyboard shortcuts data
const SHORTCUTS = [
  {
    category: 'playback', items: [
      { keys: ['Space'], action: 'playPause' },
      { keys: ['R'], action: 'restart' },
      { keys: ['Home'], action: 'goToStart' },
      { keys: ['End'], action: 'goToEnd' },
    ]
  },
  {
    category: 'navigation', items: [
      { keys: ['←'], action: 'seekBack5s' },
      { keys: ['→'], action: 'seekForward5s' },
      { keys: ['Shift', '←'], action: 'seekBack1s' },
      { keys: ['Shift', '→'], action: 'seekForward1s' },
    ]
  },
  {
    category: 'transpose', items: [
      { keys: ['↑'], action: 'transposeUp' },
      { keys: ['↓'], action: 'transposeDown' },
      { keys: ['Shift', '↑'], action: 'transposeUpOctave' },
      { keys: ['Shift', '↓'], action: 'transposeDownOctave' },
    ]
  },
  {
    category: 'speed', items: [
      { keys: ['1'], action: 'speed025' },
      { keys: ['2'], action: 'speed050' },
      { keys: ['3'], action: 'speed075' },
      { keys: ['4'], action: 'speed100' },
    ]
  },
  {
    category: 'tracks', items: [
      { keys: ['M'], action: 'muteTrack' },
    ]
  },
];

// Translations for shortcut actions
const SHORTCUT_LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'Keyboard Shortcuts',
    playback: 'Playback',
    navigation: 'Navigation',
    transpose: 'Transpose',
    speed: 'Speed',
    tracks: 'Tracks',
    playPause: 'Play / Pause',
    restart: 'Restart from beginning',
    goToStart: 'Go to start',
    goToEnd: 'Go to end',
    seekBack5s: 'Seek back 5 seconds',
    seekForward5s: 'Seek forward 5 seconds',
    seekBack1s: 'Seek back 1 second',
    seekForward1s: 'Seek forward 1 second',
    transposeUp: 'Transpose up 1 semitone',
    transposeDown: 'Transpose down 1 semitone',
    transposeUpOctave: 'Transpose up 1 octave',
    transposeDownOctave: 'Transpose down 1 octave',
    speed025: 'Speed 0.25x',
    speed050: 'Speed 0.5x',
    speed075: 'Speed 0.75x',
    speed100: 'Speed 1x (normal)',
    muteTrack: 'Mute/Unmute selected track',
  },
  es: {
    title: 'Atajos de Teclado',
    playback: 'Reproducción',
    navigation: 'Navegación',
    transpose: 'Transposición',
    speed: 'Velocidad',
    tracks: 'Pistas',
    playPause: 'Reproducir / Pausar',
    restart: 'Reiniciar desde el inicio',
    goToStart: 'Ir al inicio',
    goToEnd: 'Ir al final',
    seekBack5s: 'Retroceder 5 segundos',
    seekForward5s: 'Avanzar 5 segundos',
    seekBack1s: 'Retroceder 1 segundo',
    seekForward1s: 'Avanzar 1 segundo',
    transposeUp: 'Subir 1 semitono',
    transposeDown: 'Bajar 1 semitono',
    transposeUpOctave: 'Subir 1 octava',
    transposeDownOctave: 'Bajar 1 octava',
    speed025: 'Velocidad 0.25x',
    speed050: 'Velocidad 0.5x',
    speed075: 'Velocidad 0.75x',
    speed100: 'Velocidad 1x (normal)',
    muteTrack: 'Silenciar/Activar pista seleccionada',
  },
};

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const { language } = useI18n();
  const labels = SHORTCUT_LABELS[language] || SHORTCUT_LABELS.en;

  return (
    <div className="shortcuts-modal-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>
            <Keyboard size={20} />
            {labels.title}
          </h2>
          <button className="shortcuts-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-content">
          {SHORTCUTS.map((section) => (
            <div key={section.category} className="shortcuts-section">
              <h3>{labels[section.category]}</h3>
              <div className="shortcuts-list">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd>{key}</kbd>
                          {keyIdx < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                        </span>
                      ))}
                    </div>
                    <span className="shortcut-action">{labels[shortcut.action]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
