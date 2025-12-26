/**
 * ConfirmModal - Componente de diálogo de confirmación personalizado
 */
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { useI18n } from '../shared/context/I18nContext';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    preventClose?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    preventClose = false,
}: ConfirmModalProps) {
    const { t } = useI18n();

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (!preventClose) {
            onClose();
        }
    };

    return createPortal(
        <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <h3>
                        <AlertCircle size={20} className="confirm-header-icon" />
                        {title || t.confirm || 'Confirmar'}
                    </h3>
                    {!preventClose && (
                        <button className="confirm-close-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="confirm-body">
                    <p>{message}</p>
                </div>

                <div className="confirm-footer">
                    <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>
                        {cancelText || t.cancel || 'Cancelar'}
                    </button>
                    <button
                        className="confirm-btn confirm-btn-confirm"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText || t.confirm || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmModal;
