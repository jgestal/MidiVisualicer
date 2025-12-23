/**
 * MidiInfoModal - Modal con información general del MIDI
 */
import { X, Music, Clock, Layers, Zap, Hash, HardDrive } from 'lucide-react';
import type { ParsedMidi } from '../types/midi';

// Map of instruments to icons (emoji)
const INSTRUMENT_ICONS: Record<string, string> = {
  'Piano': '🎹',
  'Bright Piano': '🎹',
  'Electric Grand': '🎹',
  'Honky-tonk': '🎹',
  'Electric Piano 1': '🎹',
  'Electric Piano 2': '🎹',
  'Harpsichord': '🎹',
  'Clavinet': '🎹',
  'Acoustic Guitar (nylon)': '🎸',
  'Acoustic Guitar (steel)': '🎸',
  'Electric Guitar (jazz)': '🎸',
  'Electric Guitar (clean)': '🎸',
  'Electric Guitar (muted)': '🎸',
  'Overdriven Guitar': '🎸',
  'Distortion Guitar': '🎸',
  'Guitar Harmonics': '🎸',
  'Acoustic Bass': '🎸',
  'Electric Bass (finger)': '🎸',
  'Electric Bass (pick)': '🎸',
  'Violin': '🎻',
  'Viola': '🎻',
  'Cello': '🎻',
  'Contrabass': '🎻',
  'Trumpet': '🎺',
  'Trombone': '🎺',
  'Flute': '🎵',
  'Unknown': '🎵',
};

function getInstrumentIcon(instrument: string): string {
  return INSTRUMENT_ICONS[instrument] || '🎵';
}

interface MidiInfoModalProps {
  midi: ParsedMidi;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function MidiInfoModal({ midi, onClose }: MidiInfoModalProps) {
  const totalNotes = midi.tracks.reduce((sum, t) => sum + t.noteCount, 0);
  const tracksWithNotes = midi.tracks.filter(t => t.noteCount > 0).length;

  return (
    <div className="midi-info-overlay" onClick={onClose}>
      <div className="midi-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="midi-info-header">
          <h2 className="midi-info-title">
            <Music size={18} />
            Información del MIDI
          </h2>
          <button className="midi-info-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="midi-info-content">
          <div className="midi-info-grid">
            <div className="midi-info-item">
              <span className="midi-info-label">Nombre</span>
              <span className="midi-info-value">{midi.name || 'Sin nombre'}</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <Clock size={14} /> Duración
              </span>
              <span className="midi-info-value">{formatDuration(midi.duration)}</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <Zap size={14} /> Tempo
              </span>
              <span className="midi-info-value">{midi.bpm.toFixed(1)} BPM</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <Hash size={14} /> Compás
              </span>
              <span className="midi-info-value">
                {midi.timeSignature.numerator}/{midi.timeSignature.denominator}
              </span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <Layers size={14} /> Pistas
              </span>
              <span className="midi-info-value">{tracksWithNotes} con notas / {midi.tracks.length} total</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <Music size={14} /> Total de notas
              </span>
              <span className="midi-info-value">{totalNotes.toLocaleString()}</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">PPQ</span>
              <span className="midi-info-value">{midi.header.ppq}</span>
            </div>

            <div className="midi-info-item">
              <span className="midi-info-label">
                <HardDrive size={14} /> Tamaño
              </span>
              <span className="midi-info-value">{formatFileSize(midi.fileSize)}</span>
            </div>
          </div>

          <h3 className="midi-info-subtitle">Pistas</h3>
          <div className="midi-info-tracks">
            {midi.tracks.filter(t => t.noteCount > 0).map((track, idx) => (
              <div key={idx} className="midi-info-track">
                <span className="track-num">{track.index + 1}</span>
                <span className="track-icon">{getInstrumentIcon(track.instrument)}</span>
                <div className="track-details">
                  <span className="track-name">{track.name || `Pista ${track.index + 1}`}</span>
                  <span className="track-instrument">{track.instrument}</span>
                </div>
                <span className="track-notes">{track.noteCount} notas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .midi-info-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn var(--transition-fast) forwards;
        }

        .midi-info-modal {
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .midi-info-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .midi-info-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .midi-info-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .midi-info-close:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .midi-info-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
        }

        .midi-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .midi-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .midi-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .midi-info-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .midi-info-subtitle {
          font-size: 12px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .midi-info-tracks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .midi-info-track {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 12px;
        }

        .track-num {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-primary);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .track-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .track-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .track-name {
          color: var(--color-text-primary);
          font-weight: 500;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .track-instrument {
          color: var(--color-text-muted);
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .track-notes {
          color: var(--color-text-muted);
          font-size: 10px;
          flex-shrink: 0;
          padding: 2px 6px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div >
  );
}

export default MidiInfoModal;
