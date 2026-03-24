import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, interpolate, withTiming, FadeIn } from 'react-native-reanimated';
import { DateTime } from 'luxon';

const { width } = Dimensions.get('window');

export default function AdhkarDetail() {
  const { id, name } = useLocalSearchParams();
  const { language } = useLanguageStore();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const scale = useSharedValue(1);

  const currentHour = DateTime.now().hour;
  const isMorningTime = currentHour >= 4 && currentHour < 12;
  const isEveningTime = currentHour >= 16 && currentHour < 24;

  const isOutOfTime = (id === 'morning' && !isMorningTime) || (id === 'evening' && !isEveningTime);

  const { data: adhkar = [], isLoading } = useQuery({
    queryKey: ['adhkar', id],
    queryFn: async () => {
      return await blink.db.adhkar.list({
        where: { categoryId: id as string }
      });
    }
  });

  const progressMutation = useMutation({
    mutationFn: async ({ dhikrId, count }: { dhikrId: string, count: number }) => {
      const { user } = await blink.auth.getUser();
      if (!user) return;
      return await blink.db.adhkarProgress.create({
        userId: user.id,
        dhikrId,
        count,
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  const handlePress = async () => {
    const currentDhikr = adhkar[currentIndex];
    if (!currentDhikr) return;

    const currentCount = (counts[currentDhikr.id] || 0) + 1;
    const target = Number(currentDhikr.targetCount);
    
    if (currentCount <= target) {
      setCounts(prev => ({ ...prev, [currentDhikr.id]: currentCount }));

      // Haptic feedback
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Animation
      scale.value = withSpring(0.9, { damping: 10, stiffness: 100 }, () => {
        scale.value = withSpring(1);
      });

      if (currentCount === target) {
        // Finished this dhikr
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Save progress
        progressMutation.mutate({ dhikrId: currentDhikr.id, count: currentCount });

        // Move to next if available
        if (currentIndex < adhkar.length - 1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
          }, 800);
        }
      }
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const currentCount = counts[item.id] || 0;
    const target = Number(item.targetCount);
    const progress = Math.min(currentCount / target, 1);

    return (
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.arabic}>{item.textAr}</Text>
          {item.transliteration && (
            <Text style={styles.transliteration}>{item.transliteration}</Text>
          )}
          <Text style={styles.translation}>
            {language === 'ru' ? item.textRu : language === 'ar' ? item.textAr : item.textEn}
          </Text>
        </View>

        <View style={styles.counterContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.targetCount}>
            {currentCount} / {target}
          </Text>
          
          <Animated.View style={animatedButtonStyle}>
            <Pressable 
              style={[
                styles.counterButton,
                currentCount >= target && styles.counterButtonFinished
              ]} 
              onPress={handlePress}
            >
              <Text style={styles.counterButtonText}>
                {currentCount >= target ? '✓' : currentCount}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{name}</Text>
          {isOutOfTime && (
            <Text style={styles.headerSubtitle}>
              {id === 'morning' 
                ? (language === 'ru' ? 'Рекомендуется утром' : language === 'ar' ? 'موصى به في الصباح' : 'Recommended in the morning')
                : (language === 'ru' ? 'Рекомендуется вечером' : language === 'ar' ? 'موصى به في المساء' : 'Recommended in the evening')
              }
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
  },
  page: {
    width: width,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
    minHeight: 400,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  arabic: {
    ...typography.display,
    fontSize: 32,
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.xl,
    lineHeight: 56,
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
  counterContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  targetCount: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  counterButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 4,
    borderColor: colors.primaryTint,
  },
  counterButtonFinished: {
    backgroundColor: colors.success,
    borderColor: colors.successTint,
  },
  counterButtonText: {
    ...typography.h1,
    color: '#FFFFFF',
    fontSize: 42,
  },
});