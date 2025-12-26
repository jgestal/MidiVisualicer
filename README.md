# 🎹 Midi Tab Pro

Una potente aplicación web interactiva para visualizar archivos MIDI, diseñada especialmente para músicos que desean practicar con tablaturas, piano roll y partituras de forma fluida y personalizada.

[![CI - Development](https://github.com/jgestal/MidiVisualicer/actions/workflows/develop.yml/badge.svg)](https://github.com/jgestal/MidiVisualicer/actions/workflows/develop.yml)
[![Deploy - Production](https://github.com/jgestal/MidiVisualicer/actions/workflows/release.yml/badge.svg)](https://github.com/jgestal/MidiVisualicer/actions/workflows/release.yml)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.4-646CFF?logo=vite)
![Tone.js](https://img.shields.io/badge/Tone.js-14.7-FF0055)

## ✨ Características Principales

### 🎸 Visualizaciones Dinámicas
- **Tablatura Interactiva**: Visualización de notas adaptada al instrumento seleccionado.
- **Piano Roll**: Vista clásica de secuencia de notas con efectos de resplandor.
- **Partitura (Notation)**: Renderizado profesional mediante VexFlow con fondo sólido.
- **Scroll Anticipado**: Sistema de desplazamiento suave (lerp) que mantiene la nota actual al 30% de la pantalla.

### 🛠️ Configuración de Instrumentos
- **Catálogo Extenso**: Soporte para Guitarra, Bandurria, Laúd, Mandolina, Banjo, Ukelele, Violín, Bajo y muchos más.
- **Instrumentos Personalizados**: Crea tus propios instrumentos con afinación personalizada.
- **Auto-Transposición**: Ajuste automático de octavas para el rango del instrumento.

### 🎮 Control de Reproducción
- **Seek interactivo**: Clic en cualquier nota para saltar a ese momento.
- **Control de Velocidad**: Practica a velocidad reducida (0.25x - 1x).
- **Sistema de Loops**: Define secciones para repetir.
- **Exportación**: Descarga tablatura o cifrado de acordes.

## 🚀 Inicio Rápido

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jgestal/MidiVisualicer.git
cd MidiVisualicer

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará en http://localhost:3000
```

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:fix` | Corregir errores de lint |
| `npm run format` | Formatear código con Prettier |
| `npm run format:check` | Verificar formato |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run validate` | Ejecutar todas las validaciones |

## 📂 Estructura del Proyecto

```
src/
├── components/     # Componentes React
│   ├── TablatureView.tsx
│   ├── PianoRollView.tsx
│   ├── NotationView.tsx
│   ├── PlayerControls.tsx
│   └── ...
├── hooks/          # Custom hooks
│   ├── useMidiLoader.ts
│   └── useMidiPlayer.ts
├── config/         # Configuración
│   └── instruments.ts
├── types/          # Tipos TypeScript
│   └── midi.ts
├── utils/          # Utilidades
│   └── export.ts
├── styles/         # Estilos CSS
└── App.tsx         # Componente principal
```

## 🔧 CI/CD

El proyecto usa GitHub Actions para integración y despliegue continuo:

- **develop.yml**: Ejecuta linting, type-check y build en PRs y branches de desarrollo
- **release.yml**: Construye y despliega a GitHub Pages en push a `main` o tags `v*`

## 🛠️ Tecnologías

- **[React 18](https://react.dev/)** - UI Framework
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipado estático
- **[Vite](https://vitejs.dev/)** - Build tool y dev server
- **[Tone.js](https://tonejs.github.io/)** - Síntesis de audio
- **[VexFlow](https://www.vexflow.com/)** - Notación musical
- **[Lucide React](https://lucide.dev/)** - Iconos

## 📄 Licencia

MIT © Portal FP

---

Desarrollado con ❤️ para músicos.
