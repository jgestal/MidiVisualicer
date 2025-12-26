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
import ConfirmModal from './ConfirmModal';
import './InstrumentSelector.css';

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
  const [showConfirmDelete, setShowConfirmDelete] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: '',
  });

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
    setShowConfirmDelete({ isOpen: true, id });
  };

  const confirmDelete = () => {
    const id = showConfirmDelete.id;
    deleteCustomInstrument(id);
    if (selectedInstrument === id) {
      onSelectInstrument('guitar');
    }
    setShowConfirmDelete({ isOpen: false, id: '' });
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

      {/* Actions para instrumentos personalizados */}
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
              setShowConfirmDelete({ isOpen: true, id });
            }
            : undefined
        }
      />

      <ConfirmModal
        isOpen={showConfirmDelete.isOpen}
        onClose={() => setShowConfirmDelete({ ...showConfirmDelete, isOpen: false })}
        onConfirm={confirmDelete}
        title="Eliminar instrumento"
        message="¿Estás seguro de que deseas eliminar este instrumento personalizado? Se perderán todas sus configuraciones."
        preventClose={true}
      />

    </div>
  );
}

export default InstrumentSelector;

