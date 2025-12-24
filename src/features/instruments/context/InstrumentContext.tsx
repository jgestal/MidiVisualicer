/**
 * Contexto para la gestión de instrumentos
 * Maneja selección, transposición auto e instrumentos personalizados
 */
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  type InstrumentConfig,
  DEFAULT_INSTRUMENTS,
  saveCustomInstrument as saveToConfig,
  deleteCustomInstrument as deleteFromConfig,
  getAllInstruments as getAllFromConfig,
} from '@/config/instruments';

export type { InstrumentConfig };

// Context state
interface InstrumentState {
  selectedInstrumentId: string;
  transpose: number;
  customInstruments: Record<string, InstrumentConfig>;
}

// Actions
type InstrumentAction =
  | { type: 'SELECT_INSTRUMENT'; payload: string }
  | { type: 'SET_TRANSPOSE'; payload: number }
  | { type: 'ADD_CUSTOM_INSTRUMENT'; payload: InstrumentConfig }
  | { type: 'DELETE_CUSTOM_INSTRUMENT'; payload: string }
  | { type: 'LOAD_CUSTOM_INSTRUMENTS'; payload: Record<string, InstrumentConfig> };

// Clave para localStorage de preferencias
const PREFS_KEY = 'midi-visualizer-prefs';

interface UserPrefs {
  selectedInstrumentId?: string;
  transpose?: number;
}

function loadPrefs(): UserPrefs {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: Partial<UserPrefs>): void {
  try {
    const current = loadPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (e) {
    console.error('Error saving prefs:', e);
  }
}

// Initial state (cargado desde localStorage)
const savedPrefs = loadPrefs();
const initialState: InstrumentState = {
  selectedInstrumentId: savedPrefs.selectedInstrumentId || 'guitar',
  transpose: savedPrefs.transpose ?? 0,
  customInstruments: {},
};

// Reducer
function instrumentReducer(state: InstrumentState, action: InstrumentAction): InstrumentState {
  switch (action.type) {
    case 'SELECT_INSTRUMENT':
      savePrefs({ selectedInstrumentId: action.payload });
      return { ...state, selectedInstrumentId: action.payload };

    case 'SET_TRANSPOSE':
      savePrefs({ transpose: action.payload });
      return { ...state, transpose: action.payload };

    case 'ADD_CUSTOM_INSTRUMENT': {
      const newCustom = {
        ...state.customInstruments,
        [action.payload.id]: { ...action.payload, isCustom: true },
      };
      // Actualizar localStorage a través de config helper
      try {
        saveToConfig({ ...action.payload, isCustom: true });
      } catch (e) {
        console.error('Error saving custom instruments:', e);
      }
      return { ...state, customInstruments: newCustom };
    }

    case 'DELETE_CUSTOM_INSTRUMENT': {
      const { [action.payload]: _, ...remaining } = state.customInstruments;
      // Actualizar localStorage a través de config helper
      try {
        deleteFromConfig(action.payload);
      } catch (e) {
        console.error('Error saving custom instruments:', e);
      }
      // Si el instrumento eliminado estaba seleccionado, volver a guitarra
      const newSelectedId =
        state.selectedInstrumentId === action.payload ? 'guitar' : state.selectedInstrumentId;
      return {
        ...state,
        customInstruments: remaining,
        selectedInstrumentId: newSelectedId,
      };
    }

    case 'LOAD_CUSTOM_INSTRUMENTS':
      return { ...state, customInstruments: action.payload };

    default:
      return state;
  }
}

// Tipo del contexto
interface InstrumentContextType {
  state: InstrumentState;
  selectInstrument: (id: string) => void;
  setTranspose: (semitones: number) => void;
  addCustomInstrument: (instrument: InstrumentConfig) => void;
  deleteCustomInstrument: (id: string) => void;
  calculateOptimalTranspose: (notes: Array<{ midi: number }>, instrumentId: string) => number;
}

// Contexto
const InstrumentContext = createContext<InstrumentContextType | null>(null);

// Provider
export function InstrumentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(instrumentReducer, initialState);

  // Cargar instrumentos personalizados al montar
  useEffect(() => {
    try {
      // Usar helper para obtener todos, filtrar custom
      const all = getAllFromConfig();
      const customOnly: Record<string, InstrumentConfig> = {};

      Object.values(all).forEach((inst) => {
        if (inst.isCustom) {
          customOnly[inst.id] = inst;
        }
      });

      if (Object.keys(customOnly).length > 0) {
        dispatch({ type: 'LOAD_CUSTOM_INSTRUMENTS', payload: customOnly });
      }
    } catch (e) {
      console.error('Error loading custom instruments:', e);
    }
  }, []);

  const selectInstrument = useCallback((id: string) => {
    dispatch({ type: 'SELECT_INSTRUMENT', payload: id });
  }, []);

  const setTranspose = useCallback((semitones: number) => {
    dispatch({ type: 'SET_TRANSPOSE', payload: semitones });
  }, []);

  const addCustomInstrument = useCallback((instrument: InstrumentConfig) => {
    dispatch({ type: 'ADD_CUSTOM_INSTRUMENT', payload: instrument });
  }, []);

  const deleteCustomInstrument = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CUSTOM_INSTRUMENT', payload: id });
  }, []);

  // Calcular transposición óptima para que las notas encajen en el instrumento
  const calculateOptimalTranspose = useCallback(
    (notes: Array<{ midi: number }>, _instrumentId: string): number => {
      if (notes.length === 0) return 0;

      // Importar dinámicamente para evitar dependencias circulares
      // En una implementación real, esto vendría del contexto de instrumentos
      const midiNotes = notes.map((n) => n.midi);
      const minNote = Math.min(...midiNotes);
      const maxNote = Math.max(...midiNotes);
      const noteCenter = (minNote + maxNote) / 2;

      // Valores aproximados para guitarra estándar
      // En implementación completa, obtener del instrumento real
      const instMin = 40; // E2
      const instMax = 88; // E6 (traste 24)
      const instCenter = (instMin + instMax) / 2;

      // Calcular transposición óptima (en octavas)
      const suggestedTranspose = Math.round((instCenter - noteCenter) / 12) * 12;
      return suggestedTranspose;
    },
    []
  );

  const value: InstrumentContextType = {
    state,
    selectInstrument,
    setTranspose,
    addCustomInstrument,
    deleteCustomInstrument,
    calculateOptimalTranspose,
  };

  return <InstrumentContext.Provider value={value}>{children}</InstrumentContext.Provider>;
}

// Hook para usar el contexto
export function useInstrument() {
  const context = useContext(InstrumentContext);
  if (!context) {
    throw new Error('useInstrument must be used within an InstrumentProvider');
  }
  return context;
}

// Hook para obtener el ID del instrumento seleccionado
export function useSelectedInstrumentId() {
  const { state } = useInstrument();
  return state.selectedInstrumentId;
}

// Hook para obtener la transposición
export function useTranspose() {
  const { state } = useInstrument();
  return state.transpose;
}

// Hook para obtener todos los instrumentos (default + custom)
export function useAllInstruments() {
  const { state } = useInstrument();
  return useMemo(
    () => ({
      ...DEFAULT_INSTRUMENTS,
      ...state.customInstruments,
    }),
    [state.customInstruments]
  );
}
