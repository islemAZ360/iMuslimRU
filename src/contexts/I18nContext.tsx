'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import en from '../../public/locales/en.json';
import ar from '../../public/locales/ar.json';
import ru from '../../public/locales/ru.json';

export type Locale = 'en' | 'ar' | 'ru';

type TranslationValue = string | Record<string, unknown>;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const translations: Record<Locale, Record<string, unknown>> = { en, ar, ru };

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return path; // fallback: return the key itself
        }
    }
    return typeof current === 'string' ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ru');

    useEffect(() => {
        const saved = localStorage.getItem('imuslim-locale') as Locale | null;
        if (saved && translations[saved]) {
            setLocaleState(saved);
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', locale);
    }, [locale]);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('imuslim-locale', newLocale);
    }, []);

    const t = useCallback(
        (key: string): string => {
            return getNestedValue(translations[locale] as Record<string, unknown>, key);
        },
        [locale]
    );

    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
