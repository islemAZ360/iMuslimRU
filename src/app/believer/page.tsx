'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { ZakatCalculator } from '@/components/believer/ZakatCalculator';
import { IslamicCalendar } from '@/components/believer/IslamicCalendar';
import { AdhkarTracker } from '@/components/believer/AdhkarTracker';
import { IconMoon } from '@tabler/icons-react';
import styles from './Believer.module.css';

export default function BelieverPage() {
    const { t } = useI18n();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconBox}>
                        <IconMoon size={28} style={{ color: '#34d399' }} />
                    </div>
                    <h1 className={styles.title}>
                        {t('believer.title') || 'The Believer'}
                    </h1>
                    <p className={styles.subtitle}>
                        {t('believer.subtitle') || 'Zakat, Fasting & Remembrance — your spiritual companion'}
                    </p>
                </div>

                {/* Adhkar Tracker — Main Feature */}
                <div className={styles.section}>
                    <AdhkarTracker />
                </div>

                {/* Zakat Calculator */}
                <div className={styles.section}>
                    <ZakatCalculator />
                </div>

                {/* Islamic Calendar */}
                <div className={styles.section}>
                    <IslamicCalendar />
                </div>
            </div>
        </div>
    );
}
