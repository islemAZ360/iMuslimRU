import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, Pressable, Platform,
  ActivityIndicator, Share, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWorship } from '@/hooks/useWorship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming, FadeIn,
} from 'react-native-reanimated';
import { DateTime } from 'luxon';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/hooks/useProfile';
import { getAdhkarByCategory, LocalAdhkar } from '@/constants/adhkar-data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdhkarDetail() {
  const { id, name } = useLocalSearchParams();
  const { language } = useLanguageStore();
  const { user } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const scale = useSharedValue(1);

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;
  const isOutOfTime = (id === 'morning' && !isMorningTime) || (id === 'evening' && !isEveningTime);

  const { logAdhkar } = useWorship();

  const { data: adhkar = [], isLoading } = useQuery<LocalAdhkar[]>({
    queryKey: ['adhkar', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('adhkar')
          .select('*')
          .eq('category_id', id as string)
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          return getAdhkarByCategory(id as string);
        }

        return data.map((item: any) => ({
          id: item.id,
          categoryId: item.category_id,
          textAr: item.text_ar,
          textRu: item.text_ru,
          textEn: item.text_en,
          transliteration: item.transliteration,
          source: item.source,
          targetCount: item.target_count,
          sortOrder: item.sort_order,
        }));
      } catch {
        return getAdhkarByCategory(id as string);
      }
    },
  });

  const progressMutation = useMutation({
    mutationFn: async ({ dhikrId, count }: { dhikrId: string; count: number }) => {
      if (!user) return;
      return logAdhkar.mutateAsync({ dhikrId, count });
    },
  });

  const handlePress = async () => {
    const currentDhikr = adhkar[currentIndex];
    if (!currentDhikr) return;

    const currentCount = (counts[currentDhikr.id] || 0) + 1;
    const target = Number(currentDhikr.targetCount);

    if (currentCount <= target) {
      setCounts(prev => ({ ...prev, [currentDhikr.id]: currentCount }));

      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      scale.value = withSequence(
        withSpring(0.88, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );

      if (currentCount === target) {
        setCompletedIds(prev => new Set([...prev, currentDhikr.id]));
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        progressMutation.mutate({ dhikrId: currentDhikr.id, count: currentCount });

        if (currentIndex < adhkar.length - 1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
          }, 900);
        }
      }
    }
  };

  const handleReset = (dhikrId: string) => {
    setCounts(prev => ({ ...prev, [dhikrId]: 0 }));
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(dhikrId);
      return next;
    });
  };

  const handleShare = async (item: LocalAdhkar) => {
    const text = `${item.textAr}\n\n${language === 'ru' ? item.textRu : item.textEn}`;
    try {
      await Share.share({ message: text });
    } catch { /* silent */ }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const totalCompleted = adhkar.filter(d => completedIds.has(d.id)).length;
  const totalProgress = adhkar.length > 0 ? totalCompleted / adhkar.length : 0;

  const renderItem = ({ item, index }: { item: LocalAdhkar; index: number }) => {
    const currentCount = counts[item.id] || 0;
    const target = Number(item.targetCount);
    const progress = Math.min(currentCount / target, 1);
    const isCompleted = completedIds.has(item.id);
    const isCurrent = currentIndex === index;

    return (
      <View style={styles.page}>
        {/* Page indicator pill */}
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>{index + 1} / {adhkar.length}</Text>
        </View>

        {/* Dhikr Card */}
        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
          {/* Decorative top border */}
          <LinearGradient
            colors={isCompleted ? ['#059669', '#047857'] : ['#065F46', '#022C22']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardTopBar}
          />

          {/* Arabic text */}
          <Text style={[styles.arabic, isCompleted && styles.arabicCompleted]}>
            {item.textAr}
          </Text>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Transliteration */}
          {item.transliteration ? (
            <Text style={styles.transliteration}>{item.transliteration}</Text>
          ) : null}

          {/* Translation */}
          <Text style={styles.translation}>
            {language === 'ru' ? item.textRu : language === 'ar' ? item.textAr : item.textEn}
          </Text>

          {/* Source */}
          {item.source ? (
            <View style={styles.sourceRow}>
              <Ionicons name="book-outline" size={12} color="rgba(201,168,76,0.5)" />
              <Text style={styles.sourceText}>{item.source}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.cardActions}>
            <Pressable onPress={() => handleReset(item.id)} style={styles.actionBtn}>
              <Ionicons name="refresh-outline" size={16} color="#B8A98A" />
            </Pressable>
            <Pressable onPress={() => handleShare(item)} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={16} color="#B8A98A" />
            </Pressable>
          </View>
        </View>

        {/* Counter Area */}
        <View style={styles.counterContainer}>
          {/* Progress bar */}
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%` as any,
                  backgroundColor: isCompleted ? '#059669' : '#C9A84C',
                },
              ]}
            />
          </View>

          <Text style={[styles.targetCount, isCompleted && styles.targetCountDone]}>
            {currentCount} / {target}
          </Text>

          <Animated.View style={animatedButtonStyle}>
            <Pressable
              style={[styles.counterButton, isCompleted && styles.counterButtonDone]}
              onPress={isCurrent ? handlePress : undefined}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={styles.counterButtonGradient}
                >
                  <Ionicons name="checkmark" size={52} color="#E8D48B" />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#065F46', '#022C22']}
                  style={styles.counterButtonGradient}
                >
                  <Text style={styles.counterButtonText}>{currentCount}</Text>
                </LinearGradient>
              )}
            </Pressable>
          </Animated.View>

          {!isCompleted && (
            <Text style={styles.tapHint}>
              {language === 'ru' ? 'Нажмите для счёта' : language === 'ar' ? 'اضغط للعدّ' : 'Tap to count'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />

      {/* Header */}
      <LinearGradient
        colors={['#022C22', '#064E3B']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#E8D48B" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          {isOutOfTime && (
            <Text style={styles.headerSubtitle}>
              {id === 'morning'
                ? (language === 'ru' ? 'Утренние (до полудня)' : 'Morning (before noon)')
                : (language === 'ru' ? 'Вечерние (после 16:00)' : 'Evening (after 4 PM)')}
            </Text>
          )}
        </View>

        {/* Progress pill */}
        <View style={styles.headerProgress}>
          <Text style={styles.headerProgressText}>{totalCompleted}/{adhkar.length}</Text>
        </View>
      </LinearGradient>

      {/* Overall progress bar */}
      <View style={styles.overallProgressBg}>
        <Animated.View
          style={[
            styles.overallProgressFill,
            { width: `${totalProgress * 100}%` as any },
          ]}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      ) : adhkar.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={48} color="rgba(201,168,76,0.3)" />
          <Text style={styles.emptyText}>
            {language === 'ru' ? 'Нет азкаров' : language === 'ar' ? 'لا توجد أذكار' : 'No adhkar found'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={adhkar}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: '#E8D48B',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.tiny,
    color: 'rgba(232,212,139,0.6)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerProgress: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    minWidth: 44,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  headerProgressText: {
    ...typography.captionBold,
    color: '#C9A84C',
  },

  // ── Overall progress bar ──────────────────────────────────────────────────
  overallProgressBg: {
    height: 2,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#C9A84C',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // ── Page ─────────────────────────────────────────────────────────────────
  page: {
    width,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  pageIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(201,168,76,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  pageIndicatorText: {
    ...typography.captionBold,
    color: '#C9A84C',
  },

  // ── Dhikr Card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#111827',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    overflow: 'hidden',
    minHeight: 280,
    justifyContent: 'center',
  },
  cardCompleted: {
    borderColor: 'rgba(5,150,105,0.5)',
    backgroundColor: 'rgba(5,150,105,0.08)',
  },
  cardTopBar: {
    height: 2,
    borderRadius: 1,
    marginBottom: spacing.lg,
  },
  arabic: {
    fontSize: 30,
    textAlign: 'center',
    color: '#C9A84C',
    marginBottom: spacing.md,
    lineHeight: 54,
    fontWeight: '600',
    letterSpacing: 1,
  },
  arabicCompleted: {
    color: '#059669',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.1)',
    marginBottom: spacing.md,
  },
  transliteration: {
    ...typography.caption,
    textAlign: 'center',
    color: '#B8A98A',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  translation: {
    ...typography.body,
    textAlign: 'center',
    color: '#F5F0E8',
    lineHeight: 26,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  sourceText: {
    ...typography.tiny,
    color: 'rgba(201,168,76,0.5)',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(201,168,76,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
  },

  // ── Counter ───────────────────────────────────────────────────────────────
  counterContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  targetCount: {
    ...typography.h2,
    color: 'rgba(201,168,76,0.6)',
    marginBottom: spacing.lg,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  targetCountDone: {
    color: '#059669',
  },
  counterButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.4)',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  counterButtonDone: {
    borderColor: 'rgba(5,150,105,0.5)',
    shadowColor: '#059669',
  },
  counterButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    ...typography.display,
    color: '#C9A84C',
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tapHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
