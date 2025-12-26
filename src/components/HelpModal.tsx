/**
 * HelpModal - Modal showing user manual content based on selected language
 */
import { X } from 'lucide-react';
import { useI18n } from '@/shared/context/I18nContext';
import { MANUALS } from '@/data/manuals';
import './HelpModal.css';

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    const { language } = useI18n();
    const manual = MANUALS[language] || MANUALS.en;

    return (
        <div className="help-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-header">
                    <h2>{manual.title}</h2>
                    <button className="help-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="help-content">
                    {manual.sections.map((section, index) => (
                        <div key={index} className="help-section">
                            <h3>{section.heading}</h3>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HelpModal;
