/**
 * Servicio para gestionar la biblioteca de archivos MIDI
 * Utiliza IndexedDB para persistencia local
 */

// Nombre de la base de datos
const DB_NAME = 'midi-visualizer-library';
const DB_VERSION = 1;
const STORE_MIDI = 'midi-files';
const STORE_METADATA = 'metadata';

// Interfaces
export interface StoredMidiFile {
  id: string;
  name: string;
  fileName: string;
  data: ArrayBuffer;
  size: number;
  importedAt: number;
  lastPlayedAt?: number;
  category?: string; // 'imported' | 'bundled' | 'recent'
  tags?: string[];
}

export interface LibraryMetadata {
  totalFiles: number;
  lastUpdated: number;
  categories: string[];
}

// Inicializar la base de datos
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Error opening IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para archivos MIDI
      if (!db.objectStoreNames.contains(STORE_MIDI)) {
        const midiStore = db.createObjectStore(STORE_MIDI, { keyPath: 'id' });
        midiStore.createIndex('name', 'name', { unique: false });
        midiStore.createIndex('category', 'category', { unique: false });
        midiStore.createIndex('importedAt', 'importedAt', { unique: false });
      }

      // Store para metadata
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Servicio de biblioteca MIDI
 */
export const LibraryService = {
  /**
   * Guardar un archivo MIDI en la biblioteca
   */
  async saveMidiFile(file: File): Promise<StoredMidiFile> {
    const db = await openDatabase();
    const arrayBuffer = await file.arrayBuffer();

    const storedFile: StoredMidiFile = {
      id: `midi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name.replace(/\.(mid|midi)$/i, ''),
      fileName: file.name,
      data: arrayBuffer,
      size: file.size,
      importedAt: Date.now(),
      category: 'imported',
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readwrite');
      const store = transaction.objectStore(STORE_MIDI);
      const request = store.add(storedFile);

      request.onsuccess = () => {
        resolve(storedFile);
      };

      request.onerror = () => {
        reject(new Error('Error saving MIDI file'));
      };
    });
  },

  /**
   * Obtener todos los archivos MIDI de la biblioteca
   */
  async getAllMidiFiles(): Promise<StoredMidiFile[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readonly');
      const store = transaction.objectStore(STORE_MIDI);
      const request = store.getAll();

      request.onsuccess = () => {
        // Ordenar por fecha de importación (más recientes primero)
        const files = request.result.sort(
          (a: StoredMidiFile, b: StoredMidiFile) => b.importedAt - a.importedAt
        );
        resolve(files);
      };

      request.onerror = () => {
        reject(new Error('Error getting MIDI files'));
      };
    });
  },

  /**
   * Obtener un archivo MIDI por ID
   */
  async getMidiFileById(id: string): Promise<StoredMidiFile | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readonly');
      const store = transaction.objectStore(STORE_MIDI);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Error getting MIDI file'));
      };
    });
  },

  /**
   * Eliminar un archivo MIDI
   */
  async deleteMidiFile(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readwrite');
      const store = transaction.objectStore(STORE_MIDI);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Error deleting MIDI file'));
      };
    });
  },

  /**
   * Actualizar la fecha de última reproducción
   */
  async updateLastPlayed(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readwrite');
      const store = transaction.objectStore(STORE_MIDI);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const file = getRequest.result;
        if (file) {
          file.lastPlayedAt = Date.now();
          const putRequest = store.put(file);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Error updating file'));
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Error getting file to update'));
      };
    });
  },

  /**
   * Buscar archivos MIDI por nombre
   */
  async searchMidiFiles(query: string): Promise<StoredMidiFile[]> {
    const allFiles = await this.getAllMidiFiles();
    const lowerQuery = query.toLowerCase();

    return allFiles.filter(
      (file) =>
        file.name.toLowerCase().includes(lowerQuery) ||
        file.fileName.toLowerCase().includes(lowerQuery) ||
        file.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Obtener archivos por categoría
   */
  async getMidiFilesByCategory(category: string): Promise<StoredMidiFile[]> {
    const allFiles = await this.getAllMidiFiles();
    return allFiles.filter((file) => file.category === category);
  },

  /**
   * Obtener archivos recientes (últimos 10 reproducidos)
   */
  async getRecentMidiFiles(limit: number = 10): Promise<StoredMidiFile[]> {
    const allFiles = await this.getAllMidiFiles();
    return allFiles
      .filter((file) => file.lastPlayedAt)
      .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
      .slice(0, limit);
  },

  /**
   * Importar múltiples archivos
   */
  async importMultipleFiles(files: File[]): Promise<StoredMidiFile[]> {
    const results: StoredMidiFile[] = [];
    for (const file of files) {
      try {
        const stored = await this.saveMidiFile(file);
        results.push(stored);
      } catch (err) {
        console.error(`Error importing ${file.name}:`, err);
      }
    }
    return results;
  },

  /**
   * Obtener estadísticas de la biblioteca
   */
  async getLibraryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    categories: Record<string, number>;
  }> {
    const allFiles = await this.getAllMidiFiles();

    const categories: Record<string, number> = {};
    let totalSize = 0;

    for (const file of allFiles) {
      totalSize += file.size;
      const cat = file.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return {
      totalFiles: allFiles.length,
      totalSize,
      categories,
    };
  },

  /**
   * Limpiar toda la biblioteca
   */
  async clearLibrary(): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MIDI], 'readwrite');
      const store = transaction.objectStore(STORE_MIDI);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Error clearing library'));
      };
    });
  },

  /**
   * Verificar si un archivo ya existe (por nombre)
   */
  async fileExists(fileName: string): Promise<boolean> {
    const allFiles = await this.getAllMidiFiles();
    return allFiles.some((file) => file.fileName === fileName);
  },
};

export default LibraryService;
