'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Onboarding.module.css';

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const { updateHealthProfile } = useAuth();
    const { t } = useI18n();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form data
    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [customDisease, setCustomDisease] = useState('');
    const [customAllergy, setCustomAllergy] = useState('');

    const commonDiseases = [
        { id: 'diabetes', label: '🩸 Diabetes / السكري' },
        { id: 'hypertension', label: '💊 Hypertension / ارتفاع ضغط الدم' },
        { id: 'heart_disease', label: '❤️ Heart Disease / أمراض القلب' },
        { id: 'asthma', label: '🫁 Asthma / الربو' },
        { id: 'kidney_disease', label: '🫘 Kidney Disease / أمراض الكلى' },
        { id: 'celiac', label: '🌾 Celiac Disease / حساسية القمح' },
    ];

    const commonAllergies = [
        { id: 'peanuts', label: '🥜 Peanuts / الفول السوداني' },
        { id: 'milk', label: '🥛 Milk / الحليب' },
        { id: 'eggs', label: '🥚 Eggs / البيض' },
        { id: 'gluten', label: '🌾 Gluten / الغلوتين' },
        { id: 'soy', label: '🫘 Soy / الصويا' },
        { id: 'shellfish', label: '🦐 Shellfish / المحار' },
        { id: 'fish', label: '🐟 Fish / السمك' },
        { id: 'tree_nuts', label: '🌰 Tree Nuts / المكسرات' },
    ];

    const toggleDisease = (id: string) => {
        setChronicDiseases(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const toggleAllergy = (id: string) => {
        setAllergies(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const addCustomDisease = () => {
        if (customDisease.trim()) {
            setChronicDiseases(prev => [...prev, customDisease.trim()]);
            setCustomDisease('');
        }
    };

    const addCustomAllergy = () => {
        if (customAllergy.trim()) {
            setAllergies(prev => [...prev, customAllergy.trim()]);
            setCustomAllergy('');
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            await updateHealthProfile({
                name,
                height: parseFloat(height) || 0,
                weight: parseFloat(weight) || 0,
                dateOfBirth,
                chronicDiseases,
                allergies,
            });
            onComplete();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const totalSteps = 4;
    const progress = ((step + 1) / totalSteps) * 100;

    const steps = [
        // Step 0 — Welcome & Name
        <div key="welcome" className={styles.stepContent}>
            <div className={styles.stepIcon}>☪️</div>
            <h2 className={styles.stepTitle}>مرحباً بك في iMuslimRU!</h2>
            <p className={styles.stepSubtitle}>Let&apos;s personalize your experience</p>
            <div className={styles.formGroup}>
                <label>{t('auth.name')}</label>
                <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name..."
                    autoFocus
                />
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>{t('profile.height')} (cm)</label>
                    <input className="input" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                </div>
                <div className={styles.formGroup}>
                    <label>{t('profile.weight')} (kg)</label>
                    <input className="input" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>{t('profile.dateOfBirth')}</label>
                <input className="input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
        </div>,

        // Step 1 — Chronic Diseases
        <div key="diseases" className={styles.stepContent}>
            <div className={styles.stepIcon}>🏥</div>
            <h2 className={styles.stepTitle}>{t('profile.chronicDiseases')}</h2>
            <p className={styles.stepSubtitle}>Select any conditions you have (optional)</p>
            <div className={styles.chipGrid}>
                {commonDiseases.map((d) => (
                    <button
                        key={d.id}
                        className={`${styles.chip} ${chronicDiseases.includes(d.id) ? styles.chipActive : ''}`}
                        onClick={() => toggleDisease(d.id)}
                    >
                        {d.label}
                    </button>
                ))}
            </div>
            <div className={styles.customInput}>
                <input
                    className="input"
                    value={customDisease}
                    onChange={(e) => setCustomDisease(e.target.value)}
                    placeholder="Add other..."
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDisease()}
                />
                <button className="btn btn-sm btn-primary" onClick={addCustomDisease}>+</button>
            </div>
            {chronicDiseases.filter(d => !commonDiseases.find(cd => cd.id === d)).map(d => (
                <span key={d} className={`${styles.chip} ${styles.chipActive}`}>
                    {d} <button onClick={() => toggleDisease(d)}>×</button>
                </span>
            ))}
        </div>,

        // Step 2 — Allergies
        <div key="allergies" className={styles.stepContent}>
            <div className={styles.stepIcon}>⚠️</div>
            <h2 className={styles.stepTitle}>{t('profile.allergies')}</h2>
            <p className={styles.stepSubtitle}>Select your allergies for safety alerts (optional)</p>
            <div className={styles.chipGrid}>
                {commonAllergies.map((a) => (
                    <button
                        key={a.id}
                        className={`${styles.chip} ${allergies.includes(a.id) ? styles.chipActive : ''}`}
                        onClick={() => toggleAllergy(a.id)}
                    >
                        {a.label}
                    </button>
                ))}
            </div>
            <div className={styles.customInput}>
                <input
                    className="input"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="Add other..."
                    onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
                />
                <button className="btn btn-sm btn-primary" onClick={addCustomAllergy}>+</button>
            </div>
            {allergies.filter(a => !commonAllergies.find(ca => ca.id === a)).map(a => (
                <span key={a} className={`${styles.chip} ${styles.chipActive}`}>
                    {a} <button onClick={() => toggleAllergy(a)}>×</button>
                </span>
            ))}
        </div>,

        // Step 3 — Ready
        <div key="ready" className={styles.stepContent}>
            <div className={styles.readyIcon}>✨</div>
            <h2 className={styles.stepTitle}>You&apos;re all set!</h2>
            <p className={styles.stepSubtitle}>Your personalized Islamic companion is ready</p>
            <div className={styles.readySummary}>
                <div className={styles.summaryItem}>
                    <span>👤</span>
                    <span>{name || 'Not set'}</span>
                </div>
                {height && weight && (
                    <div className={styles.summaryItem}>
                        <span>📏</span>
                        <span>{height} cm · {weight} kg</span>
                    </div>
                )}
                {chronicDiseases.length > 0 && (
                    <div className={styles.summaryItem}>
                        <span>🏥</span>
                        <span>{chronicDiseases.length} conditions</span>
                    </div>
                )}
                {allergies.length > 0 && (
                    <div className={styles.summaryItem}>
                        <span>⚠️</span>
                        <span>{allergies.length} allergies</span>
                    </div>
                )}
            </div>
        </div>,
    ];

    return (
        <div className={styles.overlay}>
            <div className={styles.wizard}>
                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                </div>

                {/* Step Counter */}
                <div className={styles.stepCounter}>
                    {step + 1} / {totalSteps}
                </div>

                {/* Active Step */}
                <div className={styles.stepWrapper}>{steps[step]}</div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    {step > 0 && (
                        <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                            ← {t('common.back')}
                        </button>
                    )}
                    <div className={styles.navSpacer} />
                    {step < totalSteps - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(step + 1)}
                            disabled={step === 0 && !name.trim()}
                        >
                            {t('common.next')} →
                        </button>
                    ) : (
                        <button className="btn btn-gold btn-lg" onClick={handleFinish} disabled={saving}>
                            {saving ? <span className="spinner" /> : `🚀 ${t('common.start')}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
