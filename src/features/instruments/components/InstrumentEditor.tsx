/**
 * InstrumentEditor - Modal para crear/editar instrumentos personalizados
 */
import { useState, useCallback, useMemo } from 'react';
import { X, Plus, Trash2, Music2, Save, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { noteToMidi, midiToNote } from '@/config/instruments';
import type { InstrumentConfig } from '@/config/instruments';
import './InstrumentEditor.css';

// Opciones de iconos disponibles
const ICON_OPTIONS = [
  '🎸',
  '🎵',
  '🎶',
  '🪕',
  '🪘',
  '🎻',
  '🪗',
  '🎺',
  '🎹',
  '🥁',
  '🪈',
  '🎷',
  '🎤',
  '🪇',
  '🔔',
  '✨',
];

// Notas disponibles para selector
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7];

export interface InstrumentEditorProps {
  instrument?: InstrumentConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (instrument: InstrumentConfig) => void;
  onDelete?: (id: string) => void;
}

interface StringConfig {
  id: string;
  note: string;
  octave: number;
}

function generateId(): string {
  return `string_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseNoteString(noteStr: string): { note: string; octave: number } {
  const match = noteStr.match(/^([A-G]#?)(\d+)$/);
  if (!match) return { note: 'E', octave: 4 };
  return { note: match[1], octave: parseInt(match[2]) };
}

export function InstrumentEditor({
  instrument,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: InstrumentEditorProps) {
  // Estado del formulario
  const [name, setName] = useState(instrument?.nameEs || '');
  const [icon, setIcon] = useState(instrument?.icon || '🎸');
  const [frets, setFrets] = useState(instrument?.frets || 22);
  const [doubleStrings, setDoubleStrings] = useState(instrument?.doubleStrings || false);
  const [strings, setStrings] = useState<StringConfig[]>(() => {
    if (instrument?.strings) {
      return instrument.strings.map((s) => {
        const parsed = parseNoteString(s);
        return { id: generateId(), ...parsed };
      });
    }
    // Default: guitarra estándar
    return [
      { id: generateId(), note: 'E', octave: 2 },
      { id: generateId(), note: 'A', octave: 2 },
      { id: generateId(), note: 'D', octave: 3 },
      { id: generateId(), note: 'G', octave: 3 },
      { id: generateId(), note: 'B', octave: 3 },
      { id: generateId(), note: 'E', octave: 4 },
    ];
  });

  const [errors, setErrors] = useState<string[]>([]);

  const isEditing = !!instrument;

  // Validar el instrumento
  const validate = useCallback((): string[] => {
    const errs: string[] = [];

    if (!name.trim()) {
      errs.push('El nombre es obligatorio');
    }

    if (strings.length < 1) {
      errs.push('Debe tener al menos una cuerda');
    }

    if (strings.length > 12) {
      errs.push('Máximo 12 cuerdas permitidas');
    }

    if (frets < 1 || frets > 36) {
      errs.push('Los trastes deben estar entre 1 y 36');
    }

    return errs;
  }, [name, strings, frets]);

  // Añadir cuerda
  const addString = useCallback(() => {
    if (strings.length >= 12) return;
    setStrings((prev) => [...prev, { id: generateId(), note: 'E', octave: 4 }]);
  }, [strings.length]);

  // Eliminar cuerda
  const removeString = useCallback((id: string) => {
    setStrings((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Actualizar cuerda
  const updateString = useCallback(
    (id: string, field: 'note' | 'octave', value: string | number) => {
      setStrings((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    },
    []
  );

  // Mover cuerda arriba
  const moveStringUp = useCallback((index: number) => {
    if (index === 0) return;
    setStrings((prev) => {
      const newStrings = [...prev];
      [newStrings[index - 1], newStrings[index]] = [newStrings[index], newStrings[index - 1]];
      return newStrings;
    });
  }, []);

  // Mover cuerda abajo
  const moveStringDown = useCallback(
    (index: number) => {
      if (index >= strings.length - 1) return;
      setStrings((prev) => {
        const newStrings = [...prev];
        [newStrings[index], newStrings[index + 1]] = [newStrings[index + 1], newStrings[index]];
        return newStrings;
      });
    },
    [strings.length]
  );

  // Guardar instrumento
  const handleSave = useCallback(() => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const tuning = strings.map((s) => `${s.note}${s.octave}`);
    const midiNotes = tuning.map(noteToMidi);

    const newInstrument: InstrumentConfig = {
      id: instrument?.id || `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: name,
      nameEs: name,
      strings: tuning,
      midiNotes,
      frets,
      doubleStrings,
      icon,
      description: `Instrumento personalizado: ${tuning.join(', ')}`,
      isCustom: true,
    };

    onSave(newInstrument);
    onClose();
  }, [validate, strings, name, frets, doubleStrings, icon, instrument, onSave, onClose]);

  // Calcular rango MIDI
  const midiRange = useMemo(() => {
    if (strings.length === 0) return { min: 0, max: 0 };
    const midiValues = strings.map((s) => noteToMidi(`${s.note}${s.octave}`));
    return {
      min: Math.min(...midiValues),
      max: Math.max(...midiValues) + frets,
    };
  }, [strings, frets]);

  if (!isOpen) return null;

  return (
    <div className="instrument-editor-overlay" onClick={onClose}>
      <div className="instrument-editor" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="editor-header">
          <h2>{isEditing ? 'Editar Instrumento' : 'Nuevo Instrumento'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="editor-content">
          {/* Errores */}
          {errors.length > 0 && (
            <div className="editor-errors">
              <AlertCircle size={16} />
              <ul>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nombre e Icono */}
          <div className="editor-row">
            <div className="editor-field flex-1">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi Instrumento"
                className="editor-input"
              />
            </div>

            <div className="editor-field">
              <label>Icono</label>
              <div className="icon-selector">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    className={`icon-btn ${icon === ic ? 'active' : ''}`}
                    onClick={() => setIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trastes y cuerdas dobles */}
          <div className="editor-row">
            <div className="editor-field">
              <label>Número de trastes</label>
              <input
                type="number"
                value={frets}
                onChange={(e) => setFrets(parseInt(e.target.value) || 22)}
                min={1}
                max={36}
                className="editor-input small"
              />
            </div>

            <div className="editor-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={doubleStrings}
                  onChange={(e) => setDoubleStrings(e.target.checked)}
                />
                Cuerdas dobles
              </label>
            </div>

            <div className="editor-field">
              <label>Rango MIDI</label>
              <div className="midi-range">
                {midiToNote(midiRange.min)} - {midiToNote(midiRange.max)}
              </div>
            </div>
          </div>

          {/* Cuerdas */}
          <div className="editor-section">
            <div className="section-header">
              <h3>
                <Music2 size={16} />
                Cuerdas ({strings.length})
              </h3>
              <button
                className="add-string-btn"
                onClick={addString}
                disabled={strings.length >= 12}
              >
                <Plus size={14} />
                Añadir cuerda
              </button>
            </div>

            <div className="strings-list">
              {strings.map((string, index) => (
                <div key={string.id} className="string-item">
                  <div className="string-order">
                    <button
                      className="order-btn"
                      onClick={() => moveStringUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <span className="string-number">{index + 1}</span>
                    <button
                      className="order-btn"
                      onClick={() => moveStringDown(index)}
                      disabled={index === strings.length - 1}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="string-note">
                    <select
                      value={string.note}
                      onChange={(e) => updateString(string.id, 'note', e.target.value)}
                      className="note-select"
                    >
                      {NOTES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <select
                      value={string.octave}
                      onChange={(e) => updateString(string.id, 'octave', parseInt(e.target.value))}
                      className="octave-select"
                    >
                      {OCTAVES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="string-preview">
                    MIDI: {noteToMidi(`${string.note}${string.octave}`)}
                  </div>

                  <button
                    className="remove-string-btn"
                    onClick={() => removeString(string.id)}
                    disabled={strings.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="editor-preview">
            <h4>Vista previa</h4>
            <div className="preview-instrument">
              <span className="preview-icon">{icon}</span>
              <span className="preview-name">{name || 'Sin nombre'}</span>
              <span className="preview-tuning">
                {strings.map((s) => `${s.note}${s.octave}`).join(' - ')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="editor-footer">
          {isEditing && onDelete && instrument && (
            <button
              className="delete-btn"
              onClick={() => {
                if (confirm('¿Eliminar este instrumento?')) {
                  onDelete(instrument.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}

          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} />
              {isEditing ? 'Guardar cambios' : 'Crear instrumento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstrumentEditor;
