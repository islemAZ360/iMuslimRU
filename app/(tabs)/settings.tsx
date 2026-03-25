import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Container, Input } from '@/components/ui';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/design';
import { useLanguageStore } from '@/hooks/useLanguage';
import { translations, Language } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { blink } from '@/lib/blink';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League', nameRu: 'Мировая Лига' },
  { id: 'Egyptian',          name: 'Egyptian',            nameRu: 'Египетский'  },
  { id: 'Karachi',           name: 'Karachi',             nameRu: 'Карачи'      },
  { id: 'UmmAlQura',         name: 'Umm al-Qura',         nameRu: 'Умм аль-Кура'},
  { id: 'Dubai',             name: 'Dubai',               nameRu: 'Дубай'       },
  { id: 'Qatar',             name: 'Qatar',               nameRu: 'Катар'       },
  { id: 'Kuwait',            name: 'Kuwait',              nameRu: 'Кувейт'      },
  { id: 'Turkey',            name: 'Turkey',              nameRu: 'Турция'      },
  { id: 'Tehran',            name: 'Tehran',              nameRu: 'Тегеран'     },
];

const APP_VERSION = '1.0.0';

export default function Settings() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, isLoading, updateProfile } = useProfile();
  const t = translations[language].settings;
  const router = useRouter();

  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const unsub = blink.auth.onAuthStateChanged((state: any) => {
      setAuthUser(state.user);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile.mutateAsync(localProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch { /* handled silently */ } finally {
      setIsSaving(false);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync({
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo.length > 0) {
        const city = geo[0].city || geo[0].region || 'Unknown';
        setLocalProfile(prev => ({ ...prev, city }));
      }
    } finally {
      setLocationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'Русский',  flag: '🇷🇺' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <Container style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stunning Premium Header ──────────────────────────────────── */}
        <Animated.View entering={FadeIn.delay(0)}>
          <LinearGradient
            colors={['#022C22', '#064E3B', '#0D2137']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            {/* Geometric pattern overlay */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {[0,1,2,3,4,5].map(i => (
                <View
                  key={i}
                  style={[
                    styles.headerPatternDot,
                    {
                      left: i * 70 - 20,
                      top: i % 2 === 0 ? -10 : 30,
                      opacity: 0.07 + (i % 3) * 0.02,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.headerIconRing}>
              <Ionicons name="settings" size={30} color={colors.goldPrimary} />
            </View>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.appName}</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Auth Section ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(60)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {language === 'ar' ? 'الحساب' : language === 'ru' ? 'Аккаунт' : 'Account'}
            </Text>
            <View style={styles.card}>
              {authUser ? (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIconBg, { backgroundColor: 'rgba(6,95,70,0.2)' }]}>
                      <Ionicons name="person-circle" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.settingLabel}>
                        {authUser.displayName || authUser.email || 'User'}
                      </Text>
                      {authUser.email && authUser.displayName && (
                        <Text style={[styles.settingLabel, { fontSize: 11, color: colors.textTertiary }]}>
                          {authUser.email}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Pressable
                    onPress={async () => { await blink.auth.signOut(); setAuthUser(null); }}
                    style={styles.signOutBtn}
                  >
                    <Text style={styles.signOutText}>
                      {language === 'ar' ? 'خروج' : language === 'ru' ? 'Выйти' : 'Sign Out'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={[styles.linkRow, styles.settingRowLast]} onPress={() => router.push('/auth')}>
                  <LinearGradient colors={['#065F46', '#022C22']} style={styles.settingIconBg}>
                    <Ionicons name="log-in-outline" size={18} color={colors.gold} />
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.linkText}>
                      {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : language === 'ru' ? 'Войти / Зарегистрироваться' : 'Sign In / Sign Up'}
                    </Text>
                    <Text style={styles.linkSubtext}>
                      {'Google · GitHub · Email'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ── Language ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(80)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.language}</Text>
            <View style={styles.languageContainer}>
              {languages.map(lang => (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    setLocalProfile(prev => ({ ...prev, language: lang.code }));
                    setLanguage(lang.code);
                    // Immediately persist language to DB so it survives app restart
                    // without requiring the user to tap Save.
                    if (profile?.id) {
                      updateProfile.mutate({ language: lang.code });
                    }
                  }}
                  style={[
                    styles.languageButton,
                    localProfile.language === lang.code && styles.languageButtonActive,
                  ]}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageButtonText,
                      localProfile.language === lang.code && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── City / Location ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(120)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.city}</Text>
            <View style={styles.cityInputContainer}>
              <Input
                value={localProfile.city || ''}
                onChangeText={city => setLocalProfile(prev => ({ ...prev, city }))}
                placeholder="Moscow, Russia"
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
              <Pressable
                onPress={getCurrentLocation}
                disabled={locationLoading}
                style={styles.gpsButton}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="locate" size={22} color={colors.white} />
                )}
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* ── Calculation Method ────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(160)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.calculation}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.methodRow}>
                {CALCULATION_METHODS.map(method => (
                  <Pressable
                    key={method.id}
                    onPress={() =>
                      setLocalProfile(prev => ({ ...prev, calculationMethod: method.id }))
                    }
                    style={[
                      styles.methodButton,
                      localProfile.calculationMethod === method.id && styles.methodButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodButtonText,
                        localProfile.calculationMethod === method.id &&
                          styles.methodButtonTextActive,
                      ]}
                    >
                      {language === 'ru' ? method.nameRu : method.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t.notifications}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIconBg, { backgroundColor: 'rgba(5,150,105,0.15)' }]}>
                    <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{t.prayerAlerts}</Text>
                </View>
                <Switch
                  value={localProfile.prayerAlerts === 1}
                  onValueChange={val =>
                    setLocalProfile(prev => ({ ...prev, prayerAlerts: val ? 1 : 0 }))
                  }
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={localProfile.prayerAlerts === 1 ? colors.primary : colors.white}
                />
              </View>
              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIconBg, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                    <Ionicons name="book-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.settingLabel}>{t.adhkarReminders}</Text>
                </View>
                <Switch
                  value={localProfile.adhkarReminders === 1}
                  onValueChange={val =>
                    setLocalProfile(prev => ({ ...prev, adhkarReminders: val ? 1 : 0 }))
                  }
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={
                    localProfile.adhkarReminders === 1 ? colors.primary : colors.white
                  }
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── AI Settings ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(220)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {(t as any).aiSettings || 'AI Settings'}
            </Text>
            <View style={styles.card}>
              <Pressable style={[styles.linkRow, styles.settingRowLast]} onPress={() => router.push('/ai-settings')}>
                <LinearGradient
                  colors={['#1E3A5F', '#2563EB']}
                  style={styles.aiIconBg}
                >
                  <Ionicons name="hardware-chip" size={18} color={colors.white} />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.linkText}>
                    {(t as any).aiSettings || 'AI Configuration'}
                  </Text>
                  <Text style={styles.linkSubtext}>
                    {(t as any).aiNotConfigured || 'Configure AI for Halal Scanner'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* ── Quick Links ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(240)}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {language === 'ru' ? 'Разделы' : language === 'ar' ? 'الأقسام' : 'Sections'}
            </Text>
            <View style={styles.card}>
              <Pressable style={styles.linkRow} onPress={() => router.push('/qibla')}>
                <View style={[styles.settingIconBg, { backgroundColor: 'rgba(8,145,178,0.15)' }]}>
                  <Ionicons name="compass-outline" size={18} color={colors.info} />
                </View>
                <Text style={[styles.linkText, { marginLeft: spacing.sm }]}>
                  {translations[language].qibla.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
              <Pressable
                style={[styles.linkRow, styles.settingRowLast]}
                onPress={() => router.push('/(tabs)/adhkar')}
              >
                <View style={[styles.settingIconBg, { backgroundColor: 'rgba(5,150,105,0.15)' }]}>
                  <Ionicons name="book-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.linkText, { marginLeft: spacing.sm }]}>
                  {translations[language].adhkar.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* ── Save Button ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(280)}>
          <Pressable
            style={[styles.saveButton, saveSuccess && styles.saveButtonSuccess]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name={saveSuccess ? 'checkmark-circle' : 'save-outline'}
                  size={22}
                  color={colors.white}
                />
                <Text style={styles.saveButtonText}>
                  {isSaving ? t.saving : saveSuccess ? t.success : t.save}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* ── About ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(320)}>
          <View style={styles.aboutCard}>
            {/* Small crescent ornament */}
            <Ionicons name="moon" size={28} color={colors.goldPrimary} style={{ marginBottom: 6 }} />
            <Text style={styles.aboutTitle}>{t.about}</Text>
            <Text style={styles.aboutAppName}>{t.appName}</Text>
            <Text style={styles.aboutVersion}>{t.version} {APP_VERSION}</Text>
            <Text style={styles.aboutDev}>{t.developer}</Text>
          </View>
        </Animated.View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </Container>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingBottom: spacing.xxxxl },

  // ── Header ──────────────────────────────────────────────────────────────
  headerCard: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  headerPatternDot: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  headerIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(201,168,76,0.8)',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Section ──────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  // ── Card shell ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    overflow: 'hidden',
  },

  // ── Language ──────────────────────────────────────────────────────────────
  languageContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    ...shadows.sm,
  },
  languageButtonActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderColor: '#C9A84C',
  },
  languageFlag: { fontSize: 18 },
  languageButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  languageButtonTextActive: { color: '#C9A84C', fontWeight: '700' },

  // ── City ──────────────────────────────────────────────────────────────────
  cityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gpsButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  // ── Method ────────────────────────────────────────────────────────────────
  methodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  methodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    ...shadows.sm,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },

  // ── Setting rows ──────────────────────────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },

  // ── AI Icon ───────────────────────────────────────────────────────────────
  aiIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Link rows ──────────────────────────────────────────────────────────────
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  linkSubtext: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // ── Save button ────────────────────────────────────────────────────────────
  saveButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  saveButtonSuccess: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },

  // ── Auth ─────────────────────────────────────────────────────────────────
  signOutBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  signOutText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
  },

  // ── About card ─────────────────────────────────────────────────────────────
  aboutCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  aboutAppName: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  aboutVersion: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  aboutDev: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
