/**
 * MemoizedTabLine - Optimized tablature line component
 * 
 * @description Extraído del TablatureView para mejor memoización:
 * - Cada línea solo se re-renderiza si sus props cambian
 * - Evita re-renders en cascada cuando cambia el tiempo
 * - Mejora significativa en canciones largas
 */
import { memo, useCallback } from 'react';

// ============================================
// Types
// ============================================

interface TabNote {
  string: number;
  fret: number;
  time: number;
  duration: number;
  midiNote: number;
  noteName: string;
  slotIndex: number;
}

type SlotItem = { type: 'note'; slot: number } | { type: 'pause'; afterSlot: number };

interface MemoizedTabLineProps {
  lineIndex: number;
  lineItems: SlotItem[];
  timeSlots: Map<number, TabNote[]>;
  stringCount: number;
  stringLabels: string[];
  scaledCellWidth: number;
  cellsPerLine: number;
  activeSlotIndex: number;
  barNumber: number;
  lineStartTime: string;
  isPastLine: boolean;
  isCurrentLine: boolean;
  isUpcomingLine: boolean;
  onSeek?: (time: number) => void;
  onCopyLine: (lineIndex: number) => void;
  barLabel: string;
  copyLineTitle: string;
}

// ============================================
// Memoized Note Cell
// ============================================

interface NoteCellProps {
  fret: number;
  isActive: boolean;
  onClick?: () => void;
  scaledCellWidth: number;
}

const NoteCell = memo(function NoteCell({
  fret,
  isActive,
  onClick,
  scaledCellWidth,
}: NoteCellProps) {
  return (
    <span
      className={`tab-note ${isActive ? 'active' : ''}`}
      style={{ width: scaledCellWidth }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {fret}
    </span>
  );
});

const EmptyCell = memo(function EmptyCell({
  scaledCellWidth,
  onClick,
}: {
  scaledCellWidth: number;
  onClick?: () => void;
}) {
  return (
    <span
      className="tab-empty-cell"
      style={{ width: scaledCellWidth }}
      onClick={onClick}
    >
      ─
    </span>
  );
});

const PauseCell = memo(function PauseCell({ scaledCellWidth }: { scaledCellWidth: number }) {
  return (
    <span
      className="tab-pause"
      style={{ width: scaledCellWidth }}
    >
      │
    </span>
  );
});

// ============================================
// Memoized Line Component
// ============================================

export const MemoizedTabLine = memo(function MemoizedTabLine({
  lineIndex,
  lineItems,
  timeSlots,
  stringCount,
  stringLabels,
  scaledCellWidth,
  cellsPerLine,
  activeSlotIndex,
  barNumber,
  lineStartTime,
  isPastLine,
  isCurrentLine,
  isUpcomingLine,
  onSeek,
  onCopyLine,
  barLabel,
  copyLineTitle,
}: MemoizedTabLineProps) {
  const lineClasses = [
    'tab-line',
    isCurrentLine && 'current',
    isPastLine && 'past',
    isUpcomingLine && 'upcoming',
  ].filter(Boolean).join(' ');

  const handleCopy = useCallback(() => {
    onCopyLine(lineIndex);
  }, [lineIndex, onCopyLine]);

  return (
    <div className={lineClasses}>
      <div className="tab-line-header">
        <span className="tab-line-bar" title={`${lineStartTime}s`}>
          {barLabel} {barNumber}
        </span>
        <button
          className="tab-copy-btn"
          onClick={handleCopy}
          title={copyLineTitle}
        >
          📋
        </button>
      </div>
      <div className="tab-grid-line">
        {/* String labels */}
        <div className="tab-labels">
          {stringLabels.map((note, idx) => (
            <div key={idx} className="tab-label">
              {note.replace(/\d/, '')}
            </div>
          ))}
        </div>

        {/* Notes for this line */}
        <div className="tab-notes-line">
          {Array.from({ length: stringCount }, (_, stringIdx) => {
            const stringNum = stringCount - stringIdx;

            return (
              <div key={stringIdx} className="tab-string-row">
                {lineItems.length === 0 ? (
                  <span className="tab-empty">
                    {'─'.repeat(Math.min(40, cellsPerLine))}
                  </span>
                ) : (
                  lineItems.map((item, itemIndex) => {
                    if (item.type === 'pause') {
                      return <PauseCell key={`pause-${itemIndex}`} scaledCellWidth={scaledCellWidth} />;
                    }

                    const slotNotes = timeSlots.get(item.slot) || [];
                    const noteOnThisString = slotNotes.find(n => n.string === stringNum);
                    const isActive = item.slot === activeSlotIndex;
                    const slotTime = slotNotes[0]?.time;

                    if (noteOnThisString) {
                      return (
                        <NoteCell
                          key={`note-${itemIndex}`}
                          fret={noteOnThisString.fret}
                          isActive={isActive}
                          scaledCellWidth={scaledCellWidth}
                          onClick={onSeek && slotTime !== undefined ? () => onSeek(slotTime) : undefined}
                        />
                      );
                    }

                    return (
                      <EmptyCell
                        key={`empty-${itemIndex}`}
                        scaledCellWidth={scaledCellWidth}
                        onClick={onSeek && slotTime !== undefined ? () => onSeek(slotTime) : undefined}
                      />
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  // Only re-render if these critical props change
  return (
    prevProps.lineIndex === nextProps.lineIndex &&
    prevProps.activeSlotIndex === nextProps.activeSlotIndex &&
    prevProps.isCurrentLine === nextProps.isCurrentLine &&
    prevProps.isPastLine === nextProps.isPastLine &&
    prevProps.isUpcomingLine === nextProps.isUpcomingLine &&
    prevProps.lineItems === nextProps.lineItems &&
    prevProps.scaledCellWidth === nextProps.scaledCellWidth &&
    prevProps.stringCount === nextProps.stringCount
  );
});

export default MemoizedTabLine;
