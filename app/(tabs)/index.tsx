import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, shadows, iconSize, borderRadius } from '@/constants/design';
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
  const { prayerLogs, adhkarProgress, logPrayer, isPrayersLoading } = useWorship();
  
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocationAndPrayers = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        // Fallback to Moscow if no permission
        const lat = 55.7558;
        const lon = 37.6173;
        setLocation({ lat, lon });
        const data = getPrayerTimes(lat, lon, profile?.calculationMethod as any);
        setPrayerData(data);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      setLocation({ lat, lon });
      
      const data = getPrayerTimes(lat, lon, profile?.calculationMethod as any);
      setPrayerData(data);
    } catch (e) {
      console.error(e);
      setErrorMsg('Error fetching location');
    }
  };

  useEffect(() => {
    fetchLocationAndPrayers();
    
    const interval = setInterval(() => {
      if (location) {
        setPrayerData(getPrayerTimes(location.lat, location.lon, profile?.calculationMethod as any));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [profile?.calculationMethod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocationAndPrayers();
    setRefreshing(false);
  };

  const PrayerRow = ({ name, time, isNext }: { name: PrayerName, time: string, isNext: boolean }) => {
    const isCompleted = prayerLogs?.some(log => log.prayerName === name);
    
    return (
      <Pressable onPress={() => logPrayer.mutate(name)} style={styles.prayerRowPressable}>
        <View style={[styles.prayerRow, isNext && styles.nextPrayerRow]}>
          <View style={styles.prayerInfo}>
            <View style={[
              styles.checkCircle, 
              isCompleted && styles.checkCircleActive,
              isNext && styles.checkCircleNext
            ]}>
              {isCompleted && <Ionicons name="checkmark" size={14} color={isNext ? colors.primary : colors.white} />}
            </View>
            <Ionicons 
              name={getPrayerIcon(name)} 
              size={24} 
              color={isNext ? colors.white : colors.primary} 
              style={{ marginLeft: spacing.sm }}
            />
            <Text style={[styles.prayerName, isNext && styles.nextPrayerText]}>
              {t.prayers?.[name.toLowerCase() as keyof typeof t.prayers] || name}
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

  return (
    <Container style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting(language)}</Text>
            <Text style={styles.date}>{DateTime.now().setLocale(language).toFormat('EEEE, d MMMM')}</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/settings')}>
            <Ionicons name="settings-outline" size={26} color={colors.primary} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInUp.delay(100)} layout={Layout}>
          <Card style={styles.worshipCard} variant="elevated">
            <View style={styles.worshipHeader}>
              <Ionicons name="ribbon-outline" size={24} color={colors.accent} />
              <Text style={styles.worshipTitle}>{wt.title}</Text>
            </View>
            
            <View style={styles.worshipContent}>
              <View style={styles.worshipItem}>
                <Text style={styles.worshipLabel}>{wt.prayersCompleted}</Text>
                <Text style={styles.worshipValue}>{completedPrayersCount} {wt.of} 5</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(completedPrayersCount / 5) * 100}%` }]} />
                </View>
              </View>

              <View style={styles.worshipDivider} />

              <View style={styles.adhkarProgressContainer}>
                <View style={styles.adhkarStatus}>
                  <Ionicons 
                    name={morningDone ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={morningDone ? colors.success : colors.textTertiary} 
                  />
                  <Text style={[styles.adhkarLabel, morningDone && styles.adhkarLabelDone]}>
                    {wt.morningAdhkar}
                  </Text>
                </View>
                <View style={styles.adhkarStatus}>
                  <Ionicons 
                    name={eveningDone ? "checkmark-circle" : "ellipse-outline"} 
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

        {prayerData && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.heroCard}>
            <View style={styles.nextPrayerContainer}>
              <Text style={styles.nextPrayerLabel}>{t.nextPrayer}</Text>
              <Text style={styles.nextPrayerName}>
                {t.prayers?.[prayerData.nextPrayer.name.toLowerCase() as keyof typeof t.prayers] || prayerData.nextPrayer.name}
              </Text>
              <Text style={styles.nextPrayerTime}>{prayerData.nextPrayer.time}</Text>
              <View style={styles.countdownContainer}>
                <Ionicons name="time-outline" size={16} color={colors.white} />
                <Text style={styles.countdownText}>{prayerData.nextPrayer.countdown} {t.remaining}</Text>
              </View>
            </View>
          </Animated.View>
        )}

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

        <View style={styles.quickActions}>
          <Pressable style={styles.actionCard} onPress={() => router.push('/qibla')}>
            <Card style={styles.actionCardInner} variant="elevated">
              <View style={styles.iconContainer}>
                <Ionicons name="compass" size={32} color={colors.white} />
              </View>
              <Text style={styles.actionText}>{t.qibla || 'Qibla'}</Text>
            </Card>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/ramadan')}>
            <Card style={styles.actionCardInner} variant="elevated">
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <Ionicons name="moon" size={32} color={colors.white} />
              </View>
              <Text style={styles.actionText}>{t.calendar || 'Ramadan'}</Text>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </Container>
  );
}

const getGreeting = (lang: string) => {
  const hour = DateTime.now().hour;
  if (lang === 'ar') {
    if (hour < 12) return 'صباح الخير';
    return 'مساء الخير';
  }
  if (lang === 'ru') {
    if (hour < 12) return 'Доброе утро';
    return 'Добрый вечер';
  }
  if (hour < 12) return 'Good Morning';
  return 'Good Evening';
};

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
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  heroCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: 24,
    ...shadows.lg,
  },
  nextPrayerContainer: {
    alignItems: 'center',
  },
  nextPrayerLabel: {
    ...typography.captionBold,
    color: colors.primaryTint,
    textTransform: 'uppercase',
  },
  nextPrayerName: {
    ...typography.display,
    color: colors.white,
    marginVertical: spacing.xs,
  },
  nextPrayerTime: {
    ...typography.h2,
    color: colors.white,
    opacity: 0.9,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  countdownText: {
    ...typography.smallBold,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  prayerList: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    padding: spacing.md,
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
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.md,
  },
  nextPrayerText: {
    color: colors.white,
  },
  prayerTime: {
    ...typography.bodyBold,
    color: colors.text,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
  },
  actionCardInner: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  prayerRowPressable: {
    overflow: 'hidden',
  },
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
    backgroundColor: colors.white,
  },
  worshipCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  worshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  worshipTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  worshipContent: {
    gap: spacing.md,
  },
  worshipItem: {
    flex: 1,
  },
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
