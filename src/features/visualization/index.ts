/**
 * Exportaciones del feature visualization
 */

// Context
export { VisualizationProvider, useVisualization } from './context/VisualizationContext';

// Components
export { PianoRoll, Tablature, Notation } from './components';

// Types
export type { PianoRollProps, TablatureProps, NotationProps } from './components';
export type { VisualizationType } from './context/VisualizationContext';
