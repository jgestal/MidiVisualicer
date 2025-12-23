/**
 * MIDI Visualizer - App Principal (Refactorizado)
 * 
 * Layout:
 * 1. Header - Barra de título con controles
 * 2. Toolbar - Controles de transponer y loop (toggleable)
 * 3. Piano Roll - Visualización del piano (toggleable)
 * 4. Main Area:
 *    - Left Sidebar - Explorador de archivos (drawer)
 *    - Central Panel - Tablatura / Partitura con tabs
 *    - Right Sidebar - Pistas del MIDI (colapsable)
 * 5. Footer - Controles de reproducción
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Music, X, ChevronDown } from 'lucide-react';

// Context hooks
import { useMidi } from './features/library/context/MidiContext';
import { usePlayback } from './features/player/context/PlaybackContext';
import { useTracks } from './features/tracks/context/TracksContext';
import { useInstrument } from './features/instruments/context/InstrumentContext';
import { useI18n } from './shared/context/I18nContext';

// Layout components
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Footer } from './components/layout/Footer';
import { BottomTracksPanel } from './components/layout/BottomTracksPanel';
import { MainPanel } from './components/layout/MainPanel';
import './components/layout/layout.css';

// Feature components
import { FileUploader } from './components/FileUploader';
// FileExplorer removed as requested
import { InstrumentSelector } from './components/InstrumentSelector';
import { PianoRollView } from './components/PianoRollView';
import { TablatureView } from './components/TablatureView';
import { NotationView } from './components/NotationView';
import { MidiInfoModal } from './components/MidiInfoModal';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';

// Utils y config
import { generateCifrado, generateTablatureText, downloadAsTextFile } from './utils/export';
import { getAllInstruments } from './config/instruments';
import { useMetronome } from './hooks/useMetronome';

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
  } = usePlayback();
  const { state: tracksState, toggleMute, resetTracks } = useTracks();
  const { state: instrumentState, selectInstrument, setTranspose } = useInstrument();
  const { t } = useI18n();

  // ===== ESTADO LOCAL (UI) =====
  const [showToolbar, setShowToolbar] = useState(true);
  const [showPianoRoll, setShowPianoRoll] = useState(true);
  const [activeView, setActiveView] = useState<'tablature' | 'notation'>('tablature');
  // Sidebar state removed
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState<Map<number, number>>(new Map());

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
      resetTracks(0); // Siempre pista 1 (índice 0)
    }
  }, [parsedMidi, resetTracks]);

  // Auto-transposición
  useEffect(() => {
    if (selectedTrackNotes.length === 0) return;
    const allInstruments = getAllInstruments();
    const instrument = allInstruments[selectedInstrumentId];
    if (!instrument) return;

    const midiNotes = selectedTrackNotes.map((n) => n.midi);
    const minNote = Math.min(...midiNotes);
    const maxNote = Math.max(...midiNotes);

    if (!isFinite(minNote)) return;

    const noteCenter = (minNote + maxNote) / 2;
    const instMin = Math.min(...instrument.midiNotes);
    const instMax = Math.max(...instrument.midiNotes) + (instrument.frets || 20);
    const instCenter = (instMin + instMax) / 2;

    const suggestedTranspose = Math.round((instCenter - noteCenter) / 12) * 12;
    setTranspose(suggestedTranspose);
  }, [selectedTrackNotes, selectedInstrumentId, setTranspose]);

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

  const handleExportTablature = useCallback(() => {
    if (!parsedMidi) return;

    const track = parsedMidi.tracks[selectedTrack];
    const tablature = generateTablatureText(track, selectedInstrumentId);
    downloadAsTextFile(tablature, `${parsedMidi.name || 'midi'}_tablatura.tab`);
  }, [parsedMidi, selectedTrack, selectedInstrumentId]);

  const handleExportTxt = useCallback(() => {
    if (!parsedMidi) return;
    const cifrado = generateCifrado(parsedMidi, selectedTrack);
    downloadAsTextFile(cifrado, `${parsedMidi.name || 'midi'}.txt`);
  }, [parsedMidi, selectedTrack]);

  const handleExportPdf = useCallback(() => {
    if (!parsedMidi) return;
    // Usar la API de impresión del navegador para generar PDF
    const track = parsedMidi.tracks[selectedTrack];
    const tablature = generateTablatureText(track, selectedInstrumentId);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>${parsedMidi.name || 'Tablatura'}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${tablature}</pre>
          <script>window.print(); window.close();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, [parsedMidi, selectedTrack, selectedInstrumentId]);

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
        showToolbar={showToolbar}
        onToggleToolbar={() => setShowToolbar(!showToolbar)}
        onExportTxt={handleExportTxt}
        onExportTab={handleExportTablature}
        onExportPdf={handleExportPdf}
        onShowInfo={() => setShowInfoModal(true)}
        onShowAbout={() => setShowAboutModal(true)}
        onShowHelp={() => setShowHelpModal(true)}
      />

      {/* TOOLBAR (conditional) */}
      {hasMidi && showToolbar && (
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
          onOpenInstrumentMenu={() => setShowInstrumentModal(true)}
          isMetronomeEnabled={isMetronomeEnabled}
          onToggleMetronome={toggleMetronome}
        />
      )}

      {/* LEFT SIDEBAR removed */}

      {/* MAIN CONTENT AREA */}
      {hasMidi ? (
        <>
          {/* Piano Roll Section */}
          <div
            className={`piano-roll-section ${!showPianoRoll ? 'collapsed' : ''}`}
            style={{ height: showPianoRoll ? '180px' : 'auto' }}
          >
            {showPianoRoll ? (
              <PianoRollView
                notes={selectedTrackNotes}
                currentTime={playbackState.currentTime}
                duration={parsedMidi?.duration || playbackState.duration}
                isPlaying={playbackState.isPlaying}
                loopStart={playbackState.loopStart}
                loopEnd={playbackState.loopEnd}
                onSetLoopStart={setLoopStart}
                onSetLoopEnd={setLoopEnd}
                onSeek={seekTo}
                onToggle={() => setShowPianoRoll(false)}
              />
            ) : (
              <button
                className="piano-roll-collapsed-toggle"
                onClick={() => setShowPianoRoll(true)}
                title="Mostrar Piano Roll"
              >
                <span>🎹 Piano Roll</span>
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          {/* Main Layout: Central Panel + Right Sidebar */}
          <div className="app-layout-content">
            {/* Central Panel with Tabs */}
            <MainPanel activeView={activeView} onViewChange={setActiveView}>
              {activeView === 'tablature' ? (
                <TablatureView
                  notes={selectedTrackNotes}
                  instrumentId={selectedInstrumentId}
                  transpose={transpose}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  onSeek={seekTo}
                />
              ) : (
                <NotationView
                  notes={selectedTrackNotes}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  bpm={parsedMidi?.header?.tempos?.[0]?.bpm || 120}
                  timeSignature={{ numerator: 4, denominator: 4 }}
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
      {showInstrumentModal && (
        <div
          className="instrument-modal-overlay"
          onClick={() => setShowInstrumentModal(false)}
        >
          <div
            className="instrument-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="instrument-modal-header">
              <h2 className="instrument-modal-title">Seleccionar Instrumento</h2>
              <button
                className="instrument-modal-close"
                onClick={() => setShowInstrumentModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="instrument-modal-content">
              <InstrumentSelector
                selectedInstrument={selectedInstrumentId}
                onSelectInstrument={(id: string) => {
                  selectInstrument(id);
                  setShowInstrumentModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MIDI INFO MODAL */}
      {showInfoModal && parsedMidi && (
        <MidiInfoModal
          midi={parsedMidi}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}

export default App;
