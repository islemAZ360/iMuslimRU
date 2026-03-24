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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Per-prayer gradient colours (dark → accent)
const PRAYER_COLORS: Record<string, [string, string]> = {
  Fajr:    ['#1E3A5F', '#2563EB'],
  Sunrise: ['#B45309', '#F59E0B'],
  Dhuhr:   ['#065F46', '#10B981'],
  Asr:     ['#1E40AF', '#3B82F6'],
  Maghrib: ['#7C2D12', '#EF4444'],
  Isha:    ['#1E1B4B', '#7C3AED'],
};

// Decorative dots for the Islamic geometric pattern overlay
const PATTERN_DOTS = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  left: (i % 5) * 80 - 10,
  top: Math.floor(i / 5) * 60 - 10,
  opacity: 0.06 + (i % 3) * 0.02,
}));

export default function Home() {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const wt = translations[language].worship;
  const router = useRouter();
  const { profile } = useProfile();
  const { prayerLogs, adhkarProgress, logPrayer } = useWorship();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Location + Prayer fetch ─────────────────────────────────────────────
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

  // ─── Live countdown ───────────────────────────────────────────────────────
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

  // Refresh prayer times every minute
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

  // ─── Derived state ────────────────────────────────────────────────────────
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.goldPrimary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Premium Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#022C22', '#064E3B', '#0D2137']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Islamic geometric pattern overlay */}
          <View style={styles.patternOverlay} pointerEvents="none">
            {PATTERN_DOTS.map(({ key, left, top, opacity }) => (
              <View
                key={key}
                style={[styles.patternDot, { left, top, opacity }]}
              />
            ))}
          </View>

          {/* Top row: greeting + action buttons */}
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="rgba(201,168,76,0.85)" />
                <Text style={styles.locationText}>
                  {cityName || 'Moscow'} · {dateStr}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/qibla')} style={styles.iconBtn}>
                <Ionicons name="compass" size={22} color={colors.goldPrimary} />
              </Pressable>
              <Pressable onPress={() => router.push('/stats')} style={styles.iconBtn}>
                <Ionicons name="stats-chart" size={22} color={colors.goldPrimary} />
              </Pressable>
            </View>
          </View>

          {/* ── Next Prayer Glass Card ──────────────────────────────────── */}
          {prayerData ? (
            <Animated.View entering={FadeIn.delay(100)} style={styles.nextPrayerCard}>
              <View style={styles.nextPrayerGlass}>
                {/* Left: name + time */}
                <View style={styles.nextPrayerLeft}>
                  <Text style={styles.nextPrayerLabel}>{t.nextPrayer}</Text>
                  <Text style={styles.nextPrayerName}>
                    {getPrayerDisplayName(prayerData.nextPrayer.name as PrayerName)}
                  </Text>
                  <Text style={styles.nextPrayerTime}>{prayerData.nextPrayer.time}</Text>
                </View>

                {/* Right: countdown ring */}
                <View style={styles.nextPrayerRight}>
                  <View style={styles.countdownRing}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <Text style={styles.countdownLabel}>remaining</Text>
                  </View>
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
                        isNext     && styles.dotNext,
                      ]}
                    />
                  );
                })}
              </View>
            </Animated.View>
          ) : (
            <View style={[styles.nextPrayerCard, styles.nextPrayerCardLoading]}>
              <ActivityIndicator color={colors.goldPrimary} size="large" />
            </View>
          )}
        </LinearGradient>

        {/* ── Prayer Times List ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.prayerSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.prayerTimes}</Text>
            <View style={styles.prayerCompletedBadge}>
              <Text style={styles.prayerCompletedText}>{completedPrayersCount}/5</Text>
            </View>
          </View>

          {prayerData ? (
            <View style={styles.prayerList}>
              {Object.entries(prayerData.times).map(([name, time], idx) => {
                const isCompleted = prayerLogs?.some(l => l.prayer_name === name);
                const isNext      = prayerData.nextPrayer.name === name;
                const gc          = PRAYER_COLORS[name] || ['#065F46', '#10B981'];

                return (
                  <Animated.View key={name} entering={FadeInUp.delay(200 + idx * 50)}>
                    <Pressable
                      onPress={() => logPrayer.mutate(name as PrayerName)}
                      style={[styles.prayerRow, isNext && styles.prayerRowNext]}
                    >
                      {/* subtle gradient wash */}
                      <LinearGradient
                        colors={[gc[0] + '22', gc[1] + '08']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      {/* coloured left accent bar */}
                      <View style={[styles.prayerColorBar, { backgroundColor: gc[1] }]} />

                      <View style={styles.prayerRowContent}>
                        <View style={styles.prayerInfo}>
                          {/* completion circle */}
                          <View style={[
                            styles.prayerCheck,
                            isCompleted && { backgroundColor: gc[1], borderColor: gc[1] },
                          ]}>
                            {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
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
            <ActivityIndicator color={colors.primary} style={{ padding: spacing.xl }} />
          )}
        </Animated.View>

        {/* ── Worship & Adhkar Summary ────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.worshipSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{wt.title}</Text>
            <Pressable onPress={() => router.push('/stats')} style={styles.statsLinkBtn}>
              <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.worshipGrid}>
            {/* Prayers completed card */}
            <View style={styles.worshipCard}>
              <LinearGradient
                colors={['#022C22', '#065F46']}
                style={styles.worshipCardHeader}
              >
                <Ionicons name="checkmark-done" size={18} color={colors.goldPrimary} />
              </LinearGradient>
              <Text style={styles.worshipValue}>{completedPrayersCount}/5</Text>
              <Text style={styles.worshipLabel}>{wt.prayersCompleted}</Text>
              <View style={styles.miniProgressBar}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${(completedPrayersCount / 5) * 100}%` as any },
                  ]}
                />
              </View>
            </View>

            {/* Morning adhkar */}
            <Pressable
              style={styles.worshipCard}
              onPress={() => router.push('/(tabs)/adhkar')}
            >
              <LinearGradient
                colors={['#92400E', '#D97706']}
                style={styles.worshipCardHeader}
              >
                <Ionicons name="sunny" size={18} color="#FDE68A" />
              </LinearGradient>
              <Ionicons
                name={morningDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={morningDone ? colors.success : colors.textTertiary}
              />
              <Text style={styles.worshipLabel}>{wt.morningAdhkar}</Text>
            </Pressable>

            {/* Evening adhkar */}
            <Pressable
              style={styles.worshipCard}
              onPress={() => router.push('/(tabs)/adhkar')}
            >
              <LinearGradient
                colors={['#1E1B4B', '#7C3AED']}
                style={styles.worshipCardHeader}
              >
                <Ionicons name="moon" size={18} color="#C4B5FD" />
              </LinearGradient>
              <Ionicons
                name={eveningDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={eveningDone ? colors.success : colors.textTertiary}
              />
              <Text style={styles.worshipLabel}>{wt.eveningAdhkar}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.quickActions}>
          <Text style={styles.sectionTitle}>
            {language === 'ru' ? 'Быстрый доступ' : language === 'ar' ? 'وصول سريع' : 'Quick Access'}
          </Text>
          <View style={styles.actionGrid}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/qibla')}>
              <LinearGradient colors={['#1E3A5F', '#2563EB']} style={styles.actionGradient}>
                <Ionicons name="compass" size={28} color={colors.white} />
                <Text style={styles.actionText}>{t.qibla}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/ramadan')}>
              <LinearGradient colors={['#1E1B4B', '#7C3AED']} style={styles.actionGradient}>
                <Ionicons name="moon" size={28} color={colors.white} />
                <Text style={styles.actionText}>{t.calendar}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/adhkar')}>
              <LinearGradient colors={['#065F46', '#10B981']} style={styles.actionGradient}>
                <Ionicons name="book" size={28} color={colors.white} />
                <Text style={styles.actionText}>{translations[language].adhkar.title}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/scanner')}>
              <LinearGradient colors={['#7C2D12', '#EF4444']} style={styles.actionGradient}>
                <Ionicons name="scan-circle" size={28} color={colors.white} />
                <Text style={styles.actionText}>{translations[language].scanner.title}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scrollContent: {},

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
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
    borderColor: 'rgba(201,168,76,0.4)',
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
    color: colors.white,
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
    color: 'rgba(201,168,76,0.85)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201,168,76,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },

  // ── Next Prayer Glass Card ───────────────────────────────────────────────
  nextPrayerCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  nextPrayerCardLoading: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPrayerGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerLeft: {},
  nextPrayerLabel: {
    fontSize: 11,
    color: 'rgba(201,168,76,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  nextPrayerTime: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 4,
  },
  nextPrayerRight: {
    alignItems: 'center',
  },
  countdownRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.goldPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  countdownLabel: {
    fontSize: 8,
    color: 'rgba(201,168,76,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotDone: {
    backgroundColor: colors.goldPrimary,
  },
  dotNext: {
    backgroundColor: colors.white,
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
    color: colors.text,
    fontWeight: '700',
  },
  prayerCompletedBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  prayerCompletedText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  prayerList: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  prayerRow: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    backgroundColor: colors.white,
  },
  prayerRowNext: {
    backgroundColor: '#F0FDF4',
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
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  prayerNameDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  nextBadge: {
    backgroundColor: colors.goldPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  prayerTime: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  prayerTimeNext: {
    color: colors.primary,
    fontWeight: '700',
  },

  // ── Worship Summary ──────────────────────────────────────────────────────
  worshipSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsLinkBtn: {
    padding: 4,
  },
  worshipGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  worshipCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  worshipCardHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  worshipValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  worshipLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  miniProgressBar: {
    height: 4,
    width: '100%',
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
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
    ...shadows.md,
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
    color: colors.white,
    textAlign: 'center',
  },
});
