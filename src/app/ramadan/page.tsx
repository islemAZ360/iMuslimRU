'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useI18n } from '@/contexts/I18nContext';
import { getPrayerTimes, formatTime, getNextPrayer, getTimeRemaining } from '@/lib/prayer';
import { IconMoonStars, IconSun, IconSunset2, IconClock } from '@tabler/icons-react';
import styles from './Ramadan.module.css';

export default function RamadanPage() {
    const { isFastingMode, setIsFastingMode } = useSettings();
    const { t } = useI18n();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Check for day change and re-fetch prayers if needed
    useEffect(() => {
        if (userLocation && prayerTimes) {
            const today = new Date();
            const prayerDate = prayerTimes.fajr; // Using fajr as reference for the date

            if (today.getDate() !== prayerDate.getDate() || today.getMonth() !== prayerDate.getMonth()) {
                console.log("Day changed, updating prayer times...");
                setPrayerTimes(getPrayerTimes(userLocation.lat, userLocation.lng, today));
            }
        }
    }, [currentTime, userLocation, prayerTimes]);

    // Initial Location Fetch
    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(loc);
                    setPrayerTimes(getPrayerTimes(loc.lat, loc.lng));
                    setLocationStatus('success');
                },
                (err) => {
                    console.error("Location error:", err);
                    // Default to Moscow if blocked
                    const loc = { lat: 55.7558, lng: 37.6173 };
                    setUserLocation(loc);
                    setPrayerTimes(getPrayerTimes(loc.lat, loc.lng));
                    setLocationStatus('error');
                }
            );
        } else {
            const loc = { lat: 55.7558, lng: 37.6173 };
            setUserLocation(loc);
            setPrayerTimes(getPrayerTimes(loc.lat, loc.lng));
            setLocationStatus('error');
        }
    }, []);

    // Generate 7-day fasting schedule (must be before early return — Rules of Hooks)
    const weeklySchedule = useMemo(() => {
        if (!userLocation) return [];
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const times = getPrayerTimes(userLocation.lat, userLocation.lng, date);
            const fajr = times.fajr;
            const maghrib = times.maghrib;
            const durationMs = maghrib.getTime() - fajr.getTime();
            const durationH = Math.floor(durationMs / (1000 * 60 * 60));
            const durationM = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            days.push({
                date,
                suhoor: fajr,
                iftar: maghrib,
                duration: `${durationH}${t('ramadan.hours') || 'h'} ${durationM}${t('ramadan.minutes') || 'm'}`,
                isToday: i === 0,
            });
        }
        return days;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation, prayerTimes]);

    if (!prayerTimes) return (
        <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className={styles.loading}>{t('common.loading')}</div>
        </div>
    );

    const suhoorTime = prayerTimes.fajr;
    const iftarTime = prayerTimes.maghrib;

    // Determine next event
    const now = currentTime.getTime();
    let nextEvent = null;
    let targetTime = null;

    if (now < suhoorTime.getTime()) {
        nextEvent = 'suhoor';
        targetTime = suhoorTime;
    } else if (now < iftarTime.getTime()) {
        nextEvent = 'iftar';
        targetTime = iftarTime;
    } else {
        // After Maghrib, next is Suhoor tomorrow
        nextEvent = 'suhoor';
        targetTime = new Date(suhoorTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const remaining = targetTime ? getTimeRemaining(targetTime) : '--:--:--';

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <IconMoonStars size={42} color="#fbbf24" />
                </div>
                <h1 className={styles.title}>{t('ramadan.title')}</h1>
                <p className={styles.subtitle}>{t('ramadan.subtitle')}</p>

                {/* Location Status Indicator */}
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {locationStatus === 'success' ? (
                        <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            Location Detected ✓
                        </span>
                    ) : (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            ⚠ Using Default Location (Moscow)
                        </span>
                    )}
                </div>
            </div>

            {/* Toggle */}
            <div className={styles.toggleCard}>
                <div>
                    <div className={styles.toggleLabel}>{t('ramadan.enableFasting')}</div>
                    <div className={styles.toggleDesc}>{t('ramadan.toggleDesc')}</div>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={isFastingMode}
                        onChange={(e) => setIsFastingMode(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            {isFastingMode && (
                <div className={styles.dashboard}>
                    {/* Active Timer Cards */}
                    <div className={styles.timerGrid}>
                        {/* Suhoor Card */}
                        <div className={`${styles.timeCard} ${nextEvent === 'suhoor' ? styles.active : ''}`}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.cardLabel}>{t('ramadan.suhoor')}</div>
                                    <div className={styles.cardTime}>{formatTime(suhoorTime)}</div>
                                </div>
                                <div className={styles.cardIcon}>
                                    <IconSun size={24} />
                                </div>
                            </div>

                            {nextEvent === 'suhoor' && (
                                <div className={styles.countdownWrapper}>
                                    <span className={styles.countdownLabel}>{t('ramadan.timeRemaining')}</span>
                                    <span className={styles.countdownValue}>{remaining}</span>
                                </div>
                            )}
                        </div>

                        {/* Iftar Card */}
                        <div className={`${styles.timeCard} ${nextEvent === 'iftar' ? styles.active : ''}`}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.cardLabel}>{t('ramadan.iftar')}</div>
                                    <div className={styles.cardTime}>{formatTime(iftarTime)}</div>
                                </div>
                                <div className={styles.cardIcon}>
                                    <IconSunset2 size={24} />
                                </div>
                            </div>

                            {nextEvent === 'iftar' && (
                                <div className={styles.countdownWrapper}>
                                    <span className={styles.countdownLabel}>{t('ramadan.timeRemaining')}</span>
                                    <span className={styles.countdownValue}>{remaining}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 7-Day Fasting Schedule */}
                    <div className={styles.scheduleCard}>
                        <h3 className={styles.scheduleTitle}>
                            <IconClock size={20} color="#fbbf24" />
                            {t('ramadan.weeklySchedule')}
                        </h3>

                        {/* Table Header */}
                        <div className={styles.scheduleHeader}>
                            <span>{t('ramadan.date')}</span>
                            <span>{t('ramadan.suhoor')}</span>
                            <span>{t('ramadan.iftar')}</span>
                            <span>{t('ramadan.duration')}</span>
                        </div>

                        <div className={styles.scheduleList}>
                            {weeklySchedule.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.scheduleRow} ${day.isToday ? styles.todayRow : ''}`}
                                >
                                    <span className={styles.scheduleDate}>
                                        {day.isToday
                                            ? (t('ramadan.today') || 'Today')
                                            : day.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={styles.scheduleTime}>{formatTime(day.suhoor)}</span>
                                    <span className={styles.scheduleTime}>{formatTime(day.iftar)}</span>
                                    <span className={styles.scheduleDuration}>{day.duration}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div style={{ fontSize: '24px' }}>💡</div>
                        <p className={styles.infoText}>
                            {t('ramadan.hadith')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
