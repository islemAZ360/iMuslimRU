'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { motion } from 'motion/react';
import {
    IconChartDonut3,
    IconFlame,
    IconTrendingUp,
    IconPray,
    IconHandClick,
    IconStarFilled,
    IconStar,
    IconMoodSmile,
    IconTargetArrow,
} from '@tabler/icons-react';

/* ─── Data loading helpers (shared with AdhkarTracker) ─── */

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function loadHistory(): Record<string, { total: number; categories: Record<string, number> }> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('adhkar_history');
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function loadNawafilHistory(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('nawafil_history');
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

/* ─── Faith Level Calculation ─── */

function calculateFaithLevel(history: Record<string, { total: number; categories: Record<string, number> }>, nawafilHistory: Record<string, number>) {
    const last30Days: string[] = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last30Days.push(d.toISOString().slice(0, 10));
    }

    let adhkarDays = 0;
    let totalAdhkar = 0;
    let nawafilDays = 0;
    let totalNawafil = 0;

    last30Days.forEach(day => {
        if (history[day] && history[day].total > 0) {
            adhkarDays++;
            totalAdhkar += history[day].total;
        }
        if (nawafilHistory[day] && nawafilHistory[day] > 0) {
            nawafilDays++;
            totalNawafil += nawafilHistory[day];
        }
    });

    const adhkarScore = Math.min((adhkarDays / 30) * 50, 50); // 50% from adhkar consistency
    const nawafilScore = Math.min((nawafilDays / 30) * 30, 30); // 30% from nawafil
    const volumeScore = Math.min((totalAdhkar / 3000) * 20, 20); // 20% from total volume

    const totalScore = adhkarScore + nawafilScore + volumeScore;

    let level: 'strong' | 'moderate' | 'weak';
    let levelAr: string;
    let levelEn: string;
    let levelRu: string;
    let color: string;
    let emoji: string;

    if (totalScore >= 70) {
        level = 'strong';
        levelAr = 'مؤمن قوي بإذن الله';
        levelEn = 'Strong Believer, inshaAllah';
        levelRu = 'Сильный верующий, иншаАллах';
        color = '#34d399';
        emoji = '🌟';
    } else if (totalScore >= 35) {
        level = 'moderate';
        levelAr = 'مؤمن عادي';
        levelEn = 'Moderate Believer';
        levelRu = 'Обычный верующий';
        color = '#fbbf24';
        emoji = '⭐';
    } else {
        level = 'weak';
        levelAr = 'يحتاج مزيداً من العبادة';
        levelEn = 'Needs More Worship';
        levelRu = 'Нуждается в усердии';
        color = '#f87171';
        emoji = '💪';
    }

    return {
        totalScore: Math.round(totalScore),
        level, levelAr, levelEn, levelRu, color, emoji,
        adhkarDays, nawafilDays, totalAdhkar, totalNawafil,
        last7: last30Days.slice(0, 7).reverse(),
        history,
    };
}

/* ─── Component ─── */

export default function StatsPage() {
    const { t, locale } = useI18n();
    const [data, setData] = useState<ReturnType<typeof calculateFaithLevel> | null>(null);

    useEffect(() => {
        setData(calculateFaithLevel(loadHistory(), loadNawafilHistory()));
    }, []);

    if (!data) return null;

    const getLevelLabel = () => {
        if (locale === 'ar') return data.levelAr;
        if (locale === 'ru') return data.levelRu;
        return data.levelEn;
    };

    const stats = [
        {
            icon: <IconHandClick size={18} />,
            label: t('stats.adhkarDays') || 'Adhkar Days',
            value: `${data.adhkarDays}/30`,
            color: '#34d399',
            desc: t('stats.adhkarDaysDesc') || 'Days with adhkar activity',
        },
        {
            icon: <IconPray size={18} />,
            label: t('stats.nawafilDays') || 'Nawafil Days',
            value: `${data.nawafilDays}/30`,
            color: '#818cf8',
            desc: t('stats.nawafilDaysDesc') || 'Days with voluntary prayers',
        },
        {
            icon: <IconTrendingUp size={18} />,
            label: t('stats.totalAdhkar') || 'Total Adhkar',
            value: data.totalAdhkar.toLocaleString(),
            color: '#fbbf24',
            desc: t('stats.totalAdhkarDesc') || 'Total remembrances in 30 days',
        },
        {
            icon: <IconFlame size={18} />,
            label: t('stats.streak') || 'Current Streak',
            value: `${data.adhkarDays}`,
            color: '#f97316',
            desc: t('stats.streakDesc') || 'Consecutive days of worship',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px', paddingTop: '20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '28px' }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        marginBottom: '12px',
                        boxShadow: '0 0 24px rgba(99,102,241,0.1)',
                    }}>
                        <IconChartDonut3 size={28} style={{ color: '#818cf8' }} />
                    </div>
                    <h1 style={{
                        fontSize: '28px', fontWeight: 900, margin: '0 0 6px 0',
                        background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        {t('stats.title') || 'Faith Statistics'}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {t('stats.subtitle') || 'Tracking your spiritual journey'}
                    </p>
                </motion.div>

                {/* Faith Level Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${data.color}30`,
                        borderRadius: '20px',
                        padding: '28px 24px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {/* Glow background */}
                    <div style={{
                        position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: `radial-gradient(circle, ${data.color}12, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    {/* Score ring */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <motion.circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke={data.color} strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(data.totalScore / 100) * 326.7} 326.7`}
                                transform="rotate(-90 60 60)"
                                initial={{ strokeDasharray: '0 326.7' }}
                                animate={{ strokeDasharray: `${(data.totalScore / 100) * 326.7} 326.7` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: '36px', fontWeight: 900, color: data.color }}>
                                {data.totalScore}
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                / 100
                            </span>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <span style={{ fontSize: '22px', marginRight: '6px' }}>{data.emoji}</span>
                        <span style={{
                            fontSize: '20px', fontWeight: 800, color: data.color,
                        }}>
                            {getLevelLabel()}
                        </span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <motion.div
                                key={star}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + star * 0.1 }}
                            >
                                {(data.totalScore / 20) >= star
                                    ? <IconStarFilled size={18} style={{ color: '#fbbf24' }} />
                                    : <IconStar size={18} style={{ color: 'rgba(255,255,255,0.1)' }} />
                                }
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.08 }}
                            style={{
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: `${stat.color}18`, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: stat.color, marginBottom: '10px',
                            }}>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                {stat.desc}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        padding: '24px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(12px)',
                        marginBottom: '16px',
                    }}
                >
                    <h3 style={{
                        fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.7)',
                        marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                        {t('stats.weeklyActivity') || 'Weekly Activity'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '6px' }}>
                        {data.last7.map((day, idx) => {
                            const entry = data.history[day];
                            const count = entry?.total || 0;
                            const maxPossible = 400;
                            const pct = Math.max((count / maxPossible) * 100, 4);
                            const isToday = day === getTodayKey();

                            return (
                                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.08 }}
                                        style={{
                                            width: '100%', maxWidth: '28px', borderRadius: '6px 6px 3px 3px',
                                            background: isToday
                                                ? 'linear-gradient(180deg, #818cf8, #6366f1)'
                                                : count > 0
                                                    ? 'linear-gradient(180deg, rgba(129,140,248,0.3), rgba(99,102,241,0.08))'
                                                    : 'rgba(255,255,255,0.04)',
                                            border: isToday ? '1px solid rgba(129,140,248,0.4)' : '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    />
                                    <span style={{
                                        marginTop: '6px', fontSize: '9px', fontWeight: 700,
                                        color: isToday ? '#818cf8' : 'rgba(255,255,255,0.3)',
                                    }}>
                                        {new Date(day).toLocaleString('default', { weekday: 'short' }).slice(0, 2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: `${data.color}08`,
                        border: `1px solid ${data.color}15`,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <IconTargetArrow size={18} style={{ color: data.color }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: data.color }}>
                            {t('stats.tips') || 'Tips to Improve'}
                        </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 2 }}>
                        {data.adhkarDays < 20 && (
                            <li>{t('stats.tipAdhkar') || 'Try to complete morning and evening adhkar daily'}</li>
                        )}
                        {data.nawafilDays < 15 && (
                            <li>{t('stats.tipNawafil') || 'Pray the Sunnah prayers (Rawatib) regularly'}</li>
                        )}
                        {data.totalAdhkar < 1000 && (
                            <li>{t('stats.tipVolume') || 'Increase your daily dhikr count — aim for 100+ per day'}</li>
                        )}
                        {data.totalScore >= 70 && (
                            <li style={{ color: data.color }}>{t('stats.tipExcellent') || 'MashaAllah! Keep up the excellent consistency!'}</li>
                        )}
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
