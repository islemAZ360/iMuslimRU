import { create } from 'zustand';
import { Language } from '@/constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'imuslim_language';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'ru',
  setLanguage: async (language) => {
    set({ language });
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch {}
  },
  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved) set({ language: saved as Language });
    } catch {}
  },
}));
