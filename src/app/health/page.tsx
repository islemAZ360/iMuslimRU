'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { analyzeHealth } from '@/lib/healthAnalyzer';
import styles from './Health.module.css';

export default function HealthPage() {
    const { t, locale } = useI18n();
    const { healthProfile } = useAuth();
    const { geminiApiKey, hasGeminiKey, geminiModel } = useSettings();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [productText, setProductText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = useCallback(async (imageBase64?: string) => {
        if (!hasGeminiKey || !healthProfile) return;
        setAnalyzing(true);
        setResult(null);
        setError('');

        try {
            const res = await analyzeHealth(
                geminiApiKey,
                productText || 'Analyze the product in the image',
                healthProfile,
                imageBase64,
                locale,
                geminiModel
            );
            if (res.error) {
                setError(res.error);
            } else {
                setResult(res.analysis);
            }
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setAnalyzing(false);
        }
    }, [hasGeminiKey, healthProfile, geminiApiKey, productText, locale, geminiModel, t]);

    const handlePhotoCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            setCapturedImage(reader.result as string);
            handleAnalyze(base64);
        };
        reader.readAsDataURL(file);
    }, [handleAnalyze]);

    if (!hasGeminiKey) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <h1 className={styles.title}>{t('health.title')}</h1>
                    <div className={styles.apiPrompt}>
                        <div className={styles.promptIcon}>🔑</div>
                        <p>{t('health.apiRequired')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!healthProfile || (!healthProfile.height && !healthProfile.weight)) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <h1 className={styles.title}>{t('health.title')}</h1>
                    <div className={styles.apiPrompt}>
                        <div className={styles.promptIcon}>👤</div>
                        <p>{t('health.profileRequired')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('health.title')}</h1>

                {/* Input Section */}
                <div className={styles.inputSection}>
                    <div className="input-group">
                        <label>{t('health.analyzeProduct')}</label>
                        <textarea
                            className={`input ${styles.textarea}`}
                            value={productText}
                            onChange={(e) => setProductText(e.target.value)}
                            placeholder="Enter product name, ingredients, or description..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handleAnalyze()}
                            disabled={analyzing || !productText.trim()}
                        >
                            {analyzing ? <span className="spinner" /> : `🔬 ${t('health.analyzeProduct')}`}
                        </button>

                        <button
                            className="btn btn-secondary btn-block"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={analyzing}
                        >
                            📷 {t('scanner.takePhoto')}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoCapture}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Captured Image Preview */}
                {capturedImage && (
                    <div className={styles.imagePreview}>
                        <img src={capturedImage} alt="Product" />
                    </div>
                )}

                {/* Loading */}
                {analyzing && (
                    <div className={styles.loadingState}>
                        <div className="spinner" />
                        <p>{t('scanner.analyzing')}</p>
                    </div>
                )}

                {/* Error */}
                {error && <div className="alert alert-danger">❌ {error}</div>}

                {/* Results */}
                {result && (
                    <div className={`glass-card ${styles.resultCard}`}>
                        <div className={styles.resultHeader}>
                            <span>💚</span>
                            <span>{t('health.healthAdvice')}</span>
                        </div>
                        <div className={styles.resultContent}>
                            {result.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
