'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { IconChartBar, IconFlame, IconTrendingUp } from '@tabler/icons-react';
import { motion } from 'motion/react';

export function AdhkarStats() {
    const { t } = useI18n();
    const history = [
        { day: 'Mon', count: 145 },
        { day: 'Tue', count: 210 },
        { day: 'Wed', count: 180 },
        { day: 'Thu', count: 320 },
        { day: 'Fri', count: 450 },
        { day: 'Sat', count: 190 },
        { day: 'Sun', count: 240 },
    ];

    const maxCount = Math.max(...history.map(h => h.count));
    const total = history.reduce((s, h) => s + h.count, 0);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(12px)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(20,184,166,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <IconChartBar size={20} style={{ color: '#2dd4bf' }} />
                </div>
                <h2 style={{
                    fontSize: '20px', fontWeight: 800, margin: 0,
                    background: 'linear-gradient(135deg, #2dd4bf, #34d399)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {t('believer.adhkarStats') || 'Adhkar Statistics'}
                </h2>
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                    padding: '14px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <IconTrendingUp size={14} style={{ color: '#34d399' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                            {t('stats.total') || 'Total'}
                        </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                        {total.toLocaleString()}
                    </div>
                </div>
                <div style={{
                    padding: '14px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <IconFlame size={14} style={{ color: '#f97316' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                            {t('stats.streak') || 'Streak'}
                        </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>
                        <span style={{ color: '#f97316' }}>12</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: '4px' }}>days</span>
                    </div>
                </div>
            </div>

            {/* Weekly chart */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>
                    {t('stats.weeklyActivity') || 'Weekly Activity'}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '6px' }}>
                    {history.map((item, idx) => {
                        const pct = (item.count / maxCount) * 100;
                        const isBest = item.count === maxCount;
                        return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.08, type: "spring" }}
                                    style={{
                                        width: '100%',
                                        maxWidth: '28px',
                                        borderRadius: '6px 6px 3px 3px',
                                        background: isBest
                                            ? 'linear-gradient(180deg, #34d399, #059669)'
                                            : 'linear-gradient(180deg, rgba(52,211,153,0.3), rgba(52,211,153,0.08))',
                                        border: isBest ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(52,211,153,0.08)',
                                        boxShadow: isBest ? '0 0 12px rgba(16,185,129,0.2)' : 'none',
                                        position: 'relative',
                                    }}
                                >
                                    {isBest && (
                                        <div style={{
                                            position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                                            fontSize: '10px', fontWeight: 700, color: '#34d399', whiteSpace: 'nowrap',
                                        }}>
                                            {item.count}
                                        </div>
                                    )}
                                </motion.div>
                                <span style={{ marginTop: '6px', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
                                    {item.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
