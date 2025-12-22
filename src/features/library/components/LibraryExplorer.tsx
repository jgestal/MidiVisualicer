/**
 * LibraryExplorer - Explorador de biblioteca MIDI mejorado
 * Usa el contexto de biblioteca para mostrar archivos importados y empaquetados
 */
import { useState, useCallback } from 'react';
import { Music2, Search, Upload, Trash2, Clock, Package, FolderOpen, X } from 'lucide-react';
import { useLibrary, LibraryItem } from '@/features/library';
import './LibraryExplorer.css';

interface LibraryExplorerProps {
  selectedItem: LibraryItem | null;
  onSelectItem: (item: LibraryItem) => void;
  onLoadMidi: (data: ArrayBuffer, item: LibraryItem) => void;
}

type CategoryFilter = 'all' | 'imported' | 'bundled' | 'recent';

export function LibraryExplorer({ selectedItem, onSelectItem, onLoadMidi }: LibraryExplorerProps) {
  const {
    state,
    filteredItems,
    importFile,
    deleteFile,
    getFileData,
    markAsPlayed,
    searchFiles,
    setCategory,
  } = useLibrary();

  const [isDragging, setIsDragging] = useState(false);

  // Manejar clic en un item
  const handleItemClick = useCallback(
    async (item: LibraryItem) => {
      onSelectItem(item);

      // Obtener datos del archivo
      const data = await getFileData(item);
      if (data) {
        onLoadMidi(data, item);

        // Marcar como reproducido si es importado
        if (item.isStored) {
          await markAsPlayed(item.id);
        }
      }
    },
    [onSelectItem, getFileData, onLoadMidi, markAsPlayed]
  );

  // Manejar eliminación
  const handleDelete = useCallback(
    async (e: React.MouseEvent, item: LibraryItem) => {
      e.stopPropagation();
      if (item.isStored && confirm(`¿Eliminar "${item.name}" de la biblioteca?`)) {
        await deleteFile(item.id);
      }
    },
    [deleteFile]
  );

  // Manejar drop de archivos
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.name.toLowerCase().endsWith('.mid') || file.name.toLowerCase().endsWith('.midi')
      );

      for (const file of files) {
        const imported = await importFile(file);
        if (imported) {
          // Auto-seleccionar el primer archivo importado
          handleItemClick(imported);
          break;
        }
      }
    },
    [importFile, handleItemClick]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manejar input de archivo
  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        const imported = await importFile(file);
        if (imported) {
          handleItemClick(imported);
          break;
        }
      }

      // Limpiar input
      e.target.value = '';
    },
    [importFile, handleItemClick]
  );

  // Categorías
  const categories: { id: CategoryFilter; icon: React.ReactNode; label: string }[] = [
    { id: 'all', icon: <Music2 size={14} />, label: 'Todos' },
    { id: 'recent', icon: <Clock size={14} />, label: 'Recientes' },
    { id: 'imported', icon: <FolderOpen size={14} />, label: 'Importados' },
    { id: 'bundled', icon: <Package size={14} />, label: 'Clásicos' },
  ];

  return (
    <div
      className={`library-explorer ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Barra de búsqueda */}
      <div className="library-search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Buscar..."
          value={state.searchQuery}
          onChange={(e) => searchFiles(e.target.value)}
        />
        {state.searchQuery && (
          <button className="search-clear" onClick={() => searchFiles('')}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Filtro de categorías */}
      <div className="library-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${state.selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
            title={cat.label}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Lista de archivos */}
      <div className="library-list">
        {state.isLoading ? (
          <div className="library-loading">Cargando biblioteca...</div>
        ) : filteredItems.length === 0 ? (
          <div className="library-empty">
            {state.searchQuery ? (
              <>
                <span>No hay resultados para "{state.searchQuery}"</span>
              </>
            ) : (
              <>
                <Upload size={24} />
                <span>Arrastra archivos MIDI aquí</span>
                <span className="library-empty-hint">o usa el botón de importar</span>
              </>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`library-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="library-item-icon">
                {item.category === 'bundled' ? <Package size={16} /> : <Music2 size={16} />}
              </div>
              <div className="library-item-info">
                <span className="library-item-name">{item.name}</span>
                <span className="library-item-meta">
                  {item.category === 'bundled' ? 'Clásico' : 'Importado'}
                  {item.size && ` • ${(item.size / 1024).toFixed(1)} KB`}
                </span>
              </div>
              {item.isStored && (
                <button
                  className="library-item-delete"
                  onClick={(e) => handleDelete(e, item)}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Drop zone overlay */}
      {isDragging && (
        <div className="library-drop-overlay">
          <Upload size={32} />
          <span>Soltar para importar</span>
        </div>
      )}

      {/* Footer con botón de importar */}
      <div className="library-footer">
        <label className="import-btn">
          <Upload size={14} />
          <span>Importar MIDI</span>
          <input
            type="file"
            accept=".mid,.midi"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
        <span className="library-count">
          {filteredItems.length} archivo{filteredItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {state.error && (
        <div className="library-error">
          <span>{state.error}</span>
          <button
            onClick={() => {
              /* Clear error */
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default LibraryExplorer;
