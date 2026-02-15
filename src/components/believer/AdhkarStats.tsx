'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { IconChartBar, IconClick } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function AdhkarStats() {
    const { t } = useI18n();
    // Mock data for charts - in real app would read from localStorage history
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

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <IconChartBar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                    {t('believer.adhkarStats') || 'Adhkar Statistics'}
                </h2>
            </div>

            {/* Week Chart */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-4 uppercase tracking-wider">
                    {t('stats.weeklyActivity') || 'Weekly Activity'}
                </h3>
                <div className="flex items-end justify-between h-48 gap-2">
                    {history.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.count / maxCount) * 100}%` }}
                                    transition={{ duration: 1, type: "spring" }}
                                    className="w-full max-w-[30px] bg-emerald-100 dark:bg-emerald-900/30 rounded-t-full transition-colors duration-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-500 relative"
                                />
                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded">
                                    {item.count}
                                </div>
                            </div>
                            <span className="mt-2 text-xs font-medium text-neutral-400">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase mb-1">{t('stats.total') || 'Total Adhkar'}</div>
                    <div className="text-3xl font-black text-neutral-800 dark:text-white">1,735</div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase mb-1">{t('stats.streak') || 'Current Streak'}</div>
                    <div className="text-3xl font-black text-orange-500">12 <span className="text-sm text-neutral-400 font-normal">days</span></div>
                </div>
            </div>
        </div>
    );
}
