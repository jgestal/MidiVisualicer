/**
 * OSMD Notation View - Sheet music display using OpenSheetMusicDisplay
 * 
 * Features:
 * - Converts MIDI notes to MusicXML and renders with OSMD
 * - Cursor follows playback with auto-scroll
 * - Current note highlighting with color
 */
import { useRef, useEffect, useMemo, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { OpenSheetMusicDisplay as OSMD, CursorType } from 'opensheetmusicdisplay';
import type { MidiNote } from '../types/midi';
import { midiNotesToMusicXML } from '../utils/midiToMusicXML';
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

// Build a time map from notes for cursor synchronization
function buildNoteTimeMap(notes: MidiNote[]): number[] {
  const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
  const timestamps: number[] = [];

  sortedNotes.forEach(note => {
    // Only add unique timestamps (group chords)
    if (timestamps.length === 0 || Math.abs(timestamps[timestamps.length - 1] - note.time) > 0.05) {
      timestamps.push(note.time);
    }
  });

  return timestamps;
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

  // Generate MusicXML from notes
  const musicXML = useMemo(() => {
    if (notes.length === 0) return null;

    try {
      // Build time map for cursor synchronization
      noteTimestampsRef.current = buildNoteTimeMap(notes);

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

  // Initialize OSMD
  useEffect(() => {
    if (!containerRef.current) return;

    // Create OSMD instance with enhanced cursor options
    const osmd = new OSMD(containerRef.current, {
      autoResize: true,
      backend: 'svg',
      drawTitle: true,
      drawSubtitle: false,
      drawComposer: false,
      drawCredits: false,
      drawPartNames: false,
      drawPartAbbreviations: false,
      drawMeasureNumbers: true,
      drawTimeSignatures: true,
      drawingParameters: 'default',
      followCursor: true,
      cursorsOptions: [{
        type: CursorType.Standard,
        color: '#ef4444', // Bright red for better visibility
        alpha: 0.7,
        follow: true,
      }],
    });

    osmdRef.current = osmd;

    return () => {
      if (osmdRef.current?.cursor) {
        osmdRef.current.cursor.hide();
      }
      osmdRef.current = null;
    };
  }, []);

  // Load and render MusicXML
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !musicXML) {
      setIsRendered(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    lastCursorIndexRef.current = -1;

    osmd.load(musicXML)
      .then(() => {
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
        console.error('OSMD load error:', err);
        setError(`Error al cargar la partitura: ${err.message}`);
        setIsLoading(false);
        setIsRendered(false);
      });
  }, [musicXML]);

  // Synchronize cursor with playback time and highlight notes
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !isRendered || !osmd.cursor) return;

    const timestamps = noteTimestampsRef.current;
    if (timestamps.length === 0) return;

    // Find the current note index based on time
    let targetIndex = 0;
    for (let i = 0; i < timestamps.length; i++) {
      if (currentTime >= timestamps[i] - 0.05) {
        targetIndex = i;
      } else {
        break;
      }
    }

    // Only update cursor if position changed
    if (targetIndex !== lastCursorIndexRef.current) {
      // Reset and advance cursor to target position
      osmd.cursor.reset();
      for (let i = 0; i < targetIndex && !osmd.cursor.Iterator.EndReached; i++) {
        osmd.cursor.next();
      }

      lastCursorIndexRef.current = targetIndex;

      // Auto-scroll to cursor
      if (scrollContainerRef.current && osmd.cursor.cursorElement) {
        const cursorRect = osmd.cursor.cursorElement.getBoundingClientRect();
        const containerRect = scrollContainerRef.current.getBoundingClientRect();

        // Check if cursor is outside visible area
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;

        if (cursorCenterY < containerRect.top + 50 || cursorCenterY > containerRect.bottom - 50) {
          // Smooth scroll to center cursor
          const scrollOffset = cursorCenterY - containerCenterY;
          scrollContainerRef.current.scrollBy({
            top: scrollOffset,
            behavior: isPlaying ? 'auto' : 'smooth',
          });
        }
      }
    }
  }, [currentTime, isRendered, isPlaying]);

  // Reset cursor when playback stops
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

    // Get click position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top + (scrollContainerRef.current?.scrollTop || 0);

    // Estimate time based on vertical position (rough approximation)
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
