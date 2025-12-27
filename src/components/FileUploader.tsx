import { useState, useCallback } from 'react';
import { Upload, Music, FileAudio, FolderOpen, Clock, X, Trash2 } from 'lucide-react';
import { useI18n } from '../shared/context/I18nContext';
import { useRecentFiles, RecentFile } from '../hooks/useRecentFiles';
import './FileUploader.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export function FileUploader({ onFileSelect, isLoading, compact = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useI18n();
  const { recentFiles, removeRecentFile, clearRecentFiles, addRecentFile } = useRecentFiles();

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
          // Add to recent files
          addRecentFile({
            name: file.name.replace(/\.(mid|midi)$/i, ''),
            fileName: file.name,
            size: file.size,
          });
          onFileSelect(file);
        } else {
          console.warn('File rejected: unsupported format', fileName);
          alert('Please select a .mid or .midi file');
        }
      }
    },
    [onFileSelect, addRecentFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Add to recent files
        addRecentFile({
          name: file.name.replace(/\.(mid|midi)$/i, ''),
          fileName: file.name,
          size: file.size,
        });
        onFileSelect(file);
      }
    },
    [onFileSelect, addRecentFile]
  );

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

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

      </div>
    );
  }

  return (
    <div className="file-uploader-wrapper">
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
            {isDragging ? <Upload size={48} /> : <Music size={48} />}
          </div>

          <div className="uploader-text">
            {isDragging ? t.dropNow : t.dropHere}
          </div>

          <div className="uploader-hint">
            <FileAudio size={16} />
            <span>{t.supportsMidi}</span>
          </div>
        </div>

        {isLoading && (
          <div className="uploader-loading">
            <div className="spinner" />
            <span className="loading-text">{t.processing}</span>
          </div>
        )}
      </div>

      {/* Recent Files Section */}
      {recentFiles.length > 0 && (
        <div className="recent-files-section">
          <div className="recent-files-header">
            <Clock size={14} />
            <span>{t.recentFiles}</span>
            <button
              className="recent-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                clearRecentFiles();
              }}
              title={t.clearRecent}
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="recent-files-list">
            {recentFiles.slice(0, 5).map((file: RecentFile) => (
              <div key={file.id} className="recent-file-item">
                <Music size={14} className="recent-file-icon" />
                <span className="recent-file-name" title={file.fileName}>
                  {file.name}
                </span>
                <span className="recent-file-time">
                  {formatTimeAgo(file.openedAt)}
                </span>
                <button
                  className="recent-file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentFile(file.id);
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
