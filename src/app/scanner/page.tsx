'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useSettings } from '@/contexts/SettingsContext';
import { classicScan, aiScan, ScanResult } from '@/lib/scanner';
import { GeneratingLoader } from '@/components/ui/GeneratingLoader';
import styles from './Scanner.module.css';

export default function ScannerPage() {
    const { t, locale } = useI18n();
    const { geminiApiKey, hasGeminiKey, geminiModel } = useSettings();
    const [mode, setMode] = useState<'classic' | 'ai'>(hasGeminiKey ? 'ai' : 'classic');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBarcodeScan = useCallback(async () => {
        if (!barcodeInput.trim()) return;
        setScanning(true);
        setResult(null);

        try {
            if (mode === 'ai' && hasGeminiKey) {
                const res = await aiScan(geminiApiKey, barcodeInput, undefined, locale, geminiModel);
                setResult(res);
            } else {
                const res = await classicScan(barcodeInput);
                setResult(res);
            }
        } catch (error) {
            console.error('Scan error:', error);
        } finally {
            setScanning(false);
        }
    }, [barcodeInput, mode, hasGeminiKey, geminiApiKey, locale, geminiModel]);

    const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // If no key, maybe show alert? But user can still click just to test UI?
        // Actually, without key AI scan fails.
        if (!hasGeminiKey) {
            alert(t('scanner.aiRequired') || 'AI Key required for photo analysis');
            return;
        }

        setScanning(true);
        setResult(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setCapturedImage(reader.result as string);

            try {
                // Auto switch to AI mode for photo
                setMode('ai');
                const res = await aiScan(geminiApiKey, '', base64, locale, geminiModel);
                setResult(res);
            } catch (error) {
                console.error('Photo scan error:', error);
            } finally {
                setScanning(false);
            }
        };
        reader.readAsDataURL(file);
    }, [hasGeminiKey, geminiApiKey, locale, geminiModel, t]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'halal': return <span className="badge badge-success">✅ {t('scanner.halal')}</span>;
            case 'haram': return <span className="badge badge-danger">❌ {t('scanner.haram')}</span>;
            case 'doubtful': return <span className="badge badge-warning">⚠️ {t('scanner.doubtful')}</span>;
            default: return null;
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('scanner.title')}</h1>

                {/* Mode Switcher */}
                <div className={styles.modeSwitcher}>
                    <button
                        className={`${styles.modeBtn} ${mode === 'classic' ? styles.modeBtnActive : ''}`}
                        onClick={() => setMode('classic')}
                    >
                        📦 {t('scanner.classicMode')}
                    </button>
                    <button
                        className={`${styles.modeBtn} ${mode === 'ai' ? styles.modeBtnActive : ''}`}
                        onClick={() => {
                            if (!hasGeminiKey) return;
                            setMode('ai');
                        }}
                        style={!hasGeminiKey ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        🤖 {t('scanner.aiMode')}
                    </button>
                </div>

                {mode === 'ai' && !hasGeminiKey && (
                    <div className="alert alert-warning">
                        ⚠️ {t('scanner.aiRequired')}
                    </div>
                )}

                {/* Barcode Input */}
                <div className={styles.inputSection}>
                    <div className={styles.barcodeInput}>
                        <input
                            type="text"
                            className="input"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            placeholder={t('scanner.scanBarcode')}
                            onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleBarcodeScan}
                            disabled={scanning || !barcodeInput.trim()}
                        >
                            {scanning ? <span className="spinner" /> : '🔍'}
                        </button>
                    </div>

                    {/* Photo Capture (Visible in all modes now) */}
                    <div className={styles.photoSection}>
                        <button
                            className="btn btn-secondary btn-block"
                            onClick={() => {
                                if (!hasGeminiKey) {
                                    alert(t('scanner.aiRequired') || 'Please add Gemini API Key in Settings first.');
                                    return;
                                }
                                fileInputRef.current?.click();
                            }}
                            disabled={scanning}
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

                {/* Scanning indicator */}
                {scanning && (
                    <div className={styles.scanningIndicator}>
                        {mode === 'ai' ? (
                            <div className="flex flex-col items-center">
                                <GeneratingLoader />
                            </div>
                        ) : (
                            <>
                                <div className="spinner" />
                                <p>{t('scanner.scanning')}</p>
                            </>
                        )}
                    </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                    <div className={styles.imagePreview}>
                        <img src={capturedImage} alt="Captured product" />
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className={styles.results}>
                        {/* Database Product Info */}
                        {result.product && (
                            <div className={`glass-card ${styles.resultCard}`}>
                                <h3>{result.product.name}</h3>
                                <p className={styles.manufacturer}>
                                    {t('scanner.manufacturer')}: {result.product.manufacturer}
                                </p>

                                <div className={styles.checks}>
                                    {/* Halal Check */}
                                    <div className={styles.checkItem}>
                                        <div className={styles.checkLabel}>{t('scanner.halalCheck')}</div>
                                        <div>{getStatusBadge(result.product.halalStatus)}</div>
                                        {result.product.haramIngredients.length > 0 && (
                                            <p className={styles.haramDetail}>
                                                {result.product.haramIngredients.join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Boycott Check */}
                                    <div className={styles.checkItem}>
                                        <div className={styles.checkLabel}>{t('scanner.boycottCheck')}</div>
                                        <div>
                                            {result.product.boycottStatus ? (
                                                <span className="badge badge-danger">🚫 {t('scanner.boycott')}</span>
                                            ) : (
                                                <span className="badge badge-success">✅ {t('scanner.notBoycott')}</span>
                                            )}
                                        </div>
                                        {result.product.boycottReason && (
                                            <p className={styles.boycottDetail}>{result.product.boycottReason}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No product found */}
                        {!result.product && !result.aiAnalysis && (
                            <div className="flex flex-col gap-2">
                                <div className="alert alert-info">ℹ️ {t('scanner.noResults')}</div>
                                {/* Suggest AI Scan if in Classic Mode and no result */}
                                {mode === 'classic' && hasGeminiKey && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setMode('ai');
                                            // Trigger scan immediately if input present
                                            if (barcodeInput) {
                                                // We can't easily call handleBarcodeScan here with new mode relying on state update
                                                // Ideally we'd pass mode as arg, but let's just switch UI for now and let user click
                                            }
                                        }}
                                    >
                                        🤖 Try AI Scan
                                    </button>
                                )}
                            </div>
                        )}

                        {/* AI Analysis */}
                        {result.aiAnalysis && (
                            <div className={`glass-card ${styles.aiResultCard}`}>
                                <div className={styles.aiHeader}>
                                    <span>🤖</span>
                                    <span>AI Analysis</span>
                                </div>
                                <div className={styles.aiContent}>
                                    {result.aiAnalysis.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Prompt text */}
                {!result && !scanning && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📷</div>
                        <p>{t('scanner.scanPrompt')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
