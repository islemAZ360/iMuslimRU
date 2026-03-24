import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, StatusBar,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getEnrichedCategories, getAdhkarByCategory, LocalAdhkarCategory } from '@/constants/adhkar-data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  morning:          ['#065F46', '#022C22'],
  evening:          ['#064E3B', '#022C22'],
  after_prayer:     ['#047857', '#065F46'],
  sleep:            ['#022C22', '#0A0A0A'],
  wakeup:           ['#065F46', '#047857'],
  tasbih:           ['#047857', '#022C22'],
  quran_duas:       ['#064E3B', '#065F46'],
  protection:       ['#022C22', '#064E3B'],
  travel:           ['#065F46', '#022C22'],
  food:             ['#A07830', '#C9A84C'],
  entering_home:    ['#047857', '#065F46'],
  entering_mosque:  ['#064E3B', '#022C22'],
  stress:           ['#022C22', '#047857'],
  gratitude:        ['#A07830', '#065F46'],
  istighfar:        ['#064E3B', '#047857'],
};

interface EnrichedCategory extends LocalAdhkarCategory {
  count: number;
}

export default function Adhkar() {
  const { language } = useLanguageStore();
  const t = translations[language].adhkar;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;

  // Fetch from Supabase; fall back to local data if empty
  const { data: categories = [] } = useQuery<EnrichedCategory[]>({
    queryKey: ['adhkar_categories'],
    queryFn: async () => {
      try {
        const { data: cats, error } = await supabase
          .from('adhkar_categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !cats || cats.length === 0) {
          // ── Fallback: local data ──
          return getEnrichedCategories() as EnrichedCategory[];
        }

        const counts = await Promise.all(
          cats.map(async (cat) => {
            const { count } = await supabase
              .from('adhkar')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', cat.id);
            return { id: cat.id, count: count || 0 };
          })
        );

        const remoteData: EnrichedCategory[] = cats.map(cat => ({
          id: cat.id,
          nameRu: cat.name_ru,
          nameAr: cat.name_ar,
          nameEn: cat.name_en,
          icon: cat.icon || 'star-outline',
          sortOrder: cat.sort_order,
          count: counts.find(c => c.id === cat.id)?.count || 0,
        }));

        // If server returns categories but adhkar counts are 0, augment with local counts
        return remoteData.map(cat => {
          if (cat.count === 0) {
            const localCount = getAdhkarByCategory(cat.id).length;
            return { ...cat, count: localCount };
          }
          return cat;
        });
      } catch {
        return getEnrichedCategories() as EnrichedCategory[];
      }
    },
  });

  const getCategoryName = (item: EnrichedCategory) => {
    if (language === 'ru') return item.nameRu;
    if (language === 'ar') return item.nameAr;
    return item.nameEn;
  };

  const totalAdhkar = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  const renderHeader = () => (
    <Animated.View entering={FadeIn.delay(50)}>
      {/* Ornamental header section */}
      <LinearGradient
        colors={['#022C22', '#064E3B', '#0A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
      >
        {/* Decorative stars */}
        <View style={styles.ornamentRow} pointerEvents="none">
          {['✦', '✧', '✦', '✧', '✦'].map((s, i) => (
            <Text key={i} style={[styles.ornamentStar, { opacity: 0.15 + i * 0.05 }]}>{s}</Text>
          ))}
        </View>

        {/* Arabic Title */}
        <Text style={styles.arabicTitle}>موسوعة الأذكار</Text>
        <Text style={styles.screenTitle}>
          {language === 'ru' ? 'Энциклопедия Азкаров' : language === 'ar' ? 'موسوعة الأذكار' : 'Adhkar Encyclopedia'}
        </Text>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>
              {language === 'ru' ? 'разделов' : language === 'ar' ? 'فئة' : 'sections'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalAdhkar}</Text>
            <Text style={styles.statLabel}>
              {language === 'ru' ? 'азкаров' : language === 'ar' ? 'ذكر' : 'adhkar'}
            </Text>
          </View>
        </View>

        {/* Decorative separator */}
        <View style={styles.ornamentLine}>
          <View style={styles.lineSegment} />
          <Text style={styles.lineGem}>◆</Text>
          <View style={styles.lineSegment} />
        </View>
      </LinearGradient>

      <Text style={styles.sectionLabel}>
        {language === 'ru' ? 'Выберите категорию' : language === 'ar' ? 'اختر فئة' : 'Choose a category'}
      </Text>
    </Animated.View>
  );

  const renderItem = ({ item, index }: { item: EnrichedCategory; index: number }) => {
    const isRecommended =
      (item.id === 'morning' && isMorningTime) ||
      (item.id === 'evening' && isEveningTime);
    const gradient = CATEGORY_GRADIENTS[item.id] ?? ['#065F46', '#022C22'];

    return (
      <Animated.View entering={FadeInUp.delay(index * 50)}>
        <Pressable
          style={({ pressed }) => [
            styles.card,
            isRecommended && styles.recommendedCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/adhkar/[id]',
              params: { id: item.id, name: getCategoryName(item) },
            })
          }
        >
          {/* Gold left accent for recommended */}
          {isRecommended && <View style={styles.recommendedAccent} />}

          {/* Icon gradient circle */}
          <LinearGradient colors={gradient} style={styles.iconCircle}>
            <Ionicons name={item.icon as any} size={24} color="#E8D48B" />
          </LinearGradient>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {getCategoryName(item)}
              </Text>
              {isRecommended && (
                <View style={styles.nowBadge}>
                  <Text style={styles.nowBadgeText}>
                    {language === 'ru' ? 'Сейчас' : language === 'ar' ? 'الآن' : 'Now'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.arabicSubtitle}>{item.nameAr}</Text>
            <Text style={styles.countText}>
              {item.count}{' '}
              {language === 'ru'
                ? item.count === 1 ? 'дуа' : item.count < 5 ? 'дуа' : 'дуа'
                : language === 'ar' ? 'ذكر' : 'dhikr'}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={18} color="rgba(201,168,76,0.5)" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  ornamentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  ornamentStar: {
    color: '#C9A84C',
    fontSize: 16,
  },
  arabicTitle: {
    fontSize: 36,
    color: '#C9A84C',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  screenTitle: {
    ...typography.body,
    color: 'rgba(232,212,139,0.7)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C9A84C',
    letterSpacing: -0.3,
  },
  statLabel: {
    ...typography.tiny,
    color: 'rgba(201,168,76,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  ornamentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lineSegment: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  lineGem: {
    color: 'rgba(201,168,76,0.4)',
    fontSize: 12,
  },

  // ── List ─────────────────────────────────────────────────────────────────
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
    gap: spacing.sm,
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)',
    overflow: 'hidden',
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  recommendedCard: {
    borderColor: 'rgba(201,168,76,0.4)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(6,95,70,0.15)',
  },
  recommendedAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#C9A84C',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,212,139,0.2)',
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: '#F5F0E8',
    fontWeight: '700',
    flex: 1,
  },
  arabicSubtitle: {
    fontSize: 13,
    color: '#B8A98A',
    marginBottom: 2,
  },
  countText: {
    ...typography.small,
    color: 'rgba(201,168,76,0.7)',
    fontWeight: '500',
  },
  nowBadge: {
    backgroundColor: '#C9A84C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  nowBadgeText: {
    ...typography.tiny,
    color: '#022C22',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
