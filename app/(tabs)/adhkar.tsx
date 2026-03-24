import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/design';
import { ADHKAR_DATA, Adhkar } from '@/constants/adhkar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AdhkarScreen() {
  const { t, language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');

  const categories = [
    { id: 'morning', label: t('morningAdhkar'), icon: 'sunny' },
    { id: 'evening', label: t('eveningAdhkar'), icon: 'moon' },
    { id: 'after_prayer', label: t('afterPrayer'), icon: 'hand-left' },
    { id: 'sleep', label: t('sleepAdhkar'), icon: 'bed' },
  ];

  const filteredAdhkar = ADHKAR_DATA.filter(a => a.category === selectedCategory);

  const renderAdhkarItem = ({ item }: { item: Adhkar }) => (
    <Card variant="elevated" style={styles.adhkarCard}>
      <Card.Content>
        <Text style={styles.adhkarArabic}>{item.text}</Text>
        <Text style={styles.adhkarTranslation}>
          {language === 'ru' ? item.translation_ru : item.translation_en}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>0 / {item.count}</Text>
          </View>
          <Pressable style={styles.tasbihButton}>
            <Ionicons name="finger-print" size={24} color={colors.white} />
          </Pressable>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Container safeArea edges={['bottom']} padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('adhkar')}</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedCategory(item.id)}
            style={[
              styles.categoryItem,
              selectedCategory === item.id && styles.selectedCategoryItem
            ]}
          >
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={selectedCategory === item.id ? colors.white : colors.textSecondary} 
            />
            <Text style={[
              styles.categoryLabel,
              selectedCategory === item.id && styles.selectedCategoryLabel
            ]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={filteredAdhkar}
        keyExtractor={(item) => item.id}
        renderItem={renderAdhkarItem}
        contentContainerStyle={styles.adhkarList}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  categoryList: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  selectedCategoryLabel: {
    color: colors.white,
  },
  adhkarList: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  adhkarCard: {
    borderRadius: borderRadius.xl,
  },
  adhkarArabic: {
    fontSize: 22,
    lineHeight: 38,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
  },
  adhkarTranslation: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countText: {
    ...typography.smallBold,
    color: colors.primary,
  },
  tasbihButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});
