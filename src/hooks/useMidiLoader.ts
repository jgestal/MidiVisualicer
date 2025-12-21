/**
 * Hook para cargar y parsear archivos MIDI
 */
import { useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import type { ParsedMidi, MidiTrack, MidiNote } from '../types/midi';

// Mapa de instrumentos GM (General MIDI) a nombres
const GM_INSTRUMENTS: Record<number, string> = {
  0: 'Piano', 1: 'Bright Piano', 2: 'Electric Grand', 3: 'Honky-tonk',
  4: 'Electric Piano 1', 5: 'Electric Piano 2', 6: 'Harpsichord', 7: 'Clavinet',
  8: 'Celesta', 9: 'Glockenspiel', 10: 'Music Box', 11: 'Vibraphone',
  12: 'Marimba', 13: 'Xylophone', 14: 'Tubular Bells', 15: 'Dulcimer',
  16: 'Drawbar Organ', 17: 'Percussive Organ', 18: 'Rock Organ', 19: 'Church Organ',
  20: 'Reed Organ', 21: 'Accordion', 22: 'Harmonica', 23: 'Tango Accordion',
  24: 'Acoustic Guitar (nylon)', 25: 'Acoustic Guitar (steel)',
  26: 'Electric Guitar (jazz)', 27: 'Electric Guitar (clean)',
  28: 'Electric Guitar (muted)', 29: 'Overdriven Guitar',
  30: 'Distortion Guitar', 31: 'Guitar Harmonics',
  32: 'Acoustic Bass', 33: 'Electric Bass (finger)', 34: 'Electric Bass (pick)',
  35: 'Fretless Bass', 36: 'Slap Bass 1', 37: 'Slap Bass 2',
  38: 'Synth Bass 1', 39: 'Synth Bass 2',
  40: 'Violin', 41: 'Viola', 42: 'Cello', 43: 'Contrabass',
  44: 'Tremolo Strings', 45: 'Pizzicato Strings', 46: 'Orchestral Harp', 47: 'Timpani',
  48: 'String Ensemble 1', 49: 'String Ensemble 2', 50: 'Synth Strings 1', 51: 'Synth Strings 2',
  52: 'Choir Aahs', 53: 'Voice Oohs', 54: 'Synth Voice', 55: 'Orchestra Hit',
  56: 'Trumpet', 57: 'Trombone', 58: 'Tuba', 59: 'Muted Trumpet',
  60: 'French Horn', 61: 'Brass Section', 62: 'Synth Brass 1', 63: 'Synth Brass 2',
  64: 'Soprano Sax', 65: 'Alto Sax', 66: 'Tenor Sax', 67: 'Baritone Sax',
  68: 'Oboe', 69: 'English Horn', 70: 'Bassoon', 71: 'Clarinet',
  72: 'Piccolo', 73: 'Flute', 74: 'Recorder', 75: 'Pan Flute',
  76: 'Blown Bottle', 77: 'Shakuhachi', 78: 'Whistle', 79: 'Ocarina',
  80: 'Lead 1 (square)', 81: 'Lead 2 (sawtooth)', 82: 'Lead 3 (calliope)',
  83: 'Lead 4 (chiff)', 84: 'Lead 5 (charang)', 85: 'Lead 6 (voice)',
  86: 'Lead 7 (fifths)', 87: 'Lead 8 (bass + lead)',
  88: 'Pad 1 (new age)', 89: 'Pad 2 (warm)', 90: 'Pad 3 (polysynth)',
  91: 'Pad 4 (choir)', 92: 'Pad 5 (bowed)', 93: 'Pad 6 (metallic)',
  94: 'Pad 7 (halo)', 95: 'Pad 8 (sweep)',
};

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

      // Extraer información del tempo
      const tempos = midi.header.tempos.map(t => ({
        bpm: t.bpm,
        time: t.time
      }));

      const mainBpm = tempos.length > 0 ? tempos[0].bpm : 120;

      // Extraer time signature
      const timeSignatures = midi.header.timeSignatures;
      const timeSignature = timeSignatures.length > 0
        ? { numerator: timeSignatures[0].timeSignature[0], denominator: timeSignatures[0].timeSignature[1] }
        : { numerator: 4, denominator: 4 };

      // Procesar pistas
      const tracks: MidiTrack[] = midi.tracks
        .map((track, index) => {
          const instrumentNum = track.instrument?.number ?? 0;
          const notes: MidiNote[] = track.notes.map(note => ({
            midi: note.midi,
            name: note.name,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            ticks: note.ticks,
            durationTicks: note.durationTicks
          }));

          return {
            index,
            name: track.name || `Track ${index + 1}`,
            instrument: GM_INSTRUMENTS[instrumentNum] || 'Unknown',
            channel: track.channel,
            noteCount: notes.length,
            notes
          };
        })
        .filter(track => track.noteCount > 0); // Solo pistas con notas

      const parsed: ParsedMidi = {
        name: file.name.replace('.mid', '').replace('.midi', ''),
        duration: midi.duration,
        bpm: mainBpm,
        timeSignature,
        tracks,
        header: {
          ppq: midi.header.ppq,
          tempos
        }
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

  const loadMidiFromUrl = useCallback(async (url: string): Promise<ParsedMidi | null> => {
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
  }, [loadMidiFile]);

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
    clearMidi
  };
}

export default useMidiLoader;
