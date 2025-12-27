/**
 * useMidiParserWorker - Hook for using the MIDI parser Web Worker
 * 
 * @description Provides async MIDI parsing without blocking the UI:
 * - Automatic worker lifecycle management
 * - Progress tracking with callbacks
 * - Error handling
 * - Parse cancellation support
 */
import { useRef, useCallback, useEffect, useState } from 'react';

// ============================================
// Types (matching worker types)
// ============================================

interface ParsedNote {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
  name: string;
}

interface ParsedTrack {
  name: string;
  notes: ParsedNote[];
  instrument: string;
  channel: number;
}

export interface WorkerParsedMidi {
  name: string;
  tracks: ParsedTrack[];
  duration: number;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
}

interface ParseProgress {
  progress: number;
  stage: string;
}

interface ParseOptions {
  fileName?: string;
  onProgress?: (progress: ParseProgress) => void;
}

// ============================================
// Hook
// ============================================

export function useMidiParserWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, {
    resolve: (data: WorkerParsedMidi) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: ParseProgress) => void;
  }>>(new Map());

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    // Create worker using Vite's built-in worker support
    try {
      workerRef.current = new Worker(
        new URL('../workers/midiParserWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Handle worker messages
      workerRef.current.onmessage = (event) => {
        const message = event.data;
        const pending = pendingRef.current.get(message.id);

        if (!pending) return;

        switch (message.type) {
          case 'SUCCESS':
            pending.resolve(message.data);
            pendingRef.current.delete(message.id);
            setIsLoading(false);
            setProgress(null);
            console.log(`[MIDI Worker] Parsed in ${message.parseTimeMs.toFixed(1)}ms`);
            break;

          case 'ERROR':
            pending.reject(new Error(message.error));
            pendingRef.current.delete(message.id);
            setIsLoading(false);
            setProgress(null);
            setError(message.error);
            break;

          case 'PROGRESS':
            setProgress({ progress: message.progress, stage: message.stage });
            if (pending.onProgress) {
              pending.onProgress({ progress: message.progress, stage: message.stage });
            }
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('[MIDI Worker] Error:', error);
        setError(error.message);
        setIsLoading(false);
      };
    } catch (err) {
      console.warn('[MIDI Worker] Worker creation failed, will use main thread fallback');
    }

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRef.current.clear();
    };
  }, []);

  /**
   * Parse MIDI file using the worker
   * Falls back to main thread if worker is unavailable
   */
  const parse = useCallback(async (
    arrayBuffer: ArrayBuffer,
    options: ParseOptions = {}
  ): Promise<WorkerParsedMidi> => {
    setIsLoading(true);
    setError(null);
    setProgress({ progress: 0, stage: 'Starting...' });

    // Generate unique ID for this parse operation
    const id = `parse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // If worker is available, use it
    if (workerRef.current) {
      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, {
          resolve,
          reject,
          onProgress: options.onProgress,
        });

        workerRef.current!.postMessage({
          type: 'PARSE',
          id,
          data: arrayBuffer,
          fileName: options.fileName,
        });
      });
    }

    // Fallback: Parse on main thread (blocking, but works)
    console.warn('[MIDI Worker] Falling back to main thread parsing');

    try {
      const { Midi } = await import('@tonejs/midi');
      const midi = new Midi(arrayBuffer);

      const result: WorkerParsedMidi = {
        name: options.fileName || midi.name || 'Untitled',
        tracks: midi.tracks.map((track, index) => ({
          name: track.name || `Track ${index + 1}`,
          notes: track.notes.map(note => ({
            midi: note.midi,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            name: note.name,
          })),
          instrument: track.instrument?.name || 'Acoustic Grand Piano',
          channel: track.channel || 0,
        })),
        duration: midi.duration,
        bpm: midi.header.tempos[0]?.bpm || 120,
        timeSignature: {
          numerator: midi.header.timeSignatures[0]?.timeSignature?.[0] || 4,
          denominator: midi.header.timeSignatures[0]?.timeSignature?.[1] || 4,
        },
      };

      setIsLoading(false);
      setProgress(null);
      return result;
    } catch (err) {
      setIsLoading(false);
      setProgress(null);
      const errorMsg = err instanceof Error ? err.message : 'Parse failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  /**
   * Cancel ongoing parse operation
   */
  const cancel = useCallback((id?: string) => {
    if (workerRef.current) {
      if (id) {
        workerRef.current.postMessage({ type: 'CANCEL', id });
        pendingRef.current.delete(id);
      } else {
        // Cancel all
        pendingRef.current.forEach((_, key) => {
          workerRef.current!.postMessage({ type: 'CANCEL', id: key });
        });
        pendingRef.current.clear();
      }
    }
    setIsLoading(false);
    setProgress(null);
  }, []);

  /**
   * Check if worker is available
   */
  const isWorkerAvailable = workerRef.current !== null;

  return {
    parse,
    cancel,
    isLoading,
    progress,
    error,
    isWorkerAvailable,
  };
}

export default useMidiParserWorker;
