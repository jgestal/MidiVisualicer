/**
 * AboutModal - Modal showing developer and application information
 */
import { X } from 'lucide-react';
import { useI18n } from '@/shared/context/I18nContext';
import './AboutModal.css';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useI18n();

  return (
    <div className="about-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2>{t.about} Midi Tab Pro</h2>
          <button className="about-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="about-content">
          <div className="about-logo">
            <span className="about-logo-icon">🎸</span>
            <span className="about-logo-text">Midi Tab Pro</span>
          </div>

          <div className="about-info-grid">
            <div className="about-info-item">
              <span className="about-label">{t.version}</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-info-item">
              <span className="about-label">{t.developer}</span>
              <span className="about-value">Your Name Here</span>
            </div>
            <div className="about-info-item">
              <span className="about-label">{t.contact}</span>
              <span className="about-value">email@example.com</span>
            </div>
            <div className="about-info-item">
              <span className="about-label">{t.website}</span>
              <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="about-link">
                example.com
              </a>
            </div>
            <div className="about-info-item">
              <span className="about-label">{t.license}</span>
              <span className="about-value">MIT License</span>
            </div>
          </div>

          <div className="about-description">
            <p>
              Midi Tab Pro is a powerful MIDI visualization and tablature generation tool.
              Load your MIDI files and instantly see the notes displayed as tablature
              for guitar, bass, ukulele, and many other stringed instruments.
            </p>
          </div>

          <div className="about-footer">
            <span>© 2024 Midi Tab Pro. All rights reserved.</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AboutModal;
