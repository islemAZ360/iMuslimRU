'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { IconCalendarEvent } from '@tabler/icons-react';
import { motion } from 'motion/react';

interface IslamicEvent {
    nameEn: string;
    nameAr: string;
    nameRu: string;
    date: string;
    hijriEn: string;
    hijriAr: string;
    hijriRu: string;
    type: 'festival' | 'major' | 'regular';
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
    {
        nameEn: 'ramadanStart', nameAr: 'ramadanStart', nameRu: 'ramadanStart',
        date: '2026-02-18',
        hijriEn: 'Ramadan 1447 1', hijriAr: '١ رمضان ١٤٤٧', hijriRu: 'Рамадан 1447 1',
        type: 'major',
    },
    {
        nameEn: 'laylatAlQadr', nameAr: 'laylatAlQadr', nameRu: 'laylatAlQadr',
        date: '2026-03-15',
        hijriEn: 'Ramadan 1447 27', hijriAr: '٢٧ رمضان ١٤٤٧', hijriRu: 'Рамадан 1447 27',
        type: 'major',
    },
    {
        nameEn: 'eidAlFitr', nameAr: 'eidAlFitr', nameRu: 'eidAlFitr',
        date: '2026-03-19',
        hijriEn: 'Shawwal 1447 1', hijriAr: '١ شوال ١٤٤٧', hijriRu: 'Шавваль 1447 1',
        type: 'festival',
    },
    {
        nameEn: 'arafah', nameAr: 'arafah', nameRu: 'arafah',
        date: '2026-05-26',
        hijriEn: 'Dhu al-Hijjah 1447 9', hijriAr: '٩ ذو الحجة ١٤٤٧', hijriRu: 'Зуль-хиджа 1447 9',
        type: 'major',
    },
    {
        nameEn: 'eidAlAdha', nameAr: 'eidAlAdha', nameRu: 'eidAlAdha',
        date: '2026-05-27',
        hijriEn: 'Dhu al-Hijjah 1447 10', hijriAr: '١٠ ذو الحجة ١٤٤٧', hijriRu: 'Зуль-хиджа 1447 10',
        type: 'festival',
    },
    {
        nameEn: 'islamicNewYear', nameAr: 'islamicNewYear', nameRu: 'islamicNewYear',
        date: '2026-06-16',
        hijriEn: 'Muharram 1448 1', hijriAr: '١ محرم ١٤٤٨', hijriRu: 'Мухаррам 1448 1',
        type: 'regular',
    },
    {
        nameEn: 'ashura', nameAr: 'ashura', nameRu: 'ashura',
        date: '2026-06-25',
        hijriEn: 'Muharram 1448 10', hijriAr: '١٠ محرم ١٤٤٨', hijriRu: 'Мухаррам 1448 10',
        type: 'regular',
    },
];

const typeConfig = {
    festival: {
        gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.04))',
        border: 'rgba(251,191,36,0.2)',
        badge: '🎉',
        badgeBg: 'rgba(251,191,36,0.12)',
        badgeColor: '#fbbf24',
        dateBorder: 'rgba(251,191,36,0.3)',
        dateColor: '#fbbf24',
    },
    major: {
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
        border: 'rgba(16,185,129,0.2)',
        badge: '⭐',
        badgeBg: 'rgba(16,185,129,0.12)',
        badgeColor: '#34d399',
        dateBorder: 'rgba(16,185,129,0.3)',
        dateColor: '#34d399',
    },
    regular: {
        gradient: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        border: 'rgba(255,255,255,0.06)',
        badge: '📅',
        badgeBg: 'rgba(255,255,255,0.06)',
        badgeColor: 'rgba(255,255,255,0.5)',
        dateBorder: 'rgba(255,255,255,0.12)',
        dateColor: 'rgba(255,255,255,0.5)',
    },
};

const typeLabels = {
    festival: { en: 'Festival', ar: 'عيد', ru: 'Праздник' },
    major: { en: 'Major', ar: 'مهم', ru: 'Важный' },
    regular: { en: 'Event', ar: 'مناسبة', ru: 'Событие' },
};

export function IslamicCalendar() {
    const { t, locale } = useI18n();

    const getName = (event: IslamicEvent) => {
        return t(`calendar.${event.nameEn}`);
    };

    const getHijri = (event: IslamicEvent) => {
        if (locale === 'ar') return event.hijriAr;
        if (locale === 'ru') return event.hijriRu;
        return event.hijriEn;
    };

    const getTypeLabel = (type: 'festival' | 'major' | 'regular') => {
        const lang = locale === 'ar' ? 'ar' : locale === 'ru' ? 'ru' : 'en';
        return typeLabels[type][lang];
    };

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
                    background: 'rgba(99,102,241,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <IconCalendarEvent size={20} style={{ color: '#818cf8' }} />
                </div>
                <h2 style={{
                    fontSize: '20px', fontWeight: 800, margin: 0,
                    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {t('calendar.title')}
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ISLAMIC_EVENTS.map((event, idx) => {
                    const cfg = typeConfig[event.type];
                    const d = new Date(event.date);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: cfg.gradient,
                                border: `1px solid ${cfg.border}`,
                                transition: 'transform 0.15s',
                                cursor: 'default',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '10px',
                                    border: `1.5px solid ${cfg.dateBorder}`,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.2)', flexShrink: 0,
                                }}>
                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: cfg.dateColor, fontWeight: 700, lineHeight: 1 }}>
                                        {d.toLocaleString(locale === 'ar' ? 'ar' : locale === 'ru' ? 'ru' : 'en', { month: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '18px', fontWeight: 800, color: cfg.dateColor, lineHeight: 1.1 }}>
                                        {d.getDate()}
                                    </span>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                        {getName(event)}
                                    </h3>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>
                                        {getHijri(event)}
                                    </p>
                                </div>
                            </div>

                            <span style={{
                                fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                                borderRadius: '20px', background: cfg.badgeBg, color: cfg.badgeColor,
                                whiteSpace: 'nowrap',
                            }}>
                                {cfg.badge} {getTypeLabel(event.type)}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
