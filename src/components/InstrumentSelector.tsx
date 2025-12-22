/**
 * Componente selector de instrumentos para tablatura
 * Permite seleccionar instrumentos predefinidos y añadir personalizados
 */
import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { InstrumentEditor } from '@/features/instruments/components/InstrumentEditor';
import { useAllInstruments, useInstrument, type InstrumentConfig } from '@/features/instruments';

interface InstrumentSelectorProps {
  selectedInstrument: string;
  onSelectInstrument: (instrumentId: string) => void;
}

export function InstrumentSelector({
  selectedInstrument,
  onSelectInstrument,
}: InstrumentSelectorProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<InstrumentConfig | null>(null);

  // Obtener instrumentos del contexto
  const instrumentsMap = useAllInstruments();
  const { addCustomInstrument, deleteCustomInstrument } = useInstrument();

  // Sort instruments: custom first, then predefined
  const sortedInstruments = useMemo(() => {
    const all = Object.values(instrumentsMap);
    const custom = all.filter((i: InstrumentConfig) => i.isCustom);
    const predefined = all.filter((i: InstrumentConfig) => !i.isCustom);
    return [...custom, ...predefined];
  }, [instrumentsMap]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este instrumento personalizado?')) {
      deleteCustomInstrument(id);
      if (selectedInstrument === id) {
        onSelectInstrument('guitar');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, inst: InstrumentConfig) => {
    e.stopPropagation();
    setEditingInstrument(inst);
    setEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingInstrument(null);
    setEditorOpen(true);
  };

  const handleSave = (instrument: InstrumentConfig) => {
    addCustomInstrument(instrument);
    onSelectInstrument(instrument.id);
  };

  return (
    <div className="instrument-selector-wrapper">
      <div className="instrument-grid">
        {/* Custom button FIRST */}
        <button className="btn-add-instrument" onClick={handleCreate}>
          <Plus size={16} />
          <span>+ Crear Instrumento Personalizado</span>
        </button>

        {/* Then list instruments: custom first, then predefined */}
        {sortedInstruments.map((instrument: InstrumentConfig) => (
          <div
            key={instrument.id}
            className={`instrument-item ${selectedInstrument === instrument.id ? 'active' : ''}`}
            onClick={() => onSelectInstrument(instrument.id)}
            title={instrument.description}
          >
            <span className="instrument-icon">{instrument.icon}</span>
            <span className="instrument-name">{instrument.nameEs}</span>

            {/* Acciones para instrumentos personalizados */}
            {instrument.isCustom && (
              <div className="instrument-actions">
                <button
                  className="btn-action btn-edit"
                  onClick={(e) => handleEdit(e, instrument)}
                  title="Editar"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={(e) => handleDelete(e, instrument.id)}
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <InstrumentEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        instrument={editingInstrument}
        onSave={handleSave}
        onDelete={
          editingInstrument
            ? (id) => {
              deleteCustomInstrument(id);
              if (selectedInstrument === id) onSelectInstrument('guitar');
            }
            : undefined
        }
      />

      <style>{`
        .instrument-selector-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .instrument-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .instrument-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .instrument-item:hover {
          background: var(--color-bg-hover);
          border-color: var(--color-border-hover);
        }

        .instrument-item.active {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .instrument-icon {
          font-size: 18px;
        }

        .instrument-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          flex: 1;
        }

        .instrument-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .instrument-item:hover .instrument-actions {
          opacity: 1;
        }

        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-action:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .btn-delete:hover {
          color: var(--color-error);
          background: rgba(239, 68, 68, 0.1);
        }

        .btn-add-instrument {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: transparent;
          border: 1px dashed var(--color-border);
          border-radius: 8px;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
          transition: all 0.2s;
        }

        .btn-add-instrument:hover {
          border-style: solid;
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }
      `}</style>
    </div>
  );
}

export default InstrumentSelector;
