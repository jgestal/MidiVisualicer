/**
 * MIDI Parser Web Worker
 * 
 * @description Offloads MIDI parsing to a separate thread to prevent UI blocking:
 * - Parses MIDI files without blocking the main thread
 * - Handles large files smoothly
 * - Reports progress for long operations
 * 
 * @usage
 * const worker = new Worker(new URL('./midiParserWorker.ts', import.meta.url), { type: 'module' });
 * worker.postMessage({ type: 'PARSE', data: arrayBuffer });
 * worker.onmessage = (e) => { handleResult(e.data); };
 */

import { Midi as ToneMidi } from '@tonejs/midi';

// ============================================
// Types
// ============================================

interface ParseMessage {
  type: 'PARSE';
  id: string;
  data: ArrayBuffer;
  fileName?: string;
}

interface CancelMessage {
  type: 'CANCEL';
  id: string;
}

type WorkerMessage = ParseMessage | CancelMessage;

interface ParsedNote {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
  name: string;
}

interface ParsedTrack {
  name: string;
  notes: ParsedNote[];
  instrument: string;
  channel: number;
}

interface ParsedMidiResult {
  name: string;
  tracks: ParsedTrack[];
  duration: number;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
}

interface SuccessResponse {
  type: 'SUCCESS';
  id: string;
  data: ParsedMidiResult;
  parseTimeMs: number;
}

interface ErrorResponse {
  type: 'ERROR';
  id: string;
  error: string;
}

interface ProgressResponse {
  type: 'PROGRESS';
  id: string;
  progress: number; // 0-100
  stage: string;
}

// WorkerResponse is used for type documentation only

// ============================================
// Worker Context
// ============================================

const ctx: Worker = self as unknown as Worker;

// Track active parsing operations for cancellation
const activeParsing = new Map<string, boolean>();

// ============================================
// Parsing Logic
// ============================================

function reportProgress(id: string, progress: number, stage: string) {
  ctx.postMessage({
    type: 'PROGRESS',
    id,
    progress,
    stage,
  } as ProgressResponse);
}

function parseMidi(id: string, arrayBuffer: ArrayBuffer, fileName?: string): ParsedMidiResult {

  // Check for cancellation
  if (!activeParsing.get(id)) {
    throw new Error('Parsing cancelled');
  }

  reportProgress(id, 10, 'Reading MIDI data...');

  // Parse with Tone.js Midi
  const midi = new ToneMidi(arrayBuffer);

  if (!activeParsing.get(id)) {
    throw new Error('Parsing cancelled');
  }

  reportProgress(id, 30, 'Processing tracks...');

  // Extract tracks with progress reporting
  const totalTracks = midi.tracks.length;
  const tracks: ParsedTrack[] = midi.tracks.map((track, index) => {
    // Report per-track progress
    const trackProgress = 30 + (50 * (index / totalTracks));
    reportProgress(id, Math.round(trackProgress), `Processing track ${index + 1}/${totalTracks}...`);

    // Check for cancellation between tracks
    if (!activeParsing.get(id)) {
      throw new Error('Parsing cancelled');
    }

    // Map notes
    const notes: ParsedNote[] = track.notes.map(note => ({
      midi: note.midi,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
      name: note.name,
    }));

    return {
      name: track.name || `Track ${index + 1}`,
      notes,
      instrument: track.instrument?.name || 'Acoustic Grand Piano',
      channel: track.channel || 0,
    };
  });

  reportProgress(id, 90, 'Finalizing...');

  // Calculate duration
  const duration = Math.max(
    ...tracks.flatMap(t =>
      t.notes.map(n => n.time + n.duration)
    ),
    midi.duration
  );

  // Get tempo and time signature
  const bpm = midi.header.tempos[0]?.bpm || 120;
  const timeSig = midi.header.timeSignatures[0];
  const timeSignature = {
    numerator: timeSig?.timeSignature?.[0] || 4,
    denominator: timeSig?.timeSignature?.[1] || 4,
  };

  const result: ParsedMidiResult = {
    name: fileName || midi.name || 'Untitled',
    tracks,
    duration,
    bpm,
    timeSignature,
  };

  reportProgress(id, 100, 'Complete');

  return result;
}

// ============================================
// Message Handler
// ============================================

ctx.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'PARSE': {
      const { id, data, fileName } = message;
      activeParsing.set(id, true);

      try {
        const startTime = performance.now();
        const result = parseMidi(id, data, fileName);
        const parseTimeMs = performance.now() - startTime;

        ctx.postMessage({
          type: 'SUCCESS',
          id,
          data: result,
          parseTimeMs,
        } as SuccessResponse);
      } catch (error) {
        ctx.postMessage({
          type: 'ERROR',
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as ErrorResponse);
      } finally {
        activeParsing.delete(id);
      }
      break;
    }

    case 'CANCEL': {
      const { id } = message;
      activeParsing.set(id, false);
      break;
    }
  }
};

// Export for TypeScript module resolution
export { };
