'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import styles from './Login.module.css';

export default function LoginPage() {
    const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
    const { t } = useI18n();
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await registerWithEmail(email, password, name);
            } else {
                await loginWithEmail(email, password);
            }
            router.push('/');
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            router.push('/');
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            {/* Floating particles */}
            <div className={styles.particles}>
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
            </div>

            <div className={styles.loginContainer}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>☪</span>
                    <h1 className={styles.logoText}>iMuslimRU</h1>
                    <p className={styles.logoTagline}>{t('app.tagline')}</p>
                </div>

                {/* Google Sign In */}
                <button
                    className={`${styles.googleBtn} btn btn-block`}
                    onClick={handleGoogle}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    {t('auth.loginWithGoogle')}
                </button>

                {/* Divider */}
                <div className={styles.divider}>
                    <span>{t('common.or') || 'or'}</span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {isRegister && (
                        <div className="input-group animate-fade-in">
                            <label>{t('auth.name')}</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={t('auth.name')}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('auth.email')}
                        />
                    </div>

                    <div className="input-group">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder={t('auth.password')}
                            minLength={6}
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" />
                        ) : isRegister ? (
                            t('auth.register')
                        ) : (
                            t('auth.login')
                        )}
                    </button>
                </form>

                {/* Toggle Login/Register */}
                <p className={styles.toggleText}>
                    {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
                    <button
                        className={styles.toggleBtn}
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                    >
                        {isRegister ? t('auth.login') : t('auth.register')}
                    </button>
                </p>
            </div>
        </div>
    );
}
