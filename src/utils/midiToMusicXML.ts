/**
 * Simple MIDI to MusicXML converter
 * Converts parsed MIDI notes to MusicXML format for display in OSMD
 */

import type { MidiNote } from '../types/midi';
import { midiToOctave } from './midiUtils';
import {
  DEFAULT_TEMPO,
  MAX_NOTES_FOR_MUSICXML,
  DIVISIONS_PER_QUARTER,
  DEFAULT_TIME_SIGNATURE,
  CLEF_THRESHOLDS
} from '../shared/constants/notation';

// Note names for MusicXML (uses letter names)
const NOTE_NAMES = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
const NOTE_ALTERS = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]; // 0 = natural, 1 = sharp

interface NoteInfo {
  step: string;      // A-G
  octave: number;    // 0-9
  alter?: number;    // -1 flat, 0 natural, 1 sharp
  duration: number;  // in divisions
  type: string;      // whole, half, quarter, eighth, 16th
  isRest: boolean;
  beatPosition?: number; // which beat this note falls on (1-indexed)
}

// Beam position in a beamed group
type BeamType = 'begin' | 'continue' | 'end' | null;

/**
 * Check if a note type is eligible for beaming
 * Rule: Only eighth notes and shorter can be beamed
 */
function isBeamableType(type: string): boolean {
  return type === 'eighth' || type === '16th' || type === '32nd';
}

/**
 * Detect if meter is compound (6/8, 9/8, 12/8)
 * Compound meters have 3 eighth notes per beat
 */
function isCompoundMeter(beats: number, beatType: number): boolean {
  return beatType === 8 && (beats === 6 || beats === 9 || beats === 12);
}

/**
 * Calculate beam groups for a measure
 * Follows standard engraving rules:
 * - Group by beat in simple meters
 * - Group by dotted quarter in compound meters
 * - Never beam across the middle of 4/4 (the "imaginary line")
 */
function calculateBeamGroups(
  noteInfos: NoteInfo[],
  timeSignature: { beats: number; beatType: number },
  divisionsPerQuarter: number
): BeamType[] {
  const beamTypes: BeamType[] = new Array(noteInfos.length).fill(null);

  if (noteInfos.length === 0) return beamTypes;

  const { beats, beatType } = timeSignature;
  const isCompound = isCompoundMeter(beats, beatType);

  // Calculate divisions per beat
  let divisionsPerBeat: number;
  if (isCompound) {
    // In compound meter, beat = dotted quarter = 1.5 quarters
    divisionsPerBeat = divisionsPerQuarter * 1.5;
  } else {
    // In simple meter with beat-type 4, beat = quarter
    divisionsPerBeat = divisionsPerQuarter * (4 / beatType);
  }

  // The "imaginary line" for 4/4 - don't beam across beats 2-3 (index 1-2)
  const halfMeasureBeat = beats === 4 ? 2 : -1;

  // Group notes by their beat position
  let currentPosition = 0;
  const noteBeats: number[] = [];

  for (const note of noteInfos) {
    const beatNumber = Math.floor(currentPosition / divisionsPerBeat);
    noteBeats.push(beatNumber);
    currentPosition += note.duration;
  }

  // Find beam groups
  let groupStart = -1;

  for (let i = 0; i <= noteInfos.length; i++) {
    const isBeamable = i < noteInfos.length &&
      isBeamableType(noteInfos[i].type) &&
      !noteInfos[i].isRest;

    let shouldBreak = !isBeamable;
    if (isBeamable && groupStart !== -1 && i > 0) {
      const prevBeat = noteBeats[i - 1];
      const currBeat = noteBeats[i];

      // Break if on different beats in simple meter
      if (!isCompound && currBeat !== prevBeat) {
        shouldBreak = true;
      }

      // Imaginary line rule for 4/4 (break between beat 2 and 3)
      if (halfMeasureBeat >= 0 && prevBeat < halfMeasureBeat && currBeat >= halfMeasureBeat) {
        shouldBreak = true;
      }
    }

    if (isBeamable && !shouldBreak && groupStart === -1) {
      groupStart = i;
    } else if (shouldBreak && groupStart !== -1) {
      const groupLength = i - groupStart;
      if (groupLength >= 2) {
        beamTypes[groupStart] = 'begin';
        for (let j = groupStart + 1; j < i - 1; j++) {
          beamTypes[j] = 'continue';
        }
        beamTypes[i - 1] = 'end';
      }
      groupStart = isBeamable ? i : -1;
    }
  }

  return beamTypes;
}

function midiToNoteInfo(midi: number, durationSeconds: number, divisionsPerQuarter: number, tempo: number): NoteInfo {
  const step = NOTE_NAMES[midi % 12];
  const alter = NOTE_ALTERS[midi % 12];
  const octave = midiToOctave(midi);

  // Convert duration in seconds to duration in divisions
  const beatsPerSecond = tempo / 60;
  const quarterNoteDuration = 1 / beatsPerSecond;
  const durationInQuarters = durationSeconds / quarterNoteDuration;
  const duration = Math.round(durationInQuarters * divisionsPerQuarter);

  // Determine note type based on duration
  let type = 'quarter';
  if (durationInQuarters >= 3.5) type = 'whole';
  else if (durationInQuarters >= 1.75) type = 'half';
  else if (durationInQuarters >= 0.875) type = 'quarter';
  else if (durationInQuarters >= 0.4375) type = 'eighth';
  else type = '16th';

  return {
    step,
    octave,
    alter: alter !== 0 ? alter : undefined,
    duration: Math.max(1, duration),
    type,
    isRest: false,
  };
}

function generateNoteXML(
  noteInfo: NoteInfo,
  voice: number = 1,
  beamType: BeamType = null,
  clefThreshold: number = 71 // Default MIDI 71 (B4) for Treble Clef
): string {
  if (noteInfo.isRest) {
    return `
      <note>
        <rest/>
        <duration>${noteInfo.duration}</duration>
        <voice>${voice}</voice>
        <type>${noteInfo.type}</type>
      </note>`;
  }

  let alterXML = '';
  let accidentalXML = '';
  if (noteInfo.alter !== undefined) {
    alterXML = `<alter>${noteInfo.alter}</alter>`;
    accidentalXML = noteInfo.alter === 1 ? '<accidental>sharp</accidental>' : '<accidental>flat</accidental>';
  }

  // Determine stem direction based on note height (Rule 3)
  // Get MIDI note value from step/octave (approximation for stem logic)
  const midiValue = (noteInfo.octave + 1) * 12 + NOTE_NAMES.indexOf(noteInfo.step);
  const stemDirection = midiValue >= clefThreshold ? 'down' : 'up';

  // Generate beam XML if applicable (for eighth notes and shorter)
  let beamXML = '';
  if (beamType && isBeamableType(noteInfo.type)) {
    beamXML = `<beam number="1">${beamType}</beam>`;
  }

  return `
      <note>
        <pitch>
          <step>${noteInfo.step}</step>
          ${alterXML}
          <octave>${noteInfo.octave}</octave>
        </pitch>
        <duration>${noteInfo.duration}</duration>
        <voice>${voice}</voice>
        <type>${noteInfo.type}</type>
        <stem>${stemDirection}</stem>
        ${accidentalXML}
        ${beamXML}
      </note>`;
}

export function midiNotesToMusicXML(
  notes: MidiNote[],
  options: {
    title?: string;
    tempo?: number;
    timeSignature?: { beats: number; beatType: number };
  } = {}
): string {
  const {
    title = 'MIDI Export',
    tempo = DEFAULT_TEMPO,
    timeSignature = DEFAULT_TIME_SIGNATURE,
  } = options;

  const divisionsPerQuarter = DIVISIONS_PER_QUARTER;

  // PERFORMANCE: Limit notes to prevent performance issues with very large files
  const notesToProcess = notes.length > MAX_NOTES_FOR_MUSICXML
    ? notes.slice(0, MAX_NOTES_FOR_MUSICXML)
    : notes;

  // Sort notes by time
  const sortedNotes = [...notesToProcess].sort((a, b) => a.time - b.time);

  if (sortedNotes.length === 0) {
    return generateEmptyMusicXML(title, tempo, timeSignature, divisionsPerQuarter);
  }

  // Group notes into measures
  const beatsPerMeasure = timeSignature.beats;
  const secondsPerBeat = 60 / tempo;
  const secondsPerMeasure = beatsPerMeasure * secondsPerBeat;

  const measures: MidiNote[][] = [];
  let currentMeasureNotes: MidiNote[] = [];
  let measureStartTime = 0;

  sortedNotes.forEach(note => {
    while (note.time >= measureStartTime + secondsPerMeasure) {
      if (currentMeasureNotes.length > 0) {
        measures.push(currentMeasureNotes);
        currentMeasureNotes = [];
      } else {
        measures.push([]); // Empty measure
      }
      measureStartTime += secondsPerMeasure;
    }
    currentMeasureNotes.push(note);
  });

  if (currentMeasureNotes.length > 0) {
    measures.push(currentMeasureNotes);
  }

  // Ensure at least one measure
  if (measures.length === 0) {
    measures.push([]);
  }

  // Generate measures XML
  let measuresXML = '';

  measures.forEach((measureNotes, measureIndex) => {
    const measureNumber = measureIndex + 1;
    const isFirst = measureIndex === 0;

    let attributesXML = '';
    if (isFirst) {
      // Determine clef based on ALL notes in the piece (not just first measure)
      const allMidiValues = notes.map(n => n.midi);
      const avgMidi = allMidiValues.reduce((sum, m) => sum + m, 0) / allMidiValues.length;

      // Choose clef based on note range using centralized thresholds
      let clefSign = 'G';
      let clefLine = 2;
      let clefOctaveChange = 0;

      if (avgMidi < CLEF_THRESHOLDS.BASS_8VB) {
        // Very low notes - Bass clef with 8vb
        clefSign = 'F';
        clefLine = 4;
        clefOctaveChange = -1;
      } else if (avgMidi < CLEF_THRESHOLDS.BASS_CLEF) {
        // Low to mid-low notes - Bass clef
        clefSign = 'F';
        clefLine = 4;
      } else if (avgMidi > CLEF_THRESHOLDS.TREBLE_8VA) {
        // Very high notes - Treble with 8va
        clefSign = 'G';
        clefLine = 2;
        clefOctaveChange = 1;
      }
      // else default treble clef

      const clefOctaveXML = clefOctaveChange !== 0
        ? `<clef-octave-change>${clefOctaveChange}</clef-octave-change>`
        : '';

      attributesXML = `
      <attributes>
        <divisions>${divisionsPerQuarter}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${timeSignature.beats}</beats>
          <beat-type>${timeSignature.beatType}</beat-type>
        </time>
        <clef>
          <sign>${clefSign}</sign>
          <line>${clefLine}</line>
          ${clefOctaveXML}
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
      </direction>`;
    }

    let notesXML = '';

    if (measureNotes.length === 0) {
      // Add a whole rest for empty measures
      const restDuration = divisionsPerQuarter * timeSignature.beats;
      notesXML = `
      <note>
        <rest/>
        <duration>${restDuration}</duration>
        <voice>1</voice>
        <type>whole</type>
      </note>`;
    } else {
      // Limit to 8 notes per measure for readability
      const limitedNotes = measureNotes.slice(0, 8);

      // Convert to note info array first to determine beaming
      const noteInfos = limitedNotes.map(note =>
        midiToNoteInfo(note.midi, note.duration, divisionsPerQuarter, tempo)
      );

      // Calculate beaming using proper music notation rules
      const beamTypes = calculateBeamGroups(noteInfos, timeSignature, divisionsPerQuarter);

      // Generate XML with beaming
      noteInfos.forEach((noteInfo, idx) => {
        notesXML += generateNoteXML(noteInfo, 1, beamTypes[idx]);
      });
    }

    measuresXML += `
    <measure number="${measureNumber}">
      ${attributesXML}
      ${notesXML}
    </measure>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXML(title)}</work-title>
  </work>
  <identification>
    <creator type="composer">MIDI Visualizer</creator>
    <encoding>
      <software>MIDI Visualizer</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Part 1</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    ${measuresXML}
  </part>
</score-partwise>`;
}

function generateEmptyMusicXML(
  title: string,
  tempo: number,
  timeSignature: { beats: number; beatType: number },
  divisionsPerQuarter: number
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXML(title)}</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>Part 1</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>${divisionsPerQuarter}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${timeSignature.beats}</beats>
          <beat-type>${timeSignature.beatType}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
      </direction>
      <note>
        <rest/>
        <duration>${divisionsPerQuarter * timeSignature.beats}</duration>
        <voice>1</voice>
        <type>whole</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
