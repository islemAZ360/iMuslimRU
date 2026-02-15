'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    IconCalculator,
    IconChevronRight,
    IconChevronLeft,
    IconCash,
    IconCircles,
    IconInfoCircle,
    IconDiamond,
    IconUsers,
} from '@tabler/icons-react';

type ZakatType = 'savings' | 'gold' | 'silver' | 'fitr';

const NISAB_GOLD_GRAMS = 85;

export function ZakatCalculator() {
    const { t } = useI18n();
    const [step, setStep] = useState<'type' | 'input' | 'result'>('type');
    const [type, setType] = useState<ZakatType | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [currency] = useState('USD');
    const [result, setResult] = useState<number | null>(null);

    const calculateZakat = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return;
        let zakat = 0;
        if (type === 'savings' || type === 'gold' || type === 'silver') {
            zakat = val * 0.025;
        } else if (type === 'fitr') {
            zakat = val * 12;
        }
        setResult(zakat);
        setStep('result');
    };

    const reset = () => {
        setStep('type');
        setType(null);
        setAmount('');
        setResult(null);
    };

    const zakatTypes = [
        {
            id: 'savings' as ZakatType,
            icon: <IconCash size={22} />,
            label: t('zakat.savings') || 'Savings & Cash',
            desc: '2.5% of total savings held for a lunar year',
            gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
            borderColor: 'rgba(59,130,246,0.25)',
            iconBg: 'rgba(59,130,246,0.15)',
            iconColor: '#60a5fa',
        },
        {
            id: 'gold' as ZakatType,
            icon: <IconDiamond size={22} />,
            label: t('zakat.gold') || 'Gold',
            desc: `2.5% if exceeds ${NISAB_GOLD_GRAMS}g`,
            gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
            borderColor: 'rgba(251,191,36,0.25)',
            iconBg: 'rgba(251,191,36,0.15)',
            iconColor: '#fbbf24',
        },
        {
            id: 'silver' as ZakatType,
            icon: <IconCircles size={22} />,
            label: t('zakat.silver') || 'Silver',
            desc: '2.5% if exceeds 595g',
            gradient: 'linear-gradient(135deg, rgba(148,163,184,0.15), rgba(148,163,184,0.05))',
            borderColor: 'rgba(148,163,184,0.25)',
            iconBg: 'rgba(148,163,184,0.15)',
            iconColor: '#94a3b8',
        },
        {
            id: 'fitr' as ZakatType,
            icon: <IconUsers size={22} />,
            label: t('zakat.fitr') || 'Zakat al-Fitr',
            desc: 'Per-person amount before Eid prayer',
            gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
            borderColor: 'rgba(16,185,129,0.25)',
            iconBg: 'rgba(16,185,129,0.15)',
            iconColor: '#34d399',
        },
    ];

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
                    background: 'rgba(16,185,129,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <IconCalculator size={20} style={{ color: '#34d399' }} />
                </div>
                <h2 style={{
                    fontSize: '20px', fontWeight: 800, margin: 0,
                    background: 'linear-gradient(135deg, #34d399, #06b6d4)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {t('believer.zakatCalculator') || 'Zakat Calculator'}
                </h2>
            </div>

            <div style={{ minHeight: '220px', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    {step === 'type' && (
                        <motion.div
                            key="type"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
                        >
                            {zakatTypes.map((z) => (
                                <button
                                    key={z.id}
                                    onClick={() => { setType(z.id); setStep('input'); }}
                                    style={{
                                        background: z.gradient,
                                        border: `1px solid ${z.borderColor}`,
                                        borderRadius: '14px',
                                        padding: '16px 12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'transform 0.15s, box-shadow 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: 'inherit',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${z.borderColor}`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: z.iconBg, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', color: z.iconColor,
                                        }}>
                                            {z.icon}
                                        </div>
                                        <IconChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginTop: '10px', marginBottom: '2px', color: 'rgba(255,255,255,0.9)' }}>
                                        {z.label}
                                    </h3>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.3 }}>
                                        {z.desc}
                                    </p>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            <button onClick={() => setStep('type')} style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '13px', padding: 0,
                            }}>
                                <IconChevronLeft size={16} /> {t('common.back') || 'Back'}
                            </button>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {type === 'fitr' ? 'Number of People' : 'Total Amount'}
                                </label>
                                <div style={{ position: 'relative', marginTop: '8px' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                        style={{
                                            width: '100%', padding: '14px 60px 14px 16px',
                                            fontSize: '20px', fontWeight: 700, borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.04)',
                                            color: '#fff', outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                    <span style={{
                                        position: 'absolute', right: '16px', top: '50%',
                                        transform: 'translateY(-50%)', fontSize: '14px',
                                        fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                                    }}>{currency}</span>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '6px',
                                    marginTop: '10px', padding: '8px 10px', borderRadius: '8px',
                                    background: 'rgba(16,185,129,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                                }}>
                                    <IconInfoCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                                    <span>{t('zakat.hawlNote') || 'Ensure this has been held for one complete lunar year (Hawl).'}</span>
                                </div>
                            </div>
                            <button
                                onClick={calculateZakat}
                                disabled={!amount}
                                style={{
                                    padding: '14px', borderRadius: '12px', border: 'none',
                                    background: !amount ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #059669, #0d9488)',
                                    color: !amount ? 'rgba(255,255,255,0.3)' : '#fff',
                                    fontSize: '16px', fontWeight: 700, cursor: amount ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    boxShadow: amount ? '0 4px 16px rgba(5,150,105,0.3)' : 'none',
                                }}
                            >
                                {t('zakat.calculate') || 'Calculate Zakat'}
                            </button>
                        </motion.div>
                    )}

                    {step === 'result' && result !== null && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            style={{ textAlign: 'center', padding: '16px 0' }}
                        >
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                                {t('zakat.payable') || 'Zakat Payable'}
                            </p>
                            <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, marginBottom: '4px' }}>
                                <span style={{ background: 'linear-gradient(135deg, #34d399, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                                <span style={{ fontSize: '20px', color: '#34d399', marginLeft: '4px' }}>{currency}</span>
                            </div>
                            <div style={{
                                maxWidth: '280px', margin: '16px auto 0', padding: '10px 14px',
                                borderRadius: '10px', background: 'rgba(16,185,129,0.08)',
                                border: '1px solid rgba(16,185,129,0.12)',
                                fontSize: '12px', color: 'rgba(52,211,153,0.8)', lineHeight: 1.4,
                            }}>
                                {t('zakat.distribution') || 'Distribute to the 8 categories of recipients from the Quran.'}
                            </div>
                            <button onClick={reset} style={{
                                marginTop: '16px', padding: '10px 24px', borderRadius: '20px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            }}>
                                {t('zakat.calculateAgain') || 'Calculate Another'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
