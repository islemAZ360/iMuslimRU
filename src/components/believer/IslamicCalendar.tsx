'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { IconCalendarEvent } from '@tabler/icons-react';
import { motion } from 'framer-motion';

// Static data for demo purposes. Ideally use a library like hijri-converter
const ISLAMIC_EVENTS = [
    { name: 'Ramadan Start', date: '2026-02-18', hijri: '1 Ramadan 1447', type: 'major' },
    { name: 'Laylat al-Qadr', date: '2026-03-15', hijri: '27 Ramadan 1447', type: 'major' },
    { name: 'Eid al-Fitr', date: '2026-03-19', hijri: '1 Shawwal 1447', type: 'festival' },
    { name: 'Arafah', date: '2026-05-26', hijri: '9 Dhu al-Hijjah 1447', type: 'major' },
    { name: 'Eid al-Adha', date: '2026-05-27', hijri: '10 Dhu al-Hijjah 1447', type: 'festival' },
    { name: 'Islamic New Year', date: '2026-06-16', hijri: '1 Muharram 1448', type: 'regular' },
    { name: 'Ashura', date: '2026-06-25', hijri: '10 Muharram 1448', type: 'regular' },
];

export function IslamicCalendar() {
    const { t } = useI18n();

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <IconCalendarEvent className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                    {t('believer.calendar') || 'Islamic Occasions'}
                </h2>
            </div>

            <div className="space-y-4">
                {ISLAMIC_EVENTS.map((event, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-sm ${event.type === 'festival'
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                            : event.type === 'major'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                flex flex-col items-center justify-center w-14 h-14 rounded-lg font-bold border-2 shadow-sm
                ${event.type === 'festival' ? 'border-amber-400 text-amber-600 bg-white dark:bg-neutral-800' :
                                    event.type === 'major' ? 'border-emerald-400 text-emerald-600 bg-white dark:bg-neutral-800' :
                                        'border-neutral-300 text-neutral-500 bg-white dark:bg-neutral-800'}
              `}>
                                <span className="text-xs uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl">{new Date(event.date).getDate()}</span>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg dark:text-neutral-100">{event.name}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{event.hijri}</p>
                            </div>
                        </div>

                        {/* Countdown or status could go here */}
                        <div className={`text-xs font-semibold px-3 py-1 rounded-full 
                        ${event.type === 'festival' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                event.type === 'major' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                                    'bg-white dark:bg-black/20 text-neutral-500'}
                        `}>
                            {event.type === 'festival' ? '🎉 Festival' : event.type === 'major' ? '⭐ Major' : '📅 Event'}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
