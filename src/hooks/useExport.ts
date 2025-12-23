/**
 * Custom hook for export functionality
 * Consolidates all export-related logic in one place
 */
import { useCallback } from 'react';
import type { ParsedMidi } from '../types/midi';
import {
    generateCifrado,
    generateTablatureText,
    generateMusicXML,
    generateJson,
    downloadAsTextFile
} from '../utils/export';

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

    const exportMusicXML = useCallback(() => {
        if (!parsedMidi) return;
        const xml = generateMusicXML(parsedMidi, selectedTrack);
        downloadAsTextFile(xml, `${parsedMidi.name || 'midi'}.musicxml`);
    }, [parsedMidi, selectedTrack]);

    const exportJson = useCallback(() => {
        if (!parsedMidi) return;
        const json = generateJson(parsedMidi, selectedTrack);
        downloadAsTextFile(json, `${parsedMidi.name || 'midi'}.json`);
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
            body { font-family: 'Courier New', monospace; font-size: 11px; padding: 20px; color: #000; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
            .controls {
                margin-bottom: 20px;
                padding: 10px;
                background: #f0f0f0;
                border-bottom: 1px solid #ccc;
                display: flex;
                gap: 10px;
            }
            button {
                padding: 8px 16px;
                cursor: pointer;
                background: #333;
                color: white;
                border: none;
                border-radius: 4px;
            }
            button:hover { background: #555; }
          </style>
        </head>
        <body>
          <div class="controls no-print">
            <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
            <button onclick="window.close()">Cerrar</button>
          </div>
          <pre>${tablature}</pre>
          <script>
            // Try to print automatically after load
            window.onload = function() {
                setTimeout(() => {
                    try { window.print(); } catch(e) { console.error(e); }
                }, 500);
            };
          </script>
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
        exportMusicXML,
        exportJson,
        canExport: !!parsedMidi,
    };
}
