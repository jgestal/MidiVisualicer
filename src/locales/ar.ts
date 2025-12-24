/**
 * Arabic (العربية) translations
 * Note: Arabic is RTL (right-to-left) language
 */
export const ar = {
    // App
    appName: 'Midi Tab Pro',

    // Navigation
    back: 'رجوع',
    close: 'إغلاق',
    settings: 'إعدادات',

    // Main sections
    tracks: 'المسارات',
    instruments: 'الآلات',
    tablature: 'تابلتشر',
    notation: 'النوتة الموسيقية',
    pianoRoll: 'لفة البيانو',

    // File operations
    openFile: 'فتح ملف',
    openMidiFile: 'فتح ملف MIDI',
    refreshList: 'تحديث القائمة',
    noFilesFound: 'لم يتم العثور على ملفات',

    // Export
    export: 'تصدير',
    exportAs: 'تصدير كـ...',
    exportCifrado: 'مخطط الأوتار (.txt)',
    exportTablature: 'تابلتشر (.tab)',
    exportPdf: 'PDF (.pdf)',
    sheetSvg: 'النوتة الموسيقية (SVG)',

    // Playback controls
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    stop: 'إيقاف',
    restart: 'إعادة البدء',
    rewind5s: 'تراجع 5 ثوانٍ',
    forward5s: 'تقدم 5 ثوانٍ',
    speed: 'السرعة',
    keyboardShortcuts: 'Keyboard Shortcuts',

    // Transpose
    transpose: 'تبديل النغمة',
    semitones: 'نصف نغمة',
    octave: 'أوكتاف',
    autoFit: 'ملاءمة تلقائية للآلة',
    undoTranspose: 'تراجع عن التبديل',
    redoTranspose: 'إعادة التبديل',
    resetTranspose: 'إعادة تعيين',
    minus1: '-1 نصف نغمة',
    plus1: '+1 نصف نغمة',
    minus8va: '-1 أوكتاف',
    plus8va: '+1 أوكتاف',

    // Loop
    loop: 'تكرار',
    loopA: 'النقطة أ',
    loopB: 'النقطة ب',
    enableLoop: 'تفعيل التكرار',
    disableLoop: 'تعطيل التكرار',
    clearLoop: 'مسح التكرار',

    // Metronome
    metronome: 'المترونوم',
    bpm: 'نبضة/دقيقة',

    // Instrument
    instrument: 'الآلة',
    selectInstrument: 'اختر الآلة',
    createCustom: 'إنشاء آلة مخصصة',
    editInstrument: 'تعديل',
    deleteInstrument: 'حذف',
    tuning: 'الضبط',
    strings: 'أوتار',
    frets: 'دساتين',

    // Tracks
    track: 'مسار',
    noTracks: 'لا توجد مسارات',
    notes: 'نوتات',
    mute: 'كتم',
    unmute: 'إلغاء الكتم',
    solo: 'منفرد',

    // Views
    showToolbar: 'إظهار شريط الأدوات',
    hideToolbar: 'إخفاء شريط الأدوات',
    showPianoRoll: 'إظهار لفة البيانو',
    hidePianoRoll: 'إخفاء لفة البيانو',

    // Messages
    notesOutOfRange: 'نوتات خارج نطاق الآلة',
    instrumentNotFound: 'الآلة غير موجودة',
    selectTrackToView: 'اختر مساراً للعرض',
    selectTrackToViewSheet: 'اختر مساراً لعرض النوتة الموسيقية',
    noFile: 'لا يوجد ملف',
    dropFile: 'اسحب ملف MIDI أو انقر للفتح',
    confirmClose: 'إغلاق الملف الحالي؟ ستفقد التغييرات غير المحفوظة.',

    // Modal titles
    midiInfo: 'معلومات MIDI',
    about: 'حول',
    help: 'مساعدة',
    userManual: 'دليل المستخدم',

    // MIDI Info labels
    name: 'الاسم',
    duration: 'المدة',
    fileSize: 'الحجم',
    tempo: 'الإيقاع',
    timeSignature: 'الميزان',
    ppq: 'PPQ',

    // About modal
    aboutDeveloper: 'حول المطور',
    version: 'الإصدار',
    developer: 'المطور',
    contact: 'التواصل',
    website: 'الموقع',
    license: 'الرخصة',

    // Theme
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',

    // Language
    language: 'اللغة',

    // Initial screen
    startSession: 'ابدأ جلستك',
    dragDropHint: 'اسحب ملف MIDI أو انقر للفتح',
    dropHere: 'اسحب ملف MIDI هنا',
    dropNow: 'أفلت الآن!',
    supportsMidi: 'يدعم .mid و .midi',
    processing: 'جاري معالجة النوتة...',

    // Piano Roll hints
    pianoRollHint: 'سحب: تمرير | نقر: الانتقال للموضع | Ctrl+نقر: تكرار أ | Shift+نقر: تكرار ب',

    // Tablature
    pauseMarker: 'وقفة',

    // Instrument Editor
    instrumentName: 'اسم الآلة',
    instrumentIcon: 'الأيقونة',
    numberOfStrings: 'عدد الأوتار',
    numberOfFrets: 'عدد الدساتين',
    stringTuning: 'ضبط الأوتار',
    selectTemplate: 'اختر قالباً',
    saveInstrument: 'حفظ الآلة',
    cancel: 'إلغاء',

    // Errors
    error: 'خطأ',
    loadingError: 'خطأ في التحميل',

    // Additional UI strings
    toggleToolbar: 'إظهار/إخفاء شريط الأدوات',
    showTracks: 'إظهار المسارات',
    hideTracks: 'إخفاء المسارات',
    countInDelay: 'تأخير 3 ثوانٍ',
    volume: 'الصوت',
    cifrado: 'مخطط الأوتار',
    word: 'Word / Doc (.doc)',
    musicxml: 'MusicXML (GP/MuseScore)',
    printPdf: 'طباعة / PDF',
} as const;
