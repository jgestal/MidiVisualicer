/**
 * Controles de Loop A-B - VERSIÓN COMPACTA
 */
import { useState } from 'react';
import { Repeat, X, Settings } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import { SpeedTrainerModal } from './SpeedTrainerModal';

interface LoopControlsProps {
  loopStart: number | null;
  loopEnd: number | null;
  isLoopEnabled: boolean;
  duration: number;
  onSetLoopStart: (time: number | null) => void;
  onSetLoopEnd: (time: number | null) => void;
  onToggleLoop: () => void;
  onClearLoop: () => void;
  currentTime: number;

  // Speed Trainer
  speedTrainer: {
    isEnabled: boolean;
    startSpeed: number;
    endSpeed: number;
    increment: number;
  };
  onToggleSpeedTrainer: () => void;
  onSetSpeedTrainerIncrement?: (increment: number) => void;
}

export function LoopControls({
  loopStart,
  loopEnd,
  isLoopEnabled,
  onSetLoopStart,
  onSetLoopEnd,
  onToggleLoop,
  onClearLoop,
  currentTime,
  speedTrainer,
  onToggleSpeedTrainer,
  onSetSpeedTrainerIncrement,
}: LoopControlsProps) {
  const hasLoop = loopStart !== null && loopEnd !== null;
  const [showSpeedTrainerModal, setShowSpeedTrainerModal] = useState(false);

  return (
    <div className="loop-compact">
      <div className="loop-label">
        <Repeat size={14} />
        <span>Loop</span>
      </div>

      <div className="loop-points">
        <button
          className={loopStart !== null ? 'active' : ''}
          onClick={() => onSetLoopStart(loopStart !== null ? null : currentTime)}
          title="Establecer punto A"
        >
          A: {loopStart !== null ? formatDuration(loopStart) : '--:--'}
        </button>
        <button
          className={loopEnd !== null ? 'active' : ''}
          onClick={() => onSetLoopEnd(loopEnd !== null ? null : currentTime)}
          title="Establecer punto B"
        >
          B: {loopEnd !== null ? formatDuration(loopEnd) : '--:--'}
        </button>
      </div>

      <button
        className={`loop-toggle ${isLoopEnabled && hasLoop ? 'enabled' : ''}`}
        onClick={onToggleLoop}
        disabled={!hasLoop}
        title="Activar/desactivar loop"
      >
        <Repeat size={14} />
      </button>

      {/* Speed Trainer - styled like Metronome */}
      <div className="speed-trainer-section">
        <button
          className={`metronome-btn ${speedTrainer.isEnabled ? 'active' : ''}`}
          onClick={onToggleSpeedTrainer}
          title={speedTrainer.isEnabled ? 'Desactivar Speed Trainer' : 'Activar Speed Trainer'}
        >
          <span style={{ fontSize: '14px' }}>🚀</span>
          <span>Trainer</span>
          {speedTrainer.isEnabled && <span className="metronome-active-dot" />}
        </button>

        {/* Config button - opens modal */}
        <button
          className="loop-toggle"
          onClick={() => setShowSpeedTrainerModal(true)}
          title="Configurar Speed Trainer"
          style={{ marginLeft: '4px' }}
        >
          <Settings size={14} />
        </button>

        {/* Show current increment when active */}
        {speedTrainer.isEnabled && (
          <span className="transpose-value" style={{ color: '#22c55e', marginLeft: '4px' }}>
            +{Math.round(speedTrainer.increment * 100)}%
          </span>
        )}
      </div>

      <button className="loop-clear" onClick={onClearLoop} disabled={!hasLoop} title="Borrar loop">
        <X size={14} />
      </button>

      {/* Speed Trainer Modal */}
      <SpeedTrainerModal
        isOpen={showSpeedTrainerModal}
        onClose={() => setShowSpeedTrainerModal(false)}
        speedTrainer={speedTrainer}
        onToggle={onToggleSpeedTrainer}
        onSetIncrement={(inc) => onSetSpeedTrainerIncrement?.(inc)}
      />
    </div>
  );
}

const styles = `
.loop-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.loop-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-weight: 500;
  min-width: 70px;
}

.loop-points {
  display: flex;
  gap: 4px;
}

.loop-points button {
  padding: 4px 8px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-family: monospace;
  cursor: pointer;
}

.loop-points button:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-on-hover);
}

.loop-points button.active {
  background: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: transparent;
}

.loop-toggle, .loop-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.loop-toggle:hover, .loop-clear:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-on-hover);
}

.loop-toggle:disabled, .loop-clear:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.loop-toggle.enabled {
  background: var(--color-accent-primary);
  color: var(--color-text-on-accent);
  border-color: transparent;
}

.speed-trainer-section {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.speed-trainer-container {
  position: relative;
}

.speed-trainer-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUpFade 0.15s ease-out;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.speed-trainer-popup-title {
  padding: 4px 12px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.speed-trainer-popup-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.speed-trainer-popup-item:hover {
  background: var(--color-bg-hover);
}

.speed-trainer-popup-item.selected {
  color: var(--color-accent-primary);
  font-weight: 600;
}

.speed-trainer-popup-item.active {
  color: var(--color-success, #4ade80);
}

.speed-trainer-popup-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}
`;

if (typeof document !== 'undefined') {
  const id = 'loop-styles';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = styles;
    document.head.appendChild(s);
  }
}

export default LoopControls;
