/**
 * Custom hook for Piano Roll canvas rendering
 * Handles all draw logic, note range calculation, and dimensions
 */
import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { MidiNote } from '../types/midi';

// Constants
const NOTE_HEIGHT = 6;
const PIXELS_PER_SECOND = 80;
const PLAYHEAD_COLOR = '#6366f1';
const LEFT_MARGIN = 30;

interface UsePianoRollCanvasOptions {
    notes: MidiNote[];
    currentTime: number;
    duration: number;
    loopStart: number | null;
    loopEnd: number | null;
    transpose?: number;
}

interface PianoRollCanvasResult {
    noteRange: { min: number; max: number };
    height: number;
    width: number;
    draw: (canvas: HTMLCanvasElement | null) => void;
    pixelsPerSecond: number;
    leftMargin: number;
    timeToX: (time: number) => number;
    xToTime: (x: number, scrollLeft: number) => number;
}

export function usePianoRollCanvas({
    notes,
    currentTime,
    duration,
    loopStart,
    loopEnd,
    transpose = 0,
}: UsePianoRollCanvasOptions): PianoRollCanvasResult {
    // Calculate note range (with transpose applied)
    const noteRange = useMemo(() => {
        if (notes.length === 0) return { min: 48, max: 84 };
        const transposedMidiNotes = notes.map((n) => n.midi + transpose);
        return {
            min: Math.min(...transposedMidiNotes) - 2,
            max: Math.max(...transposedMidiNotes) + 2,
        };
    }, [notes, transpose]);

    // Calculate dimensions
    const height = (noteRange.max - noteRange.min + 1) * NOTE_HEIGHT + 30;
    const width = Math.max(800, duration * PIXELS_PER_SECOND + 100);

    // Use ref to ensure draw always has fresh notes
    const notesRef = useRef(notes);
    const transposeRef = useRef(transpose);
    const noteRangeRef = useRef(noteRange);

    useEffect(() => {
        notesRef.current = notes;
        transposeRef.current = transpose;
        noteRangeRef.current = noteRange;
    }, [notes, transpose, noteRange]);

    // Convert time to X position
    const timeToX = useCallback(
        (time: number) => time * PIXELS_PER_SECOND + LEFT_MARGIN,
        []
    );

    // Convert X position to time
    const xToTime = useCallback(
        (x: number, scrollLeft: number) => {
            const adjustedX = x + scrollLeft - LEFT_MARGIN;
            return Math.max(0, Math.min(duration, adjustedX / PIXELS_PER_SECOND));
        },
        [duration]
    );

    // Main draw function
    const draw = useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, width, height);

            // Draw note grid
            for (let midi = noteRange.min; midi <= noteRange.max; midi++) {
                const y = (noteRange.max - midi) * NOTE_HEIGHT + 15;
                const isBlackKey = [1, 3, 6, 8, 10].includes(midi % 12);

                ctx.fillStyle = isBlackKey ? '#15151f' : '#1a1a25';
                ctx.fillRect(0, y, width, NOTE_HEIGHT);

                // C note labels
                if (midi % 12 === 0) {
                    ctx.fillStyle = '#b0b0c0';
                    ctx.font = '9px Inter, sans-serif';
                    ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 2, y + NOTE_HEIGHT - 1);
                }
            }

            // Draw time markers
            for (let t = 0; t <= duration; t += 2) {
                const x = t * PIXELS_PER_SECOND + LEFT_MARGIN;
                ctx.strokeStyle = '#2a2a3a';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();

                // Time label
                ctx.fillStyle = '#a0a0b0';
                ctx.font = '9px Inter, sans-serif';
                ctx.fillText(`${t}s`, x + 2, 10);
            }

            // Draw loop region
            if (loopStart !== null && loopEnd !== null) {
                const loopX1 = loopStart * PIXELS_PER_SECOND + LEFT_MARGIN;
                const loopX2 = loopEnd * PIXELS_PER_SECOND + LEFT_MARGIN;

                ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
                ctx.fillRect(loopX1, 0, loopX2 - loopX1, height);

                // Loop boundary lines
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(loopX1, 0);
                ctx.lineTo(loopX1, height);
                ctx.moveTo(loopX2, 0);
                ctx.lineTo(loopX2, height);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw notes - use ref to ensure fresh data
            const currentNotes = notesRef.current;
            const currentTranspose = transposeRef.current;
            const currentNoteRange = noteRangeRef.current;

            currentNotes.forEach((note) => {
                const transposedMidi = note.midi + currentTranspose;
                const x = note.time * PIXELS_PER_SECOND + LEFT_MARGIN;
                const y = (currentNoteRange.max - transposedMidi) * NOTE_HEIGHT + 15;
                // Ensure minimum visible note width (at least 6 pixels)
                const noteWidth = Math.max(6, note.duration * PIXELS_PER_SECOND);

                const isActive =
                    currentTime >= note.time && currentTime <= note.time + note.duration;
                const hue = (transposedMidi * 7) % 360;

                // Clear shadow before drawing
                ctx.shadowBlur = 0;

                // Glow effect for active note
                if (isActive) {
                    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
                    ctx.shadowBlur = 12;
                }

                // Use brighter colors for better visibility
                ctx.fillStyle = isActive
                    ? `hsl(${hue}, 85%, 65%)`
                    : `hsl(${hue}, 70%, 50%)`;

                ctx.beginPath();
                ctx.roundRect(x, y + 1, noteWidth, NOTE_HEIGHT - 2, 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            });

            // Draw playhead
            const playheadX = currentTime * PIXELS_PER_SECOND + LEFT_MARGIN;
            ctx.strokeStyle = PLAYHEAD_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, height);
            ctx.stroke();

            // Playhead triangle indicator
            ctx.fillStyle = PLAYHEAD_COLOR;
            ctx.beginPath();
            ctx.moveTo(playheadX - 6, 0);
            ctx.lineTo(playheadX + 6, 0);
            ctx.lineTo(playheadX, 10);
            ctx.closePath();
            ctx.fill();
        },
        [notes, currentTime, duration, noteRange, loopStart, loopEnd, width, height, transpose]
    );

    return {
        noteRange,
        height,
        width,
        draw,
        pixelsPerSecond: PIXELS_PER_SECOND,
        leftMargin: LEFT_MARGIN,
        timeToX,
        xToTime,
    };
}
