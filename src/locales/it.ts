/**
 * Italian (Italiano) translations
 */
export const it = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'Indietro',
    close: 'Chiudi',
    settings: 'Impostazioni',

    // Main sections
    tracks: 'Tracce',
    instruments: 'Strumenti',
    tablature: 'Tablatura',
    notation: 'Spartito',
    pianoRoll: 'Piano Roll',

    // File operations
    openFile: 'Apri file',
    openMidiFile: 'Apri file MIDI',
    refreshList: 'Aggiorna lista',
    noFilesFound: 'Nessun file trovato',

    // Export
    export: 'Esporta',
    exportAs: 'Esporta come...',
    exportCifrado: 'Accordi (.txt)',
    exportTablature: 'Tablatura (.tab)',
    exportPdf: 'PDF (.pdf)',

    // Playback controls
    play: 'Riproduci',
    pause: 'Pausa',
    stop: 'Stop',
    restart: 'Riavvia',
    rewind5s: 'Indietro 5s',
    forward5s: 'Avanti 5s',
    speed: 'Velocità',

    // Transpose
    transpose: 'Trasponi',
    semitones: 'semitoni',
    octave: 'ottava',
    autoFit: 'Auto-adatta allo strumento',
    undoTranspose: 'Annulla trasposizione',
    redoTranspose: 'Ripeti trasposizione',
    resetTranspose: 'Reset',
    minus1: '-1 semitono',
    plus1: '+1 semitono',
    minus8va: '-1 ottava',
    plus8va: '+1 ottava',

    // Loop
    loop: 'Loop',
    loopA: 'Punto A',
    loopB: 'Punto B',
    enableLoop: 'Attiva loop',
    disableLoop: 'Disattiva loop',
    clearLoop: 'Cancella loop',

    // Metronome
    metronome: 'Metronomo',
    bpm: 'BPM',

    // Instrument
    instrument: 'Strumento',
    selectInstrument: 'Seleziona Strumento',
    createCustom: 'Crea Strumento Personalizzato',
    editInstrument: 'Modifica',
    deleteInstrument: 'Elimina',
    tuning: 'Accordatura',
    strings: 'corde',
    frets: 'tasti',

    // Tracks
    track: 'Traccia',
    noTracks: 'Nessuna traccia',
    notes: 'note',
    mute: 'Muto',
    unmute: 'Attiva',
    solo: 'Solo',

    // Views
    showToolbar: 'Mostra Barra Strumenti',
    hideToolbar: 'Nascondi Barra Strumenti',
    showPianoRoll: 'Mostra Piano Roll',
    hidePianoRoll: 'Nascondi Piano Roll',

    // Messages
    notesOutOfRange: 'note fuori portata dello strumento',
    instrumentNotFound: 'Strumento non trovato',
    selectTrackToView: 'Seleziona una traccia per vedere',
    selectTrackToViewSheet: 'Seleziona una traccia per vedere lo spartito',
    noFile: 'Nessun file',
    dropFile: 'Trascina un file MIDI o clicca per aprire',
    confirmClose: 'Chiudere il file corrente? Le modifiche non salvate andranno perse.',

    // Modal titles
    midiInfo: 'Info MIDI',
    about: 'Informazioni',
    help: 'Aiuto',
    userManual: 'Manuale Utente',

    // MIDI Info labels
    name: 'Nome',
    duration: 'Durata',
    fileSize: 'Dimensione',
    tempo: 'Tempo',
    timeSignature: 'Tempo',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'Informazioni sullo sviluppatore',
    version: 'Versione',
    developer: 'Sviluppatore',
    contact: 'Contatto',
    website: 'Sito web',
    license: 'Licenza',

    // Theme
    darkMode: 'Modalità scura',
    lightMode: 'Modalità chiara',

    // Language
    language: 'Lingua',

    // Initial screen
    startSession: 'Inizia la tua sessione',
    dragDropHint: 'Trascina un file MIDI o clicca per aprire',
    dropHere: 'Trascina il tuo file MIDI qui',
    dropNow: 'Rilascialo!',
    supportsMidi: 'Supporta .mid e .midi',
    processing: 'Elaborazione spartito...',

    // Piano Roll hints
    pianoRollHint: 'Trascina: Scorri | Click: Vai a posizione | Ctrl+Click: Loop A | Shift+Click: Loop B',

    // Tablature
    pauseMarker: 'Pausa',

    // Instrument Editor
    instrumentName: 'Nome strumento',
    instrumentIcon: 'Icona',
    numberOfStrings: 'Numero di corde',
    numberOfFrets: 'Numero di tasti',
    stringTuning: 'Accordatura corde',
    selectTemplate: 'Seleziona modello',
    saveInstrument: 'Salva strumento',
    cancel: 'Annulla',

    // Errors
    error: 'Errore',
    loadingError: 'Errore di caricamento',
} as const;
