/**
 * HelpModal - Modal showing user manual content based on selected language
 */
import { X } from 'lucide-react';
import { useI18n, type Language } from '@/shared/context/I18nContext';
import './HelpModal.css';

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
    // en_us uses same content as en
    en_us: {
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
    ru: {
        title: 'Руководство пользователя',
        sections: [
            {
                heading: '1. Начало работы',
                content: 'Перетащите MIDI-файл в приложение или нажмите, чтобы открыть файловый браузер. После загрузки вы увидите табулатуру и нотацию вашей музыки.',
            },
            {
                heading: '2. Выбор инструментов',
                content: 'Нажмите кнопку инструмента на панели инструментов, чтобы выбрать из различных струнных инструментов. Вы также можете создавать пользовательские инструменты с собственной настройкой.',
            },
            {
                heading: '3. Управление воспроизведением',
                content: 'Используйте кнопки воспроизведения, паузы и остановки для управления воспроизведением. Регулируйте скорость с помощью выпадающего меню. Включите метроном для помощи с ритмом.',
            },
            {
                heading: '4. Транспозиция',
                content: 'Элементы управления транспозицией позволяют сдвигать все ноты вверх или вниз на полутоны или октавы. Используйте «Авто» для автоматической подстройки нот под диапазон вашего инструмента.',
            },
            {
                heading: '5. Функция петли',
                content: 'Используйте элементы управления петлей A-B для установки начальной и конечной точек для повторной практики определённых секций.',
            },
            {
                heading: '6. Экспорт',
                content: 'Экспортируйте вашу табулатуру как текст (TXT), форматированную табулатуру (TAB) или PDF для печати или обмена.',
            },
        ],
    },
    ko: {
        title: '사용자 매뉴얼',
        sections: [
            {
                heading: '1. 시작하기',
                content: 'MIDI 파일을 애플리케이션에 드래그 앤 드롭하거나 클릭하여 파일 브라우저를 엽니다. 로드되면 음악의 타브악보와 악보를 볼 수 있습니다.',
            },
            {
                heading: '2. 악기 선택',
                content: '도구 모음의 악기 버튼을 클릭하여 다양한 현악기 중에서 선택합니다. 자신만의 튜닝으로 사용자 정의 악기를 만들 수도 있습니다.',
            },
            {
                heading: '3. 재생 컨트롤',
                content: '재생, 일시정지, 정지 버튼을 사용하여 재생을 제어합니다. 드롭다운 메뉴를 사용하여 속도를 조절합니다. 리듬 보조를 위해 메트로놈을 활성화합니다.',
            },
            {
                heading: '4. 조옮김',
                content: '조옮김 컨트롤을 사용하면 모든 음표를 반음 또는 옥타브 단위로 위아래로 이동할 수 있습니다. "자동"을 사용하면 악기 범위에 맞게 음표가 자동으로 조정됩니다.',
            },
            {
                heading: '5. 루프 기능',
                content: '루프 A-B 컨트롤을 사용하여 특정 섹션을 반복 연습하기 위한 시작점과 끝점을 설정합니다.',
            },
            {
                heading: '6. 내보내기',
                content: '타브악보를 텍스트(TXT), 포맷된 타브악보(TAB) 또는 PDF로 인쇄하거나 공유하기 위해 내보냅니다.',
            },
        ],
    },
    hi: {
        title: 'उपयोगकर्ता मैनुअल',
        sections: [
            {
                heading: '1. शुरू करना',
                content: 'MIDI फ़ाइल को एप्लिकेशन में ड्रैग और ड्रॉप करें या फ़ाइल ब्राउज़र खोलने के लिए क्लिक करें। लोड होने के बाद, आप अपने संगीत की टैबलेचर और नोटेशन देखेंगे।',
            },
            {
                heading: '2. वाद्य यंत्र चयन',
                content: 'विभिन्न तार वाद्यों में से चुनने के लिए टूलबार में वाद्य यंत्र बटन पर क्लिक करें। आप अपनी ट्यूनिंग के साथ कस्टम वाद्य यंत्र भी बना सकते हैं।',
            },
            {
                heading: '3. प्लेबैक नियंत्रण',
                content: 'प्लेबैक को नियंत्रित करने के लिए प्ले, पॉज़ और स्टॉप बटन का उपयोग करें। ड्रॉपडाउन मेनू का उपयोग करके गति समायोजित करें। ताल सहायता के लिए मेट्रोनोम सक्षम करें।',
            },
            {
                heading: '4. ट्रांसपोज़',
                content: 'ट्रांसपोज़ नियंत्रण आपको सभी नोट्स को सेमीटोन या ऑक्टेव द्वारा ऊपर या नीचे शिफ्ट करने की अनुमति देते हैं। नोट्स को स्वचालित रूप से अपने वाद्य यंत्र की सीमा में फिट करने के लिए "ऑटो" का उपयोग करें।',
            },
            {
                heading: '5. लूप फ़ंक्शन',
                content: 'विशिष्ट सेक्शन के बार-बार अभ्यास के लिए प्रारंभ और समाप्ति बिंदु सेट करने के लिए लूप A-B नियंत्रण का उपयोग करें।',
            },
            {
                heading: '6. निर्यात',
                content: 'अपनी टैबलेचर को टेक्स्ट (TXT), फॉर्मेटेड टैबलेचर (TAB), या PDF के रूप में प्रिंटिंग या शेयरिंग के लिए निर्यात करें।',
            },
        ],
    },
    ar: {
        title: 'دليل المستخدم',
        sections: [
            {
                heading: '1. البدء',
                content: 'اسحب وأفلت ملف MIDI في التطبيق أو انقر لفتح متصفح الملفات. بعد التحميل، سترى التابلتشر والنوتة الموسيقية لموسيقاك.',
            },
            {
                heading: '2. اختيار الآلات',
                content: 'انقر على زر الآلة في شريط الأدوات للاختيار من بين آلات وترية مختلفة. يمكنك أيضًا إنشاء آلات مخصصة بضبطك الخاص.',
            },
            {
                heading: '3. التحكم في التشغيل',
                content: 'استخدم أزرار التشغيل والإيقاف المؤقت والإيقاف للتحكم في التشغيل. اضبط السرعة باستخدام القائمة المنسدلة. قم بتمكين المترونوم للمساعدة في الإيقاع.',
            },
            {
                heading: '4. تبديل النغمة',
                content: 'تتيح لك أدوات تبديل النغمة نقل جميع النوتات للأعلى أو للأسفل بنصف نغمة أو أوكتاف. استخدم "تلقائي" لضبط النوتات تلقائيًا على نطاق آلتك.',
            },
            {
                heading: '5. وظيفة التكرار',
                content: 'استخدم أدوات التكرار A-B لتعيين نقاط البداية والنهاية للتمرين المتكرر على أقسام محددة.',
            },
            {
                heading: '6. التصدير',
                content: 'قم بتصدير التابلتشر كنص (TXT) أو تابلتشر منسق (TAB) أو PDF للطباعة أو المشاركة.',
            },
        ],
    },
    bn: {
        title: 'ব্যবহারকারী ম্যানুয়াল',
        sections: [
            {
                heading: '1. শুরু করা',
                content: 'অ্যাপ্লিকেশনে একটি MIDI ফাইল টেনে আনুন এবং ড্রপ করুন অথবা ফাইল ব্রাউজার খুলতে ক্লিক করুন। লোড হওয়ার পরে, আপনি আপনার সঙ্গীতের ট্যাবলেচার এবং স্বরলিপি দেখতে পাবেন।',
            },
            {
                heading: '2. বাদ্যযন্ত্র নির্বাচন',
                content: 'বিভিন্ন তার বাদ্যযন্ত্র থেকে বেছে নিতে টুলবারে বাদ্যযন্ত্র বোতামে ক্লিক করুন। আপনি আপনার নিজের টিউনিং সহ কাস্টম বাদ্যযন্ত্রও তৈরি করতে পারেন।',
            },
            {
                heading: '3. প্লেব্যাক নিয়ন্ত্রণ',
                content: 'প্লেব্যাক নিয়ন্ত্রণ করতে প্লে, পজ এবং স্টপ বোতাম ব্যবহার করুন। ড্রপডাউন মেনু ব্যবহার করে গতি সামঞ্জস্য করুন। ছন্দ সহায়তার জন্য মেট্রোনোম সক্ষম করুন।',
            },
            {
                heading: '4. ট্রান্সপোজ',
                content: 'ট্রান্সপোজ নিয়ন্ত্রণগুলি আপনাকে সমস্ত নোট সেমিটোন বা অক্টেভ দ্বারা উপরে বা নীচে স্থানান্তর করতে দেয়। আপনার বাদ্যযন্ত্রের পরিসরে নোটগুলি স্বয়ংক্রিয়ভাবে ফিট করতে "অটো" ব্যবহার করুন।',
            },
            {
                heading: '5. লুপ ফাংশন',
                content: 'নির্দিষ্ট বিভাগের পুনরাবৃত্ত অনুশীলনের জন্য শুরু এবং শেষ পয়েন্ট সেট করতে লুপ A-B নিয়ন্ত্রণ ব্যবহার করুন।',
            },
            {
                heading: '6. এক্সপোর্ট',
                content: 'আপনার ট্যাবলেচার টেক্সট (TXT), ফর্ম্যাটেড ট্যাবলেচার (TAB), বা মুদ্রণ বা শেয়ার করার জন্য PDF হিসাবে এক্সপোর্ট করুন।',
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

        </div>
    );
}

export default HelpModal;
