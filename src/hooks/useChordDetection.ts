/**
 * Hook para detección de acordes a partir de notas MIDI
 * Detecta acordes mayores, menores, séptimas, etc.
 */
import { useMemo } from 'react';
import type { MidiNote } from '../types/midi';

// Chord templates - intervals from root
const CHORD_TEMPLATES: Record<string, number[]> = {
    // Triads
    'maj': [0, 4, 7],        // Major
    'min': [0, 3, 7],        // Minor
    'dim': [0, 3, 6],        // Diminished
    'aug': [0, 4, 8],        // Augmented
    'sus2': [0, 2, 7],       // Suspended 2nd
    'sus4': [0, 5, 7],       // Suspended 4th
    // Sevenths
    '7': [0, 4, 7, 10],      // Dominant 7th
    'maj7': [0, 4, 7, 11],   // Major 7th
    'min7': [0, 3, 7, 10],   // Minor 7th
    'dim7': [0, 3, 6, 9],    // Diminished 7th
    'm7b5': [0, 3, 6, 10],   // Half-diminished 7th
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface DetectedChord {
    name: string;           // e.g., "Cmaj7", "Am", "G"
    root: string;          // e.g., "C", "A", "G"
    type: string;          // e.g., "maj", "min", "7"
    notes: number[];       // MIDI note numbers
    time: number;          // Start time in seconds
    duration: number;      // Duration in seconds
    confidence: number;    // 0-1, how well it matches
}

interface UseChordDetectionOptions {
    notes: MidiNote[];
    chordTimeThreshold?: number;  // Max time gap between notes to be same chord (seconds)
    minNotes?: number;            // Minimum notes to form a chord
}

/**
 * Normalize notes to first octave (0-11)
 */
function normalizeToClass(midiNotes: number[]): number[] {
    return [...new Set(midiNotes.map(n => n % 12))].sort((a, b) => a - b);
}

/**
 * Try to match notes against chord templates
 */
function matchChord(midiNotes: number[]): { root: string; type: string; confidence: number } | null {
    if (midiNotes.length < 2) return null;

    const pitchClasses = normalizeToClass(midiNotes);

    if (pitchClasses.length < 2) return null;

    let bestMatch: { root: string; type: string; confidence: number } | null = null;

    // Try each pitch class as potential root
    for (const potentialRoot of pitchClasses) {
        // Normalize intervals relative to this root
        const intervals = pitchClasses.map(p => (p - potentialRoot + 12) % 12).sort((a, b) => a - b);

        // Try to match against each chord template
        for (const [chordType, template] of Object.entries(CHORD_TEMPLATES)) {
            // Count how many template notes are present
            const matchCount = template.filter(t => intervals.includes(t)).length;
            const confidence = matchCount / template.length;

            // If we have a good match
            if (confidence >= 0.8 && matchCount >= 3) {
                if (!bestMatch || confidence > bestMatch.confidence) {
                    bestMatch = {
                        root: NOTE_NAMES[potentialRoot],
                        type: chordType,
                        confidence,
                    };
                }
            } else if (confidence >= 0.66 && matchCount >= 2) {
                // Partial match (triads with missing notes)
                if (!bestMatch || confidence > bestMatch.confidence) {
                    const simplifiedType = chordType.includes('7') ? chordType : chordType;
                    bestMatch = {
                        root: NOTE_NAMES[potentialRoot],
                        type: simplifiedType,
                        confidence: confidence * 0.9, // Discount partial matches
                    };
                }
            }
        }
    }

    return bestMatch;
}

/**
 * Format chord name for display
 */
function formatChordName(root: string, type: string): string {
    switch (type) {
        case 'maj': return root;
        case 'min': return `${root}m`;
        case 'dim': return `${root}dim`;
        case 'aug': return `${root}+`;
        case 'sus2': return `${root}sus2`;
        case 'sus4': return `${root}sus4`;
        case '7': return `${root}7`;
        case 'maj7': return `${root}maj7`;
        case 'min7': return `${root}m7`;
        case 'dim7': return `${root}dim7`;
        case 'm7b5': return `${root}m7b5`;
        default: return `${root}${type}`;
    }
}

export function useChordDetection({
    notes,
    chordTimeThreshold = 0.1,
    minNotes = 2,
}: UseChordDetectionOptions) {

    const detectedChords = useMemo(() => {
        if (notes.length === 0) return [];

        const chords: DetectedChord[] = [];
        const sortedNotes = [...notes].sort((a, b) => a.time - b.time);

        let currentGroup: MidiNote[] = [];
        let groupStartTime = 0;

        for (let i = 0; i < sortedNotes.length; i++) {
            const note = sortedNotes[i];

            // Start new group or add to existing
            if (currentGroup.length === 0) {
                currentGroup = [note];
                groupStartTime = note.time;
            } else {
                // Check if note is within threshold of group
                const lastNoteTime = Math.max(...currentGroup.map(n => n.time));

                if (note.time - lastNoteTime <= chordTimeThreshold) {
                    currentGroup.push(note);
                } else {
                    // Process current group and start new one
                    if (currentGroup.length >= minNotes) {
                        const midiNotes = currentGroup.map(n => n.midi);
                        const match = matchChord(midiNotes);

                        if (match) {
                            const groupEndTime = Math.max(...currentGroup.map(n => n.time + n.duration));
                            chords.push({
                                name: formatChordName(match.root, match.type),
                                root: match.root,
                                type: match.type,
                                notes: midiNotes,
                                time: groupStartTime,
                                duration: groupEndTime - groupStartTime,
                                confidence: match.confidence,
                            });
                        }
                    }

                    // Start new group
                    currentGroup = [note];
                    groupStartTime = note.time;
                }
            }
        }

        // Process final group
        if (currentGroup.length >= minNotes) {
            const midiNotes = currentGroup.map(n => n.midi);
            const match = matchChord(midiNotes);

            if (match) {
                const groupEndTime = Math.max(...currentGroup.map(n => n.time + n.duration));
                chords.push({
                    name: formatChordName(match.root, match.type),
                    root: match.root,
                    type: match.type,
                    notes: midiNotes,
                    time: groupStartTime,
                    duration: groupEndTime - groupStartTime,
                    confidence: match.confidence,
                });
            }
        }

        // Remove duplicate consecutive chords
        const uniqueChords: DetectedChord[] = [];
        for (const chord of chords) {
            const last = uniqueChords[uniqueChords.length - 1];
            if (!last || last.name !== chord.name || chord.time - (last.time + last.duration) > 0.5) {
                uniqueChords.push(chord);
            }
        }

        return uniqueChords;
    }, [notes, chordTimeThreshold, minNotes]);

    // Get current chord based on time
    const getCurrentChord = (currentTime: number): DetectedChord | null => {
        for (const chord of detectedChords) {
            if (currentTime >= chord.time && currentTime <= chord.time + chord.duration + 0.3) {
                return chord;
            }
        }
        return null;
    };

    return {
        detectedChords,
        getCurrentChord,
        chordCount: detectedChords.length,
    };
}

export default useChordDetection;
