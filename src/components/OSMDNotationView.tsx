/**
 * OSMD Notation View - Sheet music display using OpenSheetMusicDisplay
 * 
 * Features:
 * - Converts MIDI notes to MusicXML and renders with OSMD
 * - Optimized cursor follows playback with auto-scroll
 * - Export capability via ref
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Cursor updates only when note index changes (not every frame)
 * - Uses cursor.next() incrementally instead of reset + loop
 * - Throttled scroll updates
 * - Memoized MusicXML generation
 */
import { useRef, useEffect, useMemo, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { OpenSheetMusicDisplay as OSMD, CursorType } from 'opensheetmusicdisplay';
import type { MidiNote } from '../types/midi';
import { midiNotesToMusicXML } from '../utils/midiToMusicXML';
import { buildNoteTimestamps, findLastIndexBeforeTime } from '../utils/timeUtils';
import { CHORD_TIME_TOLERANCE } from '../shared/constants/tablature';
import { CURSOR_COLOR, SCROLL_THROTTLE_MS } from '../shared/constants/notation';
import './OSMDNotationView.css';

interface OSMDNotationViewProps {
  notes: MidiNote[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  bpm: number;
  trackName?: string;
  onSeek?: (time: number) => void;
}

// Expose export function via ref
export interface OSMDNotationViewRef {
  exportToSVG: () => void;
}

export const OSMDNotationView = forwardRef<OSMDNotationViewRef, OSMDNotationViewProps>(({
  notes,
  currentTime,
  isPlaying,
  duration,
  bpm,
  trackName = 'Track',
  onSeek,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMD | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const lastCursorIndexRef = useRef<number>(-1);
  const noteTimestampsRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef<number>(0);

  // Generate MusicXML from notes - memoized for performance
  const musicXML = useMemo(() => {
    if (notes.length === 0) return null;

    try {
      // Build time map for cursor synchronization
      noteTimestampsRef.current = buildNoteTimestamps(notes, CHORD_TIME_TOLERANCE);

      return midiNotesToMusicXML(notes, {
        title: trackName,
        tempo: bpm,
        timeSignature: { beats: 4, beatType: 4 },
      });
    } catch (err) {
      console.error('Error generating MusicXML:', err);
      return null;
    }
  }, [notes, trackName, bpm]);

  // Initialize OSMD and load MusicXML - combined to prevent timing issues with StrictMode
  useEffect(() => {
    if (!containerRef.current || !musicXML) {
      setIsRendered(false);
      return;
    }

    // Clear any existing content BEFORE creating new OSMD instance
    containerRef.current.innerHTML = '';

    // Create OSMD instance with performance-optimized settings
    const osmd = new OSMD(containerRef.current, {
      autoResize: false,
      backend: 'svg',
      drawTitle: true,
      drawSubtitle: false,
      drawComposer: false,
      drawCredits: false,
      drawPartNames: false,
      drawPartAbbreviations: false,
      drawMeasureNumbers: true,
      drawTimeSignatures: true,
      drawingParameters: 'compacttight',
      followCursor: false,
      cursorsOptions: [{
        type: CursorType.ThinLeft,
        color: CURSOR_COLOR,
        alpha: 0.9,
        follow: false,
      }],
    });

    osmdRef.current = osmd;

    // Track if this effect has been cleaned up (for async operations)
    let isCancelled = false;

    setIsLoading(true);
    setError(null);
    lastCursorIndexRef.current = -1;

    osmd.load(musicXML)
      .then(() => {
        if (isCancelled) return; // Don't render if cleanup happened

        osmd.render();

        // Initialize cursor
        if (osmd.cursor) {
          osmd.cursor.show();
          osmd.cursor.reset();
        }

        setIsRendered(true);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (isCancelled) return;
        console.error('OSMD load error:', err);
        setError(`Error al cargar la partitura: ${err.message}`);
        setIsLoading(false);
        setIsRendered(false);
      });

    return () => {
      isCancelled = true;
      // Hide cursor first
      if (osmdRef.current?.cursor) {
        osmdRef.current.cursor.hide();
      }
      // Clear OSMD instance
      try {
        osmdRef.current?.clear();
      } catch {
        // Ignore errors during cleanup
      }
      osmdRef.current = null;
      setIsRendered(false);
      // Clear the container DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [musicXML]);

  // OPTIMIZED: Synchronize cursor with playback - only when note changes
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !isRendered || !osmd.cursor) return;

    const timestamps = noteTimestampsRef.current;
    if (timestamps.length === 0) return;

    // Use binary search for efficient lookup
    const targetIndex = findLastIndexBeforeTime(timestamps, currentTime, CHORD_TIME_TOLERANCE);

    // Only update if position actually changed
    if (targetIndex === lastCursorIndexRef.current) return;

    const previousIndex = lastCursorIndexRef.current;
    lastCursorIndexRef.current = targetIndex;

    // OPTIMIZATION: Use incremental cursor movement when possible
    if (targetIndex < 0) {
      osmd.cursor.reset();
    } else if (previousIndex < 0 || targetIndex < previousIndex) {
      // Need to reset and advance (going backwards or from start)
      osmd.cursor.reset();
      for (let i = 0; i < targetIndex && !osmd.cursor.Iterator.EndReached; i++) {
        osmd.cursor.next();
      }
    } else {
      // Moving forward - just advance
      const steps = targetIndex - previousIndex;
      for (let i = 0; i < steps && !osmd.cursor.Iterator.EndReached; i++) {
        osmd.cursor.next();
      }
    }

    // OPTIMIZED: Throttled auto-scroll
    if (scrollContainerRef.current && osmd.cursor.cursorElement) {
      const now = Date.now();
      if (!isPlaying || (now - lastScrollTimeRef.current > SCROLL_THROTTLE_MS)) {
        lastScrollTimeRef.current = now;

        const cursorRect = osmd.cursor.cursorElement.getBoundingClientRect();
        const containerRect = scrollContainerRef.current.getBoundingClientRect();

        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        // Only scroll if cursor is outside safe zone
        if (cursorCenterY < containerRect.top + 80 || cursorCenterY > containerRect.bottom - 80) {
          const containerCenterY = containerRect.top + containerRect.height / 2;
          const scrollOffset = cursorCenterY - containerCenterY;
          scrollContainerRef.current.scrollBy({
            top: scrollOffset,
            behavior: 'auto', // 'auto' is faster than 'smooth'
          });
        }
      }
    }
  }, [currentTime, isRendered, isPlaying]);

  // Reset cursor when playback stops at beginning
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !isRendered || !osmd.cursor) return;

    if (!isPlaying && currentTime < 0.1) {
      osmd.cursor.reset();
      lastCursorIndexRef.current = -1;
    }
  }, [isPlaying, currentTime, isRendered]);

  // Handle click to seek
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top + (scrollContainerRef.current?.scrollTop || 0);

    const totalHeight = containerRef.current.scrollHeight;
    const progress = clickY / totalHeight;
    const time = progress * duration;

    onSeek(Math.max(0, Math.min(duration, time)));
  }, [onSeek, duration]);

  // Export to SVG function - exposed via ref
  const exportToSVG = useCallback(() => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${trackName || 'partitura'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [trackName]);

  // Expose export function via ref
  useImperativeHandle(ref, () => ({
    exportToSVG,
  }), [exportToSVG]);

  return (
    <div className="osmd-notation-view">
      <div className="osmd-notation-header">
        <span className="osmd-notation-title">🎼 Partitura</span>
        <span className="osmd-notation-info">
          {notes.length} notas • {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')} • {bpm} BPM
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        className="osmd-notation-scroll"
      >
        {notes.length === 0 ? (
          <div className="osmd-notation-empty">
            <span className="osmd-notation-empty-icon">🎵</span>
            <p>Selecciona una pista para ver la partitura</p>
          </div>
        ) : isLoading ? (
          <div className="osmd-notation-loading">
            <div className="osmd-notation-spinner" />
            <p>Cargando partitura...</p>
          </div>
        ) : error ? (
          <div className="osmd-notation-error">
            <span className="osmd-notation-error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="osmd-notation-container"
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  );
});

OSMDNotationView.displayName = 'OSMDNotationView';

export default OSMDNotationView;
