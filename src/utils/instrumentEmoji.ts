/**
 * Helper para obtener emoji basado en el nombre del instrumento
 * Se usa para mostrar iconos visuales en el panel de tracks y toolbar
 */
export function getInstrumentEmoji(instrumentName: string): string {
  const name = instrumentName.toLowerCase();

  // Pianos y teclados
  if (name.includes('piano') || name.includes('keyboard')) return '🎹';
  if (name.includes('organ')) return '🎹';
  if (name.includes('harpsichord') || name.includes('clavinet')) return '🎹';

  // Guitarras
  if (name.includes('guitar') && (name.includes('electric') || name.includes('dist') || name.includes('overdrive'))) return '🎸';
  if (name.includes('guitar')) return '🎸';
  if (name.includes('banjo')) return '🪕';

  // Bajos
  if (name.includes('bass')) return '🎸';

  // Cuerdas orquestrales
  if (name.includes('violin') || name.includes('fiddle')) return '🎻';
  if (name.includes('viola') || name.includes('cello') || name.includes('contrabass')) return '🎻';
  if (name.includes('string') || name.includes('orchestra')) return '🎻';
  if (name.includes('harp')) return '🎻';

  // Vientos
  if (name.includes('trumpet') || name.includes('horn') || name.includes('brass')) return '🎺';
  if (name.includes('sax')) return '🎷';
  if (name.includes('flute') || name.includes('piccolo') || name.includes('recorder')) return '🪈';
  if (name.includes('clarinet') || name.includes('oboe') || name.includes('bassoon')) return '🪈';

  // Percusión
  if (name.includes('drum') || name.includes('percussion') || name.includes('kit')) return '🥁';
  if (name.includes('timpani') || name.includes('tom')) return '🥁';
  if (name.includes('cymbal') || name.includes('hi-hat')) return '🥁';
  if (name.includes('bell') || name.includes('chime') || name.includes('glocken') || name.includes('vibraphone') || name.includes('xylophone') || name.includes('marimba')) return '🔔';

  // Voz
  if (name.includes('choir') || name.includes('voice') || name.includes('vocal')) return '🎤';

  // Sintetizadores
  if (name.includes('synth') || name.includes('pad') || name.includes('lead')) return '🎛️';

  // Otros
  if (name.includes('whistle')) return '🎵';
  if (name.includes('harmonica') || name.includes('accordion')) return '🪗';

  // Por defecto
  return '🎵';
}
