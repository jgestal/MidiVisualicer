# 🎹 MIDI Visualizer - Guía de Refactorización Completa

Este documento contiene una serie de prompts ordenados para refactorizar y mejorar la aplicación MIDI Visualizer paso a paso, siguiendo las mejores prácticas de desarrollo.

---

## 📋 Índice de Fases

1. **[Fase 1: Análisis y Configuración CI/CD](#fase-1-análisis-y-configuración-cicd)**
2. **[Fase 2: Refactorización de Arquitectura](#fase-2-refactorización-de-arquitectura)**
3. **[Fase 3: Sistema de Biblioteca MIDI](#fase-3-sistema-de-biblioteca-midi)**
4. **[Fase 4: Rediseño de UI/UX - Layout Principal](#fase-4-rediseño-de-uiux---layout-principal)**
5. **[Fase 5: Sistema de Visualización Mejorado](#fase-5-sistema-de-visualización-mejorado)**
6. **[Fase 6: Gestión de Pistas e Instrumentos](#fase-6-gestión-de-pistas-e-instrumentos)**
7. **[Fase 7: Sistema de Instrumentos Personalizados](#fase-7-sistema-de-instrumentos-personalizados)**
8. **[Fase 8: Pulido Final y Testing](#fase-8-pulido-final-y-testing)**

---

## Fase 1: Análisis y Configuración CI/CD

### Prompt 1.1: Configuración de GitHub Actions para CI/CD

```
Configura un pipeline de CI/CD completo para la aplicación MIDI Visualizer usando GitHub Actions. El proyecto está en /Users/portalfp/Documents/Proyectos/Dev/MidiVisualicer y usa Vite + React + TypeScript.

**Requisitos del Pipeline:**

1. **Workflow de Desarrollo (develop.yml):**
   - Se ejecuta en push a branches `develop` y `feature/*`
   - Ejecuta linting con ESLint
   - Ejecuta TypeScript check (tsc --noEmit)
   - Construye la aplicación para verificar que compila
   - (Opcional) Ejecuta tests si existen

2. **Workflow de Producción (release.yml):**
   - Se ejecuta en push a `main` o creación de tags `v*`
   - Ejecuta todas las verificaciones del workflow de desarrollo
   - Construye la aplicación optimizada para producción
   - Despliega automáticamente a GitHub Pages
   - Genera un release en GitHub con el build como artifact

3. **Configuración adicional:**
   - Añade ESLint al proyecto si no existe (con config para React + TypeScript)
   - Añade Prettier para formateo consistente
   - Crea un archivo `.nvmrc` con la versión de Node recomendada
   - Actualiza `package.json` con scripts para lint, format, y type-check
   - Configura Vite para que el build funcione con GitHub Pages (base path correcto)

4. **Archivos a crear:**
   - `.github/workflows/develop.yml`
   - `.github/workflows/release.yml`
   - `.eslintrc.cjs` o `eslint.config.js`
   - `.prettierrc`
   - `.nvmrc`

5. **Actualizar:**
   - `package.json` (scripts y devDependencies)
   - `vite.config.ts` (configuración para GitHub Pages)
   - `README.md` (badges del estado del pipeline)

Sigue las mejores prácticas y documenta cada paso que realices.
```

---

## Fase 2: Refactorización de Arquitectura

### Prompt 2.1: Reestructuración de Directorios

```
Refactoriza la estructura de directorios del proyecto MIDI Visualizer (/Users/portalfp/Documents/Proyectos/Dev/MidiVisualicer/src) siguiendo el patrón Feature-First y las mejores prácticas de React.

**Estado Actual:**
```
src/
├── App.tsx (890 líneas - DEMASIADO GRANDE)
├── components/ (11 componentes mezclados)
├── config/
├── hooks/
├── styles/
├── types/
└── utils/
```

**Nueva Estructura Propuesta:**
```
src/
├── app/
│   ├── App.tsx (solo orquestación)
│   ├── AppLayout.tsx (layout principal)
│   └── routes.tsx (si se añade routing)
│
├── features/
│   ├── player/
│   │   ├── components/
│   │   │   ├── PlayerControls.tsx
│   │   │   ├── PlaybackProgress.tsx
│   │   │   └── SpeedControl.tsx
│   │   ├── hooks/
│   │   │   └── usePlayback.ts
│   │   ├── context/
│   │   │   └── PlayerContext.tsx
│   │   └── index.ts
│   │
│   ├── visualization/
│   │   ├── components/
│   │   │   ├── TablatureView/
│   │   │   │   ├── TablatureView.tsx
│   │   │   │   ├── TablatureRow.tsx
│   │   │   │   └── TablatureView.css
│   │   │   ├── PianoRollView/
│   │   │   ├── NotationView/
│   │   │   └── VisualizationSwitcher.tsx
│   │   ├── hooks/
│   │   │   └── useVisualizationScroll.ts
│   │   └── index.ts
│   │
│   ├── library/
│   │   ├── components/
│   │   │   ├── LibrarySidebar.tsx
│   │   │   ├── MidiFileList.tsx
│   │   │   ├── FolderTree.tsx
│   │   │   └── FileDropZone.tsx
│   │   ├── hooks/
│   │   │   ├── useLibrary.ts
│   │   │   └── useMidiLoader.ts
│   │   ├── services/
│   │   │   └── libraryService.ts
│   │   └── index.ts
│   │
│   ├── instruments/
│   │   ├── components/
│   │   │   ├── InstrumentSelector.tsx
│   │   │   ├── InstrumentEditor.tsx
│   │   │   └── InstrumentPopover.tsx
│   │   ├── hooks/
│   │   │   └── useInstruments.ts
│   │   ├── data/
│   │   │   └── defaultInstruments.ts
│   │   └── index.ts
│   │
│   └── tracks/
│       ├── components/
│       │   ├── TracksSidebar.tsx
│       │   ├── TrackItem.tsx
│       │   └── TrackVolumeControl.tsx
│       ├── utils/
│       │   └── trackAnalysis.ts (detectar melodía principal)
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/ (botones, modales, popovers genéricos)
│   │   └── layout/ (Header, Sidebar, etc.)
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   │   └── midi.ts
│   └── styles/
│       ├── variables.css
│       ├── reset.css
│       └── global.css
│
├── assets/
│   └── midi/ (archivos MIDI empaquetados)
│
└── main.tsx
```

**Instrucciones:**
1. Crea la nueva estructura de directorios
2. Mueve los archivos existentes a sus nuevas ubicaciones
3. Actualiza todos los imports
4. Extrae los estilos inline del App.tsx a archivos CSS separados
5. Divide App.tsx en componentes más pequeños
6. Crea archivos index.ts para exportaciones limpias
7. Verifica que la aplicación sigue compilando después de cada cambio

NO cambies la funcionalidad, solo reorganiza el código.
```

### Prompt 2.2: Extracción de Contextos y Estado Global

```
Extraer el estado global de App.tsx a contextos React siguiendo el patrón de Context + Reducer.

**Contextos a crear:**

1. **MidiContext** (`/src/features/library/context/MidiContext.tsx`):
   ```typescript
   interface MidiState {
     parsedMidi: ParsedMidi | null;
     selectedFile: MidiFile | null;
     isLoading: boolean;
     error: string | null;
   }
   ```
   - Acciones: LOAD_FILE, SET_ERROR, CLEAR

2. **PlaybackContext** (`/src/features/player/context/PlaybackContext.tsx`):
   ```typescript
   interface PlaybackState {
     isPlaying: boolean;
     isPaused: boolean;
     currentTime: number;
     duration: number;
     speed: PlaybackSpeed;
     loopStart: number | null;
     loopEnd: number | null;
     isLoopEnabled: boolean;
   }
   ```
   - Acciones: PLAY, PAUSE, STOP, SEEK, SET_SPEED, SET_LOOP

3. **TracksContext** (`/src/features/tracks/context/TracksContext.tsx`):
   ```typescript
   interface TracksState {
     selectedTrackIndex: number;
     mutedTracks: Set<number>;
     soloTrack: number | null;
   }
   ```
   - Acciones: SELECT_TRACK, TOGGLE_MUTE, SET_SOLO

4. **InstrumentContext** (`/src/features/instruments/context/InstrumentContext.tsx`):
   ```typescript
   interface InstrumentState {
     selectedInstrumentId: string;
     transpose: number;
     customInstruments: Record<string, InstrumentConfig>;
   }
   ```
   - Acciones: SELECT_INSTRUMENT, SET_TRANSPOSE, ADD_CUSTOM, DELETE_CUSTOM

5. **VisualizationContext** (`/src/features/visualization/context/VisualizationContext.tsx`):
   ```typescript
   interface VisualizationState {
     activeView: 'tablature' | 'pianoroll' | 'notation';
     isMaximized: boolean;
   }
   ```

**Patrón a seguir para cada contexto:**
```typescript
// Ejemplo: MidiContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

type Action = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: ParsedMidi }
  | { type: 'LOAD_ERROR'; payload: string };

const initialState: MidiState = { ... };

function midiReducer(state: MidiState, action: Action): MidiState { ... }

const MidiContext = createContext<{
  state: MidiState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function MidiProvider({ children }: { children: ReactNode }) { ... }

export function useMidi() {
  const context = useContext(MidiContext);
  if (!context) throw new Error('useMidi must be used within MidiProvider');
  return context;
}
```

**Instrucciones:**
1. Crea cada contexto en su carpeta correspondiente
2. Crea un `AppProviders.tsx` que envuelva todos los providers
3. Actualiza App.tsx para usar los contextos
4. Actualiza los componentes para usar los hooks de contexto
5. Elimina el prop drilling existente
```

---

## Fase 3: Sistema de Biblioteca MIDI

### Prompt 3.1: Servicio de Biblioteca MIDI

```
Implementa un sistema completo de biblioteca para gestionar archivos MIDI importados y empaquetados.

**Ubicación**: `/src/features/library/`

**1. Servicio de Biblioteca** (`services/libraryService.ts`):
```typescript
interface LibraryItem {
  id: string;
  name: string;
  path: string;
  source: 'bundled' | 'imported';
  addedAt: number;
  metadata?: {
    duration?: number;
    trackCount?: number;
    lastPlayed?: number;
  };
}

class LibraryService {
  // Almacenamiento en IndexedDB para los archivos importados
  async addFile(file: File): Promise<LibraryItem>;
  async removeFile(id: string): Promise<void>;
  async getFile(id: string): Promise<ArrayBuffer>;
  async getAllItems(): Promise<LibraryItem[]>;
  async getBundledItems(): Promise<LibraryItem[]>;
  async searchItems(query: string): Promise<LibraryItem[]>;
  async updateMetadata(id: string, metadata: Partial<LibraryItem['metadata']>): Promise<void>;
}
```

**2. Hook useLibrary** (`hooks/useLibrary.ts`):
```typescript
function useLibrary() {
  return {
    items: LibraryItem[];
    bundledItems: LibraryItem[];
    importedItems: LibraryItem[];
    isLoading: boolean;
    addFile: (file: File) => Promise<void>;
    removeFile: (id: string) => Promise<void>;
    loadFile: (item: LibraryItem) => Promise<ParsedMidi>;
    searchItems: (query: string) => LibraryItem[];
  };
}
```

**3. MIDI Empaquetados** (`/src/assets/midi/`):
- Crea un manifest.json que liste los archivos MIDI libres incluidos
- Los archivos deben ser clásicos de dominio público
- Estructura:
```json
{
  "files": [
    {
      "id": "bundled_fur_elise",
      "name": "Für Elise - Beethoven",
      "path": "/midi/fur_elise.mid",
      "category": "Classical"
    }
  ]
}
```

**4. Componente LibrarySidebar** (`components/LibrarySidebar.tsx`):
- Barra de búsqueda con filtro en tiempo real
- Tabs: "Empaquetados" | "Importados" | "Todos"
- Lista de archivos agrupados por categoría/carpeta
- Botón para importar nuevos archivos
- Indicador de archivo actualmente cargado
- Opción de eliminar archivos importados (con confirmación)
- Drag & drop para reordenar favoritos

**Instrucciones:**
1. Implementa LibraryService usando IndexedDB (idb-keyval o similar)
2. Crea el manifest de MIDIs empaquetados
3. Implementa el hook useLibrary
4. Crea LibrarySidebar con diseño moderno y compacto
5. La barra de búsqueda NO debe ocupar mucho espacio
6. Integra con el sistema existente de carga de MIDI
```

### Prompt 3.2: Zona de Drop Principal

```
Mejora la ventana principal para que acepte arrastrar y soltar archivos MIDI de forma intuitiva.

**Requisitos:**

1. **FileDropZone** (`/src/features/library/components/FileDropZone.tsx`):
   - Componente que envuelve todo el área principal
   - Detecta cuando un archivo está siendo arrastrado sobre la ventana
   - Muestra un overlay visual cuando se detecta un drag
   - Acepta archivos .mid y .midi
   - Rechaza visualmente otros tipos de archivo
   - Animaciones suaves para feedback

2. **Estados Visuales:**
   - **Idle**: Sin indicación (la app normal)
   - **Drag Over App**: Overlay sutil que dice "Suelta para cargar MIDI"
   - **Invalid File**: Overlay rojo que dice "Solo archivos MIDI (.mid, .midi)"
   - **Loading**: Spinner/animación mientras se procesa
   - **Success**: Flash verde breve confirmando carga

3. **Welcome Screen Mejorada** (cuando no hay MIDI cargado):
   ```jsx
   <WelcomeScreen>
     <Icon>🎹</Icon>
     <Title>MIDI Visualizer</Title>
     <Subtitle>Visualiza, practica y aprende con tablaturas interactivas</Subtitle>
     
     <DropArea>
       <DropIcon>📁</DropIcon>
       <DropText>Arrastra un archivo MIDI aquí</DropText>
       <DropSubtext>o haz clic para seleccionar</DropSubtext>
       <SupportedFormats>.mid, .midi</SupportedFormats>
     </DropArea>
     
     <Divider>o explora la biblioteca</Divider>
     
     <QuickPicks>
       {/* 3-4 MIDIs empaquetados destacados */}
       <QuickPickCard onClick={loadBundledMidi}>
         <Icon>🎵</Icon>
         <Name>Für Elise</Name>
         <Artist>Beethoven</Artist>
       </QuickPickCard>
     </QuickPicks>
   </WelcomeScreen>
   ```

4. **Diseño:**
   - Usa glassmorphism para el drop area
   - Animación de pulso sutil en idle
   - Transiciones suaves entre estados
   - Iconografía moderna (lucide-react)

**Instrucciones:**
1. Crea FileDropZone como componente wrapper reutilizable
2. Implementa todos los estados visuales con CSS/animaciones
3. Rediseña WelcomeScreen con el diseño propuesto
4. Conecta con LibraryService para cargar archivos
5. Maneja errores gracefully (archivo corrupto, etc.)
```

---

## Fase 4: Rediseño de UI/UX - Layout Principal

### Prompt 4.1: Layout de Tres Columnas Responsivo

```
Rediseña el layout principal de la aplicación con un sistema de tres columnas colapsables.

**Layout Propuesto:**
```
┌────────────────────────────────────────────────────────────────┐
│                        Header/Toolbar                          │
├──────────┬────────────────────────────────────┬───────────────┤
│          │                                     │               │
│ Sidebar  │                                     │   Sidebar     │
│ Izquierdo│         Área Principal             │   Derecho     │
│          │                                     │               │
│ Biblioteca│        (Visualización)             │   Pistas      │
│          │                                     │               │
├──────────┴────────────────────────────────────┴───────────────┤
│                       Player Controls                          │
└────────────────────────────────────────────────────────────────┘
```

**1. AppLayout.tsx** (`/src/app/AppLayout.tsx`):
```typescript
interface LayoutState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  leftSidebarWidth: number; // Redimensionable
  rightSidebarWidth: number;
}
```

**2. Comportamiento de Sidebars:**
- **Colapsables**: Click en icono para colapsar/expandir
- **Redimensionables**: Drag en el borde para cambiar ancho
- **Persistencia**: Guardar estado en localStorage
- **Responsive**: En móvil, se convierten en drawers deslizables
- **Animación suave**: Transiciones de 200-300ms

**3. Header/Toolbar:**
```
[≡ Biblioteca] [Logo] [Nombre del MIDI actual]  |  [🎸 Guitarra ▼] [Transpose] [Loop] [Export ▼] [Pistas ≡]
```
- Nombre del MIDI cargado (con info de BPM y duración)
- Selector de instrumento como botón que abre popover
- Controles de transposición compactos
- Controles de loop
- Menú de exportación
- Toggle del sidebar derecho

**4. Sidebar Izquierdo (Biblioteca):**
- Ancho por defecto: 260px
- Ancho mínimo: 200px
- Ancho máximo: 400px
- Contenido: LibrarySidebar (del Prompt 3.1)

**5. Sidebar Derecho (Pistas):**
- Ancho por defecto: 240px
- Solo visible cuando hay un MIDI cargado
- Contiene: Lista de pistas con controles de mute/solo

**6. Área Principal:**
- Ocupa todo el espacio restante
- Contiene la visualización activa

**7. Player Footer:**
- Siempre visible cuando hay MIDI cargado
- Altura fija: 64px
- Controles de reproducción centrados
- Progress bar con seek interactivo

**Instrucciones:**
1. Crea el componente AppLayout con CSS Grid
2. Implementa el sistema de colapsado de sidebars
3. Añade redimensionado con drag
4. Guarda preferencias en localStorage
5. Implementa responsive (breakpoints: <768px móvil, <1024px tablet)
6. Usa CSS custom properties para los tamaños
```

### Prompt 4.2: Selector de Instrumento Mejorado

```
Rediseña el selector de instrumento como un popover elegante que no ocupe espacio en el sidebar.

**Ubicación**: `/src/features/instruments/components/`

**1. InstrumentButton** (botón en el header):
```jsx
<InstrumentButton onClick={openPopover}>
  <InstrumentIcon>{instrument.icon}</InstrumentIcon>
  <InstrumentName>{instrument.nameEs}</InstrumentName>
  <ChevronDown size={12} />
</InstrumentButton>
```
- Muestra el icono y nombre del instrumento actual
- Estilo compacto que encaja en el header
- Indicador visual cuando está abierto

**2. InstrumentPopover** (panel flotante):
```jsx
<InstrumentPopover isOpen={isOpen} onClose={close} anchorEl={buttonRef}>
  <PopoverHeader>
    <Title>Seleccionar Instrumento</Title>
    <SearchInput placeholder="Buscar..." />
  </PopoverHeader>
  
  <PopoverTabs>
    <Tab active={tab === 'all'}>Todos</Tab>
    <Tab active={tab === 'custom'}>Personalizados</Tab>
  </PopoverTabs>
  
  <InstrumentGrid>
    {/* Categorías colapsables */}
    <Category title="Guitarras" defaultOpen>
      <InstrumentCard instrument={guitar} selected={...} />
      <InstrumentCard instrument={guitarAcoustic} />
    </Category>
    <Category title="Tradicionales Españoles">
      <InstrumentCard instrument={bandurria} />
      <InstrumentCard instrument={laud} />
    </Category>
    {/* ... más categorías */}
  </InstrumentGrid>
  
  <PopoverFooter>
    <Button onClick={openCreateModal}>+ Crear instrumento</Button>
  </PopoverFooter>
</InstrumentPopover>
```

**3. InstrumentCard:**
- Icono grande (emoji)
- Nombre del instrumento
- Afinación resumida (ej: "E A D G B E")
- Número de cuerdas y trastes
- Indicador de seleccionado
- Hover state con preview de afinación

**4. Categorías de Instrumentos:**
- Guitarras (Española, Acústica, Eléctrica)
- Bajo
- Tradicionales Españoles (Bandurria, Laúd)
- Mandolinas
- Banjos
- Ukeleles
- Cuerdas Clásicas (Violín, Viola, Cello)
- Otros (Charango, Bouzouki, etc.)
- Personalizados (al final)

**5. Diseño:**
- Máximo 400px de ancho
- Máximo 500px de alto (scroll interno)
- Posicionado debajo del botón (o arriba si no hay espacio)
- Overlay oscuro que cierra al hacer clic fuera
- Animación de fade + slide al abrir/cerrar
- Sombra pronunciada (elevation alta)

**Instrucciones:**
1. Crea los componentes InstrumentButton, InstrumentPopover, InstrumentCard
2. Implementa la barra de búsqueda funcional
3. Organiza instrumentos por categorías (modifica instruments.ts si es necesario)
4. Añade animaciones suaves
5. Maneja posicionamiento (arriba/abajo según espacio disponible)
```

---

## Fase 5: Sistema de Visualización Mejorado

### Prompt 5.1: Visualización Multi-fila

```
Rediseña el sistema de visualización para mostrar las notas en múltiples filas legibles, similar a una partitura.

**Problema actual:**
- Las visualizaciones se desplazan horizontalmente
- Es difícil leer las notas mientras se reproduce
- No hay contexto de lo que viene después

**Solución:**
Organizar las notas en filas (como líneas de un libro), con la fila actual destacada.

**1. Estructura de Visualización:**
```
┌─────────────────────────────────────────────────────────────┐
│ Fila 1: [notas del compás 1-4]                              │
├─────────────────────────────────────────────────────────────┤
│ Fila 2: [notas del compás 5-8]  ← FILA ACTUAL (destacada)   │
│         ↑ nota actual                                        │
├─────────────────────────────────────────────────────────────┤
│ Fila 3: [notas del compás 9-12]                             │
├─────────────────────────────────────────────────────────────┤
│ Fila 4: [notas del compás 13-16]                            │
└─────────────────────────────────────────────────────────────┘
```

**2. Configuración:**
```typescript
interface VisualizationConfig {
  notesPerRow: number; // Calculado según ancho del contenedor
  rowHeight: number;
  visibleRowsBefore: number; // Filas visibles antes de la actual
  visibleRowsAfter: number;  // Filas visibles después
}
```

**3. TablatureRowView** (`/src/features/visualization/components/TablatureView/TablatureRow.tsx`):
- Representa una fila de tablatura
- Muestra las cuerdas con las notas de esa sección
- Acepta prop `isActive` para destacado
- Acepta prop `currentNoteIndex` para marcar nota actual

**4. TablatureMultiRowView:**
```jsx
<TablatureContainer onClick={handleClick}>
  {rows.map((row, index) => (
    <TablatureRow
      key={row.id}
      notes={row.notes}
      stringLabels={stringLabels}
      isActive={index === currentRowIndex}
      currentNoteIndex={index === currentRowIndex ? currentNoteInRow : -1}
      onClick={(noteTime) => seekTo(noteTime)}
    />
  ))}
</TablatureContainer>
```

**5. Interactividad:**
- Click en cualquier nota → seek a ese tiempo
- La fila actual se mantiene centrada verticalmente (o al 30%)
- Scroll suave automático cuando cambia de fila
- Sin scroll horizontal dentro de las filas

**6. Cálculo de Filas:**
```typescript
function calculateRows(notes: MidiNote[], notesPerRow: number): Row[] {
  // Agrupar notas por time slots
  // Dividir en filas de tamaño fijo
  // Retornar array de filas con sus notas
}
```

**Instrucciones:**
1. Crea TablatureRow como componente de una sola fila
2. Crea TablatureMultiRowView que organiza las filas
3. Implementa el cálculo dinámico de notas por fila según ancho
4. Añade auto-scroll vertical para seguir la reproducción
5. Implementa click-to-seek en cualquier nota
6. Aplica el mismo patrón a PianoRollView y NotationView
```

### Prompt 5.2: Switcher de Visualización

```
Implementa un sistema para cambiar entre los tres tipos de visualización (Tablatura, Piano Roll, Partitura).

**Componente VisualizationSwitcher:**
```jsx
<VisualizationSwitcher>
  <ViewTab 
    active={activeView === 'tablature'} 
    onClick={() => setActiveView('tablature')}
  >
    <Icon>🎸</Icon>
    <Label>Tablatura</Label>
  </ViewTab>
  
  <ViewTab 
    active={activeView === 'pianoroll'} 
    onClick={() => setActiveView('pianoroll')}
  >
    <Icon>🎹</Icon>
    <Label>Piano Roll</Label>
  </ViewTab>
  
  <ViewTab 
    active={activeView === 'notation'} 
    onClick={() => setActiveView('notation')}
  >
    <Icon>🎼</Icon>
    <Label>Partitura</Label>
  </ViewTab>
</VisualizationSwitcher>
```

**Ubicación en UI:**
- Dentro del área de visualización (esquina superior derecha)
- No en el header para no acumular controles
- Estilo de tabs pill/segmented control

**Comportamiento:**
- Solo una visualización activa a la vez
- Transición suave entre vistas (fade)
- Mantener la posición temporal al cambiar
- Recordar última vista usada (localStorage)

**Diseño:**
- Fondo semitransparente con blur
- Tabs redondeados
- Indicador de selección animado (slide)
- Compacto para no obstruir la vista

**Instrucciones:**
1. Crea el componente VisualizationSwitcher
2. Integra en el contexto de visualización (VisualizationContext)
3. Modifica MainContent para renderizar solo la vista activa
4. Añade transiciones entre vistas
5. Persiste preferencia en localStorage
```

---

## Fase 6: Gestión de Pistas e Instrumentos

### Prompt 6.1: Sidebar de Pistas con Auto-Detección de Melodía

```
Implementa el sidebar derecho para gestionar las pistas del MIDI con detección automática de la melodía principal.

**1. Algoritmo de Detección de Melodía** (`/src/features/tracks/utils/trackAnalysis.ts`):
```typescript
interface TrackAnalysis {
  trackIndex: number;
  melodyScore: number;  // 0-1, mayor = más probable que sea melodía
  isLikelyMelody: boolean;
  isLikelyAccompaniment: boolean;
  characteristics: {
    avgNoteDuration: number;
    noteVariety: number;      // Cuántas notas diferentes
    hasChords: boolean;       // ¿Tiene notas simultáneas?
    avgNoteCount: number;     // Notas por segundo
    pitchRange: { min: number; max: number };
    avgPitch: number;
  };
}

function analyzeTrack(track: MidiTrack): TrackAnalysis;
function detectMelodyTrack(tracks: MidiTrack[]): number;
```

**Heurísticas para detectar melodía:**
1. Menor cantidad de notas simultáneas (no acordes)
2. Mayor variedad de notas (no repeticiones como bajo)
3. Rango de pitch medio-alto (no graves)
4. Duraciones variadas (no pattern repetitivo)
5. Nombre de pista contiene "melody", "lead", "vocal", etc.

**2. TracksSidebar** (`/src/features/tracks/components/TracksSidebar.tsx`):
```jsx
<TracksSidebar>
  <SidebarHeader>
    <Title>Pistas</Title>
    <TrackCount>{tracks.length} pistas</TrackCount>
  </SidebarHeader>
  
  <TrackList>
    {tracks.map((track, index) => (
      <TrackItem
        key={index}
        track={track}
        index={index}
        isSelected={selectedTrack === index}
        isMuted={mutedTracks.has(index)}
        isSolo={soloTrack === index}
        isLikelyMelody={melodyTrackIndex === index}
        onSelect={() => selectTrack(index)}
        onToggleMute={() => toggleMute(index)}
        onToggleSolo={() => toggleSolo(index)}
      />
    ))}
  </TrackList>
  
  <SidebarFooter>
    <Checkbox checked={autoSelectMelody} onChange={...}>
      Auto-seleccionar melodía
    </Checkbox>
  </SidebarFooter>
</TracksSidebar>
```

**3. TrackItem:**
```jsx
<TrackItem selected={isSelected} muted={isMuted}>
  <TrackIcon>{getTrackIcon(track)}</TrackIcon>
  <TrackInfo>
    <TrackName>
      {track.name || `Pista ${index + 1}`}
      {isLikelyMelody && <MelodyBadge>🎵 Melodía</MelodyBadge>}
    </TrackName>
    <TrackMeta>
      {track.instrument} • {track.noteCount} notas
    </TrackMeta>
  </TrackInfo>
  <TrackActions>
    <MuteButton muted={isMuted} onClick={onToggleMute}>
      {isMuted ? <VolumeOff /> : <Volume2 />}
    </MuteButton>
    <SoloButton active={isSolo} onClick={onToggleSolo}>
      S
    </SoloButton>
  </TrackActions>
</TrackItem>
```

**4. Comportamiento:**
- Al cargar un MIDI, auto-detectar y seleccionar la pista de melodía
- Opción para desactivar auto-selección
- Mute: silencia la pista
- Solo: silencia todas las demás (toggle)
- Click en pista: selecciona para visualización
- Visual diferente para pista activa vs visibles

**Instrucciones:**
1. Implementa el algoritmo de análisis de pistas
2. Crea TracksSidebar con diseño moderno
3. Integra la detección automática de melodía
4. Implementa mute/solo en la reproducción
5. Añade el checkbox de auto-selección
```

---

## Fase 7: Sistema de Instrumentos Personalizados

### Prompt 7.1: Editor de Instrumentos

```
Implementa un modal para crear y editar instrumentos personalizados.

**InstrumentEditorModal** (`/src/features/instruments/components/InstrumentEditor.tsx`):

```jsx
<InstrumentEditorModal isOpen={isOpen} onClose={close}>
  <ModalHeader>
    <Title>{isEditing ? 'Editar Instrumento' : 'Crear Instrumento'}</Title>
    <CloseButton onClick={close} />
  </ModalHeader>
  
  <ModalBody>
    <FormSection>
      <Label>Nombre del Instrumento *</Label>
      <Input 
        value={name} 
        onChange={setName}
        placeholder="Ej: Mi Guitarra Personalizada"
      />
    </FormSection>
    
    <FormSection>
      <Label>Icono</Label>
      <EmojiPicker 
        selected={icon} 
        onChange={setIcon}
        suggestions={['🎸', '🎵', '🎶', '🎹', '🪕', '🎻', '🎺', '🥁']}
      />
    </FormSection>
    
    <FormSection>
      <Label>Número de Cuerdas *</Label>
      <NumberInput
        value={stringCount}
        onChange={setStringCount}
        min={1}
        max={12}
      />
    </FormSection>
    
    <FormSection>
      <Label>Afinación (de grave a agudo) *</Label>
      <TuningEditor
        stringCount={stringCount}
        tuning={tuning}
        onChange={setTuning}
      />
      {/* Cada cuerda: Input de nota (ej: E2, A2, D3...) */}
      {/* Validación en tiempo real */}
      {/* Sugerencias de afinaciones comunes */}
    </FormSection>
    
    <FormSection>
      <Label>Número de Trastes</Label>
      <NumberInput
        value={frets}
        onChange={setFrets}
        min={0}
        max={36}
        defaultValue={20}
      />
      <HelpText>Usa 0 para instrumentos sin trastes (violín, etc.)</HelpText>
    </FormSection>
    
    <FormSection>
      <Label>Cuerdas Dobles</Label>
      <Toggle checked={doubleStrings} onChange={setDoubleStrings} />
      <HelpText>Activar para bandurria, mandolina, laúd, etc.</HelpText>
    </FormSection>
    
    <Preview>
      <PreviewTitle>Vista Previa</PreviewTitle>
      <TablaturePreview instrument={previewInstrument} />
    </Preview>
  </ModalBody>
  
  <ModalFooter>
    <SecondaryButton onClick={close}>Cancelar</SecondaryButton>
    <PrimaryButton onClick={save} disabled={!isValid}>
      {isEditing ? 'Guardar Cambios' : 'Crear Instrumento'}
    </PrimaryButton>
  </ModalFooter>
</InstrumentEditorModal>
```

**TuningEditor Componente:**
```jsx
<TuningEditor>
  {Array(stringCount).fill(null).map((_, i) => (
    <StringTuning key={i}>
      <StringNumber>{stringCount - i}</StringNumber>
      <NoteInput
        value={tuning[i]}
        onChange={(note) => updateTuning(i, note)}
        placeholder="C4"
        error={!isValidNote(tuning[i])}
      />
      <OctaveHint>{getOctaveHint(tuning[i])}</OctaveHint>
    </StringTuning>
  ))}
  
  <QuickTunings>
    <QuickButton onClick={() => applyTuning('standard-guitar')}>
      Guitarra Estándar
    </QuickButton>
    <QuickButton onClick={() => applyTuning('bass-4')}>
      Bajo 4 cuerdas
    </QuickButton>
  </QuickTunings>
</TuningEditor>
```

**Validaciones:**
- Nombre: No vacío, sin caracteres especiales
- Afinación: Formato válido (nota + octava, ej: E2, F#3, Bb4)
- Al menos 1 cuerda
- Trastes >= 0

**Persistencia:**
- Guardar en localStorage (ya implementado en instruments.ts)
- Generar ID único basado en nombre + timestamp

**Instrucciones:**
1. Crea el componente InstrumentEditorModal
2. Implementa TuningEditor con validación en tiempo real
3. Crea EmojiPicker simple con emojis sugeridos
4. Añade preview en tiempo real de cómo se vería la tablatura
5. Integra con saveCustomInstrument del config
6. Añade opción de editar/eliminar instrumentos personalizados
```

---

## Fase 8: Pulido Final y Testing

### Prompt 8.1: Mejoras UI/UX Finales

```
Aplica mejoras finales de UI/UX siguiendo las mejores prácticas de diseño.

**1. Sistema de Notificaciones (Toast):**
- Crear componente Toast para feedback de acciones
- Posición: esquina inferior derecha
- Tipos: success, error, warning, info
- Auto-dismiss después de 3-5 segundos
- Animación de entrada/salida

**2. Estados de Carga:**
- Skeleton loaders para listas
- Spinner sutil para operaciones cortas
- Progress bar para operaciones largas

**3. Atajos de Teclado:**
```typescript
const KEYBOARD_SHORTCUTS = {
  ' ': 'Play/Pause',
  'ArrowLeft': 'Retroceder 5s',
  'ArrowRight': 'Avanzar 5s',
  'ArrowUp': 'Aumentar velocidad',
  'ArrowDown': 'Reducir velocidad',
  '1': 'Mostrar Tablatura',
  '2': 'Mostrar Piano Roll',
  '3': 'Mostrar Partitura',
  'M': 'Mute/Unmute pista actual',
  'L': 'Toggle Loop',
  'Escape': 'Cerrar modales/popovers',
};
```
- Mostrar guía de atajos con '?' o 'H'

**4. Accesibilidad (a11y):**
- Todos los botones con aria-label
- Focus visible en elementos interactivos
- Navegación por teclado completa
- Contraste de colores WCAG AA
- Roles ARIA apropiados

**5. Animaciones y Transiciones:**
- Micro-interacciones en botones (hover, active)
- Transiciones suaves entre estados
- Animación de notas al reproducir
- Sin animaciones si prefers-reduced-motion

**6. Responsive Final:**
- Verificar todos los breakpoints
- Menú hamburguesa en móvil
- Touch-friendly en tablets
- Tamaños de fuente apropiados

**7. Tema Oscuro/Claro:**
- Variables CSS para colores del tema
- Toggle en el header
- Respetar prefers-color-scheme
- Persistir preferencia

**Instrucciones:**
1. Implementa el sistema de Toast
2. Añade todos los atajos de teclado
3. Revisa y mejora accesibilidad
4. Implementa toggle de tema
5. Prueba en diferentes tamaños de pantalla
6. Añade micro-animaciones sutiles
```

### Prompt 8.2: Documentación y README Final

```
Actualiza la documentación del proyecto con todos los cambios realizados.

**README.md Actualizado:**
```markdown
# 🎹 MIDI Visualizer & Tablature Studio

<p align="center">
  <img src="./screenshot.png" alt="MIDI Visualizer Screenshot" width="800">
</p>

[![CI](https://github.com/USER/midi-visualizer/actions/workflows/develop.yml/badge.svg)](...)
[![Deploy](https://github.com/USER/midi-visualizer/actions/workflows/release.yml/badge.svg)](...)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Una aplicación web interactiva para visualizar archivos MIDI con tablaturas, piano roll y partituras. Diseñada para músicos que quieren practicar y aprender nuevas piezas.

## ✨ Características

### 🎸 Visualizaciones
- **Tablatura Multi-fila**: Visualización como partitura, fácil de seguir
- **Piano Roll**: Vista clásica de secuenciador
- **Partitura**: Notación musical estándar (VexFlow)
- **Click-to-Seek**: Haz clic en cualquier nota para saltar

### 📚 Biblioteca MIDI
- Importa tus propios archivos MIDI
- Incluye clásicos de dominio público
- Búsqueda y organización por carpetas
- Arrastrar y soltar para importar

### 🎻 Instrumentos
- 20+ instrumentos predefinidos
- Crea instrumentos personalizados
- Auto-transposición al rango del instrumento
- Detección automática de melodía

### 🎮 Reproducción
- Control de velocidad (0.25x - 1x)
- Sistema de loops para practicar
- Mute/Solo de pistas
- Atajos de teclado

## 🚀 Inicio Rápido

\`\`\`bash
# Clonar
git clone https://github.com/USER/midi-visualizer.git
cd midi-visualizer

# Instalar
npm install

# Desarrollar
npm run dev

# Construir
npm run build
\`\`\`

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Espacio` | Play/Pause |
| `←/→` | Retroceder/Avanzar 5s |
| `↑/↓` | Velocidad +/- |
| `1/2/3` | Cambiar visualización |
| `M` | Mute pista |
| `L` | Toggle Loop |
| `?` | Mostrar ayuda |

## 📁 Estructura del Proyecto

\`\`\`
src/
├── app/              # App principal y layout
├── features/         # Módulos por funcionalidad
│   ├── library/      # Gestión de archivos MIDI
│   ├── player/       # Reproducción de audio
│   ├── visualization/# Tablatura, Piano Roll, Partitura
│   ├── instruments/  # Gestión de instrumentos
│   └── tracks/       # Gestión de pistas
├── shared/           # Componentes y utils compartidos
└── assets/           # Archivos estáticos
\`\`\`

## 🛠️ Tecnologías

- **React 18** - UI Framework
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tone.js** - Audio synthesis
- **VexFlow** - Notación musical
- **IndexedDB** - Almacenamiento local

## 📄 Licencia

MIT © [Tu Nombre]
```

**Archivos de Documentación Adicionales:**
1. `CONTRIBUTING.md` - Guía para contribuir
2. `CHANGELOG.md` - Historial de versiones
3. `.github/ISSUE_TEMPLATE/` - Templates para issues
4. `.github/PULL_REQUEST_TEMPLATE.md` - Template para PRs

**Instrucciones:**
1. Actualiza README.md con la información real del proyecto
2. Toma un screenshot de la app funcionando
3. Crea los archivos de documentación adicionales
4. Verifica que todos los comandos funcionan
5. Añade comentarios JSDoc a funciones principales
```

---

## 📝 Notas Finales

### Orden de Ejecución Recomendado:
1. **Fase 1** → CI/CD para tener validación automática
2. **Fase 2** → Arquitectura base para desarrollo limpio
3. **Fase 4.1** → Layout primero para tener la estructura visual
4. **Fase 3** → Biblioteca MIDI
5. **Fase 4.2** → UI del selector de instrumentos
6. **Fase 5** → Visualizaciones mejoradas
7. **Fase 6** → Gestión de pistas
8. **Fase 7** → Instrumentos personalizados
9. **Fase 8** → Pulido final

### Tips:
- Ejecuta `npm run dev` constantemente para verificar que todo funciona
- Haz commits frecuentes después de cada paso exitoso
- Si algo se rompe, revisa los imports y las rutas
- Usa TypeScript estricto para detectar errores temprano

### Recursos Útiles:
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Tone.js Docs](https://tonejs.github.io/)
- [VexFlow Docs](https://github.com/0xfe/vexflow)
