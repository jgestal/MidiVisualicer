# 🎹 MIDI Visualizer & Tablature Studio

Una potente aplicación web interactiva para visualizar archivos MIDI, diseñada especialmente para músicos que desean practicar con tablaturas, piano roll y partituras de forma fluida y personalizada.

![Modern UI](https://img.shields.io/badge/UI-Custom_Design-blueviolet)
![React](https://img.shields.io/badge/Framework-React_18-61DAFB)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF)
![ToneJS](https://img.shields.io/badge/Audio-Tone.js-FF0055)

## ✨ Características Principales

### 🎸 Visualizaciones Dinámicas
*   **Tablatura Interactiva**: Visualización de notas adaptada al instrumento seleccionado.
*   **Piano Roll**: Vista clásica de secuencia de notas con efectos de resplandor.
*   **Partitura (Notation)**: Renderizado profesional mediante VexFlow con fondo sólido.
*   **Scroll Anticipado**: Sistema de desplazamiento suave (lerp) que mantiene la nota actual al 30% de la pantalla para permitir ver el "futuro" de la pieza.

### 🛠️ Configuración de Instrumentos
*   **Catálogo Extenso**: Soporte nativo para Guitarra, Bandurria, Laúd, Mandolina, Banjo, Ukelele, Violín, Bajo y muchos más.
*   **Instrumentos Personalizados**: Crea tus propios instrumentos definiendo el nombre, número de cuerdas, afinación exacta (ej. `E2, A2, D3...`) y número de trastes. Se guardan localmente en tu navegador.
*   **Auto-Transposición**: El sistema ajusta automáticamente la octava de la melodía para que encaje perfectamente en el rango del instrumento seleccionado.

### 🎮 Control de Reproducción
*   **Seek interactivo**: Haz clic en cualquier parte de la tablatura o piano roll para saltar a ese momento.
*   **Control de Velocidad**: Practica pasajes difíciles reduciendo la velocidad sin cambiar el tono.
*   **Sistema de Loops**: Define puntos de inicio y fin para repetir secciones específicas.
*   **Exportación**: Descarga la tablatura generada en formato de texto o el cifrado de acordes.

## 🚀 Instalación y Uso

### Requisitos previos
*   [Node.js](https://nodejs.org/) (versión 16 o superior)
*   [npm](https://www.npmjs.com/)

### Pasos para ejecutar localmente

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/midi-visualizer.git
   cd midi-visualizer
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

## 📂 Estructura del Proyecto

*   `src/components/`: Componentes React (Visualizadores, Selectores, Controles).
*   `src/hooks/`: Lógica de carga y reproducción MIDI.
*   `src/config/`: Configuración modular de instrumentos.
*   `src/utils/`: Utilidades de exportación y procesamiento de notas.
*   `public/`: Carpeta para archivos estáticos y MIDI de muestra.

## 📄 Licencia

Este proyecto es privado pero puede usarse como base para herramientas de educación musical.

---

Desarrollado con ❤️ para músicos.
