import {
  Sun,
  Moon,
  Monitor,
  Tv,
  Smartphone,
  Command,
  Layout,
  Save,
  Coffee,
  Palmtree,
  Diamond,
  Shapes,
  Zap,
  Home,
  Flame,
  Cloud,
  Eye,
  Radio,
  Box,
  Sword,
  Headphones,
  Factory,
  Music2,
  Sparkles,
  Cog,
  Wind,
  Orbit,
  Leaf,
  Droplets,
  Terminal,
  type LucideIcon
} from 'lucide-react';

export type ThemeCategory = 'Standard' | 'Retro & Tech' | 'Art & Design' | 'Pop Culture' | 'Gaming' | 'Music & Style' | 'Futurism';

export interface ThemeConfig {
  id: string;
  name: string; // Default name or translation key base
  icon: LucideIcon;
  category: ThemeCategory;
  primaryColor: string;
}

export const THEMES: ThemeConfig[] = [
  // Standard
  { id: 'dark', name: 'darkMode', icon: Moon, category: 'Standard', primaryColor: '#0a0a0f' },
  { id: 'light', name: 'lightMode', icon: Sun, category: 'Standard', primaryColor: '#f8fafc' },
  { id: 'auto', name: 'auto', icon: Monitor, category: 'Standard', primaryColor: '#0a0a0f' },

  // Retro & Tech
  { id: 'vhs', name: 'vhsMode', icon: Tv, category: 'Retro & Tech', primaryColor: '#0b0b1a' },
  { id: 'nokia', name: 'nokiaMode', icon: Smartphone, category: 'Retro & Tech', primaryColor: '#c7cebc' },
  { id: 'msdos', name: 'msdosMode', icon: Command, category: 'Retro & Tech', primaryColor: '#000000' },
  { id: 'win95', name: 'win95Mode', icon: Layout, category: 'Retro & Tech', primaryColor: '#008080' },
  { id: 'floppy', name: 'floppyMode', icon: Save, category: 'Retro & Tech', primaryColor: '#e0dcd0' },

  // Art & Design
  { id: 'solarized', name: 'solarizedMode', icon: Coffee, category: 'Art & Design', primaryColor: '#fdf6e3' },
  { id: 'vaporwave', name: 'vaporwaveMode', icon: Palmtree, category: 'Art & Design', primaryColor: '#ff71ce' },
  { id: 'artdeco', name: 'artdecoMode', icon: Diamond, category: 'Art & Design', primaryColor: '#0a0a0a' },
  { id: 'bauhaus', name: 'bauhausMode', icon: Shapes, category: 'Art & Design', primaryColor: '#ffffff' },
  { id: 'memphis', name: 'memphisMode', icon: Zap, category: 'Art & Design', primaryColor: '#ffffff' },

  // Pop Culture
  { id: 'wesanderson', name: 'wesandersonMode', icon: Home, category: 'Pop Culture', primaryColor: '#f2c1b0' },
  { id: 'bladerunner', name: 'bladerunnerMode', icon: Flame, category: 'Pop Culture', primaryColor: '#1a0b00' },
  { id: 'ghibli', name: 'ghibliMode', icon: Cloud, category: 'Pop Culture', primaryColor: '#e0f4ff' },
  { id: 'sincity', name: 'sincityMode', icon: Eye, category: 'Pop Culture', primaryColor: '#000000' },

  // Gaming
  { id: 'pipboy', name: 'pipboyMode', icon: Radio, category: 'Gaming', primaryColor: '#000000' },
  { id: 'minecraft', name: 'minecraftMode', icon: Box, category: 'Gaming', primaryColor: '#7a7a7a' },
  { id: 'cyberpunk', name: 'cyberpunkMode', icon: Zap, category: 'Gaming', primaryColor: '#fcee0a' },
  { id: 'rpg', name: 'rpgMode', icon: Sword, category: 'Gaming', primaryColor: '#000080' },

  // Music & Style
  { id: 'lofi', name: 'lofiMode', icon: Headphones, category: 'Music & Style', primaryColor: '#2d1b4d' },
  { id: 'industrial', name: 'industrialMode', icon: Factory, category: 'Music & Style', primaryColor: '#0a0a0a' },
  { id: 'reggae', name: 'reggaeMode', icon: Music2, category: 'Music & Style', primaryColor: '#1a1a1a' },
  { id: 'disco', name: 'discoMode', icon: Sparkles, category: 'Music & Style', primaryColor: '#000000' },

  // Futurism
  { id: 'steampunk', name: 'steampunkMode', icon: Cog, category: 'Futurism', primaryColor: '#2b1d12' },
  { id: 'solarpunk', name: 'solarpunkMode', icon: Wind, category: 'Futurism', primaryColor: '#f0f9f0' },
  { id: 'lcars', name: 'lcarsMode', icon: Orbit, category: 'Futurism', primaryColor: '#000000' },
  { id: 'emerald', name: 'emeraldMode', icon: Leaf, category: 'Futurism', primaryColor: '#061111' },
  { id: 'aqua', name: 'aquaMode', icon: Droplets, category: 'Futurism', primaryColor: '#e6e6e6' },
  { id: 'matrix', name: 'matrixMode', icon: Terminal, category: 'Futurism', primaryColor: '#000000' },
];

export type ThemeId = typeof THEMES[number]['id'];
export type ResolvedThemeId = Exclude<ThemeId, 'auto'>;

export const CATEGORIES: ThemeCategory[] = [
  'Standard',
  'Retro & Tech',
  'Art & Design',
  'Pop Culture',
  'Gaming',
  'Music & Style',
  'Futurism'
];
