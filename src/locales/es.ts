/**
 * Spanish (Español) translations
 * Base language file - all other languages should have the same keys
 */
export const es = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'Volver',
    close: 'Cerrar',
    settings: 'Ajustes',

    // Main sections
    tracks: 'Pistas',
    instruments: 'Instrumentos',
    tablature: 'Tablatura',
    notation: 'Partitura',
    pianoRoll: 'Piano Roll',

    // File operations
    openFile: 'Abrir archivo',
    openMidiFile: 'Abrir archivo MIDI',
    refreshList: 'Recargar lista',
    noFilesFound: 'No se encontraron archivos',

    // Export
    export: 'Exportar',
    exportAs: 'Exportar como...',
    exportCifrado: 'Cifrado (.txt)',
    exportTablature: 'Tablatura (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: 'Partitura (SVG)',

    // Playback controls
    play: 'Reproducir',
    pause: 'Pausar',
    stop: 'Detener',
    restart: 'Reiniciar',
    rewind5s: 'Retroceder 5s',
    forward5s: 'Avanzar 5s',
    speed: 'Velocidad',
    keyboardShortcuts: 'Atajos de teclado',

    // Transpose
    transpose: 'Transponer',
    semitones: 'semitonos',
    octave: 'octava',
    autoFit: 'Auto-adaptar al instrumento',
    undoTranspose: 'Deshacer transposición',
    redoTranspose: 'Rehacer transposición',
    resetTranspose: 'Restablecer',
    minus1: '-1 semitono',
    plus1: '+1 semitono',
    minus8va: '-1 octava',
    plus8va: '+1 octava',

    // Loop
    loop: 'Bucle',
    loopA: 'Punto A',
    loopB: 'Punto B',
    enableLoop: 'Activar bucle',
    disableLoop: 'Desactivar bucle',
    clearLoop: 'Borrar bucle',

    // Metronome
    metronome: 'Metrónomo',
    bpm: 'BPM',

    // Instrument
    instrument: 'Instrumento',
    selectInstrument: 'Seleccionar Instrumento',
    createCustom: 'Crear Instrumento Personalizado',
    editInstrument: 'Editar',
    deleteInstrument: 'Eliminar',
    tuning: 'Afinación',
    strings: 'cuerdas',
    frets: 'trastes',

    // Tracks
    track: 'Pista',
    noTracks: 'No hay pistas',
    notes: 'notas',
    mute: 'Silenciar',
    unmute: 'Activar',
    solo: 'Solo',

    // Views
    showToolbar: 'Mostrar Barra de Herramientas',
    hideToolbar: 'Ocultar Barra de Herramientas',
    showPianoRoll: 'Mostrar Piano Roll',
    hidePianoRoll: 'Ocultar Piano Roll',

    // Messages
    notesOutOfRange: 'notas fuera del rango del instrumento',
    instrumentNotFound: 'Instrumento no encontrado',
    selectTrackToView: 'Selecciona una pista para ver',
    selectTrackToViewSheet: 'Selecciona una pista para ver la partitura',
    noFile: 'Sin archivo',
    dropFile: 'Arrastra un archivo MIDI o haz clic para abrir',
    confirmClose: '¿Cerrar el archivo actual? Los cambios no guardados se perderán.',

    // Modal titles
    midiInfo: 'Información del MIDI',
    about: 'Acerca de',
    help: 'Ayuda',
    userManual: 'Manual de usuario',

    // MIDI Info labels
    name: 'Nombre',
    duration: 'Duración',
    fileSize: 'Tamaño',
    tempo: 'Tempo',
    timeSignature: 'Compás',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'Acerca del desarrollador',
    version: 'Versión',
    developer: 'Desarrollador',
    contact: 'Contacto',
    website: 'Sitio web',
    license: 'Licencia',

    // Theme
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',

    // Language
    language: 'Idioma',

    // Initial screen
    startSession: 'Comienza tu sesión',
    dragDropHint: 'Arrastra un archivo MIDI o haz clic para abrir',
    dropHere: 'Arrastra tu archivo MIDI aquí',
    dropNow: '¡Suéltalo!',
    supportsMidi: 'Soporta .mid y .midi',
    processing: 'Procesando partitura...',

    // Piano Roll hints
    pianoRollHint: 'Arrastrar: Desplazar | Clic: Ir a posición | Ctrl+Clic: Bucle A | Shift+Clic: Bucle B',

    // Tablature
    pauseMarker: 'Pausa',

    // Instrument Editor
    instrumentName: 'Nombre del instrumento',
    instrumentIcon: 'Icono',
    numberOfStrings: 'Número de cuerdas',
    numberOfFrets: 'Número de trastes',
    stringTuning: 'Afinación de cuerdas',
    selectTemplate: 'Seleccionar plantilla',
    saveInstrument: 'Guardar instrumento',
    cancel: 'Cancelar',

    // Errors
    error: 'Error',
    loadingError: 'Error al cargar',

    // Additional UI strings
    toggleToolbar: 'Mostrar/Ocultar Barra de Herramientas',
    showTracks: 'Mostrar pistas',
    hideTracks: 'Ocultar pistas',
    countInDelay: 'Retardo 3s',
    volume: 'Volumen',
    cifrado: 'Cifrado (notas)',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: 'Imprimir / PDF',
} as const;

export type TranslationKeys = typeof es;
