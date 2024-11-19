export type SongCategory = 'angola' | 'saoBentoPequeno' | 'saoBentoGrande';

export interface Song {
  id: string;
  title: string;
  category: SongCategory;
  mnemonic?: string;
  lyrics?: string;
  mediaLink?: string;
}

export interface PrompterSettings {
  rotationInterval: number;
  fontSize: 'small' | 'medium' | 'large';
  isDarkMode: boolean;
  useHighContrast: boolean;
  upperCase: boolean;
}

export const CATEGORY_COLORS = {
  angola: '#E8DF24',
  saoBentoPequeno: '#03A501',
  saoBentoGrande: '#0467B0',
} as const;

export const FONT_SIZES = {
  small: '1.5rem',
  medium: '2rem',
  large: '2.5rem',
} as const;