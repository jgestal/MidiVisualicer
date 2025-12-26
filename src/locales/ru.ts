/**
 * Russian (Русский) translations
 */
export const ru = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'Назад',
    close: 'Закрыть',
    settings: 'Настройки',

    // Main sections
    tracks: 'Дорожки',
    instruments: 'Инструменты',
    tablature: 'Табулатура',
    notation: 'Ноты',
    pianoRoll: 'Пианоролл',
    simplify: 'Упростить',
    simplified: 'Упрощено',
    simplifyTooltip: 'Сохраняет только самую высокую ноту аккордов и оптимизирует для исполнения',

    // File operations
    openFile: 'Открыть файл',
    openMidiFile: 'Открыть MIDI файл',
    refreshList: 'Обновить список',
    noFilesFound: 'Файлы не найдены',

    // Export
    export: 'Экспорт',
    exportAs: 'Экспортировать как...',
    exportCifrado: 'Аккорды (.txt)',
    exportTablature: 'Табулатура (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: 'Ноты (SVG)',

    // Playback controls
    play: 'Воспроизвести',
    pause: 'Пауза',
    stop: 'Стоп',
    restart: 'Сначала',
    rewind5s: 'Назад 5с',
    forward5s: 'Вперёд 5с',
    speed: 'Скорость',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: 'Транспонировать',
    semitones: 'полутонов',
    octave: 'октава',
    autoFit: 'Авто-подстройка под инструмент',
    undoTranspose: 'Отменить транспозицию',
    redoTranspose: 'Повторить транспозицию',
    resetTranspose: 'Сброс',
    minus1: '-1 полутон',
    plus1: '+1 полутон',
    minus8va: '-1 октава',
    plus8va: '+1 октава',

    // Loop
    loop: 'Цикл',
    loopA: 'Точка A',
    loopB: 'Точка B',
    enableLoop: 'Включить цикл',
    disableLoop: 'Выключить цикл',
    clearLoop: 'Очистить цикл',

    // Metronome
    metronome: 'Метроном',
    bpm: 'BPM',

    // Instrument
    instrument: 'Инструмент',
    selectInstrument: 'Выбрать инструмент',
    createCustom: 'Создать свой инструмент',
    editInstrument: 'Редактировать',
    deleteInstrument: 'Удалить',
    tuning: 'Настройка',
    strings: 'струн',
    frets: 'ладов',

    // Tracks
    track: 'Дорожка',
    noTracks: 'Нет дорожек',
    notes: 'нот',
    mute: 'Выключить',
    unmute: 'Включить',
    solo: 'Соло',

    // Views
    showToolbar: 'Показать панель',
    hideToolbar: 'Скрыть панель',
    showPianoRoll: 'Показать пианоролл',
    hidePianoRoll: 'Скрыть пианоролл',

    // Messages
    notesOutOfRange: 'нот вне диапазона инструмента',
    instrumentNotFound: 'Инструмент не найден',
    selectTrackToView: 'Выберите дорожку для просмотра',
    selectTrackToViewSheet: 'Выберите дорожку для просмотра нот',
    noFile: 'Нет файла',
    dropFile: 'Перетащите MIDI файл или нажмите для открытия',
    confirmClose: 'Закрыть файл? Несохранённые изменения будут потеряны.',

    // Modal titles
    midiInfo: 'Информация о MIDI',
    about: 'О программе',
    help: 'Помощь',
    userManual: 'Руководство пользователя',

    // MIDI Info labels
    name: 'Название',
    duration: 'Длительность',
    fileSize: 'Размер',
    tempo: 'Темп',
    timeSignature: 'Размер',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'О разработчике',
    version: 'Версия',
    developer: 'Разработчик',
    contact: 'Контакт',
    website: 'Сайт',
    license: 'Лицензия',

    // Theme
    darkMode: 'Тёмная тема',
    lightMode: 'Светлая тема',

    // Language
    language: 'Язык',

    // Initial screen
    startSession: 'Начните сессию',
    dragDropHint: 'Перетащите MIDI файл или нажмите для открытия',
    dropHere: 'Перетащите MIDI файл сюда',
    dropNow: 'Отпустите!',
    supportsMidi: 'Поддерживает .mid и .midi',
    processing: 'Обработка партитуры...',

    // Piano Roll hints
    pianoRollHint: 'Перетаскивание: Прокрутка | Клик: Перейти к позиции | Ctrl+Клик: Цикл A | Shift+Клик: Цикл B',

    // Tablature
    pauseMarker: 'Пауза',

    // Instrument Editor
    instrumentName: 'Название инструмента',
    instrumentIcon: 'Иконка',
    numberOfStrings: 'Количество струн',
    numberOfFrets: 'Количество ладов',
    stringTuning: 'Настройка струн',
    selectTemplate: 'Выбрать шаблон',
    saveInstrument: 'Сохранить инструмент',
    cancel: 'Отмена',

    // Errors
    error: 'Ошибка',
    loadingError: 'Ошибка загрузки',

    // Additional UI strings
    toggleToolbar: 'Показать/Скрыть панель',
    showTracks: 'Показать дорожки',
    hideTracks: 'Скрыть дорожки',
    countInDelay: 'Задержка 3с',
    volume: 'Громкость',
    cifrado: 'Аккорды',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: 'Печать / PDF',
    solarizedMode: "Solarized mode",
    emeraldMode: "Emerald mode ",
    aquaMode: "Aqua mode (macOS)",
    matrixMode: "Matrix mode",
    win95Mode: "Windows 95 mode",
    steampunkMode: "Retro Steampunk mode",
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
    walkmanMode: 'Modo Sony Walkman',
    ipodMode: 'Modo iPod Classic',
    snesMode: 'Modo Super Nintendo',
    auto: 'Sistema (Auto)',
    confirm: 'Confirm',
}as const;