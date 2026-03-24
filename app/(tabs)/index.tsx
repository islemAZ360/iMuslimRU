import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { getPrayerTimes, PrayerTimesResult, PrayerName } from '@/lib/prayer';
import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import { useRouter } from 'expo-router';
import { useWorship } from '@/hooks/useWorship';
import { useProfile } from '@/hooks/useProfile';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// All green/gold - no blues, purples, reds
const PRAYER_COLORS: Record<string, [string, string]> = {
  Fajr:    ['#022C22', '#065F46'],
  Sunrise: ['#1A0F00', '#A07830'],
  Dhuhr:   ['#022C22', '#047857'],
  Asr:     ['#022C22', '#065F46'],
  Maghrib: ['#1A0F00', '#C9A84C'],
  Isha:    ['#0A0A0A', '#022C22'],
};

const PRAYER_ICONS: Record<string, string> = {
  Fajr: 'sunny-outline', Sunrise: 'partly-sunny-outline',
  Dhuhr: 'sunny', Asr: 'cloudy-outline',
  Maghrib: 'moon-outline', Isha: 'moon',
};

// Geometric pattern dots
const PATTERN_DOTS = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  left: (i % 5) * 80 - 10,
  top: Math.floor(i / 5) * 60 - 10,
  opacity: 0.04 + (i % 3) * 0.02,
}));

export default function Home() {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const wt = translations[language].worship;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { prayerLogs, adhkarProgress, logPrayer } = useWorship();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Location + Prayer fetch ─────────────────────────────────────────────
  const fetchLocationAndPrayers = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      const pos = granted ? await Location.getCurrentPositionAsync({}) : null;
      const lat = pos?.coords.latitude ?? 55.7558;
      const lon = pos?.coords.longitude ?? 37.6173;

      setLocation({ lat, lon });
      setPrayerData(getPrayerTimes(lat, lon, profile?.calculationMethod as any));

      if (granted && pos) {
        try {
          const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geo.length > 0) setCityName(geo[0].city || geo[0].region || '');
        } catch { /* silent */ }
      } else {
        setCityName(profile?.city || 'Moscow');
      }
    } catch {
      const lat = 55.7558, lon = 37.6173;
      setLocation({ lat, lon });
      setPrayerData(getPrayerTimes(lat, lon, profile?.calculationMethod as any));
      setCityName(profile?.city || 'Moscow');
    }
  };

  useEffect(() => {
    fetchLocationAndPrayers();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [profile?.calculationMethod]);

  // ── Live countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!prayerData) return;
    if (countdownRef.current) clearInterval(countdownRef.current);

    const tick = () => {
      const [h, m] = prayerData.nextPrayer.time.split(':').map(Number);
      const now = DateTime.now();
      let target = now.set({ hour: h, minute: m, second: 0 });
      if (target <= now) target = target.plus({ days: 1 });
      const diff = target.diff(now, ['hours', 'minutes', 'seconds']);
      const hh = String(Math.floor(diff.hours)).padStart(2, '0');
      const mm = String(Math.floor(diff.minutes)).padStart(2, '0');
      const ss = String(Math.floor(diff.seconds)).padStart(2, '0');
      setCountdown(`${hh}:${mm}:${ss}`);
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [prayerData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (location) {
        setPrayerData(getPrayerTimes(location.lat, location.lon, profile?.calculationMethod as any));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [location, profile?.calculationMethod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocationAndPrayers();
    setRefreshing(false);
  };

  const getPrayerDisplayName = (name: PrayerName) =>
    t.prayers?.[name.toLowerCase() as keyof typeof t.prayers] || name;

  // ── Derived state ────────────────────────────────────────────────────────
  const completedPrayersCount = prayerLogs?.length || 0;
  const morningDone  = adhkarProgress?.some(p => p.dhikrId.startsWith('morning'));
  const eveningDone  = adhkarProgress?.some(p => p.dhikrId.startsWith('evening'));
  const hour         = DateTime.now().hour;
  const greeting     = hour < 12 ? t.greeting_morning : t.greeting_evening;
  const dateStr      = DateTime.now()
    .setLocale(language === 'ar' ? 'ar' : language === 'ru' ? 'ru' : 'en')
    .toFormat('EEEE, d MMM');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C9A84C"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Premium Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#022C22', '#064E3B', '#0A0A0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          {/* Islamic geometric pattern */}
          <View style={styles.patternOverlay} pointerEvents="none">
            {PATTERN_DOTS.map(({ key, left, top, opacity }) => (
              <View key={key} style={[styles.patternDot, { left, top, opacity }]} />
            ))}
          </View>

          {/* Top row */}
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={11} color="rgba(201,168,76,0.7)" />
                <Text style={styles.locationText}>
                  {cityName || 'Moscow'} · {dateStr}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/qibla')} style={styles.iconBtn}>
                <Ionicons name="compass" size={20} color="#C9A84C" />
              </Pressable>
              <Pressable onPress={() => router.push('/stats')} style={styles.iconBtn}>
                <Ionicons name="stats-chart" size={20} color="#C9A84C" />
              </Pressable>
            </View>
          </View>

          {/* ── Next Prayer Glass Card ──────────────────────────────────── */}
          {prayerData ? (
            <Animated.View entering={FadeIn.delay(100)} style={styles.nextPrayerCard}>
              <View style={styles.nextPrayerRow}>
                <View>
                  <Text style={styles.nextPrayerLabel}>{t.nextPrayer}</Text>
                  <Text style={styles.nextPrayerName}>
                    {getPrayerDisplayName(prayerData.nextPrayer.name as PrayerName)}
                  </Text>
                  <Text style={styles.nextPrayerTime}>{prayerData.nextPrayer.time}</Text>
                </View>

                {/* Countdown ring */}
                <View style={styles.countdownRing}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                  <Text style={styles.countdownLabel}>
                    {language === 'ru' ? 'осталось' : language === 'ar' ? 'متبقي' : 'remaining'}
                  </Text>
                </View>
              </View>

              {/* Prayer progress dots */}
              <View style={styles.progressDots}>
                {Object.keys(prayerData.times).map(name => {
                  const isCompleted = prayerLogs?.some(l => l.prayer_name === name);
                  const isNext = prayerData.nextPrayer.name === name;
                  return (
                    <View
                      key={name}
                      style={[
                        styles.dot,
                        isCompleted && styles.dotDone,
                        isNext && styles.dotNext,
                      ]}
                    />
                  );
                })}
              </View>
            </Animated.View>
          ) : (
            <View style={[styles.nextPrayerCard, styles.loadingCard]}>
              <ActivityIndicator color="#C9A84C" size="large" />
            </View>
          )}
        </LinearGradient>

        {/* ── Prayer Times List ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.prayerSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.prayerTimes}</Text>
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>{completedPrayersCount}/5</Text>
            </View>
          </View>

          {prayerData ? (
            <View style={styles.prayerList}>
              {Object.entries(prayerData.times).map(([name, time], idx) => {
                const isCompleted = prayerLogs?.some(l => l.prayer_name === name);
                const isNext = prayerData.nextPrayer.name === name;
                const gc = PRAYER_COLORS[name] ?? ['#022C22', '#065F46'];
                const iconName = PRAYER_ICONS[name] ?? 'time-outline';

                return (
                  <Animated.View key={name} entering={FadeInUp.delay(200 + idx * 50)}>
                    <Pressable
                      onPress={() => logPrayer.mutate(name as PrayerName)}
                      style={[styles.prayerRow, isNext && styles.prayerRowNext]}
                    >
                      {/* Gradient wash */}
                      <LinearGradient
                        colors={[gc[0] + '44', gc[1] + '11']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      {/* Left accent */}
                      <View style={[styles.prayerColorBar, { backgroundColor: gc[1] }]} />

                      <View style={styles.prayerRowContent}>
                        <View style={styles.prayerInfo}>
                          {/* Check circle */}
                          <View style={[
                            styles.prayerCheck,
                            isCompleted && { backgroundColor: gc[1], borderColor: gc[1] },
                          ]}>
                            {isCompleted && <Ionicons name="checkmark" size={11} color="#fff" />}
                          </View>

                          <Text style={[styles.prayerName, isCompleted && styles.prayerNameDone]}>
                            {getPrayerDisplayName(name as PrayerName)}
                          </Text>

                          {isNext && (
                            <View style={styles.nextBadge}>
                              <Text style={styles.nextBadgeText}>NEXT</Text>
                            </View>
                          )}
                        </View>

                        <Text style={[styles.prayerTime, isNext && styles.prayerTimeNext]}>
                          {time}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <ActivityIndicator color="#C9A84C" style={{ padding: spacing.xl }} />
          )}
        </Animated.View>

        {/* ── Worship Summary ────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(350)} style={styles.worshipSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{wt.title}</Text>
            <Pressable onPress={() => router.push('/stats')} style={styles.statsBtn}>
              <Ionicons name="stats-chart-outline" size={18} color="#C9A84C" />
            </Pressable>
          </View>

          <View style={styles.worshipGrid}>
            {/* Prayers card */}
            <View style={styles.worshipCard}>
              <LinearGradient colors={['#022C22', '#065F46']} style={styles.worshipIcon}>
                <Ionicons name="checkmark-done" size={18} color="#C9A84C" />
              </LinearGradient>
              <Text style={styles.worshipValue}>{completedPrayersCount}/5</Text>
              <Text style={styles.worshipLabel}>{wt.prayersCompleted}</Text>
              <View style={styles.miniBar}>
                <View style={[styles.miniBarFill, { width: `${(completedPrayersCount / 5) * 100}%` as any }]} />
              </View>
            </View>

            {/* Morning adhkar */}
            <Pressable style={styles.worshipCard} onPress={() => router.push('/(tabs)/adhkar')}>
              <LinearGradient colors={['#A07830', '#C9A84C']} style={styles.worshipIcon}>
                <Ionicons name="sunny" size={18} color="#022C22" />
              </LinearGradient>
              <Ionicons
                name={morningDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={morningDone ? '#059669' : 'rgba(201,168,76,0.3)'}
              />
              <Text style={styles.worshipLabel}>{wt.morningAdhkar}</Text>
            </Pressable>

            {/* Evening adhkar */}
            <Pressable style={styles.worshipCard} onPress={() => router.push('/(tabs)/adhkar')}>
              <LinearGradient colors={['#064E3B', '#022C22']} style={styles.worshipIcon}>
                <Ionicons name="moon" size={18} color="#E8D48B" />
              </LinearGradient>
              <Ionicons
                name={eveningDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={eveningDone ? '#059669' : 'rgba(201,168,76,0.3)'}
              />
              <Text style={styles.worshipLabel}>{wt.eveningAdhkar}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(450)} style={styles.quickActions}>
          <Text style={styles.sectionTitle}>
            {language === 'ru' ? 'Быстрый доступ' : language === 'ar' ? 'وصول سريع' : 'Quick Access'}
          </Text>
          <View style={styles.actionGrid}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/qibla')}>
              <LinearGradient colors={['#064E3B', '#022C22']} style={styles.actionGradient}>
                <Ionicons name="compass" size={28} color="#E8D48B" />
                <Text style={styles.actionText}>{t.qibla}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/ramadan')}>
              <LinearGradient colors={['#A07830', '#C9A84C']} style={styles.actionGradient}>
                <Ionicons name="moon" size={28} color="#022C22" />
                <Text style={[styles.actionText, { color: '#022C22' }]}>{t.calendar}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/adhkar')}>
              <LinearGradient colors={['#065F46', '#047857']} style={styles.actionGradient}>
                <Ionicons name="book" size={28} color="#E8D48B" />
                <Text style={styles.actionText}>{translations[language].adhkar.title}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/scanner')}>
              <LinearGradient colors={['#064E3B', '#022C22']} style={styles.actionGradient}>
                <Ionicons name="scan-circle" size={28} color="#C9A84C" />
                <Text style={styles.actionText}>{translations[language].scanner.title}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {},

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    minHeight: 280,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternDot: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.5)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F0E8',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(201,168,76,0.7)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(201,168,76,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },

  // ── Next Prayer Card ─────────────────────────────────────────────────────
  nextPrayerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  loadingCard: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerLabel: {
    fontSize: 11,
    color: 'rgba(201,168,76,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F5F0E8',
    letterSpacing: -0.5,
  },
  nextPrayerTime: {
    fontSize: 20,
    color: 'rgba(245,240,232,0.65)',
    fontWeight: '500',
    marginTop: 4,
  },
  countdownRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9A84C',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  countdownLabel: {
    fontSize: 8,
    color: 'rgba(201,168,76,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dotDone: {
    backgroundColor: '#C9A84C',
  },
  dotNext: {
    backgroundColor: '#F5F0E8',
    width: 20,
    borderRadius: 4,
  },

  // ── Prayer Times ─────────────────────────────────────────────────────────
  prayerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#F5F0E8',
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  completedBadgeText: {
    ...typography.captionBold,
    color: '#C9A84C',
  },
  prayerList: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.1)',
  },
  prayerRow: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.06)',
    backgroundColor: '#111827',
  },
  prayerRowNext: {
    backgroundColor: 'rgba(6,95,70,0.2)',
  },
  prayerColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  prayerRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.lg,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prayerCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerName: {
    ...typography.bodyBold,
    color: '#F5F0E8',
  },
  prayerNameDone: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  nextBadge: {
    backgroundColor: '#C9A84C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#022C22',
    letterSpacing: 0.5,
  },
  prayerTime: {
    ...typography.h4,
    color: '#B8A98A',
  },
  prayerTimeNext: {
    color: '#C9A84C',
    fontWeight: '700',
  },

  // ── Worship Summary ──────────────────────────────────────────────────────
  worshipSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsBtn: {
    padding: 4,
  },
  worshipGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  worshipCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)',
    overflow: 'hidden',
  },
  worshipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  worshipValue: {
    ...typography.h3,
    color: '#C9A84C',
    fontWeight: '800',
  },
  worshipLabel: {
    fontSize: 11,
    color: '#B8A98A',
    textAlign: 'center',
    fontWeight: '500',
  },
  miniBar: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: '#C9A84C',
    borderRadius: 2,
  },

  // ── Quick Actions ────────────────────────────────────────────────────────
  quickActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    aspectRatio: 1.4,
    justifyContent: 'center',
  },
  actionText: {
    ...typography.captionBold,
    color: '#E8D48B',
    textAlign: 'center',
  },
});
