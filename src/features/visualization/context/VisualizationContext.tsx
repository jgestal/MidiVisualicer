/**
 * Contexto para la gestión de visualización
 * Maneja qué vista está activa (tablatura, piano roll, partitura)
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Tipos de visualización disponibles
export type VisualizationType = 'tablature' | 'pianoroll' | 'notation';

// Estado del contexto
interface VisualizationState {
  activeView: VisualizationType;
  isMaximized: boolean;
}

// Acciones
type VisualizationAction =
  | { type: 'SET_VIEW'; payload: VisualizationType }
  | { type: 'TOGGLE_MAXIMIZE' }
  | { type: 'SET_MAXIMIZED'; payload: boolean };

// Estado inicial
const initialState: VisualizationState = {
  activeView: 'tablature',
  isMaximized: false,
};

// Reducer
function visualizationReducer(
  state: VisualizationState,
  action: VisualizationAction
): VisualizationState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'TOGGLE_MAXIMIZE':
      return { ...state, isMaximized: !state.isMaximized };
    case 'SET_MAXIMIZED':
      return { ...state, isMaximized: action.payload };
    default:
      return state;
  }
}

// Tipo del contexto
interface VisualizationContextType {
  state: VisualizationState;
  setActiveView: (view: VisualizationType) => void;
  toggleMaximize: () => void;
  setMaximized: (maximized: boolean) => void;
}

// Contexto
const VisualizationContext = createContext<VisualizationContextType | null>(null);

// Provider
export function VisualizationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(visualizationReducer, initialState);

  const setActiveView = useCallback((view: VisualizationType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const toggleMaximize = useCallback(() => {
    dispatch({ type: 'TOGGLE_MAXIMIZE' });
  }, []);

  const setMaximized = useCallback((maximized: boolean) => {
    dispatch({ type: 'SET_MAXIMIZED', payload: maximized });
  }, []);

  const value: VisualizationContextType = {
    state,
    setActiveView,
    toggleMaximize,
    setMaximized,
  };

  return <VisualizationContext.Provider value={value}>{children}</VisualizationContext.Provider>;
}

// Hook para usar el contexto
export function useVisualization() {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
}

// Hook para obtener la vista activa
export function useActiveView() {
  const { state } = useVisualization();
  return state.activeView;
}

// Hook para verificar si está maximizado
export function useIsMaximized() {
  const { state } = useVisualization();
  return state.isMaximized;
}
