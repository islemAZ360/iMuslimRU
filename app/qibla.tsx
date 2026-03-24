import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Pressable, StatusBar } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width - 48, 320);

// Low-pass filter alpha (0 = very smooth/slow, 1 = instant/raw)
const ALPHA = 0.2;

export default function QiblaCompass() {
  const { language } = useLanguageStore();
  const t = translations[language].qibla;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const subscriptionRef = useRef<any>(null);
  const filteredXRef = useRef(0);
  const filteredYRef = useRef(0);

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
        Magnetometer.setUpdateInterval(80);
        subscriptionRef.current = Magnetometer.addListener((data) => {
          // Low-pass filter for smooth readings
          filteredXRef.current = ALPHA * data.x + (1 - ALPHA) * filteredXRef.current;
          filteredYRef.current = ALPHA * data.y + (1 - ALPHA) * filteredYRef.current;

          let angle = Math.atan2(filteredYRef.current, filteredXRef.current) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(Math.round(angle));

          const qiblaRotation = direction - angle;
          rotation.value = withSpring(qiblaRotation, { damping: 18, stiffness: 70, mass: 0.8 });

          // Aligned within ±5 degrees
          const normalised = ((qiblaRotation % 360) + 360) % 360;
          setIsAligned(normalised < 5 || normalised > 355);
        });
      }
    })();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const CARDINAL_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const CARDINAL_DEGS = [0, 45, 90, 135, 180, 225, 270, 315];

  const DEGREE_TICKS = Array.from({ length: 72 }, (_, i) => i); // every 5°

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />

      {/* Header */}
      <LinearGradient
        colors={['#022C22', '#064E3B']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#E8D48B" />
        </Pressable>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>

        {/* Status badge */}
        <Animated.View style={[styles.statusBadge, isAligned && styles.statusBadgeAligned]}>
          <Ionicons
            name={isAligned ? 'checkmark-circle' : 'compass-outline'}
            size={16}
            color={isAligned ? '#059669' : '#C9A84C'}
          />
          <Text style={[styles.statusText, isAligned && styles.statusTextAligned]}>
            {locationStatus === 'loading'
              ? t.calculating
              : isAligned
              ? (language === 'ru' ? 'Направление верное! 🕋' : language === 'ar' ? 'الاتجاه صحيح! 🕋' : 'Aligned with Qibla! 🕋')
              : t.pointToKaaba}
          </Text>
        </Animated.View>

        {/* Compass wrapper */}
        <View style={styles.compassWrapper}>
          {/* Outer decorative ring */}
          <View style={styles.compassOuterRing} />

          {/* Main compass face */}
          <View style={styles.compassFace}>
            {/* Degree ticks */}
            {DEGREE_TICKS.map((i) => (
              <View
                key={i}
                style={[
                  styles.tick,
                  { transform: [{ rotate: `${i * 5}deg` }] },
                  i % 18 === 0 && styles.majorTick,   // cardinal (90°)
                  i % 9 === 0 && i % 18 !== 0 && styles.mediumTick, // intercardinal (45°)
                ]}
              />
            ))}

            {/* Cardinal direction labels */}
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

            {/* Animated Qibla needle */}
            <Animated.View style={[styles.needleContainer, compassStyle]}>
              {/* Kaaba indicator at top of needle */}
              <View style={styles.kaabaTop}>
                <LinearGradient
                  colors={['#C9A84C', '#A07830']}
                  style={styles.kaabaBg}
                >
                  <Text style={styles.kaabaEmoji}>🕋</Text>
                </LinearGradient>
              </View>

              {/* Needle up */}
              <LinearGradient
                colors={['#C9A84C', '#E8D48B']}
                style={styles.needleUp}
              />

              {/* Center circle */}
              <View style={styles.needleCenter} />

              {/* Needle down (opposite) */}
              <View style={styles.needleDown} />
            </Animated.View>

            {/* Center hub */}
            <View style={styles.centerHub}>
              <View style={styles.centerHubInner} />
            </View>
          </View>

          {/* Alignment glow ring when aligned */}
          {isAligned && (
            <View style={styles.alignedRing} />
          )}
        </View>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="navigate-outline" size={20} color="#C9A84C" />
            <Text style={styles.infoValue}>{Math.round(qiblaDir)}°</Text>
            <Text style={styles.infoLabel}>{t.angleLabel}</Text>
          </View>
          {Platform.OS !== 'web' && (
            <View style={styles.infoCard}>
              <Ionicons name="compass-outline" size={20} color="#C9A84C" />
              <Text style={styles.infoValue}>{heading}°</Text>
              <Text style={styles.infoLabel}>
                {language === 'ru' ? 'Азимут' : language === 'ar' ? 'الاتجاه' : 'Heading'}
              </Text>
            </View>
          )}
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={20} color="#C9A84C" />
            <Text style={styles.infoValue}>
              {locationStatus === 'loading' ? '—' : locationStatus === 'error' ? '✕' : '✓'}
            </Text>
            <Text style={styles.infoLabel}>
              {language === 'ru' ? 'Локация' : language === 'ar' ? 'الموقع' : 'Location'}
            </Text>
          </View>
        </View>

        {/* Instruction card */}
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={18} color="#C9A84C" />
          <Text style={styles.instructionText}>{t.instruction}</Text>
        </View>

        {/* Web note */}
        {Platform.OS === 'web' && (
          <View style={styles.webNote}>
            <Ionicons name="phone-portrait-outline" size={16} color="#B8A98A" />
            <Text style={styles.webNoteText}>
              {language === 'ru'
                ? 'Живой компас работает только на мобильном устройстве'
                : language === 'ar'
                ? 'البوصلة الحية تعمل فقط على الجهاز المحمول'
                : 'Live compass works on mobile device only'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    ...typography.h3,
    color: '#E8D48B',
    fontWeight: '700',
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // ── Status badge ──────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(201,168,76,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  statusBadgeAligned: {
    backgroundColor: 'rgba(5,150,105,0.15)',
    borderColor: 'rgba(5,150,105,0.4)',
  },
  statusText: {
    ...typography.captionBold,
    color: '#C9A84C',
  },
  statusTextAligned: {
    color: '#059669',
  },

  // ── Compass ───────────────────────────────────────────────────────────────
  compassWrapper: {
    width: COMPASS_SIZE + 24,
    height: COMPASS_SIZE + 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  compassOuterRing: {
    position: 'absolute',
    width: COMPASS_SIZE + 24,
    height: COMPASS_SIZE + 24,
    borderRadius: (COMPASS_SIZE + 24) / 2,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    backgroundColor: 'transparent',
  },
  compassFace: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  alignedRing: {
    position: 'absolute',
    width: COMPASS_SIZE + 12,
    height: COMPASS_SIZE + 12,
    borderRadius: (COMPASS_SIZE + 12) / 2,
    borderWidth: 2,
    borderColor: 'rgba(5,150,105,0.6)',
  },

  // Ticks
  tick: {
    position: 'absolute',
    top: 4,
    left: COMPASS_SIZE / 2 - 0.5,
    width: 1,
    height: 6,
    backgroundColor: 'rgba(201,168,76,0.2)',
    transformOrigin: `0.5px ${COMPASS_SIZE / 2 - 4}px`,
  },
  mediumTick: {
    width: 1.5,
    height: 10,
    backgroundColor: 'rgba(201,168,76,0.35)',
  },
  majorTick: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(201,168,76,0.6)',
    left: COMPASS_SIZE / 2 - 1,
  },

  // Cardinals
  cardinalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 22,
  },
  cardinalText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(232,212,139,0.6)',
    letterSpacing: 0.5,
  },
  cardinalNorth: {
    color: '#C9A84C',
    fontSize: 14,
    fontWeight: '800',
  },

  // Needle
  needleContainer: {
    position: 'absolute',
    width: 50,
    height: COMPASS_SIZE - 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaTop: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  kaabaBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  kaabaEmoji: {
    fontSize: 20,
  },
  needleUp: {
    position: 'absolute',
    top: 40,
    width: 3,
    height: COMPASS_SIZE / 2 - 56,
    borderRadius: 2,
  },
  needleCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C9A84C',
  },
  needleDown: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: COMPASS_SIZE / 2 - 70,
    backgroundColor: 'rgba(201,168,76,0.25)',
    borderRadius: 1,
  },
  centerHub: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0A0A0A',
    borderWidth: 3,
    borderColor: '#C9A84C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerHubInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9A84C',
  },

  // ── Info cards ─────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#111827',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
  },
  infoValue: {
    ...typography.h3,
    color: '#C9A84C',
    fontWeight: '800',
  },
  infoLabel: {
    ...typography.tiny,
    color: '#B8A98A',
    textAlign: 'center',
  },

  // ── Instruction ────────────────────────────────────────────────────────────
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#111827',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    width: '100%',
    marginBottom: spacing.md,
  },
  instructionText: {
    flex: 1,
    ...typography.caption,
    color: '#B8A98A',
    lineHeight: 20,
  },
  webNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  webNoteText: {
    flex: 1,
    ...typography.caption,
    color: '#6B7280',
  },
});
