/**
 * Controles de Loop A-B - VERSIÓN COMPACTA
 */
import { Repeat, X } from 'lucide-react';

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
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
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
}: LoopControlsProps) {
  const hasLoop = loopStart !== null && loopEnd !== null;

  return (
    <div className="loop-compact">
      <div className="loop-label">
        <Repeat size={14} />
        <span>Loop A-B</span>
      </div>

      <div className="loop-points">
        <button
          className={loopStart !== null ? 'active' : ''}
          onClick={() => onSetLoopStart(loopStart !== null ? null : currentTime)}
        >
          A: {loopStart !== null ? formatTime(loopStart) : '--:--'}
        </button>
        <button
          className={loopEnd !== null ? 'active' : ''}
          onClick={() => onSetLoopEnd(loopEnd !== null ? null : currentTime)}
        >
          B: {loopEnd !== null ? formatTime(loopEnd) : '--:--'}
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

      <button className="loop-clear" onClick={onClearLoop} disabled={!hasLoop} title="Borrar loop">
        <X size={14} />
      </button>
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
}

.loop-points button.active {
  background: var(--color-accent-primary);
  color: white;
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
  color: var(--color-text-primary);
}

.loop-toggle:disabled, .loop-clear:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.loop-toggle.enabled {
  background: var(--color-accent-primary);
  color: white;
  border-color: transparent;
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
