# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Añadido
- Configuración de CI/CD con GitHub Actions
  - Workflow de desarrollo (`develop.yml`) para linting y build
  - Workflow de release (`release.yml`) para deploy a GitHub Pages
- ESLint con configuración para React + TypeScript
- Prettier para formateo consistente del código
- Scripts de validación en `package.json`
- Archivo `.nvmrc` para especificar versión de Node.js
- Configuración de Vite optimizada para GitHub Pages

### Mejorado
- Código refactorizado para cumplir con las reglas de React Hooks
- Corrección de errores de TypeScript en varios componentes
- Optimización de chunks en el build de producción

## [1.0.0] - 2024-XX-XX

### Añadido
- Visualizador de tablatura interactivo
- Piano Roll con efectos de resplandor
- Partitura con VexFlow
- Sistema de reproducción con Tone.js
- Soporte para 20+ instrumentos
- Instrumentos personalizados
- Auto-transposición
- Control de velocidad
- Sistema de loops
- Exportación a texto

---

[Unreleased]: https://github.com/jgestal/MidiVisualicer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jgestal/MidiVisualicer/releases/tag/v1.0.0
