/**
 * HelpModal - Modal showing user manual content based on selected language
 */
import { X } from 'lucide-react';
import { useI18n, type Language } from '@/shared/context/I18nContext';

interface HelpModalProps {
    onClose: () => void;
}

// User manuals in different languages
const MANUALS: Record<Language, { title: string; sections: { heading: string; content: string }[] }> = {
    en: {
        title: 'User Manual',
        sections: [
            {
                heading: '1. Getting Started',
                content: 'Drag and drop a MIDI file onto the application or click to open a file browser. Once loaded, you will see the tablature and notation for your music.',
            },
            {
                heading: '2. Selecting Instruments',
                content: 'Click the instrument button in the toolbar to choose from various stringed instruments. You can also create custom instruments with your own tuning.',
            },
            {
                heading: '3. Playback Controls',
                content: 'Use the play, pause, and stop buttons to control playback. Adjust the speed using the speed dropdown. Enable the metronome for timing assistance.',
            },
            {
                heading: '4. Transposition',
                content: 'The transpose controls allow you to shift all notes up or down by semitones or octaves. Use "Auto" to automatically fit notes to your instrument range.',
            },
            {
                heading: '5. Loop Function',
                content: 'Use the Loop A-B controls to set start and end points for repeated practice of specific sections.',
            },
            {
                heading: '6. Exporting',
                content: 'Export your tablature as text (TXT), formatted tablature (TAB), or PDF for printing or sharing.',
            },
        ],
    },
    es: {
        title: 'Manual de Usuario',
        sections: [
            {
                heading: '1. Empezando',
                content: 'Arrastra y suelta un archivo MIDI en la aplicación o haz clic para abrir el explorador de archivos. Una vez cargado, verás la tablatura y notación de tu música.',
            },
            {
                heading: '2. Selección de Instrumentos',
                content: 'Haz clic en el botón de instrumento en la barra de herramientas para elegir entre varios instrumentos de cuerda. También puedes crear instrumentos personalizados con tu propia afinación.',
            },
            {
                heading: '3. Controles de Reproducción',
                content: 'Usa los botones de reproducir, pausar y detener para controlar la reproducción. Ajusta la velocidad usando el menú desplegable. Activa el metrónomo para ayudarte con el ritmo.',
            },
            {
                heading: '4. Transposición',
                content: 'Los controles de transposición te permiten desplazar todas las notas hacia arriba o abajo por semitonos u octavas. Usa "Auto" para ajustar automáticamente las notas al rango de tu instrumento.',
            },
            {
                heading: '5. Función de Bucle',
                content: 'Usa los controles de Bucle A-B para establecer puntos de inicio y fin para practicar secciones específicas de forma repetida.',
            },
            {
                heading: '6. Exportación',
                content: 'Exporta tu tablatura como texto (TXT), tablatura formateada (TAB) o PDF para imprimir o compartir.',
            },
        ],
    },
    pt: {
        title: 'Manual do Utilizador',
        sections: [
            {
                heading: '1. Começar',
                content: 'Arraste e solte um ficheiro MIDI na aplicação ou clique para abrir o explorador de ficheiros. Após carregar, verá a tablatura e notação da sua música.',
            },
            {
                heading: '2. Seleção de Instrumentos',
                content: 'Clique no botão de instrumento na barra de ferramentas para escolher entre vários instrumentos de cordas. Também pode criar instrumentos personalizados com a sua própria afinação.',
            },
            {
                heading: '3. Controlos de Reprodução',
                content: 'Use os botões de reproduzir, pausar e parar para controlar a reprodução. Ajuste a velocidade usando o menu suspenso. Ative o metrónomo para ajudar com o ritmo.',
            },
            {
                heading: '4. Transposição',
                content: 'Os controlos de transposição permitem deslocar todas as notas para cima ou para baixo por semitons ou oitavas. Use "Auto" para ajustar automaticamente as notas ao alcance do seu instrumento.',
            },
            {
                heading: '5. Função de Loop',
                content: 'Use os controlos de Loop A-B para definir pontos de início e fim para praticar secções específicas repetidamente.',
            },
            {
                heading: '6. Exportação',
                content: 'Exporte a sua tablatura como texto (TXT), tablatura formatada (TAB) ou PDF para imprimir ou partilhar.',
            },
        ],
    },
    fr: {
        title: 'Manuel d\'Utilisation',
        sections: [
            {
                heading: '1. Démarrage',
                content: 'Glissez et déposez un fichier MIDI dans l\'application ou cliquez pour ouvrir l\'explorateur de fichiers. Une fois chargé, vous verrez la tablature et la notation de votre musique.',
            },
            {
                heading: '2. Sélection d\'Instruments',
                content: 'Cliquez sur le bouton d\'instrument dans la barre d\'outils pour choisir parmi différents instruments à cordes. Vous pouvez également créer des instruments personnalisés avec votre propre accordage.',
            },
            {
                heading: '3. Contrôles de Lecture',
                content: 'Utilisez les boutons lecture, pause et arrêt pour contrôler la lecture. Ajustez la vitesse à l\'aide du menu déroulant. Activez le métronome pour vous aider avec le rythme.',
            },
            {
                heading: '4. Transposition',
                content: 'Les contrôles de transposition vous permettent de décaler toutes les notes vers le haut ou le bas par demi-tons ou octaves. Utilisez "Auto" pour adapter automatiquement les notes à la portée de votre instrument.',
            },
            {
                heading: '5. Fonction de Boucle',
                content: 'Utilisez les contrôles de Boucle A-B pour définir des points de départ et de fin pour pratiquer des sections spécifiques de manière répétée.',
            },
            {
                heading: '6. Exportation',
                content: 'Exportez votre tablature en texte (TXT), tablature formatée (TAB) ou PDF pour l\'impression ou le partage.',
            },
        ],
    },
    de: {
        title: 'Benutzerhandbuch',
        sections: [
            {
                heading: '1. Erste Schritte',
                content: 'Ziehen Sie eine MIDI-Datei in die Anwendung oder klicken Sie, um den Dateibrowser zu öffnen. Nach dem Laden sehen Sie die Tabulatur und Notation Ihrer Musik.',
            },
            {
                heading: '2. Instrumentenauswahl',
                content: 'Klicken Sie auf die Instrumentenschaltfläche in der Werkzeugleiste, um aus verschiedenen Saiteninstrumenten zu wählen. Sie können auch benutzerdefinierte Instrumente mit eigener Stimmung erstellen.',
            },
            {
                heading: '3. Wiedergabesteuerung',
                content: 'Verwenden Sie die Schaltflächen Abspielen, Pause und Stopp zur Steuerung der Wiedergabe. Passen Sie die Geschwindigkeit über das Dropdown-Menü an. Aktivieren Sie das Metronom für Rhythmushilfe.',
            },
            {
                heading: '4. Transposition',
                content: 'Mit den Transpositionssteuerungen können Sie alle Noten um Halbtöne oder Oktaven nach oben oder unten verschieben. Verwenden Sie "Auto", um die Noten automatisch an den Bereich Ihres Instruments anzupassen.',
            },
            {
                heading: '5. Loop-Funktion',
                content: 'Verwenden Sie die Loop A-B Steuerungen, um Start- und Endpunkte für wiederholtes Üben bestimmter Abschnitte festzulegen.',
            },
            {
                heading: '6. Export',
                content: 'Exportieren Sie Ihre Tabulatur als Text (TXT), formatierte Tabulatur (TAB) oder PDF zum Drucken oder Teilen.',
            },
        ],
    },
    it: {
        title: 'Manuale Utente',
        sections: [
            {
                heading: '1. Per Iniziare',
                content: 'Trascina e rilascia un file MIDI nell\'applicazione o clicca per aprire il browser dei file. Una volta caricato, vedrai la tablatura e la notazione della tua musica.',
            },
            {
                heading: '2. Selezione Strumenti',
                content: 'Clicca sul pulsante strumento nella barra degli strumenti per scegliere tra vari strumenti a corde. Puoi anche creare strumenti personalizzati con la tua accordatura.',
            },
            {
                heading: '3. Controlli di Riproduzione',
                content: 'Usa i pulsanti play, pausa e stop per controllare la riproduzione. Regola la velocità usando il menu a discesa. Attiva il metronomo per aiutarti con il ritmo.',
            },
            {
                heading: '4. Trasposizione',
                content: 'I controlli di trasposizione ti permettono di spostare tutte le note su o giù per semitoni o ottave. Usa "Auto" per adattare automaticamente le note alla gamma del tuo strumento.',
            },
            {
                heading: '5. Funzione Loop',
                content: 'Usa i controlli Loop A-B per impostare punti di inizio e fine per esercitarti ripetutamente su sezioni specifiche.',
            },
            {
                heading: '6. Esportazione',
                content: 'Esporta la tua tablatura come testo (TXT), tablatura formattata (TAB) o PDF per la stampa o la condivisione.',
            },
        ],
    },
    zh: {
        title: '用户手册',
        sections: [
            {
                heading: '1. 开始使用',
                content: '将MIDI文件拖放到应用程序中，或点击打开文件浏览器。加载后，您将看到音乐的指法谱和乐谱。',
            },
            {
                heading: '2. 选择乐器',
                content: '点击工具栏中的乐器按钮，从各种弦乐器中选择。您还可以创建自定义乐器和调音。',
            },
            {
                heading: '3. 播放控制',
                content: '使用播放、暂停和停止按钮控制播放。使用下拉菜单调整速度。启用节拍器以帮助把握节奏。',
            },
            {
                heading: '4. 移调',
                content: '移调控件允许您将所有音符向上或向下移动半音或八度。使用"自动"将音符自动调整到乐器范围内。',
            },
            {
                heading: '5. 循环功能',
                content: '使用循环A-B控件设置起点和终点，以反复练习特定部分。',
            },
            {
                heading: '6. 导出',
                content: '将您的指法谱导出为文本（TXT）、格式化指法谱（TAB）或PDF以供打印或分享。',
            },
        ],
    },
    ja: {
        title: 'ユーザーマニュアル',
        sections: [
            {
                heading: '1. 使い始め',
                content: 'MIDIファイルをアプリケーションにドラッグ＆ドロップするか、クリックしてファイルブラウザを開きます。読み込むと、音楽のタブ譜と楽譜が表示されます。',
            },
            {
                heading: '2. 楽器の選択',
                content: 'ツールバーの楽器ボタンをクリックして、さまざまな弦楽器から選択します。独自のチューニングでカスタム楽器を作成することもできます。',
            },
            {
                heading: '3. 再生コントロール',
                content: '再生、一時停止、停止ボタンを使用して再生を制御します。ドロップダウンメニューで速度を調整します。リズム補助のためにメトロノームを有効にします。',
            },
            {
                heading: '4. 移調',
                content: '移調コントロールを使用すると、すべての音符を半音またはオクターブ単位で上下に移動できます。「自動」を使用すると、楽器の範囲に合わせて音符が自動的に調整されます。',
            },
            {
                heading: '5. ループ機能',
                content: 'ループA-Bコントロールを使用して、特定のセクションを繰り返し練習するための開始点と終了点を設定します。',
            },
            {
                heading: '6. エクスポート',
                content: 'タブ譜をテキスト（TXT）、フォーマット済みタブ譜（TAB）、またはPDFとして印刷用や共有用にエクスポートします。',
            },
        ],
    },
};

export function HelpModal({ onClose }: HelpModalProps) {
    const { language } = useI18n();
    const manual = MANUALS[language] || MANUALS.en;

    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-header">
                    <h2>{manual.title}</h2>
                    <button className="help-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="help-content">
                    {manual.sections.map((section, index) => (
                        <div key={index} className="help-section">
                            <h3>{section.heading}</h3>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .help-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          animation: fadeIn var(--transition-fast) forwards;
        }

        .help-modal {
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .help-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .help-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--color-text-primary);
        }

        .help-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .help-close-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .help-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .help-section {
          margin-bottom: 20px;
        }

        .help-section:last-child {
          margin-bottom: 0;
        }

        .help-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 8px 0;
        }

        .help-section p {
          font-size: 13px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin: 0;
          padding-left: 16px;
          border-left: 2px solid var(--color-accent-primary);
        }
      `}</style>
        </div>
    );
}

export default HelpModal;
