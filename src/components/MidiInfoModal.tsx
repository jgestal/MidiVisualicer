/**
 * MidiInfoModal - Modal con información general del MIDI
 */
import { X, Music, Clock, Layers, Zap, Hash, HardDrive } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import type { ParsedMidi } from '../types/midi';
import './MidiInfoModal.css';

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

    </div >
  );
}

export default MidiInfoModal;
