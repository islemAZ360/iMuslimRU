import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { DateTime } from 'luxon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function Stats() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const wt = t.worship;
  const st = t.stats;
  const { user } = useProfile();
  const router = useRouter();

  const today = DateTime.now();
  const weekStart = today.startOf('week');

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    weekStart.plus({ days: i }).toFormat('yyyy-MM-dd')
  );

  const { data: prayerLogs, isLoading: prayerLoading } = useQuery({
    queryKey: ['prayerLogsAll', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: adhkarLogs } = useQuery({
    queryKey: ['adhkarProgressAll', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('adhkar_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: fastingLogs } = useQuery({
    queryKey: ['fastingAll', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('fasting_days')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: scanLogs } = useQuery({
    queryKey: ['scanLogsAll', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('halal_scans')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!prayerLogs) return null;

    // Weekly prayer data (prayers per day this week)
    const weeklyPrayers = last7Days.map(date => {
      const count = prayerLogs.filter(l => l.date === date).length;
      return { date, count };
    });

    // Total prayers
    const totalPrayers = prayerLogs.length;

    // Streak calculation
    let streak = 0;
    let checkDate = DateTime.now();
    while (true) {
      const dateStr = checkDate.toFormat('yyyy-MM-dd');
      const dayCount = prayerLogs.filter(l => l.date === dateStr).length;
      if (dayCount >= 5) {
        streak++;
        checkDate = checkDate.minus({ days: 1 });
      } else {
        break;
      }
    }

    // Best streak (simplified: just show current for now)
    const completionRate = totalPrayers > 0
      ? Math.round((totalPrayers / Math.max(1, Object.keys(
          prayerLogs.reduce((acc: any, l) => { acc[l.date] = true; return acc; }, {})
        ).length * 5)) * 100)
      : 0;

    return {
      weeklyPrayers,
      totalPrayers,
      streak,
      completionRate,
      totalAdhkar: adhkarLogs?.length || 0,
      totalFasting: fastingLogs?.filter((f: any) => f.fasted === true).length || 0,
      totalScans: scanLogs?.length || 0,
    };
  }, [prayerLogs, adhkarLogs, fastingLogs, scanLogs]);

  const getWeekDayLabel = (dateStr: string) => {
    const dt = DateTime.fromISO(dateStr);
    const dayNames = wt.days;
    const map: Record<number, string> = {
      1: dayNames.mon, 2: dayNames.tue, 3: dayNames.wed,
      4: dayNames.thu, 5: dayNames.fri, 6: dayNames.sat, 7: dayNames.sun,
    };
    return map[dt.weekday] || '';
  };

  const maxWeeklyPrayers = Math.max(...(stats?.weeklyPrayers.map(d => d.count) || [1]), 1);

  return (
    <Container style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{st.title}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {prayerLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {/* Summary Cards */}
            <Animated.View entering={FadeInUp.delay(50)}>
              <View style={styles.summaryGrid}>
                <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
                  <Ionicons name="star" size={22} color={colors.white} />
                  <Text style={styles.summaryValue}>{stats?.streak || 0}</Text>
                  <Text style={styles.summaryLabel}>{wt.streak}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.white} />
                  <Text style={styles.summaryValue}>{stats?.totalPrayers || 0}</Text>
                  <Text style={styles.summaryLabel}>{st.prayers}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#F59E0B' }]}>
                  <Ionicons name="moon" size={22} color={colors.white} />
                  <Text style={styles.summaryValue}>{stats?.totalFasting || 0}</Text>
                  <Text style={styles.summaryLabel}>{st.fasting}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="scan" size={22} color={colors.white} />
                  <Text style={styles.summaryValue}>{stats?.totalScans || 0}</Text>
                  <Text style={styles.summaryLabel}>{st.scans}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Weekly Prayer Chart */}
            <Animated.View entering={FadeInUp.delay(100)}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>{st.thisWeek} — {st.prayers}</Text>
                </View>
                <View style={styles.chartBars}>
                  {stats?.weeklyPrayers.map((day, i) => {
                    const pct = (day.count / Math.max(maxWeeklyPrayers, 5)) * 100;
                    const isToday = day.date === today.toFormat('yyyy-MM-dd');
                    return (
                      <View key={day.date} style={styles.barColumn}>
                        <Text style={styles.barValue}>{day.count || ''}</Text>
                        <View style={styles.barBg}>
                          <LinearGradient
                            colors={isToday ? [colors.primary, '#1565C0'] : ['#93C5FD', '#BFDBFE']}
                            style={[styles.barFill, { height: `${Math.max(pct, day.count > 0 ? 10 : 0)}%` as any }]}
                          />
                        </View>
                        <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                          {getWeekDayLabel(day.date)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Scale labels */}
                <View style={styles.scaleRow}>
                  {[5, 4, 3, 2, 1].map(n => (
                    <Text key={n} style={styles.scaleLabel}>{n} ✓</Text>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Completion Rate */}
            <Animated.View entering={FadeInUp.delay(150)}>
              <View style={styles.completionCard}>
                <View style={styles.completionHeader}>
                  <Ionicons name="trophy-outline" size={20} color={colors.accent} />
                  <Text style={styles.completionTitle}>{wt.completionRate}</Text>
                  <Text style={styles.completionPct}>{stats?.completionRate || 0}%</Text>
                </View>
                <View style={styles.completionBarBg}>
                  <LinearGradient
                    colors={[colors.primary, '#1565C0']}
                    style={[styles.completionBarFill, { width: `${stats?.completionRate || 0}%` as any }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Prayer breakdown */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>
                  {language === 'ru' ? 'Намазы сегодня' : language === 'ar' ? 'الصلوات اليوم' : 'Prayers Today'}
                </Text>
                <View style={styles.prayerGrid}>
                  {PRAYER_NAMES.map(pName => {
                    const done = prayerLogs?.some(
                      (l: any) => l.prayer_name === pName && l.date === today.toFormat('yyyy-MM-dd')
                    );
                    const prayerT = t.home.prayers;
                    const label = prayerT[pName.toLowerCase() as keyof typeof prayerT] || pName;
                    return (
                      <View key={pName} style={[styles.prayerDot, done && styles.prayerDotDone]}>
                        <Ionicons
                          name={done ? 'checkmark' : 'ellipse-outline'}
                          size={14}
                          color={done ? colors.white : colors.textTertiary}
                        />
                        <Text style={[styles.prayerDotLabel, done && styles.prayerDotLabelDone]}>
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* Adhkar stats */}
            <Animated.View entering={FadeInUp.delay(250)}>
              <View style={styles.adhkarStatCard}>
                <Ionicons name="book-outline" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.adhkarStatTitle}>{st.adhkar}</Text>
                  <Text style={styles.adhkarStatValue}>
                    {stats?.totalAdhkar || 0} {language === 'ru' ? 'сессий' : language === 'ar' ? 'جلسة' : 'sessions'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Animated.View>
          </>
        )}

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  backButton: {
    padding: spacing.sm,
    width: 40,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.md,
  },
  summaryValue: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '800',
    fontSize: 28,
  },
  summaryLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barValue: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginBottom: 2,
    fontWeight: '700',
  },
  barBg: {
    width: '100%',
    height: 90,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  barLabelToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  scaleLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  completionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  completionTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
    fontWeight: '700',
  },
  completionPct: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  completionBarBg: {
    height: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 8,
  },
  breakdownCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  breakdownTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  prayerDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  prayerDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prayerDotLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  prayerDotLabelDone: {
    color: colors.white,
  },
  adhkarStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  adhkarStatTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  adhkarStatValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
