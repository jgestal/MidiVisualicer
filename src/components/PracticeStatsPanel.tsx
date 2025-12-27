/**
 * PracticeStatsPanel - Display practice statistics
 * 
 * @description Shows user's practice progress including:
 * - Today's practice time
 * - Current session time
 * - Practice streak (fire emoji!)
 * - Total practice time
 * 
 * @design Minimal, motivational, fits in header or sidebar
 */
import { memo } from 'react';
import { Flame, Clock, Music, Award } from 'lucide-react';
import './PracticeStatsPanel.css';

// ============================================
// Types
// ============================================

interface PracticeStatsPanelProps {
  /** Today's practice time in minutes */
  todayMinutes: number;
  /** Current session time in minutes */
  sessionMinutes: number;
  /** Current practice streak in days */
  streak: number;
  /** Total practice time in minutes */
  totalMinutes: number;
  /** Number of songs practiced today */
  todaySongs: number;
  /** Format function for time display */
  formatTime: (minutes: number) => string;
  /** Whether to show compact view */
  compact?: boolean;
}

// ============================================
// Sub-Components
// ============================================

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

const StatItem = memo(function StatItem({ icon, label, value, highlight }: StatItemProps) {
  return (
    <div className={`stat-item ${highlight ? 'stat-item--highlight' : ''}`}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
});

// ============================================
// Main Component
// ============================================

export const PracticeStatsPanel = memo(function PracticeStatsPanel({
  todayMinutes,
  sessionMinutes,
  streak,
  totalMinutes,
  todaySongs,
  formatTime,
  compact = false,
}: PracticeStatsPanelProps) {
  if (compact) {
    return (
      <div className="practice-stats practice-stats--compact" role="status" aria-label="Practice statistics">
        {streak > 0 && (
          <div className="stat-badge streak-badge" title={`${streak} day streak!`}>
            <Flame size={14} className="streak-icon" />
            <span>{streak}</span>
          </div>
        )}
        <div className="stat-badge" title={`Session: ${formatTime(sessionMinutes)}`}>
          <Clock size={14} />
          <span>{formatTime(sessionMinutes)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-stats" role="status" aria-label="Practice statistics">
      <h3 className="practice-stats__title">
        📊 Tu progreso
      </h3>

      <div className="practice-stats__grid">
        <StatItem
          icon={<Clock size={18} />}
          label="Hoy"
          value={formatTime(todayMinutes)}
        />

        <StatItem
          icon={<Music size={18} />}
          label="Canciones"
          value={String(todaySongs)}
        />

        {streak > 0 && (
          <StatItem
            icon={<Flame size={18} className="streak-icon" />}
            label="Racha"
            value={`${streak} días`}
            highlight
          />
        )}

        <StatItem
          icon={<Award size={18} />}
          label="Total"
          value={formatTime(totalMinutes)}
        />
      </div>

      {streak > 0 && (
        <div className="practice-stats__motivation">
          {streak >= 7
            ? '🔥 ¡Increíble racha! ¡Sigue así!'
            : streak >= 3
              ? '💪 ¡Vas muy bien! No pierdas el ritmo'
              : '🎸 ¡Buen trabajo! Practica mañana también'}
        </div>
      )}
    </div>
  );
});

export default PracticeStatsPanel;
