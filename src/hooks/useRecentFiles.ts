/**
 * Hook for managing recently opened MIDI files
 * Stores file names in localStorage for quick access
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'midi-recent-files';
const MAX_RECENT_FILES = 10;

export interface RecentFile {
  name: string;
  lastOpened: number; // timestamp
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentFile[];
        setRecentFiles(parsed);
      }
    } catch (e) {
      console.error('Failed to load recent files:', e);
    }
  }, []);

  // Save to localStorage whenever recent files change
  const saveToStorage = useCallback((files: RecentFile[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save recent files:', e);
    }
  }, []);

  // Add a file to recent list
  const addRecentFile = useCallback((fileName: string) => {
    setRecentFiles(prev => {
      // Remove if already exists
      const filtered = prev.filter(f => f.name !== fileName);

      // Add to beginning
      const updated: RecentFile[] = [
        { name: fileName, lastOpened: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT_FILES);

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Remove a file from recent list
  const removeRecentFile = useCallback((fileName: string) => {
    setRecentFiles(prev => {
      const updated = prev.filter(f => f.name !== fileName);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all recent files
  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentFiles,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,
  };
}
