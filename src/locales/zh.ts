/**
 * Chinese (中文) translations
 */
export const zh = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: '返回',
    close: '关闭',
    settings: '设置',

    // Main sections
    tracks: '音轨',
    instruments: '乐器',
    tablature: '指法谱',
    notation: '乐谱',
    pianoRoll: '钢琴卷帘',

    // File operations
    openFile: '打开文件',
    openMidiFile: '打开MIDI文件',
    refreshList: '刷新列表',
    noFilesFound: '未找到文件',

    // Export
    export: '导出',
    exportAs: '导出为...',
    exportCifrado: '和弦谱 (.txt)',
    exportTablature: '指法谱 (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: '乐谱 (SVG)',

    // Playback controls
    play: '播放',
    pause: '暂停',
    stop: '停止',
    restart: '重新开始',
    rewind5s: '后退5秒',
    forward5s: '前进5秒',
    speed: '速度',

    // Transpose
    transpose: '移调',
    semitones: '半音',
    octave: '八度',
    autoFit: '自动适应乐器',
    undoTranspose: '撤销移调',
    redoTranspose: '重做移调',
    resetTranspose: '重置',
    minus1: '-1半音',
    plus1: '+1半音',
    minus8va: '-1八度',
    plus8va: '+1八度',

    // Loop
    loop: '循环',
    loopA: 'A点',
    loopB: 'B点',
    enableLoop: '启用循环',
    disableLoop: '禁用循环',
    clearLoop: '清除循环',

    // Metronome
    metronome: '节拍器',
    bpm: 'BPM',

    // Instrument
    instrument: '乐器',
    selectInstrument: '选择乐器',
    createCustom: '创建自定义乐器',
    editInstrument: '编辑',
    deleteInstrument: '删除',
    tuning: '调音',
    strings: '弦',
    frets: '品',

    // Tracks
    track: '音轨',
    noTracks: '无音轨',
    notes: '音符',
    mute: '静音',
    unmute: '取消静音',
    solo: '独奏',

    // Views
    showToolbar: '显示工具栏',
    hideToolbar: '隐藏工具栏',
    showPianoRoll: '显示钢琴卷帘',
    hidePianoRoll: '隐藏钢琴卷帘',

    // Messages
    notesOutOfRange: '音符超出乐器范围',
    instrumentNotFound: '未找到乐器',
    selectTrackToView: '选择音轨查看',
    selectTrackToViewSheet: '选择音轨查看乐谱',
    noFile: '无文件',
    dropFile: '拖放MIDI文件或点击打开',
    confirmClose: '关闭当前文件？未保存的更改将丢失。',

    // Modal titles
    midiInfo: 'MIDI信息',
    about: '关于',
    help: '帮助',
    userManual: '用户手册',

    // MIDI Info labels
    name: '名称',
    duration: '时长',
    fileSize: '大小',
    tempo: '速度',
    timeSignature: '拍号',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: '关于开发者',
    version: '版本',
    developer: '开发者',
    contact: '联系方式',
    website: '网站',
    license: '许可证',

    // Theme
    darkMode: '深色模式',
    lightMode: '浅色模式',

    // Language
    language: '语言',

    // Initial screen
    startSession: '开始您的会话',
    dragDropHint: '拖放MIDI文件或点击打开',
    dropHere: '将MIDI文件拖放到此处',
    dropNow: '松开!',
    supportsMidi: '支持 .mid 和 .midi',
    processing: '正在处理乐谱...',

    // Piano Roll hints
    pianoRollHint: '拖动: 滚动 | 点击: 跳转 | Ctrl+点击: 循环A | Shift+点击: 循环B',

    // Tablature
    pauseMarker: '休止',

    // Instrument Editor
    instrumentName: '乐器名称',
    instrumentIcon: '图标',
    numberOfStrings: '弦数',
    numberOfFrets: '品数',
    stringTuning: '弦调音',
    selectTemplate: '选择模板',
    saveInstrument: '保存乐器',
    cancel: '取消',

    // Errors
    error: '错误',
    loadingError: '加载错误',

    // Additional UI strings
    toggleToolbar: '显示/隐藏工具栏',
    showTracks: '显示音轨',
    hideTracks: '隐藏音轨',
    countInDelay: '延迟3秒',
    volume: '音量',
    cifrado: '和弦图',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: '打印 / PDF',
} as const;
