/**
 * usePracticeStats - Track practice statistics
 * 
 * @description Tracks and persists practice statistics including:
 * - Total practice time
 * - Songs practiced today
 * - Current session time
 * - Practice streak
 * 
 * @feature Easy to implement, very useful for motivation
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

// ============================================
// Types
// ============================================

interface PracticeStats {
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  todayMinutes: number;
  todaySongs: number;
  sessionMinutes: number;
}

interface StoredStats {
  totalPracticeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  dailyHistory: Record<string, { minutes: number; songs: string[] }>;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'practice_stats';
const UPDATE_INTERVAL_MS = 60000; // Update every minute

// ============================================
// Helpers
// ============================================

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Hook
// ============================================

export function usePracticeStats(isPlaying: boolean, currentSongId?: string) {
  // Persisted stats
  const [storedStats, setStoredStats] = useLocalStorage<StoredStats>(STORAGE_KEY, {
    totalPracticeMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    dailyHistory: {},
  });

  // Session tracking
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const playingTimeRef = useRef<number>(0);

  // Track playing time
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000 / 60; // minutes
      lastUpdateRef.current = now;

      playingTimeRef.current += elapsed;

      // Update session minutes
      setSessionMinutes(Math.floor((now - sessionStartTime) / 1000 / 60));

      // Update stored stats every minute of actual playing
      if (playingTimeRef.current >= 1) {
        const minutesToAdd = Math.floor(playingTimeRef.current);
        playingTimeRef.current -= minutesToAdd;

        setStoredStats(prev => {
          const today = getTodayDate();
          const todayHistory = prev.dailyHistory[today] || { minutes: 0, songs: [] };

          // Update streak
          let newStreak = prev.currentStreak;
          if (prev.lastPracticeDate !== today) {
            if (prev.lastPracticeDate && getDaysBetween(prev.lastPracticeDate, today) === 1) {
              newStreak = prev.currentStreak + 1;
            } else if (!prev.lastPracticeDate || getDaysBetween(prev.lastPracticeDate, today) > 1) {
              newStreak = 1;
            }
          }

          return {
            ...prev,
            totalPracticeMinutes: prev.totalPracticeMinutes + minutesToAdd,
            currentStreak: newStreak,
            longestStreak: Math.max(prev.longestStreak, newStreak),
            lastPracticeDate: today,
            dailyHistory: {
              ...prev.dailyHistory,
              [today]: {
                minutes: todayHistory.minutes + minutesToAdd,
                songs: todayHistory.songs,
              },
            },
          };
        });
      }
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPlaying, sessionStartTime, setStoredStats]);

  // Track songs played
  const recordSongPlayed = useCallback((songId: string) => {
    const today = getTodayDate();

    setStoredStats(prev => {
      const todayHistory = prev.dailyHistory[today] || { minutes: 0, songs: [] };

      if (todayHistory.songs.includes(songId)) {
        return prev; // Already recorded
      }

      return {
        ...prev,
        dailyHistory: {
          ...prev.dailyHistory,
          [today]: {
            ...todayHistory,
            songs: [...todayHistory.songs, songId],
          },
        },
      };
    });
  }, [setStoredStats]);

  // Record current song
  useEffect(() => {
    if (currentSongId && isPlaying) {
      recordSongPlayed(currentSongId);
    }
  }, [currentSongId, isPlaying, recordSongPlayed]);

  // Compute stats
  const today = getTodayDate();
  const todayData = storedStats.dailyHistory[today] || { minutes: 0, songs: [] };

  const stats: PracticeStats = {
    totalPracticeMinutes: storedStats.totalPracticeMinutes,
    currentStreak: storedStats.currentStreak,
    longestStreak: storedStats.longestStreak,
    lastPracticeDate: storedStats.lastPracticeDate,
    todayMinutes: todayData.minutes,
    todaySongs: todayData.songs.length,
    sessionMinutes,
  };

  // Format helpers
  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, []);

  return {
    stats,
    formatTime,
    recordSongPlayed,
  };
}

export default usePracticeStats;
