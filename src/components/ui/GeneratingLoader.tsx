'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Loaders.module.css';

const LOADER_TEXT: Record<string, string> = {
    ar: 'التفكير العميق',
    ru: 'Глубокий анализ',
    en: 'Deep Analysis',
};

export function GeneratingLoader() {
    const { locale } = useI18n();
    const text = LOADER_TEXT[locale] || LOADER_TEXT.en;

    return (
        <div className={styles.loaderWrapper}>
            {text.split('').map((char, i) => (
                <span
                    key={i}
                    className={styles.loaderLetter}
                    style={{ animationDelay: `${i * 0.05}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
            <div className={styles.loader}></div>
        </div>
    );
}
