/**
 * Utilidades para exportar la música a diferentes formatos
 */
import type { MidiNote, ParsedMidi, MidiTrack } from '../types/midi';
import { midiToNote, INSTRUMENTS, getOptimalPosition } from '../config/instruments';

/**
 * Detectar acordes a partir de notas simultáneas
 */
function detectChord(notes: string[]): string {
  if (notes.length < 2) return notes[0] || '';

  // Simplificación: usar la nota más baja como raíz
  const sortedNotes = [...notes].sort();
  const root = sortedNotes[0].replace(/[0-9]/g, '');

  // Si hay 3+ notas, intentar identificar el tipo
  // TODO: Implementar detección de patrones de acordes (major, minor, dim, aug, 7, maj7, m7)
  if (notes.length >= 3) {
    return `${root} (acorde)`;
  }

  return notes.join('-');
}

/**
 * Genera el cifrado (acordes y notas) en formato texto
 */
export function generateCifrado(midi: ParsedMidi, trackIndex: number): string {
  const track = midi.tracks[trackIndex];
  if (!track) return '';

  let output = '';
  output += `╔══════════════════════════════════════════════════════════════╗\n`;
  output += `║  CIFRADO MUSICAL                                            ║\n`;
  output += `╠══════════════════════════════════════════════════════════════╣\n`;
  output += `║  Archivo: ${midi.name.padEnd(50)}║\n`;
  output += `║  Pista: ${track.name.padEnd(52)}║\n`;
  output += `║  Instrumento: ${track.instrument.padEnd(46)}║\n`;
  output += `║  Tempo: ${midi.bpm.toFixed(0)} BPM${' '.repeat(47)}║\n`;
  output += `║  Compás: ${midi.timeSignature.numerator}/${midi.timeSignature.denominator}${' '.repeat(50)}║\n`;
  output += `╚══════════════════════════════════════════════════════════════╝\n\n`;

  // Agrupar notas por tiempo (notas simultáneas = acordes)
  const timeGroups: Map<number, MidiNote[]> = new Map();
  const timeQuantum = 0.05; // 50ms de tolerancia

  track.notes.forEach((note) => {
    const quantizedTime = Math.round(note.time / timeQuantum) * timeQuantum;
    if (!timeGroups.has(quantizedTime)) {
      timeGroups.set(quantizedTime, []);
    }
    timeGroups.get(quantizedTime)!.push(note);
  });

  // Ordenar por tiempo
  const sortedTimes = Array.from(timeGroups.keys()).sort((a, b) => a - b);

  output += `NOTAS Y ACORDES:\n`;
  output += `${'─'.repeat(64)}\n`;
  output += `| Tiempo   | Notas                    | Duración   |\n`;
  output += `${'─'.repeat(64)}\n`;

  sortedTimes.forEach((time) => {
    const notes = timeGroups.get(time)!;
    const noteNames = notes.map((n) => midiToNote(n.midi));
    const avgDuration = notes.reduce((sum, n) => sum + n.duration, 0) / notes.length;

    const chord = detectChord(noteNames);
    const timeStr = formatTimeCode(time).padEnd(8);
    const notesStr = chord.padEnd(24);
    const durStr = `${avgDuration.toFixed(2)}s`;

    output += `| ${timeStr} | ${notesStr} | ${durStr.padEnd(10)} |\n`;
  });

  output += `${'─'.repeat(64)}\n\n`;

  // Estadísticas
  output += `ESTADÍSTICAS:\n`;
  output += `${'─'.repeat(32)}\n`;
  output += `Total de notas: ${track.noteCount}\n`;
  output += `Notas únicas: ${new Set(track.notes.map((n) => n.midi)).size}\n`;
  output += `Duración total: ${formatTimeCode(midi.duration)}\n`;
  output += `Nota más grave: ${midiToNote(Math.min(...track.notes.map((n) => n.midi)))}\n`;
  output += `Nota más aguda: ${midiToNote(Math.max(...track.notes.map((n) => n.midi)))}\n`;

  return output;
}

/**
 * Genera tablatura en formato texto con múltiples líneas
 * Dividida en secciones para mejor legibilidad
 */
export function generateTablatureText(track: MidiTrack, instrumentId: string): string {
  const instrument = INSTRUMENTS[instrumentId];
  if (!instrument) return 'Instrumento no encontrado';

  let output = '';
  output += `╔══════════════════════════════════════════════════════════════╗\n`;
  output += `║  TABLATURA - ${instrument.nameEs.toUpperCase().padEnd(47)}║\n`;
  output += `╠══════════════════════════════════════════════════════════════╣\n`;
  output += `║  Afinación: ${instrument.strings.join(' | ').padEnd(48)}║\n`;
  output += `║  Pista: ${track.name.padEnd(52)}║\n`;
  output += `║  Notas: ${String(track.noteCount).padEnd(52)}║\n`;
  output += `╚══════════════════════════════════════════════════════════════╝\n\n`;

  // Agrupar notas por tiempo
  const timeQuantum = 0.15;
  const timeSlots: Map<number, Array<{ string: number; fret: number; time: number }>> = new Map();

  track.notes.forEach((note) => {
    const position = getOptimalPosition(note.midi, instrument);
    if (position && position.fret >= 0 && position.fret <= instrument.frets) {
      const slot = Math.floor(note.time / timeQuantum);
      if (!timeSlots.has(slot)) {
        timeSlots.set(slot, []);
      }
      timeSlots.get(slot)!.push({ ...position, time: note.time });
    }
  });

  const sortedSlots = Array.from(timeSlots.keys()).sort((a, b) => a - b);
  const stringCount = instrument.strings.length;
  const stringLabels = [...instrument.strings].reverse().map((s) => s.replace(/\d/, '').padEnd(2));

  // Dividir en secciones de ~20 columnas cada una
  const NOTES_PER_LINE = 20;
  const sections: number[][] = [];

  for (let i = 0; i < sortedSlots.length; i += NOTES_PER_LINE) {
    sections.push(sortedSlots.slice(i, i + NOTES_PER_LINE));
  }

  sections.forEach((sectionSlots, sectionIdx) => {
    // Número de compás aproximado
    const startTime = sectionSlots[0] * timeQuantum;
    const timeStr = formatTimeCode(startTime);

    output += `── Sección ${sectionIdx + 1} ─ ${timeStr} ${'─'.repeat(40)}\n\n`;

    // Generar líneas para esta sección
    // Añadir separadores de compás cada 4 notas
    const NOTES_PER_BAR = 4;

    for (let stringIdx = 0; stringIdx < stringCount; stringIdx++) {
      const stringNum = stringCount - stringIdx;
      let line = stringLabels[stringIdx] + '│';

      sectionSlots.forEach((slot, noteIdx) => {
        const positions = timeSlots.get(slot) || [];
        const pos = positions.find((p) => p.string === stringNum);

        if (pos) {
          line += pos.fret.toString().padStart(2, ' ') + '─';
        } else {
          line += '───';
        }

        // Añadir separador de compás cada NOTES_PER_BAR notas
        if ((noteIdx + 1) % NOTES_PER_BAR === 0 && noteIdx < sectionSlots.length - 1) {
          line += '│';
        }
      });

      line += '│';
      output += line + '\n';
    }

    output += '\n';
  });

  // Leyenda y estadísticas
  output += `${'═'.repeat(64)}\n`;
  output += `LEYENDA:\n`;
  output += `  Números = traste donde pulsar\n`;
  output += `  ─── = cuerda al aire o silencio\n`;
  output += `  │ = barra de compás\n\n`;

  output += `ESTADÍSTICAS:\n`;
  output += `  Total de notas: ${track.noteCount}\n`;
  output += `  Notas en rango: ${Array.from(timeSlots.values()).flat().length}\n`;
  output += `  Secciones: ${sections.length}\n`;

  return output;
}

/**
 * Formatea tiempo en MM:SS.ms
 */
function formatTimeCode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Descarga contenido como archivo de texto
 */
/**
 * Genera archivo MusicXML (.musicxml) compatible con Guitar Pro, MuseScore, etc.
 */
export function generateMusicXML(midi: ParsedMidi, trackIndex: number): string {
  const track = midi.tracks[trackIndex];
  if (!track) return '';

  const bpm = midi.bpm || 120;
  const numerator = midi.timeSignature?.numerator || 4;
  const denominator = midi.timeSignature?.denominator || 4;

  // Header standard
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${midi.name}</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>${track.name || 'Guitar'}</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>480</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${numerator}</beats>
          <beat-type>${denominator}</beat-type>
        </time>
        <clef>
          <sign>TAB</sign>
          <line>5</line>
        </clef>
        <staff-details>
          <staff-lines>6</staff-lines>
        </staff-details>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${bpm}</per-minute>
          </metronome>
        </direction-type>
      </direction>
`;

  // Calcular notas
  // Nota: Para una exportación perfecta se necesitaría cuantización y detección de compases.
  // Aquí haremos una aproximación lista secuencial de notas en un solo compás largo (muchos lectores lo aceptan y reputean)
  // O mejor, intentamos dividir por beats simples.

  track.notes.forEach((note) => {
    // Determinar paso y octava
    const noteName = midiToNote(note.midi); // e.g., "C#4"
    const step = noteName.charAt(0);
    const alter = noteName.includes('#') ? 1 : 0;
    const octave = parseInt(noteName.slice(-1), 10);

    // Duración en divisiones (480 ticks por negra)
    // duration (sec) * (bpm / 60) * 480
    const durationTicks = Math.round(note.duration * (bpm / 60) * 480);

    // Tipo de nota aproximado
    let type = 'quarter';
    if (durationTicks >= 1920) type = 'whole';
    else if (durationTicks >= 960) type = 'half';
    else if (durationTicks >= 480) type = 'quarter';
    else if (durationTicks >= 240) type = 'eighth';
    else if (durationTicks >= 120) type = '16th';

    xml += `      <note>
        <pitch>
          <step>${step}</step>
          ${alter ? `<alter>${alter}</alter>` : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>${durationTicks}</duration>
        <type>${type}</type>
      </note>
`;
  });

  xml += `    </measure>
  </part>
</score-partwise>`;

  return xml;
}

/**
 * Genera JSON raw de la pista
 */
export function generateJson(midi: ParsedMidi, trackIndex: number): string {
  const track = midi.tracks[trackIndex];
  if (!track) return '{}';

  return JSON.stringify({
    metadata: {
      name: midi.name,
      bpm: midi.bpm,
      timeSignature: midi.timeSignature,
      duration: midi.duration
    },
    track: track
  }, null, 2);
}

/**
 * Descarga contenido como archivo
 */
export function downloadAsTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default { generateCifrado, generateTablatureText, generateMusicXML, generateJson, downloadAsTextFile };
