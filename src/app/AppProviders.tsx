/**
 * Proveedor de todos los contextos de la aplicación
 * Envuelve la app con todos los providers necesarios
 */
import { ReactNode } from 'react';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { I18nProvider } from '@/shared/context/I18nContext';
import { MidiProvider, LibraryProvider } from '@/features/library';
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
 *
 * I18nProvider va primero para que todos los componentes
 * puedan acceder a las traducciones
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <LibraryProvider>
          <MidiProvider>
            <PlaybackProvider>
              <TracksProvider>
                <InstrumentProvider>
                  <VisualizationProvider>{children}</VisualizationProvider>
                </InstrumentProvider>
              </TracksProvider>
            </PlaybackProvider>
          </MidiProvider>
        </LibraryProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default AppProviders;

