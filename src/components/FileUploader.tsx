import { useState, useCallback } from 'react';
import { Upload, Music, FileAudio, FolderOpen } from 'lucide-react';
import { useI18n } from '../shared/context/I18nContext';
import './FileUploader.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export function FileUploader({ onFileSelect, isLoading, compact = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useI18n();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
          onFileSelect(file);
        } else {
          console.warn('File rejected: unsupported format', fileName);
          alert('Please select a .mid or .midi file');
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  // Compact mode for sidebar
  if (compact) {
    return (
      <div
        className={`file-uploader-compact ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="midi-file-input-sidebar"
          type="file"
          accept=".mid,.midi"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <button
          className="compact-open-btn"
          onClick={() => document.getElementById('midi-file-input-sidebar')?.click()}
        >
          <FolderOpen size={16} />
          <span>{t.openMidiFile}</span>
        </button>
        <div className={`compact-drop-zone ${isDragging ? 'active' : ''}`}>
          <Upload size={14} />
          <span>{isDragging ? t.dropNow : t.dropHere}</span>
        </div>

        <style>{`
          .file-uploader-compact {
            padding: 8px;
            margin-bottom: 12px;
            border-bottom: 1px solid var(--color-border);
          }
          
          .compact-open-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 10px 12px;
            background: var(--color-accent-primary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 8px;
          }
          
          .compact-open-btn:hover {
            background: var(--color-accent-secondary);
          }
          
          .compact-drop-zone {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px;
            border: 2px dashed var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-muted);
            font-size: 11px;
            transition: all var(--transition-fast);
          }
          
          .compact-drop-zone.active {
            border-color: var(--color-accent-primary);
            background: rgba(var(--color-accent-primary-rgb), 0.1);
            color: var(--color-accent-primary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`file-uploader ${isDragging ? 'dragging' : ''} animate-fadeIn`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('midi-file-input')?.click()}
    >
      <input
        id="midi-file-input"
        type="file"
        accept=".mid,.midi"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <div className="uploader-content">
        <div className="icon-wrapper">
          {isDragging ? <Upload size={40} /> : <Music size={40} />}
        </div>

        <div className="uploader-text">
          {isDragging ? t.dropNow : t.dropHere}
        </div>

        <div className="uploader-hint">
          <FileAudio size={14} style={{ display: 'inline', marginRight: 4 }} />
          {t.supportsMidi}
        </div>
      </div>

      {isLoading && (
        <div className="uploader-loading">
          <div className="spinner" />
          <span className="loading-text">{t.processing}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploader;


