/**
 * FileExplorer - Explorador de archivos MIDI con buscador
 * Carga la lista de archivos desde /midi-files.json
 */
import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Music2, Folder, Search, RefreshCw } from 'lucide-react';
import type { MidiFile, MidiFolder } from '../types/midi';

interface FileExplorerProps {
  folders?: MidiFolder[];
  selectedFile: MidiFile | null;
  onSelectFile: (file: MidiFile) => void;
}

// Datos de fallback si no hay JSON
const FALLBACK_DATA: MidiFolder[] = [
  {
    name: 'midi',
    path: '/midi',
    files: [],
    subfolders: [],
  },
];

export function FileExplorer({
  folders: propFolders,
  selectedFile,
  onSelectFile,
}: FileExplorerProps) {
  const [folders, setFolders] = useState<MidiFolder[]>(propFolders || FALLBACK_DATA);
  const [loading, setLoading] = useState(!propFolders);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Cargar lista de archivos desde JSON
  useEffect(() => {
    if (propFolders) return;

    loadMidiFiles();
  }, [propFolders]);

  const loadMidiFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/midi-files.json');
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
        // Expandir primera carpeta automáticamente
        if (data.length > 0) {
          setExpandedFolders(new Set([data[0].path]));
        }
      }
    } catch (err) {
      console.error('Error cargando lista de archivos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recopilar todos los archivos para búsqueda
  const allFiles = useMemo(() => {
    const files: MidiFile[] = [];

    const collectFiles = (folder: MidiFolder) => {
      files.push(...folder.files);
      folder.subfolders.forEach(collectFiles);
    };

    folders.forEach(collectFiles);
    return files;
  }, [folders]);

  // Filtrar archivos por búsqueda
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;

    const term = searchTerm.toLowerCase();
    return allFiles
      .filter(
        (file) =>
          file.name.toLowerCase().includes(term) || file.folder?.toLowerCase().includes(term)
      )
      .slice(0, 20); // Limitar resultados
  }, [searchTerm, allFiles]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFolder = (folder: MidiFolder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const hasContent = folder.files.length > 0 || folder.subfolders.length > 0;

    return (
      <div key={folder.path} className="folder-item">
        <div
          className="folder-header"
          onClick={() => toggleFolder(folder.path)}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <span className="folder-icon">
            {hasContent ? (
              isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : null}
          </span>
          <Folder size={14} />
          <span className="folder-name">{folder.name}</span>
          <span className="folder-count">{folder.files.length}</span>
        </div>

        {isExpanded && (
          <div className="folder-content">
            {folder.subfolders.map((sf) => renderFolder(sf, level + 1))}
            {folder.files.map((file) => (
              <div
                key={file.path}
                className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                onClick={() => onSelectFile(file)}
                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
              >
                <Music2 size={12} />
                <span className="file-name">{file.name}</span>
              </div>
            ))}
            {(folder as any).moreFiles && (
              <div className="more-files" style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}>
                +{(folder as any).moreFiles} archivos más...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer">
      {/* Buscador */}
      <div className="search-box">
        <Search size={14} />
        <input
          type="text"
          placeholder="Buscar MIDI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {!propFolders && (
          <button className="refresh-btn" onClick={loadMidiFiles} title="Recargar lista">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {searchResults ? (
        <div className="search-results">
          <div className="search-header">
            Resultados: {searchResults.length}
            {searchResults.length === 20 && '+'}
          </div>
          {searchResults.length === 0 ? (
            <div className="no-results">No se encontraron archivos</div>
          ) : (
            searchResults.map((file) => (
              <div
                key={file.path}
                className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                onClick={() => {
                  onSelectFile(file);
                  setSearchTerm('');
                }}
              >
                <Music2 size={12} />
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-folder">{file.folder}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Lista de carpetas */
        <div className="folder-list">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            folders.map((folder) => renderFolder(folder))
          )}
        </div>
      )}

      {/* Contador */}
      <div className="file-counter">{allFiles.length} archivos</div>
    </div>
  );
}

// Estilos
const styles = `
.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: 8px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 12px;
  outline: none;
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 4px;
}

.refresh-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.refresh-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-results {
  flex: 1;
  overflow-y: auto;
}

.search-header {
  font-size: 10px;
  color: var(--color-text-muted);
  padding: 4px 8px;
  border-bottom: 1px solid var(--color-border);
}

.no-results {
  padding: 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
}

.folder-list {
  flex: 1;
  overflow-y: auto;
}

.loading {
  padding: 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
}

.folder-item {
  margin-bottom: 2px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.folder-header:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.folder-icon {
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-count {
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  padding: 1px 5px;
  border-radius: 8px;
}

.folder-content {
  margin-left: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.file-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.file-item.selected {
  background: var(--color-accent-primary);
  color: white;
}

.file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.file-folder {
  font-size: 9px;
  color: var(--color-text-muted);
}

.file-item.selected .file-folder {
  color: rgba(255,255,255,0.7);
}

.more-files {
  font-size: 10px;
  color: var(--color-text-muted);
  font-style: italic;
  padding: 4px 8px;
}

.file-counter {
  padding: 6px 8px;
  font-size: 10px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  text-align: center;
}
`;

if (typeof document !== 'undefined') {
  const id = 'file-explorer-styles';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = styles;
    document.head.appendChild(s);
  }
}

// Export para compatibilidad
export const DEMO_FOLDERS: MidiFolder[] = FALLBACK_DATA;

export default FileExplorer;
