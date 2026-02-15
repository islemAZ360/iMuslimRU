'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { getPrayerTimes, getNextPrayer, getTimeRemaining, formatTime, getQiblaDirection, PrayerTimeResult } from '@/lib/prayer';
import styles from './Prayer.module.css';

export default function PrayerPage() {
    const { t } = useI18n();
    const [tab, setTab] = useState<'times' | 'qibla'>('times');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimeResult | null>(null);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
    const [countdown, setCountdown] = useState('');
    const [qiblaAngle, setQiblaAngle] = useState(0);
    const [compassHeading, setCompassHeading] = useState(0);
    const [locationError, setLocationError] = useState(false);
    // Added loading state to prevent flash of empty content
    const [loading, setLoading] = useState(true);

    const requestLocation = useCallback(() => {
        // Try to load cached location first
        const cached = localStorage.getItem('prayer_location');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.lat && parsed.lng) {
                    setLocation(parsed);
                    setLoading(false); // Can show cached while updating
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
                if (!location) { // Only show error if no cached location
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
        // Update immediately
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
                // Invert alpha for CSS rotation (which is clockwise) vs compass heading
                // But alpha is 0 at North and increases counter-clockwise on some devices?
                // Standard: alpha 0 = North, increases counter-clockwise.
                // CSS rotate: increases clockwise.
                // So -alpha is correct.
                setCompassHeading(e.alpha);
            }
        };

        // Try requesting permission on iOS
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
                    </div>
                )}

                {tab === 'qibla' && (
                    <div className={styles.qiblaSection}>
                        <div className={styles.compassContainer}>
                            <div
                                className={styles.compass}
                                style={{ transform: `rotate(${-compassHeading}deg)` }}
                            >
                                {/* Compass ring */}
                                <svg viewBox="0 0 200 200" className={styles.compassSvg}>
                                    <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-color)" strokeWidth="2" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                                    {/* Cardinal markers */}
                                    <text x="100" y="20" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="700">N</text>
                                    <text x="185" y="105" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">E</text>
                                    <text x="100" y="192" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">S</text>
                                    <text x="15" y="105" textAnchor="middle" fill="var(--text-tertiary)" fontSize="12">W</text>
                                </svg>
                                {/* Qibla needle */}
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
