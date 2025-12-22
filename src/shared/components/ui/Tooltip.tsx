/**
 * Tooltip accesible con animaciones suaves
 */
import { useState, useRef, useCallback, ReactNode } from 'react';
import './Tooltip.css';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip" aria-hidden={!isVisible}>
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
}

/**
 * Keyboard shortcut helper
 */
interface ShortcutBadgeProps {
  keys: string[];
}

export function ShortcutBadge({ keys }: ShortcutBadgeProps) {
  return (
    <span className="shortcut-badge">
      {keys.map((key, i) => (
        <span key={i}>
          <kbd className="shortcut-key">{key}</kbd>
          {i < keys.length - 1 && <span className="shortcut-plus">+</span>}
        </span>
      ))}
    </span>
  );
}

export default Tooltip;
