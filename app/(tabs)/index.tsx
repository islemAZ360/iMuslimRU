import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Container, Card } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing, shadows, borderRadius } from '@/constants/design';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { blink } from '@/lib/blink';
import { useBlinkAuth } from '@blinkdotnew/react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function PrayerTimesScreen() {
  const { t } = useI18n();
  const { user } = useBlinkAuth();
  const queryClient = useQueryClient();
  const { data, location, errorMsg } = usePrayerTimes();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data: donePrayers } = useQuery({
    queryKey: ['done_prayers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      const stats = await blink.db.worshipStats.list({
        where: { 
          userId: user.id, 
          type: 'prayer',
          completedAt: { gte: today }
        }
      });
      return stats.map(s => s.name);
    },
    enabled: !!user,
  });

  const markAsDone = async (prayerId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to track your prayer stats.');
      return;
    }
    if (donePrayers?.includes(prayerId)) return;

    setMarkingId(prayerId);
    try {
      await blink.db.worshipStats.create({
        userId: user.id,
        type: 'prayer',
        name: prayerId,
        count: 1
      });
      queryClient.invalidateQueries({ queryKey: ['done_prayers'] });
      queryClient.invalidateQueries({ queryKey: ['worship_stats'] });
    } catch (error) {
      console.error('Failed to mark prayer as done:', error);
    } finally {
      setMarkingId(null);
    }
  };

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
          {prayers.map((prayer) => {
            const isDone = donePrayers?.includes(prayer.id);
            const isCurrent = data?.currentPrayer === prayer.id;

            return (
              <Card
                key={prayer.id}
                variant="elevated"
                style={[
                  styles.prayerCard,
                  isCurrent && styles.activePrayerCard,
                  isDone && styles.donePrayerCard
                ]}
              >
                <Card.Content style={styles.prayerContent}>
                  <View style={styles.prayerInfo}>
                    <Pressable 
                      onPress={() => markAsDone(prayer.id)}
                      disabled={isDone || markingId === prayer.id}
                      style={[styles.checkBtn, isDone && styles.checkBtnActive]}
                    >
                      {markingId === prayer.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons 
                          name={isDone ? "checkmark-circle" : "ellipse-outline"} 
                          size={28} 
                          color={isDone ? colors.success : colors.borderDark} 
                        />
                      )}
                    </Pressable>
                    <View>
                      <Text style={[
                        styles.prayerLabel,
                        isCurrent && styles.activePrayerText,
                        isDone && styles.doneText
                      ]}>
                        {prayer.label}
                      </Text>
                      <View style={styles.timeRow}>
                        <Ionicons 
                          name={prayer.icon as any} 
                          size={14} 
                          color={isCurrent ? colors.primary : colors.textTertiary} 
                        />
                        <Text style={[
                          styles.prayerTime,
                          isCurrent && styles.activePrayerText,
                          isDone && styles.doneText
                        ]}>
                          {prayer.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {isDone && (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>DONE</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })}
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
  donePrayerCard: {
    opacity: 0.8,
  },
  prayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkBtn: {
    padding: spacing.xs,
  },
  checkBtnActive: {
    // scale effect?
  },
  prayerLabel: {
    ...typography.h3,
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  prayerTime: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  activePrayerText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  doneText: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  doneBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  doneBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
    color: colors.successDark,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
