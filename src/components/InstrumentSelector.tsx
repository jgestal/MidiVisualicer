/**
 * Componente selector de instrumentos para tablatura
 * - Cuadrícula de instrumentos en 3 columnas
 * - Personalizados con color distinto, antes que predefinidos
 * - Plantilla dentro del editor de instrumento
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

  // Separar custom y predefinidos
  const { customInstruments, predefinedInstruments } = useMemo(() => {
    const all = Object.values(instrumentsMap);
    return {
      customInstruments: all.filter((i: InstrumentConfig) => i.isCustom),
      predefinedInstruments: all.filter((i: InstrumentConfig) => !i.isCustom),
    };
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

  const handleCreateFromTemplate = (template: InstrumentConfig | null) => {
    if (template) {
      // Crear copia con nuevo ID
      const newInstrument: InstrumentConfig = {
        ...template,
        id: `custom_${Date.now()}`,
        name: `${template.name} (Copia)`,
        nameEs: `${template.nameEs} (Copia)`,
        isCustom: true,
      };
      setEditingInstrument(newInstrument);
    } else {
      setEditingInstrument(null);
    }
    setEditorOpen(true);
  };

  const handleSave = (instrument: InstrumentConfig) => {
    addCustomInstrument(instrument);
    onSelectInstrument(instrument.id);
  };

  const renderInstrumentCard = (instrument: InstrumentConfig, isCustom: boolean) => (
    <div
      key={instrument.id}
      className={`instrument-card ${selectedInstrument === instrument.id ? 'active' : ''} ${isCustom ? 'custom' : ''}`}
      onClick={() => onSelectInstrument(instrument.id)}
      title={instrument.description}
    >
      <span className="instrument-icon">{instrument.icon}</span>
      <span className="instrument-name">{instrument.nameEs}</span>

      {/* Badge para personalizados */}
      {isCustom && <span className="custom-badge">✨</span>}

      {/* Acciones para instrumentos personalizados */}
      {isCustom && (
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
  );

  return (
    <div className="instrument-selector-wrapper">
      {/* CREATE BUTTON - Opens editor directly */}
      <div className="create-section">
        <button className="btn-create" onClick={() => handleCreateFromTemplate(null)}>
          <Plus size={16} />
          <span>Crear Instrumento Personalizado</span>
        </button>
      </div>

      {/* CUSTOM INSTRUMENTS */}
      {customInstruments.length > 0 && (
        <div className="instruments-section">
          <div className="section-title custom-title">
            <span>✨ Mis Instrumentos</span>
            <span className="section-count">{customInstruments.length}</span>
          </div>
          <div className="instrument-grid">
            {customInstruments.map((inst) => renderInstrumentCard(inst, true))}
          </div>
        </div>
      )}

      {/* PREDEFINED INSTRUMENTS */}
      <div className="instruments-section">
        <div className="section-title">
          <span>🎵 Instrumentos Predefinidos</span>
          <span className="section-count">{predefinedInstruments.length}</span>
        </div>
        <div className="instrument-grid">
          {predefinedInstruments.map((inst) => renderInstrumentCard(inst, false))}
        </div>
      </div>

      <InstrumentEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        instrument={editingInstrument}
        onSave={handleSave}
        onDelete={
          editingInstrument?.isCustom
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
          gap: 16px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .create-section {
          position: relative;
        }

        .btn-create {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border: 2px dashed rgba(16, 185, 129, 0.5);
          border-radius: 10px;
          color: #10b981;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-create:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
          border-style: solid;
        }

        .template-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .template-menu-header {
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-text-muted);
          background: var(--color-bg-tertiary);
        }

        .template-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }

        .template-option:hover {
          background: var(--color-bg-hover);
        }

        .template-divider {
          height: 1px;
          background: var(--color-border);
        }

        .template-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .instruments-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          padding: 0 4px;
        }

        .section-title.custom-title {
          color: #10b981;
        }

        .section-count {
          background: var(--color-bg-tertiary);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
        }

        .instrument-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .instrument-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-align: center;
        }

        .instrument-card:hover {
          background: var(--color-bg-hover);
          transform: translateY(-1px);
        }

        .instrument-card.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
        }

        .instrument-card.custom {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .instrument-card.custom:hover {
          background: rgba(16, 185, 129, 0.15);
        }

        .instrument-card.custom.active {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .custom-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 10px;
        }

        .instrument-icon {
          font-size: 24px;
        }

        .instrument-name {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .instrument-actions {
          position: absolute;
          top: 4px;
          left: 4px;
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .instrument-card:hover .instrument-actions {
          opacity: 1;
        }

        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-action:hover {
          background: rgba(0, 0, 0, 0.5);
        }

        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.8);
        }
      `}</style>
    </div>
  );
}

export default InstrumentSelector;

