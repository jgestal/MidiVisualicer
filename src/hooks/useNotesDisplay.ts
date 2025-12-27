/**
 * useNotesDisplay - Hook for managing displayed notes with simplification
 * 
 * Single Responsibility: Manages note display logic including:
 * - Selected track notes
 * - Simplification state and strategy
 * - Processed notes for display
 */
import { useState, useMemo, useCallback } from 'react';
import { getAllInstruments } from '../config/instruments';
import { simplifyNotes, type SimplificationStrategy } from '../utils/simplifyNotes';
import type { MidiNote } from '../types/midi';
import type { ParsedMidi } from '../shared/types/midi';

interface UseNotesDisplayOptions {
  parsedMidi: ParsedMidi | null;
  selectedTrack: number;
  instrumentId: string;
}

interface UseNotesDisplayReturn {
  // Notes
  selectedTrackNotes: MidiNote[];
  notesToDisplay: MidiNote[];

  // Simplification
  isSimplified: boolean;
  simplificationStrategy: SimplificationStrategy;
  toggleSimplify: () => void;
  setSimplificationStrategy: (strategy: SimplificationStrategy) => void;

  // Instrument info
  selectedInstrumentName: string;
  selectedInstrument: ReturnType<typeof getAllInstruments>[string] | undefined;
}

export function useNotesDisplay({
  parsedMidi,
  selectedTrack,
  instrumentId,
}: UseNotesDisplayOptions): UseNotesDisplayReturn {
  // Simplification state
  const [isSimplified, setIsSimplified] = useState(false);
  const [simplificationStrategy, setSimplificationStrategy] = useState<SimplificationStrategy>('TOP_NOTE');

  // Selected instrument
  const selectedInstrument = useMemo(
    () => getAllInstruments()[instrumentId],
    [instrumentId]
  );

  // Instrument name
  const selectedInstrumentName = useMemo(
    () => selectedInstrument?.name || 'Instrument',
    [selectedInstrument]
  );

  // Notes from selected track
  const selectedTrackNotes = useMemo(() => {
    if (!parsedMidi || !parsedMidi.tracks[selectedTrack]) return [];
    return parsedMidi.tracks[selectedTrack].notes;
  }, [parsedMidi, selectedTrack]);

  // Processed notes (with simplification if enabled)
  const notesToDisplay = useMemo(() => {
    if (!isSimplified || !selectedInstrument) return selectedTrackNotes;
    return simplifyNotes(selectedTrackNotes, selectedInstrument, simplificationStrategy);
  }, [selectedTrackNotes, isSimplified, selectedInstrument, simplificationStrategy]);

  // Toggle simplification
  const toggleSimplify = useCallback(() => {
    setIsSimplified(prev => !prev);
  }, []);

  return {
    selectedTrackNotes,
    notesToDisplay,
    isSimplified,
    simplificationStrategy,
    toggleSimplify,
    setSimplificationStrategy,
    selectedInstrumentName,
    selectedInstrument,
  };
}
