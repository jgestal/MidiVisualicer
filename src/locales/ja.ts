/**
 * Japanese (日本語) translations
 */
export const ja = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: '戻る',
    close: '閉じる',
    settings: '設定',

    // Main sections
    tracks: 'トラック',
    instruments: '楽器',
    tablature: 'タブ譜',
    notation: '楽譜',
    pianoRoll: 'ピアノロール',
    simplify: '簡略化',
    simplified: '簡略化済み',
    simplifyTooltip: 'コードの最高音のみを保持し、演奏性を最適化します',

    // File operations
    openFile: 'ファイルを開く',
    openMidiFile: 'MIDIファイルを開く',
    refreshList: 'リストを更新',
    noFilesFound: 'ファイルが見つかりません',

    // Export
    export: 'エクスポート',
    exportAs: 'エクスポート形式...',
    exportCifrado: 'コード譜 (.txt)',
    exportTablature: 'タブ譜 (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: '楽譜 (SVG)',

    // Playback controls
    play: '再生',
    pause: '一時停止',
    stop: '停止',
    restart: '最初から',
    rewind5s: '5秒戻る',
    forward5s: '5秒進む',
    speed: '速度',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: '移調',
    semitones: '半音',
    octave: 'オクターブ',
    autoFit: '楽器に自動調整',
    undoTranspose: '移調を元に戻す',
    redoTranspose: '移調をやり直す',
    resetTranspose: 'リセット',
    minus1: '-1半音',
    plus1: '+1半音',
    minus8va: '-1オクターブ',
    plus8va: '+1オクターブ',

    // Loop
    loop: 'ループ',
    loopA: 'ポイントA',
    loopB: 'ポイントB',
    enableLoop: 'ループを有効',
    disableLoop: 'ループを無効',
    clearLoop: 'ループをクリア',

    // Metronome
    metronome: 'メトロノーム',
    bpm: 'BPM',

    // Instrument
    instrument: '楽器',
    selectInstrument: '楽器を選択',
    createCustom: 'カスタム楽器を作成',
    editInstrument: '編集',
    deleteInstrument: '削除',
    tuning: 'チューニング',
    strings: '弦',
    frets: 'フレット',

    // Tracks
    track: 'トラック',
    noTracks: 'トラックなし',
    notes: '音符',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    solo: 'ソロ',

    // Views
    showToolbar: 'ツールバーを表示',
    hideToolbar: 'ツールバーを非表示',
    showPianoRoll: 'ピアノロールを表示',
    hidePianoRoll: 'ピアノロールを非表示',

    // Messages
    notesOutOfRange: '楽器の範囲外の音符',
    instrumentNotFound: '楽器が見つかりません',
    selectTrackToView: '表示するトラックを選択',
    selectTrackToViewSheet: '楽譜を表示するトラックを選択',
    noFile: 'ファイルなし',
    dropFile: 'MIDIファイルをドラッグまたはクリックして開く',
    confirmClose: '現在のファイルを閉じますか？保存されていない変更は失われます。',

    // Modal titles
    midiInfo: 'MIDI情報',
    about: 'について',
    help: 'ヘルプ',
    userManual: 'ユーザーマニュアル',

    // MIDI Info labels
    name: '名前',
    duration: '長さ',
    fileSize: 'サイズ',
    tempo: 'テンポ',
    timeSignature: '拍子',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: '開発者について',
    version: 'バージョン',
    developer: '開発者',
    contact: '連絡先',
    website: 'ウェブサイト',
    license: 'ライセンス',

    // Theme
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',

    // Language
    language: '言語',

    // Initial screen
    startSession: 'セッションを開始',
    dragDropHint: 'MIDIファイルをドラッグまたはクリックして開く',
    dropHere: 'MIDIファイルをここにドラッグ',
    dropNow: 'ドロップ!',
    supportsMidi: '.mid と .midi をサポート',
    processing: '楽譜を処理中...',

    // Piano Roll hints
    pianoRollHint: 'ドラッグ: スクロール | クリック: 位置へ移動 | Ctrl+クリック: ループA | Shift+クリック: ループB',

    // Tablature
    pauseMarker: '休符',

    // Instrument Editor
    instrumentName: '楽器名',
    instrumentIcon: 'アイコン',
    numberOfStrings: '弦の数',
    numberOfFrets: 'フレット数',
    stringTuning: '弦のチューニング',
    selectTemplate: 'テンプレートを選択',
    saveInstrument: '楽器を保存',
    cancel: 'キャンセル',

    // Errors
    error: 'エラー',
    loadingError: '読み込みエラー',

    // Additional UI strings
    toggleToolbar: 'ツールバー表示/非表示',
    showTracks: 'トラック表示',
    hideTracks: 'トラック非表示',
    countInDelay: '3秒遅延',
    volume: '音量',
    cifrado: 'コード譜',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: '印刷 / PDF',
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

    // New features
    bar: 'Bar',
    copyLine: 'Copy line',
    zoom: 'Zoom',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    recentFiles: 'Recent files',
    noRecentFiles: 'No recent files',
    clearRecent: 'Clear history',
    practiceMode: 'Practice mode',
    pauseAfterBars: 'Pause every',
    bars: 'bars',
    detectedChords: 'Detected chords',
} as const;