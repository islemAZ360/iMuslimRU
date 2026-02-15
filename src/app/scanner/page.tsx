'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useSettings } from '@/contexts/SettingsContext';
import { aiScan, ScanResult } from '@/lib/scanner';
import { GeneratingLoader } from '@/components/ui/GeneratingLoader';
import styles from './Scanner.module.css';

export default function ScannerPage() {
    const { t, locale } = useI18n();
    const { geminiApiKey, hasGeminiKey, geminiModel } = useSettings();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScan = useCallback(async () => {
        if (!barcodeInput.trim()) return;
        if (!hasGeminiKey) {
            alert(t('scanner.aiRequired') || 'Please add Gemini API Key in Settings first.');
            return;
        }
        setScanning(true);
        setResult(null);
        setCapturedImage(null);

        try {
            const res = await aiScan(geminiApiKey, barcodeInput, undefined, locale, geminiModel);
            setResult(res);
        } catch (error) {
            console.error('Scan error:', error);
        } finally {
            setScanning(false);
        }
    }, [barcodeInput, hasGeminiKey, geminiApiKey, locale, geminiModel, t]);

    const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!hasGeminiKey) {
            alert(t('scanner.aiRequired') || 'Please add Gemini API Key in Settings first.');
            return;
        }

        setScanning(true);
        setResult(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            setCapturedImage(reader.result as string);

            try {
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

    // Parse AI analysis text with simple markdown rendering
    const renderAiAnalysis = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} style={{ height: '8px' }} />;

            // H3 headers (###)
            if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                const headerText = trimmed.replace(/^#+\s/, '');
                return (
                    <div key={i} style={{
                        fontSize: '15px', fontWeight: 800, margin: '14px 0 6px',
                        color: 'rgba(255,255,255,0.9)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <div style={{
                            width: '3px', height: '16px', borderRadius: '2px',
                            background: 'linear-gradient(180deg, #10b981, #34d399)',
                        }} />
                        {renderInlineFormatting(headerText)}
                    </div>
                );
            }

            // Horizontal rules
            if (trimmed === '---' || trimmed === '***') {
                return <div key={i} style={{
                    height: '1px', margin: '10px 0',
                    background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)',
                }} />;
            }

            // Bullet points
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                const bulletText = trimmed.slice(2);
                return (
                    <div key={i} style={{
                        display: 'flex', gap: '8px', padding: '4px 0',
                        fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)',
                    }}>
                        <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>•</span>
                        <span>{renderInlineFormatting(bulletText)}</span>
                    </div>
                );
            }

            // Regular text
            return (
                <p key={i} style={{
                    fontSize: '13px', lineHeight: 1.7, margin: '3px 0',
                    color: 'rgba(255,255,255,0.65)',
                }}>
                    {renderInlineFormatting(trimmed)}
                </p>
            );
        });
    };

    // Render inline **bold** text
    const renderInlineFormatting = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'halal': return <span className="badge badge-success">✅ {t('scanner.halal')}</span>;
            case 'haram': return <span className="badge badge-danger">❌ {t('scanner.haram')}</span>;
            case 'doubtful': return <span className="badge badge-warning">⚠️ {t('scanner.doubtful')}</span>;
            default: return null;
        }
    };

    const placeholderText = locale === 'ar' ? 'أدخل رقم الباركود أو اسم المنتج...'
        : locale === 'ru' ? 'Введите штрихкод или название продукта...'
            : 'Enter barcode or product name...';

    const titleText = locale === 'ar' ? 'تحليل ذكي'
        : locale === 'ru' ? 'Умный анализ'
            : 'Smart Analysis';

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('scanner.title')}</h1>

                {/* Unified Smart Scanner — no mode switcher */}
                {!hasGeminiKey && (
                    <div style={{
                        padding: '14px 16px', borderRadius: '14px', marginBottom: '16px',
                        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <span style={{ fontSize: '18px' }}>⚠️</span>
                        <p style={{ fontSize: '13px', color: '#fbbf24', margin: 0, fontWeight: 600 }}>
                            {t('scanner.aiRequired')}
                        </p>
                    </div>
                )}

                {/* Input Section */}
                <div className={styles.inputSection}>
                    <div className={styles.barcodeInput}>
                        <input
                            type="text"
                            className="input"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            placeholder={placeholderText}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleScan}
                            disabled={scanning || !barcodeInput.trim() || !hasGeminiKey}
                        >
                            {scanning ? <span className="spinner" /> : '🔍'}
                        </button>
                    </div>

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
                        <GeneratingLoader />
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
                                    <div className={styles.checkItem}>
                                        <div className={styles.checkLabel}>{t('scanner.halalCheck')}</div>
                                        <div>{getStatusBadge(result.product.halalStatus)}</div>
                                        {result.product.haramIngredients.length > 0 && (
                                            <p className={styles.haramDetail}>
                                                {result.product.haramIngredients.join(', ')}
                                            </p>
                                        )}
                                    </div>

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

                        {/* AI Analysis — Premium Design */}
                        {result.aiAnalysis && (
                            <div style={{
                                borderRadius: '20px', overflow: 'hidden',
                                border: '1px solid rgba(16,185,129,0.15)',
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(16px)',
                            }}>
                                {/* Header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '14px 18px',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                                    borderBottom: '1px solid rgba(16,185,129,0.1)',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #10b98130, #10b98115)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px',
                                    }}>🤖</div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px', fontWeight: 800,
                                            background: 'linear-gradient(135deg, #10b981, #34d399)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        }}>{titleText}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                                            Gemini AI
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{
                                    padding: '16px 18px',
                                    direction: locale === 'ar' ? 'rtl' : 'ltr',
                                    textAlign: locale === 'ar' ? 'right' : 'left',
                                }}>
                                    {renderAiAnalysis(result.aiAnalysis)}
                                </div>
                            </div>
                        )}

                        {/* No result fallback */}
                        {!result.product && !result.aiAnalysis && (
                            <div style={{
                                padding: '20px', borderRadius: '16px', textAlign: 'center',
                                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                            }}>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                                    ℹ️ {t('scanner.noResults')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state prompt */}
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
