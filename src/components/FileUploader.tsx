/**
 * Componente para subir archivos MIDI
 */
import { useState, useCallback } from 'react';
import { Upload, Music } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.mid') || file.name.endsWith('.midi'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`drop-zone ${isDragging ? 'active' : ''}`}
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

      {isLoading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="drop-zone-icon">
            {isDragging ? <Upload size={48} /> : <Music size={48} />}
          </div>
          <div className="drop-zone-text">
            {isDragging
              ? 'Suelta el archivo aquí'
              : 'Arrastra un archivo MIDI o haz clic para seleccionar'
            }
          </div>
          <div className="drop-zone-hint">
            Formatos soportados: .mid, .midi
          </div>
        </>
      )}
    </div>
  );
}

export default FileUploader;
