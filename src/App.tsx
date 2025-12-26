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
import { Music } from 'lucide-react';

// Context hooks
import { useMidi } from './shared/context/MidiContext';
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
import { useTablatureZoom } from './hooks/useTablatureZoom';

// Layout components
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Footer } from './components/layout/Footer';
import { BottomTracksPanel } from './components/layout/BottomTracksPanel';
import { MainPanel } from './components/layout/MainPanel';
import { PianoRollCollapsible } from './components/layout/PianoRollCollapsible';
import { ModalManager } from './components/layout/ModalManager';
import './components/layout/layout.css';

// Feature components
import { FileUploader } from './components/FileUploader';
import { TablatureView } from './components/TablatureView';
import { OSMDNotationView, type OSMDNotationViewRef } from './components/OSMDNotationView';

// Config
import { getAllInstruments } from './config/instruments';

// Utils
import { simplifyNotes } from './utils/simplifyNotes';

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
    toggleCountIn,
  } = usePlayback();
  const { state: tracksState, resetTracks } = useTracks();
  const { state: instrumentState, selectInstrument, setTranspose, toggleAutoTranspose } = useInstrument();
  const { t } = useI18n();

  // ===== UI STATE (via custom hook) =====
  const ui = useAppUI();

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
  const trackVolumes = playbackState.trackVolumes;

  // ===== SIMPLIFY STATE =====
  const [isSimplified, setIsSimplified] = useState(false);

  // ===== TABLATURE ZOOM =====
  const { zoom, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut } = useTablatureZoom();

  // Notas de la pista seleccionada
  const selectedTrackNotes = useMemo(() => {
    if (!parsedMidi || !parsedMidi.tracks[selectedTrack]) return [];
    return parsedMidi.tracks[selectedTrack].notes;
  }, [parsedMidi, selectedTrack]);

  // Notas simplificadas (si está activado)
  const notesToDisplay = useMemo(() => {
    if (!isSimplified) return selectedTrackNotes;

    const allInstruments = getAllInstruments();
    const instrument = allInstruments[selectedInstrumentId];
    return simplifyNotes(selectedTrackNotes, instrument);
  }, [selectedTrackNotes, isSimplified, selectedInstrumentId]);

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
  useKeyboardShortcuts();

  // Auto-transposición (via custom hook)
  const selectedInstrument = useMemo(() => getAllInstruments()[selectedInstrumentId], [selectedInstrumentId]);
  useAutoTranspose({
    notes: selectedTrackNotes,
    instrument: selectedInstrument,
    onTransposeChange: setTranspose,
    enabled: instrumentState.autoTranspose,
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

  // ===== HANDLERS =====

  const handleFileUpload = useCallback(
    async (file: File) => {
      await loadMidiFile(file);
    },
    [loadMidiFile]
  );

  // Handle close - volver a pantalla de carga
  const handleClose = useCallback(() => {
    stop();
    clearMidi();
  }, [stop, clearMidi]);

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
          isAutoTransposeEnabled={instrumentState.autoTranspose}
          onToggleAutoTranspose={toggleAutoTranspose}
        />
      )}

      {/* MAIN CONTENT AREA */}
      {hasMidi ? (
        <>
          {/* Piano Roll Section */}
          <PianoRollCollapsible
            showPianoRoll={ui.showPianoRoll}
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
            onShow={ui.showPianoRollPanel}
            onHide={ui.hidePianoRollPanel}
          />

          {/* Main Layout: Central Panel + Right Sidebar */}
          <div className="app-layout-content">
            {/* Central Panel with Tabs */}
            <MainPanel
              activeView={ui.activeView}
              onViewChange={ui.setActiveView}
              isSimplified={isSimplified}
              onToggleSimplify={() => setIsSimplified(!isSimplified)}
              hasNotes={notesToDisplay.length > 0}
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
              notes={notesToDisplay}
              currentTime={playbackState.currentTime}
            >
              {ui.activeView === 'tablature' ? (
                <TablatureView
                  notes={notesToDisplay}
                  instrumentId={selectedInstrumentId}
                  transpose={transpose}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  onSeek={seekTo}
                  zoom={zoom}
                  bpm={parsedMidi?.bpm || 120}
                  timeSignature={parsedMidi?.timeSignature || { numerator: 4, denominator: 4 }}
                />
              ) : (
                <OSMDNotationView
                  ref={notationViewRef}
                  notes={notesToDisplay}
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
          <BottomTracksPanel />

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

      {/* MODALS */}
      <ModalManager
        ui={ui}
        parsedMidi={parsedMidi}
        selectedInstrumentId={selectedInstrumentId}
        selectInstrument={selectInstrument}
      />
    </div>
  );
}

export default App;
