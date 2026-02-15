'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getPrayerTimes, formatTime, getNextPrayer, PrayerTimeResult } from '@/lib/prayer';
import Onboarding from '@/components/Onboarding';
import styles from './Home.module.css';
import { HamsterLoader } from '@/components/ui/HamsterLoader';

/* ─── Time-based Adhkar Data (shared with AdhkarTracker) ─── */

interface Dhikr {
  id: string;
  arabic: string;
  translationEn: string;
  translationRu: string;
  translationAr: string;
  target: number;
}

interface TimeCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  nameRu: string;
  emoji: string;
  color: string;
  gradient: string;
  adhkar: Dhikr[];
}

const TIME_CATEGORIES: TimeCategory[] = [
  {
    id: 'morning', nameAr: 'أذكار الصباح', nameEn: 'Morning Adhkar', nameRu: 'Утренние азкары',
    emoji: '🌅', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b20, #f59e0b08)',
    adhkar: [
      { id: 'm1', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', translationEn: 'We have entered morning and all sovereignty belongs to Allah', translationRu: 'Мы встретили утро, и вся власть принадлежит Аллаху', translationAr: 'دعاء الصباح - الملك لله', target: 1 },
      { id: 'm2', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translationEn: 'Glory be to Allah and all praise is due to Him', translationRu: 'Пречист Аллах и хвала Ему', translationAr: 'التسبيح والحمد', target: 100 },
      { id: 'm3', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationEn: 'There is no god but Allah alone, with no partner', translationRu: 'Нет божества, кроме Аллаха, Единого, нет у Него сотоварища', translationAr: 'كلمة التوحيد', target: 10 },
      { id: 'm4', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translationEn: 'O Allah, I ask You for well-being', translationRu: 'О Аллах, я прошу у Тебя благополучия', translationAr: 'دعاء العافية', target: 3 },
      { id: 'm5', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', translationEn: 'In the Name of Allah with whose Name nothing can harm', translationRu: 'С именем Аллаха, с именем Которого ничто не навредит', translationAr: 'دعاء الحفظ من الأذى', target: 3 },
      { id: 'm6', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translationEn: 'I seek refuge in the perfect words of Allah from evil', translationRu: 'Прибегаю к совершенным словам Аллаха от зла того, что Он сотворил', translationAr: 'الاستعاذة بكلمات الله', target: 3 },
    ],
  },
  {
    id: 'evening', nameAr: 'أذكار المساء', nameEn: 'Evening Adhkar', nameRu: 'Вечерние азкары',
    emoji: '🌆', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf620, #8b5cf608)',
    adhkar: [
      { id: 'e1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', translationEn: 'We have entered evening and all sovereignty belongs to Allah', translationRu: 'Мы встретили вечер, и вся власть принадлежит Аллаху', translationAr: 'دعاء المساء - الملك لله', target: 1 },
      { id: 'e2', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translationEn: 'Glory be to Allah and all praise is due to Him', translationRu: 'Пречист Аллах и хвала Ему', translationAr: 'التسبيح والحمد', target: 100 },
      { id: 'e3', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationEn: 'There is no god but Allah alone, with no partner', translationRu: 'Нет божества, кроме Аллаха, Единого, нет у Него сотоварища', translationAr: 'كلمة التوحيد', target: 10 },
      { id: 'e4', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', translationEn: 'O Allah, I seek refuge in You from worry and grief', translationRu: 'О Аллах, я прибегаю к Тебе от беспокойства и печали', translationAr: 'دعاء الاستعاذة من الهم', target: 3 },
    ],
  },
  {
    id: 'afterPrayer', nameAr: 'أذكار بعد الصلاة', nameEn: 'After Prayer', nameRu: 'После намаза',
    emoji: '🕌', color: '#10b981', gradient: 'linear-gradient(135deg, #10b98120, #10b98108)',
    adhkar: [
      { id: 'p1', arabic: 'أَسْتَغْفِرُ اللَّهَ', translationEn: 'I seek forgiveness from Allah', translationRu: 'Прошу прощения у Аллаха', translationAr: 'الاستغفار', target: 3 },
      { id: 'p2', arabic: 'سُبْحَانَ اللَّهِ', translationEn: 'Glory be to Allah', translationRu: 'Пречист Аллах', translationAr: 'التسبيح', target: 33 },
      { id: 'p3', arabic: 'الْحَمْدُ لِلَّهِ', translationEn: 'All praise is due to Allah', translationRu: 'Хвала Аллаху', translationAr: 'الحمد', target: 33 },
      { id: 'p4', arabic: 'اللَّهُ أَكْبَرُ', translationEn: 'Allah is the Greatest', translationRu: 'Аллах Велик', translationAr: 'التكبير', target: 34 },
      { id: 'p5', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationEn: 'There is no god but Allah alone', translationRu: 'Нет божества, кроме Аллаха', translationAr: 'كلمة التوحيد', target: 1 },
    ],
  },
  {
    id: 'sleep', nameAr: 'أذكار النوم', nameEn: 'Before Sleep', nameRu: 'Перед сном',
    emoji: '🌙', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f620, #3b82f608)',
    adhkar: [
      { id: 's1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translationEn: 'In Your Name, O Allah, I die and I live', translationRu: 'С Твоим именем, о Аллах, я умираю и живу', translationAr: 'دعاء النوم', target: 1 },
      { id: 's2', arabic: 'سُبْحَانَ اللَّهِ', translationEn: 'Glory be to Allah', translationRu: 'Пречист Аллах', translationAr: 'التسبيح', target: 33 },
      { id: 's3', arabic: 'الْحَمْدُ لِلَّهِ', translationEn: 'All praise is due to Allah', translationRu: 'Хвала Аллаху', translationAr: 'الحمد', target: 33 },
      { id: 's4', arabic: 'اللَّهُ أَكْبَرُ', translationEn: 'Allah is the Greatest', translationRu: 'Аллах Велик', translationAr: 'التكبير', target: 34 },
    ],
  },
];

function getTimeCategory(hour: number): string {
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afterPrayer';
  if (hour >= 16 && hour < 21) return 'evening';
  return 'sleep';
}

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

function loadAdhkarCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('adhkar_counts');
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data._date !== getTodayKey()) return {};
    return data;
  } catch { return {}; }
}

function saveAdhkarCounts(counts: Record<string, number>) {
  localStorage.setItem('adhkar_counts', JSON.stringify({ ...counts, _date: getTodayKey() }));
}

function saveToHistory(counts: Record<string, number>) {
  const today = getTodayKey();
  let totalAll = 0;
  const categories: Record<string, number> = {};
  TIME_CATEGORIES.forEach(cat => {
    let catTotal = 0;
    cat.adhkar.forEach(d => { const c = counts[d.id] || 0; catTotal += c; totalAll += c; });
    categories[cat.id] = catTotal;
  });
  try {
    const raw = localStorage.getItem('adhkar_history');
    const history = raw ? JSON.parse(raw) : {};
    history[today] = { total: totalAll, categories };
    localStorage.setItem('adhkar_history', JSON.stringify(history));
  } catch { /* ignore */ }
}

const PRAYER_NAME_MAP: Record<string, string> = {
  fajr: '🌙', sunrise: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌆', isha: '🌃',
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
  const [splashDone, setSplashDone] = useState(false);
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>({});

  useEffect(() => { setAdhkarCounts(loadAdhkarCounts()); }, []);
  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user && healthProfile && !healthProfile.name && !healthProfile.height) setShowOnboarding(true); }, [user, healthProfile]);
  useEffect(() => { setAiEnabled(hasGeminiKey); }, [hasGeminiKey]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setTimeout(() => setSplashDone(true), 3000); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); setPrayerTimes(getPrayerTimes(loc.lat, loc.lng)); },
        () => { const loc = { lat: 55.7558, lng: 37.6173 }; setUserLocation(loc); setPrayerTimes(getPrayerTimes(loc.lat, loc.lng)); }
      );
    }
  }, []);

  useEffect(() => {
    if (!prayerTimes || !userLocation) return;
    const interval = setInterval(() => {
      const next = getNextPrayer(prayerTimes, userLocation.lat, userLocation.lng);
      setNextPrayer(next);
      if (next) {
        const diff = Math.max(0, next.time.getTime() - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, userLocation]);

  const handleDhikrTap = useCallback((dhikrId: string, target: number) => {
    setAdhkarCounts(prev => {
      const current = prev[dhikrId] || 0;
      if (current >= target) return prev;
      const next = { ...prev, [dhikrId]: current + 1 };
      saveAdhkarCounts(next);
      saveToHistory(next);
      return next;
    });
  }, []);

  const handleAiToggle = () => { if (!hasGeminiKey) router.push('/settings'); else setAiEnabled(!aiEnabled); };

  if (loading || !splashDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: '16px', background: 'var(--bg-primary)' }}>
        <HamsterLoader />
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 4px 0', background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>iMuslimRU</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>{t('app.tagline') || 'Your Islamic Companion'}</p>
        </div>
        <div style={{ width: '120px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #10b981, #34d399)', animation: 'loadingSlide 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = healthProfile?.name || user.displayName || user.email?.split('@')[0] || '';
  const hour = currentTime.getHours();
  const greetingEmoji = hour < 6 ? '🌙' : hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌆';
  const currentCatId = getTimeCategory(hour);
  const currentCat = TIME_CATEGORIES.find(c => c.id === currentCatId)!;
  const catName = locale === 'ar' ? currentCat.nameAr : locale === 'ru' ? currentCat.nameRu : currentCat.nameEn;

  // Get translation for a dhikr
  const getTranslation = (d: Dhikr) => {
    if (locale === 'ar') return d.translationAr;
    if (locale === 'ru') return d.translationRu;
    return d.translationEn;
  };

  // Category progress
  let catDone = 0, catTotal = 0;
  currentCat.adhkar.forEach(d => { catTotal += d.target; catDone += Math.min(adhkarCounts[d.id] || 0, d.target); });
  const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;

  const getTranslatedPrayerName = (name: string) => {
    const translated = t(`prayer.${name}`);
    return translated === `prayer.${name}` ? name.charAt(0).toUpperCase() + name.slice(1) : translated;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <div className={styles.greeting}>{greetingEmoji} {t('app.tagline')}</div>
              <h1 className={styles.userName}>{displayName}</h1>
            </div>
            <div className={styles.headerActions}>
              <button className={`${styles.aiToggle} ${aiEnabled ? styles.aiToggleActive : ''}`} onClick={handleAiToggle} title={aiEnabled ? 'AI Enabled' : 'AI Disabled'}>
                <span className={styles.aiToggleIcon}>🤖</span>
                <span className={styles.aiToggleDot} />
              </button>
              <div className={styles.avatar} onClick={() => router.push('/profile')}>
                {user.photoURL ? <img src={user.photoURL} alt="" className={styles.avatarImg} /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
              </div>
            </div>
          </div>
          <div className={styles.timeDisplay}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </header>

        {/* Next Prayer Card */}
        {nextPrayer && (
          <section className={styles.nextPrayerCard} onClick={() => router.push('/prayer')}>
            <div className={styles.nextPrayerGlow} />
            <div className={styles.nextPrayerContent}>
              <div className={styles.nextPrayerLabel}>{t('prayer.nextPrayer')}</div>
              <div className={styles.nextPrayerName}>{PRAYER_NAME_MAP[nextPrayer.name] || ''} {getTranslatedPrayerName(nextPrayer.name)}</div>
              <div className={styles.nextPrayerTime}>{formatTime(nextPrayer.time)}</div>
            </div>
            <div className={styles.nextPrayerCountdown}>
              <div className={styles.countdownDigits}>{countdown || '—'}</div>
              <div className={styles.countdownLabel}>{t('prayer.remaining')}</div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
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

        {/* ═══ Time-Based Adhkar — Premium Design ═══ */}
        <section style={{ marginBottom: '24px' }}>
          {/* Section Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px', padding: '0 2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${currentCat.color}18`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>
                {currentCat.emoji}
              </div>
              <div>
                <h3 style={{
                  fontSize: '16px', fontWeight: 800, margin: 0,
                  background: `linear-gradient(135deg, ${currentCat.color}, ${currentCat.color}cc)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{catName}</h3>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 500 }}>
                  {locale === 'ar' ? 'أذكارك المناسبة لهذا الوقت' : locale === 'ru' ? 'Азкары для этого времени' : 'Your adhkar for this time'}
                </p>
              </div>
            </div>

            {/* Progress badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: `${currentCat.color}12`, padding: '6px 12px',
              borderRadius: '20px', border: `1px solid ${currentCat.color}25`,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <circle cx="9" cy="9" r="7" fill="none" stroke={currentCat.color} strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(catPct / 100) * 44} 44`}
                  transform="rotate(-90 9 9)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 800, color: currentCat.color }}>{catPct}%</span>
            </div>
          </div>

          {/* Adhkar Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentCat.adhkar.map((dhikr, idx) => {
              const count = adhkarCounts[dhikr.id] || 0;
              const done = count >= dhikr.target;
              const pct = Math.min((count / dhikr.target) * 100, 100);

              return (
                <button
                  key={dhikr.id}
                  onClick={() => handleDhikrTap(dhikr.id, dhikr.target)}
                  disabled={done}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    width: '100%', textAlign: 'left', padding: '14px 16px',
                    borderRadius: '16px', border: 'none', cursor: done ? 'default' : 'pointer',
                    background: done
                      ? `linear-gradient(135deg, ${currentCat.color}12, ${currentCat.color}06)`
                      : 'rgba(255,255,255,0.03)',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: done ? `${currentCat.color}30` : 'rgba(255,255,255,0.06)',
                    transition: 'all 0.25s ease',
                    fontFamily: 'inherit',
                    backdropFilter: 'blur(8px)',
                    animation: `fadeIn 0.3s ease ${idx * 0.06}s both`,
                  }}
                >
                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '17px', fontWeight: 700, margin: 0,
                      color: done ? currentCat.color : 'rgba(255,255,255,0.9)',
                      direction: 'rtl', textAlign: 'right', lineHeight: 1.6,
                      fontFamily: "'Amiri', 'Noto Naskh Arabic', serif",
                    }}>
                      {dhikr.arabic}
                    </p>
                    <p style={{
                      fontSize: '11px', margin: '4px 0 0',
                      color: done ? `${currentCat.color}90` : 'rgba(255,255,255,0.4)',
                      lineHeight: 1.4, fontWeight: 500,
                      textAlign: locale === 'ar' ? 'right' : 'left',
                      direction: locale === 'ar' ? 'rtl' : 'ltr',
                    }}>
                      {getTranslation(dhikr)}
                    </p>
                    {/* Progress bar */}
                    <div style={{
                      height: '3px', borderRadius: '2px',
                      background: 'rgba(255,255,255,0.06)',
                      marginTop: '8px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: `linear-gradient(90deg, ${currentCat.color}, ${currentCat.color}90)`,
                        width: `${pct}%`,
                        transition: 'width 0.3s ease',
                        boxShadow: pct > 0 ? `0 0 6px ${currentCat.color}40` : 'none',
                      }} />
                    </div>
                  </div>

                  {/* Counter button */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: done
                      ? `linear-gradient(135deg, ${currentCat.color}25, ${currentCat.color}15)`
                      : `linear-gradient(135deg, ${currentCat.color}30, ${currentCat.color}10)`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s ease',
                    boxShadow: done ? 'none' : `0 4px 12px ${currentCat.color}20`,
                    border: `1px solid ${done ? `${currentCat.color}30` : `${currentCat.color}20`}`,
                  }}>
                    {done ? (
                      <span style={{ fontSize: '22px', color: currentCat.color }}>✓</span>
                    ) : (
                      <>
                        <span style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1, color: '#fff' }}>{count}</span>
                        <span style={{ fontSize: '9px', opacity: 0.5, lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>/{dhikr.target}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bismillah Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerGlow} />
          <div className={styles.bannerArabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <div className={styles.bannerTranslation}>{t('home.bismillah') || 'In the name of Allah, the Most Gracious, the Most Merciful'}</div>
        </div>
      </div>
    </div>
  );
}
