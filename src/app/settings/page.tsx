'use client';

import React, { useState } from 'react';
import { useI18n, Locale } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings, AVAILABLE_MODELS } from '@/contexts/SettingsContext';
import styles from './Settings.module.css';

export default function SettingsPage() {
    const { t, locale, setLocale } = useI18n();
    const { theme, setTheme } = useTheme();
    const { geminiApiKey, setGeminiApiKey, geminiModel, setGeminiModel } = useSettings();
    const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
    const [keySaved, setKeySaved] = useState(false);

    const handleSaveKey = () => {
        setGeminiApiKey(apiKeyInput);
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 2000);
    };

    const languages: { code: Locale; label: string; flag: string }[] = [
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    ];

    const themes: { value: 'light' | 'dark' | 'auto'; icon: string }[] = [
        { value: 'light', icon: '☀️' },
        { value: 'dark', icon: '🌙' },
        { value: 'auto', icon: '🔄' },
    ];

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('settings.title')}</h1>

                {/* Language Section */}
                <div className={`glass-card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>🌐 {t('settings.language')}</h3>
                    <div className={styles.languageGrid}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                className={`${styles.langBtn} ${locale === lang.code ? styles.langBtnActive : ''}`}
                                onClick={() => setLocale(lang.code)}
                            >
                                <span className={styles.flag}>{lang.flag}</span>
                                <span>{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Section */}
                <div className={`glass-card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>🎨 {t('settings.theme')}</h3>
                    <div className={styles.themeGrid}>
                        {themes.map((t_item) => (
                            <button
                                key={t_item.value}
                                className={`${styles.themeBtn} ${theme === t_item.value ? styles.themeBtnActive : ''}`}
                                onClick={() => setTheme(t_item.value)}
                            >
                                <span className={styles.themeIcon}>{t_item.icon}</span>
                                <span>{t(`settings.theme${t_item.value.charAt(0).toUpperCase() + t_item.value.slice(1)}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gemini API Key */}
                <div className={`glass-card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>🤖 {t('settings.geminiApiKey')}</h3>
                    <p className={styles.sectionInfo}>{t('settings.apiKeyInfo')}</p>
                    <div className={styles.apiKeyInput}>
                        {/* CHANGED: type is now 'text' permanently for visibility */}
                        <input
                            type="text"
                            className="input"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder={t('settings.enterApiKey')}
                        />
                    </div>
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleSaveKey}
                        style={{ marginTop: 'var(--space-3)' }}
                    >
                        {keySaved ? '✅ Saved' : t('common.save')}
                    </button>
                </div>

                {/* Gemini Model Selector */}
                <div className={`glass-card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>🧠 AI Model</h3>
                    <p className={styles.sectionInfo}>
                        Choose the Gemini model for AI analysis. Different models have different capabilities and speeds.
                    </p>
                    <div className={styles.modelGrid}>
                        {AVAILABLE_MODELS.map((model) => (
                            <button
                                key={model}
                                className={`${styles.modelBtn} ${geminiModel === model ? styles.modelBtnActive : ''}`}
                                onClick={() => setGeminiModel(model)}
                            >
                                <span className={styles.modelName}>{model}</span>
                                {geminiModel === model && <span className={styles.modelCheck}>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className={`glass-card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>ℹ️ {t('settings.about')}</h3>
                    <div className={styles.aboutInfo}>
                        <div className={styles.aboutItem}>
                            <span>{t('settings.version')}</span>
                            <span className={styles.aboutValue}>1.0.1</span>
                        </div>
                        <div className={styles.aboutItem}>
                            <span>AI Model</span>
                            <span className={styles.aboutValue}>{geminiModel}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
