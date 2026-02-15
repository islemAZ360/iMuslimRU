'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Profile.module.css';

export default function ProfilePage() {
    const { user, healthProfile, updateHealthProfile, logout, deleteAccount, loading } = useAuth();
    const { t } = useI18n();
    const router = useRouter();

    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [chronicDiseases, setChronicDiseases] = useState('');
    const [allergies, setAllergies] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (healthProfile) {
            setName(healthProfile.name || '');
            setHeight(healthProfile.height ? String(healthProfile.height) : '');
            setWeight(healthProfile.weight ? String(healthProfile.weight) : '');
            setDateOfBirth(healthProfile.dateOfBirth || '');
            setChronicDiseases(healthProfile.chronicDiseases?.join(', ') || '');
            setAllergies(healthProfile.allergies?.join(', ') || '');
        }
    }, [healthProfile]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await updateHealthProfile({
                name,
                height: parseFloat(height) || 0,
                weight: parseFloat(weight) || 0,
                dateOfBirth,
                chronicDiseases: chronicDiseases.split(',').map((d) => d.trim()).filter(Boolean),
                allergies: allergies.split(',').map((a) => a.trim()).filter(Boolean),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleDelete = async () => {
        try {
            await deleteAccount();
            router.push('/login');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className={styles.title}>{t('profile.title')}</h1>

                {/* Avatar */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className={styles.avatarImg} />
                        ) : (
                            <span>{(name || user.email || '?').charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <p className={styles.email}>{user.email}</p>
                </div>

                {/* Profile Form */}
                <div className={styles.form}>
                    <div className="input-group">
                        <label>{t('auth.name')}</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className={styles.row}>
                        <div className="input-group">
                            <label>{t('profile.height')}</label>
                            <input className="input" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>{t('profile.weight')}</label>
                            <input className="input" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{t('profile.dateOfBirth')}</label>
                        <input className="input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>{t('profile.chronicDiseases')}</label>
                        <input
                            className="input"
                            value={chronicDiseases}
                            onChange={(e) => setChronicDiseases(e.target.value)}
                            placeholder="Diabetes, Hypertension..."
                        />
                    </div>

                    <div className="input-group">
                        <label>{t('profile.allergies')}</label>
                        <input
                            className="input"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            placeholder="Peanuts, Lactose..."
                        />
                    </div>

                    <button className="btn btn-primary btn-block btn-lg" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner" /> : saved ? `✅ ${t('profile.saved')}` : t('profile.save')}
                    </button>
                </div>

                {/* Account Actions */}
                <div className={styles.accountActions}>
                    <div className="divider" />
                    <button className="btn btn-secondary btn-block" onClick={handleLogout}>
                        {t('auth.logout')}
                    </button>
                    <button className="btn btn-danger btn-block" onClick={() => setShowDeleteConfirm(true)}>
                        {t('auth.deleteAccount')}
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <p>{t('auth.deleteAccountConfirm')}</p>
                            <div className={styles.modalActions}>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    {t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
