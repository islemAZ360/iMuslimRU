'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { getPrayerTimes, getNextPrayer, getTimeRemaining, formatTime, getQiblaDirection, PrayerTimeResult } from '@/lib/prayer';
import styles from './Prayer.module.css';

/* ─── Nawafil (Sunnah prayers) data ─── */
const NAWAFIL_DATA = [
    { prayer: 'fajr', before: 2, after: 0 },
    { prayer: 'dhuhr', before: 4, after: 2 },
    { prayer: 'asr', before: 4, after: 0 },
    { prayer: 'maghrib', before: 0, after: 2 },
    { prayer: 'isha', before: 0, after: 2 },
];

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function loadNawafilChecks(): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('nawafil_checks');
        if (!raw) return {};
        const data = JSON.parse(raw);
        if (data._date !== getTodayKey()) return {}; // reset daily
        return data;
    } catch { return {}; }
}

function saveNawafilChecks(checks: Record<string, boolean>) {
    localStorage.setItem('nawafil_checks', JSON.stringify({ ...checks, _date: getTodayKey() }));
    // Also save to nawafil_history for stats page
    const today = getTodayKey();
    let completed = 0;
    Object.entries(checks).forEach(([key, val]) => {
        if (key !== '_date' && val) completed++;
    });
    try {
        const raw = localStorage.getItem('nawafil_history');
        const history = raw ? JSON.parse(raw) : {};
        history[today] = completed;
        localStorage.setItem('nawafil_history', JSON.stringify(history));
    } catch { /* ignore */ }
}

export default function PrayerPage() {
    const { t, locale } = useI18n();
    const [tab, setTab] = useState<'times' | 'qibla'>('times');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimeResult | null>(null);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
    const [countdown, setCountdown] = useState('');
    const [qiblaAngle, setQiblaAngle] = useState(0);
    const [compassHeading, setCompassHeading] = useState(0);
    const [locationError, setLocationError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nawafilChecks, setNawafilChecks] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setNawafilChecks(loadNawafilChecks());
    }, []);

    const toggleNawafil = useCallback((key: string) => {
        setNawafilChecks(prev => {
            const next = { ...prev, [key]: !prev[key] };
            saveNawafilChecks(next);
            return next;
        });
    }, []);

    const requestLocation = useCallback(() => {
        const cached = localStorage.getItem('prayer_location');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.lat && parsed.lng) {
                    setLocation(parsed);
                    setLoading(false);
                }
            } catch (e) {
                console.error('Failed to parse cached location');
            }
        }

        if (!navigator.geolocation) {
            setLocationError(true);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLocation(newLoc);
                localStorage.setItem('prayer_location', JSON.stringify(newLoc));
                setLocationError(false);
                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                if (!location) {
                    setLocationError(true);
                }
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    useEffect(() => {
        if (!location) return;
        try {
            const times = getPrayerTimes(location.lat, location.lng);
            setPrayerTimes(times);
            setQiblaAngle(getQiblaDirection(location.lat, location.lng));
            const next = getNextPrayer(times, location.lat, location.lng);
            setNextPrayer(next);
        } catch (e) {
            console.error('Error calculating prayer times:', e);
        }
    }, [location]);

    useEffect(() => {
        if (!nextPrayer) return;
        setCountdown(getTimeRemaining(nextPrayer.time));
        const timer = setInterval(() => {
            setCountdown(getTimeRemaining(nextPrayer.time));
        }, 1000);
        return () => clearInterval(timer);
    }, [nextPrayer]);

    // Device orientation for compass
    useEffect(() => {
        if (tab !== 'qibla') return;

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) {
                setCompassHeading(e.alpha);
            }
        };

        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission().then((response: string) => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            });
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [tab]);

    if (loading && !location) {
        return (
            <div className="page-wrapper center-content">
                <div className="spinner-large" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t('prayer.locating') || 'Locating...'}</p>
            </div>
        );
    }

    if (locationError && !location) {
        return (
            <div className="page-wrapper">
                <div className="container">
                    <div className={styles.locationPrompt}>
                        <div className={styles.locationIcon}>📍</div>
                        <h2>{t('prayer.title')}</h2>
                        <p>{t('prayer.locationRequired')}</p>
                        <button className="btn btn-primary btn-lg" onClick={requestLocation}>
                            {t('prayer.allowLocation')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const prayerList = prayerTimes
        ? [
            { key: 'fajr', label: t('prayer.fajr'), time: prayerTimes.fajr, emoji: '🌙' },
            { key: 'sunrise', label: t('prayer.sunrise'), time: prayerTimes.sunrise, emoji: '🌅' },
            { key: 'dhuhr', label: t('prayer.dhuhr'), time: prayerTimes.dhuhr, emoji: '☀️' },
            { key: 'asr', label: t('prayer.asr'), time: prayerTimes.asr, emoji: '🌤️' },
            { key: 'maghrib', label: t('prayer.maghrib'), time: prayerTimes.maghrib, emoji: '🌆' },
            { key: 'isha', label: t('prayer.isha'), time: prayerTimes.isha, emoji: '🌃' },
        ]
        : [];

    // Count total nawafil completed today
    const nawafilCompleted = Object.entries(nawafilChecks).filter(([k, v]) => k !== '_date' && v).length;
    const nawafilTotal = NAWAFIL_DATA.reduce((s, n) => s + (n.before > 0 ? 1 : 0) + (n.after > 0 ? 1 : 0), 0);

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('prayer.title')}</h1>

                {/* Tab Switcher */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === 'times' ? styles.tabActive : ''}`}
                        onClick={() => setTab('times')}
                    >
                        🕌 {t('prayer.title')}
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'qibla' ? styles.tabActive : ''}`}
                        onClick={() => setTab('qibla')}
                    >
                        🧭 {t('prayer.qiblaCompass')}
                    </button>
                </div>

                {tab === 'times' && (
                    <div className={styles.timesSection}>
                        {/* Next Prayer Card */}
                        {nextPrayer && (
                            <div className={styles.nextPrayerCard}>
                                <div className={styles.nextLabel}>{t('prayer.nextPrayer')}</div>
                                <div className={styles.nextName}>{t(`prayer.${nextPrayer.name}`)}</div>
                                <div className={styles.nextTime}>{formatTime(nextPrayer.time)}</div>
                                <div className={styles.countdown}>
                                    <span className={styles.countdownLabel}>{t('prayer.timeRemaining')}</span>
                                    <span className={styles.countdownValue}>{countdown}</span>
                                </div>
                            </div>
                        )}

                        {/* Prayer List */}
                        <div className={styles.prayerList}>
                            {prayerList.map((prayer, i) => (
                                <div
                                    key={prayer.key}
                                    className={`${styles.prayerItem} ${nextPrayer?.name === prayer.key ? styles.prayerItemActive : ''}`}
                                    style={{ animationDelay: `${i * 0.08}s` }}
                                >
                                    <div className={styles.prayerLeft}>
                                        <span className={styles.prayerEmoji}>{prayer.emoji}</span>
                                        <span className={styles.prayerName}>{prayer.label}</span>
                                    </div>
                                    <span className={styles.prayerTime}>{formatTime(prayer.time)}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Nawafil (Sunnah Prayers) Tracker ── */}
                        <div style={{
                            marginTop: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            padding: '16px',
                            backdropFilter: 'blur(12px)',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '14px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'rgba(251,191,36,0.12)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '16px' }}>🌟</span>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '14px', fontWeight: 800,
                                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        }}>
                                            {t('prayer.nawafil') || 'السنن الرواتب'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '12px', fontWeight: 700, color: '#fbbf24',
                                    background: 'rgba(251,191,36,0.1)', padding: '4px 10px',
                                    borderRadius: '20px',
                                }}>
                                    {nawafilCompleted}/{nawafilTotal}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {NAWAFIL_DATA.map((item) => {
                                    const prayerLabel = t(`prayer.${item.prayer}`);
                                    const beforeKey = `${item.prayer}_before`;
                                    const afterKey = `${item.prayer}_after`;
                                    const beforeDone = nawafilChecks[beforeKey];
                                    const afterDone = nawafilChecks[afterKey];

                                    return (
                                        <div key={item.prayer} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                        }}>
                                            <span style={{
                                                fontSize: '13px', fontWeight: 700,
                                                color: 'rgba(255,255,255,0.8)', minWidth: '60px',
                                            }}>
                                                {prayerLabel}
                                            </span>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {item.before > 0 && (
                                                    <button
                                                        onClick={() => toggleNawafil(beforeKey)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            padding: '5px 10px', borderRadius: '20px',
                                                            border: beforeDone
                                                                ? '1px solid rgba(16,185,129,0.4)'
                                                                : '1px solid rgba(255,255,255,0.1)',
                                                            background: beforeDone
                                                                ? 'rgba(16,185,129,0.12)'
                                                                : 'rgba(255,255,255,0.03)',
                                                            cursor: 'pointer',
                                                            fontFamily: 'inherit',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: '14px', height: '14px', borderRadius: '4px',
                                                            border: beforeDone
                                                                ? '2px solid #10b981'
                                                                : '2px solid rgba(255,255,255,0.2)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: beforeDone ? '#10b981' : 'transparent',
                                                            transition: 'all 0.2s',
                                                        }}>
                                                            {beforeDone && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}>✓</span>}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: 700,
                                                            color: beforeDone ? '#34d399' : 'rgba(255,255,255,0.4)',
                                                        }}>
                                                            ↑ {item.before} {t('prayer.before') || locale === 'ar' ? 'قبل' : 'Before'}
                                                        </span>
                                                    </button>
                                                )}

                                                {item.after > 0 && (
                                                    <button
                                                        onClick={() => toggleNawafil(afterKey)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            padding: '5px 10px', borderRadius: '20px',
                                                            border: afterDone
                                                                ? '1px solid rgba(251,191,36,0.4)'
                                                                : '1px solid rgba(255,255,255,0.1)',
                                                            background: afterDone
                                                                ? 'rgba(251,191,36,0.12)'
                                                                : 'rgba(255,255,255,0.03)',
                                                            cursor: 'pointer',
                                                            fontFamily: 'inherit',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: '14px', height: '14px', borderRadius: '4px',
                                                            border: afterDone
                                                                ? '2px solid #fbbf24'
                                                                : '2px solid rgba(255,255,255,0.2)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: afterDone ? '#fbbf24' : 'transparent',
                                                            transition: 'all 0.2s',
                                                        }}>
                                                            {afterDone && <span style={{ color: '#000', fontSize: '10px', fontWeight: 900 }}>✓</span>}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: 700,
                                                            color: afterDone ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                                                        }}>
                                                            ↓ {item.after} {t('prayer.after') || locale === 'ar' ? 'بعد' : 'After'}
                                                        </span>
                                                    </button>
                                                )}

                                                {item.before === 0 && item.after === 0 && (
                                                    <span style={{
                                                        fontSize: '11px', color: 'rgba(255,255,255,0.25)',
                                                        fontStyle: 'italic',
                                                    }}>
                                                        {t('prayer.optional') || 'Optional'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'qibla' && (
                    <div className={styles.qiblaSection}>
                        <div className={styles.compassContainer}>
                            <div
                                className={styles.compass}
                                style={{ transform: `rotate(${-compassHeading}deg)` }}
                            >
                                <svg viewBox="0 0 200 200" className={styles.compassSvg}>
                                    <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-color)" strokeWidth="2" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                                    <text x="100" y="20" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="700">N</text>
                                    <text x="185" y="105" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">E</text>
                                    <text x="100" y="192" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">S</text>
                                    <text x="15" y="105" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">W</text>
                                </svg>
                                <div
                                    className={styles.qiblaNeedle}
                                    style={{ transform: `rotate(${qiblaAngle}deg)` }}
                                >
                                    <div className={styles.needleTip}>🕋</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.qiblaInfo}>
                            <p>{t('prayer.qibla')}: {Math.round(qiblaAngle)}°</p>
                            <p className="text-sm text-center mt-2 text-neutral-500">
                                {t('prayer.compassInstruction') || 'Calibrate compass by moving phone in figure 8'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
