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
import { Music, FolderOpen, X } from 'lucide-react';

// Context hooks
import { useMidi } from './features/library/context/MidiContext';
import { usePlayback } from './features/player/context/PlaybackContext';
import { useTracks } from './features/tracks/context/TracksContext';
import { useInstrument } from './features/instruments/context/InstrumentContext';

// Layout components
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Footer } from './components/layout/Footer';
import { RightSidebar } from './components/layout/RightSidebar';
import { MainPanel } from './components/layout/MainPanel';
import './components/layout/layout.css';

// Feature components
import { FileUploader } from './components/FileUploader';
import { FileExplorer } from './components/FileExplorer';
import { InstrumentSelector } from './components/InstrumentSelector';
import { PianoRollView } from './components/PianoRollView';
import { TablatureView } from './components/TablatureView';
import { NotationView } from './components/NotationView';

// Utils y config
import { generateCifrado, generateTablatureText, downloadAsTextFile } from './utils/export';
import { getAllInstruments } from './config/instruments';
import { detectMelodyTrack } from './features/tracks/context/TracksContext';
import type { MidiFile } from './types/midi';

function App() {
  // ===== CONTEXTOS =====
  const { state: midiState, loadMidiFile, loadMidiFromUrl } = useMidi();
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

  // ===== ESTADO LOCAL (UI) =====
  const [showToolbar, setShowToolbar] = useState(true);
  const [showPianoRoll, setShowPianoRoll] = useState(true);
  const [activeView, setActiveView] = useState<'tablature' | 'notation'>('tablature');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState<Map<number, number>>(new Map());

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

  // Auto-seleccionar pista de melodía
  useEffect(() => {
    if (parsedMidi && parsedMidi.tracks.length > 0) {
      const melodyIndex = detectMelodyTrack(parsedMidi.tracks);
      resetTracks(melodyIndex);
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

    setTranspose(Math.round((instCenter - noteCenter) / 12) * 12);
  }, [selectedTrack, selectedInstrumentId, selectedTrackNotes, setTranspose]);

  // Cerrar sidebar izquierdo al cargar MIDI
  useEffect(() => {
    if (parsedMidi) {
      setIsLeftSidebarOpen(false);
    }
  }, [parsedMidi]);

  // ===== HANDLERS =====

  const handleFileUpload = useCallback(
    async (file: File) => {
      await loadMidiFile(file);
    },
    [loadMidiFile]
  );

  const handleFileFromExplorer = useCallback(
    async (midiFile: MidiFile) => {
      await loadMidiFromUrl(midiFile.path);
      setIsLeftSidebarOpen(false);
    },
    [loadMidiFromUrl]
  );

  const handleToggleMute = useCallback(
    (trackIndex: number) => {
      toggleMute(trackIndex);
    },
    [toggleMute]
  );

  const handleExportCifrado = useCallback(() => {
    if (!parsedMidi) return;

    const cifrado = generateCifrado(parsedMidi, selectedTrack);
    downloadAsTextFile(cifrado, `${parsedMidi.name || 'midi'}_cifrado.txt`);
  }, [parsedMidi, selectedTrack]);

  const handleExportTablature = useCallback(() => {
    if (!parsedMidi) return;

    const track = parsedMidi.tracks[selectedTrack];
    const tablature = generateTablatureText(track, selectedInstrumentId);
    downloadAsTextFile(tablature, `${parsedMidi.name || 'midi'}_tablatura.txt`);
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
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        selectedInstrumentName={selectedInstrumentName}
        onOpenInstrumentMenu={() => setShowInstrumentModal(true)}
        showToolbar={showToolbar}
        onToggleToolbar={() => setShowToolbar(!showToolbar)}
        showPianoRoll={showPianoRoll}
        onTogglePianoRoll={() => setShowPianoRoll(!showPianoRoll)}
        onExportCifrado={handleExportCifrado}
        onExportTablature={handleExportTablature}
        onOpenFile={() => document.getElementById('midi-file-input')?.click()}
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
          duration={playbackState.duration}
          currentTime={playbackState.currentTime}
          onSetLoopStart={setLoopStart}
          onSetLoopEnd={setLoopEnd}
          onToggleLoop={toggleLoop}
          onClearLoop={clearLoop}
        />
      )}

      {/* LEFT SIDEBAR (drawer overlay) */}
      <div
        className={`left-sidebar-overlay ${isLeftSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsLeftSidebarOpen(false)}
      />
      <aside className={`left-sidebar ${isLeftSidebarOpen ? 'open' : ''}`}>
        <div className="left-sidebar-header">
          <div className="left-sidebar-title">
            <FolderOpen size={14} />
            <span>Explorador</span>
          </div>
          <button
            className="left-sidebar-close"
            onClick={() => setIsLeftSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
        <div className="left-sidebar-content">
          <FileExplorer selectedFile={null} onSelectFile={handleFileFromExplorer} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {hasMidi ? (
        <>
          {/* Piano Roll Section */}
          <div
            className={`piano-roll-section ${!showPianoRoll ? 'collapsed' : ''}`}
            style={{ height: showPianoRoll ? '180px' : '0' }}
          >
            {showPianoRoll && (
              <PianoRollView
                notes={selectedTrackNotes}
                currentTime={playbackState.currentTime}
                duration={playbackState.duration}
                isPlaying={playbackState.isPlaying}
                loopStart={playbackState.loopStart}
                loopEnd={playbackState.loopEnd}
                onSetLoopStart={setLoopStart}
                onSetLoopEnd={setLoopEnd}
                onSeek={seekTo}
              />
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
                />
              ) : (
                <NotationView
                  notes={selectedTrackNotes}
                  currentTime={playbackState.currentTime}
                  isPlaying={playbackState.isPlaying}
                  bpm={parsedMidi?.header?.tempos?.[0]?.bpm || 120}
                  timeSignature={{ numerator: 4, denominator: 4 }}
                />
              )}
            </MainPanel>

            {/* Right Sidebar - Track List */}
            <RightSidebar
              isOpen={isRightSidebarOpen}
              onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              tracks={parsedMidi.tracks}
              selectedTrack={selectedTrack}
              mutedTracks={mutedTracks}
              trackVolumes={trackVolumes}
              onSelectTrack={(idx) => resetTracks(idx)}
              onToggleMute={(idx) => {
                handleToggleMute(idx);
                // Also update synth mute state in real-time
                const wasMuted = mutedTracks.has(idx);
                setTrackMuted(idx, !wasMuted);
              }}
              onVolumeChange={(idx, vol) => {
                // Update local state
                setTrackVolumes(prev => {
                  const newMap = new Map(prev);
                  newMap.set(idx, vol);
                  return newMap;
                });
                // Update synth volume in real-time
                setTrackVolume(idx, vol);
              }}
            />
          </div>

          {/* FOOTER - Player Controls */}
          <Footer
            isPlaying={playbackState.isPlaying}
            currentTime={playbackState.currentTime}
            duration={playbackState.duration}
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
          <h1 className="empty-state-title">Comienza tu sesión</h1>
          <p className="empty-state-description">
            Arrastra un archivo MIDI aquí o usa el explorador de archivos para
            comenzar a visualizar y practicar música.
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
    </div>
  );
}

export default App;
