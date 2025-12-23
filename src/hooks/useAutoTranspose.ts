/**
 * Custom hook for auto-transposition logic
 * Calculates optimal transpose value based on instrument range
 */
import { useEffect } from 'react';
import type { MidiNote } from '../types/midi';
import type { InstrumentConfig } from '../config/instruments';

interface UseAutoTransposeOptions {
    notes: MidiNote[];
    instrument: InstrumentConfig | undefined;
    onTransposeChange: (value: number) => void;
    enabled?: boolean;
}

/**
 * Automatically calculates and sets the optimal transpose value
 * to fit the MIDI notes within the instrument's playable range
 */
export function useAutoTranspose({
    notes,
    instrument,
    onTransposeChange,
    enabled = true,
}: UseAutoTransposeOptions): void {
    useEffect(() => {
        if (!enabled || notes.length === 0 || !instrument) return;

        const midiNotes = notes.map(n => n.midi);
        const minNote = Math.min(...midiNotes);
        const maxNote = Math.max(...midiNotes);

        if (!isFinite(minNote)) return;

        // Calculate note center
        const noteCenter = (minNote + maxNote) / 2;

        // Calculate instrument range center
        const instMin = Math.min(...instrument.midiNotes);
        const instMax = Math.max(...instrument.midiNotes) + (instrument.frets || 20);
        const instCenter = (instMin + instMax) / 2;

        // Calculate suggested transpose (round to nearest octave)
        const suggestedTranspose = Math.round((instCenter - noteCenter) / 12) * 12;

        onTransposeChange(suggestedTranspose);
    }, [notes, instrument, onTransposeChange, enabled]);
}
