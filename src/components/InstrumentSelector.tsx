/**
 * Componente selector de instrumentos para tablatura
 * Permite seleccionar instrumentos predefinidos y añadir personalizados
 */
import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import {
  getAllInstruments,
  saveCustomInstrument,
  deleteCustomInstrument,
  createInstrumentFromTuning,
  type InstrumentConfig
} from '../config/instruments';

interface InstrumentSelectorProps {
  selectedInstrument: string;
  onSelectInstrument: (instrumentId: string) => void;
}

export function InstrumentSelector({
  selectedInstrument,
  onSelectInstrument
}: InstrumentSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTuning, setNewTuning] = useState('E2,A2,D3,G3,B3,E4');
  const [newFrets, setNewFrets] = useState(20);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Lista de instrumentos (incluye personalizados)
  const instrumentsMap = useMemo(() => getAllInstruments(), [refreshTrigger, selectedInstrument]);
  const instruments = Object.values(instrumentsMap);

  const handleAddCustom = () => {
    if (!newName) return;

    try {
      const tuningArray = newTuning.split(',').map(s => s.trim());
      const newInst = createInstrumentFromTuning(newName, tuningArray, newFrets);
      saveCustomInstrument(newInst);

      // Limpiar y cerrar
      setNewName('');
      setShowAddForm(false);
      setRefreshTrigger(prev => prev + 1);
      onSelectInstrument(newInst.id);
    } catch (e) {
      alert('Error en el formato de afinación. Usa: E2, A2, D3...');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este instrumento personalizado?')) {
      deleteCustomInstrument(id);
      if (selectedInstrument === id) {
        onSelectInstrument('guitar');
      }
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="instrument-selector-wrapper">
      <div className="instrument-grid">
        {instruments.map((instrument: InstrumentConfig) => (
          <div
            key={instrument.id}
            className={`instrument-item ${selectedInstrument === instrument.id ? 'active' : ''}`}
            onClick={() => onSelectInstrument(instrument.id)}
            title={instrument.description}
          >
            <span className="instrument-icon">{instrument.icon}</span>
            <span className="instrument-name">{instrument.nameEs}</span>

            {instrument.isCustom && (
              <button
                className="btn-delete-inst"
                onClick={(e) => handleDelete(e, instrument.id)}
                title="Eliminar"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        <button
          className="btn-add-instrument"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
          <span>Personalizado</span>
        </button>
      </div>

      {showAddForm && (
        <div className="custom-inst-form">
          <div className="form-header">
            <h4>Nuevo Instrumento</h4>
            <button onClick={() => setShowAddForm(false)} className="btn-close">
              <X size={14} />
            </button>
          </div>

          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Ej: Mi Bajo"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Afinación (grave a agudo)</label>
            <input
              type="text"
              placeholder="E2, A2, D3..."
              value={newTuning}
              onChange={e => setNewTuning(e.target.value)}
            />
            <small>Usa comas para separar las cuerdas</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Trastes</label>
              <input
                type="number"
                value={newFrets}
                onChange={e => setNewFrets(parseInt(e.target.value))}
              />
            </div>
            <button className="btn-save" onClick={handleAddCustom}>
              <Check size={16} />
              Guardar
            </button>
          </div>
        </div>
      )}

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
          border-color: var(--color-accent-primary);
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
        }

        .btn-delete-inst {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .instrument-item:hover .btn-delete-inst {
          opacity: 1;
        }

        .btn-delete-inst:hover {
          color: var(--color-error);
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
        }

        .btn-add-instrument:hover {
          border-style: solid;
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        /* Formulario */
        .custom-inst-form {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-accent-primary);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .form-header h4 {
          margin: 0;
          font-size: 14px;
          color: var(--color-accent-primary);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .form-group label {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: white;
          padding: 8px 10px;
          font-size: 13px;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
        }

        .form-group small {
          font-size: 10px;
          color: var(--color-text-muted);
        }

        .form-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          padding: 8px 16px;
          background: var(--color-accent-primary);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save:hover {
          filter: brightness(1.1);
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default InstrumentSelector;
