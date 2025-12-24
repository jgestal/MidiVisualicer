/**
 * Hook para cargar y parsear archivos MIDI
 */
import { useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import type { ParsedMidi, MidiTrack, MidiNote } from '../types/midi';
import { getGMInstrumentName } from '../shared/constants/gmInstruments';


export function useMidiLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedMidi, setParsedMidi] = useState<ParsedMidi | null>(null);

  const loadMidiFile = useCallback(async (file: File): Promise<ParsedMidi | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      // Extract tempo information
      const tempos = midi.header.tempos.map((t) => ({
        bpm: t.bpm,
        time: t.time ?? 0,
      }));

      const mainBpm = tempos.length > 0 ? tempos[0].bpm : 120;

      // Extraer time signature
      const timeSignatures = midi.header.timeSignatures;
      const timeSignature =
        timeSignatures.length > 0
          ? {
            numerator: timeSignatures[0].timeSignature[0],
            denominator: timeSignatures[0].timeSignature[1],
          }
          : { numerator: 4, denominator: 4 };

      // Procesar pistas
      const tracks: MidiTrack[] = midi.tracks
        .map((track, index) => {
          const instrumentNum = track.instrument?.number ?? 0;
          const notes: MidiNote[] = track.notes.map((note) => ({
            midi: note.midi,
            name: note.name,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            ticks: note.ticks,
            durationTicks: note.durationTicks,
          }));

          return {
            index,
            name: track.name || `Track ${index + 1}`,
            instrument: getGMInstrumentName(instrumentNum),
            channel: track.channel,
            noteCount: notes.length,
            notes,
          };
        })
        .filter((track) => track.noteCount > 0); // Solo pistas con notas

      const parsed: ParsedMidi = {
        name: file.name.replace('.mid', '').replace('.midi', ''),
        duration: midi.duration,
        bpm: mainBpm,
        timeSignature,
        tracks,
        header: {
          ppq: midi.header.ppq,
          tempos,
        },
      };

      setParsedMidi(parsed);
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al cargar MIDI';
      setError(message);
      console.error('Error loading MIDI:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMidiFromUrl = useCallback(
    async (url: string): Promise<ParsedMidi | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/midi' });
        const file = new File([blob], url.split('/').pop() || 'midi.mid', { type: 'audio/midi' });

        return await loadMidiFile(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido al cargar MIDI';
        setError(message);
        console.error('Error loading MIDI from URL:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadMidiFile]
  );

  const clearMidi = useCallback(() => {
    setParsedMidi(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    parsedMidi,
    loadMidiFile,
    loadMidiFromUrl,
    clearMidi,
  };
}

export default useMidiLoader;
