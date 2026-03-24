import { create } from 'zustand';
import { Language } from '@/constants/translations';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'ru', // Default to Russian
  setLanguage: (language) => set({ language }),
}));
