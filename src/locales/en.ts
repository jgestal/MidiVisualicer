/**
 * English translations
 */
export const en = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'Back',
    close: 'Close',
    settings: 'Settings',

    // Main sections
    tracks: 'Tracks',
    instruments: 'Instruments',
    tablature: 'Tablature',
    notation: 'Notation',
    pianoRoll: 'Piano Roll',
    simplify: 'Simplify',
    simplified: 'Simplified',
    simplifyTooltip: 'Keep only the highest note from chords and optimize for playability',

    // File operations
    openFile: 'Open file',
    openMidiFile: 'Open MIDI file',
    refreshList: 'Refresh list',
    noFilesFound: 'No files found',

    // Export
    export: 'Export',
    exportAs: 'Export as...',
    exportCifrado: 'Chord chart (.txt)',
    exportTablature: 'Tablature (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: 'Sheet Music (SVG)',

    // Playback controls
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    restart: 'Restart',
    rewind5s: 'Rewind 5s',
    forward5s: 'Forward 5s',
    speed: 'Speed',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: 'Transpose',
    semitones: 'semitones',
    octave: 'octave',
    autoFit: 'Auto-fit to instrument',
    undoTranspose: 'Undo transpose',
    redoTranspose: 'Redo transpose',
    resetTranspose: 'Reset',
    minus1: '-1 semitone',
    plus1: '+1 semitone',
    minus8va: '-1 octave',
    plus8va: '+1 octave',

    // Loop
    loop: 'Loop',
    loopA: 'Point A',
    loopB: 'Point B',
    enableLoop: 'Enable loop',
    disableLoop: 'Disable loop',
    clearLoop: 'Clear loop',

    // Metronome
    metronome: 'Metronome',
    bpm: 'BPM',

    // Instrument
    instrument: 'Instrument',
    selectInstrument: 'Select Instrument',
    createCustom: 'Create Custom Instrument',
    editInstrument: 'Edit',
    deleteInstrument: 'Delete',
    tuning: 'Tuning',
    strings: 'strings',
    frets: 'frets',

    // Tracks
    track: 'Track',
    noTracks: 'No tracks',
    notes: 'notes',
    mute: 'Mute',
    unmute: 'Unmute',
    solo: 'Solo',

    // Views
    showToolbar: 'Show Toolbar',
    hideToolbar: 'Hide Toolbar',
    showPianoRoll: 'Show Piano Roll',
    hidePianoRoll: 'Hide Piano Roll',

    // Messages
    notesOutOfRange: 'notes out of instrument range',
    instrumentNotFound: 'Instrument not found',
    selectTrackToView: 'Select a track to view',
    selectTrackToViewSheet: 'Select a track to view the sheet music',
    noFile: 'No file',
    dropFile: 'Drag a MIDI file or click to open',
    confirmClose: 'Close current file? Unsaved changes will be lost.',

    // Modal titles
    midiInfo: 'MIDI Info',
    about: 'About',
    help: 'Help',
    userManual: 'User Manual',

    // MIDI Info labels
    name: 'Name',
    duration: 'Duration',
    fileSize: 'Size',
    tempo: 'Tempo',
    timeSignature: 'Time Signature',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'About the developer',
    version: 'Version',
    developer: 'Developer',
    contact: 'Contact',
    website: 'Website',
    license: 'License',

    // Theme
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    solarizedMode: 'Solarized mode',
    emeraldMode: 'Emerald mode',
    aquaMode: 'Aqua mode (macOS)',
    matrixMode: 'Matrix mode',
    win95Mode: 'Windows 95 mode',
    steampunkMode: 'Retro Steampunk mode',
    vhsMode: 'VHS Glitch mode',
    nokiaMode: 'Nokia 3310 mode',
    msdosMode: 'MS-DOS mode',
    floppyMode: 'Floppy Disk mode',
    vaporwaveMode: 'Vaporwave mode',
    artdecoMode: 'Art Deco (Gatsby) mode',
    bauhausMode: 'Bauhaus mode',
    memphisMode: 'Memphis Design mode',
    wesandersonMode: 'Wes Anderson mode',
    bladerunnerMode: 'Blade Runner mode',
    ghibliMode: 'Studio Ghibli mode',
    sincityMode: 'Sin City mode',
    pipboyMode: 'Pip-Boy (Fallout) mode',
    minecraftMode: 'Minecraft mode',
    cyberpunkMode: 'Cyberpunk 2077 mode',
    rpgMode: '8-Bit RPG mode',
    lofiMode: 'Lo-Fi Hip Hop mode',
    industrialMode: 'Techno Industrial mode',
    reggaeMode: 'Reggae / Roots mode',
    discoMode: 'Disco 70s mode',
    solarpunkMode: 'Solarpunk mode',
    lcarsMode: 'LCARS (Star Trek) mode',
    walkmanMode: 'Sony Walkman mode',
    ipodMode: 'iPod Classic mode',
    snesMode: 'Super Nintendo mode',

    // Language
    language: 'Language',

    // Initial screen
    startSession: 'Start your session',
    dragDropHint: 'Drag a MIDI file or click to open',
    dropHere: 'Drag your MIDI file here',
    dropNow: 'Drop it!',
    supportsMidi: 'Supports .mid and .midi',
    processing: 'Processing sheet music...',

    // Piano Roll hints
    pianoRollHint: 'Drag: Scroll | Click: Go to position | Ctrl+Click: Loop A | Shift+Click: Loop B',

    // Tablature
    pauseMarker: 'Pause',

    // Instrument Editor
    instrumentName: 'Instrument name',
    instrumentIcon: 'Icon',
    numberOfStrings: 'Number of strings',
    numberOfFrets: 'Number of frets',
    stringTuning: 'String tuning',
    selectTemplate: 'Select template',
    saveInstrument: 'Save instrument',
    cancel: 'Cancel',

    // Errors
    error: 'Error',
    loadingError: 'Loading error',

    // Additional UI strings
    toggleToolbar: 'Show/Hide Toolbar',
    showTracks: 'Show tracks',
    hideTracks: 'Hide tracks',
    countInDelay: 'Delay 3s',
    volume: 'Volume',
    cifrado: 'Chord chart (notes)',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: 'Print / PDF',
} as const;
