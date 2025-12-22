/**
 * MIDI Visualizer - App Principal
 * Refactorizado para usar React Context para el estado global
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Music,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

// Importar estilos
import './app/App.css';

// Componentes
import {
  PlayerControls,
  TrackSelector,
  InstrumentSelector,
  FileUploader,
  TablatureView,
  NotationView,
  FileExplorer,
  PianoRollView,
  LoopControls,
  TransposeControls,
} from './components';

// Contextos
import { useMidi } from '@/features/library';
import { usePlayback } from '@/features/player';
import { useTracks, detectMelodyTrack } from '@/features/tracks';
import { useInstrument } from '@/features/instruments';

// Utils y config
import { generateCifrado, generateTablatureText, downloadAsTextFile } from './utils/export';
import { getAllInstruments } from './config/instruments';
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
  } = usePlayback();
  const { state: tracksState, selectTrack, toggleMute, resetTracks } = useTracks();
  const { state: instrumentState, selectInstrument, setTranspose } = useInstrument();

  // ===== ESTADO LOCAL (UI) =====
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filesExpanded, setFilesExpanded] = useState(true);
  const [tracksExpanded, setTracksExpanded] = useState(true);
  const [showInstrumentMenu, setShowInstrumentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MidiFile | null>(null);

  // Visualización
  const [showPianoRoll, setShowPianoRoll] = useState(true);
  const [showTablature, setShowTablature] = useState(true);
  const [showNotation, setShowNotation] = useState(false);
  const [maximizedView, setMaximizedView] = useState<'pianoroll' | 'tablature' | 'notation' | null>(
    null
  );

  // ===== DERIVADOS =====
  const parsedMidi = midiState.parsedMidi;
  const isLoading = midiState.isLoading;
  const error = midiState.error;
  const selectedTrack = tracksState.selectedTrackIndex;
  const mutedTracks = tracksState.mutedTracks;
  const selectedInstrument = instrumentState.selectedInstrumentId;
  const transpose = instrumentState.transpose;

  // Notas de la pista seleccionada
  const selectedTrackNotes = useMemo(() => {
    if (!parsedMidi || !parsedMidi.tracks[selectedTrack]) return [];
    return parsedMidi.tracks[selectedTrack].notes;
  }, [parsedMidi, selectedTrack]);

  // ===== EFECTOS =====

  // Auto-seleccionar pista de melodía cuando se carga un nuevo MIDI
  useEffect(() => {
    if (parsedMidi && parsedMidi.tracks.length > 0) {
      const melodyIndex = detectMelodyTrack(parsedMidi.tracks);
      resetTracks(melodyIndex);
    }
  }, [parsedMidi, resetTracks]);

  // Auto-transposición cuando cambia la pista o el instrumento
  useEffect(() => {
    if (selectedTrackNotes.length === 0) return;

    const allInstruments = getAllInstruments();
    const instrument = allInstruments[selectedInstrument];
    if (!instrument) return;

    const midiNotes = selectedTrackNotes.map((n) => n.midi);
    const minNote = Math.min(...midiNotes);
    const maxNote = Math.max(...midiNotes);
    const noteCenter = (minNote + maxNote) / 2;

    const instMin = Math.min(...instrument.midiNotes);
    const instMax = Math.max(...instrument.midiNotes) + (instrument.frets || 20);
    const instCenter = (instMin + instMax) / 2;

    const suggestedTranspose = Math.round((instCenter - noteCenter) / 12) * 12;
    setTranspose(suggestedTranspose);
  }, [selectedTrack, selectedInstrument, selectedTrackNotes, setTranspose]);

  // ===== HANDLERS =====
  const handleFileSelect = useCallback(
    async (file: File) => {
      await loadMidiFile(file);
      clearLoop();
    },
    [loadMidiFile, clearLoop]
  );

  const handleFileFromExplorer = useCallback(
    async (file: MidiFile) => {
      setSelectedFile(file);
      try {
        await loadMidiFromUrl(file.path, file);
        clearLoop();
      } catch (err) {
        console.error('Error cargando archivo:', err);
      }
    },
    [loadMidiFromUrl, clearLoop]
  );

  const handlePlay = useCallback(() => {
    if (parsedMidi) {
      play(parsedMidi, mutedTracks);
    }
  }, [parsedMidi, mutedTracks, play]);

  const handleToggleMute = useCallback(
    (trackIndex: number) => {
      toggleMute(trackIndex);
    },
    [toggleMute]
  );

  const handleExportCifrado = useCallback(() => {
    if (!parsedMidi) return;
    const cifrado = generateCifrado(parsedMidi, selectedTrack);
    downloadAsTextFile(cifrado, `${parsedMidi.name}_cifrado.txt`);
  }, [parsedMidi, selectedTrack]);

  const handleExportTablature = useCallback(() => {
    if (!parsedMidi) return;
    const track = parsedMidi.tracks[selectedTrack];
    if (!track) return;
    const tablature = generateTablatureText(track, selectedInstrument);
    downloadAsTextFile(tablature, `${parsedMidi.name}_tablatura.txt`);
  }, [parsedMidi, selectedTrack, selectedInstrument]);

  const handleSelectInstrument = useCallback(
    (id: string) => {
      selectInstrument(id);
      setShowInstrumentMenu(false);
    },
    [selectInstrument]
  );

  // ===== RENDER =====
  return (
    <div className="app-layout">
      {/* Sidebar Izquierdo */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen ? (
            <>
              <div className="sidebar-brand">
                <Music size={18} />
                <span>MIDI Visualizer</span>
              </div>
              <button className="btn-icon-sm" onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose size={16} />
              </button>
            </>
          ) : (
            <button className="btn-icon-sm" onClick={() => setSidebarOpen(true)}>
              <PanelLeft size={16} />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <div className="sidebar-sections">
            <div className="section">
              <button className="section-header" onClick={() => setFilesExpanded(!filesExpanded)}>
                {filesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Explorador MIDI</span>
              </button>
              {filesExpanded && (
                <div className="section-content no-padding">
                  <FileExplorer selectedFile={selectedFile} onSelectFile={handleFileFromExplorer} />
                </div>
              )}
            </div>

            {parsedMidi && (
              <div className="section">
                <button
                  className="section-header"
                  onClick={() => setTracksExpanded(!tracksExpanded)}
                >
                  {tracksExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Pistas</span>
                  <span className="section-badge">{parsedMidi.tracks.length}</span>
                </button>
                {tracksExpanded && (
                  <div className="section-content">
                    <TrackSelector
                      tracks={parsedMidi.tracks}
                      selectedTrack={selectedTrack}
                      mutedTracks={mutedTracks}
                      onSelectTrack={selectTrack}
                      onToggleMute={handleToggleMute}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Área Principal */}
      <main className="main">
        {/* Header */}
        <header className="main-header">
          <div className="header-info">
            <h1>{parsedMidi ? parsedMidi.name : 'MIDI Visualizer'}</h1>
            {parsedMidi && (
              <span className="header-meta">
                {parsedMidi.bpm.toFixed(0)} BPM • {Math.floor(parsedMidi.duration / 60)}:
                {String(Math.floor(parsedMidi.duration % 60)).padStart(2, '0')}
                {transpose !== 0 && (
                  <span className="transpose-badge">
                    {transpose > 0 ? '+' : ''}
                    {transpose}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="header-actions">
            {parsedMidi && (
              <>
                <TransposeControls
                  instrumentId={selectedInstrument}
                  notes={selectedTrackNotes}
                  transpose={transpose}
                  onTransposeChange={setTranspose}
                />
                <div className="divider" />

                {/* Selector de Instrumento en Header */}
                <div className="instrument-dropdown-container">
                  <button
                    className={`btn-header-inst ${showInstrumentMenu ? 'active' : ''}`}
                    onClick={() => setShowInstrumentMenu(!showInstrumentMenu)}
                    title="Cambiar Instrumento"
                  >
                    <span className="header-inst-icon">
                      {getAllInstruments()[selectedInstrument]?.icon}
                    </span>
                    <span className="header-inst-name">
                      {getAllInstruments()[selectedInstrument]?.nameEs}
                    </span>
                    <ChevronDown size={12} />
                  </button>

                  {showInstrumentMenu && (
                    <>
                      <div
                        className="popover-overlay"
                        onClick={() => setShowInstrumentMenu(false)}
                      />
                      <div className="instrument-popover">
                        <div className="popover-header">
                          <span>Afinación e Instrumentos</span>
                          <button onClick={() => setShowInstrumentMenu(false)}>✕</button>
                        </div>
                        <div className="popover-content">
                          <InstrumentSelector
                            selectedInstrument={selectedInstrument}
                            onSelectInstrument={handleSelectInstrument}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="divider" />
                <LoopControls
                  loopStart={playbackState.loopStart}
                  loopEnd={playbackState.loopEnd}
                  isLoopEnabled={playbackState.isLoopEnabled}
                  duration={parsedMidi.duration}
                  currentTime={playbackState.currentTime}
                  onSetLoopStart={setLoopStart}
                  onSetLoopEnd={setLoopEnd}
                  onToggleLoop={toggleLoop}
                  onClearLoop={clearLoop}
                />
                <div className="divider" />
                <button className="btn-sm" onClick={handleExportCifrado}>
                  <FileText size={14} />
                </button>
                <button className="btn-sm" onClick={handleExportTablature}>
                  <Download size={14} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Contenido */}
        <div className="content">
          {error && <div className="error-banner">❌ {error}</div>}

          {!parsedMidi ? (
            <div className="empty-state-container">
              <div className="hero-section">
                <div className="hero-icon">🎵</div>
                <h1>Empieza a practicar</h1>
                <p>
                  Carga un archivo MIDI para visualizar su tablatura, piano roll o partitura
                  interactiva.
                </p>
              </div>
              <div className="uploader-center">
                <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              </div>
              <div className="quick-info">
                <span>💡 Puedes buscar clásicos en el explorador de la izquierda</span>
              </div>
            </div>
          ) : (
            <div className="visualizations">
              {/* Piano Roll */}
              {(showPianoRoll || maximizedView === 'pianoroll') &&
                maximizedView !== 'tablature' &&
                maximizedView !== 'notation' && (
                  <div className={`viz-panel ${maximizedView === 'pianoroll' ? 'maximized' : ''}`}>
                    <div className="viz-header">
                      <span>🎹 Piano Roll</span>
                      <div className="viz-actions">
                        <button
                          onClick={() =>
                            setMaximizedView(maximizedView === 'pianoroll' ? null : 'pianoroll')
                          }
                        >
                          {maximizedView === 'pianoroll' ? '⊖' : '⊕'}
                        </button>
                        {!maximizedView && (
                          <button onClick={() => setShowPianoRoll(false)}>✕</button>
                        )}
                      </div>
                    </div>
                    <PianoRollView
                      notes={selectedTrackNotes}
                      currentTime={playbackState.currentTime}
                      isPlaying={playbackState.isPlaying}
                      duration={parsedMidi.duration}
                      loopStart={playbackState.loopStart}
                      loopEnd={playbackState.loopEnd}
                      onSetLoopStart={setLoopStart}
                      onSetLoopEnd={setLoopEnd}
                      onSeek={seekTo}
                    />
                  </div>
                )}

              {/* Tablatura */}
              {(showTablature || maximizedView === 'tablature') &&
                maximizedView !== 'pianoroll' &&
                maximizedView !== 'notation' && (
                  <div className={`viz-panel ${maximizedView === 'tablature' ? 'maximized' : ''}`}>
                    <div className="viz-header">
                      <span>
                        {getAllInstruments()[selectedInstrument]?.icon} Tablatura -{' '}
                        {getAllInstruments()[selectedInstrument]?.nameEs}
                      </span>
                      <div className="viz-actions">
                        <button
                          onClick={() =>
                            setMaximizedView(maximizedView === 'tablature' ? null : 'tablature')
                          }
                        >
                          {maximizedView === 'tablature' ? '⊖' : '⊕'}
                        </button>
                        {!maximizedView && (
                          <button onClick={() => setShowTablature(false)}>✕</button>
                        )}
                      </div>
                    </div>
                    <TablatureView
                      notes={selectedTrackNotes}
                      instrumentId={selectedInstrument}
                      currentTime={playbackState.currentTime}
                      isPlaying={playbackState.isPlaying}
                      transpose={transpose}
                      onSeek={seekTo}
                    />
                  </div>
                )}

              {/* Partitura */}
              {(showNotation || maximizedView === 'notation') &&
                maximizedView !== 'pianoroll' &&
                maximizedView !== 'tablature' && (
                  <div className={`viz-panel ${maximizedView === 'notation' ? 'maximized' : ''}`}>
                    <div className="viz-header">
                      <span>🎼 Partitura</span>
                      <div className="viz-actions">
                        <button
                          onClick={() =>
                            setMaximizedView(maximizedView === 'notation' ? null : 'notation')
                          }
                        >
                          {maximizedView === 'notation' ? '⊖' : '⊕'}
                        </button>
                        {!maximizedView && (
                          <button onClick={() => setShowNotation(false)}>✕</button>
                        )}
                      </div>
                    </div>
                    <NotationView
                      notes={selectedTrackNotes}
                      currentTime={playbackState.currentTime}
                      isPlaying={playbackState.isPlaying}
                      bpm={parsedMidi.bpm}
                      timeSignature={parsedMidi.timeSignature}
                    />
                  </div>
                )}

              {/* Botones para mostrar vistas ocultas */}
              {(!showPianoRoll || !showTablature || !showNotation) && !maximizedView && (
                <div className="show-views">
                  {!showPianoRoll && (
                    <button onClick={() => setShowPianoRoll(true)}>🎹 Piano Roll</button>
                  )}
                  {!showTablature && (
                    <button onClick={() => setShowTablature(true)}>🎸 Tablatura</button>
                  )}
                  {!showNotation && (
                    <button onClick={() => setShowNotation(true)}>🎼 Partitura</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player */}
        {parsedMidi && (
          <footer className="player-bar">
            <PlayerControls
              playbackState={playbackState}
              onPlay={handlePlay}
              onPause={pause}
              onStop={stop}
              onSeek={seekTo}
              onSpeedChange={setSpeed}
            />
          </footer>
        )}
      </main>
    </div>
  );
}

export default App;
