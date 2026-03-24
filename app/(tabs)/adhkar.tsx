import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_COLORS: Record<string, [string, string]> = {
  morning: ['#F59E0B', '#D97706'],
  evening: ['#7C3AED', '#5B21B6'],
  after_prayer: ['#065F46', '#064E3B'],
  sleep: ['#1E40AF', '#1E3A8A'],
  wakeup: ['#0891B2', '#0E7490'],
  tasbih: ['#059669', '#047857'],
  ramadan: ['#DC2626', '#B91C1C'],
};

const CATEGORY_ICONS: Record<string, string> = {
  morning: 'sunny-outline',
  evening: 'moon-outline',
  after_prayer: 'checkmark-circle-outline',
  sleep: 'bed-outline',
  wakeup: 'alarm-outline',
  tasbih: 'infinite-outline',
  ramadan: 'star-outline',
};

export default function Adhkar() {
  const { language } = useLanguageStore();
  const t = translations[language].adhkar;
  const router = useRouter();

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;

  const { data: categories, isLoading } = useQuery({
    queryKey: ['adhkar_categories'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('adhkar_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get counts for each category
      const counts = await Promise.all(
        (cats || []).map(async (cat) => {
          const { count } = await supabase
            .from('adhkar')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);
          return { id: cat.id, count: count || 0 };
        })
      );

      return (cats || []).map(cat => ({
        id: cat.id,
        nameRu: cat.name_ru,
        nameAr: cat.name_ar,
        nameEn: cat.name_en,
        sortOrder: cat.sort_order,
        count: counts.find(c => c.id === cat.id)?.count || 0,
      }));
    },
  });

  const getCategoryName = (item: any) => {
    if (language === 'ru') return item.nameRu;
    if (language === 'ar') return item.nameAr;
    return item.nameEn;
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.subtitle}>
        {language === 'ru'
          ? 'Выберите категорию азкаров'
          : language === 'ar'
          ? 'اختر فئة الأذكار'
          : 'Choose a category'}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isRecommended =
      (item.id === 'morning' && isMorningTime) ||
      (item.id === 'evening' && isEveningTime);
    const gradient = CATEGORY_COLORS[item.id] || [colors.primary, colors.primaryDark];
    const icon = CATEGORY_ICONS[item.id] || 'star-outline';

    return (
      <Animated.View entering={FadeInUp.delay(index * 70)}>
        <Pressable
          style={[styles.card, isRecommended && styles.recommendedCard]}
          onPress={() =>
            router.push({
              pathname: '/adhkar/[id]',
              params: { id: item.id, name: getCategoryName(item) },
            })
          }
        >
          <LinearGradient colors={gradient} style={styles.iconContainer}>
            <Ionicons name={icon as any} size={26} color={colors.white} />
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{getCategoryName(item)}</Text>
              {isRecommended && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {language === 'ru' ? 'Сейчас' : language === 'ar' ? 'الآن' : 'Now'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSubtitle}>
              {item.count}{' '}
              {t.countSuffix}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={56} color={colors.border} />
        <Text style={styles.emptyText}>
          {language === 'ru' ? 'Нет категорий' : language === 'ar' ? 'لا توجد فئات' : 'No categories'}
        </Text>
      </View>
    );
  };

  return (
    <Container style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    padding: 0,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxxl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 20,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  recommendedCard: {
    borderColor: colors.primaryLight,
    borderWidth: 2,
    ...shadows.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
