import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { getPrayerTimes, PrayerTimesResult, PrayerName } from '@/lib/prayer';
import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import { useRouter } from 'expo-router';
import { useWorship } from '@/hooks/useWorship';
import { useProfile } from '@/hooks/useProfile';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function Home() {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const wt = translations[language].worship;
  const router = useRouter();
  const { profile } = useProfile();
  const { prayerLogs, adhkarProgress, logPrayer } = useWorship();
  
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLocationAndPrayers = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const lat = status === 'granted'
        ? (await Location.getCurrentPositionAsync({})).coords.latitude
        : 55.7558;
      const lon = status === 'granted'
        ? (await Location.getCurrentPositionAsync({})).coords.longitude
        : 37.6173;

      setLocation({ lat, lon });
      const data = getPrayerTimes(lat, lon, profile?.calculationMethod as any);
      setPrayerData(data);

      if (status === 'granted') {
        try {
          const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geo.length > 0) setCityName(geo[0].city || geo[0].region || '');
        } catch {}
      } else {
        setCityName(profile?.city || 'Moscow');
      }
    } catch (e) {
      const lat = 55.7558, lon = 37.6173;
      setLocation({ lat, lon });
      const data = getPrayerTimes(lat, lon, profile?.calculationMethod as any);
      setPrayerData(data);
      setCityName(profile?.city || 'Moscow');
    }
  };

  useEffect(() => {
    fetchLocationAndPrayers();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [profile?.calculationMethod]);

  // Live countdown ticker
  useEffect(() => {
    if (!prayerData) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    const tick = () => {
      if (!prayerData) return;
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

  const getPrayerDisplayName = (name: PrayerName) => {
    return t.prayers?.[name.toLowerCase() as keyof typeof t.prayers] || name;
  };

  const PrayerRow = ({ name, time, isNext }: { name: PrayerName; time: string; isNext: boolean }) => {
    const isCompleted = prayerLogs?.some(log => log.prayerName === name);
    return (
      <Pressable onPress={() => logPrayer.mutate(name)} style={styles.prayerRowPressable}>
        <View style={[styles.prayerRow, isNext && styles.nextPrayerRow]}>
          <View style={styles.prayerInfo}>
            <View style={[styles.checkCircle, isCompleted && styles.checkCircleActive, isNext && styles.checkCircleNext]}>
              {isCompleted && <Ionicons name="checkmark" size={14} color={isNext ? colors.primary : colors.white} />}
            </View>
            <Ionicons
              name={getPrayerIcon(name)}
              size={22}
              color={isNext ? colors.white : colors.primary}
              style={{ marginLeft: spacing.sm }}
            />
            <Text style={[styles.prayerName, isNext && styles.nextPrayerText]}>
              {getPrayerDisplayName(name)}
            </Text>
          </View>
          <Text style={[styles.prayerTime, isNext && styles.nextPrayerText]}>{time}</Text>
        </View>
      </Pressable>
    );
  };

  const completedPrayersCount = prayerLogs?.length || 0;
  const morningDone = adhkarProgress?.some(p => p.dhikrId.startsWith('morning'));
  const eveningDone = adhkarProgress?.some(p => p.dhikrId.startsWith('evening'));
  const hour = DateTime.now().hour;
  const greeting = hour < 12
    ? t.greeting_morning
    : t.greeting_evening;

  return (
    <Container style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.date}>
                {cityName ? `${cityName} · ` : ''}{DateTime.now().setLocale(language === 'ar' ? 'ar' : language === 'ru' ? 'ru' : 'en').toFormat('EEEE, d MMMM')}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/qibla')} style={styles.compassButton}>
            <Ionicons name="compass" size={26} color={colors.primary} />
          </Pressable>
        </View>

        {/* Next Prayer Hero Card */}
        {prayerData ? (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.heroContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || '#1a4c8e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <Text style={styles.nextPrayerLabel}>{t.nextPrayer}</Text>
                <View style={styles.countdownPill}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.countdownPillText}>{countdown}</Text>
                </View>
              </View>
              <Text style={styles.nextPrayerName}>
                {getPrayerDisplayName(prayerData.nextPrayer.name as PrayerName)}
              </Text>
              <Text style={styles.nextPrayerTime}>{prayerData.nextPrayer.time}</Text>
              
              {/* Progress dots */}
              <View style={styles.progressDots}>
                {Object.keys(prayerData.times).map((name) => {
                  const isCompleted = prayerLogs?.some(l => l.prayerName === name);
                  const isNext = prayerData.nextPrayer.name === name;
                  return (
                    <View
                      key={name}
                      style={[
                        styles.progressDot,
                        isCompleted && styles.progressDotDone,
                        isNext && styles.progressDotNext,
                      ]}
                    />
                  );
                })}
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={styles.heroPlaceholder}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Worship Summary */}
        <Animated.View entering={FadeInUp.delay(200)} layout={Layout}>
          <Card style={styles.worshipCard} variant="elevated">
            <View style={styles.worshipHeader}>
              <Ionicons name="ribbon-outline" size={22} color={colors.accent} />
              <Text style={styles.worshipTitle}>{wt.title}</Text>
              <Pressable onPress={() => router.push('/stats')} style={styles.statsLink}>
                <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.worshipContent}>
              <View style={styles.worshipItem}>
                <Text style={styles.worshipLabel}>{wt.prayersCompleted}</Text>
                <Text style={styles.worshipValue}>{completedPrayersCount} {wt.of} 5</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(completedPrayersCount / 5) * 100}%` as any }]} />
                </View>
              </View>
              <View style={styles.worshipDivider} />
              <View style={styles.adhkarProgressContainer}>
                <View style={styles.adhkarStatus}>
                  <Ionicons
                    name={morningDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={morningDone ? colors.success : colors.textTertiary}
                  />
                  <Text style={[styles.adhkarLabel, morningDone && styles.adhkarLabelDone]}>
                    {wt.morningAdhkar}
                  </Text>
                </View>
                <View style={styles.adhkarStatus}>
                  <Ionicons
                    name={eveningDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={eveningDone ? colors.success : colors.textTertiary}
                  />
                  <Text style={[styles.adhkarLabel, eveningDone && styles.adhkarLabelDone]}>
                    {wt.eveningAdhkar}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Prayer Times List */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.prayerList}>
          {prayerData ? (
            Object.entries(prayerData.times).map(([name, time]) => (
              <PrayerRow
                key={name}
                name={name as PrayerName}
                time={time}
                isNext={prayerData.nextPrayer.name === name}
              />
            ))
          ) : (
            <ActivityIndicator size="large" color={colors.primary} style={{ padding: spacing.xl }} />
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.quickActions}>
          <Pressable style={styles.actionCard} onPress={() => router.push('/qibla')}>
            <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.actionCardGradient}>
              <Ionicons name="compass" size={30} color={colors.white} />
              <Text style={styles.actionText}>{t.qibla}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/ramadan')}>
            <LinearGradient colors={[colors.accent || '#F59E0B', '#D97706']} style={styles.actionCardGradient}>
              <Ionicons name="moon" size={30} color={colors.white} />
              <Text style={styles.actionText}>{t.calendar}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/adhkar')}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.actionCardGradient}>
              <Ionicons name="book" size={30} color={colors.white} />
              <Text style={styles.actionText}>{translations[language].adhkar.title}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Container>
  );
}

const getPrayerIcon = (name: PrayerName) => {
  switch (name) {
    case 'Fajr': return 'sunny-outline';
    case 'Sunrise': return 'sunrise-outline';
    case 'Dhuhr': return 'sunny';
    case 'Asr': return 'partly-sunny-outline';
    case 'Maghrib': return 'sunset-outline';
    case 'Isha': return 'moon-outline';
    default: return 'time-outline';
  }
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  compassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: 24,
    ...shadows.lg,
  },
  heroPlaceholder: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextPrayerLabel: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  countdownPillText: {
    ...typography.smallBold,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  nextPrayerName: {
    ...typography.display,
    color: colors.white,
    marginVertical: spacing.xs,
    fontSize: 36,
    fontWeight: '800',
  },
  nextPrayerTime: {
    ...typography.h2,
    color: 'rgba(255,255,255,0.9)',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotDone: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  progressDotNext: {
    backgroundColor: colors.white,
    width: 20,
    borderRadius: 4,
  },
  worshipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  worshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  statsLink: {
    marginLeft: 'auto' as any,
    padding: 4,
  },
  worshipTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  worshipContent: { gap: spacing.md },
  worshipItem: { flex: 1 },
  worshipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  worshipValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  worshipDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  adhkarProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adhkarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  adhkarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  adhkarLabelDone: {
    color: colors.success,
    fontWeight: '600',
  },
  prayerList: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    padding: spacing.sm,
    ...shadows.sm,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  nextPrayerRow: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  nextPrayerText: { color: colors.white },
  prayerTime: {
    ...typography.bodyBold,
    color: colors.text,
  },
  prayerRowPressable: { overflow: 'hidden' },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkCircleNext: {
    borderColor: colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionCard: { flex: 1 },
  actionCardGradient: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    gap: spacing.xs,
    ...shadows.md,
  },
  actionText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});
