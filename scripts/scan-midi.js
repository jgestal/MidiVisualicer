/**
 * Script para escanear la carpeta midi y generar un JSON con la lista de archivos
 * Ejecutar con: node scripts/scan-midi.js
 */
const fs = require('fs');
const path = require('path');

const MIDI_DIR = path.join(__dirname, '..', 'midi');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'midi-files.json');
const MAX_FILES_PER_FOLDER = 100; // Limitar para no sobrecargar la UI

function scanDirectory(dirPath, relativePath = '') {
  const result = {
    name: path.basename(dirPath),
    path: relativePath || '/' + path.basename(dirPath),
    files: [],
    subfolders: []
  };

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    // Primero las carpetas
    items.filter(item => item.isDirectory()).forEach(item => {
      const subfolder = scanDirectory(
        path.join(dirPath, item.name),
        `${result.path}/${item.name}`
      );
      if (subfolder.files.length > 0 || subfolder.subfolders.length > 0) {
        result.subfolders.push(subfolder);
      }
    });

    // Luego los archivos MIDI
    const midiFiles = items
      .filter(item => !item.isDirectory() && /\.(mid|midi)$/i.test(item.name))
      .slice(0, MAX_FILES_PER_FOLDER); // Limitar cantidad

    midiFiles.forEach(item => {
      result.files.push({
        name: item.name.replace(/\.(mid|midi)$/i, ''),
        path: `${result.path}/${item.name}`,
        folder: result.name
      });
    });

    // Agregar indicador si hay más archivos
    const totalMidiFiles = items.filter(item => !item.isDirectory() && /\.(mid|midi)$/i.test(item.name)).length;
    if (totalMidiFiles > MAX_FILES_PER_FOLDER) {
      result.moreFiles = totalMidiFiles - MAX_FILES_PER_FOLDER;
    }

  } catch (err) {
    console.error(`Error scanning ${dirPath}:`, err.message);
  }

  return result;
}

// Escanear y guardar
console.log('Escaneando carpeta MIDI...');
const midiStructure = scanDirectory(MIDI_DIR);

// Crear directorio public si no existe
const publicDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify([midiStructure], null, 2));
console.log(`✅ Generado: ${OUTPUT_FILE}`);
console.log(`   - ${midiStructure.files.length} archivos en raíz`);
console.log(`   - ${midiStructure.subfolders.length} subcarpetas`);
midiStructure.subfolders.forEach(sf => {
  console.log(`     · ${sf.name}: ${sf.files.length} archivos`);
});
