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

const { width } = Dimensions.get('window');

export default function QiblaCompass() {
  const { language } = useLanguageStore();
  const t = translations[language].qibla;
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [qiblaDir, setQiblaDir] = useState(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const coordinates = new Coordinates(loc.coords.latitude, loc.coords.longitude);
      const direction = Qibla(coordinates);
      setQiblaDir(direction);

      if (Platform.OS !== 'web') {
        Magnetometer.setUpdateInterval(100);
        const sub = Magnetometer.addListener((data) => {
          // Calculate heading from magnetometer data
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          
          // Smooth the rotation
          rotation.value = withSpring(angle - direction);
        });
        setSubscription(sub);
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }]
  }));

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.compassWrapper}>
          <View style={styles.compassRing}>
            {[0, 90, 180, 270].map((deg) => (
              <View key={deg} style={[styles.directionContainer, { transform: [{ rotate: `${deg}deg` }] }]}>
                <Text style={styles.directionText}>
                  {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
                </Text>
              </View>
            ))}
          </View>
          
          <Animated.View style={[styles.needleContainer, animatedStyle]}>
            <Ionicons name="navigate" size={120} color={colors.primary} />
            <View style={styles.kaabaIcon}>
              <Ionicons name="cube" size={40} color={colors.accent} />
            </View>
          </Animated.View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.angleValue}>{Math.round(qiblaDir)}°</Text>
          <Text style={styles.infoLabel}>
            {t.angleLabel}
          </Text>
        </View>

        <View style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.instructionText}>
            {t.instruction}
          </Text>
        </View>
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
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  compassWrapper: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...shadows.md,
  },
  directionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  directionText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  needleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  kaabaIcon: {
    position: 'absolute',
    top: -10,
  },
  infoBox: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  angleValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 64,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
    ...shadows.sm,
  },
  instructionText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
  },
});
