/**
 * SpeedTrainerModal - Modal de configuración del Speed Trainer
 * Estilo consistente con otros modales de la app (HelpModal, ConfirmModal)
 */
import { createPortal } from 'react-dom';
import { Rocket, X, Zap, Target } from 'lucide-react';
import './SpeedTrainerModal.css';

interface SpeedTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  speedTrainer: {
    isEnabled: boolean;
    startSpeed: number;
    endSpeed: number;
    increment: number;
  };
  onToggle: () => void;
  onSetIncrement: (increment: number) => void;
}

const INCREMENT_OPTIONS = [
  { value: 0.01, label: '+1%', description: 'Muy gradual' },
  { value: 0.02, label: '+2%', description: 'Gradual' },
  { value: 0.05, label: '+5%', description: 'Recomendado' },
  { value: 0.10, label: '+10%', description: 'Rápido' },
  { value: 0.15, label: '+15%', description: 'Muy rápido' },
];

export function SpeedTrainerModal({
  isOpen,
  onClose,
  speedTrainer,
  onToggle,
  onSetIncrement,
}: SpeedTrainerModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="speed-trainer-modal-overlay" onClick={onClose}>
      <div className="speed-trainer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stm-header">
          <h3>
            <Rocket size={18} className="stm-header-icon" />
            Speed Trainer
          </h3>
          <button className="stm-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="stm-body">
          {/* Toggle Section */}
          <div className="stm-section">
            <div className="stm-toggle-row">
              <div className="stm-toggle-info">
                <Zap size={16} />
                <div>
                  <span className="stm-toggle-label">Activar Speed Trainer</span>
                  <span className="stm-toggle-desc">
                    Aumenta la velocidad cada vez que el loop se repite
                  </span>
                </div>
              </div>
              <button
                className={`stm-toggle-btn ${speedTrainer.isEnabled ? 'active' : ''}`}
                onClick={onToggle}
              >
                {speedTrainer.isEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Increment Selection */}
          <div className="stm-section">
            <div className="stm-section-title">
              <Target size={14} />
              Incremento por loop
            </div>
            <div className="stm-increment-grid">
              {INCREMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`stm-increment-btn ${speedTrainer.increment === opt.value ? 'selected' : ''}`}
                  onClick={() => onSetIncrement(opt.value)}
                >
                  <span className="stm-increment-value">{opt.label}</span>
                  <span className="stm-increment-desc">{opt.description}</span>
                </button>
              ))}
            </div>

            {/* Info Section */}
            <div className="stm-info">
              <div className="stm-info-row">
                <span>Velocidad máxima:</span>
                <span className="stm-info-value">{Math.round(speedTrainer.endSpeed * 100)}%</span>
              </div>
              <div className="stm-info-row">
                <span>Velocidad inicial:</span>
                <span className="stm-info-value">{Math.round(speedTrainer.startSpeed * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stm-footer">
          <button className="stm-done-btn" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SpeedTrainerModal;
