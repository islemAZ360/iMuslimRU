'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { ZakatCalculator } from '@/components/believer/ZakatCalculator';
import { IslamicCalendar } from '@/components/believer/IslamicCalendar';
import { AdhkarStats } from '@/components/believer/AdhkarStats';

export default function BelieverPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black pb-32 pt-10">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                        {t('believer.title') || 'The Believer'}
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                        {t('believer.subtitle') || 'Your companion for Zakat, Fasting, and Remembrance.'}
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    <section id="zakat">
                        <ZakatCalculator />
                    </section>

                    <section id="calendar">
                        <IslamicCalendar />
                    </section>

                    <section id="adhkar">
                        <AdhkarStats />
                    </section>
                </div>
            </div>
        </div>
    );
}
