/**
 * Locales index - Type definitions and exports
 * 
 * To add a new language:
 * 1. Create a new file (e.g., ko.ts for Korean)
 * 2. Copy the structure from en.ts and translate
 * 3. Import and add to TRANSLATIONS object below
 * 4. Add language config to LANGUAGES constant
 */

import { es } from './es';
import { en } from './en';
import { pt } from './pt';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { zh } from './zh';
import { ja } from './ja';

// Supported language codes
export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja';

// Type for translation keys (based on Spanish file keys)
export type TranslationKey = keyof typeof es;

// Type for translation object - Record of all keys with string values
export type Translations = { readonly [K in TranslationKey]: string };

// All translations indexed by language code
export const TRANSLATIONS: Record<Language, Translations> = {
    es,
    en,
    pt,
    fr,
    de,
    it,
    zh,
    ja,
};

// Language metadata for UI display
export const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
    es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
    pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
};

// Helper to get translations for a language (with fallback to English)
export function getTranslations(lang: Language): Translations {
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

// Re-export individual translations for direct access if needed
export { es, en, pt, fr, de, it, zh, ja };
