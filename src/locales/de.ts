/**
 * German (Deutsch) translations
 */
export const de = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'Zurück',
    close: 'Schließen',
    settings: 'Einstellungen',

    // Main sections
    tracks: 'Spuren',
    instruments: 'Instrumente',
    tablature: 'Tabulatur',
    notation: 'Notation',
    pianoRoll: 'Piano Roll',

    // File operations
    openFile: 'Datei öffnen',
    openMidiFile: 'MIDI-Datei öffnen',
    refreshList: 'Liste aktualisieren',
    noFilesFound: 'Keine Dateien gefunden',

    // Export
    export: 'Exportieren',
    exportAs: 'Exportieren als...',
    exportCifrado: 'Akkorde (.txt)',
    exportTablature: 'Tabulatur (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: 'Notenblatt (SVG)',

    // Playback controls
    play: 'Abspielen',
    pause: 'Pause',
    stop: 'Stopp',
    restart: 'Neustart',
    rewind5s: '5s zurück',
    forward5s: '5s vor',
    speed: 'Geschwindigkeit',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: 'Transponieren',
    semitones: 'Halbtöne',
    octave: 'Oktave',
    autoFit: 'Auto-Anpassung an Instrument',
    undoTranspose: 'Transposition rückgängig',
    redoTranspose: 'Transposition wiederholen',
    resetTranspose: 'Zurücksetzen',
    minus1: '-1 Halbton',
    plus1: '+1 Halbton',
    minus8va: '-1 Oktave',
    plus8va: '+1 Oktave',

    // Loop
    loop: 'Schleife',
    loopA: 'Punkt A',
    loopB: 'Punkt B',
    enableLoop: 'Schleife aktivieren',
    disableLoop: 'Schleife deaktivieren',
    clearLoop: 'Schleife löschen',

    // Metronome
    metronome: 'Metronom',
    bpm: 'BPM',

    // Instrument
    instrument: 'Instrument',
    selectInstrument: 'Instrument auswählen',
    createCustom: 'Benutzerdefiniertes Instrument erstellen',
    editInstrument: 'Bearbeiten',
    deleteInstrument: 'Löschen',
    tuning: 'Stimmung',
    strings: 'Saiten',
    frets: 'Bünde',

    // Tracks
    track: 'Spur',
    noTracks: 'Keine Spuren',
    notes: 'Noten',
    mute: 'Stumm',
    unmute: 'Aktivieren',
    solo: 'Solo',

    // Views
    showToolbar: 'Werkzeugleiste anzeigen',
    hideToolbar: 'Werkzeugleiste ausblenden',
    showPianoRoll: 'Piano Roll anzeigen',
    hidePianoRoll: 'Piano Roll ausblenden',

    // Messages
    notesOutOfRange: 'Noten außerhalb des Instrumentenbereichs',
    instrumentNotFound: 'Instrument nicht gefunden',
    selectTrackToView: 'Spur zum Anzeigen auswählen',
    selectTrackToViewSheet: 'Spur auswählen um Noten anzuzeigen',
    noFile: 'Keine Datei',
    dropFile: 'MIDI-Datei hierher ziehen oder klicken',
    confirmClose: 'Aktuelle Datei schließen? Ungespeicherte Änderungen gehen verloren.',

    // Modal titles
    midiInfo: 'MIDI-Info',
    about: 'Über',
    help: 'Hilfe',
    userManual: 'Benutzerhandbuch',

    // MIDI Info labels
    name: 'Name',
    duration: 'Dauer',
    fileSize: 'Größe',
    tempo: 'Tempo',
    timeSignature: 'Taktart',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'Über den Entwickler',
    version: 'Version',
    developer: 'Entwickler',
    contact: 'Kontakt',
    website: 'Webseite',
    license: 'Lizenz',

    // Theme
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',

    // Language
    language: 'Sprache',

    // Initial screen
    startSession: 'Starten Sie Ihre Sitzung',
    dragDropHint: 'MIDI-Datei hierher ziehen oder klicken',
    dropHere: 'Ziehen Sie Ihre MIDI-Datei hierher',
    dropNow: 'Loslassen!',
    supportsMidi: 'Unterstützt .mid und .midi',
    processing: 'Verarbeite Noten...',

    // Piano Roll hints
    pianoRollHint: 'Ziehen: Scrollen | Klick: Zur Position | Strg+Klick: Schleife A | Shift+Klick: Schleife B',

    // Tablature
    pauseMarker: 'Pause',

    // Instrument Editor
    instrumentName: 'Instrumentenname',
    instrumentIcon: 'Symbol',
    numberOfStrings: 'Anzahl der Saiten',
    numberOfFrets: 'Anzahl der Bünde',
    stringTuning: 'Saitenstimmung',
    selectTemplate: 'Vorlage auswählen',
    saveInstrument: 'Instrument speichern',
    cancel: 'Abbrechen',

    // Errors
    error: 'Fehler',
    loadingError: 'Ladefehler',

    // Additional UI strings
    toggleToolbar: 'Werkzeugleiste ein/ausblenden',
    showTracks: 'Spuren anzeigen',
    hideTracks: 'Spuren ausblenden',
    countInDelay: 'Verzögerung 3s',
    volume: 'Lautstärke',
    cifrado: 'Akkorde (Noten)',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: 'Drucken / PDF',
} as const;
