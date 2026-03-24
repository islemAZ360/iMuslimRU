import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import { Container } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Coordinates, Qibla } from 'adhan';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { translations } from '@/constants/translations';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width - 64, 300);

export default function QiblaCompass() {
  const { language } = useLanguageStore();
  const t = translations[language].qibla;
  const router = useRouter();

  const [subscription, setSubscription] = useState<any>(null);
  const [qiblaDir, setQiblaDir] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const rotation = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('error');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coordinates = new Coordinates(loc.coords.latitude, loc.coords.longitude);
      const direction = Qibla(coordinates);
      setQiblaDir(direction);
      setLocationStatus('ready');

      if (Platform.OS !== 'web') {
        Magnetometer.setUpdateInterval(100);
        const sub = Magnetometer.addListener((data) => {
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
          const qiblaRotation = direction - angle;
          rotation.value = withSpring(qiblaRotation, { damping: 15, stiffness: 80 });

          // Check if aligned (within ±5 degrees)
          const diff = Math.abs(((qiblaRotation % 360) + 360) % 360);
          setIsAligned(diff < 5 || diff > 355);
        });
        setSubscription(sub);
      } else {
        setLocationStatus('ready');
      }
    })();

    return () => { subscription?.remove(); };
  }, []);

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const CARDINAL_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const CARDINAL_DEGS = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <Container style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, '#1565C0']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        {/* Status indicator */}
        <View style={[styles.statusBadge, isAligned && styles.statusBadgeAligned]}>
          <Ionicons
            name={isAligned ? 'checkmark-circle' : 'compass-outline'}
            size={16}
            color={isAligned ? colors.success : colors.primary}
          />
          <Text style={[styles.statusText, isAligned && styles.statusTextAligned]}>
            {locationStatus === 'loading'
              ? t.calculating
              : isAligned
              ? (language === 'ru' ? 'Направление верное! 🕋' : language === 'ar' ? 'الاتجاه صحيح! 🕋' : 'Aligned! 🕋')
              : t.pointToKaaba}
          </Text>
        </View>

        {/* Compass */}
        <View style={styles.compassWrapper}>
          {/* Outer ring with cardinal directions */}
          <View style={styles.compassOuter}>
            {CARDINAL_DIRS.map((dir, i) => (
              <View
                key={dir}
                style={[
                  styles.cardinalContainer,
                  { transform: [{ rotate: `${CARDINAL_DEGS[i]}deg` }] },
                ]}
              >
                <Text style={[
                  styles.cardinalText,
                  dir === 'N' && styles.cardinalNorth,
                  { transform: [{ rotate: `-${CARDINAL_DEGS[i]}deg` }] },
                ]}>
                  {dir}
                </Text>
              </View>
            ))}

            {/* Degree ticks */}
            {Array.from({ length: 36 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.tick,
                  { transform: [{ rotate: `${i * 10}deg` }] },
                  i % 9 === 0 && styles.majorTick,
                ]}
              />
            ))}
          </View>

          {/* Animated needle pointing to Qibla */}
          <Animated.View style={[styles.needleContainer, compassStyle]}>
            {/* Kaaba icon at top */}
            <View style={styles.kaabaAtTop}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.kaabaBg}
              >
                <Text style={styles.kaabaEmoji}>🕋</Text>
              </LinearGradient>
            </View>

            {/* Needle line */}
            <View style={styles.needleUp} />
            <View style={styles.needleCenter} />
            <View style={styles.needleDown} />
          </Animated.View>

          {/* Center dot */}
          <View style={styles.centerDot} />
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
            <Text style={styles.infoValue}>{Math.round(qiblaDir)}°</Text>
            <Text style={styles.infoLabel}>{t.angleLabel}</Text>
          </View>
          {Platform.OS !== 'web' && (
            <View style={styles.infoCard}>
              <Ionicons name="compass-outline" size={20} color={colors.primary} />
              <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
              <Text style={styles.infoLabel}>
                {language === 'ru' ? 'Азимут' : language === 'ar' ? 'الاتجاه' : 'Heading'}
              </Text>
            </View>
          )}
        </View>

        {/* Instruction */}
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.instructionText}>{t.instruction}</Text>
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.webNote}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.webNoteText}>
              {language === 'ru'
                ? 'Магнитометр работает только на мобильном устройстве'
                : language === 'ar'
                ? 'المغناطيس يعمل فقط على الجهاز المحمول'
                : 'Live compass works on mobile device only'}
            </Text>
          </View>
        )}
      </View>
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
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  statusBadgeAligned: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.success,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  statusTextAligned: {
    color: colors.success,
  },
  compassWrapper: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  compassOuter: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  cardinalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 10,
  },
  cardinalText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  cardinalNorth: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 13,
  },
  tick: {
    position: 'absolute',
    top: 2,
    left: COMPASS_SIZE / 2 - 0.5,
    width: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 0.5,
  },
  majorTick: {
    width: 2,
    height: 14,
    backgroundColor: colors.textSecondary,
    left: COMPASS_SIZE / 2 - 1,
  },
  needleContainer: {
    position: 'absolute',
    width: 60,
    height: COMPASS_SIZE - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaAtTop: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  kaabaBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  kaabaEmoji: {
    fontSize: 22,
  },
  needleUp: {
    position: 'absolute',
    top: 42,
    width: 3,
    height: COMPASS_SIZE / 2 - 50,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  needleCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  needleDown: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: COMPASS_SIZE / 2 - 70,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
    zIndex: 10,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  instructionText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  webNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  webNoteText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
  },
});
