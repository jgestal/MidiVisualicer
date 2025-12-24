/**
 * Contexto para la gestión de la biblioteca MIDI
 * Combina archivos importados con archivos empaquetados
 */
import { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { LibraryService, StoredMidiFile } from '../services/LibraryService';

// Archivo de biblioteca
export interface LibraryItem {
  id: string;
  name: string;
  fileName: string;
  category: 'imported' | 'bundled' | 'recent';
  path?: string; // Para archivos bundled
  size?: number;
  importedAt?: number;
  lastPlayedAt?: number;
  isStored?: boolean; // Si está en IndexedDB
}

// Context state
interface LibraryState {
  items: LibraryItem[];
  recentItems: LibraryItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: 'all' | 'imported' | 'bundled' | 'recent';
}

// Actions
type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: LibraryItem[] }
  | { type: 'ADD_ITEM'; payload: LibraryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_RECENT'; payload: LibraryItem[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: 'all' | 'imported' | 'bundled' | 'recent' };

// Initial state
const initialState: LibraryState = {
  items: [],
  recentItems: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
};

// Reducer
function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'SET_RECENT':
      return { ...state, recentItems: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    default:
      return state;
  }
}

// Archivos MIDI empaquetados con la aplicación
const BUNDLED_MIDI_FILES: LibraryItem[] = [
  {
    id: 'bundled-beethoven-fur-elise',
    name: 'Für Elise',
    fileName: 'fur-elise.mid',
    category: 'bundled',
    path: '/midi/classics/fur-elise.mid',
  },
  {
    id: 'bundled-bach-prelude',
    name: 'Prelude in C Major',
    fileName: 'bach-prelude-c.mid',
    category: 'bundled',
    path: '/midi/classics/bach-prelude-c.mid',
  },
  {
    id: 'bundled-mozart-sonata',
    name: 'Sonata K.545',
    fileName: 'mozart-k545.mid',
    category: 'bundled',
    path: '/midi/classics/mozart-k545.mid',
  },
  {
    id: 'bundled-pachelbel-canon',
    name: 'Canon in D',
    fileName: 'canon-in-d.mid',
    category: 'bundled',
    path: '/midi/classics/canon-in-d.mid',
  },
];

// Convertir StoredMidiFile a LibraryItem
function storedToLibraryItem(stored: StoredMidiFile): LibraryItem {
  return {
    id: stored.id,
    name: stored.name,
    fileName: stored.fileName,
    category: 'imported',
    size: stored.size,
    importedAt: stored.importedAt,
    lastPlayedAt: stored.lastPlayedAt,
    isStored: true,
  };
}

// Tipo del contexto
interface LibraryContextType {
  state: LibraryState;
  loadLibrary: () => Promise<void>;
  importFile: (file: File) => Promise<LibraryItem | null>;
  importFiles: (files: File[]) => Promise<LibraryItem[]>;
  deleteFile: (id: string) => Promise<void>;
  getFileData: (item: LibraryItem) => Promise<ArrayBuffer | null>;
  markAsPlayed: (id: string) => Promise<void>;
  searchFiles: (query: string) => void;
  setCategory: (category: 'all' | 'imported' | 'bundled' | 'recent') => void;
  filteredItems: LibraryItem[];
}

// Contexto
const LibraryContext = createContext<LibraryContextType | null>(null);

// Provider
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  // Cargar biblioteca al montar
  const loadLibrary = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Cargar archivos guardados
      const storedFiles = await LibraryService.getAllMidiFiles();
      const importedItems = storedFiles.map(storedToLibraryItem);

      // Combinar con archivos bundled
      const allItems = [...importedItems, ...BUNDLED_MIDI_FILES];

      dispatch({ type: 'SET_ITEMS', payload: allItems });

      // Cargar recientes
      const recentFiles = await LibraryService.getRecentMidiFiles(10);
      const recentItems = recentFiles.map(storedToLibraryItem);
      dispatch({ type: 'SET_RECENT', payload: recentItems });
    } catch (err) {
      console.error('Error loading library:', err);
      // Si falla IndexedDB, al menos mostrar bundled
      dispatch({ type: 'SET_ITEMS', payload: BUNDLED_MIDI_FILES });
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Importar un archivo
  const importFile = useCallback(async (file: File): Promise<LibraryItem | null> => {
    try {
      // Verificar si ya existe
      const exists = await LibraryService.fileExists(file.name);
      if (exists) {
        dispatch({
          type: 'SET_ERROR',
          payload: `El archivo "${file.name}" ya existe en la biblioteca`,
        });
        return null;
      }

      const stored = await LibraryService.saveMidiFile(file);
      const item = storedToLibraryItem(stored);
      dispatch({ type: 'ADD_ITEM', payload: item });
      return item;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al importar archivo';
      dispatch({ type: 'SET_ERROR', payload: message });
      return null;
    }
  }, []);

  // Importar múltiples archivos
  const importFiles = useCallback(
    async (files: File[]): Promise<LibraryItem[]> => {
      const results: LibraryItem[] = [];
      for (const file of files) {
        const item = await importFile(file);
        if (item) results.push(item);
      }
      return results;
    },
    [importFile]
  );

  // Eliminar archivo
  const deleteFile = useCallback(async (id: string) => {
    try {
      await LibraryService.deleteMidiFile(id);
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }, []);

  // Obtener datos del archivo
  const getFileData = useCallback(async (item: LibraryItem): Promise<ArrayBuffer | null> => {
    try {
      if (item.isStored) {
        // Archivo guardado en IndexedDB
        const stored = await LibraryService.getMidiFileById(item.id);
        return stored?.data || null;
      } else if (item.path) {
        // Archivo bundled
        const response = await fetch(item.path);
        if (!response.ok) throw new Error('Failed to fetch bundled file');
        return await response.arrayBuffer();
      }
      return null;
    } catch (err) {
      console.error('Error getting file data:', err);
      return null;
    }
  }, []);

  // Marcar como reproducido
  const markAsPlayed = useCallback(async (id: string) => {
    try {
      await LibraryService.updateLastPlayed(id);
      // Actualizar recientes
      const recentFiles = await LibraryService.getRecentMidiFiles(10);
      const recentItems = recentFiles.map(storedToLibraryItem);
      dispatch({ type: 'SET_RECENT', payload: recentItems });
    } catch (err) {
      console.error('Error marking as played:', err);
    }
  }, []);

  // Buscar archivos
  const searchFiles = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  // Cambiar categoría
  const setCategory = useCallback((category: 'all' | 'imported' | 'bundled' | 'recent') => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  // Items filtrados
  const filteredItems = state.items.filter((item) => {
    // Filtrar por búsqueda
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      if (
        !item.name.toLowerCase().includes(query) &&
        !item.fileName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Filtrar por categoría
    if (state.selectedCategory !== 'all') {
      if (state.selectedCategory === 'recent') {
        return state.recentItems.some((recent) => recent.id === item.id);
      }
      return item.category === state.selectedCategory;
    }

    return true;
  });

  const value: LibraryContextType = {
    state,
    loadLibrary,
    importFile,
    importFiles,
    deleteFile,
    getFileData,
    markAsPlayed,
    searchFiles,
    setCategory,
    filteredItems,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

// Hook para usar el contexto
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}

// Hook para obtener solo los items filtrados
export function useFilteredLibrary() {
  const { filteredItems, state } = useLibrary();
  return {
    items: filteredItems,
    isLoading: state.isLoading,
    error: state.error,
  };
}
