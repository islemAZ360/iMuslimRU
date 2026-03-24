import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from '../locales/translations';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'ru', // Default to Russian for Muslim Russia app
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const { language } = get();
        return (translations[language][key] || translations.en[key] || key) as string;
      },
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
