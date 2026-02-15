'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { MotionDiv, MotionButton } from '@/lib/framer';
import { AnimatePresence, motion } from 'framer-motion';
import { IconCalculator, IconChevronRight, IconChevronLeft, IconCash, IconCircles, IconInfoCircle } from '@tabler/icons-react';

type ZakatType = 'savings' | 'gold' | 'silver' | 'fitr';

const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const GOLD_PRICE_PER_GRAM_EST = 70; // USD estimate, should be fetched or user input
const SILVER_PRICE_PER_GRAM_EST = 0.8; // USD estimate

export function ZakatCalculator() {
    const { t } = useI18n();
    const [step, setStep] = useState<'type' | 'input' | 'result'>('type');
    const [type, setType] = useState<ZakatType | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [currency, setCurrency] = useState('USD');
    const [result, setResult] = useState<number | null>(null);

    const calculateZakat = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return;

        let zakat = 0;
        // Simple logic for MVP
        if (type === 'savings' || type === 'gold' || type === 'silver') {
            // 2.5% logic
            zakat = val * 0.025;
        } else if (type === 'fitr') {
            // Fixed amount per person (e.g. $10-15)
            zakat = val * 12; // Assuming val is number of people
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

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <IconCalculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    {t('believer.zakatCalculator') || 'Zakat Calculator'}
                </h2>
            </div>

            <div className="min-h-[300px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 'type' && (
                        <motion.div
                            key="type"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <button
                                onClick={() => { setType('savings'); setStep('input'); }}
                                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <IconChevronRight className="text-emerald-500" />
                                </div>
                                <div className="mb-3 p-3 w-fit rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <IconCash size={24} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{t('zakat.savings') || 'Savings & Cash'}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    2.5% if held for a lunar year and exceeds Nisab.
                                </p>
                            </button>

                            <button
                                onClick={() => { setType('gold'); setStep('input'); }}
                                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <IconChevronRight className="text-amber-500" />
                                </div>
                                <div className="mb-3 p-3 w-fit rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                    <IconCircles size={24} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{t('zakat.gold') || 'Gold'}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    2.5% if exceeds {NISAB_GOLD_GRAMS}g.
                                </p>
                            </button>
                        </motion.div>
                    )}

                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <button
                                onClick={() => setStep('type')}
                                className="flex items-center text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            >
                                <IconChevronLeft size={16} className="mr-1" />
                                {t('common.back') || 'Back'}
                            </button>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                    {type === 'gold' ? (t('zakat.goldValue') || 'Total Value of Gold') : (t('zakat.totalAmount') || 'Total Amount')}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full p-4 text-xl rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all group-hover:border-neutral-400 dark:group-hover:border-neutral-600"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                                        {currency}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-xs text-neutral-500">
                                    <IconInfoCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>{t('zakat.hawlNote') || 'Ensure this amount has been held for one complete lunar year (Hawl).'}</span>
                                </div>
                            </div>

                            <button
                                onClick={calculateZakat}
                                disabled={!amount}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {t('zakat.calculate') || 'Calculate'}
                            </button>
                        </motion.div>
                    )}

                    {step === 'result' && result !== null && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="text-center py-8"
                        >
                            <h3 className="text-neutral-500 dark:text-neutral-400 font-medium mb-4 uppercase tracking-wider text-sm">
                                {t('zakat.payable') || 'Zakat Payable'}
                            </h3>
                            <div className="text-6xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent mb-2 tracking-tighter">
                                {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}<span className="text-3xl ml-1 text-emerald-500">{currency}</span>
                            </div>

                            <div className="max-w-sm mx-auto mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    {t('zakat.distribution') || 'This amount should be distributed to the 8 categories of recipients mentioned in the Quran.'}
                                </p>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={reset}
                                    className="px-8 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-full font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300"
                                >
                                    {t('zakat.calculateAgain') || 'Calculate Another'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
