'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { ZakatCalculator } from '@/components/believer/ZakatCalculator';
import { IslamicCalendar } from '@/components/believer/IslamicCalendar';
import { AdhkarTracker } from '@/components/believer/AdhkarTracker';
import { IconMoon } from '@tabler/icons-react';
import { motion } from 'motion/react';

export default function BelieverPage() {
    const { t } = useI18n();

    return (
        <div style={{
            minHeight: '100vh',
            paddingBottom: '100px',
            paddingTop: '20px',
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
                        border: '1px solid rgba(16,185,129,0.2)',
                        marginBottom: '12px',
                        boxShadow: '0 0 24px rgba(16,185,129,0.1)',
                    }}>
                        <IconMoon size={28} style={{ color: '#34d399' }} />
                    </div>
                    <h1 style={{
                        fontSize: '28px', fontWeight: 900, margin: '0 0 6px 0',
                        background: 'linear-gradient(135deg, #34d399, #06b6d4, #818cf8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        {t('believer.title') || 'The Believer'}
                    </h1>
                    <p style={{
                        fontSize: '14px', color: 'rgba(255,255,255,0.4)',
                        maxWidth: '320px', margin: '0 auto', lineHeight: 1.5,
                    }}>
                        {t('believer.subtitle') || 'Zakat, Fasting & Remembrance — your spiritual companion'}
                    </p>
                </motion.div>

                {/* Adhkar Tracker — Main Feature */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '16px' }}
                >
                    <AdhkarTracker />
                </motion.div>

                {/* Zakat Calculator */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: '16px' }}
                >
                    <ZakatCalculator />
                </motion.div>

                {/* Islamic Calendar */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <IslamicCalendar />
                </motion.div>
            </div>
        </div>
    );
}
