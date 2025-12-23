/**
 * Internationalization (i18n) Context
 * Supports multiple languages with localStorage persistence
 */
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Supported languages
export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja';

export const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
};

// Translation keys
interface Translations {
  // General
  appName: string;
  tracks: string;
  instruments: string;
  settings: string;

  // Header
  openFile: string;
  export: string;
  exportCifrado: string;
  exportTablature: string;
  exportPdf: string;

  // Player
  play: string;
  pause: string;
  stop: string;
  speed: string;
  metronome: string;
  loop: string;

  // Views
  tablature: string;
  notation: string;
  pianoRoll: string;

  // Tracks panel
  selectTrack: string;
  mute: string;
  unmute: string;
  volume: string;
  notes: string;

  // Instruments
  myInstruments: string;
  predefinedInstruments: string;
  createInstrument: string;
  editInstrument: string;
  deleteInstrument: string;
  fromTemplate: string;
  fromScratch: string;

  // Transpose
  transpose: string;
  semitones: string;

  // Info modal
  midiInfo: string;
  duration: string;
  tempo: string;
  timeSignature: string;

  // Theme
  darkMode: string;
  lightMode: string;
  language: string;

  // Messages
  noFile: string;
  dropFile: string;
  selectTrackToView: string;
  notesOutOfRange: string;
  confirmClose: string;

  // About & Help
  about: string;
  help: string;
  userManual: string;
  aboutDeveloper: string;
  version: string;
  developer: string;
  contact: string;
  website: string;
  license: string;

  // Initial screen
  startSession: string;
  dragDropHint: string;
  dropHere: string;
  dropNow: string;
  supportsMidi: string;
  openMidiFile: string;
  processing: string;
}

// All translations
const translations: Record<Language, Translations> = {
  es: {
    appName: 'Midi Tab Pro',
    tracks: 'Pistas',
    instruments: 'Instrumentos',
    settings: 'Ajustes',
    openFile: 'Abrir Archivo MIDI',
    export: 'Exportar',
    exportCifrado: 'Cifrado (Notas)',
    exportTablature: 'Tablatura (.tab)',
    exportPdf: 'Imprimir / PDF',
    play: 'Reproducir',
    pause: 'Pausar',
    stop: 'Detener',
    speed: 'Velocidad',
    metronome: 'Metrónomo',
    loop: 'Bucle',
    tablature: 'Tablatura',
    notation: 'Partitura',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Seleccionar pista',
    mute: 'Silenciar',
    unmute: 'Activar',
    volume: 'Volumen',
    notes: 'notas',
    myInstruments: 'Mis Instrumentos',
    predefinedInstruments: 'Instrumentos Predefinidos',
    createInstrument: 'Crear Instrumento Personalizado',
    editInstrument: 'Editar',
    deleteInstrument: 'Eliminar',
    fromTemplate: 'Desde plantilla',
    fromScratch: 'Desde cero',
    transpose: 'Transponer',
    semitones: 'semitonos',
    midiInfo: 'Información MIDI',
    duration: 'Duración',
    tempo: 'Tempo',
    timeSignature: 'Compás',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    language: 'Idioma',
    noFile: 'Sin archivo',
    dropFile: 'Arrastra un archivo MIDI o haz clic para abrir',
    selectTrackToView: 'Selecciona una pista para ver la tablatura',
    notesOutOfRange: 'notas fuera del rango del instrumento',
    confirmClose: '¿Salir y cerrar el archivo MIDI actual?',
    // About & Help
    about: 'Acerca de',
    help: 'Ayuda',
    userManual: 'Manual de usuario',
    aboutDeveloper: 'Sobre el desarrollador',
    version: 'Versión',
    developer: 'Desarrollador',
    contact: 'Contacto',
    website: 'Sitio web',
    license: 'Licencia',
    // Initial screen
    startSession: 'Comienza tu sesión',
    dragDropHint: 'Arrastra un archivo MIDI o haz clic para abrir',
    dropHere: 'Arrastra tu archivo MIDI aquí',
    dropNow: '¡Suéltalo!',
    supportsMidi: 'Soporta .mid y .midi',
    openMidiFile: 'Abrir archivo MIDI',
    processing: 'Procesando partitura...',
  },
  en: {
    appName: 'Midi Tab Pro',
    tracks: 'Tracks',
    instruments: 'Instruments',
    settings: 'Settings',
    openFile: 'Open MIDI File',
    export: 'Export',
    exportCifrado: 'Chord Chart (Notes)',
    exportTablature: 'Tablature (.tab)',
    exportPdf: 'Print / PDF',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    speed: 'Speed',
    metronome: 'Metronome',
    loop: 'Loop',
    tablature: 'Tablature',
    notation: 'Notation',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Select track',
    mute: 'Mute',
    unmute: 'Unmute',
    volume: 'Volume',
    notes: 'notes',
    myInstruments: 'My Instruments',
    predefinedInstruments: 'Predefined Instruments',
    createInstrument: 'Create Custom Instrument',
    editInstrument: 'Edit',
    deleteInstrument: 'Delete',
    fromTemplate: 'From template',
    fromScratch: 'From scratch',
    transpose: 'Transpose',
    semitones: 'semitones',
    midiInfo: 'MIDI Info',
    duration: 'Duration',
    tempo: 'Tempo',
    timeSignature: 'Time Signature',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    noFile: 'No file',
    dropFile: 'Drag a MIDI file or click to open',
    selectTrackToView: 'Select a track to view tablature',
    notesOutOfRange: 'notes out of instrument range',
    confirmClose: 'Exit and close the current MIDI file?',
    // About & Help
    about: 'About',
    help: 'Help',
    userManual: 'User Manual',
    aboutDeveloper: 'About the developer',
    version: 'Version',
    developer: 'Developer',
    contact: 'Contact',
    website: 'Website',
    license: 'License',
    // Initial screen
    startSession: 'Start your session',
    dragDropHint: 'Drag a MIDI file or click to open',
    dropHere: 'Drag your MIDI file here',
    dropNow: 'Drop it!',
    supportsMidi: 'Supports .mid and .midi',
    openMidiFile: 'Open MIDI file',
    processing: 'Processing sheet music...',
  },
  pt: {
    appName: 'Midi Tab Pro',
    tracks: 'Faixas',
    instruments: 'Instrumentos',
    settings: 'Configurações',
    openFile: 'Abrir Arquivo MIDI',
    export: 'Exportar',
    exportCifrado: 'Cifra (Notas)',
    exportTablature: 'Tablatura (.tab)',
    exportPdf: 'Imprimir / PDF',
    play: 'Reproduzir',
    pause: 'Pausar',
    stop: 'Parar',
    speed: 'Velocidade',
    metronome: 'Metrônomo',
    loop: 'Loop',
    tablature: 'Tablatura',
    notation: 'Partitura',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Selecionar faixa',
    mute: 'Silenciar',
    unmute: 'Ativar',
    volume: 'Volume',
    notes: 'notas',
    myInstruments: 'Meus Instrumentos',
    predefinedInstruments: 'Instrumentos Pré-definidos',
    createInstrument: 'Criar Instrumento Personalizado',
    editInstrument: 'Editar',
    deleteInstrument: 'Excluir',
    fromTemplate: 'Do modelo',
    fromScratch: 'Do zero',
    transpose: 'Transpor',
    semitones: 'semitons',
    midiInfo: 'Info MIDI',
    duration: 'Duração',
    tempo: 'Tempo',
    timeSignature: 'Fórmula de Compasso',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    language: 'Idioma',
    noFile: 'Sem arquivo',
    dropFile: 'Arraste um arquivo MIDI ou clique para abrir',
    selectTrackToView: 'Selecione uma faixa para ver a tablatura',
    notesOutOfRange: 'notas fora do alcance do instrumento',
    confirmClose: 'Sair e fechar o arquivo MIDI atual?',
    // About & Help
    about: 'Sobre',
    help: 'Ajuda',
    userManual: 'Manual do utilizador',
    aboutDeveloper: 'Sobre o desenvolvedor',
    version: 'Versão',
    developer: 'Desenvolvedor',
    contact: 'Contacto',
    website: 'Website',
    license: 'Licença',
    // Initial screen
    startSession: 'Inicie a sua sessão',
    dragDropHint: 'Arraste um ficheiro MIDI ou clique para abrir',
    dropHere: 'Arraste o seu ficheiro MIDI aqui',
    dropNow: 'Largue-o!',
    supportsMidi: 'Suporta .mid e .midi',
    openMidiFile: 'Abrir ficheiro MIDI',
    processing: 'A processar partitura...',
  },
  fr: {
    appName: 'Midi Tab Pro',
    tracks: 'Pistes',
    instruments: 'Instruments',
    settings: 'Paramètres',
    openFile: 'Ouvrir Fichier MIDI',
    export: 'Exporter',
    exportCifrado: 'Grille d\'accords (Notes)',
    exportTablature: 'Tablature (.tab)',
    exportPdf: 'Imprimer / PDF',
    play: 'Lecture',
    pause: 'Pause',
    stop: 'Arrêter',
    speed: 'Vitesse',
    metronome: 'Métronome',
    loop: 'Boucle',
    tablature: 'Tablature',
    notation: 'Partition',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Sélectionner piste',
    mute: 'Muet',
    unmute: 'Activer',
    volume: 'Volume',
    notes: 'notes',
    myInstruments: 'Mes Instruments',
    predefinedInstruments: 'Instruments Prédéfinis',
    createInstrument: 'Créer Instrument Personnalisé',
    editInstrument: 'Modifier',
    deleteInstrument: 'Supprimer',
    fromTemplate: 'Depuis modèle',
    fromScratch: 'Depuis zéro',
    transpose: 'Transposer',
    semitones: 'demi-tons',
    midiInfo: 'Info MIDI',
    duration: 'Durée',
    tempo: 'Tempo',
    timeSignature: 'Signature rythmique',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    language: 'Langue',
    noFile: 'Pas de fichier',
    dropFile: 'Glissez un fichier MIDI ou cliquez pour ouvrir',
    selectTrackToView: 'Sélectionnez une piste pour voir la tablature',
    notesOutOfRange: 'notes hors de portée de l\'instrument',
    confirmClose: 'Quitter et fermer le fichier MIDI actuel?',
    // About & Help
    about: 'À propos',
    help: 'Aide',
    userManual: 'Manuel d\'utilisation',
    aboutDeveloper: 'À propos du développeur',
    version: 'Version',
    developer: 'Développeur',
    contact: 'Contact',
    website: 'Site web',
    license: 'Licence',
    // Initial screen
    startSession: 'Commencez votre session',
    dragDropHint: 'Glissez un fichier MIDI ou cliquez pour ouvrir',
    dropHere: 'Glissez votre fichier MIDI ici',
    dropNow: 'Lâchez-le!',
    supportsMidi: 'Supporte .mid et .midi',
    openMidiFile: 'Ouvrir fichier MIDI',
    processing: 'Traitement de la partition...',
  },
  de: {
    appName: 'Midi Tab Pro',
    tracks: 'Spuren',
    instruments: 'Instrumente',
    settings: 'Einstellungen',
    openFile: 'MIDI-Datei öffnen',
    export: 'Exportieren',
    exportCifrado: 'Akkordtabelle (Noten)',
    exportTablature: 'Tabulatur (.tab)',
    exportPdf: 'Drucken / PDF',
    play: 'Abspielen',
    pause: 'Pause',
    stop: 'Stoppen',
    speed: 'Geschwindigkeit',
    metronome: 'Metronom',
    loop: 'Schleife',
    tablature: 'Tabulatur',
    notation: 'Notation',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Spur auswählen',
    mute: 'Stumm',
    unmute: 'Aktivieren',
    volume: 'Lautstärke',
    notes: 'Noten',
    myInstruments: 'Meine Instrumente',
    predefinedInstruments: 'Vordefinierte Instrumente',
    createInstrument: 'Eigenes Instrument erstellen',
    editInstrument: 'Bearbeiten',
    deleteInstrument: 'Löschen',
    fromTemplate: 'Aus Vorlage',
    fromScratch: 'Von Grund auf',
    transpose: 'Transponieren',
    semitones: 'Halbtöne',
    midiInfo: 'MIDI-Info',
    duration: 'Dauer',
    tempo: 'Tempo',
    timeSignature: 'Taktart',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    language: 'Sprache',
    noFile: 'Keine Datei',
    dropFile: 'MIDI-Datei hierher ziehen oder klicken',
    selectTrackToView: 'Wählen Sie eine Spur, um die Tabulatur anzuzeigen',
    notesOutOfRange: 'Noten außerhalb des Instrumentbereichs',
    confirmClose: 'Beenden und aktuelle MIDI-Datei schließen?',
    // About & Help
    about: 'Über',
    help: 'Hilfe',
    userManual: 'Benutzerhandbuch',
    aboutDeveloper: 'Über den Entwickler',
    version: 'Version',
    developer: 'Entwickler',
    contact: 'Kontakt',
    website: 'Website',
    license: 'Lizenz',
    // Initial screen
    startSession: 'Starten Sie Ihre Sitzung',
    dragDropHint: 'MIDI-Datei hierher ziehen oder klicken',
    dropHere: 'Ziehen Sie Ihre MIDI-Datei hierher',
    dropNow: 'Loslassen!',
    supportsMidi: 'Unterstützt .mid und .midi',
    openMidiFile: 'MIDI-Datei öffnen',
    processing: 'Verarbeite Noten...',
  },
  it: {
    appName: 'Midi Tab Pro',
    tracks: 'Tracce',
    instruments: 'Strumenti',
    settings: 'Impostazioni',
    openFile: 'Apri File MIDI',
    export: 'Esporta',
    exportCifrado: 'Sigle (Note)',
    exportTablature: 'Tablatura (.tab)',
    exportPdf: 'Stampa / PDF',
    play: 'Riproduci',
    pause: 'Pausa',
    stop: 'Ferma',
    speed: 'Velocità',
    metronome: 'Metronomo',
    loop: 'Ciclo',
    tablature: 'Tablatura',
    notation: 'Spartito',
    pianoRoll: 'Piano Roll',
    selectTrack: 'Seleziona traccia',
    mute: 'Muto',
    unmute: 'Attiva',
    volume: 'Volume',
    notes: 'note',
    myInstruments: 'I Miei Strumenti',
    predefinedInstruments: 'Strumenti Predefiniti',
    createInstrument: 'Crea Strumento Personalizzato',
    editInstrument: 'Modifica',
    deleteInstrument: 'Elimina',
    fromTemplate: 'Da modello',
    fromScratch: 'Da zero',
    transpose: 'Trasporta',
    semitones: 'semitoni',
    midiInfo: 'Info MIDI',
    duration: 'Durata',
    tempo: 'Tempo',
    timeSignature: 'Tempo',
    darkMode: 'Modalità Scura',
    lightMode: 'Modalità Chiara',
    language: 'Lingua',
    noFile: 'Nessun file',
    dropFile: 'Trascina un file MIDI o clicca per aprire',
    selectTrackToView: 'Seleziona una traccia per vedere la tablatura',
    notesOutOfRange: 'note fuori dalla gamma dello strumento',
    confirmClose: 'Uscire e chiudere il file MIDI corrente?',
    // About & Help
    about: 'Informazioni',
    help: 'Aiuto',
    userManual: 'Manuale utente',
    aboutDeveloper: 'Informazioni sullo sviluppatore',
    version: 'Versione',
    developer: 'Sviluppatore',
    contact: 'Contatto',
    website: 'Sito web',
    license: 'Licenza',
    // Initial screen
    startSession: 'Inizia la tua sessione',
    dragDropHint: 'Trascina un file MIDI o clicca per aprire',
    dropHere: 'Trascina il tuo file MIDI qui',
    dropNow: 'Rilascialo!',
    supportsMidi: 'Supporta .mid e .midi',
    openMidiFile: 'Apri file MIDI',
    processing: 'Elaborazione spartito...',
  },
  zh: {
    appName: 'Midi Tab Pro',
    tracks: '音轨',
    instruments: '乐器',
    settings: '设置',
    openFile: '打开MIDI文件',
    export: '导出',
    exportCifrado: '和弦谱（音符）',
    exportTablature: '指法谱 (.tab)',
    exportPdf: '打印 / PDF',
    play: '播放',
    pause: '暂停',
    stop: '停止',
    speed: '速度',
    metronome: '节拍器',
    loop: '循环',
    tablature: '指法谱',
    notation: '乐谱',
    pianoRoll: '钢琴卷帘',
    selectTrack: '选择音轨',
    mute: '静音',
    unmute: '取消静音',
    volume: '音量',
    notes: '音符',
    myInstruments: '我的乐器',
    predefinedInstruments: '预设乐器',
    createInstrument: '创建自定义乐器',
    editInstrument: '编辑',
    deleteInstrument: '删除',
    fromTemplate: '从模板',
    fromScratch: '从零开始',
    transpose: '移调',
    semitones: '半音',
    midiInfo: 'MIDI信息',
    duration: '时长',
    tempo: '速度',
    timeSignature: '拍号',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    language: '语言',
    noFile: '无文件',
    dropFile: '拖放MIDI文件或点击打开',
    selectTrackToView: '选择音轨查看指法谱',
    notesOutOfRange: '音符超出乐器范围',
    confirmClose: '退出并关闭当前MIDI文件？',
    // About & Help
    about: '关于',
    help: '帮助',
    userManual: '用户手册',
    aboutDeveloper: '关于开发者',
    version: '版本',
    developer: '开发者',
    contact: '联系方式',
    website: '网站',
    license: '许可证',
    // Initial screen
    startSession: '开始您的会话',
    dragDropHint: '拖放MIDI文件或点击打开',
    dropHere: '将MIDI文件拖放到此处',
    dropNow: '松开!',
    supportsMidi: '支持 .mid 和 .midi',
    openMidiFile: '打开MIDI文件',
    processing: '正在处理乐谱...',
  },
  ja: {
    appName: 'Midi Tab Pro',
    tracks: 'トラック',
    instruments: '楽器',
    settings: '設定',
    openFile: 'MIDIファイルを開く',
    export: 'エクスポート',
    exportCifrado: 'コード譜（音符）',
    exportTablature: 'タブ譜 (.tab)',
    exportPdf: '印刷 / PDF',
    play: '再生',
    pause: '一時停止',
    stop: '停止',
    speed: '速度',
    metronome: 'メトロノーム',
    loop: 'ループ',
    tablature: 'タブ譜',
    notation: '楽譜',
    pianoRoll: 'ピアノロール',
    selectTrack: 'トラックを選択',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    volume: '音量',
    notes: '音符',
    myInstruments: 'マイ楽器',
    predefinedInstruments: 'プリセット楽器',
    createInstrument: 'カスタム楽器を作成',
    editInstrument: '編集',
    deleteInstrument: '削除',
    fromTemplate: 'テンプレートから',
    fromScratch: 'ゼロから',
    transpose: '移調',
    semitones: '半音',
    midiInfo: 'MIDI情報',
    duration: '長さ',
    tempo: 'テンポ',
    timeSignature: '拍子',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    language: '言語',
    noFile: 'ファイルなし',
    dropFile: 'MIDIファイルをドラッグまたはクリックして開く',
    selectTrackToView: 'タブ譜を表示するトラックを選択',
    notesOutOfRange: '楽器の範囲外の音符',
    confirmClose: '現在のMIDIファイルを閉じて終了しますか？',
    // About & Help
    about: 'このアプリについて',
    help: 'ヘルプ',
    userManual: 'ユーザーマニュアル',
    aboutDeveloper: '開発者について',
    version: 'バージョン',
    developer: '開発者',
    contact: '連絡先',
    website: 'ウェブサイト',
    license: 'ライセンス',
    // Initial screen
    startSession: 'セッションを開始',
    dragDropHint: 'MIDIファイルをドラッグまたはクリックして開く',
    dropHere: 'MIDIファイルをここにドラッグ',
    dropNow: 'ドロップ!',
    supportsMidi: '.mid と .midi をサポート',
    openMidiFile: 'MIDIファイルを開く',
    processing: '楽譜を処理中...',
  },
};

// LocalStorage key
const LANG_KEY = 'midi-visualizer-language';

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && saved in LANGUAGES) {
      return saved as Language;
    }
  } catch {
    // Fallback on error
  }
  return 'en'; // Default to English
}

// Context
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Provider
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      console.error('Error saving language:', e);
    }
  }, []);

  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for just translations
export function useTranslations() {
  return useI18n().t;
}

export default I18nProvider;
