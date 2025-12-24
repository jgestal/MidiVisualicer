/**
 * MIDI Visualizer - Main App Component
 * 
 * Layout:
 * 1. Header - Title bar with controls
 * 2. Toolbar - Transpose and loop controls (toggleable)
 * 3. Piano Roll - Piano visualization (toggleable)
 * 4. Main Area:
 *    - Left Sidebar - File explorer (drawer)
 *    - Central Panel - Tablature / Sheet music with tabs
 *    - Right Sidebar - MIDI tracks (collapsible)
 * 5. Footer - Playback controls
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Music, X, ChevronDown } from 'lucide-react';

// Context hooks
import { useMidi } from './features/library/context/MidiContext';
import { usePlayback } from './features/player/context/PlaybackContext';
import { useTracks } from './features/tracks/context/TracksContext';
import { useInstrument } from './features/instruments/context/InstrumentContext';
import { useI18n } from './shared/context/I18nContext';

// Custom hooks
import { useMetronome } from './hooks/useMetronome';
import { useAppUI } from './hooks/useAppUI';
import { useExport } from './hooks/useExport';
import { useAutoTranspose } from './hooks/useAutoTranspose';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMasterVolume } from './hooks/useMasterVolume';

// Layout components
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Footer } from './components/layout/Footer';
import { BottomTracksPanel } from './components/layout/BottomTracksPanel';
import { MainPanel } from './components/layout/MainPanel';
import './components/layout/layout.css';

// Feature components
import { FileUploader } from './components/FileUploader';
import { InstrumentSelector } from './components/InstrumentSelector';
import { PianoRollView } from './components/PianoRollView';
import { TablatureView } from './components/TablatureView';
import { OSMDNotationView, type OSMDNotationViewRef } from './components/OSMDNotationView';
import { MidiInfoModal } from './components/MidiInfoModal';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';

// Config
import { getAllInstruments } from './config/instruments';

function App() {
  // ===== CONTEXTOS =====
  const { state: midiState, loadMidiFile, clearMidi } = useMidi();
  const {
    state: playbackState,
    play,
    pause,
    stop,
    seekTo,
    setSpeed,
    setLoopStart,
    setLoopEnd,
    toggleLoop,
    clearLoop,
    setTrackVolume,
    setTrackMuted,
    toggleCountIn,
  } = usePlayback();
  const { state: tracksState, toggleMute, resetTracks } = useTracks();
  const { state: instrumentState, selectInstrument, setTranspose } = useInstrument();
  const { t } = useI18n();

  // ===== UI STATE (via custom hook) =====
  const ui = useAppUI();
  const [trackVolumes, setTrackVolumes] = useState<Map<number, number>>(new Map());

  // ===== MASTER VOLUME =====
  const { volume: masterVolume, isMuted: isMasterMuted, setVolume: handleVolumeChange, toggleMute: handleMasterMuteToggle } = useMasterVolume();

  // ===== REF FOR NOTATION EXPORT =====
  const notationViewRef = useRef<OSMDNotationViewRef>(null);

  // ===== METRONOME =====
  const { isMetronomeEnabled, toggleMetronome } = useMetronome({
    bpm: midiState.parsedMidi?.bpm || 120,
    isPlaying: playbackState.isPlaying,
  });

  // ===== DERIVADOS =====
  const parsedMidi = midiState.parsedMidi;
  const isLoading = midiState.isLoading;
  const hasMidi = !!parsedMidi;
  const selectedTrack = tracksState.selectedTrackIndex;
  const mutedTracks = tracksState.mutedTracks;
  const selectedInstrumentId = instrumentState.selectedInstrumentId;
  const transpose = instrumentState.transpose;

  // Notas de la pista seleccionada
  const selectedTrackNotes = useMemo(() => {
    if (!parsedMidi || !parsedMidi.tracks[selectedTrack]) return [];
    return parsedMidi.tracks[selectedTrack].notes;
  }, [parsedMidi, selectedTrack]);

  // Nombre del instrumento seleccionado
  const selectedInstrumentName = useMemo(() => {
    const allInstruments = getAllInstruments();
    const instrument = allInstruments[selectedInstrumentId];
    return instrument?.name || 'Instrumento';
  }, [selectedInstrumentId]);

  // ===== EFECTOS =====

  // Siempre seleccionar la primera pista al cargar un MIDI
  useEffect(() => {
    if (parsedMidi && parsedMidi.tracks.length > 0) {
      resetTracks(0); // Always track 1 (index 0)
    }
  }, [parsedMidi, resetTracks]);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    isPlaying: playbackState.isPlaying,
    currentTime: playbackState.currentTime,
    parsedMidi,
    selectedTrack,
    mutedTracks,
    trackVolumes,
    transpose,
    play,
    pause,
    seekTo,
    setSpeed,
    setTranspose,
    setTrackMuted,
    toggleMute,
  });

  // Auto-transposición (via custom hook)
  const selectedInstrument = useMemo(() => getAllInstruments()[selectedInstrumentId], [selectedInstrumentId]);
  useAutoTranspose({
    notes: selectedTrackNotes,
    instrument: selectedInstrument,
    onTransposeChange: setTranspose,
  });

  // ===== EXPORT (via custom hook) =====
  const { exportTablature, exportTxt, exportPdf, exportMusicXML, exportWord } = useExport({
    parsedMidi,
    selectedTrack,
    selectedInstrumentId,
  });

  // Export sheet music as SVG
  const exportSheetSVG = useCallback(() => {
    notationViewRef.current?.exportToSVG();
  }, []);

  // Sidebar effect removed

  // ===== HANDLERS =====

  const handleFileUpload = useCallback(
    async (file: File) => {
      await loadMidiFile(file);
    },
    [loadMidiFile]
  );

  // FileExplorer handler removed

  const handleToggleMute = useCallback(
    (trackIndex: number) => {
      toggleMute(trackIndex);
    },
    [toggleMute]
  );

  // Handle close - volver a pantalla de carga
  const handleClose = useCallback(() => {
    stop();
    clearMidi();
  }, [stop, clearMidi]);

  // Export handlers now provided by useExport hook above

  // ===== RENDER =====

  return (
    <div className="app-layout">
      {/* HEADER */}
      <Header
        hasMidi={hasMidi}
        fileName={parsedMidi?.name}
        tempo={parsedMidi?.header?.tempos?.[0]?.bpm}
        timeSignature={
          parsedMidi?.timeSignature
            ? `${parsedMidi.timeSignature.numerator}/${parsedMidi.timeSignature.denominator}`
            : undefined
        }
        onClose={handleClose}
        showToolbar={ui.showToolbar}
        onToggleToolbar={ui.toggleToolbar}
        onExportTxt={exportTxt}
        onExportTab={exportTablature}
        onExportPdf={exportPdf}
        onExportMusicXML={exportMusicXML}
        onExportWord={exportWord}
        onExportSheetSVG={exportSheetSVG}
        onShowInfo={ui.openInfoModal}
        onShowAbout={ui.openAboutModal}
        onShowHelp={ui.openHelpModal}
      />

      {/* TOOLBAR (conditional) */}
      {hasMidi && ui.showToolbar && (
        <Toolbar
          instrumentId={selectedInstrumentId}
          notes={selectedTrackNotes}
          transpose={transpose}
          onTransposeChange={setTranspose}
          loopStart={playbackState.loopStart}
          loopEnd={playbackState.loopEnd}
          isLoopEnabled={playbackState.isLoopEnabled}
          duration={parsedMidi?.duration || playbackState.duration}
          currentTime={playbackState.currentTime}
          onSetLoopStart={setLoopStart}
          onSetLoopEnd={setLoopEnd}
          onToggleLoop={toggleLoop}
          onClearLoop={clearLoop}
          selectedInstrumentName={selectedInstrumentName}
          onOpenInstrumentMenu={ui.openInstrumentModal}
          isMetronomeEnabled={isMetronomeEnabled}
          onToggleMetronome={toggleMetronome}
          isCountInEnabled={playbackState.isCountInEnabled}
          onToggleCountIn={toggleCountIn}
        />
      )}

      {/* LEFT SIDEBAR removed */}

      {/* MAIN CONTENT AREA */}
      {hasMidi ? (
        <>
          {/* Piano Roll Section */}
          <div
            className={`piano-roll-section ${!ui.showPianoRoll ? 'collapsed' : ''}`}
            style={{ height: ui.showPianoRoll ? '180px' : 'auto' }}
          >
            {ui.showPianoRoll ? (
              <PianoRollView
                notes={selectedTrackNotes}
                currentTime={playbackState.currentTime}
                duration={parsedMidi?.duration || playbackState.duration}
                isPlaying={playbackState.isPlaying}
                loopStart={playbackState.loopStart}
                loopEnd={playbackState.loopEnd}
                transpose={transpose}
                trackId={selectedTrack}
                onSetLoopStart={setLoopStart}
                onSetLoopEnd={setLoopEnd}
                onSeek={seekTo}
                onToggle={ui.hidePianoRollPanel}
              />
            ) : (
              <button
                className="piano-roll-collapsed-toggle"
                onClick={ui.showPianoRollPanel}
                title="Mostrar Piano Roll"
              >
                <span>
                  🎹 Piano Roll
                  <ChevronDown size={14} />
                </span>
              </button>
            )}
          </div>

          {/* Main Layout: Central Panel + Right Sidebar */}
          <div className="app-layout-content">
            {/* Central Panel with Tabs */}
            <MainPanel activeView={ui.activeView} onViewChange={ui.setActiveView}>
              {ui.activeView === 'tablature' ? (
                <TablatureView
                  notes={selectedTrackNotes}
                  instrumentId={selectedInstrumentId}
                  transpose={transpose}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  onSeek={seekTo}
                />
              ) : (
                <OSMDNotationView
                  ref={notationViewRef}
                  notes={selectedTrackNotes}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  duration={parsedMidi?.duration || playbackState.duration}
                  bpm={parsedMidi?.header?.tempos?.[0]?.bpm || 120}
                  trackName={parsedMidi?.tracks[selectedTrack]?.name}
                  onSeek={seekTo}
                />
              )}
            </MainPanel>
          </div>

          {/* BOTTOM TRACKS PANEL */}
          <BottomTracksPanel
            tracks={parsedMidi.tracks}
            selectedTrack={selectedTrack}
            mutedTracks={mutedTracks}
            trackVolumes={trackVolumes}
            onSelectTrack={(idx) => resetTracks(idx)}
            onToggleMute={(idx) => {
              handleToggleMute(idx);
              const wasMuted = mutedTracks.has(idx);
              setTrackMuted(idx, !wasMuted);
            }}
            onVolumeChange={(idx, vol) => {
              setTrackVolumes(prev => {
                const newMap = new Map(prev);
                newMap.set(idx, vol);
                return newMap;
              });
              setTrackVolume(idx, vol);
            }}
            currentTime={playbackState.currentTime}
            isPlaying={playbackState.isPlaying}
          />

          {/* FOOTER - Player Controls */}
          <Footer
            isPlaying={playbackState.isPlaying}
            currentTime={playbackState.currentTime}
            duration={parsedMidi?.duration || playbackState.duration}
            speed={playbackState.speed}
            disabled={!hasMidi}
            onPlay={() => parsedMidi && play(parsedMidi, mutedTracks, trackVolumes)}
            onPause={pause}
            onStop={stop}
            onSeek={seekTo}
            onSpeedChange={setSpeed}
            volume={masterVolume}
            isMuted={isMasterMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleMasterMuteToggle}
          />
        </>
      ) : (
        /* EMPTY STATE */
        <div className="empty-state">
          <div className="empty-state-icon">
            <Music size={40} />
          </div>
          <h1 className="empty-state-title">{t.startSession}</h1>
          <p className="empty-state-description">
            {t.dragDropHint}
          </p>
          <FileUploader onFileSelect={handleFileUpload} isLoading={isLoading} />
        </div>
      )}

      {/* INSTRUMENT MODAL */}
      {ui.showInstrumentModal && (
        <div
          className="instrument-modal-overlay"
          onClick={ui.closeInstrumentModal}
        >
          <div
            className="instrument-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="instrument-modal-header">
              <h2 className="instrument-modal-title">Seleccionar Instrumento</h2>
              <button
                className="instrument-modal-close"
                onClick={ui.closeInstrumentModal}
              >
                <X size={18} />
              </button>
            </div>
            <div className="instrument-modal-content">
              <InstrumentSelector
                selectedInstrument={selectedInstrumentId}
                onSelectInstrument={(id: string) => {
                  selectInstrument(id);
                  ui.closeInstrumentModal();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MIDI INFO MODAL */}
      {ui.showInfoModal && parsedMidi && (
        <MidiInfoModal
          midi={parsedMidi}
          onClose={ui.closeInfoModal}
        />
      )}

      {/* ABOUT MODAL */}
      {ui.showAboutModal && (
        <AboutModal onClose={ui.closeAboutModal} />
      )}

      {/* HELP MODAL */}
      {ui.showHelpModal && (
        <HelpModal onClose={ui.closeHelpModal} />
      )}
    </div>
  );
}

export default App;
