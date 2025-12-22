/**
 * Proveedor de todos los contextos de la aplicación
 * Envuelve la app con todos los providers necesarios
 */
import { ReactNode } from 'react';
import { MidiProvider } from '@/features/library/context/MidiContext';
import { PlaybackProvider } from '@/features/player/context/PlaybackContext';
import { TracksProvider } from '@/features/tracks/context/TracksContext';
import { InstrumentProvider } from '@/features/instruments/context/InstrumentContext';
import { VisualizationProvider } from '@/features/visualization/context/VisualizationContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Envuelve la aplicación con todos los providers de contexto
 * El orden importa: los providers más externos son los que
 * pueden ser usados por los más internos
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MidiProvider>
      <PlaybackProvider>
        <TracksProvider>
          <InstrumentProvider>
            <VisualizationProvider>{children}</VisualizationProvider>
          </InstrumentProvider>
        </TracksProvider>
      </PlaybackProvider>
    </MidiProvider>
  );
}

export default AppProviders;
