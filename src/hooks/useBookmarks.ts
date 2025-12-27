/**
 * useBookmarks - Save and manage time bookmarks in songs
 * 
 * @description Allows users to:
 * - Save bookmarks at specific times in a song
 * - Name bookmarks (e.g., "Intro", "Chorus", "Solo")
 * - Jump to saved bookmarks
 * - Persist bookmarks per song
 * 
 * @feature Easy to implement, very useful for practice
 */
import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// ============================================
// Types
// ============================================

export interface Bookmark {
  id: string;
  time: number;
  name: string;
  color?: string;
  createdAt: number;
}

interface BookmarkStore {
  [songId: string]: Bookmark[];
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'song_bookmarks';
const MAX_BOOKMARKS_PER_SONG = 20;

/** Default colors for bookmarks */
const BOOKMARK_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const;

// ============================================
// Hook
// ============================================

export function useBookmarks(songId: string | null) {
  const [store, setStore] = useLocalStorage<BookmarkStore>(STORAGE_KEY, {});
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);

  // Get bookmarks for current song
  const bookmarks = useMemo(() => {
    if (!songId) return [];
    return (store[songId] || []).sort((a, b) => a.time - b.time);
  }, [store, songId]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get next available color
  const getNextColor = useCallback(() => {
    const usedColors = bookmarks.map(b => b.color);
    const available = BOOKMARK_COLORS.find(c => !usedColors.includes(c));
    return available || BOOKMARK_COLORS[bookmarks.length % BOOKMARK_COLORS.length];
  }, [bookmarks]);

  /**
   * Add a new bookmark at the specified time
   */
  const addBookmark = useCallback((
    time: number,
    name?: string
  ): Bookmark | null => {
    if (!songId) return null;
    if (bookmarks.length >= MAX_BOOKMARKS_PER_SONG) return null;

    const newBookmark: Bookmark = {
      id: generateId(),
      time,
      name: name || `Marker ${bookmarks.length + 1}`,
      color: getNextColor(),
      createdAt: Date.now(),
    };

    setStore(prev => ({
      ...prev,
      [songId]: [...(prev[songId] || []), newBookmark],
    }));

    return newBookmark;
  }, [songId, bookmarks, generateId, getNextColor, setStore]);

  /**
   * Remove a bookmark by ID
   */
  const removeBookmark = useCallback((bookmarkId: string) => {
    if (!songId) return;

    setStore(prev => ({
      ...prev,
      [songId]: (prev[songId] || []).filter(b => b.id !== bookmarkId),
    }));

    if (selectedBookmarkId === bookmarkId) {
      setSelectedBookmarkId(null);
    }
  }, [songId, selectedBookmarkId, setStore]);

  /**
   * Update bookmark properties
   */
  const updateBookmark = useCallback((
    bookmarkId: string,
    updates: Partial<Pick<Bookmark, 'name' | 'color' | 'time'>>
  ) => {
    if (!songId) return;

    setStore(prev => ({
      ...prev,
      [songId]: (prev[songId] || []).map(b =>
        b.id === bookmarkId ? { ...b, ...updates } : b
      ),
    }));
  }, [songId, setStore]);

  /**
   * Clear all bookmarks for current song
   */
  const clearBookmarks = useCallback(() => {
    if (!songId) return;

    setStore(prev => {
      const { [songId]: _, ...rest } = prev;
      return rest;
    });

    setSelectedBookmarkId(null);
  }, [songId, setStore]);

  /**
   * Find nearest bookmark to a given time
   */
  const findNearestBookmark = useCallback((
    time: number,
    direction: 'next' | 'prev' | 'nearest' = 'nearest'
  ): Bookmark | null => {
    if (bookmarks.length === 0) return null;

    switch (direction) {
      case 'next':
        return bookmarks.find(b => b.time > time + 0.5) || null;
      case 'prev':
        return [...bookmarks].reverse().find(b => b.time < time - 0.5) || null;
      case 'nearest':
      default:
        return bookmarks.reduce((nearest, b) => {
          const currentDist = Math.abs(b.time - time);
          const nearestDist = nearest ? Math.abs(nearest.time - time) : Infinity;
          return currentDist < nearestDist ? b : nearest;
        }, null as Bookmark | null);
    }
  }, [bookmarks]);

  /**
   * Quick add at current time with auto-generated name
   */
  const quickAddBookmark = useCallback((time: number): Bookmark | null => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return addBookmark(time, `${timeStr}`);
  }, [addBookmark]);

  return {
    // State
    bookmarks,
    selectedBookmarkId,
    hasBookmarks: bookmarks.length > 0,
    canAddMore: bookmarks.length < MAX_BOOKMARKS_PER_SONG,

    // Actions
    addBookmark,
    removeBookmark,
    updateBookmark,
    clearBookmarks,
    quickAddBookmark,
    setSelectedBookmarkId,

    // Helpers
    findNearestBookmark,

    // Constants
    BOOKMARK_COLORS,
    MAX_BOOKMARKS_PER_SONG,
  };
}

export default useBookmarks;
