'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    IconSunrise,
    IconSunset,
    IconMoon,
    IconPray,
    IconHandClick,
    IconCheck,
    IconRefresh,
    IconChevronDown,
    IconChevronUp,
} from '@tabler/icons-react';

/* ─── Adhkar Data (Islamic Sharia) ─── */

interface Dhikr {
    id: string;
    arabic: string;
    translation: string;
    target: number; // recommended repetitions
}

interface AdhkarCategory {
    id: string;
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    color: string;
    adhkar: Dhikr[];
}

/* ─── Storage helpers ─── */

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function loadCounts(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('adhkar_counts');
        if (!raw) return {};
        const data = JSON.parse(raw);
        if (data._date !== getTodayKey()) return {}; // reset daily
        return data;
    } catch { return {}; }
}

function saveCounts(counts: Record<string, number>) {
    localStorage.setItem('adhkar_counts', JSON.stringify({ ...counts, _date: getTodayKey() }));
}

function loadHistory(): Record<string, { total: number; categories: Record<string, number> }> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem('adhkar_history');
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveToHistory(counts: Record<string, number>, categoriesData: AdhkarCategory[]) {
    const today = getTodayKey();
    const history = loadHistory();
    let total = 0;
    const categories: Record<string, number> = {};

    categoriesData.forEach(cat => {
        let catTotal = 0;
        cat.adhkar.forEach(d => {
            const c = counts[d.id] || 0;
            catTotal += c;
            total += c;
        });
        categories[cat.id] = catTotal;
    });

    history[today] = { total, categories };
    localStorage.setItem('adhkar_history', JSON.stringify(history));
}

/* ─── Component ─── */

export function AdhkarTracker() {
    const { t } = useI18n();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [openCategory, setOpenCategory] = useState<string | null>('morning');

    const categories = React.useMemo<AdhkarCategory[]>(() => [
        {
            id: 'morning',
            name: t('adhkar.morning'),
            nameAr: t('adhkar.morning'),
            icon: <IconSunrise size={20} />,
            color: '#f59e0b',
            adhkar: [
                { id: 'm1', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', translation: t('adhkar.m1') || 'We have entered morning and all sovereignty belongs to Allah', target: 1 },
                { id: 'm2', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: t('adhkar.m2') || 'Glory be to Allah and all praise is due to Him', target: 100 },
                { id: 'm3', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: t('adhkar.m3') || 'There is no god but Allah alone, with no partner', target: 10 },
                { id: 'm4', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', translation: t('adhkar.m4') || 'O Allah, I ask You for well-being in this world and the next', target: 3 },
                { id: 'm5', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', translation: t('adhkar.m5') || 'In the Name of Allah with whose Name nothing can harm', target: 3 },
                { id: 'm6', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: t('adhkar.m6') || 'I seek refuge in the perfect words of Allah from the evil of what He has created', target: 3 },
            ],
        },
        {
            id: 'evening',
            name: t('adhkar.evening'),
            nameAr: t('adhkar.evening'),
            icon: <IconSunset size={20} />,
            color: '#8b5cf6',
            adhkar: [
                { id: 'e1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', translation: t('adhkar.e1') || 'We have entered evening and all sovereignty belongs to Allah', target: 1 },
                { id: 'e2', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: t('adhkar.e2') || 'Glory be to Allah and all praise is due to Him', target: 100 },
                { id: 'e3', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: t('adhkar.e3') || 'There is no god but Allah alone, with no partner', target: 10 },
                { id: 'e4', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', translation: t('adhkar.e4') || 'O Allah, I seek refuge in You from worry and grief', target: 3 },
            ],
        },
        {
            id: 'afterPrayer',
            name: t('adhkar.prayer'),
            nameAr: t('adhkar.prayer'),
            icon: <IconPray size={20} />,
            color: '#10b981',
            adhkar: [
                { id: 'p1', arabic: 'أَسْتَغْفِرُ اللَّهَ', translation: t('adhkar.astaghfirullah'), target: 3 },
                { id: 'p2', arabic: 'سُبْحَانَ اللَّهِ', translation: t('adhkar.subhanAllah'), target: 33 },
                { id: 'p3', arabic: 'الْحَمْدُ لِلَّهِ', translation: t('adhkar.alhamdulillah'), target: 33 },
                { id: 'p4', arabic: 'اللَّهُ أَكْبَرُ', translation: t('adhkar.allahuAkbar'), target: 34 },
                { id: 'p5', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: t('adhkar.laIlahaIllallah'), target: 1 },
            ],
        },
        {
            id: 'sleep',
            name: t('adhkar.sleep'),
            nameAr: t('adhkar.sleep'),
            icon: <IconMoon size={20} />,
            color: '#3b82f6',
            adhkar: [
                { id: 's1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translation: t('adhkar.s1') || 'In Your Name, O Allah, I die and I live', target: 1 },
                { id: 's2', arabic: 'سُبْحَانَ اللَّهِ', translation: t('adhkar.subhanAllah'), target: 33 },
                { id: 's3', arabic: 'الْحَمْدُ لِلَّهِ', translation: t('adhkar.alhamdulillah'), target: 33 },
                { id: 's4', arabic: 'اللَّهُ أَكْبَرُ', translation: t('adhkar.allahuAkbar'), target: 34 },
            ],
        },
    ], [t]);

    useEffect(() => {
        setCounts(loadCounts());
    }, []);

    const increment = useCallback((dhikrId: string, target: number) => {
        setCounts(prev => {
            const current = prev[dhikrId] || 0;
            if (current >= target) return prev;
            const next = { ...prev, [dhikrId]: current + 1 };
            saveCounts(next);
            saveToHistory(next, categories);
            return next;
        });
    }, [categories]);

    const resetCategory = useCallback((catId: string) => {
        setCounts(prev => {
            const cat = categories.find(c => c.id === catId);
            if (!cat) return prev;
            const next = { ...prev };
            cat.adhkar.forEach(d => { next[d.id] = 0; });
            saveCounts(next);
            saveToHistory(next, categories);
            return next;
        });
    }, [categories]);

    const getCategoryProgress = (cat: AdhkarCategory) => {
        let done = 0, total = 0;
        cat.adhkar.forEach(d => {
            total += d.target;
            done += Math.min(counts[d.id] || 0, d.target);
        });
        return { done, total, pct: total > 0 ? (done / total) * 100 : 0 };
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(12px)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(251,191,36,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <IconHandClick size={20} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                    <h2 style={{
                        fontSize: '20px', fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        {t('adhkar.title')}
                    </h2>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                        سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map((cat) => {
                    const prog = getCategoryProgress(cat);
                    const isOpen = openCategory === cat.id;
                    const isComplete = prog.pct >= 100;

                    return (
                        <div key={cat.id} style={{
                            borderRadius: '14px',
                            border: `1px solid ${isComplete ? `${cat.color}33` : 'rgba(255,255,255,0.06)'}`,
                            background: isComplete
                                ? `linear-gradient(135deg, ${cat.color}10, ${cat.color}05)`
                                : 'rgba(255,255,255,0.02)',
                            overflow: 'hidden',
                            transition: 'all 0.3s',
                        }}>
                            {/* Category header */}
                            <button
                                onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', padding: '14px 16px',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: `${cat.color}18`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: cat.color,
                                    }}>
                                        {cat.icon}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                                            {cat.nameAr}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                            {cat.name}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Progress ring */}
                                    <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                                        <svg width="28" height="28" viewBox="0 0 28 28">
                                            <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                                            <circle
                                                cx="14" cy="14" r="11" fill="none"
                                                stroke={cat.color} strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(prog.pct / 100) * 69.1} 69.1`}
                                                transform="rotate(-90 14 14)"
                                                style={{ transition: 'stroke-dasharray 0.4s' }}
                                            />
                                        </svg>
                                        {isComplete && (
                                            <div style={{
                                                position: 'absolute', inset: 0, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <IconCheck size={12} style={{ color: cat.color }} />
                                            </div>
                                        )}
                                    </div>
                                    {isOpen ? <IconChevronUp size={16} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <IconChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                                </div>
                            </button>

                            {/* Adhkar list */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {cat.adhkar.map((dhikr) => {
                                                const count = counts[dhikr.id] || 0;
                                                const done = count >= dhikr.target;
                                                const pct = Math.min((count / dhikr.target) * 100, 100);

                                                return (
                                                    <div
                                                        key={dhikr.id}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '10px',
                                                            padding: '10px 12px', borderRadius: '10px',
                                                            background: done ? `${cat.color}0a` : 'rgba(255,255,255,0.02)',
                                                            border: `1px solid ${done ? `${cat.color}22` : 'rgba(255,255,255,0.04)'}`,
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {/* Dhikr text */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{
                                                                fontSize: '15px', fontWeight: 600, margin: 0,
                                                                color: done ? cat.color : 'rgba(255,255,255,0.85)',
                                                                direction: 'rtl', lineHeight: 1.6,
                                                            }}>
                                                                {dhikr.arabic}
                                                            </p>
                                                            <p style={{
                                                                fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                                                                margin: '2px 0 0', lineHeight: 1.3,
                                                            }}>
                                                                {dhikr.translation}
                                                            </p>
                                                            {/* Progress bar */}
                                                            <div style={{
                                                                height: '3px', borderRadius: '2px',
                                                                background: 'rgba(255,255,255,0.06)',
                                                                marginTop: '6px', overflow: 'hidden',
                                                            }}>
                                                                <div style={{
                                                                    height: '100%', borderRadius: '2px',
                                                                    background: cat.color,
                                                                    width: `${pct}%`,
                                                                    transition: 'width 0.3s',
                                                                }} />
                                                            </div>
                                                        </div>

                                                        {/* Counter button */}
                                                        <button
                                                            onClick={() => increment(dhikr.id, dhikr.target)}
                                                            disabled={done}
                                                            style={{
                                                                width: '52px', height: '52px', borderRadius: '14px',
                                                                border: 'none', cursor: done ? 'default' : 'pointer',
                                                                background: done
                                                                    ? `${cat.color}20`
                                                                    : `linear-gradient(135deg, ${cat.color}30, ${cat.color}15)`,
                                                                display: 'flex', flexDirection: 'column',
                                                                alignItems: 'center', justifyContent: 'center',
                                                                flexShrink: 0, transition: 'all 0.15s',
                                                                boxShadow: done ? 'none' : `0 2px 8px ${cat.color}20`,
                                                                color: done ? cat.color : '#fff',
                                                            }}
                                                        >
                                                            {done ? (
                                                                <IconCheck size={20} />
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1 }}>
                                                                        {count}
                                                                    </span>
                                                                    <span style={{ fontSize: '8px', opacity: 0.6, lineHeight: 1 }}>
                                                                        /{dhikr.target}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {/* Reset button */}
                                            <button
                                                onClick={() => resetCategory(cat.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    gap: '4px', padding: '6px', borderRadius: '8px',
                                                    background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                                                    color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                                                    cursor: 'pointer', marginTop: '2px',
                                                }}
                                            >
                                                <IconRefresh size={12} /> {t('adhkar.reset')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
