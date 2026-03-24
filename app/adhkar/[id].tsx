import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, Pressable, Platform,
  ActivityIndicator, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
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

const { width } = Dimensions.get('window');

export default function AdhkarDetail() {
  const { id, name } = useLocalSearchParams();
  const { language } = useLanguageStore();
  const { user } = useProfile();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;
  const isOutOfTime = (id === 'morning' && !isMorningTime) || (id === 'evening' && !isEveningTime);

  const { logAdhkar } = useWorship();

  const { data: adhkar = [], isLoading } = useQuery({
    queryKey: ['adhkar', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adhkar')
        .select('*')
        .eq('category_id', id as string)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
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

      // Button scale animation
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

  const handleShare = async (item: any) => {
    const text = `${item.textAr}\n\n${language === 'ru' ? item.textRu : item.textEn}`;
    try {
      await Share.share({ message: text });
    } catch {}
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const totalCompleted = adhkar.filter(d => completedIds.has(d.id)).length;
  const totalProgress = adhkar.length > 0 ? totalCompleted / adhkar.length : 0;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const currentCount = counts[item.id] || 0;
    const target = Number(item.targetCount);
    const progress = Math.min(currentCount / target, 1);
    const isCompleted = completedIds.has(item.id);
    const isCurrent = currentIndex === index;

    return (
      <View style={styles.page}>
        {/* Number indicator */}
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>{index + 1} / {adhkar.length}</Text>
        </View>

        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
          {/* Arabic Text */}
          <Text style={[styles.arabic, isCompleted && styles.arabicCompleted]}>
            {item.textAr}
          </Text>

          {/* Transliteration */}
          {item.transliteration && (
            <Text style={styles.transliteration}>{item.transliteration}</Text>
          )}

          {/* Translation */}
          <Text style={styles.translation}>
            {language === 'ru' ? item.textRu : language === 'ar' ? item.textAr : item.textEn}
          </Text>

          {/* Source */}
          {item.source && (
            <View style={styles.sourceRow}>
              <Ionicons name="book-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.sourceText}>{item.source}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            <Pressable onPress={() => handleReset(item.id)} style={styles.actionBtn}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => handleShare(item)} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Counter Area */}
        <View style={styles.counterContainer}>
          {/* Progress Bar */}
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%` as any,
                  backgroundColor: isCompleted ? colors.success : colors.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.targetCount, isCompleted && { color: colors.success }]}>
            {currentCount} / {target}
          </Text>

          <Animated.View style={animatedButtonStyle}>
            <Pressable
              style={[
                styles.counterButton,
                isCompleted && styles.counterButtonFinished,
              ]}
              onPress={isCurrent ? handlePress : undefined}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={52} color={colors.white} />
              ) : (
                <Text style={styles.counterButtonText}>{currentCount}</Text>
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
    <Container style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          {isOutOfTime && (
            <Text style={styles.headerSubtitle}>
              {id === 'morning'
                ? (language === 'ru' ? 'Утренние (до полудня)' : language === 'ar' ? 'صباحي (قبل الظهر)' : 'Morning (before noon)')
                : (language === 'ru' ? 'Вечерние (после 16:00)' : language === 'ar' ? 'مسائي (بعد الساعة 4)' : 'Evening (after 4 PM)')}
            </Text>
          )}
        </View>
        {/* Overall progress */}
        <View style={styles.headerProgress}>
          <Text style={styles.headerProgressText}>{totalCompleted}/{adhkar.length}</Text>
        </View>
      </LinearGradient>

      {/* Overall progress bar */}
      <View style={styles.overallProgressBg}>
        <View style={[styles.overallProgressFill, { width: `${totalProgress * 100}%` as any }]} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : adhkar.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="book-outline" size={48} color={colors.border} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
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
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerProgress: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    minWidth: 40,
    alignItems: 'center',
  },
  headerProgressText: {
    ...typography.captionBold,
    color: colors.white,
  },
  overallProgressBg: {
    height: 3,
    backgroundColor: colors.borderLight,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    width: 40,
  },
  page: {
    width,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  pageIndicator: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pageIndicatorText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
    minHeight: 280,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardCompleted: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  arabic: {
    fontSize: 28,
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.lg,
    lineHeight: 50,
    fontWeight: '600',
  },
  arabicCompleted: {
    color: colors.success,
  },
  transliteration: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  translation: {
    ...typography.body,
    textAlign: 'center',
    color: colors.text,
    lineHeight: 24,
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
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  targetCount: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontVariant: ['tabular-nums'],
  },
  counterButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 4,
    borderColor: colors.primaryTint,
  },
  counterButtonFinished: {
    backgroundColor: colors.success,
    borderColor: '#BBF7D0',
  },
  counterButtonText: {
    ...typography.display,
    color: colors.white,
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
