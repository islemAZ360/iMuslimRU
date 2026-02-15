'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getPrayerTimes, formatTime, getNextPrayer, PrayerTimeResult } from '@/lib/prayer';
import Onboarding from '@/components/Onboarding';
import styles from './Home.module.css';

// Nawafil (Sunnah prayers) data
const NAWAFIL_DATA = [
  { prayer: 'fajr', before: 2, after: 0, key: 'Fajr' },
  { prayer: 'dhuhr', before: 4, after: 2, key: 'Dhuhr' },
  { prayer: 'asr', before: 4, after: 0, key: 'Asr' },
  { prayer: 'maghrib', before: 0, after: 2, key: 'Maghrib' },
  { prayer: 'isha', before: 0, after: 2, key: 'Isha' },
];

const DAILY_ADHKAR = [
  { ar: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', count: 33 },
  { ar: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', count: 33 },
  { ar: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', count: 33 },
  { ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illaAllah', count: 1 },
];

// Prayer name translation map
const PRAYER_NAME_MAP: Record<string, string> = {
  fajr: '🌙',
  sunrise: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌆',
  isha: '🌃',
};

export default function HomePage() {
  const { user, healthProfile, loading } = useAuth();
  const { t, locale } = useI18n();
  const { hasGeminiKey } = useSettings();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeResult | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Persist adhkar to localStorage
  const [adhkarCounter, setAdhkarCounter] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [0, 0, 0, 0];
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('imuslim-adhkar');
      if (saved) {
        const data = JSON.parse(saved);
        // Reset if it's a new day
        if (data.date === today) return data.counts;
      }
    } catch { /* ignore */ }
    return [0, 0, 0, 0];
  });

  // Save adhkar counter to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('imuslim-adhkar', JSON.stringify({ date: today, counts: adhkarCounter }));
  }, [adhkarCounter]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Check if user needs onboarding (new user without profile)
  useEffect(() => {
    if (user && healthProfile && !healthProfile.name && !healthProfile.height) {
      setShowOnboarding(true);
    }
  }, [user, healthProfile]);

  // Sync AI toggle with API key
  useEffect(() => {
    setAiEnabled(hasGeminiKey);
  }, [hasGeminiKey]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Prayer times — store location for getNextPrayer tomorrow calculation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        const times = getPrayerTimes(loc.lat, loc.lng);
        setPrayerTimes(times);
      },
      () => {
        // Default to Moscow
        const loc = { lat: 55.7558, lng: 37.6173 };
        setUserLocation(loc);
        const times = getPrayerTimes(loc.lat, loc.lng);
        setPrayerTimes(times);
      }
    );
  }, []);

  // Next prayer countdown — pass lat/lng for tomorrow calculation
  useEffect(() => {
    if (!prayerTimes || !userLocation) return;
    const interval = setInterval(() => {
      const next = getNextPrayer(prayerTimes, userLocation.lat, userLocation.lng);
      setNextPrayer(next);
      if (next) {
        const diff = next.time.getTime() - Date.now();
        const absDiff = Math.max(0, diff);
        const h = Math.floor(absDiff / 3600000);
        const m = Math.floor((absDiff % 3600000) / 60000);
        const s = Math.floor((absDiff % 60000) / 1000);
        setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, userLocation]);

  const handleAdhkarTap = (index: number) => {
    setAdhkarCounter(prev => {
      const next = [...prev];
      if (next[index] < DAILY_ADHKAR[index].count) {
        next[index]++;
      }
      return next;
    });
  };

  const handleAiToggle = () => {
    if (!hasGeminiKey) {
      router.push('/settings');
    } else {
      setAiEnabled(!aiEnabled);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingLogo}>
          <svg width="56" height="56" viewBox="0 0 100 100" className={styles.logoSvg}>
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <path d="M50 10 C25 10, 10 35, 10 50 C10 75, 30 90, 50 90 C35 80, 30 65, 30 50 C30 35, 35 20, 50 10Z" fill="url(#moonGrad)" />
            <circle cx="58" cy="22" r="3" fill="#fbbf24" opacity="0.9" />
            <circle cx="70" cy="30" r="2" fill="#fbbf24" opacity="0.6" />
          </svg>
          <span className={styles.logoText}>iMuslimRU</span>
        </div>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = healthProfile?.name || user.displayName || user.email?.split('@')[0] || '';
  const hour = currentTime.getHours();
  const greetingEmoji = hour < 6 ? '🌙' : hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌆';

  // Translate prayer name
  const getTranslatedPrayerName = (name: string) => {
    const translated = t(`prayer.${name}`);
    // If translation returns the key itself (missing), use capitalized English
    return translated === `prayer.${name}` ? name.charAt(0).toUpperCase() + name.slice(1) : translated;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

        {/* --- Header --- */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <div className={styles.greeting}>
                {greetingEmoji} {t('app.tagline')}
              </div>
              <h1 className={styles.userName}>{displayName}</h1>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.aiToggle} ${aiEnabled ? styles.aiToggleActive : ''}`}
                onClick={handleAiToggle}
                title={aiEnabled ? 'AI Enabled' : 'AI Disabled'}
              >
                <span className={styles.aiToggleIcon}>🤖</span>
                <span className={styles.aiToggleDot} />
              </button>
              <div className={styles.avatar} onClick={() => router.push('/profile')}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className={styles.avatarImg} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.timeDisplay}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </header>

        {/* --- Next Prayer Card --- */}
        {nextPrayer && (
          <section className={styles.nextPrayerCard} onClick={() => router.push('/prayer')}>
            <div className={styles.nextPrayerGlow} />
            <div className={styles.nextPrayerContent}>
              <div className={styles.nextPrayerLabel}>{t('prayer.nextPrayer')}</div>
              <div className={styles.nextPrayerName}>
                {PRAYER_NAME_MAP[nextPrayer.name] || ''} {getTranslatedPrayerName(nextPrayer.name)}
              </div>
              <div className={styles.nextPrayerTime}>{formatTime(nextPrayer.time)}</div>
            </div>
            <div className={styles.nextPrayerCountdown}>
              <div className={styles.countdownDigits}>{countdown || '—'}</div>
              <div className={styles.countdownLabel}>{t('prayer.remaining')}</div>
            </div>
          </section>
        )}

        {/* --- Quick Actions --- */}
        <section className={styles.quickActions}>
          <div className={`${styles.actionCard} ${styles.prayerCard}`} onClick={() => router.push('/prayer')}>
            <div className={styles.actionIconWrap}><span>🕌</span></div>
            <div className={styles.actionInfo}>
              <div className={styles.actionLabel}>{t('nav.prayer')}</div>
              <div className={styles.actionDesc}>{t('prayer.timesAndQibla') || 'Times & Qibla'}</div>
            </div>
          </div>
          <div className={`${styles.actionCard} ${styles.scannerCard}`} onClick={() => router.push('/scanner')}>
            <div className={styles.actionIconWrap}><span>📷</span></div>
            <div className={styles.actionInfo}>
              <div className={styles.actionLabel}>{t('nav.scanner')}</div>
              <div className={styles.actionDesc}>{t('scanner.halalCheck') || 'Halal Check'}</div>
            </div>
          </div>
          <div className={`${styles.actionCard} ${styles.healthCard}`} onClick={() => router.push('/health')}>
            <div className={styles.actionIconWrap}><span>💚</span></div>
            <div className={styles.actionInfo}>
              <div className={styles.actionLabel}>{t('nav.health')}</div>
              <div className={styles.actionDesc}>{t('health.aiAdvisor') || 'AI Advisor'}</div>
            </div>
          </div>
          <div className={`${styles.actionCard} ${styles.qiblaCard}`} onClick={() => router.push('/prayer?tab=qibla')}>
            <div className={styles.actionIconWrap}><span>🧭</span></div>
            <div className={styles.actionInfo}>
              <div className={styles.actionLabel}>{t('prayer.qibla')}</div>
              <div className={styles.actionDesc}>{t('prayer.direction') || 'Direction'}</div>
            </div>
          </div>
        </section>

        {/* --- Nawafil (Sunnah Prayers) --- */}
        <section className={styles.nawafilSection}>
          <h3 className="section-title">🌟 {t('prayer.nawafil') || 'السنن الرواتب'}</h3>
          <div className={styles.nawafilGrid}>
            {NAWAFIL_DATA.map((item) => (
              <div key={item.prayer} className={styles.nawafilCard}>
                <div className={styles.nawafilPrayer}>{getTranslatedPrayerName(item.prayer)}</div>
                <div className={styles.nawafilDetails}>
                  {item.before > 0 && (
                    <div className={styles.nawafilItem}>
                      <span className={styles.nawafilBefore}>↑ {item.before}</span>
                      <span className={styles.nawafilLabel}>{t('prayer.before') || 'قبل'}</span>
                    </div>
                  )}
                  {item.after > 0 && (
                    <div className={styles.nawafilItem}>
                      <span className={styles.nawafilAfter}>↓ {item.after}</span>
                      <span className={styles.nawafilLabel}>{t('prayer.after') || 'بعد'}</span>
                    </div>
                  )}
                  {item.before === 0 && item.after === 0 && (
                    <div className={styles.nawafilItem}>
                      <span className={styles.nawafilLabel}>{t('prayer.optional') || 'اختياري'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Adhkar Counter --- */}
        <section className={styles.adhkarSection}>
          <h3 className="section-title">📿 {t('home.adhkar') || 'أذكار'}</h3>
          <div className={styles.adhkarGrid}>
            {DAILY_ADHKAR.map((dhikr, i) => {
              const isComplete = adhkarCounter[i] >= dhikr.count;
              return (
                <button
                  key={i}
                  className={`${styles.adhkarCard} ${isComplete ? styles.adhkarComplete : ''}`}
                  onClick={() => handleAdhkarTap(i)}
                  disabled={isComplete}
                >
                  <div className={styles.adhkarArabic}>{dhikr.ar}</div>
                  <div className={styles.adhkarTransliteration}>{dhikr.transliteration}</div>
                  <div className={styles.adhkarProgress}>
                    <div
                      className={styles.adhkarProgressBar}
                      style={{ width: `${(adhkarCounter[i] / dhikr.count) * 100}%` }}
                    />
                  </div>
                  <div className={styles.adhkarCount}>
                    {adhkarCounter[i]} / {dhikr.count}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- Bismillah Banner --- */}
        <div className={styles.banner}>
          <div className={styles.bannerGlow} />
          <div className={styles.bannerArabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <div className={styles.bannerTranslation}>{t('home.bismillah') || 'In the name of Allah, the Most Gracious, the Most Merciful'}</div>
        </div>
      </div>
    </div>
  );
}
