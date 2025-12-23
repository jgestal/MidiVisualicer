/**
 * Custom hook for export functionality
 * Consolidates all export-related logic in one place
 */
import { useCallback } from 'react';
import type { ParsedMidi } from '../types/midi';
import { generateCifrado, generateTablatureText, downloadAsTextFile } from '../utils/export';

interface UseExportOptions {
    parsedMidi: ParsedMidi | null;
    selectedTrack: number;
    selectedInstrumentId: string;
}

export function useExport({ parsedMidi, selectedTrack, selectedInstrumentId }: UseExportOptions) {

    const exportTablature = useCallback(() => {
        if (!parsedMidi) return;

        const track = parsedMidi.tracks[selectedTrack];
        if (!track) return;

        const tablature = generateTablatureText(track, selectedInstrumentId);
        downloadAsTextFile(tablature, `${parsedMidi.name || 'midi'}_tablatura.tab`);
    }, [parsedMidi, selectedTrack, selectedInstrumentId]);

    const exportTxt = useCallback(() => {
        if (!parsedMidi) return;

        const cifrado = generateCifrado(parsedMidi, selectedTrack);
        downloadAsTextFile(cifrado, `${parsedMidi.name || 'midi'}.txt`);
    }, [parsedMidi, selectedTrack]);

    const exportPdf = useCallback(() => {
        if (!parsedMidi) return;

        const track = parsedMidi.tracks[selectedTrack];
        if (!track) return;

        const tablature = generateTablatureText(track, selectedInstrumentId);

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
        <head>
          <title>${parsedMidi.name || 'Tablatura'}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${tablature}</pre>
          <script>window.print(); window.close();</script>
        </body>
        </html>
      `);
            printWindow.document.close();
        }
    }, [parsedMidi, selectedTrack, selectedInstrumentId]);

    return {
        exportTablature,
        exportTxt,
        exportPdf,
        canExport: !!parsedMidi,
    };
}
