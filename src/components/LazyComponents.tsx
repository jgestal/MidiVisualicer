/**
 * Lazy-loaded components for better initial load performance
 * 
 * @description Uses React.lazy to code-split heavy components:
 * - Modals (not needed on initial render)
 * - Heavy visualization components (can load after main UI)
 * - Settings panels
 * 
 * @performance
 * - Reduces initial bundle size
 * - Components load on-demand
 * - Suspense fallback for loading states
 */
import { lazy, Suspense, ComponentType } from 'react';

// ============================================
// Loading Fallback
// ============================================

interface LoadingFallbackProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingFallback({ size = 'medium', message }: LoadingFallbackProps) {
  const sizes = {
    small: { padding: '8px', fontSize: '12px' },
    medium: { padding: '16px', fontSize: '14px' },
    large: { padding: '32px', fontSize: '16px' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sizes[size],
        color: 'var(--color-text-muted)',
      }}
    >
      <span style={{ marginRight: '8px' }}>⏳</span>
      {message || 'Cargando...'}
    </div>
  );
}

// ============================================
// Lazy Components - Modals
// ============================================

/** About modal - rarely used */
export const LazyAboutModal = lazy(() =>
  import('./AboutModal').then(m => ({ default: m.AboutModal }))
);

/** Help modal - rarely used */
export const LazyHelpModal = lazy(() =>
  import('./HelpModal').then(m => ({ default: m.default }))
);

/** Keyboard shortcuts modal */
export const LazyKeyboardShortcutsModal = lazy(() =>
  import('./KeyboardShortcutsModal').then(m => ({ default: m.default }))
);

/** MIDI info modal */
export const LazyMidiInfoModal = lazy(() =>
  import('./MidiInfoModal').then(m => ({ default: m.default }))
);

/** Speed trainer modal */
export const LazySpeedTrainerModal = lazy(() =>
  import('./SpeedTrainerModal').then(m => ({ default: m.default }))
);

// ============================================
// Lazy Components - Heavy Visualizations
// ============================================

/** OSMD Notation View - loads vexflow library */
export const LazyOSMDNotationView = lazy(() =>
  import('./OSMDNotationView').then(m => ({ default: m.default }))
);

/** Bookmarks panel - new feature */
export const LazyBookmarksPanel = lazy(() =>
  import('./BookmarksPanel').then(m => ({ default: m.default }))
);

/** Practice stats panel - new feature */
export const LazyPracticeStatsPanel = lazy(() =>
  import('./PracticeStatsPanel').then(m => ({ default: m.PracticeStatsPanel }))
);

// ============================================
// Wrapper with Suspense
// ============================================

interface WithSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps lazy components with Suspense boundary
 */
export function WithSuspense({ children, fallback }: WithSuspenseProps) {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  );
}

/**
 * HOC to wrap any lazy component with Suspense
 */
export function withLazySuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyWithSuspense(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================
// Preload Functions (for anticipated loading)
// ============================================

/**
 * Preload a lazy component before it's needed
 * Call this when user hovers over a button that will open a modal
 */
export const preloadAboutModal = () => import('./AboutModal');
export const preloadHelpModal = () => import('./HelpModal');
export const preloadKeyboardShortcutsModal = () => import('./KeyboardShortcutsModal');
export const preloadMidiInfoModal = () => import('./MidiInfoModal');
export const preloadSpeedTrainerModal = () => import('./SpeedTrainerModal');
export const preloadOSMDNotationView = () => import('./OSMDNotationView');
