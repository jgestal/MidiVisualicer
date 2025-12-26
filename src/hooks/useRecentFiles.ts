/**
 * Hook para gestionar el historial de archivos MIDI recientes
 * Guarda los últimos 10 archivos en localStorage
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'midi-visualizer-recent-files';
const MAX_RECENT_FILES = 10;

export interface RecentFile {
    id: string;
    name: string;
    fileName: string;
    openedAt: number;
    size?: number;
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
        } catch (error) {
            console.warn('Error loading recent files:', error);
        }
    }, []);

    // Save to localStorage
    const saveToStorage = useCallback((files: RecentFile[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        } catch (error) {
            console.warn('Error saving recent files:', error);
        }
    }, []);

    // Add a file to recent history
    const addRecentFile = useCallback((file: { name: string; fileName: string; size?: number }) => {
        setRecentFiles(prev => {
            // Create new entry
            const newEntry: RecentFile = {
                id: `recent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                fileName: file.fileName,
                openedAt: Date.now(),
                size: file.size,
            };

            // Remove duplicate if exists (same fileName)
            const filtered = prev.filter(f => f.fileName !== file.fileName);

            // Add to front, limit to MAX
            const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_FILES);

            // Save to storage
            saveToStorage(updated);

            return updated;
        });
    }, [saveToStorage]);

    // Remove a file from history
    const removeRecentFile = useCallback((id: string) => {
        setRecentFiles(prev => {
            const updated = prev.filter(f => f.id !== id);
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

export default useRecentFiles;
