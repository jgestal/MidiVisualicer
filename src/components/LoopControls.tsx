/**
 * Controles de Loop A-B - VERSIÓN COMPACTA
 */
import { useState } from 'react';
import { Repeat, X, Settings } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import { SpeedTrainerModal } from './SpeedTrainerModal';
import './LoopControls.css';

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

export default LoopControls;

