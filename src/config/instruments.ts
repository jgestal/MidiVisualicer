/**
 * Sistema de Configuración Modular de Instrumentos
 *
 * Incluye instrumentos predefinidos + soporte para instrumentos personalizados
 * guardados en localStorage
 */

export interface InstrumentConfig {
  id: string;
  name: string;
  nameEs: string;
  strings: string[]; // Notas de las cuerdas (grave a agudo)
  midiNotes: number[]; // Notas MIDI correspondientes
  frets: number; // Número de trastes
  doubleStrings: boolean; // Si tiene cuerdas dobles
  icon: string; // Emoji o icono
  description: string;
  isCustom?: boolean; // Si es un instrumento personalizado
}

// Función helper para convertir nota a número MIDI
export function noteToMidi(note: string): number {
  const noteMap: Record<string, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return 60; // C4 por defecto

  const [, noteName, octave] = match;
  return (parseInt(octave) + 1) * 12 + noteMap[noteName];
}

// Función para obtener la nota desde número MIDI
export function midiToNote(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${notes[noteIndex]}${octave}`;
}

// Función para obtener el nombre de la nota sin octava
export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return notes[midi % 12];
}

/**
 * INSTRUMENTOS PREDEFINIDOS
 */
export const DEFAULT_INSTRUMENTS: Record<string, InstrumentConfig> = {
  // GUITARRAS
  guitar: {
    id: 'guitar',
    name: 'Guitar',
    nameEs: 'Guitarra Española',
    strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    midiNotes: [40, 45, 50, 55, 59, 64],
    frets: 19,
    doubleStrings: false,
    icon: '🎸',
    description: 'Guitarra clásica/española estándar',
  },

  guitarAcoustic: {
    id: 'guitarAcoustic',
    name: 'Acoustic Guitar',
    nameEs: 'Guitarra Acústica',
    strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    midiNotes: [40, 45, 50, 55, 59, 64],
    frets: 20,
    doubleStrings: false,
    icon: '🎸',
    description: 'Guitarra acústica folk/western',
  },

  guitarElectric: {
    id: 'guitarElectric',
    name: 'Electric Guitar',
    nameEs: 'Guitarra Eléctrica',
    strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    midiNotes: [40, 45, 50, 55, 59, 64],
    frets: 24,
    doubleStrings: false,
    icon: '🎸',
    description: 'Guitarra eléctrica estándar (24 trastes)',
  },

  bass4: {
    id: 'bass4',
    name: 'Bass Guitar (4 strings)',
    nameEs: 'Bajo Eléctrico (4 cuerdas)',
    strings: ['E1', 'A1', 'D2', 'G2'],
    midiNotes: [28, 33, 38, 43],
    frets: 24,
    doubleStrings: false,
    icon: '🎸',
    description: 'Bajo eléctrico de 4 cuerdas',
  },

  bass5: {
    id: 'bass5',
    name: 'Bass Guitar (5 strings)',
    nameEs: 'Bajo Eléctrico (5 cuerdas)',
    strings: ['B0', 'E1', 'A1', 'D2', 'G2'],
    midiNotes: [23, 28, 33, 38, 43],
    frets: 24,
    doubleStrings: false,
    icon: '🎸',
    description: 'Bajo eléctrico de 5 cuerdas',
  },

  // INSTRUMENTOS TRADICIONALES ESPAÑOLES
  bandurria: {
    id: 'bandurria',
    name: 'Bandurria',
    nameEs: 'Bandurria',
    strings: ['G#3', 'C#4', 'F#4', 'B4', 'E5', 'A5'],
    midiNotes: [56, 61, 66, 71, 76, 81],
    frets: 17,
    doubleStrings: true,
    icon: '🪕',
    description: 'Instrumento tradicional español de 12 cuerdas (6 pares)',
  },

  laud: {
    id: 'laud',
    name: 'Laúd Español',
    nameEs: 'Laúd Español',
    strings: ['G#2', 'C#3', 'F#3', 'B3', 'E4', 'A4'],
    midiNotes: [44, 49, 54, 59, 64, 69],
    frets: 17,
    doubleStrings: true,
    icon: '🪕',
    description: 'Laúd español de 12 cuerdas (6 pares)',
  },

  // MANDOLINAS
  mandolin: {
    id: 'mandolin',
    name: 'Mandolin',
    nameEs: 'Mandolina',
    strings: ['G3', 'D4', 'A4', 'E5'],
    midiNotes: [55, 62, 69, 76],
    frets: 17,
    doubleStrings: true,
    icon: '🎻',
    description: 'Mandolina estándar de 8 cuerdas (4 pares)',
  },

  mandola: {
    id: 'mandola',
    name: 'Mandola',
    nameEs: 'Mandola',
    strings: ['C3', 'G3', 'D4', 'A4'],
    midiNotes: [48, 55, 62, 69],
    frets: 17,
    doubleStrings: true,
    icon: '🎻',
    description: 'Mandola - versión más grave de la mandolina',
  },

  // BANJOS
  banjo5: {
    id: 'banjo5',
    name: 'Banjo (5 strings)',
    nameEs: 'Banjo (5 cuerdas)',
    strings: ['G4', 'D3', 'G3', 'B3', 'D4'],
    midiNotes: [67, 50, 55, 59, 62],
    frets: 22,
    doubleStrings: false,
    icon: '🪕',
    description: 'Banjo de 5 cuerdas estilo bluegrass',
  },

  banjo4: {
    id: 'banjo4',
    name: 'Tenor Banjo',
    nameEs: 'Banjo Tenor',
    strings: ['C3', 'G3', 'D4', 'A4'],
    midiNotes: [48, 55, 62, 69],
    frets: 19,
    doubleStrings: false,
    icon: '🪕',
    description: 'Banjo tenor de 4 cuerdas (afinación de viola)',
  },

  // UKELELES
  ukuleleSoprano: {
    id: 'ukuleleSoprano',
    name: 'Ukulele (Soprano/Concert)',
    nameEs: 'Ukelele Soprano/Concierto',
    strings: ['G4', 'C4', 'E4', 'A4'],
    midiNotes: [67, 60, 64, 69],
    frets: 15,
    doubleStrings: false,
    icon: '🪕',
    description: 'Ukelele soprano o concierto (afinación estándar)',
  },

  ukuleleTenor: {
    id: 'ukuleleTenor',
    name: 'Ukulele (Tenor)',
    nameEs: 'Ukelele Tenor',
    strings: ['G3', 'C4', 'E4', 'A4'],
    midiNotes: [55, 60, 64, 69],
    frets: 18,
    doubleStrings: false,
    icon: '🪕',
    description: 'Ukelele tenor (cuerda G grave)',
  },

  ukuleleBaritone: {
    id: 'ukuleleBaritone',
    name: 'Ukulele (Baritone)',
    nameEs: 'Ukelele Barítono',
    strings: ['D3', 'G3', 'B3', 'E4'],
    midiNotes: [50, 55, 59, 64],
    frets: 19,
    doubleStrings: false,
    icon: '🪕',
    description: 'Ukelele barítono (afinación de guitarra)',
  },

  // OTROS
  violin: {
    id: 'violin',
    name: 'Violin',
    nameEs: 'Violín',
    strings: ['G3', 'D4', 'A4', 'E5'],
    midiNotes: [55, 62, 69, 76],
    frets: 0, // Sin trastes - usamos posiciones relativas
    doubleStrings: false,
    icon: '🎻',
    description: 'Violín (sin trastes - posiciones aproximadas)',
  },

  viola: {
    id: 'viola',
    name: 'Viola',
    nameEs: 'Viola',
    strings: ['C3', 'G3', 'D4', 'A4'],
    midiNotes: [48, 55, 62, 69],
    frets: 0,
    doubleStrings: false,
    icon: '🎻',
    description: 'Viola (sin trastes - posiciones aproximadas)',
  },

  cello: {
    id: 'cello',
    name: 'Cello',
    nameEs: 'Violonchelo',
    strings: ['C2', 'G2', 'D3', 'A3'],
    midiNotes: [36, 43, 50, 57],
    frets: 0,
    doubleStrings: false,
    icon: '🎻',
    description: 'Violonchelo (sin trastes - posiciones aproximadas)',
  },

  charango: {
    id: 'charango',
    name: 'Charango',
    nameEs: 'Charango',
    strings: ['G4', 'C4', 'E4', 'A4', 'E5'],
    midiNotes: [67, 60, 64, 69, 76],
    frets: 15,
    doubleStrings: true,
    icon: '🪕',
    description: 'Charango andino (10 cuerdas, 5 pares)',
  },

  cavaquinho: {
    id: 'cavaquinho',
    name: 'Cavaquinho',
    nameEs: 'Cavaquinho',
    strings: ['D4', 'G4', 'B4', 'D5'],
    midiNotes: [62, 67, 71, 74],
    frets: 17,
    doubleStrings: false,
    icon: '🪕',
    description: 'Cavaquinho brasileño',
  },

  bouzouki: {
    id: 'bouzouki',
    name: 'Irish Bouzouki',
    nameEs: 'Bouzouki Irlandés',
    strings: ['G2', 'D3', 'A3', 'D4'],
    midiNotes: [43, 50, 57, 62],
    frets: 24,
    doubleStrings: true,
    icon: '🪕',
    description: 'Bouzouki irlandés (8 cuerdas, 4 pares)',
  },

  dulcimer: {
    id: 'dulcimer',
    name: 'Mountain Dulcimer',
    nameEs: 'Dulcimer de Montaña',
    strings: ['D3', 'A3', 'D4'],
    midiNotes: [50, 57, 62],
    frets: 15,
    doubleStrings: false,
    icon: '🪕',
    description: 'Dulcimer de los Apalaches',
  },
};

/**
 * Clave para localStorage
 */
const CUSTOM_INSTRUMENTS_KEY = 'midi-visualizer-custom-instruments';

/**
 * Cargar instrumentos personalizados desde localStorage
 */
export function loadCustomInstruments(): Record<string, InstrumentConfig> {
  try {
    const saved = localStorage.getItem(CUSTOM_INSTRUMENTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading custom instruments:', e);
  }
  return {};
}

/**
 * Guardar instrumento personalizado
 */
export function saveCustomInstrument(instrument: InstrumentConfig): void {
  const custom = loadCustomInstruments();
  custom[instrument.id] = { ...instrument, isCustom: true };
  localStorage.setItem(CUSTOM_INSTRUMENTS_KEY, JSON.stringify(custom));
}

/**
 * Eliminar instrumento personalizado
 */
export function deleteCustomInstrument(id: string): void {
  const custom = loadCustomInstruments();
  delete custom[id];
  localStorage.setItem(CUSTOM_INSTRUMENTS_KEY, JSON.stringify(custom));
}

/**
 * Obtener todos los instrumentos (predefinidos + personalizados)
 */
export function getAllInstruments(): Record<string, InstrumentConfig> {
  return {
    ...DEFAULT_INSTRUMENTS,
    ...loadCustomInstruments(),
  };
}

/**
 * Crear un instrumento desde afinación en texto
 * Ejemplo: createInstrumentFromTuning('Mi Instrumento', ['E2', 'A2', 'D3'], 20)
 */
export function createInstrumentFromTuning(
  name: string,
  tuning: string[],
  frets: number,
  doubleStrings: boolean = false,
  icon: string = '🎵'
): InstrumentConfig {
  const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
  const midiNotes = tuning.map(noteToMidi);

  return {
    id,
    name,
    nameEs: name,
    strings: tuning,
    midiNotes,
    frets,
    doubleStrings,
    icon,
    description: `Instrumento personalizado: ${tuning.join(', ')}`,
    isCustom: true,
  };
}

// INSTRUMENTOS - combinación de predefinidos + personalizados
export const INSTRUMENTS = getAllInstruments();

/**
 * Calcula la posición de traste para una nota en un instrumento dado
 */
export function calculateFretPositions(
  midiNote: number,
  instrument: InstrumentConfig
): Array<{ string: number; fret: number }> {
  const positions: Array<{ string: number; fret: number }> = [];
  const maxFret = instrument.frets || 24; // Default 24 para instrumentos sin trastes

  instrument.midiNotes.forEach((openNote, stringIndex) => {
    const fret = midiNote - openNote;
    if (fret >= 0 && fret <= maxFret) {
      positions.push({
        string: stringIndex + 1,
        fret,
      });
    }
  });

  return positions;
}

/**
 * Obtiene la posición óptima considerando ergonomía
 */
export function getOptimalPosition(
  midiNote: number,
  instrument: InstrumentConfig,
  preferredString?: number
): { string: number; fret: number } | null {
  const positions = calculateFretPositions(midiNote, instrument);

  if (positions.length === 0) return null;

  if (preferredString) {
    const preferred = positions.find((p) => p.string === preferredString);
    if (preferred) return preferred;
  }

  // Ordenar por: menor traste primero, luego por cuerda más grave
  positions.sort((a, b) => {
    if (a.fret !== b.fret) return a.fret - b.fret;
    return a.string - b.string;
  });

  return positions[0];
}

export default INSTRUMENTS;
