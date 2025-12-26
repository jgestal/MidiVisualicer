/**
 * Korean (한국어) translations
 */
export const ko = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: '뒤로',
    close: '닫기',
    settings: '설정',

    // Main sections
    tracks: '트랙',
    instruments: '악기',
    tablature: '타브악보',
    notation: '악보',
    pianoRoll: '피아노 롤',
    simplify: '단순화',
    simplified: '단순화됨',
    simplifyTooltip: '코드에서 가장 높은 음만 유지하고 연주성을 최적화합니다',

    // File operations
    openFile: '파일 열기',
    openMidiFile: 'MIDI 파일 열기',
    refreshList: '목록 새로고침',
    noFilesFound: '파일을 찾을 수 없습니다',

    // Export
    export: '내보내기',
    exportAs: '다른 이름으로 내보내기...',
    exportCifrado: '코드 차트 (.txt)',
    exportTablature: '타브악보 (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: '악보 (SVG)',

    // Playback controls
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    restart: '처음부터',
    rewind5s: '5초 뒤로',
    forward5s: '5초 앞으로',
    speed: '속도',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: '조옮김',
    semitones: '반음',
    octave: '옥타브',
    autoFit: '악기에 자동 맞춤',
    undoTranspose: '조옮김 취소',
    redoTranspose: '조옮김 다시 실행',
    resetTranspose: '초기화',
    minus1: '-1 반음',
    plus1: '+1 반음',
    minus8va: '-1 옥타브',
    plus8va: '+1 옥타브',

    // Loop
    loop: '반복',
    loopA: 'A 지점',
    loopB: 'B 지점',
    enableLoop: '반복 활성화',
    disableLoop: '반복 비활성화',
    clearLoop: '반복 지우기',

    // Metronome
    metronome: '메트로놈',
    bpm: 'BPM',

    // Instrument
    instrument: '악기',
    selectInstrument: '악기 선택',
    createCustom: '맞춤 악기 만들기',
    editInstrument: '편집',
    deleteInstrument: '삭제',
    tuning: '튜닝',
    strings: '줄',
    frets: '프렛',

    // Tracks
    track: '트랙',
    noTracks: '트랙 없음',
    notes: '음표',
    mute: '음소거',
    unmute: '음소거 해제',
    solo: '솔로',

    // Views
    showToolbar: '도구 모음 표시',
    hideToolbar: '도구 모음 숨기기',
    showPianoRoll: '피아노 롤 표시',
    hidePianoRoll: '피아노 롤 숨기기',

    // Messages
    notesOutOfRange: '악기 범위를 벗어난 음표',
    instrumentNotFound: '악기를 찾을 수 없습니다',
    selectTrackToView: '보려면 트랙을 선택하세요',
    selectTrackToViewSheet: '악보를 보려면 트랙을 선택하세요',
    noFile: '파일 없음',
    dropFile: 'MIDI 파일을 드래그하거나 클릭하여 열기',
    confirmClose: '현재 파일을 닫으시겠습니까? 저장하지 않은 변경 사항이 손실됩니다.',

    // Modal titles
    midiInfo: 'MIDI 정보',
    about: '정보',
    help: '도움말',
    userManual: '사용자 매뉴얼',

    // MIDI Info labels
    name: '이름',
    duration: '길이',
    fileSize: '크기',
    tempo: '템포',
    timeSignature: '박자',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: '개발자 정보',
    version: '버전',
    developer: '개발자',
    contact: '연락처',
    website: '웹사이트',
    license: '라이선스',

    // Theme
    darkMode: '다크 모드',
    lightMode: '라이트 모드',

    // Language
    language: '언어',

    // Initial screen
    startSession: '세션 시작',
    dragDropHint: 'MIDI 파일을 드래그하거나 클릭하여 열기',
    dropHere: '여기에 MIDI 파일을 드래그하세요',
    dropNow: '놓으세요!',
    supportsMidi: '.mid 및 .midi 지원',
    processing: '악보 처리 중...',

    // Piano Roll hints
    pianoRollHint: '드래그: 스크롤 | 클릭: 위치로 이동 | Ctrl+클릭: 반복 A | Shift+클릭: 반복 B',

    // Tablature
    pauseMarker: '쉼표',

    // Instrument Editor
    instrumentName: '악기 이름',
    instrumentIcon: '아이콘',
    numberOfStrings: '줄 수',
    numberOfFrets: '프렛 수',
    stringTuning: '줄 튜닝',
    selectTemplate: '템플릿 선택',
    saveInstrument: '악기 저장',
    cancel: '취소',

    // Errors
    error: '오류',
    loadingError: '로딩 오류',

    // Additional UI strings
    toggleToolbar: '도구 모음 표시/숨기기',
    showTracks: '트랙 표시',
    hideTracks: '트랙 숨기기',
    countInDelay: '3초 지연',
    volume: '볼륨',
    cifrado: '코드 차트',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: '인쇄 / PDF',
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