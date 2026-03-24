import { View, Text, StyleSheet, FlatList, Pressable, Animated as RNAnimated } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { useQuery } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Adhkar() {
  const { language } = useLanguageStore();
  const t = translations[language].adhkar;
  const router = useRouter();

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;

  const { data: categories } = useQuery({
    queryKey: ['adhkar_categories'],
    queryFn: async () => {
      const categories = await blink.db.adhkarCategories.list();
      // Fetch counts for each category
      const counts = await Promise.all(
        categories.map(async (cat) => {
          const count = await blink.db.adhkar.count({
            where: { categoryId: cat.id }
          });
          return { id: cat.id, count };
        })
      );
      return categories.map(cat => ({
        ...cat,
        count: counts.find(c => c.id === cat.id)?.count || 0
      }));
    },
  });

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isRecommended = (item.id === 'morning' && isMorningTime) || (item.id === 'evening' && isEveningTime);
    
    return (
      <Animated.View entering={FadeInUp.delay(index * 100)}>
        <Pressable 
          style={[styles.card, isRecommended && styles.recommendedCard]}
          onPress={() => router.push({
            pathname: '/adhkar/[id]',
            params: { 
              id: item.id,
              name: language === 'ru' ? item.nameRu : language === 'ar' ? item.nameAr : item.nameEn
            }
          })}
        >
          <View style={[styles.iconContainer, isRecommended && styles.recommendedIconContainer]}>
            <Ionicons 
              name={item.icon || 'star'} 
              size={24} 
              color={isRecommended ? colors.white : colors.primary} 
            />
          </View>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>
                {language === 'ru' ? item.nameRu : language === 'ar' ? item.nameAr : item.nameEn}
              </Text>
              {isRecommended && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{language === 'ru' ? 'Рекомендуется' : language === 'ar' ? 'موصى به' : 'Recommended'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSubtitle}>
              {item.count} {t.countSuffix || (language === 'ru' ? 'зикров' : language === 'ar' ? 'أذكار' : 'dhikrs')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isRecommended ? colors.primary : colors.textTertiary} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 20,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recommendedCard: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryTint,
    ...shadows.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recommendedIconContainer: {
    backgroundColor: colors.primary,
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
    fontWeight: '600',
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});