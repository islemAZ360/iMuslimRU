import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Container, Card } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing, shadows, borderRadius } from '@/constants/design';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrayerTimesScreen() {
  const { t, language } = useI18n();
  const { data, location, errorMsg } = usePrayerTimes();

  const prayers = [
    { id: 'fajr', label: t('fajr'), time: data?.fajr, icon: 'cloudy-night' },
    { id: 'dhuhr', label: t('dhuhr'), time: data?.dhuhr, icon: 'sunny' },
    { id: 'asr', label: t('asr'), time: data?.asr, icon: 'partly-sunny' },
    { id: 'maghrib', label: t('maghrib'), time: data?.maghrib, icon: 'sunset' },
    { id: 'isha', label: t('isha'), time: data?.isha, icon: 'moon' },
  ];

  if (!data && !errorMsg) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Container safeArea edges={['bottom']} padding="lg" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>{t('welcome')}</Text>
            <Ionicons name="location" size={20} color={colors.accentLight} />
            <Text style={styles.locationText}>Russia</Text>
          </View>
          
          <View style={styles.nextPrayerContainer}>
            <Text style={styles.nextPrayerLabel}>Next Prayer: {data?.nextPrayer.toUpperCase()}</Text>
            <Text style={styles.nextPrayerTime}>{data?.nextPrayerTime}</Text>
          </View>
        </LinearGradient>

        <View style={styles.prayersList}>
          {prayers.map((prayer) => (
            <Card
              key={prayer.id}
              variant="elevated"
              style={[
                styles.prayerCard,
                data?.currentPrayer === prayer.id && styles.activePrayerCard
              ]}
            >
              <Card.Content style={styles.prayerContent}>
                <View style={styles.prayerInfo}>
                  <Ionicons 
                    name={prayer.icon as any} 
                    size={24} 
                    color={data?.currentPrayer === prayer.id ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.prayerLabel,
                    data?.currentPrayer === prayer.id && styles.activePrayerText
                  ]}>
                    {prayer.label}
                  </Text>
                </View>
                <Text style={[
                  styles.prayerTime,
                  data?.currentPrayer === prayer.id && styles.activePrayerText
                ]}>
                  {prayer.time}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {errorMsg && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.white,
    flex: 1,
  },
  locationText: {
    ...typography.smallBold,
    color: colors.accentLight,
    marginLeft: spacing.xs,
  },
  nextPrayerContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  nextPrayerLabel: {
    ...typography.captionBold,
    color: colors.primaryTint,
    textTransform: 'uppercase',
  },
  nextPrayerTime: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
  prayersList: {
    gap: spacing.md,
  },
  prayerCard: {
    borderRadius: borderRadius.xl,
  },
  activePrayerCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  prayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  prayerLabel: {
    ...typography.h3,
    color: colors.text,
  },
  prayerTime: {
    ...typography.h2,
    color: colors.primary,
  },
  activePrayerText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
