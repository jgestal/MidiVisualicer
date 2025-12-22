import { useState, useCallback } from 'react';
import { Upload, Music, FileAudio } from 'lucide-react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

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
          console.warn('Archivo rechazado: formato no soportado', fileName);
          alert('Por favor, selecciona un archivo .mid o .midi');
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
          {isDragging ? '¡Suéltalo!' : 'Arrastra tu archivo MIDI aquí'}
        </div>

        <div className="uploader-hint">
          <FileAudio size={14} style={{ display: 'inline', marginRight: 4 }} />
          Soporta .mid y .midi
        </div>
      </div>

      {isLoading && (
        <div className="uploader-loading">
          <div className="spinner" />
          <span className="loading-text">Procesando partitura...</span>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
